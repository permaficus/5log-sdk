import { ApiResponse, HttpClientData } from './types'
export default class FivlogError extends Error {
    statusCode?: number | null
    apiResponse?: ApiResponse
    httpClientData?: HttpClientData

    constructor(message: string, statusCode?: number | null, apiResponse?: ApiResponse, httppClientData?: HttpClientData) {
        super(message)
        this.statusCode = statusCode
        this.apiResponse = apiResponse
        this.httpClientData = httppClientData
        this.name = this.constructor.name

        Object.setPrototypeOf(this, FivlogError.prototype)
    }
}