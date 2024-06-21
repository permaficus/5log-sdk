/**
 *  5Log API Config Init
 *  
 *  by: permaficus<https://github.com/permaficus>
 */

import HttpClient from "./httpClient"
import type { 
    AdditionalWrapper,
    CustomErrorPayload,
    ErrorPayload, 
    EventCode, 
    FilogInitArguments, 
    FilogInitObject, 
    GraphQlQuery, 
    LogLevels,
    LoggingOptions,
    PublisherOptions,
    WriteOptions
} from "./types"
import * as stp from "stacktrace-parser"
import chalk from "chalk"
import Crypto from "crypto"
import { publishLog } from "./publisher"

interface filog {
    debug: (error: Error, options?: LoggingOptions) => void
    error: (error: Error, options?: LoggingOptions) => void
    info: (error: Error, options?: LoggingOptions) => void
    warning: (error: Error, options?: LoggingOptions) => void
}

class filog {
    private args: FilogInitArguments
    private wrappedIn: string
    private additionalWrapper: object
    private publisherOpts: PublisherOptions
    private graphQuery: GraphQlQuery
    private gqlVariableWrapper: string
    /**
     * Create a 5log client application. The filog() function is a top-level function exported from 5log module
     *
     * For more information visit: https://github.com/permaficus/5log-sdk#readme
     */
   constructor(args: FilogInitArguments) {
        this.args = args
        this.wrappedIn = ''
        this.additionalWrapper = {}
        this.publisherOpts
        this.graphQuery = { query: null }
        this.gqlVariableWrapper = null
        this._init()
    }
    /**
     * Handle uncaught exception, unhandled rejection and other
     * error that not catch by the try/catch method
     * 
     * #### Usage:
     * 
     * ```
     * import { filog } from '5log-sdk';
     * const logger = new filog({
     *    source: {
     *       app_name: 'your-app-name',
     *       app_verson: '1.0.0'
     *    },
     *    environment: 'development',
     *    transports: [
     *      { 
     *          client_id: 'your-client-id', 
     *          url: 'https://logs.devops.io/api/v1/logs',
     *          logType: 'ANY'
     *      }
     *    ]
     * });
     * 
     * logger.errorListener()
     * ```
     * For more documentation visit: https://github.com/permaficus/5log-sdk#readme
     */
    errorListener (): void {
        process.on('uncaughtException', (error: Error) => {
            this.error(error, { eventCode: 'uncaughtException', printOut: true })
        });
        process.on('unhandledRejection', (error: Error) => {
            this.error(error, { eventCode: 'unhandledRejection', printOut: true })
        })
    }
    /**
     * If you are using a message broker like RabbitMQ, you can utilize this function to determine the name of your error payload wrapper.
     * 
     * #### Example
     * 
     * ```javascript
     * filog.setMessageWrapper('MyPayloads');
     * ```
     * 
     * this will tell the filog to wrapped your custom payload into :
     * 
     * ```json
     * {
     *   "MyPayloads": {
     *      "key1": "custom-value-1",
     *      "key2": "custom-value-2"
     *   }
     * }
     * ```
     * 
     * If you don't specify a wrapper name, filog will use the default wrapper name, which is `payload`.
     */
    setMessageWrapper (name: string): void {
        this.wrappedIn = name
    }
    /**
     * Adding additional message properties or wrappers to your message broker: If you have extra requirements 
     * such as 'command' or 'messageOrigin', you can add them using this method.
     *  
     * #### Example
     * 
     * ```javascript
     * logger.addMessageProperties({
     *    task: 'create',
     *    messageOrigin: 'any string or object',
     *    assignTo: 'devTeam or QA'
     * })
     * ```
     */
    addMessageProperties (props: AdditionalWrapper): void {
        this.additionalWrapper = { ...props }
    }
    /**
     * When using rabbitmq as your message broker, filog will set a default value on options like exchange type and queue configs.
     * here some default value for publisher options
     * - Exchange Type: `direct`
     * - Queue Arguments: 
     *   - x-queue-type = `classic`
     *   - x-dead-letter-exchange = `_your_exchange_name_`
     *   - x-dead-routing-key = `empty`
     * 
     * You can override theese settings to meet your requirement
     */
    setPublisherOptions (options: PublisherOptions): void {
        this.publisherOpts = { ...options }
    }
    /**
     * A method to set GraphQL query string for mutation. Accept two arguments `query` and `variableWrapper`
     * 
     * #### Example:
     * 
     * ```javascript
     * const queryString = `
     *   mutation ($payload: payload) {
     *      logging(payload: $payload) {
     *          id
     *      }
     *   }`;
     * 
     * // invoking the method
     * logger.setGraphQLQuery(queryString, 'payload');
     * ```
     * For more documentation visit: https://github.com/permaficus/5log-sdk#readme
     */
    setGraphQLQuery (query: string, variableWrapper?: string): void {
        this.graphQuery = { 
            query
        }
        if (variableWrapper) this.gqlVariableWrapper = variableWrapper
    }
    /**
     * PRIVATE
     * 
     * this method is used at constructor so everytime we call new filog()
     * the extra props will show on intellisense
     */
    private _init (): void {
        ['debug', 'error', 'info', 'warning'].forEach((methods: string) => {
            this._methods(methods)
        })
    }
    /**
     * PRIVATE 
     *
     * dynamically add methods to class for DRY purpose.
     * will add [debug, error, info, warning] into this class
     */
    private _methods (name: string | undefined): void {
        (this as any)[name] = (error: Error, options?: LoggingOptions) => {
            this._write({
                logLevel: name.toUpperCase() as LogLevels,
                error: error,
                eventCode: options?.eventCode || error.name,
                printOut: options?.printOut,
                payload: options?.payload
            })
        }
    }
    /**
     * private write
     */
    private _write ({ logLevel, error, eventCode, printOut, payload }: 
        { 
            logLevel: LogLevels
            error: Error, 
            eventCode?: EventCode,
            printOut?: boolean,
            payload?: CustomErrorPayload
        }
    ) {
        if (!payload || Object.entries(payload).length === 0) {
            payload = {
                logTicket: Crypto.randomUUID(),
                eventCode,
                environment: this.args.environment,
                source: this.args.source
            }
        }
        this.write({
            logLevel,
            errorDescription: error,
            ...payload,
        }, {
            verbose: String(printOut) as WriteOptions["verbose"],
            originalError: error
        })
    }
    /**
     * Sending error payload to API service
     * 
     * #### Example Payload:
     * 
     * ```javascript
     * {
     *   logLevel: 'ERROR',
     *   logTicket: '{{uuid}}',
     *   eventCode: 'QR-8493',
     *   environment: 'Development',
     *   source: {
     *      app_name: 'project_name',
     *      app_version: 'package-version',
     *      package_name: 'project/package_name'
     *   },
     *   errorDescription: error
     * }
     * ```
     */
    write (error: ErrorPayload, { verbose, originalError }: WriteOptions): void {

        if (!this.args.transports) {
            console.error(`\n\xa0${chalk.redBright(`--> Cannot send any logs to server: Transport not specified <--\n\n`)}`, originalError)
            return;
        }

        let transport: FilogInitObject[] = this.args.transports.filter((field: FilogInitObject) => field.logType === error.logLevel)
        if (transport.length === 0) {
            transport = this.args.transports.filter((field: FilogInitObject) => field.logType.toUpperCase() === 'ANY')
        }

        if (!error.source && this.args.source) {
            Object.assign(error, { source: { ...this.args.source }})
        }
        if (!error.environment && this.args.environment) {
            Object.assign(error, { environment: this.args.environment })
        }

        // if errorDescription or originalError instanceof Error then start parsing the error stack
        let errorStack: Array<stp.StackFrame> = [];
        let _errorDescription: string = '';
        if (error.errorDescription instanceof Error || originalError instanceof Error) {
            // parsing the error stack
            errorStack = error.errorDescription ? stp.parse(error.errorDescription.stack) : stp.parse(originalError.stack);
            // We only need the information about where the error actually occurred
            errorStack = errorStack.filter((items) => /^file:/gi.test(items.file) === true || /\.[ts|js|jsx|tsx|esm|cjs]+$/gi.test(items.file) === true || items.file === `<anonymous>`);
            // combining error
            _errorDescription = `${error.errorDescription ? error.errorDescription.name : originalError.name}: ${error.errorDescription 
                ? error.errorDescription.message : originalError.message}\n`
            errorStack.forEach((info: any) => {
                _errorDescription = _errorDescription + `\xa0\xa0\xa0[${info.methodName}] ${info.file}${info.lineNumber ? `:${info.lineNumber}` : ''}${info.column ? `:${info.column}` : ''}\n`
            })
            // update errorDescription
            error.errorDescription = _errorDescription.trimEnd();
        } else {
            _errorDescription = error.errorDescription
        }

        if (verbose === 'true') console.log(chalk.redBright(`\n${_errorDescription}\n`));
        if (/^https?:\/\/[^\s\/$.?#].[^\s]*$/gi.test(transport[0].url) === true) {
            const connector = new HttpClient(transport[0].client_id, transport[0].url);
            if (this.graphQuery.query) {
                this.graphQuery.variables = {
                    ...this.gqlVariableWrapper ? { [this.gqlVariableWrapper]: { ...error } } : { ...error }
                }
                connector.send(this.graphQuery)
            } else {
                connector.send(error)
            }
        }
        if (/^amqps?:\/\/[^\s\/$.?#].[^\s]*$/gi.test(transport[0].url) === true) {
            publishLog(transport[0].url, transport[0].client_id, error, this.wrappedIn, this.additionalWrapper, this.publisherOpts)
        }
    }
}

export { filog } 