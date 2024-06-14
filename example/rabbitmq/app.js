import { filog } from '5log-sdk';

// initiate new filog
const logger = new filog({
    environment: 'example',
    source: {
        app_name: 'rabbitmq',
        app_version: '1.0.0',
        module_name: 'index'
    },
    transports: [
        { client_id: 'rabbitmq-user', url: 'amqp://filog:filog@host:5672#my-exchange:my-queue:my-routekey', logType: 'ANY' }
    ]
})

// set message wrapper property name
logger.setMessageWrapper('MyErrorMessage');
/** 
 * By default, Filog has already set this up for you. However, 
 * you can override those settings to match your requirements.
 */
logger.setPublisherOptions({
    exchangeType: 'direct',
    queueArguments: {
        "x-queue-type": 'classic',
        "x-dead-letter-exchange": 'my-exchange', // same as your exchange name
    }
})

function trapMyError () {
    try {
        throw new Error(`Logging with RabbitMQ`)
    } catch (error) {
        logger.error(error, {
            // additional payload
            payload: {
                timestamp: Date.now(), // unix epoch time
                functionName: 'trapMyError'
            }
        })
    }
}