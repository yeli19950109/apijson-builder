import { isEmpty, isString, assert, isArray } from './utils';
import { isBoolean } from 'lodash-es';

export type AssociativeConditionParams = {
    // 关联的主表表名
    table: string,
    // 关联的主表主键
    primaryKey: string,
    // 和主表关联的当前表的外键。可以只输入字段名，或者符合api-json的外键全路径(以/开头)
    foreignKey: string,
    // 关联的主表响应字段
    resFields?: string[]
}

/**
 * 关联条件构建
 */
export class AssociativeCondition {
    table: string;
    primaryKey: string;
    foreignKey: string;
    fields: string[] = [];

    static by(conf: AssociativeConditionParams) {
        return new AssociativeCondition(conf);
    }

    static table(table: string) {
        return new AssociativeCondition({ table });
    }

    constructor(conf: Partial<AssociativeConditionParams>) {
        const { table = '', primaryKey = '', resFields = [], foreignKey = '' } = conf;
        this.table = table;
        this.primaryKey = primaryKey;
        this.foreignKey = foreignKey;
        if (isArray(resFields)) {
            this.fields = resFields;
        }
    }

    multiple = false;
    pagination: { page: number, count: number };

    mainTable: string;

    setMain(table: string) {
        this.mainTable = table;
        return this;
    }

    multi(multi: boolean) {
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

    link(primaryKey: string, foreignKey: string) {
        this.primaryKey = primaryKey;
        this.foreignKey = foreignKey;
        return this;
    }

    get(fields: string[] | string) {
        if (Array.isArray(fields) && fields.length) {
            this.fields = this.fields.concat(fields);
        } else if (typeof fields === 'string') {
            this.fields.push(fields);
        }
        return this;
    }

    toJson() {
        const json: Record<string, any> = {};
        const tableJson: Record<string, any> = {};
        const {
            table,
            primaryKey,
            fields,
        } = this;
        let { foreignKey, } = this;

        assert(!isEmpty(table) && isString(table), `参数table: ${table} 非法`);
        assert(!isEmpty(primaryKey) && isString(primaryKey), `参数primaryKey: ${primaryKey} 非法, 必须是当前主表的主键`);
        assert(!isEmpty(foreignKey) && isString(foreignKey), `参数foreignField: ${foreignKey} 非法, 必须是关联表的外键字段`);

        if (!isEmpty(foreignKey)
            && (
                !foreignKey.startsWith('/' + this.mainTable + '/')
                || !foreignKey.startsWith(this.mainTable + '/')
            )
        ) {
            foreignKey = (this.multiple ? '' : '/') + this.mainTable + '/' + foreignKey;
        }
        // 处理关联表
        tableJson[primaryKey + '@'] = foreignKey;
        if (isArray(fields) && !isEmpty(fields)) {
            if (!fields.includes('*')) {
                // id内置
                tableJson['@column'] = [...new Set(fields), 'id']
                    .map(it => it.trim())
                    .join(',');
            } else {
                tableJson['@column'] = '*';
            }
        }
        if (this.multiple) {
            json['[]'] = {
                [table]: tableJson
            };
        } else {
            json[table] = tableJson;
        }
        return json;
    }
}
