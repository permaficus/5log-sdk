/**
 *  5Log API Config Init
 *  
 *  by: permaficus<https://github.com/permaficus>
 */

import HttpClient from "./httpClient"
import type { 
    ErrorPayload, 
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
     *   errorDescription: 'error-message'
     * }
     */
    write (error: ErrorPayload, verbose?: boolean): void {

        let transport: FilogInitObject[] = this.args.filter((field: FilogInitObject) => field.logType === error.logLevel)
        if (transport.length === 0) {
            transport = this.args.filter((field: FilogInitObject) => field.logType === 'ANY')
        }

        // if error.errorDescrption instanceof Error then start parsing the error stack
        let rawObjectStack: Array<stp.StackFrame> = [];
        let _errorDescription: string = '';
        if (error.errorDescription instanceof Error) {
            // parsing the error stack
            rawObjectStack = stp.parse(error.errorDescription.stack)
            // combining error
            _errorDescription = `${error.errorDescription.name}: ${error.errorDescription.message}\n`
            _errorDescription = _errorDescription + `\xa0\xa0\xa0[${rawObjectStack[0].methodName}] ${rawObjectStack[0].file}\n`
            _errorDescription = _errorDescription + `\xa0\xa0\xa0[${rawObjectStack[1].methodName}] ${rawObjectStack[1].file}:${rawObjectStack[1].lineNumber}:${rawObjectStack[1].column}`
            // update errorDescription
            error.errorDescription = _errorDescription
        }

        const connector = new HttpClient(transport[0].client_id, transport[0].url);
        connector.send(error)
        if (verbose) console.log(chalk.redBright(`\n${_errorDescription}\n`))
    }
}

export { filog } 