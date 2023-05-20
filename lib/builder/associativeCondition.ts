import { isEmpty, isString, assert } from './utils';

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
export  class AssociativeCondition {
    table: string;
    primaryKey: string;
    foreignKey: string;
    resFields: string;

    associateTables: Array<{
        table: string,
        resFields: string
    }> = [];

    static by(conf: AssociativeConditionParams) {
        return new AssociativeCondition(conf);
    }

    constructor(conf: AssociativeConditionParams) {
        const { table, primaryKey, foreignKey, resFields = '*' } = conf;
        assert(!isEmpty(table) && isString(table), `[ApiJson] 参数table: ${table} 非法`);
        assert(!isEmpty(primaryKey) && isString(primaryKey), `[ApiJson] 参数primaryKey: ${primaryKey} 非法, 必须是当前主表的主键`);
        assert(!isEmpty(foreignKey) && isString(foreignKey), `[ApiJson] 参数foreignField: ${foreignKey} 非法, 必须是关联表的外键字段`);
        this.table = table;
        this.primaryKey = primaryKey;
        this.foreignKey = foreignKey;
        if (resFields.trim() !== '*') {
            this.resFields = resFields;
        }
    }

    associated(table: string, resFields: string) {
        this.associateTables.push({ // TODO 可以转为类型变量
            table: table,
            resFields: resFields,
        });
        return this;
    }

    toJson() {
        const json: Record<string, any> = {};
        const tableJson: Record<string, any> = {};
        const {
            table,
            primaryKey,
            foreignKey,
            resFields,
            associateTables,
        } = this;
        // 处理关联表
        tableJson[primaryKey + '@'] = foreignKey;
        tableJson['@column'] = resFields;
        json[table] = tableJson;

        // 处理关联目标表
        associateTables.forEach(t => {
            json[t.table] = {
                '@column': t.resFields,
            };
        });

        return json;
    }
}
