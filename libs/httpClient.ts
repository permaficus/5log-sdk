import axios, { type AxiosInstance } from 'axios';
import FilogError from './error';
import * as pkgJson from '../package.json'

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

    send =  async (payload: object): Promise<void> => {
        const instance = this;
        await instance.httpClient({
            url: this.target,
            method: 'POST',
            headers: { ...this.defaultHeaders, client_id: this.client_id},
            data: payload
        }).catch((error: any) => {
            console.error(new FilogError(error.message, error.response.data.code, error.response.data, null));
            return;
        })
    };
}