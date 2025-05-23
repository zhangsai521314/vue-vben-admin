<template>
  <MyContent ref="myContentRef">
    <vxe-grid
      :scroll-y="{ enabled: true }"
      v-bind="tableConfig"
      id="ddServcerCirStatus"
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
                    <label>{{ t('view.heartbeatTime') }}：</label>
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
                    <label>{{ t('view.stationName') }}：</label>
                    <a-select
                      :placeholder="t('view.pleaseSelectStationName')"
                      style="width: 170px"
                      allow-clear
                      show-search
                      :filter-option="AntVueCommon.filterOption"
                      v-model:value="seacthContent.stationId"
                      :options="stationDatas"
                    />
                  </a-space>
                </div>
                <div class="row-div">
                  <a-space direction="horizontal" size="small" :wrap="true">
                    <label>{{ t('view.isdnNumber') }}：</label>
                    <a-input
                      @press-enter="initPage()"
                      v-model:value="seacthContent.isdn"
                      :placeholder="t('view.inputIsdnNumberForQuery')"
                    />
                  </a-space>
                </div>
                <div class="row-div">
                  <a-space direction="horizontal" size="small" :wrap="true">
                    <label>{{ t('view.onlineStatus') }}：</label>
                    <a-select
                      :placeholder="t('view.pleaseSelectTheOnlineStatus')"
                      style="width: 170px"
                      allow-clear
                      v-model:value="seacthContent.LoginStatus"
                    >
                      <a-select-option :value="1">{{ t('view.online') }}</a-select-option>
                      <a-select-option :value="0">{{ t('view.offline') }}</a-select-option>
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
      <template #default="{ row }">
        <div :class="`tableOption`">
          <AuthDom auth="cirStatus_table_show">
            <IconFontClass
              name="icon-baseui-show"
              @click="showFn(row)"
              style="color: #0fc10e"
              :title="t('view.bindingDetails')"
            />
          </AuthDom>
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
      <template #loginStatus="{ row }">
        <span
          :style="{
            color: row.loginStatus == 1 ? 'green' : 'red',
          }"
          >{{ row.loginStatus == 1 ? t('view.online') : t('view.offline') }}</span
        >
      </template>
      <template #stationLocation="{ row }">
        {{
          row.stationLocation == 1
            ? t('view.inStation')
            : row.stationLocation == 2
              ? t('view.leftSideOfThisStation')
              : row.stationLocation == 3
                ? t('view.rightSideOfThisStation')
                : row.stationLocation
        }}
      </template>
    </vxe-grid>
    <a-drawer
      :headerStyle="{ height: '49px', borderBottom: '2px solid #eee' }"
      :width="locale == 'zh-CN' ? 900 : 1000"
      :visible="isShowDevFn"
      :title="t('view.bindingDetails')"
      :footer-style="{ textAlign: 'right' }"
      @close="devFnClose"
    >
      <devfn :isdn="newRow.isdn" deviceType="1" :time="dayjs()" />
      <template #footer>
        <a-button style="margin-left: 8px" @click="devFnClose">{{ t('view.close') }}</a-button>
      </template>
    </a-drawer>
  </MyContent>
</template>
<script setup lang="ts">
  import AntVueCommon from '@/utils/MyCommon/AntVueCommon';
  import { ref, reactive, nextTick, watch } from 'vue';
  import { useDesign } from '@/hooks/web/useDesign';
  import { VxeGrid, VxeGridProps } from 'vxe-table';
  import { DDDev as cirStatusApi, Line as lineApi, Station as stationApi } from '@/api/ddServcer';
  import { tryOnUnmounted } from '@vueuse/core';
  import zhCN from 'ant-design-vue/es/locale/zh_CN';
  import enUS from 'ant-design-vue/es/locale/en_US';
  import frFR from 'ant-design-vue/es/locale/fr_FR';
  import dayjs from 'dayjs';
  import 'dayjs/locale/zh-cn';
  import { useI18n } from '@/hooks/web/useI18n';
  import { useLocaleStore } from '@/store/modules/locale';
  import devfn from '../components/devfn.vue';

  const { t } = useI18n();
  const localeStore = useLocaleStore();
  const locale = localeStore.getLocale;
  defineOptions({ name: 'DDServcerCirStatus' });
  const { prefixCls } = useDesign('DDServcerCirStatus-');
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
        minWidth: locale == 'zh-CN' ? 130 : 150,
        fixed: 'left',
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
      },
      {
        field: 'stationLocation',
        title: t('view.currentLocation'),
        showOverflow: true,
        sortable: true,
        minWidth: locale == 'zh-CN' ? 100 : 150,
        slots: {
          default: 'stationLocation',
        },
      },
      {
        field: 'lacci',
        title: t('view.eciNumber'),
        showOverflow: true,
        sortable: true,
        minWidth: locale == 'zh-CN' ? 100 : 140,
      },
      {
        field: 'isdn',
        title: 'ISDN',
        showOverflow: true,
        sortable: true,
        minWidth: 90,
      },
      {
        field: 'glb',
        title: t('view.kilometerMarker'),
        showOverflow: true,
        sortable: true,
        visible: false,
        minWidth: locale == 'zh-CN' ? 100 : 176,
      },
      {
        field: 'operatorUser',
        title: t('view.operator'),
        showOverflow: true,
        sortable: true,
        visible: false,
        minWidth: locale == 'zh-CN' ? 100 : 110,
      },
      {
        field: 'longitude',
        title: t('view.longitude'),
        showOverflow: true,
        sortable: true,
        visible: false,
        minWidth: locale == 'zh-CN' ? 80 : 110,
      },
      {
        field: 'latitude',
        title: t('view.latitude'),
        showOverflow: true,
        sortable: true,
        visible: false,
        minWidth: locale == 'zh-CN' ? 80 : 100,
      },
      {
        field: 'ip',
        title: t('view.ipAndPortNumber'),
        showOverflow: true,
        visible: false,
        slots: {
          default: 'ipport',
        },
        sortable: true,
        minWidth: locale == 'zh-CN' ? 120 : 170,
      },
      {
        field: 'loginStatus',
        title: t('view.onlineStatus'),
        showOverflow: true,
        sortable: true,
        minWidth: locale == 'zh-CN' ? 100 : 150,
        slots: {
          default: 'loginStatus',
        },
      },
      {
        field: 'loginTime',
        title: t('view.loginTime'),
        showOverflow: true,
        sortable: true,
        minWidth: locale == 'zh-CN' ? 150 : 170,
      },
      {
        field: 'updateTime',
        title: t('view.heartbeatTime'),
        minWidth: locale == 'zh-CN' ? 150 : 220,
        showOverflow: true,
        sortable: true,
      },
      {
        field: 'action_',
        title: t('view.action'),
        width: 100,
        slots: {
          default: 'default',
        },
        showOverflow: true,
        fixed: 'right',
      },
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
    lineCode: null,
    stationId: null,
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
    sortlist: ['updateTime desc'],
  });
  const refresh = ref('yes');
  const refreshTime = ref(10);
  let refreshTimeId;
  const lineDatas = ref([]);
  const stationDatas = ref([]);
  const newRow = ref(null);
  const isShowDevFn = ref(false);

  getStatus(true);
  getDDServerStationSimple();
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
      stationId: null,
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

  function showFn(row) {
    newRow.value = row;
    isShowDevFn.value = true;
  }

  function devFnClose() {
    isShowDevFn.value = false;
  }
</script>
<style lang="less" scoped>
  @prefixCls: ~'@{namespace}-DDServcerCirStatus-';

  .tableBtn {
    width: 100%;
  }
</style>
