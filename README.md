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
            { client_id: '{your-client-id}', url: 'https://logs.devops.io/api/v1/logs', logType: 'ANY' }
            // if you want to separate log into different api service you can add more options
            { client_id: '{your-client-id}', url: 'https://error.devops.io/api/v1/logs', logType: 'ERROR' }
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

Say your backend has properties with requirements such as `logId`, `details`, and `timestamp`. Then, set the payload as shown in the example below.

```javascript
function trapError () {
    try {
        // your code
    } catch(error) {
        log.error(error, {
            payload: {
                // your API requirement
                logId: Crypto.uuid(),
                details: error,
                timestamp: Date.now()
            }
        })
    }
}
```
>[!NOTE]
>
> Log levels such as `ERROR`, `WARNING`, `DEBUG`, or `INFO` are automatically provided by filog.

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
            { client_id: '{your-client-id}', url: 'https://logs.devops.io/api/v1/logs', logType: 'ANY' }
            // if you want to separate log into different api service you can add more options
            { client_id: '{your-client-id}', url: 'https://error.devops.io/api/v1/logs', logType: 'ERROR' }
        ]
    }
)

// Start by listening for any errors that might occur.
log.errorListener()

// your code goes here
```

#### In Project Example

Please refer to this [Example](https://github.com/permaficus/5log-sdk/tree/main/example) for more usage in real projects
