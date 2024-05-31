export type ApiResponse = object | null | undefined
export type HttpClientData = object | null | undefined
export type ErrorSourceProps = {
    app_name?: string
    app_version?: string
    package_name?: string
    hostname?: string
    ip_address?: string
}
export type ErrorPayload = {
    logLevel: 'ERROR' | 'WARNING' | 'INFO'
    logTicket: string
    logDate: Date
    source: object | ErrorSourceProps
    eventCode: string
    destination?: string
    environment: string
    errorDescription: string
}