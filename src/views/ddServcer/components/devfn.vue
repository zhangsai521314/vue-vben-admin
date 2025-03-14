<template>
  <vxe-grid
    :scroll-y="{ enabled: true }"
    v-bind="tableConfig"
    id="DDServcerComponentsDevFn"
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
                      :allowClear="true"
                      v-model:value="timeValue"
                      :showTime="true"
                      format="YYYY-MM-DD HH:mm:ss"
                    />
                  </a-config-provider>
                </a-space>
              </div>
              <div class="row-div">
                <a-space direction="horizontal" size="small" :wrap="true">
                  <label>{{ t('view.functionNumber') }}：</label>
                  <a-input
                    @press-enter="initPage()"
                    v-model:value="seacthContent.fnNumber"
                    :placeholder="t('view.inputFunctionNumberForQuery')"
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
                    <a-select-option :value="3">{{ t('view.engineFunctionNum') }}</a-select-option>
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
                  <a-button @click="initPage()" type="primary">{{ t('view.query') }}</a-button>
                  <a-button @click="resetSeacth">{{ t('view.resetForm') }}</a-button>
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
    <template #typeD="{ row }">
      {{
        row.typeD == 1
          ? t('view.cabRadio')
          : row.typeD == 2
            ? t('view.handheldTerminal')
            : row.typeD == 3
              ? t('view.stationDutyDesk')
              : row.typeD
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
</template>
<script setup lang="ts">
  import { ref, reactive, watch } from 'vue';
  import { VxeGrid, VxeGridProps } from 'vxe-table';
  import { DDDev as DDDevApi } from '@/api/ddServcer';
  import zhCN from 'ant-design-vue/es/locale/zh_CN';
  import enUS from 'ant-design-vue/es/locale/en_US';
  import frFR from 'ant-design-vue/es/locale/fr_FR';
  import dayjs from 'dayjs';
  import 'dayjs/locale/zh-cn';
  import { useI18n } from '@/hooks/web/useI18n';
  import { useLocaleStore } from '@/store/modules/locale';
  import { tryOnUnmounted } from '@vueuse/core';

  const { t } = useI18n();
  const localeStore = useLocaleStore();
  const locale = localeStore.getLocale;
  defineOptions({ name: 'DDServcerComponentsDevFn' });
  //vue3使用defineProps接收传过来的参数
  const props = defineProps({
    isdn: {
      type: String,
      default() {
        return null;
      },
    },
    deviceType: {
      type: String,
      default() {
        return null;
      },
    },
    time: {
      type: String,
      default() {
        return null;
      },
    },
  });
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
        field: 'lineName',
        title: t('view.lineName'),
        showOverflow: true,
        visible: false,
        sortable: true,
        minWidth: 200,
        fixed: 'left',
      },
      {
        field: 'stationCode',
        title: t('view.stationCode'),
        showOverflow: true,
        visible: false,
        sortable: true,
        minWidth: locale == 'zh-CN' ? 130 : 140,
        fixed: 'left',
      },
      {
        field: 'stationName',
        title: t('view.stationName'),
        showOverflow: true,
        sortable: true,
        minWidth: 200,
        fixed: 'left',
        visible: false,
      },
      {
        field: 'typeD',
        title: t('view.deviceType'),
        showOverflow: true,
        sortable: true,
        minWidth: locale == 'zh-CN' ? 100 : 160,
        slots: {
          default: 'typeD',
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
        minWidth: 100,
      },
      {
        field: 'addTime',
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
  const timeValue = ref(null);
  const seacthContent = ref({
    isdn: null,
    fnNumber: null,
    fnType: null,
    deviceType: null,
    startTime: null,
    endTime: null,
  });
  const page = reactive({
    current: 1,
    size: 20,
    total: 0,
    sortlist: [],
  });

  //获取列表
  function getDevFnList() {
    seacthContent.value.isdn = props.isdn;
    seacthContent.value.deviceType = props.deviceType;
    seacthContent.value.startTime =
      timeValue.value == null ? null : timeValue.value[0].format('YYYY-MM-DD HH:mm:ss');
    seacthContent.value.endTime =
      timeValue.value == null ? null : timeValue.value[1].format('YYYY-MM-DD HH:mm:ss');
    loading.value = true;
    DDDevApi.GetDevFnList({
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
      })
      .catch(() => {
        tableConfig.data = [];
        page.total = 0;
      });
  }

  function initPage() {
    page.current = 1;
    page.total = 0;
    getDevFnList();
  }

  //重置搜索条件
  function resetSeacth() {
    seacthContent.value = {
      isdn: null,
      fnNumber: null,
      fnType: null,
      deviceType: null,
      startTime: null,
      endTime: null,
    };
    timeValue.value = null;
  }

  function handlePageChange() {
    getDevFnList();
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
    getDevFnList(false);
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

  watch(
    () => props,
    () => {
      tableConfig.data = [];
      getDevFnList();
    },
    { deep: true, immediate: true },
  );
</script>
<style lang="less" scoped>
  .tableBtn {
    width: 100%;
  }
</style>
