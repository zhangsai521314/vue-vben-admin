<template>
  <MyContent>
    <a-spin :spinning="isRunGet">
      <!-- 开启多字段排序 -->
      <!-- :sort-config="{ multiple: true }" -->
      <vxe-grid
        :scroll-y="{ enabled: true }"
        v-bind="tableConfig"
        id="ddServcerLine"
        :auto-resize="true"
        ref="tableRef"
        :loading="loading"
        :seq-config="{ startIndex: (page.current - 1) * page.size }"
        :row-config="{ keyField: 'id' }"
        :column-config="{ resizable: true }"
        :custom-config="{ storage: true }"
        @sort-change="onSortChange"
      >
        <template #toolbar_buttons>
          <div :class="`tableBtn`">
            <a-space direction="horizontal" size="small" style="margin-left: 5px">
              <AuthDom auth="ddServcer_line_query">
                <a-space direction="horizontal" size="small" :wrap="true" style="margin-bottom: 0">
                  <div class="row-div">
                    <a-space direction="horizontal" size="small" :wrap="true">
                      <label>{{ t('view.lineName') }}：</label>
                      <a-input
                        @press-enter="initPage"
                        v-model:value="seacthContent.name"
                        :placeholder="t('view.inputLineNameForQuery')"
                      />
                    </a-space>
                  </div>
                  <div class="row-div">
                    <a-space direction="horizontal" size="small" :wrap="true">
                      <a-button @click="initPage" type="primary">{{ t('view.query') }}</a-button>
                    </a-space>
                  </div>
                </a-space>
              </AuthDom>
              <AuthDom auth="ddServcer_line_add">
                <a-button class="ant-btn" @click="showFrom()">{{ t('view.addNewLine') }}</a-button>
              </AuthDom>
              <AuthDom auth="ddServcer_line_pusMq">
                <a-spin :spinning="isRunMushMq" :title="t('view.commandSending')">
                  <a-button class="ant-btn" @click="pushMq()">{{ t('view.syncCommand') }}</a-button>
                </a-spin>
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
        <template #default="{ row }">
          <div :class="`tableOption`">
            <AuthDom auth="ddServcer_line_table_map">
              <IconFontClass
                name="icon-baseui-guidao"
                @click="showMap(row)"
                style="color: rgb(81 66 2)"
                :title="t('view.lineMap')"
              />
            </AuthDom>
            <AuthDom auth="ddServcer_line_table_edit">
              <IconFontClass
                name="icon-baseui-edit-fill"
                @click="showFrom(row)"
                style="color: #0749df"
                :title="t('view.edit')"
              />
            </AuthDom>
            <AuthDom auth="ddServcer_line_table_delete">
              <IconFontClass
                name="icon-baseui-guanbicuowu"
                @click="remove(row)"
                style="color: red"
                :title="t('view.delete')"
              />
            </AuthDom>
          </div>
        </template>
      </vxe-grid>
      <a-drawer
        :headerStyle="{ height: '49px', borderBottom: '2px solid #eee' }"
        :width="locale == 'zh-CN' ? 500 : 610"
        :visible="isShowMap"
        :title="t('view.configuration')"
        :footer-style="{ textAlign: 'right' }"
        @close="formMapClose"
      >
        <a-form
          :label-col="{ span: locale == 'zh-CN' ? 6 : 10 }"
          :style="{ paddingRight: '2px' }"
          autocomplete="off"
          ref="formRef"
          :model="formData"
        >
          <a-form-item name="lineMap" :label="t('view.lineMap')">
            <a-upload
              :fileList="lineMapFileList"
              :maxCount="1"
              name="file"
              :multiple="false"
              accept=".mdb"
              :before-upload="lineMapBeforeUpload"
              @reject="lineMapFileReject"
            >
              <div v-if="!myCommon.isnull(lineMapFilePath)" style="position: relative">
                <a-input
                  style="width: 300px"
                  :value="lineMapFilePath.split('/')[lineMapFilePath.split('/').length - 1]"
                />
              </div>
              <div v-else>
                <a-input
                  style="width: 300px; cursor: pointer"
                  :placeholder="t('view.clickToSelectRouteDataFile')"
                />
              </div>
            </a-upload>
            <IconFontClass
              v-if="lineMapFilePath"
              style="margin-left: 4px; font-size: 18px; cursor: pointer"
              name=" icon-baseui-delete"
              @click="
                () => {
                  lineMapFileList = [];
                  lineMapFilePath = null;
                }
              "
              :title="t('view.delete')"
            />
          </a-form-item>
        </a-form>
        <template #footer>
          <a-spin :spinning="fromSpinning">
            <a-button type="primary" @click="saveMap">{{ t('view.save') }}</a-button>
            <a-button style="margin-left: 8px" @click="formClose">{{ t('view.close') }}</a-button>
          </a-spin>
        </template>
      </a-drawer>
      <a-drawer
        :headerStyle="{ height: '49px', borderBottom: '2px solid #eee' }"
        :width="locale == 'fr-FR' ? 800 : locale == 'zh-CN' ? 500 : 700"
        :visible="isShowForm"
        :title="t('view.configuration')"
        :footer-style="{ textAlign: 'right' }"
        @close="formClose"
      >
        <a-form
          :label-col="{ span: locale == 'fr-FR' ? 12 : locale == 'zh-CN' ? 8 : 10 }"
          :style="{ paddingRight: '2px' }"
          :wrapper-col="{ span: 14 }"
          autocomplete="off"
          ref="formRef"
          :model="formData"
        >
          <a-form-item
            :label="t('view.lineNameCn')"
            name="nameCn"
            :rules="[
              { required: true, message: '' },
              { max: 40, message: t('view.lineNameCnIsTooLong') },
              { validator: formValidator.empty, message: t('view.pleaseInputLineNameCn') },
            ]"
          >
            <a-input
              :placeholder="t('view.pleaseInputLineNameCn')"
              v-model:value="formData.nameCn"
              autocomplete="off"
            />
          </a-form-item>
          <a-form-item
            :label="t('view.lineNameEn')"
            name="nameEn"
            :rules="[
              { required: true, message: '' },
              { max: 40, message: t('view.lineNameEnIsTooLong') },
              { validator: formValidator.empty, message: t('view.pleaseInputLineNameEn') },
            ]"
          >
            <a-input
              :placeholder="t('view.pleaseInputLineNameEn')"
              v-model:value="formData.nameEn"
              autocomplete="off"
            />
          </a-form-item>
          <a-form-item
            :label="t('view.lineNameFr')"
            name="nameFr"
            :rules="[
              { required: true, message: '' },
              { max: 40, message: t('view.lineNameFrIsTooLong') },
              { validator: formValidator.empty, message: t('view.pleaseInputLineNameFr') },
            ]"
          >
            <a-input
              :placeholder="t('view.pleaseInputLineNameFr')"
              v-model:value="formData.nameFr"
              autocomplete="off"
            />
          </a-form-item>
          <a-form-item
            :label="t('view.lineCode')"
            name="code"
            :rules="[
              { required: true, message: '' },
              { min: 3, message: t('view.lineCodeMustBe3To6Digits') },
              { max: 6, message: t('view.lineCodeMustBe3To6Digits') },
              {
                validator: formValidator.positiveInteger,
                message: t('view.lineCodeFormatMustBeANaturalNumber'),
              },
              { validator: formValidator.empty, message: t('view.pleaseEnterLineCode') },
            ]"
          >
            <a-input
              :placeholder="t('view.pleaseEnterLineCode')"
              v-model:value="formData.code"
              autocomplete="off"
            />
          </a-form-item>
          <a-form-item
            name="dcFn"
            :label="t('view.functionNumber')"
            :rules="[
              { required: true, message: '' },
              { min: 5, message: t('view.functionCodeNameMustBe5To9Digits') },
              { max: 9, message: t('view.functionCodeNameMustBe5To9Digits') },
              {
                validator: formValidator.positiveInteger,
                message: t('view.functionCodeFormatMustBeANaturalNumber'),
              },
              { validator: formValidator.empty, message: t('view.pleaseEnterFunctionCode') },
            ]"
          >
            <a-input
              :placeholder="t('view.pleaseEnterFunctionCode')"
              v-model:value="formData.dcFn"
              autocomplete="off"
            />
          </a-form-item>
          <a-form-item
            name="dcIsdn"
            :label="t('view.dispatchConsoleIsdn')"
            :rules="[
              { required: true, message: '' },
              { min: 4, message: t('view.dispatchConsoleIsdnNameMustBe4To11Digits') },
              { max: 11, message: t('view.dispatchConsoleIsdnNameMustBe4To11Digits') },
              {
                validator: formValidator.positiveInteger,
                message: t('view.dispatchConsoleIsdnFormatMustBeANaturalNumber'),
              },
              { validator: formValidator.empty, message: t('view.pleaseEnterDispatchConsoleIsdn') },
            ]"
          >
            <a-input
              :placeholder="t('view.pleaseEnterDispatchConsoleIsdn')"
              v-model:value="formData.dcIsdn"
              autocomplete="off"
            />
          </a-form-item>
          <a-form-item
            v-if="saveType == 'edit'"
            :wrapper-col="{ span: 20, offset: 12 }"
            style="position: relative; height: 0"
          >
            <IconFontClass
              name="icon-baseui-zhankai"
              :title="
                isShowUpdate
                  ? t('view.modifySecondaryInformation')
                  : t('view.doNotModifySecondaryInformation')
              "
              @click="
                () => {
                  isShowUpdate = !isShowUpdate;
                }
              "
              style="position: absolute; top: -2px; left: 16%; cursor: pointer"
              :class="{
                fanZhun: isShowUpdate,
              }"
            />
          </a-form-item>
          <template v-if="isShowUpdate || saveType == 'add'">
            <a-form-item
              v-if="saveType == 'edit'"
              name="programUpdatePassWord"
              :label="t('view.secondaryModificationPassword')"
              :rules="[
                {
                  required: true,
                  message: t('view.pleaseEnterSecondaryPasswordToModifyInformation'),
                },
              ]"
            >
              <a-input
                :placeholder="t('view.pleaseEnterSecondaryPasswordToModifyInformation')"
                v-model:value="formData.programUpdatePassWord"
                autocomplete="off"
              />
            </a-form-item>
            <a-form-item
              name="groupAllCirNumber"
              :label="t('view.allCallLocomotiveGroupCallNumber')"
              :rules="[
                { required: true, message: '' },
                { min: 3, message: t('view.fullCallLocomotiveGroupCallNumberMustBe3To10Digits') },
                { max: 10, message: t('view.fullCallLocomotiveGroupCallNumberMustBe3To10Digits') },
                {
                  validator: formValidator.positiveInteger,
                  message: t('view.fullCallLocomotiveGroupCallNumberFormatMustBeANaturalNumber'),
                },
                {
                  validator: formValidator.empty,
                  message: t('view.pleaseEnterFullCallLocomotiveGroupCallNumber'),
                },
              ]"
            >
              <a-input
                :disabled="myCommon.isnull(formData.programUpdatePassWord) && saveType == 'edit'"
                :placeholder="t('view.pleaseEnterFullCallLocomotiveGroupCallNumber')"
                v-model:value="formData.groupAllCirNumber"
                autocomplete="off"
              />
            </a-form-item>
            <a-form-item
              name="groupAllCirPriority"
              :label="t('view.allCallLocomotiveGroupCallPriority')"
              :rules="[
                {
                  required: true,
                  message: t('view.pleaseEnterFullCallLocomotiveGroupCallPriority'),
                },
                {
                  validator: formValidator.min,
                  min: 1,
                  message: t('view.fullCallLocomotiveGroupCallPriority1To15'),
                },
                {
                  validator: formValidator.max,
                  max: 15,
                  message: t('view.fullCallLocomotiveGroupCallPriority1To15'),
                },
              ]"
            >
              <a-input-number
                :disabled="myCommon.isnull(formData.programUpdatePassWord) && saveType == 'edit'"
                :placeholder="t('view.pleaseEnterFullCallLocomotiveGroupCallPriority')"
                style="width: 262px"
                :precision="0"
                v-model:value="formData.groupAllCirPriority"
              />
            </a-form-item>
            <a-form-item
              name="groupAllDcNumber"
              :label="t('view.allCallStationGroupCallNumber')"
              :rules="[
                { required: true, message: '' },
                { min: 3, message: t('view.fullCallStationGroupCallNumberMustBe3To10Digits') },
                { max: 10, message: t('view.fullCallStationGroupCallNumberMustBe3To10Digits') },
                {
                  validator: formValidator.positiveInteger,
                  message: t('view.fullCallStationGroupCallNumberFormatMustBeAPositiveInteger'),
                },
                {
                  validator: formValidator.empty,
                  message: t('view.pleaseEnterFullCallStationGroupCallNumber'),
                },
              ]"
            >
              <a-input
                :disabled="myCommon.isnull(formData.programUpdatePassWord) && saveType == 'edit'"
                :placeholder="t('view.pleaseEnterFullCallStationGroupCallNumber')"
                v-model:value="formData.groupAllDcNumber"
                autocomplete="off"
              />
            </a-form-item>
            <a-form-item
              name="groupAllDcPriority"
              :label="t('view.allCallStationGroupCallPriority')"
              :rules="[
                { required: true, message: t('view.pleaseEnterFullCallStationGroupCallPriority') },
                {
                  validator: formValidator.min,
                  min: 1,
                  message: t('view.fullCallStationGroupCallPriority1To15'),
                },
                {
                  validator: formValidator.max,
                  max: 15,
                  message: t('view.fullCallStationGroupCallPriority1To15'),
                },
              ]"
            >
              <a-input-number
                :disabled="myCommon.isnull(formData.programUpdatePassWord) && saveType == 'edit'"
                :placeholder="t('view.pleaseEnterFullCallStationGroupCallPriority')"
                style="width: 262px"
                :precision="0"
                v-model:value="formData.groupAllDcPriority"
              />
            </a-form-item>
            <a-form-item
              name="groupAllBroadcastNumber"
              :label="t('view.fullLineBroadcastGroupCallNumber')"
              :rules="[
                { required: true, message: t('view.pleaseEnterFullLineBroadcastGroupCallNumber') },
                { min: 3, message: t('view.fullLineBroadcastGroupCallNumberMustBe3To10Digits') },
                { max: 10, message: t('view.fullLineBroadcastGroupCallNumberMustBe3To10Digits') },
                {
                  validator: formValidator.positiveInteger,
                  message: t('view.fullLineBroadcastGroupCallNumberFormatMustBeANaturalNumber'),
                },
                {
                  validator: formValidator.empty,
                  message: t('view.pleaseEnterFullLineBroadcastGroupCallNumber'),
                },
              ]"
            >
              <a-input
                :disabled="myCommon.isnull(formData.programUpdatePassWord) && saveType == 'edit'"
                :placeholder="t('view.pleaseEnterFullLineBroadcastGroupCallNumber')"
                v-model:value="formData.groupAllBroadcastNumber"
                autocomplete="off"
              />
            </a-form-item>
            <a-form-item
              name="groupAllBroadcastPriority"
              :label="t('view.fullLineBroadcastGroupCallPriority')"
              :rules="[
                {
                  required: true,
                  message: t('view.pleaseEnterFullLineBroadcastGroupCallPriority'),
                },
                {
                  validator: formValidator.min,
                  min: 1,
                  message: t('view.fullLineBroadcastGroupCallPriority1To15'),
                },
                {
                  validator: formValidator.max,
                  max: 15,
                  message: t('view.fullLineBroadcastGroupCallPriority1To15'),
                },
              ]"
            >
              <a-input-number
                :disabled="myCommon.isnull(formData.programUpdatePassWord) && saveType == 'edit'"
                :placeholder="t('view.pleaseEnterFullLineBroadcastGroupCallPriority')"
                style="width: 262px"
                :precision="0"
                v-model:value="formData.groupAllBroadcastPriority"
              />
            </a-form-item>
          </template>
          <a-form-item
            name="reamrk"
            :label="t('view.remark')"
            :rules="[{ max: 250, message: t('view.remarkIsTooLong') }]"
          >
            <a-textarea
              :placeholder="t('view.pleaseInputRemarkInformation')"
              :rows="3"
              v-model:value="formData.reamrk"
              autocomplete="off"
            />
          </a-form-item>
        </a-form>
        <template #footer>
          <a-spin :spinning="fromMapSpinning">
            <a-button type="primary" @click="saveFrom">{{ t('view.save') }}</a-button>
            <a-button style="margin-left: 8px" @click="formMapClose">{{
              t('view.close')
            }}</a-button>
          </a-spin>
        </template>
      </a-drawer>
    </a-spin>
  </MyContent>
</template>
<script setup lang="ts">
  import myCommon from '@/utils/MyCommon/common';
  import formValidator from '@/utils/MyCommon/formValidator';
  import { ref, reactive, createVNode } from 'vue';
  import { VxeGrid, VxeGridProps } from 'vxe-table';
  import { Line as lineApi } from '@/api/ddServcer';
  import { message, Modal } from 'ant-design-vue';
  import { ExclamationCircleOutlined } from '@ant-design/icons-vue';
  import { useMqttStoreWithOut } from '@/store/modules/mqtt';
  import commonApi from '@/api/common';
  import { useI18n } from '@/hooks/web/useI18n';
  import { useLocaleStore } from '@/store/modules/locale';

  const { t } = useI18n();
  const localeStore = useLocaleStore();
  const locale = localeStore.getLocale;
  defineOptions({ name: 'DDServcerLine' });
  const mqttStore = useMqttStoreWithOut();
  const isRunGet = ref(false);
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
        field: 'id',
        title: t('view.recordId'),
        sortable: true,
        visible: false,
        showOverflow: true,
        fixed: 'left',
        minWidth: locale == 'zh-CN' ? 130 : 150,
      },
      {
        field: 'name',
        title: t('view.lineName'),
        showOverflow: true,
        sortable: true,
        minWidth: 200,
        fixed: 'left',
      },
      {
        field: 'nameCn',
        title: t('view.lineNameCn'),
        showOverflow: true,
        sortable: true,
        minWidth: 200,
        visible: false,
      },
      {
        field: 'nameEn',
        title: t('view.lineNameEn'),
        showOverflow: true,
        sortable: true,
        minWidth: locale == 'zh-CN' ? 200 : 220,
        visible: false,
      },
      {
        field: 'nameFr',
        title: t('view.lineNameFr'),
        showOverflow: true,
        sortable: true,
        minWidth: 200,
        visible: false,
      },
      {
        field: 'code',
        title: t('view.lineCode'),
        showOverflow: true,
        sortable: true,
        minWidth: locale == 'zh-CN' ? 100 : 130,
      },
      {
        field: 'dcFn',
        title: t('view.functionNumber'),
        showOverflow: true,
        sortable: true,
        minWidth: locale == 'zh-CN' ? 100 : 170,
      },
      {
        field: 'dcIsdn',
        title: t('view.dispatchConsoleIsdn'),
        showOverflow: true,
        sortable: true,
        minWidth: locale == 'zh-CN' ? 120 : 246,
      },
      {
        field: 'groupAllCirNumber',
        title: t('view.fullCallCirGroupCallSign'),
        showOverflow: true,
        sortable: true,
        minWidth: locale == 'zh-CN' ? 150 : 340,
      },
      {
        field: 'groupAllCirPriority',
        title: t('view.fullCallCirGroupCallPriority'),
        showOverflow: true,
        sortable: true,
        minWidth: locale == 'zh-CN' ? 160 : 340,
      },
      {
        field: 'groupAllDcNumber',
        title: t('view.fullCallStationGroupCallSign'),
        showOverflow: true,
        sortable: true,
        minWidth: locale == 'zh-CN' ? 150 : 380,
      },
      {
        field: 'groupAllDcPriority',
        title: t('view.fullCallDispatchConsoleGroupPriority'),
        showOverflow: true,
        sortable: true,
        minWidth: locale == 'zh-CN' ? 170 : 420,
      },
      {
        field: 'groupAllBroadcastNumber',
        title: t('view.lineBroadcastGroupCallSign'),
        showOverflow: true,
        sortable: true,
        minWidth: locale == 'zh-CN' ? 170 : 340,
      },
      {
        field: 'groupAllBroadcastPriority',
        title: t('view.lineBroadcastGroupCallPriority'),
        showOverflow: true,
        sortable: true,
        minWidth: locale == 'zh-CN' ? 170 : 340,
      },
      {
        field: 'reamrk',
        title: t('view.remarks'),
        showOverflow: true,
        visible: false,
        sortable: true,
        minWidth: 150,
      },
      {
        field: 'updateTime',
        title: t('view.updateTime'),
        showOverflow: true,
        sortable: true,
        minWidth: 170,
        visible: false,
      },
      {
        title: t('view.action'),
        minWidth: 110,
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
    reamrk: null,
    nameCn: null,
    nameEn: null,
    nameFr: null,
    code: null,
    dcFn: null,
    dcIsdn: null,
    groupAllCirNumber: null,
    groupAllCirPriority: null,
    groupAllDcNumber: null,
    groupAllDcPriority: null,
    groupAllBroadcastNumber: null,
    groupAllBroadcastPriority: null,
    programUpdatePassWord: null,
  });
  const formData = ref(_.cloneDeep(defFromData));
  const formRef = ref(null);
  const tableRef = ref({});
  const isShowForm = ref(false);
  const fromSpinning = ref(false);
  const saveType = ref('add');
  const page = reactive({
    current: 1,
    size: 20,
    total: 0,
    sortlist: ['updateTime desc'],
  });
  const seacthContent = ref({
    name: '',
  });
  const isShowUpdate = ref(false);
  const isRunMushMq = ref(false);
  const lineMapFilePath = ref(null);
  const lineMapFileList = ref([]);
  const isShowMap = ref(false);
  const fromMapSpinning = ref(false);
  let mapRow = null;
  getDDServerLines();

  //页码改变
  function handlePageChange() {
    getDDServerLines();
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
    getDDServerLines();
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

  function initPage() {
    page.current = 1;
    page.total = 0;
    getDDServerLines();
  }

  //显示表单
  function showFrom(row) {
    if (myCommon.isnull(row)) {
      saveType.value = 'add';
      isShowForm.value = true;
    } else {
      //编辑
      getDDServerLine(row.id);
    }
  }

  function showMap(row) {
    mapRow = row;
    isShowMap.value = true;
  }

  //删除线路信息
  function remove(row) {
    Modal.confirm({
      maskClosable: true,
      title: t('view.areYouSureYouWantToDelete'),
      icon: createVNode(ExclamationCircleOutlined),
      content: '',
      onOk() {
        isRunGet.value = true;
        lineApi
          .DeleteDDServerLine(row.id.toString())
          .then(() => {
            isRunGet.value = false;
            message.success(t('view.deletionSuccessful'));
            getDDServerLines();
          })
          .catch(() => {
            isRunGet.value = false;
          });
      },
      onCancel() {},
    });
  }

  //关闭表单
  function formClose() {
    isShowForm.value = false;
    isShowUpdate.value = false;
    formData.value = _.cloneDeep(defFromData);
    formRef.value.clearValidate();
  }

  function formMapClose() {
    lineMapFilePath.value = null;
    isShowMap.value = false;
  }

  //获取线路
  function getDDServerLine(id) {
    isRunGet.value = true;
    lineApi
      .GetDDServerLine(id.toString())
      .then((data) => {
        isRunGet.value = false;
        if (data) {
          formData.value = data;
          saveType.value = 'edit';
          isShowForm.value = true;
        } else {
          message.error(t('view.failedToRetrieveLineInformation'));
        }
      })
      .catch(() => {
        isRunGet.value = false;
      });
  }

  //获取线路列表
  function getDDServerLines() {
    loading.value = true;
    lineApi
      .GetDDServerLines({
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
      });
  }

  //新增和编辑
  function saveFrom() {
    formRef.value.validate().then(() => {
      fromSpinning.value = true;
      formData.value.execompleteBefore = () => {
        fromSpinning.value = false;
      };
      if (saveType.value == 'add') {
        lineApi.AddDDServerLine(formData.value).then((data) => {
          tableConfig.data?.splice(0, 0, data);
          formClose();
          message.success(t('view.additionSuccessful'));
          page.total = page.total + 1;
        });
      } else {
        lineApi.UpdateDDServerLine(formData.value).then((data) => {
          const oldData = tableConfig.data.find((m) => m.id == data.id);
          if (oldData) {
            myCommon.objectReplace(oldData, formData.value);
            oldData.name = data.name;
            oldData.updateTime = data.updateTime;
          }
          formClose();
          message.success(t('view.updateSuccessful'));
        });
      }
    });
  }

  //发送命令
  function pushMq() {
    isRunMushMq.value = true;
    commonApi.PushDDServerUpdateDBMq({
      MqInfo: JSON.stringify({
        Type: 1,
        ClientId: mqttStore.mqttClient.options.clientId,
      }),
      execompleteBefore: () => {
        isRunMushMq.value = false;
      },
    });
  }

  //拖拽文件不符合 accept 类型时的回调
  function lineMapFileReject() {
    message.warning(t('view.selectedFileTypeMismatch'));
  }
  //上传之前
  function lineMapBeforeUpload(file) {
    lineMapFileList.value = [];
    const isLt5M = file.size / 1024 / 1024 < 20;
    if (!isLt5M) {
      file['remove'] = true;
      message.error(t('view.softwarePackageShouldNotExceed', [20]));
    } else {
      lineMapFileList.value.push(file);
      lineMapFilePath.value = file.name;
    }
    return false;
  }

  function saveMap() {
    fromMapSpinning.value = true;
    let _formData = new FormData();
    if (lineMapFileList.value.length > 0) {
      _formData.append('file', lineMapFileList.value[0]);
    }
    _formData.append('lineId', mapRow.id);
    lineApi
      .LineMapChange(_formData)
      .then(() => {
        fromMapSpinning.value = false;
        lineMapFileList.value = [];
        formMapClose();
        message.success(t('view.success'));
      })
      .catch(() => {
        fromMapSpinning.value = false;
      });
  }
</script>
<style lang="less" scoped>
  @prefixCls: ~'@{namespace}-DDServcerLine-';

  :deep(.ant-upload-list) {
    display: none;
  }

  .fanZhun {
    display: inline-block;
    transform: rotateX(180deg);
  }
</style>
