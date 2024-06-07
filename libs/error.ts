import { ApiResponse, HttpClientData } from './types'
export default class FilogError extends Error {
    statusCode?: number | null
    apiResponse?: ApiResponse | null
    rawError?: Error | null

    constructor(
        message: string, 
        statusCode?: number | null, 
        apiResponse?: ApiResponse, 
        rawError?: Error | null
    ) {
        super(message)
        this.statusCode = statusCode
        this.apiResponse = apiResponse
        this.rawError = rawError
        this.name = this.constructor.name

        Object.setPrototypeOf(this, FilogError.prototype)
    }
}