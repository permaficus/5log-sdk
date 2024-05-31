/**
 * 
 * 
 */

import HttpClient from "./httpClient"
import type { ErrorPayload } from "./types"

class Logging {
    private client_id: string
    private url: string

   constructor(client_id: string, url: string) {
        this.client_id = client_id
        this.url = url
    }
    /**
     * ErrorPayload: object
     * 
     * @param error
     * @example
     * {
     *   logLevel: 'ERROR',
     *   logTicket: {{random_string}}
     *   
     * }
     * @returns 
     */
    write (error: ErrorPayload) {
        const connector = new HttpClient(this.client_id, this.url);
        return connector.send(error)
    }
}

export { Logging, ErrorPayload } 