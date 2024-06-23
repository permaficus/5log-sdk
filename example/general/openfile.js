import { filog } from '5log-sdk';
import appPkg from './package.json' with { type: 'json' };
import { readFile } from 'fs/promises'

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
                    type: 'Cookie',
                    name: 'clientid',
                    value: 'fg_klasd82308hja@ASDf28ndjnd'
                }, 
                url: 'http://logs.devops.local/api/v1/logs', 
                logType: 'ANY' 
            }
        ]
    }
)
// caught the uncaught
logger.errorListener();
const openFile = async () => {
    try {
        const file = await readFile('./invoices.html', 'utf-8');
    } catch (error) {
        logger.debug(error)
    }
}

openFile();