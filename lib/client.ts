import axios, { AxiosInstance } from 'axios';

export class GlobalBuildConfig {
    static http = axios.create();
    static queryRestUrl = '/get';
    static crudRestUrl = '/crud/';

    static setHttp(http: AxiosInstance) {
        this.http = http;
        return GlobalBuildConfig;
    }

    static setQueryRestUrl(url: string) {
        this.queryRestUrl = url;
    }

    static setCrudRestUrl(url: string) {
        this.crudRestUrl = url.endsWith('/') ? url : url + '/';
    }
}

