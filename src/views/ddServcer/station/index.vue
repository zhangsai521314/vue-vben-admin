<template>
  <MyContent>
    <a-spin :spinning="isRunGet">
      <!-- 开启多字段排序 -->
      <!-- :sort-config="{ multiple: true }" -->
      <vxe-grid
        :scroll-y="{ enabled: true }"
        v-bind="tableConfig"
        id="ddServcerStation"
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
              <AuthDom auth="ddServcer_station_query">
                <a-space direction="horizontal" size="small">
                  <label>{{ t('view.stationName') }}：</label>
                  <a-input
                    @press-enter="initPage"
                    v-model:value="seacthContent.name"
                    :placeholder="t('view.inputStationNameForQuery')"
                  />
                  <a-button @click="initPage" type="primary">{{ t('view.query') }}</a-button>
                </a-space>
              </AuthDom>
              <AuthDom auth="ddServcer_station_add">
                <a-button class="ant-btn" @click="showFrom(null)">{{
                  t('view.addNewStation')
                }}</a-button>
              </AuthDom>
              <AuthDom auth="ddServcer_station_pusMq">
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
            <AuthDom auth="ddServcer_station_table_edit">
              <IconFontClass
                name="icon-baseui-edit-fill"
                @click="showFrom(row)"
                style="color: #0749df"
                :title="t('view.edit')"
              />
            </AuthDom>
            <AuthDom auth="ddServcer_station_table_delete">
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
        :width="locale == 'fr-FR' ? 600 : locale == 'zh-CN' ? 600 : 700"
        :visible="isShowForm"
        :title="t('view.configuration')"
        :footer-style="{ textAlign: 'right' }"
        @close="formClose"
      >
        <a-form
          :label-col="{ span: locale == 'fr-FR' ? 12 : locale == 'zh-CN' ? 8 : 10 }"
          :style="{ paddingRight: '2px' }"
          autocomplete="off"
          ref="formRef"
          :model="formData"
        >
          <a-form-item
            :rules="[{ required: true, message: t('view.pleaseSelectTheAssociatedLine') }]"
            :label="t('view.belongsToLine')"
            name="lineId"
          >
            <a-select
              :placeholder="t('view.pleaseSelectTheAssociatedLine')"
              v-model:value="formData.lineId"
              show-search
              :filter-option="AntVueCommon.filterOption"
              :options="lineDatas"
              :allowClear="true"
            />
          </a-form-item>
          <a-form-item
            :label="t('view.stationNameCn')"
            name="nameCn"
            :rules="[
              { required: true, message: '' },
              { max: 40, message: t('view.stationNameInChineseIsTooLong') },
              {
                validator: formValidator.empty,
                message: t('view.pleaseEnterTheChineseNameOfTheStation'),
              },
            ]"
          >
            <a-input
              :placeholder="t('view.pleaseEnterTheChineseNameOfTheStation')"
              v-model:value="formData.nameCn"
              autocomplete="off"
            />
          </a-form-item>
          <a-form-item
            :label="t('view.stationNameInEnglish')"
            name="nameEn"
            :rules="[
              { required: true, message: '' },
              { max: 40, message: t('view.stationNameInEnglishIsTooLong') },
              {
                validator: formValidator.empty,
                message: t('view.pleaseEnterTheEnglishNameOfTheStationk'),
              },
            ]"
          >
            <a-input
              :placeholder="t('view.pleaseEnterTheEnglishNameOfTheStationk')"
              v-model:value="formData.nameEn"
              autocomplete="off"
            />
          </a-form-item>
          <a-form-item
            :label="t('view.stationNameInFrench')"
            name="nameFr"
            :rules="[
              { required: true, message: '' },
              { max: 40, message: t('view.stationNameInFrenchIsTooLong') },
              {
                validator: formValidator.empty,
                message: t('view.pleaseEnterTheFrenchNameOfTheStation'),
              },
            ]"
          >
            <a-input
              :placeholder="t('view.pleaseEnterTheFrenchNameOfTheStation')"
              v-model:value="formData.nameFr"
              autocomplete="off"
            />
          </a-form-item>
          <a-form-item
            name="longitude"
            :label="t('view.longitude')"
            :rules="[
              { required: true, message: t('view.pleaseEnterLongitude') },
              {
                validator: formValidator.longitude,
              },
            ]"
          >
            <a-input
              style="width: 262px"
              :placeholder="t('view.pleaseEnterLongitude')"
              v-model:value="formData.longitude"
              autocomplete="off"
            />
          </a-form-item>
          <a-form-item
            name="latitude"
            :label="t('view.latitude')"
            :rules="[
              { required: true, message: t('view.pleaseEnterLatitude') },
              { validator: formValidator.latitude },
            ]"
          >
            <a-input
              style="width: 262px"
              :placeholder="t('view.pleaseEnterLatitude')"
              v-model:value="formData.latitude"
              autocomplete="off"
            />
          </a-form-item>
          <a-form-item :label="t('view.previousStation')" name="prevStationId">
            <a-select
              v-model:value="formData.prevStationId"
              show-search
              :filter-option="AntVueCommon.filterOption"
              :options="stationDatas.filter((m) => m.key != formData.nextStationId)"
              :allowClear="true"
              :placeholder="t('view.pleaseSelectThePreviousStation')"
            />
          </a-form-item>
          <a-form-item :label="t('view.nextStation')" name="nextStationId">
            <a-select
              v-model:value="formData.nextStationId"
              show-search
              :filter-option="AntVueCommon.filterOption"
              :options="stationDatas.filter((m) => m.key != formData.prevStationId)"
              :allowClear="true"
              :placeholder="t('view.pleaseSelectTheNextStation')"
            />
          </a-form-item>
          <a-form-item
            name="startGlb"
            :label="t('view.startingMileageMarkerMmeters')"
            :rules="[
              {
                validator: formValidator.min,
                min: -9999999,
                message: t('view.startingMileageMarkerMmeters9999999To9999999'),
              },
              {
                validator: formValidator.max,
                max: 9999999,
                message: t('view.startingMileageMarkerMmeters9999999To9999999'),
              },
            ]"
          >
            <a-input-number
              :precision="0"
              :placeholder="t('view.pleaseEnterThestartingMileageMarkerMmeters')"
              v-model:value="formData.startGlb"
              autocomplete="off"
            />
          </a-form-item>
          <a-form-item
            name="endGlb"
            :label="t('view.endingMileageMarkerMeters')"
            :rules="[
              {
                validator: formValidator.min,
                min: -9999999,
                message: t('view.endingMileageMarkerMeters9999999To9999999'),
              },
              {
                validator: formValidator.max,
                max: 9999999,
                message: t('view.endingMileageMarkerMeters9999999To9999999'),
              },
            ]"
          >
            <a-input-number
              :precision="0"
              :placeholder="t('view.pleaseEnterTheendingMileageMarkerMeters')"
              v-model:value="formData.endGlb"
              autocomplete="off"
            />
          </a-form-item>
          <a-form-item
            name="index"
            :label="t('view.stationSorting')"
            :rules="[
              {
                validator: formValidator.min,
                min: -9999,
                message: t('view.sortingValueMustBeBetween9999'),
              },
              {
                validator: formValidator.max,
                max: 9999,
                message: t('view.sortingValueMustBeBetween9999'),
              },
            ]"
          >
            <a-input-number
              style="width: 300px"
              :precision="0"
              v-model:value="formData.index"
              :placeholder="t('view.pleaseEnterTheStationSorting')"
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
              :label="t('view.stationCode')"
              name="code"
              :rules="[
                { required: true, message: '' },
                { min: 1, message: t('view.stationCodeIs1To5Digits') },
                { max: 5, message: t('view.stationCodeIs1To5Digits') },
                { validator: formValidator.empty, message: t('view.pleaseEnterTheStationCode') },
                {
                  validator: formValidator.positiveInteger,
                  message: t('view.stationCodeFormatIsANaturalNumber'),
                },
              ]"
            >
              <a-input
                :disabled="myCommon.isnull(formData.programUpdatePassWord) && saveType == 'edit'"
                :placeholder="t('view.pleaseEnterTheStationCode')"
                v-model:value="formData.code"
                autocomplete="off"
              />
            </a-form-item>
            <a-form-item
              :label="t('view.functionNumber')"
              name="dcFn"
              :rules="[
                { required: true, message: '' },
                { min: 9, message: t('view.functionNumberIs9Digits') },
                { max: 9, message: t('view.functionNumberIs9Digits') },
                { validator: formValidator.empty, message: t('view.pleaseEnterFunctionCode') },
                {
                  validator: formValidator.positiveInteger,
                  message: t('view.functionCodeFormatMustBeANaturalNumber'),
                },
              ]"
            >
              <a-input
                :disabled="myCommon.isnull(formData.programUpdatePassWord) && saveType == 'edit'"
                :placeholder="t('view.pleaseEnterTheStationCode')"
                v-model:value="formData.dcFn"
                autocomplete="off"
              />
            </a-form-item>
            <a-form-item
              :label="t('view.isdnNumber')"
              name="dcIsdn"
              :rules="[
                { required: true, message: '' },
                { min: 4, message: t('view.isdnNumberIs4Digits') },
                { max: 4, message: t('view.isdnNumberIs4Digits') },
                { validator: formValidator.empty, message: t('view.pleaseEnterTheIsdnNumber') },
                {
                  validator: formValidator.positiveInteger,
                  message: t('view.isdnNumberFormatIsANaturalNumber'),
                },
              ]"
            >
              <a-input
                :disabled="myCommon.isnull(formData.programUpdatePassWord) && saveType == 'edit'"
                :placeholder="t('view.pleaseEnterTheStationCode')"
                v-model:value="formData.dcIsdn"
                autocomplete="off"
              />
            </a-form-item>
            <a-form-item
              name="sosCallNumber"
              :label="t('view.emergencyGroupCallNumber')"
              :rules="[
                { required: true, message: '' },
                { min: 3, message: t('view.emergencyGroupCallNumberIs3To10Digits') },
                { max: 10, message: t('view.emergencyGroupCallNumberIs3To10Digits') },
                {
                  validator: formValidator.positiveInteger,
                  message: t('view.emergencyGroupCallNumFormatIsNaturalNum'),
                },
                {
                  validator: formValidator.empty,
                  message: t('view.pleaseEnterEmergencyGroupCallNumber'),
                },
              ]"
            >
              <a-input
                :disabled="myCommon.isnull(formData.programUpdatePassWord) && saveType == 'edit'"
                :placeholder="t('view.pleaseEnterEmergencyGroupCallNumber')"
                v-model:value="formData.sosCallNumber"
                autocomplete="off"
              />
            </a-form-item>
            <a-form-item
              name="sosCallPriority"
              :label="t('view.emergencyGroupCallPriority')"
              :rules="[
                { required: true, message: t('view.pleaseEnterEmergencyGroupCallPriority') },
                {
                  validator: formValidator.min,
                  min: 1,
                  message: t('view.emergencyGroupCallPriority1To15'),
                },
                {
                  validator: formValidator.max,
                  max: 15,
                  message: t('view.emergencyGroupCallPriority1To15'),
                },
              ]"
            >
              <a-input-number
                :disabled="myCommon.isnull(formData.programUpdatePassWord) && saveType == 'edit'"
                :placeholder="t('view.pleaseEnterEmergencyGroupCallPriority')"
                style="width: 262px"
                :precision="0"
                v-model:value="formData.sosCallPriority"
              />
            </a-form-item>
            <a-form-item
              name="groupCallNumber"
              :label="t('view.inStationGroupCallNumber')"
              :rules="[
                { required: true, message: '' },
                { min: 3, message: t('view.inStationGroupCallNumberIs3To10Digits') },
                { max: 10, message: t('view.inStationGroupCallNumberIs3To10Digits') },
                {
                  validator: formValidator.positiveInteger,
                  message: t('view.inStationGroupCallNumberFormatIsANaturalNumber'),
                },
                {
                  validator: formValidator.empty,
                  message: t('view.pleaseEnterStationGroupCallNum'),
                },
              ]"
            >
              <a-input
                :disabled="myCommon.isnull(formData.programUpdatePassWord) && saveType == 'edit'"
                :placeholder="t('view.pleaseEnterStationGroupCallNum')"
                v-model:value="formData.groupCallNumber"
                autocomplete="off"
              />
            </a-form-item>
            <a-form-item
              name="groupCallPriority"
              :label="t('view.inStationGroupCallPriority')"
              :rules="[
                { required: true, message: t('view.pleaseEnterTheinStationGroupCallPriority') },
                {
                  validator: formValidator.min,
                  min: 1,
                  message: t('view.inStationGroupCallPriority1To15'),
                },
                {
                  validator: formValidator.max,
                  max: 15,
                  message: t('view.inStationGroupCallPriority1To15'),
                },
              ]"
            >
              <a-input-number
                :disabled="myCommon.isnull(formData.programUpdatePassWord) && saveType == 'edit'"
                :placeholder="t('view.pleaseEnterTheinStationGroupCallPriority')"
                style="width: 262px"
                :precision="0"
                v-model:value="formData.groupCallPriority"
              />
            </a-form-item>
            <a-form-item
              name="tempCallNumber"
              :label="t('view.adjacentStationGroupCallNumber')"
              :rules="[
                { required: true, message: '' },
                { min: 3, message: t('view.adjacentStationGroupCallNumberIs3To10Digits') },
                { max: 10, message: t('view.adjacentStationGroupCallNumberIs3To10Digits') },
                {
                  validator: formValidator.positiveInteger,
                  message: t('view.adjacentStationGroupCallNumberFormatIsANaturalNumber'),
                },
                {
                  validator: formValidator.empty,
                  message: t('view.pleaseEnterTheAdjacentStationGroupCallNumber'),
                },
              ]"
            >
              <a-input
                :disabled="myCommon.isnull(formData.programUpdatePassWord) && saveType == 'edit'"
                :placeholder="t('view.pleaseEnterTheAdjacentStationGroupCallNumber')"
                v-model:value="formData.tempCallNumber"
                autocomplete="off"
              />
            </a-form-item>
            <a-form-item
              name="tempCallPriority"
              :label="t('view.adjacentStationGroupCallPriority')"
              :rules="[
                {
                  required: true,
                  message: t('view.pleaseEnterTheAdjacentStationGroupCallPriority'),
                },
                {
                  validator: formValidator.min,
                  min: 1,
                  message: t('view.adjacentStationGroupCallPriority1To15'),
                },
                {
                  validator: formValidator.max,
                  max: 15,
                  message: t('view.adjacentStationGroupCallPriority1To15'),
                },
              ]"
            >
              <a-input-number
                :disabled="myCommon.isnull(formData.programUpdatePassWord) && saveType == 'edit'"
                :placeholder="t('view.pleaseEnterTheAdjacentStationGroupCallPriority')"
                style="width: 262px"
                :precision="0"
                v-model:value="formData.tempCallPriority"
              />
            </a-form-item>
          </template>
          <a-form-item
            name="remark"
            :label="t('view.remark')"
            :rules="[{ max: 250, message: t('view.remarkIsTooLong') }]"
          >
            <a-textarea
              :placeholder="t('view.remarkIsTooLong')"
              :rows="3"
              v-model:value="formData.remark"
              autocomplete="off"
            />
          </a-form-item>
        </a-form>
        <template #footer>
          <a-spin :spinning="fromSpinning">
            <a-button type="primary" @click="saveFrom">{{ t('view.save') }}</a-button>
            <a-button style="margin-left: 8px" @click="formClose">{{ t('view.close') }}</a-button>
          </a-spin>
        </template>
      </a-drawer>
    </a-spin>
  </MyContent>
</template>
<script setup lang="ts">
  import AntVueCommon from '@/utils/MyCommon/AntVueCommon';
  import myCommon from '@/utils/MyCommon/common';
  import formValidator from '@/utils/MyCommon/formValidator';
  import { ref, reactive, createVNode, nextTick, watch, unref } from 'vue';
  import { VxeGrid, VxeGridProps } from 'vxe-table';
  import { Line as lineApi, Station as stationApi } from '@/api/ddServcer';
  import commonApi from '@/api/common';
  import { message, Modal } from 'ant-design-vue';
  import { ExclamationCircleOutlined } from '@ant-design/icons-vue';
  import { useMqttStoreWithOut } from '@/store/modules/mqtt';
  import { useI18n } from '@/hooks/web/useI18n';
  import { useLocaleStore } from '@/store/modules/locale';

  const { t } = useI18n();
  const localeStore = useLocaleStore();
  const locale = localeStore.getLocale;
  defineOptions({ name: 'DDServcerStation' });
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
        showOverflow: true,
        sortable: true,
        visible: false,
        fixed: 'left',
        minWidth: locale == 'zh-CN' ? 130 : 150,
      },
      {
        field: 'lineName',
        title: t('view.lineName'),
        showOverflow: true,
        sortable: true,
        visible: false,
        minWidth: 200,
        fixed: 'left',
      },
      {
        field: 'name',
        title: t('view.stationName'),
        showOverflow: true,
        sortable: true,
        minWidth: 200,
        fixed: 'left',
      },
      {
        field: 'nameCn',
        title: t('view.stationNameCn'),
        showOverflow: true,
        sortable: true,
        minWidth: 200,
        visible: false,
      },
      {
        field: 'nameEn',
        title: t('view.stationNameInEnglish'),
        showOverflow: true,
        sortable: true,
        minWidth: 200,
        visible: false,
      },
      {
        field: 'nameFr',
        title: t('view.stationNameInFrench'),
        showOverflow: true,
        sortable: true,
        minWidth: locale == 'zh-CN' ? 200 : 210,
        visible: false,
      },
      {
        field: 'code',
        title: t('view.stationCode'),
        showOverflow: true,
        sortable: true,
        minWidth: locale == 'zh-CN' ? 100 : 130,
      },
      {
        field: 'dcFn',
        title: t('view.functionNumber'),
        showOverflow: true,
        sortable: true,
        minWidth: locale == 'zh-CN' ? 100 : 160,
      },
      {
        field: 'dcIsdn',
        title: t('view.isdnNumber'),
        showOverflow: true,
        sortable: true,
        minWidth: locale == 'zh-CN' ? 100 : 120,
      },
      {
        field: 'longitude',
        title: t('view.longitude'),
        showOverflow: true,
        sortable: true,
        visible: false,
        minWidth: locale == 'zh-CN' ? 100 : 110,
      },
      {
        field: 'latitude',
        title: t('view.latitude'),
        showOverflow: true,
        sortable: true,
        visible: false,
        minWidth: 100,
      },
      {
        field: 'prevStationName',
        title: t('view.previousStation'),
        showOverflow: true,
        sortable: true,
        minWidth: locale == 'zh-CN' ? 100 : 140,
      },
      {
        field: 'nextStationName',
        title: t('view.nextStation'),
        showOverflow: true,
        sortable: true,
        minWidth: locale == 'zh-CN' ? 100 : 120,
      },
      {
        field: 'sosCallNumber',
        title: t('view.emergencyGroupCallNumber'),
        showOverflow: true,
        sortable: true,
        minWidth: locale == 'zh-CN' ? 150 : 270,
      },
      {
        field: 'sosCallPriority',
        title: t('view.emergencyGroupCallPriority'),
        showOverflow: true,
        sortable: true,
        minWidth: locale == 'zh-CN' ? 170 : 260,
      },
      {
        field: 'groupCallNumber',
        title: t('view.inStationGroupCallNumber'),
        showOverflow: true,
        sortable: true,
        minWidth: locale == 'zh-CN' ? 150 : 260,
      },
      {
        field: 'groupCallPriority',
        title: t('view.inStationGroupCallPriority'),
        showOverflow: true,
        sortable: true,
        minWidth: locale == 'zh-CN' ? 170 : 260,
      },
      {
        field: 'tempCallNumber',
        title: t('view.adjacentStationGroupCallNumber'),
        showOverflow: true,
        sortable: true,
        minWidth: locale == 'zh-CN' ? 150 : 260,
      },
      {
        field: 'tempCallPriority',
        title: t('view.adjacentStationGroupCallPriority'),
        showOverflow: true,
        sortable: true,
        minWidth: locale == 'zh-CN' ? 170 : 260,
      },
      {
        field: 'startGlb',
        title: t('view.startingMileageMarkerMmeters'),
        showOverflow: true,
        sortable: true,
        visible: false,
        minWidth: locale == 'zh-CN' ? 150 : 260,
      },
      {
        field: 'endGlb',
        title: t('view.endingMileageMarkerMeters'),
        showOverflow: true,
        sortable: true,
        visible: false,
        minWidth: locale == 'zh-CN' ? 150 : 260,
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
        field: 'updateTime',
        title: t('view.updateTime'),
        showOverflow: true,
        sortable: true,
        minWidth: locale == 'zh-CN' ? 150 : 160,
        visible: false,
      },
      {
        field: 'indexOrder',
        title: t('view.sorting'),
        showOverflow: true,
        visible: false,
        sortable: true,
        minWidth: 90,
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
  const defFromData = reactive({
    lineId: null,
    remark: null,
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
    startGlb: null,
    endGlb: null,
    tempCallPriority: null,
    tempCallNumber: null,
    sosCallPriority: null,
    sosCallNumber: null,
    groupCallPriority: null,
    groupCallNumber: null,
    prevStationId: null,
    nextStationId: null,
    latitude: null,
    longitude: null,
    programUpdatePassWord: null,
    index: null,
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
    sortlist: ['lineNameCn asc,indexOrder asc'],
  });
  const seacthContent = ref({
    name: '',
  });
  const lineDatas = ref([]);
  const stationDatas = ref([]);
  const isShowUpdate = ref(false);
  const isRunMushMq = ref(false);
  getDDServerStations();

  //页码改变
  function handlePageChange() {
    getDDServerStations();
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
    getDDServerStations();
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

  //显示表单
  function showFrom(row) {
    getDDServerStationSimple();
    getDDServerLineSimple();
    if (myCommon.isnull(row)) {
      saveType.value = 'add';
      isShowForm.value = true;
    } else {
      //编辑
      getDDServerStation(row.id);
    }
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
        stationApi
          .DeleteDDServerStation(row.id.toString())
          .then(() => {
            isRunGet.value = false;
            message.success(t('view.deletionSuccessful'));
            getDDServerStations();
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
    isShowUpdate.value = false;
    isShowForm.value = false;
    formData.value = _.cloneDeep(defFromData);
    formRef.value.clearValidate();
  }

  //获取线路
  function getDDServerStation(id) {
    isRunGet.value = true;
    stationApi
      .GetDDServerStation(id.toString())
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
  function getDDServerStations() {
    loading.value = true;
    stationApi
      .GetDDServerStations({
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
        stationApi.AddDDServerStation(formData.value).then((data) => {
          data.lineName = lineDatas.value.find((m) => m.key == data.lineId).label;
          data.prevStationName = stationDatas.value.find((m) => m.key == data.prevStationId)?.label;
          data.nextStationName = stationDatas.value.find((m) => m.key == data.nextStationId)?.label;
          data.indexOrder = data.index;
          tableConfig.data?.splice(0, 0, data);
          formClose();
          message.success(t('view.additionSuccessful'));
          page.total = page.total + 1;
        });
      } else {
        stationApi.UpdateDDServerStation(formData.value).then((data) => {
          const oldData = tableConfig.data.find((m) => m.id == data.id);
          if (oldData) {
            myCommon.objectReplace(oldData, formData.value);
            oldData.lineName = lineDatas.value.find((m) => m.key == formData.value.lineId).label;
            oldData.name = data.name;
            oldData.prevStationName = stationDatas.value.find(
              (m) => m.key == formData.value.prevStationId,
            )?.label;
            oldData.nextStationName = stationDatas.value.find(
              (m) => m.key == formData.value.nextStationId,
            )?.label;
            oldData.updateTime = data.updateTime;
            oldData.indexOrder = data.index;
          }
          formClose();
          message.success(t('view.updateSuccessful'));
        });
      }
    });
  }

  function initPage() {
    page.current = 1;
    page.total = 0;
    getDDServerStations();
  }

  function getDDServerStationSimple() {
    stationApi.GetDDServerStationSimple().then((data) => {
      stationDatas.value = data;
    });
  }

  function getDDServerLineSimple() {
    lineApi.GetDDServerLineSimple().then((data) => {
      lineDatas.value = data;
    });
  }
  //发送命令
  function pushMq() {
    isRunMushMq.value = true;
    commonApi.PushDDServerUpdateDBMq({
      MqInfo: JSON.stringify({
        Type: 2,
        ClientId: mqttStore.mqttClient.options.clientId,
      }),
      execompleteBefore: () => {
        isRunMushMq.value = false;
      },
    });
  }
</script>
<style lang="less" scoped>
  @prefixCls: ~'@{namespace}-DDServcerStation-';

  .fanZhun {
    display: inline-block;
    transform: rotateX(180deg);
  }
</style>
