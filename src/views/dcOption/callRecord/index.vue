<template>
  <MyContent :class="prefixCls">
    <vxe-grid
      :scroll-y="{ enabled: true }"
      v-bind="tableConfig"
      :auto-resize="true"
      id="mytable"
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
                    <label>拨打时间：</label>
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
                <div class="row-div">
                  <a-space direction="horizontal" size="small" :wrap="true">
                    <label>服务名称：</label>
                    <a-select
                      placeholder="请选择服务名称"
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
                    <label>主叫名称：</label>
                    <a-input
                      @press-enter="initPage()"
                      v-model:value="seacthContent.mainCallName"
                      placeholder="输入主叫名称查询"
                    />
                  </a-space>
                </div>
                <div class="row-div">
                  <a-space direction="horizontal" size="small" :wrap="true">
                    <label>被叫名称：</label>
                    <a-input
                      @press-enter="initPage()"
                      v-model:value="seacthContent.calledName"
                      placeholder="输入被叫名称查询"
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
                      :placeholder="durationUnit == 'ss' ? '秒' : '分钟'"
                    >
                      <template #addonBefore>
                        <a-select v-model:value="durationQueryType" style="width: 130px">
                          <a-select-option :value="3">{{ '通话时长 >=' }}</a-select-option>
                          <a-select-option :value="5">{{ '通话时长 <=' }}</a-select-option>
                        </a-select>
                      </template>
                      <template #addonAfter>
                        <a-select v-model:value="durationUnit" style="width: 60px">
                          <a-select-option value="ss">秒</a-select-option>
                          <a-select-option value="mm">分</a-select-option>
                        </a-select>
                      </template>
                    </a-input-number>
                  </a-space>
                </div>
                <div class="row-div">
                  <a-space direction="horizontal" size="small" :wrap="true">
                    <a-button @click="initPage()" type="primary">查询</a-button>
                    <a-button @click="resetSeacth">重置表单</a-button>
                    <a-spin :spinning="exportDataSpinning">
                      <a-button @click="exportData" type="primary">导出</a-button>
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
              ? '获取失败'
              : row.recordFileStatus == 2
                ? '正在获取'
                : row.recordFileStatus == 3
                  ? '存储中'
                  : row.recordFileStatus == 1
                    ? '获取成功 '
                    : ''
          }}</span
        >
      </template>
      <!-- <template #duration="{ row }">
        {{
          row.duration == null
            ? ''
            : row.duration >= 0 && row.duration <= 60
              ? `${parseInt(row.duration)} 秒`
              : row.duration > 60 && row.duration <= 3600
                ? `${parseFloat(row.duration / 60).toFixed(1)} 分`
                : row.duration > 3600 && row.duration <= 86400
                  ? `${parseFloat(row.duration / 60 / 60).toFixed(1)} 时`
                  : row.duration > 86400
                    ? `${parseFloat(row.duration / 60 / 60 / 24).toFixed(1)} 天`
                    : ''
        }}
      </template> -->
      <template #default="{ row }">
        <div :class="`tableOption`">
          <AuthDom auth="DCOptionCallRecord_play">
            <IconFontClass
              name="icon-baseui-bofang"
              @click="getCallRecordFilePath(row, 'play')"
              style="color: #0fc10e"
              title="播放"
            />
          </AuthDom>
          <AuthDom auth="DCOptionCallRecord_down">
            <IconFontClass
              name="icon-baseui-xiazai"
              @click="getCallRecordFilePath(row, 'down')"
              style="color: #0960bd"
              title="下载"
            />
          </AuthDom>
        </div>
      </template>
    </vxe-grid>
    <a-modal
      title="播放"
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
            ? '录音准备完成'
            : playFileStatus == 2
              ? '录音文件获取中'
              : playFileStatus == 3
                ? '录音文件存储中'
                : playFileStatus == 4
                  ? '录音文件获取失败，请重新获取'
                  : '录音文件状态未知'
        }}</p>
      </div>
      <MyPlay v-else ref="playRef" :class="`${prefixCls}play`" />
      <template #footer>
        <a-button @click="closeModel">关闭</a-button>
      </template>
    </a-modal>
  </MyContent>
</template>
<script setup lang="ts">
  import MyPlay from '@/components/MyPlay/index.vue';
  import AntVueCommon from '@/utils/MyCommon/AntVueCommon';
  import myCommon from '@/utils/MyCommon/common';
  import { ref, reactive, createVNode, nextTick, onMounted, watch, unref } from 'vue';
  import { useDesign } from '@/hooks/web/useDesign';
  import { VxeGrid, VxeGridProps } from 'vxe-table';
  import { CallRecord as callRecordApi } from '@/api/dcOption';
  import dictionariesApi from '@/api/dictionaries';
  import serviceApi from '@/api/software';

  import { useMqttStoreWithOut } from '@/store/modules/mqtt';
  import zhCN from 'ant-design-vue/es/locale/zh_CN';
  import dayjs from 'dayjs';
  import 'dayjs/locale/zh-cn';
  import { message, Modal } from 'ant-design-vue';
  import { tryOnUnmounted } from '@vueuse/core';

  defineOptions({ name: 'DCOptionCallRecord' });
  const { prefixCls } = useDesign('DCOptionCallRecord-');
  const mqttStore = useMqttStoreWithOut();
  const loading = ref(true);
  const tableConfig = reactive<VxeGridProps>({
    height: 'auto',
    columns: [
      //基础
      { type: 'seq', title: '序号', minWidth: 70, fixed: 'left' },
      {
        field: 'callId',
        title: '记录ID',
        visible: false,
        showOverflow: true,
        showHeaderOverflow: true,
        minWidth: 130,
        fixed: 'left',
      },
      {
        field: 'serviceCode',
        title: '服务编号',
        visible: false,
        showOverflow: true,
        showHeaderOverflow: true,
        sortable: true,
        minWidth: 100,
        fixed: 'left',
      },
      {
        field: 'serviceName',
        title: '服务名称',
        showOverflow: true,
        showHeaderOverflow: true,
        sortable: true,
        minWidth: 150,
        fixed: 'left',
      },
      {
        field: 'callStateDescription',
        title: '通话状态',
        visible: false,
        showOverflow: true,
        showHeaderOverflow: true,
        sortable: true,
        minWidth: 100,
      },
      {
        field: 'callDirectionDescription',
        title: '呼叫方向',
        showOverflow: true,
        showHeaderOverflow: true,
        sortable: true,
        minWidth: 100,
      },
      {
        field: 'mainCallName',
        title: '主叫名称',
        showOverflow: true,
        showHeaderOverflow: true,
        sortable: true,
        minWidth: 150,
      },
      {
        field: 'calledName',
        title: '被叫名称',
        showOverflow: true,
        showHeaderOverflow: true,
        sortable: true,
        minWidth: 150,
      },
      {
        field: 'callTypeDescription',
        title: '呼叫类型',
        showOverflow: true,
        showHeaderOverflow: true,
        sortable: true,
        minWidth: 100,
      },
      {
        field: 'callTimeSpan',
        title: '持续时长',
        showOverflow: true,
        showHeaderOverflow: true,
        sortable: true,
        // slots: {
        //   default: 'duration',
        // },
        minWidth: 120,
      },
      {
        field: 'startTime',
        title: '拨打时间',
        minWidth: 150,
        showOverflow: true,
        showHeaderOverflow: true,
        sortable: true,
      },
      {
        field: 'acceptTime',
        title: '接通时间',
        minWidth: 150,
        showOverflow: true,
        showHeaderOverflow: true,
        sortable: true,
      },
      {
        field: 'endTime',
        title: '结束时间',
        minWidth: 150,
        showOverflow: true,
        showHeaderOverflow: true,
        sortable: true,
      },
      {
        field: 'remoteName',
        title: '对端用户名',
        showOverflow: true,
        showHeaderOverflow: true,
        sortable: true,
        visible: false,
        minWidth: 120,
      },
      {
        field: 'remoteNumber',
        title: '对端ISDN号',
        showOverflow: true,
        showHeaderOverflow: true,
        sortable: true,
        visible: false,
        minWidth: 120,
      },
      {
        field: 'isOnline',
        title: '是否在线',
        showOverflow: true,
        showHeaderOverflow: true,
        cellRender: { name: 'render_isno' },
        minWidth: 100,
      },
      {
        field: 'recordStateDescription',
        title: '录音状态',
        showOverflow: true,
        showHeaderOverflow: true,
        sortable: true,
        minWidth: 100,
      },
      {
        field: 'logKey',
        title: '录音文件地址',
        showOverflow: true,
        showHeaderOverflow: true,
        sortable: true,
        visible: false,
        minWidth: 150,
      },
      {
        field: 'recordFileStatus',
        title: '录音文件状态',
        showOverflow: true,
        showHeaderOverflow: true,
        sortable: true,
        slots: {
          default: 'recordFileStatus',
        },
        minWidth: 150,
      },
      {
        field: 'recordFileTime',
        title: '录音文件状态时间',
        minWidth: 150,
        showOverflow: true,
        showHeaderOverflow: true,
        sortable: true,
        visible: false,
        formatter: ({ cellValue }) => {
          return cellValue ? dayjs(cellValue).format('YYYY-MM-DD HH:mm:ss') : '';
        },
      },
      {
        title: '操作',
        minWidth: 90,
        slots: {
          default: 'default',
        },
        showOverflow: true,
        showHeaderOverflow: true,
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

  const timeValue = ref(null);
  //   [
  //   dayjs(dayjs().subtract(7, 'day').format('YYYY-MM-DD')),
  //   dayjs(dayjs().add(1, 'day').format('YYYY-MM-DD')),
  // ]
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
            const oldData = tableRef.value.getRowById(data.callId);
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
                      ? '获取成功'
                      : data.recordFileStatus == 2
                        ? '正在获取'
                        : data.recordFileStatus == 3
                          ? '正在存储'
                          : '获取失败'
                    : data.message,
                );
              }
            } else if (data.recordFileStatus == 1) {
              myCommon.downLoadFileByUrl(data.recordFile);
            } else {
              message.info(
                data.message == null
                  ? data.recordFileStatus == 1
                    ? '获取成功'
                    : data.recordFileStatus == 2
                      ? '正在获取'
                      : data.recordFileStatus == 3
                        ? '正在存储'
                        : '获取失败'
                  : data.message,
              );
            }
          });
      }
    } else {
      message.info('服务与网管系统掉线，不可获取');
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
    timeValue.value = null;
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
    exportDataSpinning.value = true;
    getSelectWhere();
    callRecordApi
      .ExportData({
        PageIndex: page.current,
        PageSize: page.size,
        ...seacthContent.value,
        fullSort: getFullSort(),
        execompleteBefore: () => {
          exportDataSpinning.value = false;
        },
      })
      .then((data) => {
        myCommon.downLoadFile(data);
      });
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
        const oldData = tableRef.value.getRowById(mqttStore.callRecordChange.callId);
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
        const oldData = tableRef.value.getRowById(mqttStore.callRecordChange.callId);
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
