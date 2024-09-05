<template>
  <MyContent ref="myContentRef">
    <vxe-grid
      :scroll-y="{ enabled: true }"
      v-bind="tableConfig"
      id="mytable"
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
            <AuthDom auth="ddServcer_mobileStatus_query">
              <a-space direction="horizontal" size="small" :wrap="true" style="margin-bottom: 0">
                <div class="row-div">
                  <a-space direction="horizontal" size="small" :wrap="true">
                    <label>车站名称：</label>
                    <a-select
                      placeholder="请选择车站名称"
                      style="width: 170px"
                      allow-clear
                      show-search
                      :filter-option="AntVueCommon.filterOption"
                      v-model:value="seacthContent.stationId"
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
      <template #ipport="{ row }"> {{ row.ip }}{{ row.port ? '+' + row.port : '' }} </template>
    </vxe-grid>
  </MyContent>
</template>
<script setup lang="ts">
  import AntVueCommon from '@/utils/MyCommon/AntVueCommon';
  import { ref, reactive, createVNode, nextTick, watch, onMounted } from 'vue';
  import { useDesign } from '@/hooks/web/useDesign';
  import { VxeGrid, VxeGridProps } from 'vxe-table';
  import {
    MobileStatus as mobileStatusApi,
    Line as lineApi,
    Station as stationApi,
    Lacci as lacciApi,
  } from '@/api/ddServcer';
  import { tryOnUnmounted } from '@vueuse/core';

  defineOptions({ name: 'DDServcerMobileStatus' });
  const { prefixCls } = useDesign('DDServcerMobileStatus-');
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
        fixed: 'left',
        minWidth: 130,
      },
      {
        field: 'lineName',
        title: '线路名称',
        showOverflow: true,
        showHeaderOverflow: true,
        visible: false,
        sortable: true,
        fixed: 'left',
        minWidth: 200,
      },
      {
        field: 'stationName',
        title: '车站名称',
        showOverflow: true,
        showHeaderOverflow: true,
        sortable: true,
        fixed: 'left',
        minWidth: 200,
      },
      {
        field: 'isdn',
        title: 'ISDN',
        showOverflow: true,
        showHeaderOverflow: true,
        sortable: true,
        minWidth: 100,
      },
      {
        field: 'typeName',
        title: '手持台类型',
        showOverflow: true,
        showHeaderOverflow: true,
        sortable: true,
        minWidth: 130,
      },
      {
        field: 'lacci',
        title: 'ECI号',
        showOverflow: true,
        showHeaderOverflow: true,
        sortable: true,
        minWidth: 130,
      },
      {
        field: 'lacciName',
        title: 'ECI名称',
        showOverflow: true,
        showHeaderOverflow: true,
        sortable: true,
        minWidth: 130,
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
        field: 'longitude',
        title: '经度',
        showOverflow: true,
        showHeaderOverflow: true,
        sortable: true,
        minWidth: 100,
      },
      {
        field: 'latitude',
        title: '纬度',
        showOverflow: true,
        showHeaderOverflow: true,
        sortable: true,
        minWidth: 100,
      },
      {
        field: 'ip',
        title: 'Ip+端口号',
        showOverflow: true,
        showHeaderOverflow: true,
        minWidth: 154,
        slots: {
          default: 'ipport',
        },
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
  const seacthContent = ref({
    lineCode: null,
    stationId: null,
    laccis: [],
    isdn: null,
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
  getDDServerStationSimple();
  getDDServerLineCodeSimple();

  //获取列表
  function getStatus(isAuto = false) {
    if (!isAuto) {
      refresh.value = 'no';
    }
    loading.value = true;
    mobileStatusApi
      .GetDDServerMobileStatus({
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
        refreshData();
      })
      .catch(() => {
        tableConfig.data = [];
        page.total = 0;
        refreshData();
      });
  }

  function initPage() {
    page.current = 1;
    page.total = 0;
    getStatus();
  }

  //重置搜索条件
  function resetSeacth() {
    seacthContent.value = {
      lineCode: null,
      stationId: null,
      laccis: [],
      isdn: null,
    };
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

  function getDDServerStationSimple() {
    stationApi.GetDDServerStationSimple().then((data) => {
      stationDatas.value = data;
    });
  }

  function getDDServerLineCodeSimple() {
    lineApi.GetDDServerLineCodeSimple().then((data) => {
      lineDatas.value = data;
    });
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
  @prefixCls: ~'@{namespace}-DDServcerMobileStatus-';

  .tableBtn {
    width: 100%;
  }
</style>
