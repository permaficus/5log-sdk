import axios from 'axios';
import { filog } from '5log-sdk'
import Crypto from 'crypto'

const logger = new filog(
    {
        source: {
            app_name: 'axios-example',
            app_version: '1.0.0'
        },
        environment: 'example',
        transports: [
            { client_id: 'express-id', url: 'http://logs.devops.local/api/v1/logs', logType: 'ANY' }
        ]
    }
)
// add error listener
logger.errorListener()
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
        destination: err.config.url
    }, { verbose: 'true', originalError: err });
})