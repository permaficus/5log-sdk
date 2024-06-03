import axios from 'axios';
import { filog } from '5log-sdk'
import Crypto from 'crypto'

const logger = new filog([
    { client_id: 'axios-test-id', url: 'http://localhost:3007/api/v1/logs', logType: 'ANY' }
])
// add error listener
logger.errorListener({
    app_name: 'axios-testing-sample',
    app_version: '1.0.0'
})
// initiate connection to target url
const client = axios.create();
client({
    url: 'https//logs.devops.local/bogus',
    method: 'GET',
    timeout: 2000
}).then((data) => {
    console.log(data)
}).catch((err) => {
    logger.write({
        logLevel: 'ERROR',
        errorDescription: err,
        eventCode: err.code,
        logTicket: Crypto.randomUUID(),
        environment: 'dev',
        destination: err.config.url,
        source: {
            app_name: 'axios-testing-sample',
            app_version: '1.0.0'
        }
    }, { verbose: 'true', originalError: err });
})