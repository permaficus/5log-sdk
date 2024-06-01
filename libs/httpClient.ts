import axios, { type AxiosInstance } from 'axios';
import FilogError from './error';
import * as pkgJson from '../package.json'
import chalk from 'chalk'
import { ErrorPayload } from './types';

export default class HttpClient {
    private client_id: string
    private defaultHeaders: object
    private httpClient: AxiosInstance
    private target: string

    constructor(client_id: string, target: string) {
        this.client_id = client_id
        this.defaultHeaders = {
            'content-type': 'application/json',
            'accept': 'application/json',
            'user-agent': `filog-client/${pkgJson.version}`
        }
        this.target = target
        this.httpClient = axios.create()
    }

    send =  async (payload: ErrorPayload): Promise<void> => {
        const instance = this;
        await instance.httpClient({
            url: this.target,
            method: 'POST',
            headers: { ...this.defaultHeaders, client_id: this.client_id},
            data: payload
        }).catch((error: any) => {
            if (error.code === 'ECONNREFUSED') {
                console.log(chalk.redBright(`[5log-SDK] Error: Can not connect to ${error.config.url}`));
                return;
            }
            console.error(new FilogError(error.message, error.response.data.code, error.response.data));
            return;
        })
    };
}