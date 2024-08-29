<template>
  <MyContent ref="myContentRef">
    <vxe-grid
      v-bind="tableConfig"
      id="mytable"
      ref="tableRef"
      :auto-resize="true"
      :loading="loading"
      :seq-config="{ startIndex: (page.current - 1) * page.size }"
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
                    <label>开始时间：</label>
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
                      @change="
                        () => {
                          seacthContent.msgType = null;
                        }
                      "
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
                      :options="
                        seacthContent.serviceId != null &&
                        serviceData.find((m) => m.key == seacthContent.serviceId).serviceType !=
                          null
                          ? dictionariesData.filter(
                              (m) =>
                                m.serviceType ==
                                  serviceData.find((m) => m.key == seacthContent.serviceId)
                                    .serviceType || m.serviceType == null,
                            )
                          : dictionariesData
                      "
                    />
                  </a-space>
                </div>
                <div class="row-div">
                  <a-space direction="horizontal" size="small" :wrap="true">
                    <label>信息大类：</label>
                    <a-select
                      style="width: 170px"
                      allow-clear
                      v-model:value="seacthContent.msgClass"
                    >
                      <a-select-option :value="2">告警</a-select-option>
                      <a-select-option :value="1">提示</a-select-option>
                    </a-select>
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
                    </a-select>
                  </a-space>
                </div>
                <div class="row-div">
                  <a-space direction="horizontal" size="small" :wrap="true">
                    <label>确认状态：</label>
                    <a-select
                      style="width: 170px"
                      allow-clear
                      v-model:value="seacthContent.isConfirm"
                    >
                      <a-select-option :value="true">已确认</a-select-option>
                      <a-select-option :value="false">未确认</a-select-option>
                    </a-select>
                  </a-space>
                </div>
                <!-- <div class="row-div">
                  <a-space direction="horizontal" size="small" :wrap="true">
                    <label>信息标题：</label>
                    <a-input
                      @press-enter="initPage()"
                      v-model:value="seacthContent.msgTitle"
                      placeholder="输入信息标题查询"
                    />
                  </a-space>
                </div> -->
                <div class="row-div">
                  <a-space direction="horizontal" size="small" :wrap="true">
                    <label>信息内容：</label>
                    <a-input
                      @press-enter="initPage()"
                      v-model:value="seacthContent.msgContent"
                      placeholder="输入信息内容查询"
                    />
                  </a-space>
                </div>
                <div class="row-div">
                  <a-space direction="horizontal" size="small" :wrap="true">
                    <a-button @click="initPage()" type="primary">查询</a-button>
                    <a-button @click="resetSeacth">重置表单</a-button>
                    <a-spin :spinning="exportDataSpinning">
                      <a-button @click="exportData" type="primary">导出</a-button>
                    </a-spin>
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
      <template #msgClass="{ row }">
        <span
          :style="{
            color: row.msgClass == '告警' ? 'red' : '',
          }"
          >{{ row.msgClass }}</span
        >
      </template>
      <template #msgStatus="{ row }">
        <span
          :style="{
            color: row.msgStatus == '故障' ? 'red' : row.msgStatus == '恢复' ? 'green' : '',
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
                : row.msgDuration > 3600 && row.msgDuration <= 86400
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
              :class="{ 'not-click': row.msgClass == '提示' }"
              name="icon-baseui-show"
              @click="showMgsHis(row)"
              style="color: #0fc10e"
              title="查看告警记录"
            />
          </AuthDom>
          <AuthDom auth="message_repair">
            <IconFontClass
              :class="{ 'not-click': row.msgClass == '提示' }"
              name="icon-baseui-zijianrizhi"
              @click="showRepair(row)"
              style="color: #0749df"
              title="告警处理"
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
          <!-- <div>
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
          </div> -->
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
    <a-drawer
      :headerStyle="{ height: '49px', borderBottom: '2px solid #eee' }"
      :width="500"
      :visible="isShowRepair"
      title="处理内容"
      :footer-style="{ textAlign: 'right' }"
      @close="closeRepair"
    >
      <a-form
        :label-col="{ span: 4 }"
        :style="{ paddingRight: '2px' }"
        :wrapper-col="{ span: 20 }"
        autocomplete="off"
        ref="formRef"
        :model="formData"
      >
        <a-form-item
          name="briefRepairMethods"
          label="处理内容"
          :rules="[
            { required: true, message: '请输入处理内容' },
            { max: 1063, message: '处理内容过长' },
          ]"
        >
          <a-textarea
            placeholder="请输入处理内容"
            :rows="20"
            v-model:value="formData.briefRepairMethods"
            autocomplete="off"
          />
        </a-form-item>
      </a-form>
      <template #footer>
        <a-spin :spinning="fromRepaiSpinning">
          <a-button type="primary" @click="saveFromRepair">保存</a-button>
          <a-button style="margin-left: 8px" @click="closeRepair">关闭</a-button>
        </a-spin>
      </template>
    </a-drawer>
  </MyContent>
</template>
<script setup lang="ts">
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
      { type: 'seq', title: '序号', minWidth: 70, fixed: 'left' },
      {
        field: 'msgId',
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
        showOverflow: true,
        visible: false,
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
        field: 'msgClass',
        title: '信息大类',
        showOverflow: true,
        showHeaderOverflow: true,
        sortable: true,
        minWidth: 100,
        slots: {
          default: 'msgClass',
        },
      },
      {
        field: 'msgType',
        title: '信息类型',
        showHeaderOverflow: true,
        sortable: true,
        minWidth: 200,
      },
      {
        field: 'msgStatus',
        title: '信息状态',
        showOverflow: true,
        showHeaderOverflow: true,
        sortable: true,
        minWidth: 100,
        slots: {
          default: 'msgStatus',
        },
      },
      {
        field: 'msgTitle',
        title: '信息标题',
        showHeaderOverflow: true,
        sortable: true,
        visible: false,
        minWidth: 150,
      },
      {
        field: 'msgContent',
        title: '信息内容',
        showOverflow: false,
        showHeaderOverflow: true,
        sortable: true,
        minWidth: 200,
      },
      {
        field: 'msgStartTime',
        title: '开始时间',
        minWidth: 150,
        showOverflow: true,
        showHeaderOverflow: true,
        sortable: true,
      },
      {
        field: 'msgEndTime',
        title: '结束时间',
        minWidth: 150,
        showOverflow: true,
        showHeaderOverflow: true,
        sortable: true,
      },
      {
        field: 'msgDuration',
        title: '持续时长',
        showOverflow: true,
        showHeaderOverflow: true,
        sortable: true,
        slots: {
          default: 'msgDuration',
        },
        minWidth: 100,
      },
      {
        field: 'confirmUserName',
        title: '确认人员',
        showOverflow: true,
        showHeaderOverflow: true,
        sortable: true,
        visible: false,
        minWidth: 100,
      },
      {
        field: 'confirmTime',
        title: '确认时间',
        minWidth: 150,
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
        minWidth: 150,
      },
      {
        field: 'createTime',
        title: '创建时间',
        minWidth: 150,
        showOverflow: true,
        showHeaderOverflow: true,
        visible: false,
        sortable: true,
      },
      // {
      //   title: '告警强提示',
      //   minWidth: 180,
      //   slots: {
      //     default: 'strongPrompting',
      //   },
      //   showOverflow: true,
      //   showHeaderOverflow: true,
      //   visible: false,
      // },
      // {
      //   title: '是否已读',
      //   slots: {
      //     default: 'read',
      //   },
      //   showHeaderOverflow: true,
      //   fixed: 'right',
      // },
      {
        field: 'briefRepairMethods',
        title: '处理内容',
        showOverflow: false,
        showHeaderOverflow: true,
        sortable: true,
        minWidth: 200,
        visible: false,
      },
      {
        field: 'briefRepairUserName',
        title: '处理人员',
        showOverflow: false,
        showHeaderOverflow: true,
        sortable: true,
        minWidth: 100,
        visible: false,
      },
      {
        field: 'briefRepairTime',
        title: '处理时间',
        showOverflow: false,
        showHeaderOverflow: true,
        sortable: true,
        minWidth: 150,
        visible: false,
      },
      {
        title: '操作',
        slots: {
          default: 'default',
        },
        showHeaderOverflow: true,
        fixed: 'right',
        minWidth: 110,
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
  const formRef = ref({});
  const seacthContent = ref({
    serviceId: null,
    msgType: '',
    msgStatus: null,
    msgTitle: '',
    msgContent: '',
    startTime: null,
    endTime: null,
    isConfirm: null,
    msgClass: msgId == null ? 2 : null,
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
  const isShowRepair = ref(false);
  const fromRepaiSpinning = ref(false);
  const formData = reactive({
    msgId: null,
    briefRepairMethods: null,
  });
  const exportDataSpinning = ref(false);
  getMessages(msgId == null);
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
    getMessages();
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
      isConfirm: null,
      msgClass: 2,
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

  //确认告警
  function okMsg(row) {
    if (!row.confirmTime && !row.confirmUser) {
      messageApi
        .OkMsg(row.msgId)
        .then((data) => {
          message.success('确认告警成功');
          const oldData = tableRef.value.getRowById(data.msgId);
          oldData.confirmTime = data.confirmTime;
          oldData.confirmUserName = data.confirmUserName;
        })
        .catch(() => {
          message.error('确认告警失败');
        });
    } else {
      message.info('该告警已被确认');
    }
  }

  //显示修复建议
  function showRepair(row) {
    formData.msgId = row.msgId;
    messageApi
      .GetRepair(row.msgId)
      .then((data) => {
        isShowRepair.value = true;
        formData.briefRepairMethods = data;
      })
      .catch(() => {
        isShowRepair.value = true;
      });
  }
  function closeRepair() {
    formData.briefRepairMethods = null;
    isShowRepair.value = false;
  }
  function saveFromRepair() {
    formRef.value.validate().then(() => {
      fromRepaiSpinning.value = true;
      messageApi
        .UpdateRepair({
          ...formData,
          execompleteBefore: () => {
            fromRepaiSpinning.value = false;
          },
        })
        .then((data) => {
          if (data) {
            message.success('更改处理内容成功');
            const oldData = tableRef.value.getRowById(formData.msgId);
            if (oldData) {
              oldData.briefRepairMethods = data.briefRepairMethods;
              oldData.briefRepairTime = data.briefRepairTime;
              oldData.briefRepairUserName = data.name;
            }
            isShowRepair.value = false;
          } else {
            message.error('更改处理内容失败');
          }
        })
        .catch(() => {
          message.error('更改处理内容出错');
        });
    });
  }

  function exportData() {
    exportDataSpinning.value = true;
    seacthContent.value.startTime =
      timeValue.value == null ? null : timeValue.value[0].format('YYYY-MM-DD HH:mm:ss');
    seacthContent.value.endTime =
      timeValue.value == null ? null : timeValue.value[1].format('YYYY-MM-DD HH:mm:ss');
    messageApi
      .ExportData({
        msgId,
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
