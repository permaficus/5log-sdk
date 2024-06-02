/**
 *  5Log API Config Init
 *  
 *  by: permaficus<https://github.com/permaficus>
 */

import HttpClient from "./httpClient"
import type { 
    ErrorPayload, 
    ExtraWriteArguments, 
    FilogInitObject, 
    FilogTransportConfig
} from "./types"
import * as stp from "stacktrace-parser"
import chalk from "chalk"

class filog {
    private args: FilogTransportConfig
    /**
     *
     * @param {array} args - Argument must be an array value
     */
   constructor(args: FilogTransportConfig) {
        this.args = args
    }
    /**
     * Send this error payload to API service
     * @param {ErrorPayload} error - See example
     * @param {Object} {object} - Properties: default = { verbose: false, originalError: error }
     * @example
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
     */
    write (error: ErrorPayload, { verbose, originalError }: ExtraWriteArguments): void {

        let transport: FilogInitObject[] = this.args.filter((field: FilogInitObject) => field.logType === error.logLevel)
        if (transport.length === 0) {
            transport = this.args.filter((field: FilogInitObject) => field.logType.toUpperCase() === 'ANY')
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
        }

        if (verbose === 'true') console.log(chalk.redBright(`\n${_errorDescription}\n`))
        const connector = new HttpClient(transport[0].client_id, transport[0].url);
        connector.send(error)
    }
}

export { filog } 