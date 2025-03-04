import type { App } from 'vue';
import Antd, { message } from 'ant-design-vue';
import 'jquery-ui-dist/jquery-ui';
//插件获取隐藏元素的高和宽
import 'jquery.actual';
import gridLayout from 'vue-grid-layout';
import MyContent from './MyComponent/index.vue';
import AuthDom from './MyAuthDom/index.vue';
import myCommon from '@/utils/MyCommon/common';
import VXETable from 'vxe-table';
import VxeUI from 'vxe-pc-ui';
import '@/components/MyVXETable/index';
import IconFontClass from '@/components/MyIcon/index.vue';
import zhCN from 'vxe-pc-ui/lib/language/zh-CN';
import enUS from 'vxe-pc-ui/lib/language/en-US';
import frFR from 'vxe-pc-ui/lib/language/fr-FR';
import _ from 'lodash-es';
import { useI18n } from '@/hooks/web/useI18n';
import { useLocaleStore } from '@/store/modules/locale';
import type { LocaleType } from '#/config';
import VxeUIPluginExportXLSX from '@vxe-ui/plugin-export-xlsx';
import ExcelJS from 'exceljs';

export function registerGlobComp(app: App) {
  const { t } = useI18n();
  const localeStore = useLocaleStore();
  const locale: LocaleType = localeStore.getLocale;
  if (locale == 'fr-FR') {
    VxeUI.setI18n('fr-FR', frFR);
  } else if (locale == 'en-US') {
    VxeUI.setI18n('en-US', enUS);
  } else {
    VxeUI.setI18n('zh-CN', zhCN);
  }
  VxeUI.setLanguage(locale);
  VxeUI.use(VxeUIPluginExportXLSX, {
    ExcelJS,
  });
  //全局引用
  window._ = _;
  window.myCommon = myCommon;
  //提示信息全局配置
  message.config({
    top: '150px',
    duration: 3,
  });
  //VXETable的全局组件配置:https://vxetable.cn/#/table/start/global

  //VXETable的全局组件配置:https://vxetable.cn/#/table/base/basic
  VXETable.config({
    size: 'small', // 全局尺寸
    // zIndex: 999, // 全局 zIndex 起始值，如果项目的的 z-index 样式值过大时就需要跟随设置更大，避免被遮挡
    // version: 0, // 版本号，对于某些带数据缓存的功能有用到，上升版本号可以用于重置数据
    // loadingText: '加载中...', // 全局loading提示内容，如果为null则不显示文本
    table: {
      height: 'auto',
      minHeight: 300,
      showHeader: true,
      keepSource: false,
      showOverflow: null,
      showHeaderOverflow: null,
      showFooterOverflow: null,
      size: 'small',
      autoResize: false,
      stripe: false,
      border: true,
      round: false,
      emptyText: t('view.noDataAvailable'),
      columnConfig: {
        resizable: true,
        isCurrent: true,
        isHover: true,
      },
      rowConfig: {
        keyField: '_X_ROW_KEY', // 行数据的唯一主键字段名
        isCurrent: true,
        isHover: true,
      },
      radioConfig: {
        trigger: 'default',
      },
      checkboxConfig: {
        strict: false,
        highlight: false,
        range: false,
        trigger: 'default',
      },
      sortConfig: {
        remote: false,
        trigger: 'default',
        orders: ['asc', 'desc', null],
        // sortMethod: null,
        showIcon: true,
        iconLayout: 'vertical',
      },
      filterConfig: {
        remote: false,
        showIcon: true,
        // filterMethod: null,
      },
      expandConfig: {
        trigger: 'default',
        showIcon: true,
      },
      treeConfig: {
        rowField: 'id',
        parentField: 'parentId',
        childrenField: 'children',
        hasChild: 'hasChild',
        mapChildrenField: '_X_ROW_CHILD',
        indent: 20,
        showIcon: true,
      },
      tooltipConfig: {
        enterable: true,
      },
      // menuConfig: {
      //   visibleMethod() {},
      // },
      editConfig: {
        mode: 'cell',
        showAsterisk: true,
      },
      importConfig: {
        modes: ['insert', 'covering'],
      },
      exportConfig: {
        modes: ['current', 'selected'],
      },
      customConfig: {
        storage: false,
        allowVisible: true,
        allowResizable: true,
        allowFixed: true,
        allowSort: true,
        showFooter: true,
        placement: 'top-right',
        //  storage: false,
        //  checkMethod () {},
        modalOptions: {
          title: '1111',
          showMaximize: true,
          mask: true,
          lockView: true,
          resize: true,
          escClosable: true,
        },
      },
      scrollX: {
        gt: 60,
      },
      scrollY: {
        gt: 100,
        enabled: true,
      },
      loading: {
        icon: 'vxe-icon-spinner roll',
        text: t('view.loading'),
      },
    },
    grid: {
      height: 'auto',
      minHeight: 300,
      scrollY: { gt: 100, enabled: true },
      size: 'small',
      zoomConfig: {
        escRestore: true,
      },
      pagerConfig: {
        perfect: false,
      },
      toolbarConfig: {
        perfect: false,
      },
      proxyConfig: {
        autoLoad: true,
        message: true,
        props: {
          list: null, // 用于列表，读取响应数据
          result: 'result', // 用于分页，读取响应数据
          total: 'page.total', // 用于分页，读取总条数
        },
        beforeItem: null,
        beforeColumn: null,
        beforeQuery: null,
        afterQuery: null,
        beforeDelete: null,
        afterDelete: null,
        beforeSave: null,
        afterSave: null,
      },
    },
    pager: {
      size: null,
      //当只有一页时自动隐藏
      // autoHidden: true,
      //配套的样式
      perfect: true,
      pageSize: 20,
      //显示页码按钮的数量
      pagerCount: 7,
      pageSizes: [10, 20, 50, 100, 200, { label: t('view.massData'), value: 1000 }],
      //自定义布局顺序
      layouts: ['Home', 'PrevPage', 'JumpNumber', 'NextPage', 'End', 'Sizes', 'Total'],
    },
    // form: {
    //   preventSubmit: false
    //   size: null,
    //   colon: false,
    //   validConfig: {
    //     autoPos: true
    //   },
    //   tooltipConfig: {
    //     enterable: true
    //   },
    //   titleAsterisk: true
    // },
    // input: {
    //   size: null,
    //   transfer: false
    //   parseFormat: 'yyyy-MM-dd HH:mm:ss.SSS',
    //   labelFormat: '',
    //   valueFormat: '',
    //   startDay: 1,
    //   digits: 2,
    //   controls: true
    // },
    // textarea: {
    //   size: null
    //   autosize: {
    //     minRows: 1,
    //     maxRows: 10
    //   }
    // },
    // select: {
    //   size: null,
    //   transfer: false,
    //   optionConfig: {
    //     keyField: '_X_OPTION_KEY' // 选项数据的唯一主键字段名
    //   },
    //   multiCharOverflow: 8
    // },
    // toolbar: {
    //   size: null,
    //   import: {
    //     mode: 'covering'
    //   },
    //   export: {
    //     types: ['csv', 'html', 'xml', 'txt']
    //   },
    //   custom: {
    //     isFooter: true
    //   },
    //   buttons: [],
    //   tools: []
    // },
    // button: {
    //   size: null,
    //   transfer: false
    // },
    // radio: {
    //   size: null
    // },
    // checkbox: {
    //   size: null
    // },
    // switch: {
    //   size: null
    // },
    // modal: {
    //   // size: null,
    //   minWidth: 340,
    //   minHeight: 200,
    //   lockView: true,
    //   mask: true,
    //   duration: 3000,
    //   marginSize: 0,
    //   dblclickZoom: true,
    //   showTitleOverflow: true
    //   storage: false
    // },
    // list: {
    //   scrollY: {
    //     gt: 100
    //   }
    // }
  });

  //VXETable全局图标
  VXETable.setIcon({
    // loading
    LOADING: 'vxe-icon-spinner roll vxe-loading--default-icon',
    // table
    TABLE_SORT_ASC: 'vxe-icon-caret-up',
    TABLE_SORT_DESC: 'vxe-icon-caret-down',
    TABLE_FILTER_NONE: 'vxe-icon-funnel',
    TABLE_FILTER_MATCH: 'vxe-icon-funnel',
    TABLE_EDIT: 'iconfont icon-baseui-edit-fill',
    TABLE_TREE_LOADED: 'vxe-icon-spinner roll',
    TABLE_TREE_OPEN: 'vxe-icon-caret-right rotate90',
    TABLE_TREE_CLOSE: 'vxe-icon-caret-right',
    TABLE_EXPAND_LOADED: 'vxe-icon-spinner roll',
    TABLE_EXPAND_OPEN: 'vxe-icon-arrow-right rotate90',
    TABLE_EXPAND_CLOSE: 'vxe-icon-arrow-right',
    TABLE_CHECKBOX_CHECKED: 'vxe-icon-checkbox-checked',
    TABLE_CHECKBOX_UNCHECKED: 'vxe-icon-checkbox-unchecked',
    TABLE_CHECKBOX_INDETERMINATE: 'vxe-icon-checkbox-indeterminate',
    TABLE_RADIO_CHECKED: 'vxe-icon-radio-checked',
    TABLE_RADIO_UNCHECKED: 'vxe-icon-radio-unchecked',

    // button
    BUTTON_DROPDOWN: 'vxe-icon-arrow-down',
    BUTTON_LOADING: 'vxe-icon-spinner roll',

    // select
    SELECT_LOADED: 'vxe-icon-spinner roll',
    SELECT_OPEN: 'vxe-icon-caret-down rotate180',
    SELECT_CLOSE: 'vxe-icon-caret-down',

    // pager
    PAGER_JUMP_PREV: 'vxe-icon-arrow-double-left',
    PAGER_JUMP_NEXT: 'vxe-icon-arrow-double-right',
    PAGER_PREV_PAGE: 'vxe-icon-arrow-left',
    PAGER_NEXT_PAGE: 'vxe-icon-arrow-right',
    PAGER_JUMP_MORE: 'vxe-icon-ellipsis-h',

    // input
    INPUT_CLEAR: 'vxe-icon-error-circle-fill',
    INPUT_SEARCH: 'vxe-icon-search',

    // modal
    MODAL_ZOOM_IN: 'vxe-icon-square',
    MODAL_ZOOM_OUT: 'vxe-icon-maximize',
    MODAL_CLOSE: 'vxe-icon-close',
    MODAL_INFO: 'vxe-icon-info-circle-fill',
    MODAL_SUCCESS: 'vxe-icon-success-circle-fill',
    MODAL_WARNING: 'vxe-icon-warnion-circle-fill',
    MODAL_ERROR: 'vxe-icon-error-circle-fill',
    MODAL_QUESTION: 'vxe-icon-question-circle-fill',
    MODAL_LOADING: 'vxe-icon-spinner roll',

    // toolbar
    TOOLBAR_TOOLS_REFRESH: 'vxe-icon-repeat',
    TOOLBAR_TOOLS_REFRESH_LOADING: 'vxe-icon-repeat roll',
    TOOLBAR_TOOLS_IMPORT: 'vxe-icon-upload',
    TOOLBAR_TOOLS_EXPORT: 'vxe-icon-download',
    TOOLBAR_TOOLS_PRINT: 'vxe-icon-print',
    TOOLBAR_TOOLS_FULLSCREEN: 'vxe-icon-fullscreen',
    TOOLBAR_TOOLS_MINIMIZE: 'vxe-icon-minimize',
    TOOLBAR_TOOLS_CUSTOM: 'vxe-icon-custom-column',

    // form
    FORM_PREFIX: 'vxe-icon-question-circle-fill',
    FORM_SUFFIX: 'vxe-icon-question-circle-fill',
    FORM_FOLDING: 'vxe-icon-arrow-up rotate180',
    FORM_UNFOLDING: 'vxe-icon-arrow-up',
  });

  //全局注册组件
  app.use(Antd).use(gridLayout).use(VxeUI).use(VXETable);
  //注册自己写的组件，避免在页面重复import
  app
    .component(
      // 注册的名字
      'MyContent',
      MyContent,
    )
    .component('AuthDom', AuthDom)
    .component('IconFontClass', IconFontClass);
}
