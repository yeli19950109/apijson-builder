import { isEmpty, isString, assert, isArray } from './utils';
import { Condition, ConditionExpr } from './condition';
import { reverseMerge } from './utils';
import { AxiosInstance } from 'axios';
import { GlobalBuildConfig } from '../client';
import { isNumber } from 'lodash-es';

type CrudParams = {
    table: string,
    method: 'post' | 'put' | 'delete',
    restUrl?: string
    http?: AxiosInstance
}

export class CrudBuilder {
    table: string;
    method: CrudParams['method'];
    static methods = ['post', 'put', 'delete'];
    data: Record<string, any> = {};
    tag: string;
    http: AxiosInstance;

    getHttp() {
        return this.http ?? GlobalBuildConfig.http;
    }

    constructor(params: CrudParams) {
        const { table, method, restUrl, http } = params;
        assert(!isEmpty(table) && isString(table), `参数table: ${table} 非法`);
        assert(CrudBuilder.methods.indexOf(method) > -1, `参数method: ${method} 非法， 只支持 ${CrudBuilder.methods}, get请求请使用QueryBuilder构建`);

        this.table = table;
        this.method = method;
        this.tag = table;
        if (restUrl) {
            this.restUrl = restUrl;
        }
        if (http) {
            this.http = http;
        }
    }

    static by(params: CrudParams) {
        return new CrudBuilder(params);
    }

    static post(table: string) {
        return new CrudBuilder({ table, method: 'post' });
    }

    static put(table: string) {
        return new CrudBuilder({ table, method: 'put' });
    }

    static delete(table: string) {
        return new CrudBuilder({ table, method: 'delete' });
    }

    setData(val: Record<string, any>) {
        this.data = val;
        return this;
    }

    set(field: string, value: any) {
        assert(!isEmpty(field) && isString(field), `${field} 非法`);
        this.data[field] = value;
        return this;
    }

    ids: Array<string | number> = [];

    id(ids: number[] | string[] | number | string) {
        if (this.method !== 'post') {
            if (isArray(ids) && !isEmpty(ids)) {
                this.ids = this.ids.concat(ids);
            } else if (isString(ids) && !isEmpty(ids)) {
                this.ids.push(ids);
            } else if (isNumber(ids) && !isEmpty(ids)) {
                this.ids.push(ids);
            }
        } else {
            console.warn('post不需要设置id');
        }
        return this;
    }

    setTag(tag: string) {
        assert(!isEmpty(tag) && isString(tag), `参数tag: ${tag} 非法`);
        this.tag = tag;
        return this;
    }

    toJson() {
        const { table, tag, data } = this;
        const json: Record<string, any> = {};
        json[table] = {};
        assert(tag, `参数tag: ${tag}参数非法`);
        assert(this.method === 'delete' && this.ids.length > 0, `delete需要根据主主键删除`);

        reverseMerge(json[table], data);

        if (this.ids.length) {
            const cond = this.ids.length == 1
                ? Condition.eq('id', this.ids[0]).toJson()
                : Condition.in('id', this.ids).toJson();
            if (cond !== null) {
                json[table][cond.k] = cond?.v;
            }
        }

        json['tag'] = tag;
        return json;
    }

    restUrl = '/crud/';

    send(): Promise<any> {
        const { method } = this;
        return this.getHttp()
            .post<any>(`${this.restUrl}${method}`, this.toJson())
            .then(({ data }): Promise<any> => {
                if (data?.ok) {
                    return data as any;
                } else {
                    return Promise.reject(data);
                }
            });
    }
}
