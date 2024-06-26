import EventEmitter from 'events';
import ampqplib from 'amqplib'
import { BrokerExchangeInterface, QueueTypeInterface } from './types';

interface RabbitInstance {
    connect: (url?: string) => Promise<void>
    setClosingState: (value: boolean) => void
    initiateExchange: (options: BrokerExchangeInterface) => Promise<string>
    createQueue: (config: QueueTypeInterface) => Promise<any>
}
class RabbitInstance extends EventEmitter {
    connection: any
    attempt: number
    maxAttempt: number
    userClosedConnection: boolean
    private currentUrl: string
    private exchangeConfig: { name: string, queue: string, routingKey: string }

    constructor() {
        super()
        this.connection = null
        this.attempt = 0
        this.maxAttempt = 20
        this.userClosedConnection = false
        this.currentUrl = null
        this.exchangeConfig = { name: '', queue: '', routingKey: '' }
        this.onError = this.onError.bind(this)
        this.onClosed = this.onClosed.bind(this)
    }

    setClosingState = (value: boolean): void => {
        this.userClosedConnection = value
    }
    private setExchangeConfig (source: string) {
        const raw: string[] = source.split(':');
        this.exchangeConfig = {
            name: raw[0],
            queue: raw[1],
            routingKey: raw[2]
        }
    }
    public get getExchangeConfig (): { name: string, queue: string, routingKey: string } {
        return this.exchangeConfig
    }

    connect = async (url?: string): Promise<void> => {
        /**
         * example amqp uri
         * amqp(s)://username:password@host:5672/vhost?heartbeat=5&connection_timeout=10000#exchange:queue:routingkey
         */

        // split the uri
        const uri: string[] = url.split('#');
        url = uri[0];
        // set exchange config
        this.setExchangeConfig(uri[1]);

        try {
            const conn = await ampqplib.connect(url);
            const channel = await conn.createChannel();
            const EventListener = { conn, channel };
            conn.on('error', this.onError);
            conn.on('close', this.onClosed);
            this.emit('connected', EventListener);
            this.connection = conn;
            this.attempt = 0;
            this.currentUrl = url
        } catch (error: any) {
            if (error.code === 'ECONNREFUSED') {
                this.emit('ECONNREFUSED', error.message);
                if (this.attempt >= this.maxAttempt) {
                    return
                }
            }
            if ((/ACCESS_REFUSED/gi).test(error.message)) {
                this.emit('access_refused', error);
                return;
            }

            this.onError(error)
        }
    }
    initiateExchange = async (options: BrokerExchangeInterface): Promise<string> => {
        await options.channel.assertExchange(
            options.name,
            options.type,
            {
                durable: options.durable,
                autoDelete: options.autoDelete,
                internal: options.internal
            }
        );
        return options.name
    }
    createQueue = async (config: QueueTypeInterface): Promise<any> => {
        await config.channel.assertQueue(config.name, { ...config.options })
    }
    private reconnect = (): void => {
        this.attempt++;
        this.emit('reconnect', this.attempt);
        setTimeout((async () => await this.connect(this.currentUrl)), 5000)
    }
    private onError = (error: any): void => {
        this.connection = null;
        this.emit('error', error);
        if (error.code === 406) {
            process.exit(1)
        }
        if (error.message !== 'Connection closing') {
            this.reconnect()
        }
    }
    private onClosed = (): void => {
        this.connection = null;
        this.emit('close', this.connection);
        if (!this.userClosedConnection) {
            this.reconnect();
        }
    }
}

export { RabbitInstance }