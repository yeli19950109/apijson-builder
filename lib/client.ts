import axios, { AxiosInstance } from 'axios';

export class BuildConfig {
    http = axios.create();
    queryRestUrl = '/get';
    crudRestUrl = '/crud/';

    setHttp(http: AxiosInstance) {
        this.http = http;
        return this;
    }

    setQueryRestUrl(url: string) {
        this.queryRestUrl = url;
        return this;
    }

    setCrudRestUrl(url: string) {
        this.crudRestUrl = url.endsWith('/') ? url : url + '/';
        return this;
    }
}

const g: any = typeof globalThis === 'object'
    ? globalThis
    : typeof window === 'object'
        ? window
        : {};

if (!g.$$ApiJsonBuilder) {
    g.$$ApiJsonBuilder = new BuildConfig();
}

export const GlobalBuildConfig = g.$$ApiJsonBuilder;