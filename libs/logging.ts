/**
 *  5Log API Config Init
 *  
 *  by: permaficus<https://github.com/permaficus>
 */

import HttpClient from "./httpClient"
import type { 
    ErrorPayload, 
    FilogInitArguments, 
    FilogInitObject, 
    LogLevels,
    WriteOptions
} from "./types"
import * as stp from "stacktrace-parser"
import chalk from "chalk"
import Crypto from "crypto"

interface filog {
    debug: (error: Error, eventCode?: string | null | undefined, printOut?: boolean) => void
    error: (error: Error, eventCode?: string | null | undefined, printOut?: boolean) => void
    info: (error: Error, eventCode?: string | null | undefined, printOut?: boolean) => void
    warning: (error: Error, eventCode?: string | null | undefined, printOut?: boolean) => void
}

class filog {
    private args: FilogInitArguments
    /**
     * Create a 5log client application. The filog() function is a top-level function exported from 5log module
     *
     * For more information visit: https://github.com/permaficus/5log-sdk#readme
     */
   constructor(args: FilogInitArguments) {
        this.args = args
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
            this.error(error, 'uncaughtException')
        });
        process.on('unhandledRejection', (error: Error) => {
            this.error(error, 'unhandledRejection')
        })
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
    private _methods (name: string): void {
        (this as any)[name] = (error: Error, eventCode?: string | null | undefined, printOut?: boolean) => {
            this._write({
                logLevel: name.toUpperCase() as LogLevels,
                error: error,
                eventCode: eventCode || error.name,
                printOut
            })
        }
    }
    /**
     * private write
     */
    private _write ({ logLevel, error, eventCode, printOut }: 
        { 
            logLevel: LogLevels
            error: Error, 
            eventCode?: string,
            printOut?: boolean
        }
    ) {
        this.write({
            logLevel,
            logTicket: Crypto.randomUUID(),
            environment: this.args.environment,
            source: this.args.source,
            eventCode,
            errorDescription: error,
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
        let rawObjectStack: Array<stp.StackFrame> = [];
        let _errorDescription: string = '';
        if (error.errorDescription instanceof Error || originalError instanceof Error) {
            // parsing the error stack
            rawObjectStack = error.errorDescription ? stp.parse(error.errorDescription.stack) : stp.parse(originalError.stack)
            // combining error
            _errorDescription = `${error.errorDescription ? error.errorDescription.name : originalError.name}: ${error.errorDescription 
                ? error.errorDescription.message : originalError.message}\n`
            _errorDescription = _errorDescription + `\xa0\xa0\xa0[${rawObjectStack[0].methodName}] ${rawObjectStack[0].file}\n`
            _errorDescription = _errorDescription + `\xa0\xa0\xa0[${rawObjectStack[1].methodName}] ${rawObjectStack[1].file}:${rawObjectStack[1].lineNumber}:${rawObjectStack[1].column}`
            // update errorDescription
            error.errorDescription = _errorDescription
        } else {
            _errorDescription = error.errorDescription
        }

        if (verbose === 'true') console.log(chalk.redBright(`\n${_errorDescription}\n`))
        const connector = new HttpClient(transport[0].client_id, transport[0].url);
        connector.send(error)
    }
}

export { filog } 