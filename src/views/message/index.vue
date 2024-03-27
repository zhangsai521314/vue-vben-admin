<template>
  <MyContent ref="myContentRef">
    <vxe-grid
      v-bind="tableConfig"
      id="mytable"
      ref="tableRef"
      :loading="loading"
      :column-config="{ resizable: true }"
      :custom-config="{ storage: true }"
    >
      <template #toolbar_buttons>
        <div :class="`tableBtn`">
          <a-space direction="horizontal" size="small" style="margin-left: 5px">
            <AuthDom auth="message_query">
              <a-space direction="horizontal" size="small" :wrap="true" style="margin-bottom: 0px">
                <div class="row-div">
                  <a-space direction="horizontal" size="small" :wrap="true">
                    <label>告警时间：</label>
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
                      style="width: 170px"
                      allow-clear
                      show-search
                      :filter-option="AntVueCommon.filterOption"
                      v-model:value="seacthContent.joinId"
                      :options="serviceData"
                    />
                  </a-space>
                </div>
                <div class="row-div">
                  <a-space direction="horizontal" size="small" :wrap="true">
                    <label>告警类型：</label>
                    <a-select
                      style="width: 170px"
                      allow-clear
                      show-search
                      :filter-option="AntVueCommon.filterOption"
                      v-model:value="seacthContent.alarmType"
                      :options="dictionariesData"
                    />
                  </a-space>
                </div>
                <div class="row-div">
                  <a-space direction="horizontal" size="small" :wrap="true">
                    <label>告警状态：</label>
                    <a-select
                      style="width: 170px"
                      allow-clear
                      v-model:value="seacthContent.alarmStatus"
                    >
                      <a-select-option :value="1">故障</a-select-option>
                      <a-select-option :value="2">恢复</a-select-option>
                      <a-select-option :value="3">确认</a-select-option>
                    </a-select>
                  </a-space>
                </div>
                <div class="row-div">
                  <a-space direction="horizontal" size="small" :wrap="true">
                    <label>告警名称：</label>
                    <a-input
                      @press-enter="getMessages()"
                      v-model:value="seacthContent.alarmTitle"
                      placeholder="输入告警名称查询"
                    />
                  </a-space>
                </div>
                <div class="row-div">
                  <a-space direction="horizontal" size="small" :wrap="true">
                    <label>告警信息：</label>
                    <a-input
                      @press-enter="getMessages()"
                      v-model:value="seacthContent.alarmMsg"
                      placeholder="输入告警信息查询"
                    />
                  </a-space>
                </div>
                <div class="row-div">
                  <a-space direction="horizontal" size="small" :wrap="true">
                    <a-button @click="getMessages()" type="primary">查询</a-button>
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
      <template #alarmStatus="{ row }">
        <span
          :style="{
            color:
              row.alarmStatus == '故障'
                ? 'red'
                : row.alarmStatus == '恢复'
                ? 'green'
                : row.alarmStatus == '确认'
                ? '#0960bd '
                : '',
          }"
          >{{ row.alarmStatus }}</span
        >
      </template>
      <template #alarmDuration="{ row }">
        {{
          row.alarmDuration == null
            ? ''
            : row.alarmDuration >= 0 && row.alarmDuration <= 60
            ? `${parseInt(row.alarmDuration)}秒`
            : row.alarmDuration > 60 && row.alarmDuration <= 360
            ? `${parseInt(row.alarmDuration / 60)}分`
            : row.alarmDuration > 360 && row.alarmDuration <= 86400
            ? `${parseInt(row.alarmDuration / 60 / 60)}时`
            : row.alarmDuration > 86400
            ? `${parseInt(row.alarmDuration / 60 / 60 / 24)}天`
            : ''
        }}
      </template>
      <!-- <template #default="{ row }">
        <div :class="`tableOption`">
          <AuthDom auth="message.edit">
            <IconFontClass
              name="icon-baseui-show"
              @click="showFrom(row)"
              style="color: #0fc10e"
              title="查看告警记录"
            />
          </AuthDom>
        </div>
      </template> -->
    </vxe-grid>
  </MyContent>
</template>
<script setup lang="tsx">
  import AntVueCommon from '@/utils/MyCommon/AntVueCommon';
  import myCommon from '@/utils/MyCommon/common';
  import { ref, reactive, createVNode, nextTick, watch, onMounted } from 'vue';
  import { useDesign } from '@/hooks/web/useDesign';
  import { VxeGrid, VxeGridProps } from 'vxe-table';
  import messageApi from '@/api/message';
  import dictionariesApi from '@/api/dictionaries';
  import serviceApi from '@/api/software';
  import zhCN from 'ant-design-vue/es/locale/zh_CN';
  import dayjs from 'dayjs';
  import 'dayjs/locale/zh-cn';
  import { tryOnUnmounted } from '@vueuse/core';

  defineOptions({ name: 'message' });
  const { prefixCls } = useDesign('message-');
  const loading = ref(true);
  const tableConfig = reactive<VxeGridProps>({
    height: 'auto',
    columns: [
      //基础
      {
        field: 'alarmId',
        title: '告警ID',
        visible: false,
        showOverflow: true,
        showHeaderOverflow: true,
      },
      {
        field: 'joinId',
        title: '服务id',
        showOverflow: true,
        visible: false,
        showHeaderOverflow: true,
      },
      {
        field: 'serviceName',
        title: '服务名称',
        showOverflow: true,
        showHeaderOverflow: true,
      },
      {
        field: 'alarmType',
        title: '告警类型',
        showOverflow: true,
        showHeaderOverflow: true,
      },
      {
        field: 'alarmStatus',
        title: '告警状态',
        showOverflow: true,
        showHeaderOverflow: true,
        slots: {
          default: 'alarmStatus',
        },
      },
      {
        field: 'alarmTitle',
        title: '告警标题',
        showOverflow: true,
        showHeaderOverflow: true,
      },
      {
        field: 'alarmMsg',
        title: '告警信息',
        showOverflow: true,
        showHeaderOverflow: true,
      },
      {
        field: 'alarmTime',
        title: '告警开始时间',
        width: 150,
        showOverflow: true,
        showHeaderOverflow: true,
      },
      {
        field: 'alarmTimeEnd',
        title: '告警结束时间',
        width: 150,
        showOverflow: true,
        showHeaderOverflow: true,
      },
      {
        field: 'alarmDuration',
        title: '告警持续时长',
        showOverflow: true,
        showHeaderOverflow: true,
        slots: {
          default: 'alarmDuration',
        },
      },
      {
        field: 'confirmUser',
        title: '确认人员',
        showOverflow: true,
        showHeaderOverflow: true,
      },
      {
        field: 'confirmTime',
        title: '确认时间',
        width: 150,
        showOverflow: true,
        showHeaderOverflow: true,
      },
      {
        field: 'remark',
        title: '备注信息',
        showOverflow: true,
        showHeaderOverflow: true,
        visible: false,
      },
      {
        field: 'createTime',
        title: '创建时间',
        width: 150,
        showOverflow: true,
        showHeaderOverflow: true,
        visible: false,
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
    joinId: null,
    alarmName: '',
    alarmType: '',
    alarmStatus: null,
    alarmTitle: '',
    alarmMsg: '',
    startTime: null,
    endTime: null,
  });
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
  const refresh = ref('yes');
  const refreshTime = ref(10);
  let refreshTimeId;

  getMessages(true);
  getDictionaries();
  getServices();

  //获取列表
  function getMessages(isAuto = false) {
    if (!isAuto) {
      refresh.value = 'no';
    }
    loading.value = true;
    seacthContent.value.startTime =
      timeValue.value == null ? null : timeValue.value[0].format('YYYY-MM-DD HH:mm:ss');
    seacthContent.value.endTime =
      timeValue.value == null ? null : timeValue.value[1].format('YYYY-MM-DD HH:mm:ss');
    messageApi
      .GetMessages({
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
      joinId: null,
      alarmName: '',
      alarmType: '',
      alarmStatus: null,
      alarmTitle: '',
      alarmMsg: '',
      startTime: null,
      endTime: null,
    };

    timeValue.value = [
      dayjs(dayjs().subtract(7, 'day').format('YYYY-MM-DD')),
      dayjs(dayjs().add(1, 'day').format('YYYY-MM-DD')),
    ];
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

  function handlePageChange() {
    getMessages();
  }

  function refreshData() {
    if (refresh.value == 'yes') {
      refreshTimeId = setTimeout(() => {
        if (refreshTime.value <= 0) {
          refreshTime.value = 10;
          nextTick(() => {
            getMessages(true);
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
  @prefixCls: ~'@{namespace}-message-';

  .tableBtn {
    width: 100%;
  }
</style>
