import express, { Router } from 'express';
import { filog } from '5log-sdk';
import appPkg from './package.json' with { type: 'json' }
import Crypto from 'crypto'

const logger = new filog(
    {
        source: {
            app_name: appPkg.name,
            app_version: appPkg.version
        },
        environment: 'example',
        transports: [
            { 
                auth: {
                    type: 'ApKey',
                    name: 'x-logger-auth',
                    value: 'fg_klasd82308hja@ASDf28ndjnd'
                }, 
                url: 'http://logs.devops.local/api/v1/logs', 
                logType: 'ANY' 
            }
        ]
    }
)
// handle uncaught exception // unhandled rejection
logger.errorListener()

const app = new express();
const router = Router();
// init
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(router)
// errhandler middleware
app.use((err, req, res, next) => {
    logger.write({
        logLevel: 'DEBUG',
        errorDescription: err,
        eventCode: `test-${Crypto.randomUUID()}`,
        logTicket: Crypto.randomUUID()
    }, { verbose: 'true', originalError: err });
    res.status(500).json({ error: 'Internal Server Error' });
});
app.listen(3007, () => {
    console.log(`\nApp running on port: 4020\n`)
})

router.get('/tested', (req, res, next) => {
    try {
        throw new Error('Generated Error')
    } catch (error) {
        next(error)
    }
})

