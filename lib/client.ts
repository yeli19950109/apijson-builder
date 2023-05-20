import axios, { AxiosInstance } from 'axios';

export class GlobalBuildConfig {
    static http = axios.create();

    static setHttp(http: AxiosInstance) {
        this.http = http;
    }
}

