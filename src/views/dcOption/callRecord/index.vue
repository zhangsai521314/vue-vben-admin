<template>
  <MyContent :class="prefixCls">
    <vxe-grid
      :scroll-y="{ enabled: true }"
      v-bind="tableConfig"
      :auto-resize="true"
      id="ddServcerCallRecord"
      ref="tableRef"
      :loading="loading"
      :seq-config="{ startIndex: (page.current - 1) * page.size }"
      :row-config="{ keyField: 'callId' }"
      :column-config="{ resizable: true }"
      :custom-config="{ storage: true }"
      @sort-change="onSortChange"
    >
      <template #toolbar_buttons>
        <div :class="`tableBtn`">
          <a-space direction="horizontal" size="small" style="margin-left: 5px">
            <AuthDom auth="dcOption_callRecord_query">
              <a-space direction="horizontal" size="small" :wrap="true" style="margin-bottom: 0">
                <div class="row-div">
                  <a-space direction="horizontal" size="small" :wrap="true">
                    <label>{{ t('view.callTime') }}：</label>
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
                    <label>{{ t('view.softwareName') }}：</label>
                    <a-select
                      :placeholder="t('view.pleaseSelectServiceName')"
                      style="width: 170px"
                      allow-clear
                      show-search
                      :filter-option="AntVueCommon.filterOption"
                      v-model:value="seacthContent.serviceId"
                      :options="serviceData"
                    />
                  </a-space>
                </div>
                <div class="row-div">
                  <a-space direction="horizontal" size="small" :wrap="true">
                    <label>{{ t('view.callerName') }}：</label>
                    <a-input
                      @press-enter="initPage()"
                      v-model:value="seacthContent.mainCallName"
                      :placeholder="t('view.enterCallerNameToSearch')"
                    />
                  </a-space>
                </div>
                <div class="row-div">
                  <a-space direction="horizontal" size="small" :wrap="true">
                    <label>{{ t('view.calledName') }}：</label>
                    <a-input
                      @press-enter="initPage()"
                      v-model:value="seacthContent.calledName"
                      :placeholder="t('view.enterCalledNameToSearch')"
                    />
                  </a-space>
                </div>
                <div class="row-div">
                  <a-space direction="horizontal" size="small" :wrap="true">
                    <a-input-number
                      class="duration"
                      @press-enter="initPage()"
                      v-model:value="duration"
                      :min="0"
                      :max="3000"
                      ::placeholder="durationUnit == 'ss' ? t('view.seconds') : t('view.minutes')"
                    >
                      <template #addonBefore>
                        <a-select v-model:value="durationQueryType" style="width: 140px">
                          <a-select-option :value="3"
                            >{{ t('view.callDuration') }}>=</a-select-option
                          >
                          <a-select-option :value="5"
                            >{{ t('view.callDuration') }}<=</a-select-option
                          >
                        </a-select>
                      </template>
                      <template #addonAfter>
                        <a-select v-model:value="durationUnit" style="width: 100px">
                          <a-select-option value="ss">{{ t('view.seconds') }}</a-select-option>
                          <a-select-option value="mm">{{ t('view.minutes') }}</a-select-option>
                        </a-select>
                      </template>
                    </a-input-number>
                  </a-space>
                </div>
                <div class="row-div">
                  <a-space direction="horizontal" size="small" :wrap="true">
                    <a-button @click="initPage()" type="primary">{{ t('view.query') }}</a-button>
                    <a-button @click="resetSeacth">{{ t('view.resetForm') }}</a-button>
                    <a-spin :spinning="exportDataSpinning">
                      <a-button @click="exportData" type="primary">{{ t('view.export') }}</a-button>
                    </a-spin>
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
      <template #recordFileStatus="{ row }">
        <span
          :style="{
            color:
              row.recordFileStatus == 4
                ? 'red'
                : row.recordFileStatus == 2 || row.recordFileStatus == 3
                  ? '#0960bd'
                  : row.recordFileStatus == 1
                    ? 'green '
                    : '',
          }"
          >{{
            row.recordFileStatus == 4
              ? t('view.failedToRetrieve')
              : row.recordFileStatus == 2
                ? t('view.getting')
                : row.recordFileStatus == 3
                  ? t('view.storing')
                  : row.recordFileStatus == 1
                    ? t('view.successfulRetrieval')
                    : ''
          }}</span
        >
      </template>
      <template #default="{ row }">
        <div :class="`tableOption`">
          <AuthDom auth="DCOptionCallRecord_play">
            <IconFontClass
              name="icon-baseui-bofang"
              @click="getCallRecordFilePath(row, 'play')"
              style="color: #0fc10e"
              :title="t('view.play')"
            />
          </AuthDom>
          <AuthDom auth="DCOptionCallRecord_down">
            <IconFontClass
              name="icon-baseui-xiazai"
              @click="getCallRecordFilePath(row, 'down')"
              style="color: #0960bd"
              :title="t('view.download')"
            />
          </AuthDom>
        </div>
      </template>
      <template #callDirection="{ row }">
        <span>{{
          row.callDirection == 1
            ? t('view.exhale')
            : row.callDirection == 2
              ? t('view.inhale')
              : '-'
        }}</span>
      </template>
      <template #callState="{ row }">
        <span>{{
          row.callState == 0
            ? t('view.freetimeIdle')
            : row.callState == 1
              ? t('view.incomingRinging')
              : row.callState == 2
                ? t('view.outgoingRinging')
                : row.callState == 3
                  ? t('view.incomingHangUp')
                  : row.callState == 4
                    ? t('view.outgoingHangUp')
                    : row.callState == 5
                      ? t('view.incomingAnswerIncomingAccept')
                      : row.callState == 6
                        ? t('view.outgoingAnswerOutgoingAccept')
                        : row.callState == 7
                          ? t('view.callNumberNotFound')
                          : row.callState == 8
                            ? t('view.callNumberIsOffline')
                            : row.callState == 9
                              ? t('view.groupCallCreationSucceeded')
                              : row.callState == 10
                                ? t('view.groupCallCreationFailed')
                                : row.callState == 11
                                  ? t('view.groupCallTalkRightChange')
                                  : row.callState == 12
                                    ? t('view.groupCallEnded')
                                    : row.callState == 13
                                      ? t('view.groupCallReplaced')
                                      : row.callState == 14
                                        ? t('view.voiceServiceInterruption')
                                        : row.callState
        }}</span>
      </template>
      <template #callType="{ row }">
        <span>{{
          row.callType == 10
            ? t('view.makePersonalCall')
            : row.callType == 100
              ? t('view.intraStationGroupCall')
              : row.callType == 101
                ? t('view.neighborStationGroupCall')
                : row.callType == 1000
                  ? t('view.quanhuStation')
                  : row.callType == 1001
                    ? t('view.quanhuLocomotive')
                    : row.callType == 1002
                      ? t('view.wholeLineBroadcast')
                      : row.callType == 10000
                        ? t('view.emergencyCall')
                        : '-'
        }}</span>
      </template>
      <template #record_state="{ row }">
        <span>{{
          row.recordState == '0'
            ? t('view.noRecordingFile')
            : row.recordState == '2'
              ? t('view.recordingEnded')
              : '-'
        }}</span>
      </template>
    </vxe-grid>
    <a-modal
      :title="t('view.play')"
      ref="modalRef"
      v-model:open="modelShow"
      width="700px"
      @cancel="closeModel"
    >
      <div v-if="!isRunPlay" :class="`${prefixCls}play`" style="text-align: center">
        <IconFontClass
          name="icon-baseui-luyinwenjian"
          style="font-size: 180px"
          :style="{
            color:
              playFileStatus == 1
                ? 'green'
                : playFileStatus == 2
                  ? '#0960bd'
                  : playFileStatus == 3
                    ? '#004496'
                    : playFileStatus == 4
                      ? 'red'
                      : '#c5c5c5ed',
          }"
        />
        <p style="font-size: 38px">{{
          playFileStatus == 1
            ? t('view.recordingPreparationComplete')
            : playFileStatus == 2
              ? t('view.recordingFileRetrievalInProgress')
              : playFileStatus == 3
                ? t('view.recordingFileStorageInProgress')
                : playFileStatus == 4
                  ? t('view.PleaseTryAgain')
                  : t('view.recordingFileStatusUnknown')
        }}</p>
      </div>
      <MyPlay v-else ref="playRef" :class="`${prefixCls}play`" />
      <template #footer>
        <a-button @click="closeModel">{{ t('view.close') }}</a-button>
      </template>
    </a-modal>
  </MyContent>
</template>
<script setup lang="ts">
  import MyPlay from '@/components/MyPlay/index.vue';
  import AntVueCommon from '@/utils/MyCommon/AntVueCommon';
  import myCommon from '@/utils/MyCommon/common';
  import { ref, reactive, nextTick, watch, unref } from 'vue';
  import { useDesign } from '@/hooks/web/useDesign';
  import { VxeGrid, VxeGridProps } from 'vxe-table';
  import { CallRecord as callRecordApi } from '@/api/dcOption';
  import dictionariesApi from '@/api/dictionaries';
  import serviceApi from '@/api/software';
  import { useMqttStoreWithOut } from '@/store/modules/mqtt';
  import zhCN from 'ant-design-vue/es/locale/zh_CN';
  import dayjs from 'dayjs';
  import 'dayjs/locale/zh-cn';
  import { message } from 'ant-design-vue';
  import { tryOnUnmounted } from '@vueuse/core';
  import { useI18n } from '@/hooks/web/useI18n';
  import { useLocaleStore } from '@/store/modules/locale';

  const { t } = useI18n();
  const localeStore = useLocaleStore();
  const locale = localeStore.getLocale;
  defineOptions({ name: 'DCOptionCallRecord' });
  const { prefixCls } = useDesign('DCOptionCallRecord-');
  const mqttStore = useMqttStoreWithOut();
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
        field: 'callId',
        title: t('view.recordId'),
        visible: false,
        showOverflow: true,
        minWidth: locale == 'zh-CN' ? 130 : 150,
        fixed: 'left',
      },
      {
        field: 'serviceCode',
        title: t('view.serviceNumber'),
        visible: false,
        showOverflow: true,
        sortable: true,
        minWidth: 166,
        fixed: 'left',
      },
      {
        field: 'serviceName',
        title: t('view.softwareName'),
        showOverflow: true,
        sortable: true,
        minWidth: 150,
        fixed: 'left',
      },
      {
        field: 'callState',
        title: t('view.callStatus'),
        visible: false,
        showOverflow: true,
        sortable: true,
        minWidth: locale == 'zh-CN' ? 100 : 140,
        slots: {
          default: 'callState',
        },
      },
      {
        field: 'callDirection',
        title: t('view.callDirection'),
        showOverflow: true,
        sortable: true,
        minWidth: locale == 'zh-CN' ? 100 : 180,
        slots: {
          default: 'callDirection',
        },
      },
      {
        field: 'mainCallName',
        title: t('view.callerName'),
        showOverflow: true,
        sortable: true,
        minWidth: locale == 'zh-CN' ? 150 : 160,
      },
      {
        field: 'calledName',
        title: t('view.calledName'),
        showOverflow: true,
        sortable: true,
        minWidth: locale == 'zh-CN' ? 150 : 170,
      },
      {
        field: 'callType',
        title: t('view.callType'),
        showOverflow: true,
        sortable: true,
        minWidth: locale == 'zh-CN' ? 100 : 130,
        slots: {
          default: 'callType',
        },
      },
      {
        field: 'callTimeSpan',
        title: t('view.duration'),
        showOverflow: true,
        sortable: true,
        minWidth: locale == 'zh-CN' ? 120 : 160,
      },
      {
        field: 'startTime',
        title: t('view.callTime'),
        minWidth: 150,
        showOverflow: true,
        sortable: true,
      },
      {
        field: 'acceptTime',
        title: t('view.connectionTime'),
        minWidth: locale == 'zh-CN' ? 150 : 170,
        showOverflow: true,
        sortable: true,
      },
      {
        field: 'endTime',
        title: t('view.endTime'),
        minWidth: 150,
        showOverflow: true,
        sortable: true,
      },
      {
        field: 'remoteName',
        title: t('view.counterpartUsername'),
        showOverflow: true,
        sortable: true,
        visible: false,
        minWidth: locale == 'zh-CN' ? 120 : 260,
      },
      {
        field: 'remoteNumber',
        title: t('view.counterpartIsdnNumber'),
        showOverflow: true,
        sortable: true,
        visible: false,
        minWidth: locale == 'zh-CN' ? 120 : 240,
      },
      {
        field: 'isOnline',
        title: t('view.isOnline'),
        showOverflow: true,
        cellRender: { name: 'render_isno' },
        minWidth: locale == 'zh-CN' ? 100 : 160,
      },
      {
        field: 'record_state',
        title: t('view.recordingStatus'),
        showOverflow: true,
        sortable: true,
        minWidth: locale == 'zh-CN' ? 100 : 200,
        slots: {
          default: 'record_state',
        },
      },
      {
        field: 'logKey',
        title: t('view.recordingFileAddress'),
        showOverflow: true,
        sortable: true,
        visible: false,
        minWidth: locale == 'zh-CN' ? 150 : 190,
      },
      {
        field: 'recordFileStatus',
        title: t('view.recordingFileStatus'),
        showOverflow: true,
        sortable: true,
        slots: {
          default: 'recordFileStatus',
        },
        minWidth: locale == 'zh-CN' ? 150 : 170,
      },
      {
        field: 'recordFileTime',
        title: t('view.recordingFileStatusTime'),
        minWidth: locale == 'zh-CN' ? 150 : 220,
        showOverflow: true,
        sortable: true,
        visible: false,
        formatter: ({ cellValue }) => {
          return cellValue ? dayjs(cellValue).format('YYYY-MM-DD HH:mm:ss') : '';
        },
      },
      {
        title: t('view.action'),
        minWidth: 90,
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
  const seacthContent = ref({
    serviceId: null,
    mainCallName: '',
    calledName: '',
    startTime: null,
    endTime: null,
    SearchParameters: [],
  });
  const durationQueryType = ref(5);
  const durationUnit = ref('ss');
  const duration = ref(null);

  const timeValue = ref([
    dayjs(dayjs().subtract(7, 'day').format('YYYY-MM-DD')),
    dayjs(dayjs().add(1, 'day').format('YYYY-MM-DD')),
  ]);
  const dictionariesData = ref([]);
  const serviceData = ref([]);
  const page = reactive({
    current: 1,
    size: 20,
    total: 0,
    sortlist: ['endTime desc', 'startTime desc'],
  });
  const modelShow = ref(false);
  //正在或将要播放的记录id
  let playCallId = null;
  //是否正在播放
  const isRunPlay = ref(false);
  //录音文件状态
  const playFileStatus = ref(0);
  const playRef = ref(null);
  const exportDataSpinning = ref(false);

  getDCOptionCallRecords();
  getDictionaries();
  getServices();

  //播放下载
  function getCallRecordFilePath(row, OperationType) {
    if (row.isOnline || !myCommon.isnull(row.recordFile)) {
      if (!myCommon.isnull(row.recordFile)) {
        if (OperationType == 'play') {
          isRunPlay.value = true;
          modelShow.value = true;
          nextTick(() => {
            playRef.value.changePaly({ src: row.recordFile });
          });
        } else {
          myCommon.downLoadFileByUrl(row.recordFile);
        }
      } else {
        callRecordApi
          .GetCallRecordFilePath({
            CallId: row.callId,
            ClientId: mqttStore.mqttClient.options.clientId,
            OperationType,
            execompleteBefore: () => {
              loading.value = false;
            },
          })
          .then((data) => {
            playFileStatus.value = data.recordFileStatus;
            const oldData = tableConfig.data.find((m) => m.callId == data.callId);
            if (oldData) {
              myCommon.objectReplace(oldData, data);
            }
            if (OperationType == 'play') {
              if (data.recordFileStatus != 4) {
                playCallId = row.callId;
                modelShow.value = true;
                nextTick(() => {
                  if (data.recordFileStatus == 1) {
                    isRunPlay.value = true;
                    nextTick(() => {
                      playRef.value.changePaly({ src: data.recordFile });
                    });
                  }
                });
              } else {
                message.info(
                  data.message == null
                    ? data.recordFileStatus == 1
                      ? t('view.successfulRetrieval')
                      : data.recordFileStatus == 2
                        ? t('view.getting')
                        : data.recordFileStatus == 3
                          ? t('view.storing')
                          : t('view.failedToRetrieve')
                    : data.message,
                );
              }
            } else if (data.recordFileStatus == 1) {
              myCommon.downLoadFileByUrl(data.recordFile);
            } else {
              message.info(
                data.message == null
                  ? data.recordFileStatus == 1
                    ? t('view.successfulRetrieval')
                    : data.recordFileStatus == 2
                      ? t('view.getting')
                      : data.recordFileStatus == 3
                        ? t('view.storing')
                        : t('view.failedToRetrieve')
                  : data.message,
              );
            }
          });
      }
    } else {
      message.info(t('view.serviceOfflineTip'));
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
    getDCOptionCallRecords();
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

  //获取列表
  function getDCOptionCallRecords() {
    loading.value = true;
    getSelectWhere();
    callRecordApi
      .GetDCOptionCallRecords({
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

  function getSelectWhere() {
    seacthContent.value.startTime =
      timeValue.value == null ? null : timeValue.value[0].format('YYYY-MM-DD HH:mm:ss');
    seacthContent.value.endTime =
      timeValue.value == null ? null : timeValue.value[1].format('YYYY-MM-DD HH:mm:ss');
    if (!myCommon.isnull(duration.value)) {
      seacthContent.value.SearchParameters = [
        {
          CSharpTypeName: 'int',
          FieldName: 'duration',
          ConditionalType: durationQueryType.value,
          FieldValue: durationUnit.value == 'mm' ? duration.value * 60 : duration.value,
        },
      ];
    } else {
      seacthContent.value.SearchParameters = [];
    }
  }

  //重置搜索条件
  function resetSeacth() {
    seacthContent.value = {
      serviceId: null,
      mainCallName: '',
      calledName: '',
      startTime: null,
      endTime: null,
      SearchParameters: [],
    };
    timeValue.value = [
      dayjs(dayjs().subtract(7, 'day').format('YYYY-MM-DD')),
      dayjs(dayjs().add(1, 'day').format('YYYY-MM-DD')),
    ];
    durationQueryType.value = 5;
    durationUnit.value = 'ss';
    duration.value = null;
  }

  //获取字典
  function getDictionaries() {
    dictionariesApi
      .GetDictionariesSimple({
        dictionariesclass: ['msgType'],
      })
      .then((data) => {
        dictionariesData.value = data;
      })
      .catch(() => {
        dictionariesData.value = [];
      });
  }

  function handlePageChange() {
    getDCOptionCallRecords();
  }

  //获取服务列表
  function getServices() {
    serviceApi
      .GetServicesSimple({ serviceType: ['DCOption'] })
      .then((data) => {
        serviceData.value = data;
      })
      .catch(() => {
        serviceData.value = [];
      });
  }

  //关闭播放器
  function closeModel() {
    modelShow.value = false;
    if (playRef.value != null) {
      playRef.value.dispose();
    }
    playFileStatus.value = 0;
    isRunPlay.value = false;
  }

  function initPage() {
    page.current = 1;
    page.total = 0;
    getDCOptionCallRecords();
  }

  function exportData() {
    // exportDataSpinning.value = true;
    // getSelectWhere();
    // callRecordApi
    //   .ExportData({
    //     PageIndex: page.current,
    //     PageSize: page.size,
    //     ...seacthContent.value,
    //     fullSort: getFullSort(),
    //     execompleteBefore: () => {
    //       exportDataSpinning.value = false;
    //     },
    //   })
    //   .then((data) => {
    //     myCommon.downLoadFile(data);
    //   });
    const $table = tableRef.value;
    if ($table) {
      $table.exportData({
        type: 'xlsx',
      });
    }
  }

  //页面卸载后
  tryOnUnmounted(() => {
    if (playRef.value != null) {
      playRef.value.dispose();
    }
  });

  //监控查询出来记录的录音文件在网管系统服务器上的状态变化
  watch(
    () => mqttStore.callRecordChange,
    () => {
      if (mqttStore.callRecordChange != null) {
        const oldData = tableConfig.data.find((m) => m.callId == mqttStore.callRecordChange.callId);
        if (oldData) {
          myCommon.objectReplace(oldData, mqttStore.callRecordChange);
        }
        if (
          modelShow.value == true &&
          playCallId == mqttStore.callRecordChange.callId &&
          !isRunPlay.value
        ) {
          playFileStatus.value = mqttStore.callRecordChange.recordFileStatus;
        }
      }
    },
  );
  watch(
    () => mqttStore.newCallRecordPlayFile,
    () => {
      if (
        mqttStore.newCallRecordPlayFile != null &&
        modelShow.value == true &&
        playCallId == mqttStore.newCallRecordPlayFile.callId &&
        !isRunPlay.value
      ) {
        const oldData = tableConfig.data.find(
          (m) => m.callId == mqttStore.newCallRecordPlayFile.callId,
        );
        if (oldData) {
          myCommon.objectReplace(oldData, mqttStore.newCallRecordPlayFile);
        }
        nextTick(() => {
          playFileStatus.value = mqttStore.newCallRecordPlayFile.recordFileStatus;
          isRunPlay.value = true;
          nextTick(() => {
            playRef.value.changePaly({ src: unref(mqttStore.newCallRecordPlayFile.recordFile) });
          });
        });
      }
    },
  );
</script>
<style lang="less" scoped>
  @prefixCls: ~'@{namespace}-DCOptionCallRecord-';

  .@{prefixCls} {
    .row-div {
      height: 30px;
    }

    .tableBtn {
      width: 100%;
    }
  }
  .@{prefixCls}play {
    width: 100%;
    height: 370px;
  }

  .duration :deep(.ant-input-number-input) {
    width: 80px;
  }
</style>
