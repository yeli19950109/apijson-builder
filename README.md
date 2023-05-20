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

默认获取所有字段

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

## 根据id删除

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

# 配置

可以自定义http client,这样可以方便设置token和拦截器

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
# 全局设置

```typescript
GlobalBuildConfig.setHttp(axios.create());
GlobalBuildConfig.setQueryRestUrl('/api/json/get');
GlobalBuildConfig.setCrudRestUrl('/api/json/crud');
```