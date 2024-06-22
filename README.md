# 5Log Software Development Kit - Client

We 🫶 NodeJS

This is the official NodeJS SDK for 5log, a cloud based logging and bug tracking app


## Installation

#### 👉 Using NPM
```bash
# install locally (recommended)
npm i --save 5log-sdk
```

#### 👉 Usage
```javascript
// ES6
import { filog } from '5log-sdk'

// init
const log = new filog(
    {
        source: {
            app_name: 'your-app-name',
            app_version: '1.0.0'
        },
        environment: 'development',
        transports: [
            { 
                auth: { 
                    name: 'x-client-id', 
                    type: 'ApiKey', 
                    value: 'fg_jlad84djkadfnjc84=' 
                }, 
                url: 'https://logs.devops.io/api/v1/logs', 
                logType: 'ANY' 
            }
            // if you want to separate log into different api service you can add more options
            { 
                auth: { 
                    name: 'x-client-id', 
                    type: 'ApiKey', 
                    value: 'fg_379asdajsnd84hdaf=' 
                }, 
                url: 'https://error.devops.io/api/v1/logs', 
                logType: 'ERROR' 
            }
        ]
    }
)

// Test Scenario
function JsonParse (value) {
    try {
        return JSON.parse(value)
    } catch (error) {
        log.write({
            logLevel: 'ERROR',
            source: {
                app_name: '{{your-app-name}}',
                package_name: '{{your-package-name}}',
                app_version: '{{app-version}}',
            },
            errorDescription: error,
            environment: '{{your-environment}}',
            eventCode: 'ERR-2180'
        }, { 
            verbose: 'true', 
            originalError: error
        })
    }
}

JsonParse("{a;b}");
```

#### Other Method

```javascript
const testError = () => {
    try {
        throw new Error('Error raised')
    } catch (error) {
        // accept 2 argument ( error, eventCode )
        // you can use error.name as your eventCode or generate a custom eventCode
        log.error(error, { eventCode: error.name })
        // with custom code
        log.error(error, { eventCode: 'E-007' })
    }
}
```

#### Available Log Type

For now, we only provide logging for `error`, `warning`, `debug`, and `info` types and we may include custom log types in the future.

This logger accepts the following parameters:

| name      | value      | type    | description           |
|-----------|------------|---------|-----------------------|
| error     | Error      |         |                       |
| options   |     -      | Object  |
|           | eventCode  | String  | Default: error name like `SyntaxError`, `ReferenceError` or you can create your own custom eventCode |
|           | printOut   | Boolean | If you set `True`, the error message will show up in your console/terminal. Set `False` if you use the `throw new Error` method on catching errors. |
|           | payload    | Object  | If you have your own logger API, you can create a custom schema based on your API requirements. |

#### Example on using printOut

```javascript
function trapError () {
    try {
        // your code
    } catch (error) {
        log.error(error, { printOut: false })
        // let the CustomError print out the error message
        throw new CustomError(`This error is suck`)
    }
}
```

#### Example using custom schema on payload

Say your backend has extra requirements such as `logId`, `functionName`, and `timestamp`. Then, set the payload as shown in the example below.

```javascript
function trapError () {
    try {
        // your code
    } catch(error) {
        log.error(error, {
            payload: {
                // your API requirement
                logId: Crypto.uuid(),
                functionName: 'postIt',
                timestamp: Date.now()
            }
        })
    }
}
```
>[!NOTE]
>
> Log levels such as `ERROR`, `WARNING`, `DEBUG`, or `INFO` are automatically provided by filog, and filog will generate the `error details` for you

#### Handling Uncaught Exception & Unhandled Rejection

```javascript
// ES6
import { filog } from '5log-sdk'

// init
const log = new filog(
    {
        source: {
            app_name: 'your-app-name',
            app_version: '1.0.0'
        },
        environment: 'development',
        transports: [
            { auth: { name: 'x-client-id', type: 'ApiKey', value: 'fg_jlad84djkadfnjc84=' }, url: 'https://logs.devops.io/api/v1/logs', logType: 'ANY' }
            // if you want to separate log into different api service you can add more options
            { auth: { name: 'x-client-id', type: 'ApiKey', value: 'fg_379asdajsnd84hdaf=' }, url: 'https://error.devops.io/api/v1/logs', logType: 'ERROR' }
        ]
    }
)

// Start by listening for any errors that might occur.
log.errorListener()

// your code goes here
```

#### Filog Transport Method

Currently, Filog only supports the HTTP transport method and RabbitMQ as a message broker. In the future, it will also support the use of Apache Kafka.

Example of using RabbitMQ:

```javascript
import { filog } from '5log-sdk';

const logger = new filog({
    transports: [
        { 
            auth: { 
                name: 'x-client-id', 
                type: 'ApiKey', 
                value: 'fg_379asdajsnd84hdaf=' 
            }
            , url: "amqp://username:password@host:5672/vhost?heartbeat=5&connection_timout=1000#exchange-name:queue-name:routekey", 
            logType: "any"
        }
    ]
})

// set payload wrapper name if you like (optional)
logger.setMessageWrapper("MyErrorPayload");
// example if you have more requirement on message properties / object (optional)
logger.addMessageProperties({
    task: 'create',
    messageId: 'tx-9000',
})

// rest of your code
```

RabbitMQ service will see your payload as :

```yaml
{
    "MyErrorPayload": {
        // your payloads
    },
    // your additional wrapper
    "task": "create",
    "messageId": "tx-9000"
}
```

If you don't specify any, it will look like this :

```yaml
{
    "payload": {
        // your payloads
    },
    // your additional wrapper
    "task": "create",
    "messageId": "tx-9000"
}
```

>[!NOTE]
>
> To specify an exchange name, queue name, and routing key in the URL parameter, use a colon as a separator.

#### RabbitMQ Options

Filog uses the default options for RabbitMQ configuration, such as the exchange type, queue type or aguments. However, you can customize these settings based on your requirements.

| Parameter            | Value                                    | Default       |
|----------------------|------------------------------------------|---------------|
| Exchange Type        | `direct`, `fanout`, `headers`, `topics`  | `direct`      |
| Exchange Argument    | `alternate-exchange`                     | Not Set       |
| Queue Type           | `classic`, `quorum`, `stream`            | `classic`     |
| Queue Arguments      | `x-dead-letter-exchange`                 | exchange name |
|                      | `x-dead-letter-routing-key`              | Not Set       |
|                      | `x-single-active-consumer`               | Not Set       |
|                      | `x-expires`                              | Not Set       |
|                      | `x-message-ttl`                          | Not Set       |
|                      | `x-overflow` valid value: `drop-head`, `reject-publish` or `reject-publish-dlx`  | Not Set |
|                      | `x-max-length`                           | Not Set       |
|                      | `x-max-length-bytes`                     | Not Set       |
|                      | `x-queue-leader-locator`                 | Not Set       |

Example:

```javascript
import { filog } from '5log-sdk';

const logger = new filog({
    transports: [
        { 
            auth: { 
                name: 'x-client-id', 
                type: 'ApiKey', 
                value: 'fg_379asdajsnd84hdaf=' 
            }, 
            url: "amqp://username:password@host:5672/vhost?heartbeat=5&connection_timout=1000#exchange-name:queue-name:routekey", 
            logType: "any"
        }
    ]
})

logger.setPublisherOpts({
    exchangeType: 'fanout',
    exchangeArgument: { 'alternate-exchange': 'my-second-exchange' },
    queueArguments: {
        'x-queue-type': 'quorum',
        'x-dead-letter-exchange': 'my-exchange'
        // and so on
    }
})

// rest of your code
```

#### GraphQL

Below is an example of how to configure Filog to send logs to your GraphQL service.

```javascript
import { filog } from '5log-sdk';
// initiate new filog
const logger = new filog({
    transports: [
        {
            auth: { 
                name: 'x-client-id', 
                type: 'ApiKey', 
                value: 'fg_379asdajsnd84hdaf=' 
            },
            url: 'http(s)://<hostname>/gql',
            logtype: 'any'
        }
    ]
})

// Mutation Query. We wrapped our error payload with PAYLOAD
const withWrapper = `
    mutation ($payload: MutationInputType) {
        storingLogs(payload: $payload) {
            logLevel,
            errorDescription
        }
    }
`
// Mutation query without using any wrapper
const withoutWrapper = `
    mutation($logLevel: String!, $errorDescription: String!, $timeStamp: Date!) {
        storingLogs(logLevel: $logLevel, errorDescription: $errorDescription, timeStamp: $timeStamp) {
            logLevel,
            errorDescription
        }
    }
`
// setGraphQLQuery accept two arguments, query and variableWrapper
logger.setGraphQLQuery(withWrapper, 'payload')
// if you dont use any wrapper, just leave it out
logger.setGraphQLQuery(withourWrapper)

// test scenario
function trapMyError() {
    try {
        throw new Error(`This is a trap!`)
    } catch(error) {
        logger.error(error, {
            // set your graphQL variables
            payload: {
                timeStamp: Date.now()
                // you're only need specify one variable here 
                // because filog will compile it alongside logLevel 
                // and errorDescription as a default variable
            }
        })
    }
}
```

>[!NOTE]
>
> Filog will send default data / variable such as `logLevel`, `errorDescription`, `source` and `environment`. The last two variable will exist if you set it on filog init

#### In Project Example

Please refer to this [Example](https://github.com/permaficus/5log-sdk/tree/main/example) for more usage in real projects
