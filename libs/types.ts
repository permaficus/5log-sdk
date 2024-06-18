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
    originalError?: Error | null | undefined
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
export type WrapperTypes = string | undefined
export type AdditionalWrapper = {
    task?: string
    [key: string]: any
}
export type ExchangeType = 'direct' | 'fanout' | 'headers' | 'topics'
export type ExchangeArgument = {
    'alternate-exchange'?: string | string[] | null
}
export type QueueTypes = 'classic' | 'quorum' | 'stream'
export type XOverFlowType = 'drop-head' | 'reject-publish' | 'reject-publish-dlx'
export type QueueArguments = {
    'x-queue-type'?: QueueTypes,
    'x-dead-letter-exchange'?: string | string[] | null,
    'x-dead-letter-routing-key'?: string | string[] | null
    'x-single-active-consumer'?: string | string[] | null
    'x-expires'?: number | null
    'x-message-ttl'?: number | null
    'x-overflow'?: XOverFlowType
    'x-max-length'?: number | null
    'x-max-length-bytes'?: number | null
    'x-queue-leader-locator'?: string | string[] | null
}
export interface PublisherOptions {
    exchangeType?: ExchangeType | undefined, 
    exchangeArgument?: ExchangeArgument | undefined, 
    queueArguments?: QueueArguments | undefined
}