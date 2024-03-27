
//自定义渲染器(render_具体名称)，筛选器(filter_具体名称)。写好后可直接使用，无需引入
import VXETable from 'vxe-table';
import IconFontClass from '@/components/MyIcon/index.vue';

//返回是否渲染
VXETable.renderer.add('render_isno', {
  //默认显示模板
  renderDefault(renderOpts, params) {
    const { row, column } = params;
    let { custom } = renderOpts;
    if (custom && custom.status) {
      return [<label style={{ color: row[column.field] == custom.open ? 'green' : 'red' }}>{row[column.field] == custom.open ? '是' : '否'}</label>];
    } else {
      return [<label style={{ color: row[column.field] ? 'green' : 'red' }}>{row[column.field] ? '是' : '否'}</label>];
    }
  },
  //导出模板
  exportMethod(params) {
    const { row, column } = params;
    return row[column.field] ? '是' : '否';
  },
});

//返回等级颜色渲染
VXETable.renderer.add('render_levelcolor', {
  //默认显示模板
  renderDefault(renderOpts, params) {
    const { row, column } = params;
    switch (row[column.field]) {
      case 1:
        return [<div style={{ color: 'blue', width: "20px", height: "20px" }}></div>];
      case 2:
        return [<div style={{ color: 'yellow', width: "20px", height: "20px" }}></div>];
      case 3:
        return [<div style={{ color: 'orange', width: "20px", height: "20px" }}></div>];
      case 4:
        return [<div style={{ color: 'red', width: "20px", height: "20px" }}></div>];
      default:
        return [];
    }
  },
  //导出模板
  exportMethod(params) {
    const { row, column } = params;
    return row[column.field];
  },
});

//返回图标渲染器
VXETable.renderer.add('render_icon', {
  //默认显示模板
  renderDefault(renderOpts, params) {
    const { row, column } = params;
    return [<IconFontClass name={row[column.field]}></IconFontClass>];
  },
  //导出模板
  exportMethod(params) {
    const { row, column } = params;
    return row[column.field];
  },
});

//输入框筛选器。只会筛选前端的数据，不会请求后台
VXETable.renderer.add('filter_input', {
  //筛选模板
  renderFilter(renderOpts, params) {
    return [
      <filter-input params={params}></filter-input>
    ]
  },
  // 重置数据方法
  filterResetMethod(params) {
    const { options } = params
    options.forEach((option) => {
      option.data = ''
    })
  },
  // 重置筛选复原方法（当未点击确认时，该选项将被恢复为默认值）
  filterRecoverMethod({ option }) {
    option.data = ''
  },
  // 筛选方法
  filterMethod(params) {
    const { option, row, column } = params
    const { data } = option
    const cellValue = row[column.field]
    if (cellValue) {
      return cellValue.indexOf(data) > -1
    }
    return false
  }
})