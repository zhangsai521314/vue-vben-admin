<template>
  <MyContent ref="myContentRef">
    <vxe-grid
      :scroll-y="{ enabled: true }"
      v-bind="tableConfig"
      id="mytable"
      :auto-resize="true"
      ref="tableRef"
      :loading="loading"
      :seq-config="{ startIndex: (page.current - 1) * page.size }"
      :column-config="{ resizable: true }"
      :custom-config="{ storage: true }"
      @sort-change="onSortChange"
    >
      <template #toolbar_buttons>
        <div :class="`tableBtn`">
          <a-space direction="horizontal" size="small" style="margin-left: 5px">
            <AuthDom auth="ddServcer_cirStatus_query">
              <a-space direction="horizontal" size="small" :wrap="true" style="margin-bottom: 0">
                <div class="row-div">
                  <a-space direction="horizontal" size="small" :wrap="true">
                    <label>心跳时间：</label>
                    <a-config-provider :locale="zhCN">
                      <a-range-picker
                        allowClear
                        v-model:value="timeValue"
                        :showTime="true"
                        format="YYYY-MM-DD HH:mm:ss"
                      />
                    </a-config-provider>
                  </a-space>
                </div>
                <!-- <div class="row-div">
                  <a-space direction="horizontal" size="small" :wrap="true">
                    <label>线路名称：</label>
                    <a-select
                      style="width: 170px"
                      allow-clear
                      show-search
                      :filter-option="AntVueCommon.filterOption"
                      v-model:value="seacthContent.lineCode"
                      :options="lineDatas"
                    />
                  </a-space>
                </div> -->
                <div class="row-div">
                  <a-space direction="horizontal" size="small" :wrap="true">
                    <label>车站名称：</label>
                    <a-select
                      placeholder="请选择车站名称"
                      style="width: 170px"
                      allow-clear
                      show-search
                      :filter-option="AntVueCommon.filterOption"
                      v-model:value="seacthContent.stationCode"
                      :options="stationDatas"
                    />
                  </a-space>
                </div>
                <!-- <div class="row-div">
                  <a-space direction="horizontal" size="small" :wrap="true">
                    <label>ECI名称：</label>
                    <a-select
                      style="width: 400px"
                      allow-clear
                      show-search
                      mode="tags"
                      :filter-option="AntVueCommon.filterOption"
                      v-model:value="seacthContent.lacciName"
                      :options="dictionariesData"
                    />
                  </a-space>
                </div> -->
                <div class="row-div">
                  <a-space direction="horizontal" size="small" :wrap="true">
                    <label>ISDN：</label>
                    <a-input
                      @press-enter="initPage()"
                      v-model:value="seacthContent.isdn"
                      placeholder="输入ISDN号查询"
                    />
                  </a-space>
                </div>
                <div class="row-div">
                  <a-space direction="horizontal" size="small" :wrap="true">
                    <label>机车功能号：</label>
                    <a-input
                      @press-enter="initPage()"
                      v-model:value="seacthContent.jcFn"
                      placeholder="输入机车功能号查询"
                    />
                  </a-space>
                </div>
                <div class="row-div">
                  <a-space direction="horizontal" size="small" :wrap="true">
                    <label>机车号状态：</label>
                    <a-select
                      placeholder="请选择机车号状态"
                      style="width: 170px"
                      allow-clear
                      v-model:value="seacthContent.JcFnStatus"
                    >
                      <a-select-option :value="1">注册</a-select-option>
                      <a-select-option :value="0">手动注销</a-select-option>
                      <a-select-option :value="2">超时注销</a-select-option>
                      <a-select-option :value="3">强制注销</a-select-option>
                    </a-select>
                  </a-space>
                </div>
                <div class="row-div">
                  <a-space direction="horizontal" size="small" :wrap="true">
                    <label>车次功能号：</label>
                    <a-input
                      @press-enter="initPage()"
                      v-model:value="seacthContent.ccFn"
                      placeholder="输入车次功能号查询"
                    />
                  </a-space>
                </div>
                <div class="row-div">
                  <a-space direction="horizontal" size="small" :wrap="true">
                    <label>车次号状态：</label>
                    <a-select
                      placeholder="请选择车次号状态"
                      style="width: 170px"
                      allow-clear
                      v-model:value="seacthContent.CcFnStatus"
                    >
                      <a-select-option :value="1">注册</a-select-option>
                      <a-select-option :value="0">手动注销</a-select-option>
                      <a-select-option :value="2">超时注销</a-select-option>
                      <a-select-option :value="3">强制注销</a-select-option>
                    </a-select>
                  </a-space>
                </div>
                <div class="row-div">
                  <a-space direction="horizontal" size="small" :wrap="true">
                    <label>登录状态：</label>
                    <a-select
                      placeholder="请选择登录状态"
                      style="width: 170px"
                      allow-clear
                      v-model:value="seacthContent.LoginStatus"
                    >
                      <a-select-option :value="1">登录</a-select-option>
                      <a-select-option :value="0">未登录</a-select-option>
                    </a-select>
                  </a-space>
                </div>
                <div class="row-div">
                  <a-space direction="horizontal" size="small" :wrap="true">
                    <a-button @click="initPage()" type="primary">查询</a-button>
                    <a-button @click="resetSeacth">重置表单</a-button>
                    <a-radio-group v-model:value="refresh" button-style="solid">
                      <a-radio-button value="yes">开启自动刷新</a-radio-button>
                      <a-radio-button value="no">关闭自动刷新</a-radio-button>
                      <a-radio-button value="time" disabled>{{ refreshTime }}秒</a-radio-button>
                    </a-radio-group>
                  </a-space>
                </div>
              </a-space>
            </AuthDom>
          </a-space>
        </div>
      </template>
      <template #pager>
        <vxe-pager
          background
          v-model:current-page="page.current"
          v-model:page-size="page.size"
          :total="page.total"
          @page-change="handlePageChange"
        />
      </template>
      <template #ipport="{ row }"> {{ row.ip }}{{ row.port ? ':' + row.port : '' }} </template>
    </vxe-grid>
  </MyContent>
</template>
<script setup lang="ts">
  import AntVueCommon from '@/utils/MyCommon/AntVueCommon';
  import { ref, reactive, createVNode, nextTick, watch, onMounted } from 'vue';
  import { useDesign } from '@/hooks/web/useDesign';
  import { VxeGrid, VxeGridProps } from 'vxe-table';
  import {
    CirStatus as cirStatusApi,
    Line as lineApi,
    Station as stationApi,
    Lacci as lacciApi,
  } from '@/api/ddServcer';
  import { tryOnUnmounted } from '@vueuse/core';
  import zhCN from 'ant-design-vue/es/locale/zh_CN';
  import 'dayjs/locale/zh-cn';

  defineOptions({ name: 'DDServcerCirStatus' });
  const { prefixCls } = useDesign('DDServcerCirStatus-');
  const loading = ref(true);
  const tableConfig = reactive<VxeGridProps>({
    height: 'auto',
    columns: [
      //基础
      { type: 'seq', title: '序号', minWidth: 70, fixed: 'left' },
      {
        field: 'id',
        title: '记录ID',
        visible: false,
        showOverflow: true,
        showHeaderOverflow: true,
        minWidth: 130,
        fixed: 'left',
      },
      {
        field: 'lineName',
        title: '线路名称',
        showOverflow: true,
        showHeaderOverflow: true,
        visible: false,
        sortable: true,
        minWidth: 200,
        fixed: 'left',
      },
      {
        field: 'stationCode',
        title: '车站代码',
        showOverflow: true,
        showHeaderOverflow: true,
        visible: false,
        sortable: true,
        minWidth: 130,
        fixed: 'left',
      },
      {
        field: 'stationName',
        title: '车站名称',
        showOverflow: true,
        showHeaderOverflow: true,
        sortable: true,
        minWidth: 200,
        fixed: 'left',
      },
      {
        field: 'stationLocationName',
        title: '所在位置',
        showOverflow: true,
        showHeaderOverflow: true,
        sortable: true,
        minWidth: 100,
      },
      {
        field: 'lacciName',
        title: 'ECI名称',
        showOverflow: true,
        showHeaderOverflow: true,
        sortable: true,
        visible: false,
        minWidth: 100,
      },
      {
        field: 'lacci',
        title: 'ECI号码',
        showOverflow: true,
        showHeaderOverflow: true,
        sortable: true,
        minWidth: 100,
      },
      {
        field: 'isdn',
        title: 'ISDN',
        showOverflow: true,
        showHeaderOverflow: true,
        sortable: true,
        minWidth: 90,
      },
      {
        field: 'jcFn',
        title: '机车功能号',
        showOverflow: true,
        showHeaderOverflow: true,
        sortable: true,
        minWidth: 110,
      },
      {
        field: 'jCFnStatusName',
        title: '机车号状态',
        showOverflow: true,
        showHeaderOverflow: true,
        sortable: true,
        minWidth: 110,
      },
      {
        field: 'ccFn',
        title: '车次功能号',
        showOverflow: true,
        showHeaderOverflow: true,
        sortable: true,
        minWidth: 110,
      },
      {
        field: 'cCFnStatusName',
        title: '车次号状态',
        showOverflow: true,
        showHeaderOverflow: true,
        sortable: true,
        minWidth: 110,
      },
      {
        field: 'loginStatusName',
        title: '登录状态',
        showOverflow: true,
        showHeaderOverflow: true,
        sortable: true,
        minWidth: 100,
      },
      {
        field: 'glb',
        title: '公里标',
        showOverflow: true,
        showHeaderOverflow: true,
        sortable: true,
        visible: false,
        minWidth: 100,
      },
      {
        field: 'operatorUser',
        title: '操作员',
        showOverflow: true,
        showHeaderOverflow: true,
        sortable: true,
        visible: false,
        minWidth: 100,
      },
      {
        field: 'longitude',
        title: '经度',
        showOverflow: true,
        showHeaderOverflow: true,
        sortable: true,
        visible: false,
        minWidth: 80,
      },
      {
        field: 'latitude',
        title: '纬度',
        showOverflow: true,
        showHeaderOverflow: true,
        sortable: true,
        visible: false,
        minWidth: 80,
      },
      {
        field: 'ip',
        title: 'Ip+端口号',
        showOverflow: true,
        showHeaderOverflow: true,
        visible: false,
        slots: {
          default: 'ipport',
        },
        sortable: true,
        minWidth: 120,
      },
      {
        field: 'updateTime',
        title: '心跳时间',
        minWidth: 150,
        showOverflow: true,
        showHeaderOverflow: true,
        sortable: true,
      },
      // {
      //   title: '操作',
      //   width: 140,
      //   slots: {
      //     default: 'default',
      //   },
      //   showOverflow: true,
      //   showHeaderOverflow: true,
      //   fixed: 'right',
      // },
    ],
    toolbarConfig: {
      custom: true,
      slots: {
        buttons: 'toolbar_buttons',
      },
    },
    data: [],
  });
  const tableRef = ref({});
  const myContentRef = ref({});
  const timeValue = ref(null);
  const seacthContent = ref({
    lineCode: null,
    stationCode: null,
    laccis: [],
    isdn: null,
    jcFn: null,
    ccFn: null,
    JcFnStatus: null,
    CcFnStatus: null,
    LoginStatus: null,
    startTime: null,
    endTime: null,
  });
  const page = reactive({
    current: 1,
    size: 20,
    total: 0,
    sortlist: ['stationName asc'],
  });
  const refresh = ref('yes');
  const refreshTime = ref(10);
  let refreshTimeId;
  const lineDatas = ref([]);
  const stationDatas = ref([]);

  getStatus(true);
  getDDServerStationCodeSimple();
  getDDServerLineCodeSimple();

  //获取列表
  function getStatus(isAuto = false) {
    if (!isAuto) {
      refresh.value = 'no';
    }
    seacthContent.value.startTime =
      timeValue.value == null ? null : timeValue.value[0].format('YYYY-MM-DD HH:mm:ss');
    seacthContent.value.endTime =
      timeValue.value == null ? null : timeValue.value[1].format('YYYY-MM-DD HH:mm:ss');
    loading.value = true;
    cirStatusApi
      .GetDDCirStatus({
        PageIndex: page.current,
        PageSize: page.size,
        ...seacthContent.value,
        fullSort: getFullSort(),
        execompleteBefore: () => {
          loading.value = false;
        },
      })
      .then((data) => {
        tableConfig.data = data.source;
        page.total = data.totalCount;
        page.current = data.pageIndex;
        refreshData();
      })
      .catch(() => {
        tableConfig.data = [];
        page.total = 0;
        refreshData();
      });
  }

  //重置搜索条件
  function resetSeacth() {
    seacthContent.value = {
      lineCode: null,
      stationCode: null,
      laccis: [],
      isdn: null,
      jcFn: null,
      ccFn: null,
      JcFnStatus: null,
      CcFnStatus: null,
      LoginStatus: null,
      startTime: null,
      endTime: null,
    };
    timeValue.value = null;
  }

  function handlePageChange() {
    getStatus();
  }

  /**
   * 排序条件改变
   */
  function onSortChange({ field, order, sortList, column, property, $event }) {
    page.sortlist = [];
    sortList.forEach((item) => {
      var tempstr = item.field + ' ' + item.order;
      page.sortlist.push(tempstr);
    });
    getStatus(false);
  }
  /**
   * 获取排序条件
   */
  function getFullSort() {
    let fullsort = '';
    page.sortlist.forEach((item) => {
      fullsort += item + ',';
    });
    return fullsort.substring(0, fullsort.length - 1);
  }

  function refreshData() {
    if (refresh.value == 'yes') {
      refreshTimeId = setTimeout(() => {
        if (refreshTime.value <= 0) {
          refreshTime.value = 10;
          nextTick(() => {
            getStatus(true);
          });
        } else {
          refreshTime.value = refreshTime.value - 1;
          nextTick(() => {
            refreshData();
          });
        }
      }, 1000);
    }
  }

  function stopRefresh() {
    clearTimeout(refreshTimeId);
    refresh.value = 'no';
    refreshTime.value = 10;
  }

  function getDDServerStationCodeSimple() {
    stationApi.GetDDServerStationCodeSimple().then((data) => {
      stationDatas.value = data;
    });
  }

  function getDDServerLineCodeSimple() {
    lineApi.GetDDServerLineCodeSimple().then((data) => {
      lineDatas.value = data;
    });
  }

  function initPage() {
    page.current = 1;
    page.total = 0;
    getStatus();
  }

  watch(
    () => refresh.value,
    () => {
      if (refresh.value == 'yes') {
        refreshData();
      } else {
        stopRefresh();
      }
    },
  );

  //页面卸载后
  tryOnUnmounted(() => {
    stopRefresh();
  });
</script>
<style lang="less" scoped>
  @prefixCls: ~'@{namespace}-DDServcerCirStatus-';

  .tableBtn {
    width: 100%;
  }
</style>
