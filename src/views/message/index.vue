<template>
  <MyContent ref="myContentRef">
    <vxe-grid
      :scroll-y="{ enabled: true }"
      v-bind="tableConfig"
      id="messageIndex"
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
                    <label>{{ t('view.startTime') }}：</label>
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
                    <label>{{ t('view.informationType') }}：</label>
                    <a-select
                      :placeholder="t('view.pleaseSelectInformationType')"
                      style="width: 170px"
                      allow-clear
                      show-search
                      :filter-option="AntVueCommon.filterOption"
                      v-model:value="seacthContent.msgType"
                      :options="
                        seacthContent.serviceId != null &&
                        serviceData.length > 0 &&
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
                    <label>{{ t('view.informationCategory') }}：</label>
                    <a-select
                      :placeholder="t('view.pleaseSelectInformationCategory')"
                      style="width: 170px"
                      allow-clear
                      v-model:value="seacthContent.msgClass"
                    >
                      <a-select-option :value="2">{{ t('view.alarm') }}</a-select-option>
                      <a-select-option :value="1">{{ t('view.tip') }}</a-select-option>
                    </a-select>
                  </a-space>
                </div>
                <div class="row-div">
                  <a-space direction="horizontal" size="small" :wrap="true">
                    <label>{{ t('view.informationStatus') }}：</label>
                    <a-select
                      :placeholder="t('view.pleaseSelectInformationStatus')"
                      style="width: 170px"
                      allow-clear
                      v-model:value="seacthContent.msgStatus"
                    >
                      <a-select-option :value="1">{{ t('view.fault') }}</a-select-option>
                      <a-select-option :value="2">{{ t('view.recovery') }}</a-select-option>
                    </a-select>
                  </a-space>
                </div>
                <div class="row-div">
                  <a-space direction="horizontal" size="small" :wrap="true">
                    <label>{{ t('view.confirmationStatus') }}：</label>
                    <a-select
                      :placeholder="t('view.pleaseSelectConfirmationStatus')"
                      style="width: 170px"
                      allow-clear
                      v-model:value="seacthContent.isConfirm"
                    >
                      <a-select-option :value="true">{{ t('view.confirmed') }}</a-select-option>
                      <a-select-option :value="false">{{ t('view.unconfirmed') }}</a-select-option>
                    </a-select>
                  </a-space>
                </div>
                <!-- <div class="row-div">
                  <a-space direction="horizontal" size="small" :wrap="true">
                    <label>信息标题：</label>
                    <a-input
                      @press-enter="initPage()"
                      v-model:value="seacthContent.msgTitle"
                      :placeholder="输入信息标题查询"
                    />
                  </a-space>
                </div> -->
                <div class="row-div">
                  <a-space direction="horizontal" size="small" :wrap="true">
                    <label>{{ t('view.informationContent') }}：</label>
                    <a-input
                      @press-enter="initPage()"
                      v-model:value="seacthContent.msgContent"
                      :placeholder="t('view.queryByInputtingInformationContent')"
                    />
                  </a-space>
                </div>
                <div class="row-div">
                  <a-space direction="horizontal" size="small" :wrap="true">
                    <a-button @click="initPage()" type="primary">{{ t('view.query') }}</a-button>
                    <a-button @click="resetSeacth">{{ t('view.resetForm') }}</a-button>
                    <a-spin :spinning="exportDataSpinning">
                      <a-button @click="exportData" type="primary">{{ t('view.export') }}</a-button>
                    </a-spin>
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
          >{{ t('view.no') }}.{{
            mqttStore.msgStrongPromptingTime[
              `${row.serviceId}_${row.msgCategory}_${row.msgClass}_${row.msgStatus}`
            ].time.format('YYYY-MM-DD HH:mm:ss')
          }}</span
        >
        <span v-else style="color: green">{{ t('view.yes') }}</span>
      </template>
      <template #msgClass="{ row }">
        <span
          :style="{
            color: row.msgClass == 2 ? 'red' : '',
          }"
          >{{
            row.msgClass == 1 ? t('view.tip') : row.msgClass == 2 ? t('view.alarm') : row.msgClass
          }}</span
        >
      </template>
      <template #msgStatus="{ row }">
        <span
          :style="{
            color: row.msgStatus == 1 ? 'red' : row.msgStatus == 2 ? 'green' : '',
          }"
          >{{
            row.msgStatus == 1
              ? t('view.fault')
              : row.msgStatus == 2
                ? t('view.recovery')
                : row.msgStatus
          }}</span
        >
      </template>
      <template #msgType="{ row }">
        <span>{{
          dictionariesData.find((m) => m.dictionariesKey == row.msgType)
            ? dictionariesData.find((m) => m.dictionariesKey == row.msgType).dictionariesName
            : row.msgType
        }}</span>
      </template>
      <template #read="{ row }">
        <a-tag style="width: 38px; margin: 0" :color="row.isRead ? '' : 'red'">{{
          row.isRead ? t('view.read') : t('view.unread')
        }}</a-tag>
      </template>
      <!-- <template #msgDuration="{ row }">
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
      </template> -->
      <template #default="{ row }">
        <div :class="`tableOption`">
          <AuthDom auth="message_msg_queren">
            <IconFontClass
              name="icon-baseui-queren"
              :style="{ color: row.confirmTime ? '#d9d9d9' : '#0749df' }"
              @click="okMsg(row)"
              ::title="row.confirmTime ? t('view.confirmed') : t('view.unconfirmed')"
            />
          </AuthDom>
          <AuthDom auth="message_show_detail">
            <IconFontClass
              :class="{ 'not-click': row.msgClass == t('view.tip') }"
              name="icon-baseui-show"
              @click="showMgsHis(row)"
              style="color: #0fc10e"
              ::title="t('view.viewAlarmRecords')"
            />
          </AuthDom>
          <AuthDom auth="message_repair">
            <IconFontClass
              :class="{ 'not-click': row.msgClass == t('view.tip') }"
              name="icon-baseui-zijianrizhi"
              @click="showRepair(row)"
              style="color: #0749df"
              ::title="t('view.alarmHandling')"
            />
          </AuthDom>
        </div>
      </template>
    </vxe-grid>
    <a-drawer
      :headerStyle="{ height: '49px', borderBottom: '2px solid #eee' }"
      :width="1000"
      :visible="isShowVis"
      :title="t('view.messageHistory')"
      :footer-style="{ textAlign: 'right' }"
      @close="closeHis"
    >
      <his :msgId="hisId" />
    </a-drawer>
    <a-drawer
      :headerStyle="{ height: '49px', borderBottom: '2px solid #eee' }"
      :width="locale == 'zh-CN' ? 500 : 500"
      :visible="isShowRepair"
      :title="t('view.processingContent')"
      :footer-style="{ textAlign: 'right' }"
      @close="closeRepair"
    >
      <a-form
        :label-col="{ span: locale == 'zh-CN' ? 6 : 8 }"
        :style="{ paddingRight: '2px' }"
        autocomplete="off"
        ref="formRef"
        :model="formData"
      >
        <a-form-item
          name="briefRepairMethods"
          :label="t('view.processingContent')"
          :rules="[
            { required: true, message: t('view.pleaseEnterProcessingContent') },
            { max: 1063, message: t('view.processingContentTooLong') },
          ]"
        >
          <a-textarea
            :placeholder="t('view.pleaseEnterProcessingContent')"
            :rows="20"
            v-model:value="formData.briefRepairMethods"
            autocomplete="off"
          />
        </a-form-item>
      </a-form>
      <template #footer>
        <a-spin :spinning="fromRepaiSpinning">
          <a-button type="primary" @click="saveFromRepair">{{ t('view.save') }}</a-button>
          <a-button style="margin-left: 8px" @click="closeRepair">{{ t('view.close') }}</a-button>
        </a-spin>
      </template>
    </a-drawer>
  </MyContent>
</template>
<script setup lang="ts">
  import his from './his.vue';
  import AntVueCommon from '@/utils/MyCommon/AntVueCommon';
  import myCommon from '@/utils/MyCommon/common';
  import { ref, reactive, nextTick, watch, unref } from 'vue';
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
  import { message } from 'ant-design-vue';
  import { useI18n } from '@/hooks/web/useI18n';
  import { useLocaleStore } from '@/store/modules/locale';

  const { t } = useI18n();
  const localeStore = useLocaleStore();
  const locale = localeStore.getLocale;
  defineOptions({ name: 'Message' });
  const mqttStore = useMqttStoreWithOut();
  const { currentRoute } = useRouter();
  //获取url参数
  let { msgId, dataTime, serverId } = unref(currentRoute).params;
  msgId = msgId ? msgId : null;
  serverId = serverId ? serverId : null;
  const { prefixCls } = useDesign('message-');
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
        field: 'msgId',
        title: t('view.recordId'),
        sortable: true,
        visible: false,
        showOverflow: true,
        minWidth: locale == 'zh-CN' ? 130 : 150,
        fixed: 'left',
      },
      {
        field: 'serviceCode',
        title: t('view.serviceNumber'),
        showOverflow: true,
        visible: false,
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
        field: 'msgClass',
        title: t('view.informationCategory'),
        showOverflow: true,
        sortable: true,
        minWidth: locale == 'zh-CN' ? 100 : 200,
        slots: {
          default: 'msgClass',
        },
      },
      {
        field: 'msgType',
        title: t('view.informationType'),
        sortable: true,
        minWidth: 200,
        slots: {
          default: 'msgType',
        },
      },
      {
        field: 'msgStatus',
        title: t('view.informationStatus'),
        showOverflow: true,
        sortable: true,
        minWidth: locale == 'zh-CN' ? 100 : 166,
        slots: {
          default: 'msgStatus',
        },
      },
      {
        field: 'msgTitle',
        title: t('view.informationTitle'),
        sortable: true,
        visible: false,
        minWidth: locale == 'zh-CN' ? 150 : 180,
      },
      {
        field: 'msgContent',
        title: t('view.informationContent'),
        showOverflow: false,
        sortable: true,
        minWidth: 200,
      },
      {
        field: 'msgStartTime',
        title: t('view.startTime'),
        minWidth: 150,
        showOverflow: true,
        sortable: true,
      },
      {
        field: 'msgEndTime',
        title: t('view.endTime'),
        minWidth: 150,
        showOverflow: true,
        sortable: true,
      },
      {
        field: 'msgDuration',
        title: t('view.duration_seconds'),
        showOverflow: true,
        sortable: true,
        minWidth: locale == 'zh-CN' ? 120 : 156,
      },
      {
        field: 'confirmUserName',
        title: t('view.confirmedBy'),
        showOverflow: true,
        sortable: true,
        visible: false,
        minWidth: locale == 'zh-CN' ? 100 : 180,
      },
      {
        field: 'confirmTime',
        title: t('view.confirmationTime'),
        minWidth: locale == 'zh-CN' ? 150 : 190,
        showOverflow: true,
        sortable: true,
      },
      {
        field: 'remark',
        title: t('view.remarks'),
        showOverflow: true,
        visible: false,
        sortable: true,
        minWidth: 150,
      },
      {
        field: 'createTime',
        title: t('view.creationTime'),
        minWidth: 150,
        showOverflow: true,
        visible: false,
        sortable: true,
      },
      {
        field: 'briefRepairMethods',
        title: t('view.processingContent'),
        showOverflow: false,
        sortable: true,
        minWidth: 200,
        visible: false,
      },
      {
        field: 'briefRepairUserName',
        title: t('view.processor'),
        showOverflow: false,
        sortable: true,
        minWidth: locale == 'zh-CN' ? 100 : 186,
        visible: false,
      },
      {
        field: 'briefRepairTime',
        title: t('view.processingTime'),
        showOverflow: false,
        sortable: true,
        minWidth: 166,
        visible: false,
      },
      {
        title: t('view.action'),
        slots: {
          default: 'default',
        },
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
    serviceId: serverId,
    msgType: null,
    msgStatus: null,
    msgTitle: '',
    msgContent: '',
    startTime: null,
    endTime: null,
    isConfirm: null,
    msgClass: msgId == null ? 2 : null,
  });
  const timeValue = ref([
    dayjs(dayjs().subtract(7, 'day').format('YYYY-MM-DD')),
    dayjs(dayjs().add(1, 'day').format('YYYY-MM-DD')),
  ]);
  if (dataTime) {
    timeValue.value = [dayjs(dataTime), dayjs(dataTime).add(1, 'second')];
  }
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
      msgType: null,
      msgStatus: null,
      msgTitle: '',
      msgContent: '',
      startTime: null,
      endTime: null,
      isConfirm: null,
      msgClass: 2,
    };

    timeValue.value = [
      dayjs(dayjs().subtract(7, 'day').format('YYYY-MM-DD')),
      dayjs(dayjs().add(1, 'day').format('YYYY-MM-DD')),
    ];
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
          message.success(t('view.confirmAlarmSuccessfully'));
          const oldData = tableConfig.data.find((m) => m.msgId == data.msgId);
          if (oldData) {
            oldData.confirmTime = data.confirmTime;
            oldData.confirmUserName = data.confirmUserName;
          }
        })
        .catch(() => {
          message.error(t('view.failToConfirmAlarm'));
        });
    } else {
      message.info(t('view.thisAlarmHasBeenConfirmed'));
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
            const oldData = tableConfig.data.find((m) => m.msgId == formData.msgId);
            if (oldData) {
              oldData.briefRepairMethods = data.briefRepairMethods;
              oldData.briefRepairTime = data.briefRepairTime;
              oldData.briefRepairUserName = data.name;
            }
            message.success(t('view.successfullyChangeProcessingContent'));
            isShowRepair.value = false;
          } else {
            message.error(t('view.failedToChangeProcessingContent'));
          }
        })
        .catch(() => {
          message.error(t('view.errorChangingProcessingContent'));
        });
    });
  }

  function exportData() {
    // exportDataSpinning.value = true;
    // seacthContent.value.startTime =
    //   timeValue.value == null ? null : timeValue.value[0].format('YYYY-MM-DD HH:mm:ss');
    // seacthContent.value.endTime =
    //   timeValue.value == null ? null : timeValue.value[1].format('YYYY-MM-DD HH:mm:ss');
    // messageApi
    //   .ExportData({
    //     msgId,
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
        filename: `告警信息导出${dayjs().format('YYYYMMDDHHmmss')}`,
        type: 'xlsx',
        excludeFields: ['seq'],
      });
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
