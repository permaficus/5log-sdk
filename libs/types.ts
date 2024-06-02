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
    logLevel: 'ERROR' | 'WARNING' | 'DEBUG' | 'INFO'
    logTicket: string
    source: object | ErrorSourceProps
    eventCode: string
    destination?: string
    environment: string
    errorDescription: string | any
}
export type FilogInitObject = {
    client_id: string
    url: string
    logType: 'ANY' | 'ERROR' | 'WARNING' | 'DEBUG' | 'INFO'
}
export type FilogTransportConfig = Array<FilogInitObject>
export type ExtraWriteArguments = {
    verbose?: 'true' | 'false' | undefined
    originalError?: Error | null
}