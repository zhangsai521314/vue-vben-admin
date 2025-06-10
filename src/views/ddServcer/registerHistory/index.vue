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
                    <label>{{ t('view.operationTime') }}：</label>
                    <a-config-provider
                      :locale="locale == 'fr-FR' ? frFR : locale == 'en-US' ? enUS : zhCN"
                    >
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
                    <label>{{ t('view.operationType') }}：</label>
                    <a-select
                      :placeholder="t('view.pleaseSelectOperationType')"
                      :style="{ width: locale == 'zh-CN' ? '170px' : '260px' }"
                      allow-clear
                      v-model:value="seacthContent.regType"
                    >
                      <a-select-option :value="224">{{ t('view.register') }}</a-select-option>
                      <a-select-option :value="225">{{ t('view.generalLogout') }}</a-select-option>
                      <a-select-option :value="226">{{ t('view.forcedLogout') }}</a-select-option>
                      <a-select-option :value="227">{{ t('view.timeoutLogout') }}</a-select-option>
                      <a-select-option :value="228">{{
                        t('view.allCancellation')
                      }}</a-select-option>
                    </a-select>
                  </a-space>
                </div>
                <div class="row-div">
                  <a-space direction="horizontal" size="small" :wrap="true">
                    <label>{{ t('view.functionNumber') }}：</label>
                    <a-input
                      @press-enter="initPage()"
                      v-model:value="seacthContent.fn"
                      :placeholder="t('view.inputFunctionNumberForQuery')"
                    />
                  </a-space>
                </div>
                <div class="row-div">
                  <a-space direction="horizontal" size="small" :wrap="true">
                    <label>ISDN：</label>
                    <a-input
                      @press-enter="initPage()"
                      v-model:value="seacthContent.isdn"
                      :placeholder="t('view.inputIsdnNumberForQuery')"
                    />
                  </a-space>
                </div>
                <div class="row-div">
                  <a-space direction="horizontal" size="small" :wrap="true">
                    <label>{{ t('view.functionNumberType') }}：</label>
                    <a-select
                      :placeholder="t('view.pleaseSelectFunctionNumberType')"
                      :style="{
                        width: locale == 'zh-CN' ? '170px' : locale == 'en-US' ? '250px' : '330px',
                      }"
                      allow-clear
                      v-model:value="seacthContent.fnType"
                    >
                      <a-select-option :value="2">{{
                        t('view.trainFunctionNumber')
                      }}</a-select-option>
                      <a-select-option :value="3">{{
                        t('view.engineFunctionNum')
                      }}</a-select-option>
                      <a-select-option :value="4">{{
                        t('view.carNumberFunctionNumber')
                      }}</a-select-option>
                      <a-select-option :value="6">{{
                        t('view.shuntingTeamFunctionNumber')
                      }}</a-select-option>
                      <a-select-option :value="91">{{
                        t('view.dispatchingFunctionNumber')
                      }}</a-select-option>
                    </a-select>
                  </a-space>
                </div>
                <div class="row-div">
                  <a-space direction="horizontal" size="small" :wrap="true">
                    <label>{{ t('view.operationResult') }}：</label>
                    <a-select
                      :placeholder="t('view.pleaseSelectOperationResult')"
                      style="width: 120px"
                      allow-clear
                      v-model:value="seacthContent.regResult"
                    >
                      <a-select-option :value="0">{{ t('view.success') }}</a-select-option>
                      <a-select-option :value="1">{{ t('view.failure') }}</a-select-option>
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
      <template #regResult="{ row }">
        <span :style="{ color: row.regResult == 0 ? 'green' : 'red' }">
          {{ row.regResult == 0 ? t('view.success') : t('view.failure', [`(${row.regResult})`]) }}
        </span>
      </template>

      <template #regType="{ row }">
        {{
          row.regType == 224
            ? t('view.register')
            : row.regType == 225
              ? t('view.generalLogout')
              : row.regType == 226
                ? t('view.forcedLogout')
                : row.regType == 227
                  ? t('view.timeoutLogout')
                  : row.regType == 228
                    ? t('view.allCancellation')
                    : row.regType
        }}
      </template>
      <template #fnType="{ row }">
        {{
          row.fnType == 2
            ? t('view.trainFunctionNumber')
            : row.fnType == 3
              ? t('view.engineFunctionNum')
              : row.fnType == 4
                ? t('view.carNumberFunctionNumber')
                : row.fnType == 6
                  ? t('view.shuntingTeamFunctionNumber')
                  : row.fnType == 91
                    ? t('view.dispatchingFunctionNumber')
                    : row.fnType
        }}
      </template>
    </vxe-grid>
  </MyContent>
</template>
<script setup lang="ts">
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
  import enUS from 'ant-design-vue/es/locale/en_US';
  import frFR from 'ant-design-vue/es/locale/fr_FR';
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
    showOverflow: true,
    showHeaderOverflow: true,
    height: 'auto',
    columns: [
      //基础
      {
        field: 'seq_',
        type: 'seq',
        title: t('view.serialNumber'),
        minWidth: locale == 'zh-CN' ? 70 : 160,
        fixed: 'left',
      },
      {
        field: 'id',
        title: t('view.recordId'),
        sortable: true,
        visible: false,
        showOverflow: true,
        fixed: 'left',
        minWidth: locale == 'zh-CN' ? 130 : 150,
      },
      {
        field: 'regType',
        title: t('view.operationType'),
        showOverflow: true,
        sortable: true,
        minWidth: locale == 'zh-CN' ? 110 : 210,
        slots: {
          default: 'regType',
        },
      },
      {
        field: 'fn',
        title: t('view.functionNumber'),
        showOverflow: true,
        sortable: true,
        minWidth: locale == 'zh-CN' ? 100 : 160,
      },
      {
        field: 'fnType',
        title: t('view.functionNumberType'),
        showOverflow: true,
        sortable: true,
        minWidth: locale == 'zh-CN' ? 100 : 220,
        slots: {
          default: 'fnType',
        },
      },
      {
        field: 'isdn',
        title: t('view.isdnNumber'),
        showOverflow: true,
        sortable: true,
        minWidth: locale == 'zh-CN' ? 100 : 120,
      },
      {
        field: 'regResult',
        title: t('view.operationResult'),
        showOverflow: true,
        slots: {
          default: 'regResult',
        },
        sortable: true,
        minWidth: locale == 'zh-CN' ? 100 : 170,
      },
      {
        field: 'regTime',
        title: t('view.operationTime'),
        minWidth: 150,
        showOverflow: true,

        sortable: true,
      },
      // {
      // field: 'action_',
      //   title: t('view.action'),
      //   width: 140,
      //   slots: {
      //     default: 'default',
      //   },
      //   showOverflow: true,
      //
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
    dayjs(dayjs().subtract(0, 'day').format('YYYY-MM-DD')),
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
  const refresh = ref('no');
  const refreshTime = ref(10);
  let refreshTimeId;

  getStatus(true);

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
      dayjs(dayjs().subtract(0, 'day').format('YYYY-MM-DD')),
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
