<template>
  <MyContent ref="myContentRef">
    <vxe-grid
      v-bind="tableConfig"
      id="mytable"
      ref="tableRef"
      :loading="loading"
      :row-config="{ keyField: 'msgId' }"
      :column-config="{ resizable: true }"
      :custom-config="{ storage: true }"
      @sort-change="onSortChange"
    >
      <template #toolbar_buttons>
        <div :class="`tableBtn`">
          <a-space direction="horizontal" size="small" style="margin-left: 5px">
            <AuthDom auth="message_query">
              <a-space direction="horizontal" size="small" :wrap="true" style="margin-bottom: 0">
                <div class="row-div">
                  <a-space direction="horizontal" size="small" :wrap="true">
                    <label>信息时间：</label>
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
                      v-model:value="seacthContent.serviceId"
                      :options="serviceData"
                    />
                  </a-space>
                </div>
                <div class="row-div">
                  <a-space direction="horizontal" size="small" :wrap="true">
                    <label>信息类型：</label>
                    <a-select
                      style="width: 170px"
                      allow-clear
                      show-search
                      :filter-option="AntVueCommon.filterOption"
                      v-model:value="seacthContent.msgType"
                      :options="dictionariesData"
                    />
                  </a-space>
                </div>
                <div class="row-div">
                  <a-space direction="horizontal" size="small" :wrap="true">
                    <label>信息状态：</label>
                    <a-select
                      style="width: 170px"
                      allow-clear
                      v-model:value="seacthContent.msgStatus"
                    >
                      <a-select-option :value="1">故障</a-select-option>
                      <a-select-option :value="2">恢复</a-select-option>
                      <a-select-option :value="3">确认</a-select-option>
                    </a-select>
                  </a-space>
                </div>
                <div class="row-div">
                  <a-space direction="horizontal" size="small" :wrap="true">
                    <label>信息名称：</label>
                    <a-input
                      @press-enter="getMessages()"
                      v-model:value="seacthContent.msgTitle"
                      placeholder="输入告警名称查询"
                    />
                  </a-space>
                </div>
                <div class="row-div">
                  <a-space direction="horizontal" size="small" :wrap="true">
                    <label>信息内容：</label>
                    <a-input
                      @press-enter="getMessages()"
                      v-model:value="seacthContent.msgContent"
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
      <template #strongPrompting="{ row }">
        <span
          v-if="
            mqttStore.msgStrongPromptingTime[
              `${row.serviceId}_${row.msgCategory}_${row.msgClass}_${row.msgStatus}`
            ] != null &&
            mqttStore.msgStrongPromptingTime[
              `${row.serviceId}_${row.msgCategory}_${row.msgClass}_${row.msgStatus}`
            ].time.isAfter(dayjs())
          "
          style="color: red"
          >否.{{
            mqttStore.msgStrongPromptingTime[
              `${row.serviceId}_${row.msgCategory}_${row.msgClass}_${row.msgStatus}`
            ].time.format('YYYY-MM-DD HH:mm:ss')
          }}</span
        >
        <span v-else style="color: green">是</span>
      </template>
      <template #msgStatus="{ row }">
        <span
          :style="{
            color:
              row.msgStatus == '故障'
                ? 'red'
                : row.msgStatus == '恢复'
                  ? 'green'
                  : row.msgStatus == '确认'
                    ? '#0960bd '
                    : '',
          }"
          >{{ row.msgStatus }}</span
        >
      </template>
      <template #read="{ row }">
        <a-tag style="width: 38px; margin: 0" :color="row.isRead ? '' : 'red'">{{
          row.isRead ? '已读' : '未读'
        }}</a-tag>
      </template>
      <template #msgDuration="{ row }">
        {{
          row.msgDuration == null
            ? ''
            : row.msgDuration >= 0 && row.msgDuration <= 60
              ? `${parseInt(row.msgDuration)} 秒`
              : row.msgDuration > 60 && row.msgDuration <= 3600
                ? `${parseFloat(row.msgDuration / 60).toFixed(1)} 分`
                : row.msgDuration > 360 && row.msgDuration <= 86400
                  ? `${parseFloat(row.msgDuration / 60 / 60).toFixed(1)} 时`
                  : row.msgDuration > 86400
                    ? `${parseFloat(row.msgDuration / 60 / 60 / 24).toFixed(1)} 天`
                    : ''
        }}
      </template>
      <template #default="{ row }">
        <div :class="`tableOption`">
          <AuthDom auth="message_msg_queren">
            <IconFontClass
              name="icon-baseui-queren"
              @click="okMsg(row)"
              style="color: #0749df"
              title="确认告警"
            />
          </AuthDom>
          <AuthDom auth="message_show_detail">
            <IconFontClass
              name="icon-baseui-show"
              @click="showMgsHis(row)"
              style="color: #0fc10e"
              title="查看告警记录"
            />
          </AuthDom>
          <!-- <AuthDom auth="message_show_read">
            <IconFontClass
              name="icon-baseui-zijianrizhi"
              @click="showFrom(row)"
              style="color: #0fc10e"
              title="查看消息已读"
            />
          </AuthDom> -->
          <div>
            <a-select
              placeholder="信息强提示设置"
              @change="(value) => changeStrongPrompting(value, row)"
              style="width: 100%"
              v-if="
                mqttStore.msgStrongPromptingTime[
                  `${row.serviceId}_${row.msgCategory}_${row.msgClass}_${row.msgStatus}`
                ] != null &&
                mqttStore.msgStrongPromptingTime[
                  `${row.serviceId}_${row.msgCategory}_${row.msgClass}_${row.msgStatus}`
                ].time.isAfter(dayjs())
              "
              :value="
                mqttStore.msgStrongPromptingTime[
                  `${row.serviceId}_${row.msgCategory}_${row.msgClass}_${row.msgStatus}`
                ].timeFrequency
              "
            >
              <a-select-option value="">立即提示</a-select-option>
              <a-select-option :value="10">10分钟后提示</a-select-option>
              <a-select-option :value="30">30分钟后提示</a-select-option>
              <a-select-option :value="60">1小时后提示</a-select-option>
            </a-select>
            <a-select
              v-else
              placeholder="信息强提示设置"
              style="width: 100%"
              @change="(value) => changeStrongPrompting(value, row)"
            >
              <a-select-option value="">立即提示</a-select-option>
              <a-select-option :value="10">10分钟后提示</a-select-option>
              <a-select-option :value="30">30分钟后提示</a-select-option>
              <a-select-option :value="60">1小时后提示</a-select-option>
            </a-select>
          </div>
        </div>
      </template>
    </vxe-grid>
    <a-drawer
      :headerStyle="{ height: '49px', borderBottom: '2px solid #eee' }"
      :width="1000"
      :visible="isShowVis"
      title="消息历史"
      :footer-style="{ textAlign: 'right' }"
      @close="closeHis"
    >
      <his :msgId="hisId" />
    </a-drawer>
  </MyContent>
</template>
<script setup lang="tsx">
  import his from './his.vue';
  import AntVueCommon from '@/utils/MyCommon/AntVueCommon';
  import myCommon from '@/utils/MyCommon/common';
  import { ref, reactive, createVNode, nextTick, watch, onMounted, unref } from 'vue';
  import { useDesign } from '@/hooks/web/useDesign';
  import { VxeGrid, VxeGridProps } from 'vxe-table';
  import messageApi from '@/api/message';
  import dictionariesApi from '@/api/dictionaries';
  import serviceApi from '@/api/software';
  import zhCN from 'ant-design-vue/es/locale/zh_CN';
  import dayjs from 'dayjs';
  import 'dayjs/locale/zh-cn';
  import { tryOnUnmounted } from '@vueuse/core';
  import { useMqttStoreWithOut } from '@/store/modules/mqtt';
  import { useRouter } from 'vue-router';
  import { message, Modal } from 'ant-design-vue';
  import { useUserStore } from '@/store/modules/user';

  defineOptions({ name: 'Message' });
  const userStore = useUserStore();
  const userData = ref(_.cloneDeep(userStore.getUserInfo));
  const mqttStore = useMqttStoreWithOut();
  const { currentRoute } = useRouter();
  //获取url参数
  let { msgId } = unref(currentRoute).params;
  msgId = msgId ? msgId : null;
  const { prefixCls } = useDesign('message-');
  const loading = ref(true);
  const tableConfig = reactive<VxeGridProps>({
    height: 'auto',
    columns: [
      //基础
      { type: 'seq', title: '序号', width: 50, fixed: 'left' },
      {
        field: 'msgId',
        title: '信息ID',
        visible: false,
        showOverflow: true,
        showHeaderOverflow: true,
      },
      {
        field: 'serviceCode',
        title: '服务编号',
        showOverflow: true,
        visible: false,
        showHeaderOverflow: true,
        sortable: true,
      },
      {
        field: 'serviceName',
        title: '服务名称',
        showOverflow: true,
        showHeaderOverflow: true,
        sortable: true,
      },
      {
        field: 'msgType',
        title: '信息类型',
        showOverflow: true,
        showHeaderOverflow: true,
        sortable: true,
        visible: false,
      },
      {
        field: 'msgStatus',
        title: '信息状态',
        showOverflow: true,
        showHeaderOverflow: true,
        sortable: true,
        slots: {
          default: 'msgStatus',
        },
      },
      {
        field: 'msgTitle',
        title: '信息标题',
        showOverflow: true,
        showHeaderOverflow: true,
        sortable: true,
      },
      {
        field: 'msgContent',
        title: '信息内容',
        showOverflow: false,
        showHeaderOverflow: true,
        sortable: true,
      },
      {
        field: 'msgStartTime',
        title: '告警开始时间',
        width: 150,
        showOverflow: true,
        showHeaderOverflow: true,
        sortable: true,
      },
      {
        field: 'msgEndTime',
        title: '告警结束时间',
        width: 150,
        showOverflow: true,
        showHeaderOverflow: true,
        sortable: true,
      },
      {
        field: 'msgDuration',
        title: '告警持续时长',
        showOverflow: true,
        showHeaderOverflow: true,
        sortable: true,
        slots: {
          default: 'msgDuration',
        },
      },
      {
        field: 'confirmUser',
        title: '确认人员',
        showOverflow: true,
        showHeaderOverflow: true,
        sortable: true,
      },
      {
        field: 'confirmTime',
        title: '确认时间',
        width: 150,
        showOverflow: true,
        showHeaderOverflow: true,
        sortable: true,
      },
      {
        field: 'remark',
        title: '备注信息',
        showOverflow: true,
        showHeaderOverflow: true,
        visible: false,
        sortable: true,
      },
      {
        field: 'createTime',
        title: '创建时间',
        width: 150,
        showOverflow: true,
        showHeaderOverflow: true,
        visible: false,
        sortable: true,
      },
      {
        title: '告警强提示',
        width: 180,
        slots: {
          default: 'strongPrompting',
        },
        showOverflow: true,
        showHeaderOverflow: true,
        visible: false,
      },
      // {
      //   title: '是否已读',
      //   slots: {
      //     default: 'read',
      //   },
      //   showHeaderOverflow: true,
      //   fixed: 'right',
      // },
      {
        title: '操作',
        width: 160,
        slots: {
          default: 'default',
        },
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
  const myContentRef = ref({});
  const seacthContent = ref({
    serviceId: null,
    msgType: '',
    msgStatus: null,
    msgTitle: '',
    msgContent: '',
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
    sortlist: ['msgStartTime desc'],
  });
  const refresh = ref('yes');
  const refreshTime = ref(10);
  let refreshTimeId;
  const hisId = ref('');
  const isShowVis = ref(false);

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
        msgId,
        PageIndex: page.current,
        PageSize: page.size,
        ...seacthContent.value,
        fullSort: getFullSort(),
        execompleteBefore: () => {
          loading.value = false;
          msgId = null;
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

  /**
   * 排序条件改变
   */
  function onSortChange({ field, order, sortList, column, property, $event }) {
    page.sortlist = [];
    sortList.forEach((item) => {
      var tempstr = item.field + ' ' + item.order;
      page.sortlist.push(tempstr);
    });
    getMessages();
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

  //重置搜索条件
  function resetSeacth() {
    seacthContent.value = {
      serviceId: null,
      msgType: '',
      msgStatus: null,
      msgTitle: '',
      msgContent: '',
      startTime: null,
      endTime: null,
    };

    timeValue.value = null;
  }

  //获取字典
  function getDictionaries() {
    dictionariesApi
      .GetDictionariesSimpleKey({
        dictionariesclass: ['msgType'],
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

  //分页切换
  function handlePageChange() {
    getMessages();
  }

  //刷新数据
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

  //停止刷新数据
  function stopRefresh() {
    clearTimeout(refreshTimeId);
    refresh.value = 'no';
    refreshTime.value = 10;
  }

  //强提示频率改变
  function changeStrongPrompting(timeFrequency, row) {
    if (timeFrequency == '') {
      mqttStore.clearMsgStrongPromptingTime(row);
    } else {
      mqttStore.addMsgStrongPromptingTime(row, timeFrequency);
    }
  }

  function showMgsHis(row) {
    hisId.value = row.msgId;
    isShowVis.value = true;
  }

  //关闭his
  function closeHis() {
    isShowVis.value = false;
    hisId.value = '';
  }

  function okMsg(row) {
    if (!row.confirmTime && !row.confirmUser) {
      messageApi
        .OkMsg(row.msgId)
        .then((data) => {
          message.success('确认告警成功');
          const oldData = tableRef.value.getRowById(data.msgId);
          oldData.confirmTime = data.confirmTime;
          oldData.confirmUser = userData.value.userName;
        })
        .catch(() => {
          message.error('确认告警失败');
        });
    } else {
      message.info('该告警已被确认');
    }
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
