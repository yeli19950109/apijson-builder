import { isEmpty, isNumber, assert, reverseMerge } from './utils';
import { Condition } from './condition';
import { AssociativeCondition, AssociativeConditionParams } from './associative-condition';
import { GlobalBuildConfig } from '../client';
import type { AxiosInstance } from 'axios';
import { isBoolean, isString } from 'lodash-es';

export type QueryBuilderParams = {
    table: string,
    queryType?: 1 | 2,
    restUrl?: string
    http?: AxiosInstance
}

export class QueryBuilder {
    table: string;
    conditions: Condition[] = [];
    queryType: 1 | 2 = 2; // 1表示返回总数, 2表示返回列表数和总数
    multiple = false;
    pagination: { page: number, count: number };
    orders: Record<string, '+' | '-'>;
    associativeConditions: AssociativeCondition[] = [];

    restUrl: string;
    http: AxiosInstance;

    getHttp() {
        return this.http ?? GlobalBuildConfig.http;
    }

    static by(conf: QueryBuilderParams) {
        return new QueryBuilder(conf);
    }

    constructor(conf: QueryBuilderParams) {
        const {
            table,
            queryType,
            restUrl,
            http,
        } = conf;
        assert(!isEmpty(table) && isString(table), `参数table: ${table} 非法`);
        if (queryType !== undefined) {
            assert([1, 2].indexOf(queryType) > -1, `参数queryType: ${queryType} 非法, 必须为数值1或2`);
            this.queryType = queryType;
        }
        if (restUrl) {
            this.restUrl = restUrl;
        }
        if (http) {
            this.http = http;
        }
        this.table = table;
    }

    explain = false;

    debug(val: boolean) {
        this.explain = val;
        return this;
    }

    child(query: AssociativeCondition | QueryBuilder) {
        if (query instanceof AssociativeCondition) {
            this.associativeConditions.push(
                query
                    .multi(false)
                    .setMain(this.table)
            );
        } else if (query instanceof QueryBuilder) {

        }
        return this;
    }

    children(query: AssociativeCondition | QueryBuilder) {
        if (query instanceof AssociativeCondition) {
            this.associativeConditions.push(
                query
                    .multi(true)
                    .setMain(this.table)
            );
        } else if (query instanceof QueryBuilder) {

        }
        return this;
    }

    /**
     * 设置关联条件
     */
    relate(conf: AssociativeConditionParams) {
        let { foreignKey } = conf;
        if (!isEmpty(foreignKey)
            && (
                !foreignKey.startsWith('/' + this.table + '/')
                || !foreignKey.startsWith(this.table + '/')
            )
        ) {
            foreignKey = '/' + this.table + '/' + foreignKey;
        }
        this.associativeConditions.push(AssociativeCondition.by({ ...conf, foreignKey }));
        return this;
    }

    condition(condition: Condition) {
        assert(condition instanceof Condition, `参数condition: ${condition} 非法, 必须是 Condition类型`);
        this.conditions.push(condition);
        return this;
    }

    fields: string[] = [];

    get(fields: string[] | string) {
        if (Array.isArray(fields) && fields.length) {
            this.fields = this.fields.concat(fields);
        } else if (typeof fields === 'string') {
            this.fields.push(fields);
        }
        return this;
    }


    multi(multi: boolean | number = false) {
        if (isBoolean(multi)) {
            this.multiple = multi;
        } else {
            const count = parseInt(multi + '');
            assert(isFinite(count), 'multi得是Boolean 或者 Number');
            this.multiple = true;
            this.pagination = {
                page: 0,
                count: count,
            };
        }
        return this;
    }

    page(page = 0, count = 10) {
        assert(isNumber(page) && isNumber(count), `参数page: ${page} 和 count: ${count} 都必须为Number类型`);
        this.multiple = true;
        this.pagination = {
            page: page,
            count: count,
        };
        return this;
    }

    /**
     *
     * @param field
     * @param desc 是否降序, 默认true
     */
    order(field: string, desc = true) {
        assert(!isEmpty(field) && isString(field), `参数field: ${field} 非法`);
        assert(isBoolean(desc), `参数desc: ${desc} 非法`);
        if (!this.orders) {
            this.orders = {};
        }
        this.orders[field] = (desc ? '-' : '+');
        return this;
    }

    toJson() {
        let json: Record<string, any> = {};
        const {
            table,
            conditions,
            pagination,
            fields,
            orders,
            multiple,
            associativeConditions,
            queryType,
        } = this;

        assert(!(pagination && multiple === false), '指定了分页内容, 则必须指定multiple为true!');

        function tableToJson(table: string, conditions: Condition[], fields: string[], orders: Record<string, any>) {
            const tableJson: Record<string, any> = {};
            const combine: string[] = [];
            if (conditions && conditions.length > 0) {
                conditions.forEach(c => {
                    const json = c.toJson();
                    if (json !== null) {
                        tableJson[json.k] = json.v;
                        if (json.c !== null && c.field !== 'id' && c.field !== 'userId') {
                            combine.push(json.c);
                        }
                    }
                });
            }
            if (fields && fields.length) {
                if (!fields.includes('*')) {
                    // id内置
                    tableJson['@column'] = [...new Set(fields), 'id']
                        .map(it => it.trim())
                        .join(',');
                }
            }
            if (orders) {
                tableJson['@order'] = Object.keys(orders).map(field => field + orders[field]).join(',');
            }
            if (combine.length) {
                tableJson['@combine'] = combine.join(',');
            }
            const json: Record<string, any> = {};
            json[table] = tableJson;
            return json;
        }

        function associativeTableToJson(associativeConditions: AssociativeCondition[], json: Record<string, any>) {
            associativeConditions.forEach(c => {
                reverseMerge(json, c.toJson());
            });
        }

        if (multiple) {
            json['[]'] = tableToJson(table, conditions, fields, orders);
            associativeTableToJson(associativeConditions, json['[]']);
            if (pagination) {
                reverseMerge(json['[]'], pagination);
            }

            json['[]']['query'] = queryType; // 查询数据和总数(附带total表示总数) // https://vincentcheng.github.io/apijson-doc/zh/grammar.html#%E5%88%86%E9%A1%B5
            json['total@'] = '/[]/total';
        } else {
            json = tableToJson(table, conditions, fields, orders);
            associativeTableToJson(associativeConditions, json);
        }
        if (this.explain) {
            json['@explain'] = true;
        }
        return json;
    }

    getRestUrl() {
        return this.restUrl ?? GlobalBuildConfig.queryRestUrl;
    }

    send(): Promise<Record<string, any>> {
        return this.getHttp()
            .post<any>(this.getRestUrl(), this.toJson())
            .then(({ data }): Promise<any> => {
                if (data.ok) {
                    return data as any;
                } else {
                    return Promise.reject(data);
                }
            });
    }
}
