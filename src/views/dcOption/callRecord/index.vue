<template>
  <MyContent :class="prefixCls">
    <vxe-grid
      v-bind="tableConfig"
      id="mytable"
      ref="tableRef"
      :loading="loading"
      :row-config="{ keyField: 'callId' }"
      :column-config="{ resizable: true }"
      :custom-config="{ storage: true }"
    >
      <template #toolbar_buttons>
        <div :class="`tableBtn`">
          <a-space direction="horizontal" size="small" style="margin-left: 5px">
            <AuthDom auth="message_query">
              <a-space direction="horizontal" size="small" :wrap="true" style="margin-bottom: 0">
                <div class="row-div">
                  <a-space direction="horizontal" size="small" :wrap="true">
                    <label>通话时间：</label>
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
                    <label>通话来源：</label>
                    <a-select
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
                      @press-enter="getDCOptionCallRecords()"
                      v-model:value="seacthContent.mainCallName"
                      placeholder="输入主叫名称查询"
                    />
                  </a-space>
                </div>
                <div class="row-div">
                  <a-space direction="horizontal" size="small" :wrap="true">
                    <label>被叫名称：</label>
                    <a-input
                      @press-enter="getDCOptionCallRecords()"
                      v-model:value="seacthContent.calledName"
                      placeholder="输入被叫名称查询"
                    />
                  </a-space>
                </div>
                <div class="row-div">
                  <a-space direction="horizontal" size="small" :wrap="true">
                    <a-input v-model:value="callTimeSpan" style="width: 260px">
                      <template #addonBefore>
                        <a-select v-model:value="callTimeSpanQueryType" style="width: 130px">
                          <a-select-option :value="3">{{ '通话时长 >=' }}</a-select-option>
                          <a-select-option :value="5">{{ '通话时长 <=' }}</a-select-option>
                        </a-select>
                      </template>
                      <template #addonAfter>
                        <span>分钟</span>
                      </template>
                    </a-input>
                  </a-space>
                </div>
                <div class="row-div">
                  <a-space direction="horizontal" size="small" :wrap="true">
                    <a-button @click="getDCOptionCallRecords()" type="primary">查询</a-button>
                    <a-button @click="resetSeacth">重置表单</a-button>
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
      <template #callTimeSpan="{ row }">
        {{
          row.callTimeSpan == null
            ? ''
            : row.callTimeSpan >= 0 && row.callTimeSpan <= 60
              ? `${parseInt(row.callTimeSpan)} 秒`
              : row.callTimeSpan > 60 && row.callTimeSpan <= 3600
                ? `${parseFloat(row.callTimeSpan / 60).toFixed(1)} 分`
                : row.callTimeSpan > 360 && row.callTimeSpan <= 86400
                  ? `${parseFloat(row.callTimeSpan / 60 / 60).toFixed(1)} 时`
                  : row.callTimeSpan > 86400
                    ? `${parseFloat(row.callTimeSpan / 60 / 60 / 24).toFixed(1)} 天`
                    : ''
        }}
      </template>
      <template #default="{ row }">
        <div :class="`tableOption`">
          <AuthDom auth="DCOptionCallRecord.edit">
            <IconFontClass
              name="icon-baseui-bofang"
              @click="getCallRecordFilePath(row, 'play')"
              style="color: #0fc10e"
              title="播放"
            />
          </AuthDom>
          <AuthDom auth="DCOptionCallRecord.down">
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
<script setup lang="tsx">
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
      { type: 'seq', title: '序号', width: 50 },
      {
        field: 'callId',
        title: '主键ID',
        visible: false,
        showOverflow: true,
        showHeaderOverflow: true,
      },
      {
        field: 'serviceCode',
        title: '服务编号',
        visible: false,
        showOverflow: true,
        showHeaderOverflow: true,
      },
      {
        field: 'callState',
        title: '通话状态',
        visible: false,
        showOverflow: true,
        showHeaderOverflow: true,
      },
      {
        field: 'serviceName',
        title: '服务名称',
        showOverflow: true,
        visible: false,
        showHeaderOverflow: true,
      },
      {
        field: 'callDirectionDescription',
        title: '呼叫方向',
        showOverflow: true,
        showHeaderOverflow: true,
      },
      {
        field: 'mainCallName',
        title: '主叫名称',
        showOverflow: true,
        showHeaderOverflow: true,
      },
      {
        field: 'calledName',
        title: '被叫名称',
        showOverflow: true,
        showHeaderOverflow: true,
      },
      {
        field: 'callTypeDescription',
        title: '呼叫类型',
        showOverflow: true,
        showHeaderOverflow: true,
      },
      {
        field: 'callTimeSpan',
        title: '持续时长',
        showOverflow: true,
        showHeaderOverflow: true,
        slots: {
          default: 'callTimeSpan',
        },
      },
      {
        field: 'startTime',
        title: '开始时间',
        width: 150,
        showOverflow: true,
        showHeaderOverflow: true,
      },
      {
        field: 'endTime',
        title: '结束时间',
        width: 150,
        showOverflow: true,
        showHeaderOverflow: true,
      },
      {
        field: 'remoteName',
        title: '对端用户名',
        showOverflow: true,
        showHeaderOverflow: true,
      },
      {
        field: 'remoteNumber',
        title: '对端ISDN号',
        showOverflow: true,
        showHeaderOverflow: true,
      },
      {
        field: 'recordStateDescription',
        title: '录音状态',
        showOverflow: true,
        showHeaderOverflow: true,
      },
      {
        field: 'recordFileStatus',
        title: '录音文件',
        showOverflow: true,
        showHeaderOverflow: true,
        slots: {
          default: 'recordFileStatus',
        },
      },
      {
        field: 'recordFileTime',
        title: '录音文件状态时间',
        width: 150,
        showOverflow: true,
        showHeaderOverflow: true,
      },
      {
        title: '操作',
        width: 140,
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
  const callTimeSpanQueryType = ref(5);
  const callTimeSpanUnit = ref('MM');
  const callTimeSpan = ref(null);

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
  });
  const modelShow = ref(false);
  //正在或将要播放的记录id
  let playCallId = null;
  //是否正在播放
  const isRunPlay = ref(false);
  //录音文件状态
  const playFileStatus = ref(0);
  const playRef = ref(null);

  getDCOptionCallRecords();
  getDictionaries();
  getServices();

  //播放
  function getCallRecordFilePath(row, OperationType) {
    console.log(mqttStore);
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
              message.info(data.message);
            }
          } else if (data.recordFileStatus == 1) {
            myCommon.downLoadFileByUrl(data.recordFile);
          } else {
            message.info(data.message);
          }
        });
    }
  }

  //获取列表
  function getDCOptionCallRecords() {
    loading.value = true;
    seacthContent.value.startTime =
      timeValue.value == null ? null : timeValue.value[0].format('YYYY-MM-DD HH:mm:ss');
    seacthContent.value.endTime =
      timeValue.value == null ? null : timeValue.value[1].format('YYYY-MM-DD HH:mm:ss');
    if (!myCommon.isnull(callTimeSpan.value)) {
      seacthContent.value.SearchParameters = [
        {
          FieldName: 'callTimeSpan',
          ConditionalType: callTimeSpanQueryType.value,
          FieldValue: callTimeSpanUnit.value == 'MM' ? callTimeSpan.value * 60 : null,
        },
      ];
    } else {
      seacthContent.value.SearchParameters = [];
    }
    callRecordApi
      .GetDCOptionCallRecords({
        PageIndex: page.current,
        PageSize: page.size,
        ...seacthContent.value,
        execompleteBefore: () => {
          loading.value = false;
        },
      })
      .then((data) => {
        tableConfig.data = data.source;
        page.total = data.totalCount;
      })
      .catch(() => {
        tableConfig.data = [];
        page.total = 0;
      });
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
    callTimeSpanQueryType.value = 5;
    callTimeSpanUnit.value = 'MM';
    callTimeSpan.value = null;
  }

  //获取字典
  function getDictionaries() {
    dictionariesApi
      .GetDictionariesimple({
        dictionariesclass: ['alarmType'],
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
      .GetServicesSimple({})
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
</style>
