<template>
  <MyContent>
    <a-spin :spinning="isRunLoading">
      <vxe-grid
        :scroll-y="{ enabled: true }"
        v-bind="tableConfig"
        id="viewLog"
        :auto-resize="true"
        ref="tableRef"
        :loading="loading"
        :row-config="{ keyField: 'id' }"
        :column-config="{ resizable: true }"
        :custom-config="{ storage: true }"
        @sort-change="onSortChange"
        :seq-config="{ startIndex: (page.current - 1) * page.size }"
      >
        <template #pager>
          <vxe-pager
            background
            v-model:current-page="page.current"
            v-model:page-size="page.size"
            :total="page.total"
            @page-change="getLogList()"
          />
        </template>
        <template #toolbar_buttons>
          <div :class="`tableBtn`">
            <a-space direction="horizontal" size="small" align="start" style="margin: 0 5px">
              <AuthDom auth="viewLog_query">
                <a-space direction="horizontal" size="small" :wrap="true" style="margin-bottom: 0">
                  <div class="row-div">
                    <a-space direction="horizontal" size="small" :wrap="true">
                      <label>{{ t('view.startTime') }}：</label>
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
                      <label>{{ t('view.operatingUser') }}：</label>
                      <a-select
                        :placeholder="t('view.pleaseSelectTheOperatingUser')"
                        style="width: 170px"
                        allow-clear
                        show-search
                        :filter-option="AntVueCommon.filterOption"
                        v-model:value="seacthContent.userId"
                        :options="usersData"
                      />
                    </a-space>
                  </div>
                  <div class="row-div">
                    <a-space direction="horizontal" size="small" :wrap="true">
                      <label>{{ t('view.clientIpAddress') }}：</label>
                      <a-input
                        :style="{
                          width: '180px',
                        }"
                        @press-enter="initPage"
                        v-model:value="seacthContent.clientIp"
                        :placeholder="t('view.queryByEnteringTheClientIpAddress')"
                      />
                    </a-space>
                  </div>
                  <div class="row-div">
                    <a-space direction="horizontal" size="small" :wrap="true">
                      <label>{{ t('view.requestAddress') }}：</label>
                      <a-input
                        :style="{
                          width: '180px',
                        }"
                        @press-enter="initPage"
                        v-model:value="seacthContent.url"
                        :placeholder="t('view.queryByEnteringTheRequestAddress')"
                      />
                    </a-space>
                  </div>
                  <div class="row-div">
                    <a-space direction="horizontal" size="small" :wrap="true">
                      <label>{{ t('view.logType') }}：</label>
                      <a-select
                        :placeholder="t('view.pleaseSelectTheLogTypeForQuery')"
                        style="width: 170px"
                        allow-clear
                        v-model:value="seacthContent.logType"
                      >
                        <a-select-option :value="2">{{ t('view.operationLog') }}</a-select-option>
                        <a-select-option :value="1">{{ t('view.loginLog') }}</a-select-option>
                        <a-select-option :value="3">{{ t('view.errorLog') }}</a-select-option>
                      </a-select>
                    </a-space>
                  </div>
                  <div class="row-div">
                    <a-space direction="horizontal" size="small" :wrap="true">
                      <a-button @click="initPage" type="primary">{{ t('view.query') }}</a-button>
                      <a-button @click="resetSeacth">{{ t('view.resetForm') }}</a-button>
                    </a-space>
                  </div>
                  <div class="row-div">
                    <a-spin :spinning="showLogSpinning" style="height: 32px" class="showLog">
                      <a-space direction="horizontal" size="small" :wrap="true">
                        <a-button style="height: 32px" @click="showLog('WG')">{{
                          t('view.systemLog')
                        }}</a-button>
                        <a-button style="height: 32px" @click="showLog('MQ')">{{
                          t('view.communicationLog')
                        }}</a-button>
                      </a-space>
                    </a-spin>
                  </div>
                </a-space>
              </AuthDom>
            </a-space>
          </div>
        </template>
        <template #isSuccess="{ row }">
          <span
            :style="{
              color: !row.isSuccess ? 'red' : 'green',
            }"
            >{{ row.isSuccess ? t('view.success') : t('view.failure') }}</span
          >
        </template>
        <template #logType="{ row }">
          <span>{{
            row.logType == 1
              ? t('view.loginLog')
              : row.logType == 2
                ? t('view.operationLog')
                : t('view.errorLog')
          }}</span>
        </template>
      </vxe-grid>
      <a-drawer
        :headerStyle="{ height: '49px', borderBottom: '2px solid #eee' }"
        :width="700"
        :visible="isShowLog"
        :title="t('view.serviceLog')"
        :footer-style="{ textAlign: 'right' }"
        @close="closeLog"
      >
        <vxe-table
          :show-header-overflow="true"
          height="100%"
          :scroll-y="{ enabled: true }"
          :auto-resize="true"
          :class="`${prefixCls}logTable`"
          ref="logTableRef"
          :loading="isRunGetLog"
          :data="logCollectionData"
          border="none"
          :show-header="true"
          :show-overflow="true"
          :show-footer="false"
          :checkbox-config="checkboxConfig"
          :row-config="{ isCurrent: true, isHover: true }"
        >
          <vxe-column type="checkbox" width="60" />
          <vxe-column field="Name" :title="t('view.name')">
            <template #default="{ row }">
              <span @dblclick="logNamedblclick(row)" class="name">
                <IconFontClass
                  :title="row.isBack ? t('view.returnToThePreviousDirectory') : row.name"
                  :name="
                    row.isBack
                      ? 'icon-baseui-fanhuishangyiji'
                      : row.isParent
                        ? 'icon-baseui-wenjianjia'
                        : row.name.lastIndexOf('.') == -1
                          ? 'icon-baseui-weizhiwenjian'
                          : ['txt', 'log'].includes(
                                row.name.substring(row.name.lastIndexOf('.') + 1).toLowerCase(),
                              )
                            ? 'icon-baseui-wenben1'
                            : 'icon-baseui-weizhiwenjian'
                  "
                />
                {{ row.name }}
              </span>
            </template>
          </vxe-column>
          <vxe-column field="Size" :title="t('view.size_kb')" align="right">
            <template #default="{ row }">
              {{ row.size != -1 ? row.size : '' }}
            </template>
          </vxe-column>
          <vxe-column field="Time" :title="t('view.lastModifiedTime')" align="right">
            <template #default="{ row }">
              {{ row.time ? dayjs(row.time).format('YYYY-MM-DD HH:mm:ss') : '' }}
            </template>
          </vxe-column>
        </vxe-table>
        <template #footer>
          <a-spin :spinning="fromSpinning">
            <a-button style="margin-left: 8px" type="primary" @click="downLogMqtt">{{
              t('view.download')
            }}</a-button>
            <a-button style="margin-left: 8px" @click="closeLog">{{ t('view.close') }}</a-button>
          </a-spin>
        </template>
      </a-drawer>
    </a-spin>
  </MyContent>
</template>
<script setup lang="ts">
  import zhCN from 'ant-design-vue/es/locale/zh_CN';
  import enUS from 'ant-design-vue/es/locale/en_US';
  import frFR from 'ant-design-vue/es/locale/fr_FR';
  import AntVueCommon from '@/utils/MyCommon/AntVueCommon';
  import { ref, reactive, nextTick, watch } from 'vue';
  import { useDesign } from '@/hooks/web/useDesign';
  import dayjs from 'dayjs';
  import { VxeGrid, VxeGridProps } from 'vxe-table';
  import viewLogApi from '@/api/viewLog';
  import { message } from 'ant-design-vue';
  import { useMqttStoreWithOut } from '@/store/modules/mqtt';
  import { useUserStore } from '@/store/modules/user';
  import { useI18n } from '@/hooks/web/useI18n';
  import { useLocaleStore } from '@/store/modules/locale';
  import userApi from '@/api/user';

  const { t } = useI18n();
  const localeStore = useLocaleStore();
  const locale = localeStore.getLocale;
  defineOptions({ name: 'ViewLog' });
  const { prefixCls } = useDesign('viewLog-');
  const mqttStore = useMqttStoreWithOut();
  const userStore = useUserStore();
  const loading = ref(true);
  const isRunLoading = ref(false);
  const tableConfig = reactive<VxeGridProps>({
    showOverflow: true,
    showHeaderOverflow: true,
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
        field: 'createUserName',
        title: t('view.operatingUser'),
        showOverflow: true,
        sortable: true,
        minWidth: 176,
        fixed: 'left',
      },
      {
        field: 'logType',
        title: t('view.logType'),
        showOverflow: true,
        sortable: true,
        minWidth: 176,
        slots: {
          default: 'logType',
        },
      },
      {
        field: 'clientIp',
        title: t('view.clientIpAddress'),
        showOverflow: true,
        sortable: true,
        minWidth: 176,
      },
      {
        field: 'url',
        title: t('view.requestAddress'),
        showOverflow: true,
        sortable: true,
        minWidth: 146,
      },
      {
        field: 'param',
        title: t('view.requestParameters'),
        showOverflow: true,
        minWidth: 136,
      },
      {
        field: 'isSuccess',
        title: t('view.successOrNot'),
        showOverflow: true,
        minWidth: 136,
        sortable: true,
        slots: {
          default: 'isSuccess',
        },
      },
      {
        field: 'exceptionMsg',
        title: t('view.exceptionMessage'),
        showOverflow: true,
        sortable: true,
        minWidth: 200,
        visible: false,
      },
      {
        field: 'exceptionName',
        title: t('view.exceptionName'),
        showOverflow: true,
        sortable: true,
        minWidth: 200,
        visible: false,
      },
      {
        field: 'exceptionSource',
        title: t('view.exceptionSource'),
        showOverflow: true,
        sortable: true,
        minWidth: 200,
        visible: false,
      },
      {
        field: 'createTime',
        title: t('view.creationTime'),
        minWidth: 150,
        showOverflow: true,
        sortable: true,
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
  const fromSpinning = ref(false);
  const usersData = ref([]);
  const seacthContent = ref({
    userId: null,
    url: null,
    clientIp: null,
    logType: null,
    startTime: null,
    endTime: null,
  });

  //公用
  let newServerCode = null;
  let isShowContent = false;

  //日志信息
  const showLogSpinning = ref(false);
  const isShowLog = ref(false);
  const isRunGetLog = ref(false);
  const logCollectionData = ref([]);
  const logTableRef = ref(null);
  let LogDirectory = null;
  //每一步的数据
  let logTableStepData = [];
  //每一步的文件夹名称
  const logTableStepName = ref([]);
  let logTableStepDataRowIndex = [];
  let logTableStep = 0;
  const logMenuConfig = reactive({
    className: prefixCls + 'logTtable',
    body: {
      options: [
        [
          {
            code: 'down',
            name: t('view.download'),
            prefixIcon: 'iconfont icon-baseui-xiazai',
            className: prefixCls + 'logTtable-xiazai-item',
          },
        ],
      ],
    },
  });
  const checkboxConfig = reactive({
    checkMethod: ({ row }) => {
      return !row.isBack;
    },
    visibleMethod({ row }) {
      return !row.isBack;
    },
  });

  const page = reactive({
    current: 1,
    size: 20,
    total: 0,
    sortlist: ['createTime desc'],
  });

  const timeValue = ref([
    dayjs(dayjs().subtract(7, 'day').format('YYYY-MM-DD')),
    dayjs(dayjs().add(1, 'day').format('YYYY-MM-DD')),
  ]);

  getUsersSimple();
  getLogList();

  //重置搜索条件
  function resetSeacth() {
    seacthContent.value = {
      userId: null,
      url: null,
      clientIp: null,
      logType: null,
      startTime: null,
      endTime: null,
    };
  }

  //获取软件列表
  function getLogList() {
    loading.value = true;
    seacthContent.value.startTime =
      timeValue.value == null ? null : timeValue.value[0].format('YYYY-MM-DD HH:mm:ss');
    seacthContent.value.endTime =
      timeValue.value == null ? null : timeValue.value[1].format('YYYY-MM-DD HH:mm:ss');
    viewLogApi
      .GetLogList({
        ...seacthContent.value,
        fullSort: getFullSort(),
        PageIndex: page.current,
        PageSize: page.size,
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

  //获取用户下拉列表
  function getUsersSimple() {
    userApi.GetUsersSimple().then((data) => {
      usersData.value = data;
    });
  }

  function initPage() {
    page.current = 1;
    page.total = 0;
    getLogList();
  }

  //显示查看服务日志
  function showLog(logType) {
    showLogSpinning.value = true;
    viewLogApi
      .GetLogDirectory(logType)
      .then((data) => {
        showLogSpinning.value = false;
        isShowLog.value = true;
        logCollectionData.value = data.logCollection;
        if (logCollectionData.value) {
          logCollectionData.value = _.orderBy(logCollectionData.value, ['Time'], ['desc']);
        }
        LogDirectory = data.logDirectory;
        logTableStepData.push(logCollectionData.value);
      })
      .catch(() => {
        showLogSpinning.value = false;
      });
  }

  //关闭查看服务日志
  function closeLog() {
    logCollectionData.value = [];
    isShowLog.value = false;
    logTableStepName.value = [];
    logTableStepData = [];
    logTableStepDataRowIndex = [];
    logTableStep = 0;
    isShowContent = false;
    mqttStore.setNewServiceLogShowDirectory(null);
  }

  //表格右键事件
  function contextMenuClickEvent({ menu, row, column }) {
    switch (menu.code) {
      case 'down':
        downLogMqtt();
        break;
    }
  }
  //下载日志文件
  function downLogMqtt() {
    fromSpinning.value = true;
    const checkDatas = logTableRef.value.getCheckboxRecords(false);
    if (checkDatas && checkDatas.length > 0) {
      const LogFileCollection = [];
      let name = logTableStepName.value.join('\\');
      name = name != '' ? '\\' + name : '';
      checkDatas.forEach((m) => {
        // LogFileCollection.push({ Name: `${LogDirectory}${name}\\${m.name}`, IsParent: m.isParent });
        LogFileCollection.push(`${LogDirectory}${name}\\${m.name}`);
      });
      viewLogApi
        .GetLogFile({ paths: LogFileCollection })
        .then((data) => {
          fromSpinning.value = false;
          myCommon.downLoadFile(data);
        })
        .catch(() => {
          fromSpinning.value = false;
        });
    } else {
      fromSpinning.value = false;
      message.info(t('view.pleaseSelectTheFilesToBeDownloadedFirst'));
    }
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
    getLogList();
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

  //双击日志名称
  function logNamedblclick(row) {
    if (row.isBack) {
      logTableStep--;
      logCollectionData.value = logTableStepData[logTableStep];
      if (logCollectionData.value) {
        logCollectionData.value = _.orderBy(logCollectionData.value, ['time'], ['desc']);
      }
      logTableStepData.splice(logTableStep + 1);
      logTableStepName.value.splice(logTableStep);
      nextTick(() => {
        logTableRef.value.scrollToRow(logTableStepDataRowIndex[logTableStep - 1]);
        logTableStepDataRowIndex.splice(logTableStep);
      });
    } else if (row.isParent) {
      logTableStep++;
      logTableStepData.push(row.subCollection);
      logTableStepName.value.push(row.name);
      logCollectionData.value = row.subCollection;
      if (logCollectionData.value) {
        logCollectionData.value = _.orderBy(logCollectionData.value, ['time'], ['desc']);
      }
      logTableStepDataRowIndex.push(row);
    }
  }

  watch(
    () => logTableStepName.value,
    () => {
      logTableRef.value.setAllCheckboxRow(false);
      if (logTableStepName.value.length > 0) {
        nextTick(() => {
          logTableRef.value.insert({
            name: '...\\' + logTableStepName.value.join('\\'),
            isBack: true,
            size: -1,
            time: '',
          });
        });
      }
    },
    { deep: true },
  );
</script>
<style lang="less" scoped>
  @prefixCls: ~'@{namespace}-viewLog-';

  .tableBtn {
    width: 100%;
  }
</style>
<style lang="less">
  @prefixCls: ~'@{namespace}-viewLog-';

  .@{prefixCls}logTtable-xiazai-item {
    width: 110px !important;
  }

  .@{prefixCls}logTable {
    user-select: none;

    .name {
      cursor: pointer;
    }

    .icon-baseui-xiazai {
      top: 0 !important;
    }

    .icon-baseui-wenjianjia {
      color: #ffb100;
    }

    .icon-baseui-wenben1 {
      color: #adadad;
    }

    .icon-baseui-weizhiwenjian {
      color: #0a61bd;
    }

    .icon-baseui-fanhuishangyiji {
      color: green;
    }
  }
</style>
