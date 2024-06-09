export type ApiResponse = object | null | undefined
export type HttpClientData = object | null | undefined
export type EventCode = string | null | undefined
export type ErrorSourceProps = {
    app_name?: string
    app_version?: string
    package_name?: string
    hostname?: string
    ip_address?: string
    module_name?: string
}
export type LogLevels = 'ERROR' | 'WARNING' | 'DEBUG' | 'INFO'
export type CustomErrorPayload = {
    [key: string]: any
}
export type ErrorPayload = {
    logLevel: LogLevels
    logTicket?: string
    source?: object | ErrorSourceProps
    eventCode?: EventCode
    destination?: string
    environment?: string
    errorDescription?: string | any
} & CustomErrorPayload
export type FilogInitObject = {
    client_id: string
    url: string
    logType: 'ANY' | LogLevels
}
export type FilogTransportConfig = Array<FilogInitObject>
export type WriteOptions = {
    verbose?: 'true' | 'false' | undefined
    originalError?: Error | null
}
export type FilogInitArguments = {
    source?: object | ErrorSourceProps
    environment: string
    transports: FilogTransportConfig
}
export type LoggingOptions = {
    eventCode?: EventCode,
    printOut?: boolean,
    payload?: CustomErrorPayload
}