import { isEmpty, isString, assert } from './utils';

export type ConditionExpr =
    'eq'
    | 'in'
    | 'not_in'
    | 'like'
    | 'pattern'
    | 'between'
    | 'sub_query'
    | 'json_contains'
    | 'expression'
export type ConditionParams = { field: string, expr: ConditionExpr, value: any, or?: boolean }

export class Condition {
    field: string;
    expr: ConditionExpr;
    value: any;
    or = false;
    ignoreValue: string[] = [];
    static EXPRS = [
        'eq',
        'in',
        'not_in',
        'like',
        'pattern',
        'between',
        'sub_query',
        'json_contains',
        'expression',
    ];

    constructor(conf: ConditionParams) {
        const { field, expr = 'expression', value } = conf;
        assert(!isEmpty(field) && isString(field), `[ApiJson] ${field} 非法`);
        assert(Condition.EXPRS.indexOf(expr) > -1, `[ApiJson] 未知操作符 ${expr}, 支持的操作符为: ${Condition.EXPRS}`);

        this.field = field;
        this.expr = expr;
        this.value = value;
        this.or = !!conf.or;
    }

    static by(conf: ConditionParams) {
        return new Condition(conf);
    }

    static eq(field: string, value: any, or?: boolean) {
        return new Condition({ field, value, expr: 'eq', or });
    }

    static between(field: string, value: [any, any], or?: boolean) {
        return new Condition({ field, value: value.join(','), expr: 'between', or });
    }

    static like(field: string, value: any, or?: boolean) {
        return new Condition({ field, value, expr: 'like', or });
    }

    static in(field: string, value: any[], or?: boolean) {
        return new Condition({ field, value, expr: 'in', or });
    }

    static notIn(field: string, value: any[], or?: boolean) {
        return new Condition({ field, value, expr: 'not_in', or });
    }

    ignore(ignoreValue: string | string[]) {
        if (Array.isArray(ignoreValue)) {
            this.ignoreValue = ignoreValue;
        } else {
            this.ignoreValue.push(ignoreValue);
        }
        return this;
    }

    toJson(): { k: string, v: string, c: string | null } | null {
        const json: { k: string, v: string, c: string | null } = { k: '', v: '', c: null };
        const { field, expr, value, ignoreValue, or } = this;
        if (ignoreValue.indexOf(value) > -1) {
            return null;
        }
        switch (expr) {
            case 'eq':
                if (value === null) {
                    json.k = field + '{}';
                    json.v = '=null';
                    json.c = or ? json.k : '&' + json.k;
                } else {
                    json.k = field;
                    json.v = value;
                    json.c = or ? json.k : '&' + json.k;
                }
                break;
            case 'expression':
                json.k = field + '{}';
                json.v = value;
                json.c = or ? json.k : '&' + json.k;
                break;
            case 'between':
                json.k = field + '%';
                json.v = value;
                json.c = or ? json.k : '&' + json.k;
                break;
            case 'in':
                json.k = field + '{}';
                json.v = value;
                json.c = or ? json.k : '&' + json.k;
                break;
            case 'not_in':
                json.k = field + '!{}';
                json.v = value;
                json.c = or ? json.k : '&' + json.k;
                break;
            case 'like':
                json.k = field + '$';
                json.v = '%' + value + '%';
                json.c = or ? json.k : '&' + json.k;
                break;
            case 'pattern':
                json.k = field + '~';
                json.v = value;
                json.c = or ? json.k : '&' + json.k;
                break;
            case 'sub_query':
                json.k = field + '@';
                json.v = value;
                break;
            case 'json_contains':
                json.k = field + '<>';
                json.v = value;
                json.c = or ? json.k : '&' + json.k;
                break;
            default:
                throw new Error(`[ApiJson] 未知操作类型： ${expr}`);
        }
        return json;
    }
}
