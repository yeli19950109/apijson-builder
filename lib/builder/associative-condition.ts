import { isEmpty, isString, assert } from './utils';
import { isBoolean } from 'lodash-es';

export type AssociativeConditionParams = {
    // 关联的主表表名
    table: string,
    // 关联的主表主键
    primaryKey: string,
    // 和主表关联的当前表的外键。可以只输入字段名，或者符合api-json的外键全路径(以/开头)
    foreignKey: string,
    // 关联的主表响应字段
    resFields?: string
}

/**
 * 关联条件构建
 */
export class AssociativeCondition {
    table: string;
    primaryKey: string;
    foreignKey: string;
    resFields: string;

    static by(conf: AssociativeConditionParams) {
        return new AssociativeCondition(conf);
    }

    constructor(conf: AssociativeConditionParams) {
        const { table, primaryKey, resFields = '*' } = conf;
        let { foreignKey } = conf;
        assert(!isEmpty(table) && isString(table), `参数table: ${table} 非法`);
        assert(!isEmpty(primaryKey) && isString(primaryKey), `参数primaryKey: ${primaryKey} 非法, 必须是当前主表的主键`);
        assert(!isEmpty(foreignKey) && isString(foreignKey), `参数foreignField: ${foreignKey} 非法, 必须是关联表的外键字段`);
        this.table = table;
        this.primaryKey = primaryKey;
        this.foreignKey = foreignKey;
        if (resFields.trim() !== '*') {
            this.resFields = resFields;
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

    toJson() {
        const json: Record<string, any> = {};
        const tableJson: Record<string, any> = {};
        const {
            table,
            primaryKey,
            resFields,
        } = this;
        let { foreignKey, } = this;
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
        if (resFields) {
            tableJson['@column'] = resFields;
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
