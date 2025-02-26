<template>
  <MyContent ref="myContentRef">
    <vxe-grid
      :scroll-y="{ enabled: true }"
      v-bind="tableConfig"
      :auto-resize="true"
      id="ddServcerAddressingHis"
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
            <AuthDom auth="ddServcer_addressingHis_query">
              <a-space direction="horizontal" size="small" :wrap="true" style="margin-bottom: 0">
                <div class="row-div">
                  <a-space direction="horizontal" size="small" :wrap="true">
                    <label>{{ t('view.addressingTime') }}：</label>
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
                    <label>{{ t('view.addressingType') }}：</label>
                    <a-select
                      :placeholder="t('view.pleaseSelectAddressingType')"
                      style="width: 170px"
                      allow-clear
                      v-model:value="seacthContent.dataType"
                    >
                      <a-select-option :value="226">{{ t('view.shortNumber') }}</a-select-option>
                      <a-select-option :value="224">{{
                        t('view.trainFunctionNumber')
                      }}</a-select-option>
                      <a-select-option :value="225">{{
                        t('view.engineFunctionNum')
                      }}</a-select-option>
                      <a-select-option :value="241">{{
                        t('view.intraStationGroupCall')
                      }}</a-select-option>
                      <a-select-option :value="242">{{
                        t('view.neighborStationGroupCall')
                      }}</a-select-option>
                      <a-select-option :value="243">{{
                        t('view.emergencyGroupCall')
                      }}</a-select-option>
                    </a-select>
                  </a-space>
                </div>
                <div class="row-div">
                  <a-space direction="horizontal" size="small" :wrap="true">
                    <label>{{ t('view.callingFunctionNumber') }}：</label>
                    <a-input
                      @press-enter="initPage()"
                      v-model:value="seacthContent.srcFn"
                      :placeholder="t('view.inputCallingFunctionNumberForQuery')"
                    />
                  </a-space>
                </div>
                <div class="row-div">
                  <a-space direction="horizontal" size="small" :wrap="true">
                    <label>{{ t('view.callingIsdn') }}：</label>
                    <a-input
                      @press-enter="initPage()"
                      v-model:value="seacthContent.srcIsdn"
                      :placeholder="t('view.inputCallingISDNQuery')"
                    />
                  </a-space>
                </div>
                <div class="row-div">
                  <a-space direction="horizontal" size="small" :wrap="true">
                    <label>{{ t('view.addressingResult') }}：</label>
                    <a-select
                      :placeholder="t('view.pleaseSelectAddressingResult')"
                      style="width: 170px"
                      allow-clear
                      v-model:value="seacthContent.result"
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
      <template #desFn="{ row }"> {{ row.desFn ? row.desFn : '-' }} </template>
      <template #result="{ row }">
        {{ row.result == 0 ? t('view.success') : t('view.failure', [`(${row.result})`]) }}
      </template>
      <template #type="{ row }">
        {{
          row.type == 1
            ? t('view.shortNumberAddressing')
            : row.type == 2
              ? t('view.trainNumberAddressing')
              : row.type == 3
                ? t('view.locomotiveNumberAddressing')
                : row.type == 4
                  ? t('view.wagonNumberAddressing')
                  : row.type == 6
                    ? t('view.shuntingTeamAddressing')
                    : row.type == 91
                      ? t('view.dispatchAddressing')
                      : row.type
        }}
      </template>
    </vxe-grid>
  </MyContent>
</template>
<script setup lang="ts">
  import { ref, reactive, nextTick, watch } from 'vue';
  import { useDesign } from '@/hooks/web/useDesign';
  import { VxeGrid, VxeGridProps } from 'vxe-table';
  import { AddressingHis as addressingHisApi } from '@/api/ddServcer';
  import { tryOnUnmounted } from '@vueuse/core';
  import zhCN from 'ant-design-vue/es/locale/zh_CN';
  import dayjs from 'dayjs';
  import 'dayjs/locale/zh-cn';
  import { useI18n } from '@/hooks/web/useI18n';
  import { useLocaleStore } from '@/store/modules/locale';

  const { t } = useI18n();
  const localeStore = useLocaleStore();
  const locale = localeStore.getLocale;
  defineOptions({ name: 'DDServcerAddressingHis' });
  const { prefixCls } = useDesign('DDServcerAddressingHis-');
  const loading = ref(true);
  const tableConfig = reactive<VxeGridProps>({
    height: 'auto',
    columns: [
      //基础
      {
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
        minWidth: locale == 'zh-CN' ? 130 : 150,
        fixed: 'left',
      },
      {
        field: 'type',
        title: t('view.addressingType'),
        showOverflow: true,
        sortable: true,
        minWidth: 160,
        slots: {
          default: 'type',
        },
      },
      {
        field: 'srcFn',
        title: t('view.callingFunctionNumber'),
        showOverflow: true,
        sortable: true,
        minWidth: locale == 'zh-CN' ? 120 : 220,
      },
      {
        field: 'srcIsdn',
        title: t('view.callingIsdn'),
        showOverflow: true,
        sortable: true,
        minWidth: 130,
      },
      {
        field: 'srcLacci',
        title: t('view.callingEci'),
        showOverflow: true,
        sortable: true,
        minWidth: locale == 'zh-CN' ? 100 : 120,
      },
      {
        field: 'desFn',
        title: t('view.calledFunctionNumberShortNumber'),
        showOverflow: true,
        sortable: true,
        slots: {
          default: 'desFn',
        },
        minWidth: locale == 'zh-CN' ? 150 : 310,
      },
      {
        field: 'desIsdn',
        title: t('view.calledIsdnGroupCallNumber'),
        sortable: true,
        minWidth: locale == 'zh-CN' ? 150 : 298,
      },
      {
        field: 'result',
        title: t('view.addressingResult'),
        showOverflow: true,
        sortable: true,
        minWidth: locale == 'zh-CN' ? 120 : 180,
        slots: {
          default: 'result',
        },
      },
      {
        field: 'addTime',
        title: t('view.addressingTime'),
        showOverflow: true,
        sortable: true,
        minWidth: 156,
      },
      // {
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
    dayjs(dayjs().subtract(7, 'day').format('YYYY-MM-DD')),
    dayjs(dayjs().add(1, 'day').format('YYYY-MM-DD')),
  ]);
  const seacthContent = ref({
    dataType: null,
    srcFn: null,
    startTime: null,
    endTime: null,
    result: null,
    srcIsdn: null,
  });
  const page = reactive({
    current: 1,
    size: 20,
    total: 0,
    sortlist: ['addTime desc'],
  });
  const refresh = ref('yes');
  const refreshTime = ref(10);
  let refreshTimeId;

  getDDAddressingHis(true);

  //获取列表
  function getDDAddressingHis(isAuto = false) {
    if (!isAuto) {
      refresh.value = 'no';
    }
    seacthContent.value.startTime =
      timeValue.value == null ? null : timeValue.value[0].format('YYYY-MM-DD HH:mm:ss');
    seacthContent.value.endTime =
      timeValue.value == null ? null : timeValue.value[1].format('YYYY-MM-DD HH:mm:ss');
    loading.value = true;
    addressingHisApi
      .GetDDAddressingHis({
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
      dataType: null,
      srcFn: null,
      startTime: null,
      endTime: null,
      result: null,
    };
    timeValue.value = [
      dayjs(dayjs().subtract(7, 'day').format('YYYY-MM-DD')),
      dayjs(dayjs().add(1, 'day').format('YYYY-MM-DD')),
    ];
  }

  function handlePageChange() {
    getDDAddressingHis();
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
    getDDAddressingHis(false);
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
            getDDAddressingHis(true);
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

  function initPage() {
    page.current = 1;
    page.total = 0;
    getDDAddressingHis();
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
  @prefixCls: ~'@{namespace}-DDServcerAddressingHis-';

  .tableBtn {
    width: 100%;
  }
</style>
