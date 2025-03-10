<template>
  <MyContent>
    <a-spin :spinning="isRunLoading">
      <vxe-grid
        :scroll-y="{ enabled: true }"
        v-bind="tableConfig"
        id="softwareManage"
        :auto-resize="true"
        ref="tableRef"
        :loading="loading"
        :row-config="{ keyField: 'serviceId' }"
        :column-config="{ resizable: true }"
        :custom-config="{ storage: true }"
        @sort-change="
          ({ sortList }) =>
            vxetableMyCommon.onSortChange({ sortList }, page, getSoftwares, [
              'orgName',
              'equipmentName',
              'serviceTypeName',
              'serviceName',
            ])
        "
        :seq-config="{ startIndex: (page.current - 1) * page.size }"
      >
        <template #pager>
          <vxe-pager
            background
            v-model:current-page="page.current"
            v-model:page-size="page.size"
            :total="page.total"
            @page-change="getSoftwares()"
          />
        </template>
        <template #toolbar_buttons>
          <div :class="`tableBtn`">
            <a-space direction="horizontal" size="small" align="start" style="margin: 0 5px">
              <AuthDom auth="softwareManage_query">
                <a-space direction="horizontal" size="small" :wrap="true" style="margin-bottom: 0">
                  <div class="row-div">
                    <a-space direction="horizontal" size="small" :wrap="true">
                      <label>{{ t('view.affiliatedDevice') }}：</label>
                      <a-tree-select
                        style="width: 180px"
                        v-model:value="seacthContent.equipmentId"
                        show-search
                        :dropdown-style="{ maxHeight: '400px', overflow: 'auto' }"
                        :placeholder="t('view.pleaseSelectAffiliatedDevice')"
                        allow-clear
                        show-arrow
                        :filterTreeNode="AntVueCommon.filterTreeNode"
                        :tree-data="equipmentData"
                      />
                    </a-space>
                  </div>
                  <div class="row-div">
                    <a-space direction="horizontal" size="small" :wrap="true">
                      <label>{{ t('view.softwareName') }}：</label>
                      <a-input
                        :style="{
                          width: '180px',
                        }"
                        @press-enter="initPage"
                        v-model:value="seacthContent.serviceName"
                        :placeholder="t('view.inputSoftwareNameQuery')"
                      />
                    </a-space>
                  </div>
                  <div class="row-div">
                    <a-space direction="horizontal" size="small" :wrap="true">
                      <a-button @click="initPage" type="primary">{{ t('view.query') }}</a-button>
                      <a-button @click="resetSeacth">{{ t('view.resetForm') }}</a-button>
                      <a-radio-group v-model:value="refresh" button-style="solid">
                        <a-radio-button value="yes">{{
                          t('view.enableAutoRefresh')
                        }}</a-radio-button>
                        <a-radio-button value="no">{{
                          t('view.disableAutoRefresh')
                        }}</a-radio-button>
                        <a-radio-button>{{
                          t('view.countdownSeconds', [refreshTime])
                        }}</a-radio-button>
                      </a-radio-group>
                    </a-space>
                  </div>
                  <!-- <div class="row-div">
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
                </div> -->
                </a-space>
              </AuthDom>
              <AuthDom auth="softwareManage_add">
                <a-space direction="horizontal" size="small" :wrap="true" style="margin-bottom: 0">
                  <div class="row-div">
                    <a-space direction="horizontal" size="small" :wrap="true">
                      <a-button class="ant-btn" @click="showFrom()">{{
                        t('view.addSoftware')
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
            <AuthDom auth="softwareManage_table_showconfig">
              <IconFontClass
                name="icon-baseui-wenben1"
                @click="showConfig(row)"
                style="color: #0fc10e"
                title="查看配置"
              />
            </AuthDom>
            <AuthDom auth="softwareManage_table_showlog">
              <IconFontClass
                name="icon-baseui-flowcontrol-log"
                @click="showLog(row)"
                style="color: #0fc10e"
                title="查看日志"
              />
            </AuthDom>
            <AuthDom auth="softwareManage_table_edit">
              <IconFontClass
                name="icon-baseui-edit-fill"
                @click="showFrom(row)"
                style="color: #0a61bd"
                :title="t('view.edit')"
              />
            </AuthDom>
            <AuthDom auth="softwareManage_table_delete">
              <IconFontClass
                name="icon-baseui-guanbicuowu"
                @click="remove(row)"
                style="color: red"
                :title="t('view.delete')"
              />
            </AuthDom>
          </div>
        </template>
        <template #isAlarm="{ row }">
          <span :style="{ color: row.isAlarm ? 'red' : 'green' }">{{
            row.isAlarm ? t('view.yes') : t('view.no')
          }}</span>
        </template>
        <!-- <template #remainingDays="{ row }">
        <span
          v-if="row.timeValid != null"
          :style="{
            fontSize: '20px',
            fontWeight: 500,
            color: row.remainingDays <= 0 ? 'red' : row.remainingDays <= 30 ? '#adad00' : 'green',
          }"
          >{{ row.remainingDays <= 0 ? t('view.hasExpired') : row.remainingDays }}</span
        >
      </template> -->
      </vxe-grid>
      <a-drawer
        :headerStyle="{ height: '49px', borderBottom: '2px solid #eee' }"
        :width="locale == 'zh-CN' ? 500 : 600"
        :visible="isShowForm"
        :title="t('view.configuration')"
        :footer-style="{ textAlign: 'right' }"
        @close="formClose"
      >
        <a-form
          :label-col="{ span: locale == 'zh-CN' ? 7 : 10 }"
          :style="{ paddingRight: '2px' }"
          autocomplete="off"
          ref="formRef"
          :model="formData"
        >
          <a-form-item
            :label="t('view.affiliatedDevice')"
            name="equipmentId"
            :rules="[{ required: true, message: t('view.pleaseSelectAffiliatedDevice') }]"
          >
            <a-select
              allowClear
              show-search
              :filter-option="AntVueCommon.filterOption"
              :placeholder="t('view.pleaseSelectAffiliatedDevice')"
              v-model:value="formData.equipmentId"
              :options="equipmentData"
            />
          </a-form-item>
          <a-form-item
            :label="t('view.serviceType')"
            name="serviceType"
            :rules="[{ required: true, message: t('view.pleaseSelectSoftwareServiceType') }]"
          >
            <a-select
              show-search
              :filter-option="AntVueCommon.filterOption"
              :placeholder="t('view.pleaseSelectSoftwareServiceType')"
              v-model:value="formData.serviceType"
              :options="dictionariesData.filter((m) => m.dictionariesClass == 'serviceType')"
            />
          </a-form-item>
          <a-form-item
            name="serviceCode"
            :label="t('view.uniqueNumber')"
            :rules="[
              { required: true, message: '' },
              { max: 20, message: t('view.uniqueNumberIsTooLong') },
              { validator: formValidator.empty, message: t('view.pleaseEnterUniqueNumber') },
            ]"
          >
            <a-input
              v-model:value="formData.serviceCode"
              :placeholder="t('view.pleaseEnterUniqueNumber')"
              autocomplete="off"
            />
          </a-form-item>
          <a-form-item
            name="serviceNameCn"
            :label="t('view.softwareNameCn')"
            :rules="[
              { required: true, message: '' },
              { max: 64, message: t('view.softwareNameIsTooLong', [64]) },
              { validator: formValidator.empty, message: t('view.pleaseEnterSoftwareName') },
            ]"
          >
            <a-input
              v-model:value="formData.serviceNameCn"
              :placeholder="t('view.pleaseEnterSoftwareName')"
              autocomplete="off"
            />
          </a-form-item>
          <a-form-item
            name="serviceNameEn"
            :label="t('view.softwareNameEn')"
            :rules="[
              { required: true, message: '' },
              { max: 250, message: t('view.softwareNameIsTooLong', [250]) },
              { validator: formValidator.empty, message: t('view.pleaseEnterSoftwareName') },
            ]"
          >
            <a-input
              v-model:value="formData.serviceNameEn"
              :placeholder="t('view.pleaseEnterSoftwareName')"
              autocomplete="off"
            />
          </a-form-item>
          <a-form-item
            name="serviceNameFr"
            :label="t('view.softwareNameFr')"
            :rules="[
              { required: true, message: '' },
              { max: 250, message: t('view.softwareNameIsTooLong', [250]) },
              { validator: formValidator.empty, message: t('view.pleaseEnterSoftwareName') },
            ]"
          >
            <a-input
              v-model:value="formData.serviceNameFr"
              :placeholder="t('view.pleaseEnterSoftwareName')"
              autocomplete="off"
            />
          </a-form-item>
          <!-- <a-form-item
          name="isdn"
          :label="t('view.isdnNumber')"
          :rules="[{ max: 20, message: t('view.pleaseEnterIdsn') }]"
        >
          <a-input
            :placeholder="t('view.pleaseEnterIdsn')"
            v-model:value="formData.isdn"
            autocomplete="off"
          />
        </a-form-item> -->
          <a-form-item
            name="filePath"
            :label="t('view.deploymentPath')"
            :rules="[{ max: 20, message: t('view.deploymentPathIsTooLong') }]"
          >
            <a-input
              :placeholder="t('view.pleaseEnterDeploymentPath')"
              v-model:value="formData.filePath"
              autocomplete="off"
            />
          </a-form-item>
          <!-- <a-form-item
            name="port"
            :label="t('view.portNumber')"
            :rules="[
              { required: true, message: t('view.pleaseEnterPortNumber') },
              {
                validator: formValidator.min,
                min: 1,
                message: t('view.portNumberMustBeBetweenAnd', [1, 65535]),
              },
              {
                validator: formValidator.max,
                max: 65535,
                message: t('view.portNumberMustBeBetweenAnd', [1, 65535]),
              },
            ]"
          >
            <a-input-number
              :placeholder="t('view.pleaseEnterPortNumber')"
              v-model:value="formData.port"
              autocomplete="off"
              :precision="0"
            />
          </a-form-item> -->
          <a-form-item
            name="isUpPerformance"
            :label="t('view.performanceReporting')"
            :rules="[
              {
                required: true,
                message: t('view.pleaseSelectWhetherToEnablePerformanceReporting'),
              },
            ]"
          >
            <a-switch v-model:checked="formData.isUpPerformance" />
          </a-form-item>
          <a-form-item
            name="orderIndex"
            :label="t('view.softwareSorting')"
            :rules="[
              { required: true, message: t('view.pleaseInputSoftwareSorting') },
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
              :placeholder="t('view.pleaseInputSoftwareSorting')"
              :precision="3"
              style="width: 300px"
              v-model:value="formData.orderIndex"
            />
          </a-form-item>
          <a-form-item
            name="remark"
            :label="t('view.remarks')"
            :rules="[{ max: 250, message: t('view.remarksTooLong') }]"
          >
            <a-textarea
              :placeholder="t('view.pleaseInputRemarkInformation')"
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
      <a-drawer
        :headerStyle="{ height: '49px', borderBottom: '2px solid #eee' }"
        :width="700"
        :visible="isShowConfig"
        :title="t('view.configuration')"
        :footer-style="{ textAlign: 'right' }"
        @close="closeConfig"
      >
        <div :class="`${prefixCls}codemirror`">
          <a-spin :spinning="isRunGetConfig">
            <codemirror
              ref="codemirrorRef"
              :modelValue="modelValue"
              :style="{ height: '100%', overflow: 'auto' }"
              :language="codemirrorLanguage"
            />
          </a-spin>
        </div>
        <template #footer>
          <a-spin :spinning="fromSpinning">
            <a-button style="margin-left: 8px" @click="closeConfig">{{ t('view.close') }}</a-button>
          </a-spin>
        </template>
      </a-drawer>
      <a-drawer
        :headerStyle="{ height: '49px', borderBottom: '2px solid #eee' }"
        :width="700"
        :visible="isShowLog"
        :title="t('view.serviceLog')"
        :footer-style="{ textAlign: 'right' }"
        @close="closeLog"
      >
        <vxe-table
          :show-header-overflow="true"
          height="100%"
          :scroll-y="{ enabled: true }"
          :auto-resize="true"
          :class="`${prefixCls}logTable`"
          ref="logTableRef"
          :loading="isRunGetLog"
          :data="logCollectionData"
          border="none"
          :show-header="true"
          :show-overflow="true"
          :show-footer="false"
          :menu-config="logMenuConfig"
          :checkbox-config="checkboxConfig"
          @menu-click="contextMenuClickEvent"
          :row-config="{ isCurrent: true, isHover: true }"
        >
          <vxe-column type="checkbox" width="60" />
          <vxe-column field="Name" :title="t('view.name')">
            <template #default="{ row }">
              <span @dblclick="logNamedblclick(row)" class="name">
                <IconFontClass
                  :title="row.IsBack ? t('view.returnToThePreviousDirectory') : row.Name"
                  :name="
                    row.IsBack
                      ? 'icon-baseui-fanhuishangyiji'
                      : row.IsParent
                        ? 'icon-baseui-wenjianjia'
                        : row.Name.lastIndexOf('.') == -1
                          ? 'icon-baseui-weizhiwenjian'
                          : ['txt', 'log'].includes(
                                row.Name.substring(row.Name.lastIndexOf('.') + 1).toLowerCase(),
                              )
                            ? 'icon-baseui-wenben1'
                            : 'icon-baseui-weizhiwenjian'
                  "
                />
                {{ row.Name }}
              </span>
            </template>
          </vxe-column>
          <vxe-column field="Size" :title="t('view.size_kb')" align="right">
            <template #default="{ row }">
              {{ row.Size != -1 ? row.Size : '' }}
            </template>
          </vxe-column>
          <vxe-column field="Time" :title="t('view.lastModifiedTime')" align="right">
            <template #default="{ row }">
              {{ row.Time ? dayjs(row.Time).format('YYYY-MM-DD HH:mm:ss') : '' }}
            </template>
          </vxe-column>
        </vxe-table>
        <template #footer>
          <a-spin :spinning="fromSpinning">
            <a-button style="margin-left: 8px" type="primary" @click="downLogMqtt">{{
              t('view.download')
            }}</a-button>
            <a-button style="margin-left: 8px" @click="closeLog">{{ t('view.close') }}</a-button>
          </a-spin>
        </template>
      </a-drawer>
    </a-spin>
  </MyContent>
</template>
<script setup lang="ts">
  import vxetableMyCommon from '@/utils/MyCommon/VxetableMyCommon';
  import codemirror from '/@/components/MyCodemirror/codemirror.vue';
  import formValidator from '@/utils/MyCommon/formValidator';
  import AntVueCommon from '@/utils/MyCommon/AntVueCommon';
  import myCommon from '@/utils/MyCommon/common';
  import { ref, reactive, createVNode, nextTick, watch } from 'vue';
  import { useDesign } from '@/hooks/web/useDesign';
  import dayjs from 'dayjs';
  import { VxeGrid, VxeGridProps } from 'vxe-table';
  import softwareApi from '@/api/software';
  import { message, Modal } from 'ant-design-vue';
  import { ExclamationCircleOutlined } from '@ant-design/icons-vue';
  import dictionariesApi from '@/api/dictionaries';
  import equipmentApi from '@/api/equipment';
  import { tryOnUnmounted } from '@vueuse/core';
  import { useMqttStoreWithOut } from '@/store/modules/mqtt';
  import { useUserStore } from '@/store/modules/user';
  import organizationApi from '@/api/organization';
  import { useI18n } from '@/hooks/web/useI18n';
  import { useLocaleStore } from '@/store/modules/locale';

  const { t } = useI18n();
  const localeStore = useLocaleStore();
  const locale = localeStore.getLocale;
  defineOptions({ name: 'SoftwareManage' });
  const { prefixCls } = useDesign('softwareManage-');
  const mqttStore = useMqttStoreWithOut();
  const userStore = useUserStore();
  const loading = ref(true);
  const isRunLoading = ref(false);
  const tableConfig = reactive<VxeGridProps>({
    showOverflow: true,
    showHeaderOverflow: true,
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
        field: 'serviceId',
        title: t('view.recordId'),
        sortable: true,
        visible: false,
        showOverflow: true,
        minWidth: locale == 'zh-CN' ? 130 : 150,
        fixed: 'left',
      },
      {
        field: 'orgName',
        title: t('view.departmentName'),
        showOverflow: true,
        sortable: true,
        visible: false,
        minWidth: 176,
        fixed: 'left',
      },
      {
        field: 'equipmentName',
        title: t('view.affiliatedDevice'),
        showOverflow: true,
        sortable: true,
        visible: false,
        minWidth: 146,
        fixed: 'left',
      },
      {
        field: 'serviceTypeName',
        title: t('view.serviceType'),
        showOverflow: true,
        sortable: true,
        minWidth: 136,
        visible: false,
        fixed: 'left',
      },
      {
        field: 'serviceName',
        title: t('view.softwareName'),
        showOverflow: true,
        sortable: true,
        minWidth: 200,
        fixed: 'left',
      },
      {
        field: 'serviceNameCn',
        title: t('view.softwareNameCn'),
        showOverflow: true,
        sortable: true,
        minWidth: 200,
        visible: false,
      },
      {
        field: 'serviceNameEn',
        title: t('view.softwareNameEn'),
        showOverflow: true,
        sortable: true,
        minWidth: 200,
        visible: false,
      },
      {
        field: 'serviceNameFr',
        title: t('view.softwareNameFr'),
        showOverflow: true,
        sortable: true,
        minWidth: 200,
        visible: false,
      },
      {
        field: 'serviceCode',
        title: t('view.uniqueNumber'),
        showOverflow: true,
        sortable: true,
        minWidth: 136,
      },
      {
        field: 'filePath',
        title: t('view.deploymentPath'),
        showOverflow: true,
        sortable: true,
        visible: false,
        minWidth: 186,
      },
      {
        field: 'newVersion',
        title: t('view.officialVersion'),
        showOverflow: true,
        sortable: true,
        minWidth: 146,
      },
      {
        field: 'runVersion',
        title: t('view.terminalVersion'),
        showOverflow: true,
        sortable: true,
        minWidth: 166,
      },
      // {
      //   field: 'port',
      //   title: t('view.runningPort'),
      //   showOverflow: true,
      //   sortable: true,
      //   visible: false,
      //   minWidth: 200,
      // },
      {
        field: 'isOnline',
        title: t('view.isOnline'),
        showOverflow: true,
        cellRender: { name: 'render_isno' },
        minWidth: 150,
      },
      {
        field: 'isAlarm',
        title: t('view.isAlert'),
        showOverflow: true,
        // sortable: true,
        slots: {
          default: 'isAlarm',
        },
        minWidth: 146,
      },
      {
        field: 'isUpPerformance',
        title: t('view.performanceReporting'),
        showOverflow: true,
        cellRender: { name: 'render_isno' },
        minWidth: 216,
      },
      {
        field: 'isPerformanceNormal',
        title: t('view.performanceNormal'),
        showOverflow: true,
        // sortable: true,
        cellRender: { name: 'render_isno' },
        minWidth: 200,
      },
      {
        field: 'changeTime',
        title: t('view.statusTime'),
        showOverflow: true,
        sortable: true,
        minWidth: 150,
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
        minWidth: locale == 'zh-CN' ? 150 : 170,
        showOverflow: true,
        visible: false,
        sortable: true,
      },
      // {
      //   field: 'timeValid',
      //   title: t('view.validityPeriod'),
      //   showOverflow: true,
      //   visible: false,
      //   sortable: true,
      //   minWidth: 160,
      // },
      // {
      //   field: 'remainingDays',
      //   title: t('view.remainingDays'),
      //   minWidth: 200,
      //   showOverflow: true,
      //   sortable: true,
      //   visible: false,
      //   slots: {
      //     default: 'remainingDays',
      //   },
      // },
      {
        field: 'orderIndex',
        title: t('view.sorting'),
        showOverflow: true,
        visible: false,
        sortable: true,
        minWidth: 100,
      },
      {
        field: 'remark',
        title: t('view.remarks'),
        showOverflow: true,
        sortable: true,
        visible: false,
        minWidth: 130,
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
        field: 'createUserName',
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
        field: 'modifyUserName',
        title: t('view.modifier'),
        minWidth: 130,
        showOverflow: true,
        visible: false,
        sortable: true,
      },
      {
        field: 'action_',
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
    equipmentId: null,
    serviceNameCn: null,
    serviceNameEn: null,
    serviceNameFr: null,
    projectid: 1,
    address: null,
    remark: null,
    orderIndex: null,
    port: null,
    serviceType: null,
    filePath: null,
    serviceCode: null,
    isUpPerformance: false,
    // isdn: null,
  });
  const formData = ref(_.cloneDeep(defFromData));
  const formRef = ref(null);
  const tableRef = ref({});
  const isShowForm = ref(false);
  const fromSpinning = ref(false);
  let saveType = 'add';
  const dictionariesData = ref([]);
  const equipmentData = ref([]);
  const seacthContent = ref({
    equipmentId: null,
    serviceName: null,
    SearchParameters: [],
  });
  const refresh = ref('yes');
  const refreshTime = ref(10);
  let refreshTimeId;
  const remainingDays = ref(null);
  const durationQueryType = ref(5);

  //配置信息
  const isRunGetConfig = ref(false);
  const isShowConfig = ref(false);
  const codemirrorRef = ref(null);
  const codemirrorLanguage = ref('json');
  const modelValue = ref('');

  //公用
  let newServerCode = null;
  let isShowContent = false;

  //日志信息
  const isShowLog = ref(false);
  const isRunGetLog = ref(false);
  const logCollectionData = ref([]);
  const logTableRef = ref(null);
  let LogDirectory = null;
  //每一步的数据
  let logTableStepData = [];
  //每一步的文件夹名称
  const logTableStepName = ref([]);
  let logTableStepDataRowIndex = [];
  let logTableStep = 0;
  const logMenuConfig = reactive({
    className: prefixCls + 'logTtable',
    body: {
      options: [
        [
          {
            code: 'down',
            name: t('view.download'),
            prefixIcon: 'iconfont icon-baseui-xiazai',
            className: prefixCls + 'logTtable-xiazai-item',
          },
        ],
      ],
    },
  });
  const checkboxConfig = reactive({
    checkMethod: ({ row }) => {
      return !row.IsBack;
    },
    visibleMethod({ row }) {
      return !row.IsBack;
    },
  });

  const organizationDatas = ref([]);
  let _organizationDatas = [];
  const page = reactive({
    current: 1,
    size: 20,
    total: 0,
    sortlist: ['orgOrderIndex asc', 'serviceTypeNameCn asc', 'orderIndex asc'],
  });

  getEquipments();
  getOrganization();
  getSoftwares(true);

  //重置搜索条件
  function resetSeacth() {
    seacthContent.value = {
      equipmentId: null,
      serviceName: null,
    };
  }

  function showFrom(row) {
    stopRefresh();
    getOrganization();
    getDictionaries();
    getEquipments();
    if (myCommon.isnull(row)) {
      saveType = 'add';
      isShowForm.value = true;
    } else {
      //编辑
      getByid(row.serviceId);
    }
  }

  //删除软件信息
  function remove(row) {
    Modal.confirm({
      maskClosable: true,
      title: t('view.areYouSureYouWantToDelete'),
      icon: createVNode(ExclamationCircleOutlined),
      content: '',
      onOk() {
        isRunLoading.value = true;
        softwareApi
          .DeleteService(row.serviceId)
          .then(() => {
            isRunLoading.value = false;
            message.success(t('view.deletionSuccessful'));
            getSoftwares();
          })
          .catch(() => {
            isRunLoading.value = false;
          });
      },
      onCancel() {},
    });
  }

  //关闭表单
  function formClose() {
    isShowForm.value = false;
    newServerCode = null;
    formData.value = _.cloneDeep(defFromData);
    formRef.value.clearValidate();
  }

  //获取软件列表
  function getByid(id) {
    isRunLoading.value = true;
    softwareApi
      .GetService(id)
      .then((data) => {
        isRunLoading.value = false;
        if (data) {
          formData.value = data;
          saveType = 'edit';
          isShowForm.value = true;
        } else {
          message.error(t('view.failedToRetrieveSoftwareInformation'));
        }
      })
      .catch(() => {
        isRunLoading.value = false;
      });
  }

  //获取软件列表
  function getSoftwares(isAuto = false) {
    loading.value = true;
    if (!isAuto) {
      refresh.value = 'no';
    }
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
    softwareApi
      .GetServices({
        ...seacthContent.value,
        culture: 'fr-FR',
        FullSort: page.sortlist.join(','),
        PageIndex: page.current,
        PageSize: page.size,
        execompleteBefore: () => {
          loading.value = false;
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

  //新增和编辑
  function saveFrom() {
    formRef.value.validate().then(() => {
      fromSpinning.value = true;
      const execompleteBefore = () => {
        fromSpinning.value = false;
      };
      formData.value['execompleteBefore'] = execompleteBefore;
      if (saveType == 'add') {
        softwareApi.AddService(formData.value).then((data) => {
          data.serviceTypeName = dictionariesData.value.find(
            (m) => m.key == data.serviceType,
          )?.label;
          data.equipmentName = equipmentData.value.find((m) => m.key == data.equipmentId)?.label;
          data.orgName = _organizationDatas.find((m) => m.key == data.orgId)?.label;
          tableConfig.data?.splice(0, 0, data);
          formClose();
          message.success(t('view.additionSuccessful'));
          page.total = page.total + 1;
        });
      } else {
        softwareApi.UpdateService(formData.value).then((data) => {
          const oldData = tableConfig.data.find((m) => m.serviceId == data.serviceId);
          if (oldData) {
            delete data.createtTime;
            delete data.createUserName;
            myCommon.objectReplace(oldData, data);
            oldData.modifyTime = data.modifyTime;
            oldData.modifyUser = data.modifyUserName;
            oldData.serviceTypeName = dictionariesData.value.find(
              (m) => m.key == data.serviceType,
            )?.label;
            oldData.equipmentName = equipmentData.value.find(
              (m) => m.key == data.equipmentId,
            )?.label;
            oldData.orgName = _organizationDatas.find((m) => m.key == data.orgId)?.label;
          }
          formClose();
          message.success(t('view.updateSuccessful'));
        });
      }
    });
  }

  //获取字典
  function getDictionaries() {
    dictionariesApi
      .GetDictionariesSimple({
        dictionariesClass: ['serviceType'],
      })
      .then((data) => {
        dictionariesData.value = data;
      })
      .catch(() => {
        dictionariesData.value = [];
      });
  }

  //获取设备
  function getEquipments() {
    equipmentApi
      .GetEquipmentSimple({
        execompleteBefore: () => {
          loading.value = false;
        },
      })
      .then((data) => {
        equipmentData.value = data;
      })
      .catch(() => {
        equipmentData.value = [];
      });
  }

  function initPage() {
    page.current = 1;
    page.total = 0;
    getSoftwares();
  }

  //刷新数据
  function refreshData() {
    if (refresh.value == 'yes') {
      refreshTimeId = setTimeout(() => {
        if (refreshTime.value <= 0) {
          refreshTime.value = 10;
          nextTick(() => {
            getSoftwares(true);
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

  //显示查看服务配置
  function showConfig(row) {
    if (row.isOnline) {
      stopRefresh();
      isShowConfig.value = true;
      newServerCode = row.serviceCode;
      isRunGetConfig.value = true;
      mqttStore.publish(
        mqttStore.lookConfig.replace(mqttStore.monitorClient, '/' + row.serviceCode),
        JSON.stringify({
          ServiceCode: row.serviceCode,
          ClientId: mqttStore.mqttClient.options.clientId,
          UserId: userStore.getUserInfo.userId,
        }),
        function (msg) {
          isRunGetConfig.value = false;
          msg ? message.error(msg) : message.success(t('view.requestSent'));
        },
      );
    } else {
      message.info(t('view.serviceOfflineTip'));
    }
  }

  //关闭查看服务配置
  function closeConfig() {
    isRunGetConfig.value = false;
    isShowConfig.value = false;
    isShowContent = false;
    modelValue.value = '';
    newServerCode = null;
    refresh.value = 'yes';
    mqttStore.setNewServicConfig(null);
  }

  //显示查看服务日志
  function showLog(row) {
    if (row.isOnline) {
      stopRefresh();
      isShowLog.value = true;
      newServerCode = row.serviceCode;
      isRunGetLog.value = true;
      mqttStore.publish(
        mqttStore.lookLog.replace(mqttStore.monitorClient, '/' + row.serviceCode),
        JSON.stringify({
          ServiceCode: row.serviceCode,
          ClientId: mqttStore.mqttClient.options.clientId,
          UserId: userStore.getUserInfo.userId,
          LogLevel: 0,
        }),
        function (msg) {
          isRunGetLog.value = false;
          msg ? message.error(msg) : message.success(t('view.requestSent'));
        },
      );
    } else {
      message.info(t('view.serviceOfflineTip'));
    }
  }

  //关闭查看服务日志
  function closeLog() {
    logCollectionData.value = [];
    isShowLog.value = false;
    logTableStepName.value = [];
    logTableStepData = [];
    logTableStepDataRowIndex = [];
    logTableStep = 0;
    isShowContent = false;
    mqttStore.setNewServiceLogShowDirectory(null);
  }

  //表格右键事件
  function contextMenuClickEvent({ menu, row, column }) {
    switch (menu.code) {
      case 'down':
        downLogMqtt();
        break;
    }
  }
  //发送下载日志文件
  function downLogMqtt() {
    const checkDatas = logTableRef.value.getCheckboxRecords(false);
    if (checkDatas && checkDatas.length > 0) {
      const LogFileCollection = [];
      let name = logTableStepName.value.join('\\');
      name = name != '' ? '\\' + name : '';
      checkDatas.forEach((m) => {
        LogFileCollection.push({ Name: `${LogDirectory}${name}\\${m.Name}`, IsParent: m.IsParent });
      });
      mqttStore.publish(
        mqttStore.downLog.replace(mqttStore.monitorClient, '/' + newServerCode),
        JSON.stringify({
          ServiceCode: newServerCode,
          ClientId: mqttStore.mqttClient.options.clientId,
          UserId: userStore.getUserInfo.userId,
          LogFileCollection: LogFileCollection,
        }),
        function (msg) {
          isRunGetLog.value = false;
          msg ? message.error(msg) : message.success(t('view.requestSent'));
        },
      );
    } else {
      message.info(t('view.pleaseSelectTheFilesToBeDownloadedFirst'));
    }
  }

  //双击日志名称
  function logNamedblclick(row) {
    if (row.IsBack) {
      logTableStep--;
      logCollectionData.value = logTableStepData[logTableStep];
      logTableStepData.splice(logTableStep + 1);
      logTableStepName.value.splice(logTableStep);
      nextTick(() => {
        logTableRef.value.scrollToRow(logTableStepDataRowIndex[logTableStep - 1]);
        logTableStepDataRowIndex.splice(logTableStep);
      });
    } else if (row.IsParent) {
      logTableStep++;
      logTableStepData.push(row.SubCollection);
      logTableStepName.value.push(row.Name);
      logCollectionData.value = row.SubCollection;
      logTableStepDataRowIndex.push(row);
    }
  }

  //获取部门
  function getOrganization() {
    organizationApi
      .GetOrganizationTree({})
      .then((data) => {
        organizationDatas.value = data;
        myCommon.generateList(_organizationDatas, organizationDatas.value, 'children');
      })
      .catch(() => {
        loading.value = false;
        _organizationDatas = [];
      });
  }

  //监控是否开启自动刷新
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

  watch(
    () => mqttStore.newServicConfig,
    () => {
      if (
        mqttStore.newServicConfig != null &&
        isShowConfig.value &&
        newServerCode == mqttStore.newServicConfig.ServiceCode &&
        !isShowContent
      ) {
        isShowContent = true;
        isRunGetConfig.value = false;
        nextTick(() => {
          codemirrorLanguage.value = mqttStore.newServicConfig.ContentType;
          modelValue.value = mqttStore.newServicConfig.Content;
        });
      }
    },
  );

  watch(
    () => mqttStore.newServiceLogShowDirectory,
    () => {
      if (
        mqttStore.newServiceLogShowDirectory != null &&
        isShowLog.value &&
        newServerCode == mqttStore.newServiceLogShowDirectory.ServiceCode &&
        !isShowContent
      ) {
        isShowContent = true;
        isRunGetLog.value = false;
        nextTick(() => {
          logCollectionData.value = mqttStore.newServiceLogShowDirectory.LogCollection;
          LogDirectory = mqttStore.newServiceLogShowDirectory.LogDirectory;
          logTableStepData.push(logCollectionData.value);
        });
      }
    },
  );

  watch(
    () => logTableStepName.value,
    () => {
      if (logTableStepName.value.length > 0) {
        nextTick(() => {
          logTableRef.value.insert({
            Name: '...\\' + logTableStepName.value.join('\\'),
            IsBack: true,
            Size: -1,
            Time: '',
          });
        });
      }
    },
    { deep: true },
  );

  //页面卸载后
  tryOnUnmounted(() => {
    stopRefresh();
  });
</script>
<style lang="less" scoped>
  @prefixCls: ~'@{namespace}-softwareManage-';

  .@{prefixCls}codemirror {
    height: 100%;
  }

  .tableBtn {
    width: 100%;
  }
</style>
<style lang="less">
  @prefixCls: ~'@{namespace}-softwareManage-';

  .@{prefixCls}logTtable-xiazai-item {
    width: 110px !important;
  }

  .@{prefixCls}logTable {
    user-select: none;

    .name {
      cursor: pointer;
    }

    .icon-baseui-xiazai {
      top: 0 !important;
    }

    .icon-baseui-wenjianjia {
      color: #ffb100;
    }

    .icon-baseui-wenben1 {
      color: #adadad;
    }

    .icon-baseui-weizhiwenjian {
      color: #0a61bd;
    }

    .icon-baseui-fanhuishangyiji {
      color: green;
    }
  }
</style>
