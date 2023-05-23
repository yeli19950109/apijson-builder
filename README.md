# @aijs/apijson-builder

fork自https://github.com/pengxianggui/apijson-builder  
简单包装apijson,相比直接构造查询json更好记一些,使用ts编写,并且调整了一些参数和使用方式

# 简单查询

## 分页

```typescript
await QueryBuilder
    // 指定要查询的表
    .by({ table: 表名称 })
    // 需要注意分页是从0开始
    .page(0, 20)
    .send();
```

## 获取多条数据

```typescript
await QueryBuilder
    // 指定要查询的表
    .by({ table: 表名称 })
    // 默认多个条件 && 
    .condition(Condition.eq(字段名1, 值1))
    .condition(Condition.eq(字段名2, 值2))
    // 获取符合条件的多条数据,true默认10条
    .multi(true)
    // 可以指定条数
    // .multi(5)
    .send();
```

## 调试

```typescript
await QueryBuilder
    // 指定要查询的表
    .by({ table: 表名称 })
    .debug(true)
    // 需要注意分页是从0开始
    .page(0, 20)
    .send();
```

## 搜索+分页

```typescript
await QueryBuilder
    // 指定要查询的表
    .by({ table: 表名称 })
    // 查询字段名=值的数据
    .condition(Condition.eq(字段名, 值))
    // 带查询条件并分页返回,需要注意分页是从0开始
    .page(0, 20)
    .send();
```

## 模糊搜索

```typescript
await QueryBuilder
    // 指定要查询的表
    .by({ table: 表名称 })
    // 查询字段名=值的数据
    .condition(Condition.like(字段名, 值))
    // 带查询条件并分页返回,需要注意分页是从0开始
    .page(0, 20)
    .send();
```

## 排序

```typescript
await QueryBuilder
    // 指定要查询的表
    .by({ table: 表名称 })
    // 降序desc
    .order('create_time', true)
    // 或者增序asc
    .order('update_time', false)
    // 带查询条件并分页返回,需要注意分页是从0开始
    .page(0, 20)
    .send();
```

## 多个条件

```typescript
await QueryBuilder
    // 指定要查询的表
    .by({ table: 表名称 })
    // 默认多个条件 && 
    .condition(Condition.eq(字段名1, 值1))
    .condition(Condition.eq(字段名2, 值2))
    // 获取符合条件的分页
    .page(0, 20)
    .send();
```

## 多个条件and/or

```typescript
await QueryBuilder
    // 指定要查询的表
    .by({ table: 表名称 })
    // 这样返回符合 字段名1=值1 || 字段名2=值2
    .condition(Condition.eq(字段名1, 值1, true))
    .condition(Condition.eq(字段名2, 值2, true))
    .send();

// 这样返回符合 (字段名3=值3 && 字段名4=值4) && (字段名1=值1 || 字段名2=值2)
await QueryBuilder
    .by({ table: 表名称 })
    .condition(Condition.eq(字段名1, 值1, true))
    .condition(Condition.eq(字段名2, 值2, true))
    .condition(Condition.eq(字段名3, 值3))
    .condition(Condition.eq(字段名4, 值4))
    .send();
```

## 获取指定字段

不指定字段默认*获取所有字段,如果指定字段默认会附加id

```typescript
await QueryBuilder
    .by({ table: 表名称 })
    .get(字段名1)
    .get(字段名2)
    .page(0, 20)
    .send();
// 或者
await QueryBuilder
    .by({ table: 表名称 })
    .get([字段名1, 字段名2])
    .get(字段名3)
    .page(0, 20)
    .send();
```

## 单表新增

```typescript
await CrudBuilder
    .post(表名称)
    .set(字段1, 值1)
    .set(字段2, 值2)
    .send();
// 或者
await CrudBuilder
    .post(表名称)
    .setData({
        字段1: 值1,
        字段2: 值2,
    })
    .send();
await CrudBuilder
    .by({ table: 表名称, method: 'post' })
    .setData({
        字段1: 值1,
        字段2: 值2,
    })
    .send();
```

## 单表根据id删除

```typescript
await CrudBuilder
    .delete(表名称)
    .id(id)
    .send();
// 或者批量删除
await CrudBuilder
    .delete(表名称)
    .id([id1, id2])
    .send();
// 或者批量删除
await CrudBuilder
    .delete(表名称)
    .id(id1)
    .id(id2)
    .send();
await CrudBuilder
    .by({ table: 表名称, method: 'delete' })
    .id(id)
    .send();
```

## 单表根据id修改

```typescript
await CrudBuilder
    .put(表名称)
    .id(id)
    .set(字段1, 值1)
    .set(字段2, 值2)
    .send();
// 或者
await CrudBuilder
    .put(表名称)
    .id(id)
    .setData({
        字段1: 值1,
        字段2: 值2,
    })
    .send();
// 或者
await CrudBuilder
    .by({ table: 表名称, method: 'put' })
    .id(id)
    .setData({
        字段1: 值1,
        字段2: 值2,
    })
    .send();
```

## 一对一

```typescript
await QueryBuilder
    .by({ table: 主表名称 })
    .debug(true)
    .condition(Condition.eq('id', 2))
    // 可以接多个child以查询多张子表
    .child(AssociativeCondition.by({
        primaryKey: 主表字段,
        table: 子表名称,
        foreignKey: 子表字段
    }))
    .send();
// 或者
await QueryBuilder
    .by({ table: 主表名称 })
    .debug(true)
    .condition(Condition.eq('id', 2))
    // 可以接多个child以查询多张子表
    .child(
        AssociativeCondition
            .table(子表名称)
            .link(主表字段, 子表字段)
    )
    .child(
        AssociativeCondition
            .table(子表名称2)
            .link(主表字段2, 子表字段2)
    )
    .send();
// => 得到的json如下
const json = {
    'Test_a2': {
        'id': 2
    },
    'Test_a1': {
        'column1@': '/Test_a2/column1'
    },
    '@explain': true
};
```

## 一对多

```typescript
await QueryBuilder
    .by({ table: 主表名称 })
    .debug(true)
    .condition(Condition.eq('id', 2))
    // 可以接多个children以查询多张子表
    .children(AssociativeCondition.by({
        primaryKey: 主表字段,
        table: 子表名称,
        foreignKey: 子表字段
    }))
    .send();
// 或者
await QueryBuilder
    .by({ table: 主表名称 })
    .debug(true)
    .condition(Condition.eq('id', 2))
    // 可以接多个children以查询多张子表
    .children(
        AssociativeCondition
            .table(子表名称)
            .link(主表字段, 子表字段)
    )
    .children(
        AssociativeCondition
            .table(子表名称2)
            .link(主表字段2, 子表字段2)
    )
    .send();
// => 得到的json如下
const json = {
    'Test_a2': {
        'id': 2
    },
    '[]': {
        'Test_a1': {
            'column1@': 'Test_a2/column1'
        }
    },
    // 多张一对多子表会使用别名
    '[]:Test_a21': {
        'Test_a21': {
            'column1@': 'Test_a2/column1'
        },
        'count': 100
    },
    '@explain': true
};
```

## 一对一,一对多指定查询字段

不指定字段默认*,如果指定字段默认会附加id

```typescript
await QueryBuilder
    .by({ table: 主表名称 })
    .debug(true)
    .condition(Condition.eq('id', 2))
    // 可以接多个children以查询多张子表
    .children(
        AssociativeCondition
            .table(子表名称)
            .link(主表字段, 子表字段)
            .get([字段1, 字段2])
    )
    .send();
```
## join连表
注意join连表即使不.page(0,10)也一定是查询多条数据结果
```typescript
await QueryBuilder
    .by({ table: 主表名称 })
    .debug(true)
    .condition(Condition.eq('id', 2))
    .join(
        AssociativeCondition
            .table(子表名称)
            .leftJoin(主表字段, 子表字段)
            .get([字段1, 字段2])
    )
    .page(0, 10)
    .send();
// 使用关联表
await QueryBuilder
    .by({ table: 主表名称 })
    .debug(true)
    .condition(Condition.eq('id', 2))
    .join(
        AssociativeCondition
            .table(关联表)
            .leftJoin(主表字段, 关联主表字段)
    )
    // 可以2个join,比如使用单独的关联表实现多对多
    // 第一个join是关联表,然后第二个join通过setMain关联到第一个join
    .join(
        AssociativeCondition
            .table(子表名称)
            .setMain(关联表)
            .leftJoin(关联子表名称, 子表字段)
            .get([字段1, 字段2])
    )
    .page(0, 10)
    .send();
```
# 配置

可以自定义http client,这样可以方便设置token和拦截器

## 全局设置

```typescript
GlobalBuildConfig.setHttp(axios.create());
GlobalBuildConfig.setQueryRestUrl('/api/json/get');
GlobalBuildConfig.setCrudRestUrl('/api/json/crud');
```

## 单独配置

```typescript
await QueryBuilder
    .by({
        table: 表名称,
        http: axios.create(),
        // 默认为/get
        restUrl: '/api/json/get'
    })
    .page(0, 20)
    .send();
await CrudBuilder
    .by({
        table: 表名称,
        method: 'delete',
        http: axios.create(),
        // 默认为/crud
        restUrl: '/api/json/crud'
    })
    .id(id)
    .send();
```
