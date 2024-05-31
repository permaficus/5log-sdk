import axios, { type AxiosInstance } from 'axios';
import FivlogError from './error';

export default class HttpClient {
    private client_id: string
    private defaultHeaders: object
    private transport: AxiosInstance
    private target: string

    constructor(client_id: string, target: string) {
        this.client_id = client_id
        this.defaultHeaders = {
            'content-type': 'application/json',
            'accept': 'application/json',
            'user-agent': 'fivelog-client/0.0.1'
        }
        this.target = target
        this.transport = axios.create()
    }

    send =  async (payload: object): Promise<void> => {
        const instance = this;
        await instance.transport({
            url: this.target,
            method: 'POST',
            headers: { ...this.defaultHeaders, client_id: this.client_id},
            data: payload
        }).catch((error: any) => {
            throw new FivlogError(error.message, error.response.data.code, error.response.data, null)
        })
    };
}