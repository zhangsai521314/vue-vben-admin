<template>
  <MyContent :class="prefixCls">
    <vxe-grid
      :scroll-y="{ enabled: true }"
      v-bind="tableConfig"
      id="handLog"
      :auto-resize="true"
      ref="tableRef"
      :loading="loading"
      :seq-config="{ startIndex: (page.current - 1) * page.size }"
      :row-config="{ keyField: 'handId' }"
      :column-config="{ resizable: true }"
      :custom-config="{ storage: true }"
      @sort-change="onSortChange"
    >
      <template #toolbar_buttons>
        <div :class="`tableBtn`">
          <a-space direction="horizontal" size="small" style="margin-left: 5px">
            <AuthDom auth="hand_query">
              <a-space direction="horizontal" size="small" :wrap="true" style="margin-bottom: 0">
                <div class="row-div">
                  <a-space direction="horizontal" size="small" :wrap="true">
                    <label>{{ t('view.heartbeatTime') }}：</label>
                    <a-config-provider :locale="zhCN">
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
                    <label>ISDN：</label>
                    <a-input
                      @press-enter="initPage()"
                      v-model:value="seacthContent.handIsdn"
                      :placeholder="t('view.inputIsdnNumberForQuery')"
                    />
                  </a-space>
                </div>
                <div class="row-div">
                  <a-space direction="horizontal" size="small" :wrap="true">
                    <label>{{ t('view.stationName') }}：</label>
                    <a-tree-select
                      v-model:value="seacthContent.stationCode"
                      show-search
                      style="width: 220px"
                      :dropdown-style="{ maxHeight: '400px', overflow: 'auto' }"
                      :placeholder="t('view.pleaseSelectStationName')"
                      allow-clear
                      show-arrow
                      :filterTreeNode="AntVueCommon.filterTreeNode"
                      :tree-data="stationDatas"
                    />
                  </a-space>
                </div>
                <div class="row-div">
                  <a-space direction="horizontal" size="small" :wrap="true">
                    <label>ECI：</label>
                    <a-input
                      @press-enter="initPage()"
                      v-model:value="seacthContent.eci"
                      :placeholder="t('view.inputECINumberToQuery')"
                    />
                  </a-space>
                </div>
                <div class="row-div">
                  <a-space direction="horizontal" size="small" :wrap="true">
                    <label>{{ t('view.isOnline') }}：</label>
                    <a-select
                      :placeholder="t('view.pleaseSelectWhetherOnline')"
                      style="width: 170px"
                      allow-clear
                      v-model:value="seacthContent.isOnline"
                    >
                      <a-select-option :value="true">{{ t('view.online') }}</a-select-option>
                      <a-select-option :value="false">{{ t('view.offline') }}</a-select-option>
                    </a-select>
                  </a-space>
                </div>
                <div class="row-div">
                  <a-space direction="horizontal" size="small" :wrap="true">
                    <a-button @click="initPage()" type="primary">{{ t('view.query') }}</a-button>
                    <a-button @click="resetSeacth">{{ t('view.resetForm') }}</a-button>
                  </a-space>
                </div>
                <div class="row-div">
                  <a-space direction="horizontal" size="small" :wrap="true">
                    <a-input-number
                      class="duration"
                      @press-enter="initPage()"
                      v-model:value="remainingDays"
                      :min="0"
                      :max="3000"
                      :placeholder="t('view.day')"
                    >
                      <template #addonBefore>
                        <a-select
                          v-model:value="durationQueryType"
                          :style="{ width: locale == 'zh-CN' ? '130px' : '160px' }"
                        >
                          <a-select-option :value="3"
                            >{{ t('view.remainingDays') }}{{ '>=' }}</a-select-option
                          >
                          <a-select-option :value="5"
                            >{{ t('view.remainingDays') }}{{ '<=' }}</a-select-option
                          >
                        </a-select>
                      </template>
                    </a-input-number>
                  </a-space>
                </div>
              </a-space>
            </AuthDom>
            <AuthDom auth="hand_add">
              <a-space
                direction="horizontal"
                size="small"
                :wrap="true"
                style="margin-right: 2px; margin-bottom: 0"
              >
                <div class="row-div">
                  <a-space direction="horizontal" size="small" :wrap="true">
                    <a-button class="ant-btn" @click="showFrom()">{{
                      t('view.addHandheldTerminal')
                    }}</a-button>
                  </a-space>
                </div>
              </a-space>
            </AuthDom>
          </a-space>
        </div>
      </template>
      <template #default="{ row }">
        <div :class="`tableOption`">
          <AuthDom auth="softwareManage_table_showlog">
            <IconFontClass
              name="icon-baseui-flowcontrol-log"
              @click="showLog(row)"
              style="color: #0fc10e"
              :title="t('view.viewLog')"
            />
          </AuthDom>
          <AuthDom auth="hand_edit">
            <IconFontClass
              name="icon-baseui-edit-fill"
              @click="showFrom(row)"
              style="color: #0a61bd"
              :title="t('view.assignPermissions')"
            />
          </AuthDom>
        </div>
      </template>
      <template #isEnable="{ row }">
        <AuthDom auth="hand_disable">
          <div style="display: inline-block; position: relative; top: -2px; left: 8px; width: 30px">
            <a-spin :spinning="disableSpinning">
              <a-switch
                size="small"
                v-model:checked="row.isEnable"
                @change="(v) => disableChange(v, row)"
              /> </a-spin
          ></div>
        </AuthDom>
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
      <template #remainingDays="{ row }">
        <span
          v-if="row.timeValid != null"
          :style="{
            fontSize: '20px',
            fontWeight: 500,
            color: row.remainingDays <= 0 ? 'red' : row.remainingDays <= 30 ? '#adad00' : 'green',
          }"
          >{{ row.remainingDays <= 0 ? t('view.hasExpired') : row.remainingDays }}</span
        >
      </template>
    </vxe-grid>
    <a-drawer
      :headerStyle="{ height: '49px', borderBottom: '2px solid #eee' }"
      :width="500"
      :visible="isShowForm"
      :title="t('view.configuration')"
      :footer-style="{ textAlign: 'right' }"
      @close="formClose"
    >
      <a-form
        :label-col="{ span: 6 }"
        :style="{ paddingRight: '2px' }"
        :wrapper-col="{ span: 16 }"
        autocomplete="off"
        ref="formRef"
        :model="formData"
      >
        <a-form-item
          name="isdn"
          :label="t('view.isdn')"
          :rules="[{ max: 20, message: t('view.pleaseEnterIdsn') }]"
        >
          <a-input
            :disabled="saveType == 'edit'"
            :placeholder="t('view.pleaseEnterIdsn')"
            v-model:value="formData.handIsdn"
            autocomplete="off"
          />
        </a-form-item>
        <a-form-item
          name="isEnable"
          :label="t('view.enableOrDisable')"
          :rules="[{ required: true, message: t('view.pleaseSelectEnableOrDisable') }]"
        >
          <a-switch v-model:checked="formData.isEnable" />
        </a-form-item>
        <a-form-item
          :label="t('view.permissionType')"
          name="powerKeys"
          :rules="[{ required: true, message: t('view.pleaseSelectPermissionType') }]"
        >
          <a-select
            show-search
            :allowClear="true"
            mode="multiple"
            :filter-option="AntVueCommon.filterOption"
            :placeholder="t('view.pleaseSelectPermissionType')"
            v-model:value="formData.powerKeys"
            :options="dictionariesData"
          />
        </a-form-item>
      </a-form>
      <template #footer>
        <a-spin :spinning="fromSpinning">
          <a-button type="primary" @click="saveHandPower">{{ t('view.save') }}</a-button>
          <a-button style="margin-left: 8px" @click="formClose">{{ t('view.close') }}</a-button>
        </a-spin>
      </template>
    </a-drawer>
    <a-drawer
      :headerStyle="{ height: '49px', borderBottom: '2px solid #eee' }"
      :width="600"
      :visible="isShowLog"
      :title="t('view.viewLog')"
      :footer-style="{ textAlign: 'right' }"
      @close="formCloseLog"
    >
      <log :handId="handId" />
    </a-drawer>
  </MyContent>
</template>
<script setup lang="ts">
  import AntVueCommon from '@/utils/MyCommon/AntVueCommon';
  import { ref, reactive } from 'vue';
  import { VxeGrid, VxeGridProps } from 'vxe-table';
  import handApi from '@/api/hand';
  import { message } from 'ant-design-vue';
  import log from './log.vue';
  import { useDesign } from '@/hooks/web/useDesign';
  import zhCN from 'ant-design-vue/es/locale/zh_CN';
  import dayjs from 'dayjs';
  import 'dayjs/locale/zh-cn';
  import dictionariesApi from '@/api/dictionaries';
  import { Station as stationApi } from '@/api/ddServcer';
  import { useI18n } from '@/hooks/web/useI18n';
  import { useLocaleStore } from '@/store/modules/locale';

  const { t } = useI18n();
  const localeStore = useLocaleStore();
  const locale = localeStore.getLocale;
  defineOptions({ name: 'Hand' });
  const { prefixCls } = useDesign('hand-');
  const loading = ref(true);
  const page = reactive({
    current: 1,
    size: 20,
    total: 0,
    sortlist: ['dataTime desc'],
  });
  const seacthContent = ref({
    stationCode: null,
    handIsdn: null,
    startTime: null,
    endTime: null,
    isOnline: null,
    eci: null,
    SearchParameters: [],
  });
  const disableSpinning = ref(false);
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
        field: 'handId',
        title: t('view.recordId'),
        visible: false,
        showOverflow: true,
        minWidth: locale == 'zh-CN' ? 130 : 150,
        fixed: 'left',
      },
      {
        field: 'handIsdn',
        title: 'ISDN',
        showOverflow: true,
        sortable: true,
        minWidth: 90,
        fixed: 'left',
      },
      {
        field: 'stationName',
        title: t('view.stationName'),
        showOverflow: true,
        sortable: false,
        minWidth: 200,
        fixed: 'left',
      },
      {
        field: 'stationXiaQu',
        title: t('view.stationArea'),
        showOverflow: true,
        sortable: false,
        minWidth: 100,
      },
      {
        field: 'eci',
        title: 'ECI',
        showOverflow: true,
        sortable: true,
        minWidth: 100,
      },
      {
        field: 'dataTime',
        title: t('view.heartbeatTime'),
        minWidth: locale == 'zh-CN' ? 150 : 220,
        showOverflow: true,
        sortable: true,
      },
      {
        title: t('view.enableOrDisable'),
        minWidth: 140,
        slots: {
          default: 'isEnable',
        },
        showOverflow: true,
      },
      {
        field: 'isOnline',
        title: t('view.isOnline'),
        minWidth: locale == 'zh-CN' ? 100 : 150,
        showOverflow: true,
        cellRender: { name: 'render_isno' },
      },
      {
        field: 'isCoerceOut',
        title: t('view.forcedLogout'),
        minWidth: locale == 'zh-CN' ? 100 : 140,
        showOverflow: true,
        // sortable: true,
        cellRender: { name: 'render_isno' },
      },
      {
        field: 'coerceOutTime',
        title: t('view.forcedLogoutTime'),
        minWidth: locale == 'zh-CN' ? 150 : 240,
        showOverflow: true,
        sortable: true,
        visible: false,
      },
      {
        field: 'runVersion',
        title: t('view.officialVersion'),
        showOverflow: true,
        sortable: true,
        minWidth: locale == 'zh-CN' ? 100 : 170,
      },
      {
        field: 'currentVersion',
        title: t('view.terminalVersion'),
        showOverflow: true,
        sortable: true,
        minWidth: locale == 'zh-CN' ? 100 : 170,
      },
      {
        field: 'loginTime',
        title: t('view.loginTime'),
        minWidth: locale == 'zh-CN' ? 150 : 170,
        showOverflow: true,
        sortable: true,
        visible: false,
      },
      {
        field: 'isAutoRegister',
        title: t('view.autoRegister'),
        minWidth: locale == 'zh-CN' ? 100 : 200,
        showOverflow: true,
        cellRender: { name: 'render_isno' },
        visible: false,
      },

      {
        field: 'isAutoRegister',
        title: t('view.autoRegister'),
        minWidth: locale == 'zh-CN' ? 100 : 200,
        showOverflow: true,
        cellRender: { name: 'render_isno' },
        visible: false,
      },
      {
        field: 'isGetLinces',
        title: t('view.obtainAuthorization'),
        minWidth: locale == 'zh-CN' ? 100 : 200,
        showOverflow: true,
        cellRender: { name: 'render_isno' },
        visible: false,
      },
      {
        field: 'getLincesTime',
        title: t('view.getTime'),
        minWidth: locale == 'zh-CN' ? 150 : 200,
        showOverflow: true,
        visible: false,
        sortable: true,
      },
      {
        field: 'lincesName',
        title: t('view.authorizationFile'),
        minWidth: 150,
        showOverflow: true,
        visible: false,
        sortable: true,
      },
      {
        field: 'timeValid',
        title: t('view.validityPeriod'),
        showOverflow: true,
        sortable: true,
        visible: false,
        minWidth: 160,
      },
      {
        field: 'remainingDays',
        title: t('view.remainingDays'),
        minWidth: 200,
        showOverflow: true,
        sortable: true,
        visible: false,
        slots: {
          default: 'remainingDays',
        },
      },
      {
        field: 'createUser',
        title: t('view.creator'),
        minWidth: 130,
        showOverflow: true,
        visible: false,
        sortable: true,
      },
      {
        field: 'modifyTime',
        title: t('view.modificationTime'),
        minWidth: 170,
        showOverflow: true,
        visible: false,
        sortable: true,
      },
      {
        field: 'modifyUser',
        title: t('view.modifier'),
        minWidth: 176,
        showOverflow: true,
        visible: false,
        sortable: true,
      },
      {
        title: t('view.action'),
        minWidth: 140,
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
  const defFromData = reactive({
    handId: null,
    handIsdn: null,
    isEnable: true,
    powerKeys: [],
  });
  const handId = ref(null);
  const formData = ref(_.cloneDeep(defFromData));
  const formRef = ref(null);
  const tableRef = ref({});
  const isShowForm = ref(false);
  const fromSpinning = ref(false);
  const isShowLog = ref(false);
  const timeValue = ref([
    dayjs(dayjs().subtract(7, 'day').format('YYYY-MM-DD')),
    dayjs(dayjs().add(1, 'day').format('YYYY-MM-DD')),
  ]);
  const dictionariesData = ref([]);
  const stationDatas = ref([]);
  const saveType = ref('add');
  const newRow = ref(null);
  const remainingDays = ref(null);
  const durationQueryType = ref(5);

  getHandList();
  getDicHandPower();
  getDDServerStationTreeCode();

  function showLog(row) {
    handId.value = row.handId;
    isShowLog.value = true;
  }
  function formCloseLog() {
    handId.value = null;
    newRow.value = null;
    isShowLog.value = false;
  }

  function showFrom(row) {
    if (myCommon.isnull(row)) {
      saveType.value = 'add';
      isShowForm.value = true;
    } else {
      //编辑
      getHand(row);
    }
  }

  //关闭表单
  function formClose() {
    formData.value = _.cloneDeep(defFromData);
    isShowForm.value = false;
    formRef.value.clearValidate();
  }

  //页码改变
  function handlePageChange() {
    getHandList();
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
    getHandList();
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

  //获取手持台状态
  function getHandList() {
    loading.value = true;
    seacthContent.value.startTime =
      timeValue.value == null ? null : timeValue.value[0].format('YYYY-MM-DD HH:mm:ss');
    seacthContent.value.endTime =
      timeValue.value == null ? null : timeValue.value[1].format('YYYY-MM-DD HH:mm:ss');
    if (!myCommon.isnull(remainingDays.value)) {
      seacthContent.value.SearchParameters = [
        {
          CSharpTypeName: 'int',
          FieldName: 'RemainingDays',
          ConditionalType: durationQueryType.value,
          FieldValue: remainingDays.value,
        },
      ];
    } else {
      seacthContent.value.SearchParameters = [];
    }
    handApi
      .GetHandList({
        ...seacthContent.value,
        execompleteBefore: () => {
          loading.value = false;
        },
        PageIndex: page.current,
        PageSize: page.size,
        fullSort: getFullSort(),
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

  //重置搜索条件
  function resetSeacth() {
    seacthContent.value = {
      stationCode: null,
      handIsdn: null,
      startTime: null,
      endTime: null,
      isOnline: null,
      eci: null,
    };
    timeValue.value = [
      dayjs(dayjs().subtract(7, 'day').format('YYYY-MM-DD')),
      dayjs(dayjs().add(1, 'day').format('YYYY-MM-DD')),
    ];
  }

  function initPage() {
    page.current = 1;
    page.total = 0;
    getHandList();
  }

  //获取手持台权限字典
  function getDicHandPower() {
    dictionariesApi
      .GetDictionariesSimpleKey({
        dictionariesclass: ['handPower'],
      })
      .then((data) => {
        dictionariesData.value = data;
      })
      .catch(() => {
        dictionariesData.value = [];
      });
  }

  //获取手持台权限
  function getHand(row) {
    loading.value = true;
    handApi
      .GetHand(row.handId)
      .then((data) => {
        newRow.value = row;
        saveType.value = 'edit';
        loading.value = false;
        formData.value = data;
        isShowForm.value = true;
      })
      .catch(() => {
        loading.value = false;
        message.error(t('view.failedToGetHandheldTerminalInfo'));
      });
  }

  //保存手持台权限
  function saveHandPower() {
    formRef.value.validate().then(() => {
      fromSpinning.value = true;
      formData.value.execompleteBefore = () => {
        fromSpinning.value = false;
      };
      if (saveType.value == 'add') {
        dictionariesApi.AddDictionaries(formData.value).then((data) => {
          data.serviceTypeName = serviceTypeData.value.find(
            (m) => m.key == data.serviceType,
          )?.label;
          tableConfigData.value.splice(0, 0, data);
          formClose();
          message.success(t('view.additionSuccessful'));
        });
      } else {
        handApi.UpdateHand(formData.value).then((data) => {
          if (data) {
            newRow.value.isEnable = formData.value.isEnable;
            formClose();
            message.success(t('view.updateSuccessful'));
          } else {
            message.error(t('view.updateFailure'));
          }
        });
      }
    });
  }

  function getDDServerStationTreeCode() {
    stationApi.GetDDServerStationTreeCode().then((data) => {
      stationDatas.value = data;
    });
  }

  function disableChange(v, row) {
    const d = row.isEnable;
    disableSpinning.value = true;
    handApi
      .UpdateHandDisable({
        handId: row.handId,
        isEnable: v,
        execompleteBefore: () => {
          disableSpinning.value = false;
        },
      })
      .then((data) => {
        if (data) {
          message.success(t('view.success'));
        } else {
          row.isEnable = d;
          message.error(t('view.failure'));
        }
      });
  }
</script>
<style lang="less" scoped>
  @prefixCls: ~'@{namespace}-hand-';

  .tableBtn {
    width: 100%;
  }

  :deep(.ant-upload-list-item-actions) {
    display: none;
  }
</style>
