//表单公共方法
import formApi from '@/api/form';
import _ from 'lodash-es';
import dayjs from 'dayjs';
const FormCommon = {
  //更改数据为表单显示的时候的值
  updateFormShowValue(layout_item, pid) {
    const columnValue = [];
    if (layout_item.element != "zhanwei") {
      switch (layout_item.element) {
        case 'a-range-picker':
          if (!myCommon.isnull(layout_item.value)) {
            layout_item.value
              .toString()
              .split('一')
              .forEach((v) => {
                const d = dayjs(v);
                columnValue.push(d);
              });
          }
          layout_item.value = columnValue;
          break;
        case 'a-date-picker':
          if (!myCommon.isnull(layout_item.value)) {
            layout_item.value = dayjs(layout_item.value);
          }
          break;
        case 'a-select':
        case 'a-checkbox-group':
        case 'a-tree':
        case 'a-cascader':
        case 'device-business-tree':
          if (!myCommon.isnull(layout_item.value)) {
            layout_item.value = layout_item.value.toString().split(",");
          } else {
            layout_item.value = [];
          }
          break;
        case 'a-radio-group':
          layout_item.value = layout_item.value.toString();
          break;
        case 'calculation':
        case 'control':

          break;
        case 'a-switch':
          if (layout_item.custom && layout_item.custom.status) {
            if (layout_item.value == layout_item.custom.open) {
              layout_item.value = true;
            } else {
              layout_item.value = false;
            }
          }
          break;
      }
    }
    if (layout_item.bringValue == 'pid' && pid != undefined) {
      layout_item.value = pid;
    }
  },
  //更改数据为提交时候的值
  updateFromValue(layout_item, pid) {
    if (!myCommon.isnull(layout_item.value)) {
      switch (layout_item.element) {
        case 'a-range-picker':
          layout_item.value[0] = layout_item.value[0].format('YYYY-MM-DD HH:mm:ss');
          layout_item.value[1] = layout_item.value[1].format('YYYY-MM-DD HH:mm:ss');
          layout_item.value = layout_item.value.join('一');
          break;
        case 'a-date-picker':
          layout_item.value = layout_item.value.format('YYYY-MM-DD HH:mm:ss');
          break;
        case 'a-select':
        case 'a-checkbox-group':
        case 'a-tree':
        case 'a-cascader':
        case 'device-business-tree':
          if (layout_item.value instanceof Array) {
            layout_item.value = layout_item.value.join(",");
          }
          break;
        case 'calculation':
        case 'control':

          break;
        case 'a-switch':
          if (layout_item.custom && layout_item.custom.status) {
            if (layout_item.value) {
              layout_item.value = layout_item.custom.open;
            } else {
              layout_item.value = layout_item.custom.close;
            }
          }
          break;
      }
    } else {
      layout_item.value = "";
    }
    if (layout_item.bringValue == 'pid') {
      layout_item.value = pid;
    }
  },
  //获取sqlValue。layouts为分页的数组(表单)
  getSqlValue(layout, pid, data, isPrimaryKey = false, updateFromValue = true) {
    const sqlValue = [];
    layout.forEach((item) => {
      item.forEach((col) => {
        const newCol = _.cloneDeep(col)
        if (data) {
          newCol.value = data[newCol.columnName];
          if (newCol.bringValue == "pid") {
            newCol.value = pid;
          }
        }
        if (updateFromValue) {
          FormCommon.updateFromValue(newCol, pid);
        }
        const sqlCol = {
          columnName: newCol.columnName,
          columnValue: newCol.value,
          columnType: newCol.columnType,
          columnLength: newCol.columnLength,
          isDefTableOrder: newCol.table.isDefTableOrder,
          defTableOrderBy: newCol.table.defTableOrderBy,
          bringValue: newCol.bringValue,
          isPrimaryKey: newCol.isPrimaryKey,
          primaryKeyRule: newCol.primaryKeyRule,
        };
        if (isPrimaryKey && newCol.isPrimaryKey) {
          sqlValue.push(sqlCol);
        } else if (!isPrimaryKey) {
          sqlValue.push(sqlCol);
        }
      });
    });
    return sqlValue;
  },
  //新增数据
  addData(sqlValue, allConfig, BtnPower = "") {
    return formApi
      .Insert({
        tableName: allConfig.tableName,
        linkages: allConfig.linkages,
        insertWhereSql: allConfig.local.insertWhereSql,
        sqlValue,
        BtnPower
      });
  },
  //更新数据
  updateData(sqlValues, updateColumns, allConfig, OldSqlValue = [], BtnPower = 2) {
    //old_sqlValue 旧数据，联动更新需要删除联动表的数据需要。更新某些列为某些值时不支持
    return formApi
      .Update({
        tableName: allConfig.tableName,
        linkages: allConfig.linkages,
        updateWhereSql: allConfig.local.updateWhereSql,
        sqlValue: sqlValues,
        updateColumns: updateColumns,
        OldSqlValue,
        BtnPower
      })
  },
  //删除数据
  deleteData(sqlValues, allConfig) {
    return formApi
      .Delete({
        tableName: allConfig.tableName,
        linkages: allConfig.linkages,
        sqlValue: sqlValues,
      })
  },
};

export default FormCommon;
