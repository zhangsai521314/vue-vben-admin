<template>
  <MyContent ref="myContentRef">
    <vxe-grid
      :scroll-y="{ enabled: true }"
      v-bind="tableConfig"
      id="ddServcerRegisterHistory"
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
            <AuthDom auth="ddServcer_registerHistory_query">
              <a-space direction="horizontal" size="small" :wrap="true" style="margin-bottom: 0">
                <div class="row-div">
                  <a-space direction="horizontal" size="small" :wrap="true">
                    <label>操作时间：</label>
                    <a-config-provider :locale="zhCN">
                      <a-range-picker
                        :allowClear="false"
                        v-model:value="timeValue"
                        :showTime="true"
                        format="YYYY-MM-DD HH:mm:ss"
                      />
                    </a-config-provider>
                  </a-space>
                </div>
                <div class="row-div">
                  <a-space direction="horizontal" size="small" :wrap="true">
                    <label>功能号类型：</label>
                    <a-select
                      placeholder="请选择功能号类型"
                      style="width: 170px"
                      allow-clear
                      v-model:value="seacthContent.regType"
                    >
                      <a-select-option :value="91">调度功能号</a-select-option>
                      <a-select-option :value="2">机车功能号</a-select-option>
                      <a-select-option :value="3">车次功能号</a-select-option>
                    </a-select>
                  </a-space>
                </div>
                <div class="row-div">
                  <a-space direction="horizontal" size="small" :wrap="true">
                    <label>功能号：</label>
                    <a-input
                      @press-enter="initPage()"
                      v-model:value="seacthContent.fn"
                      placeholder="输入功能号查询"
                    />
                  </a-space>
                </div>
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
                    <label>操作类型：</label>
                    <a-select
                      placeholder="请选择操作类型"
                      style="width: 170px"
                      allow-clear
                      v-model:value="seacthContent.fnType"
                    >
                      <a-select-option :value="224">注册</a-select-option>
                      <a-select-option :value="225">手动注销</a-select-option>
                      <a-select-option :value="226">强制注销</a-select-option>
                      <a-select-option :value="227">超时注销</a-select-option>
                      <a-select-option :value="228">全部注销</a-select-option>
                    </a-select>
                  </a-space>
                </div>
                <div class="row-div">
                  <a-space direction="horizontal" size="small" :wrap="true">
                    <label>操作结果：</label>
                    <a-select
                      placeholder="请选择操作结果"
                      style="width: 170px"
                      allow-clear
                      v-model:value="seacthContent.regResult"
                    >
                      <a-select-option :value="0">成功</a-select-option>
                      <a-select-option :value="1">失败</a-select-option>
                    </a-select>
                  </a-space>
                </div>
                <div class="row-div">
                  <a-space direction="horizontal" size="small" :wrap="true">
                    <a-button @click="initPage()" type="primary">{{ t('view.query') }}</a-button>
                    <a-button @click="resetSeacth">{{ t('view.resetForm') }}</a-button>
                    <a-radio-group v-model:value="refresh" button-style="solid">
                      <a-radio-button value="yes">{{ t('view.enableAutoRefresh') }}</a-radio-button>
                      <a-radio-button value="no">{{ t('view.disableAutoRefresh') }}</a-radio-button>
                      <a-radio-button>{{
                        t('view.countdownSeconds', [refreshTime])
                      }}</a-radio-button>
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
      <template #fnTypeName="{ row }">
        {{ row.fnTypeName == 'success' ? '成功' : `失败(${row.result})` }}
      </template>
    </vxe-grid>
  </MyContent>
</template>
<script setup lang="ts">
  import AntVueCommon from '@/utils/MyCommon/AntVueCommon';
  import { ref, reactive, createVNode, nextTick, watch, onMounted } from 'vue';
  import { useDesign } from '@/hooks/web/useDesign';
  import { VxeGrid, VxeGridProps } from 'vxe-table';
  import {
    RegisterHistory as registerHistoryApi,
    Line as lineApi,
    Station as stationApi,
  } from '@/api/ddServcer';
  import { tryOnUnmounted } from '@vueuse/core';
  import zhCN from 'ant-design-vue/es/locale/zh_CN';
  import dayjs from 'dayjs';
  import 'dayjs/locale/zh-cn';
  import { useI18n } from '@/hooks/web/useI18n';
  import { useLocaleStore } from '@/store/modules/locale';

  const { t } = useI18n();
  const localeStore = useLocaleStore();
  const locale = localeStore.getLocale;
  defineOptions({ name: 'DDServcerRegisterHistory' });
  const { prefixCls } = useDesign('DDServcerRegisterHistory-');
  const loading = ref(true);
  const tableConfig = reactive<VxeGridProps>({
    height: 'auto',
    columns: [
      //基础
      {
        type: 'seq',
        title: t('view.serialNumber'),
        minWidth: locale == 'en-US' ? 110 : 70,
        fixed: 'left',
      },
      {
        field: 'id',
        title: t('view.recordId'),
        visible: false,
        showOverflow: true,
        showHeaderOverflow: true,
        fixed: 'left',
        minWidth: 130,
      },
      {
        field: 'regTypeName',
        title: '功能号类型',
        showOverflow: true,
        showHeaderOverflow: true,
        sortable: true,
        fixed: 'left',
        minWidth: 110,
      },
      {
        field: 'fn',
        title: '功能号',
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
        minWidth: 100,
      },
      {
        field: 'fnTypeName',
        title: '操作类型',
        showOverflow: true,
        showHeaderOverflow: true,
        sortable: true,
        minWidth: 100,
        slots: {
          default: 'fnTypeName',
        },
      },
      {
        field: 'regResultName',
        title: '操作结果',
        showOverflow: true,
        showHeaderOverflow: true,
        sortable: true,
        minWidth: 100,
      },
      {
        field: 'regTime',
        title: '操作时间',
        minWidth: 150,
        showOverflow: true,
        showHeaderOverflow: true,
        sortable: true,
      },
      // {
      //   title: t('view.action'),
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
  const timeValue = ref([
    dayjs(dayjs().subtract(7, 'day').format('YYYY-MM-DD')),
    dayjs(dayjs().add(1, 'day').format('YYYY-MM-DD')),
  ]);
  const seacthContent = ref({
    isdn: null,
    fn: null,
    fnType: null,
    regType: null,
    regResult: null,
    startTime: null,
    endTime: null,
  });
  const page = reactive({
    current: 1,
    size: 20,
    total: 0,
    sortlist: ['regTime desc'],
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
    registerHistoryApi
      .GetDDServerRegisterHistorys({
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

  function initPage() {
    page.current = 1;
    page.total = 0;
    getStatus();
  }

  //重置搜索条件
  function resetSeacth() {
    seacthContent.value = {
      isdn: null,
      fn: null,
      fnType: null,
      regType: null,
      regResult: null,
      startTime: null,
      endTime: null,
    };
    timeValue.value = [
      dayjs(dayjs().subtract(7, 'day').format('YYYY-MM-DD')),
      dayjs(dayjs().add(1, 'day').format('YYYY-MM-DD')),
    ];
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
  @prefixCls: ~'@{namespace}-DDServcerRegisterHistory-';

  .tableBtn {
    width: 100%;
  }
</style>
