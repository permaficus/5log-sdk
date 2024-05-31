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
const log = new Logging({
    client_id: {{your-client-id}},
    url: {{api-url}}
})

// Test Scenario
function JsonParse (value) {
    try {
        return JSON.parse(value)
    } catch (error) {
        log.write({
            logLevel: 'ERROR',
            source: {
                app_name: {{your-app-name}},
                package_name: {{your-package-name}},
                app_version: {{app-version}},
            },
            errorDescription: error.message,
            environment: {{your-environment}},
            eventCode: 'ERR-2180'
        })
    }
}

JsonParse("{a;b}");
```


