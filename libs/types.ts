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
} & BrokerExchangeInterface
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
export type FilogRmqInitObject = {
    exchange?: string
    routingKey?: string
    queue?: string
}
export interface BrokerExchangeInterface {
    channel: any
    name: string | undefined | null
    type: ExchangeType
    durable: boolean
    autoDelete?: boolean
    internal?: boolean
    arguments?: ExchangeArgument
}
export interface QueueTypeInterface {
    name: string | undefined | null
    channel: any,
    options?: {
        durable: boolean,
        arguments?: QueueArguments
    }
}
export type ExchangeType = 'direct' | 'fanout' | 'headers' | 'topics'
export type ExchangeArgument = {
    'alternate-exchange'?: string | string[] | null
}
export type QueueArguments = {
    'x-queue-type'?: 'classic' | 'quorum' | 'stream',
    'x-dead-letter-exchange'?: string | string[] | null,
    'x-dead-letter-routing-key'?: string | string[] | null
}
