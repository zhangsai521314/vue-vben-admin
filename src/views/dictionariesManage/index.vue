<template>
  <MyContent :class="prefixCls">
    <a-spin :spinning="isRunLoading">
      <div style="width: 100%; height: 100%">
        <!-- :refresh="{ queryMethod: getDictionariess }" -->
        <vxe-toolbar ref="toolbarRef" custom>
          <template #buttons>
            <div :class="`tableBtn`">
              <a-space direction="horizontal" size="small" align="start" style="margin: 0 5px">
                <AuthDom auth="dictionariesManage_query">
                  <a-space
                    direction="horizontal"
                    size="small"
                    :wrap="true"
                    style="width: 100%; margin-bottom: 0"
                  >
                    <div class="row-div">
                      <a-space direction="horizontal" size="small" :wrap="true">
                        <label>{{ t('view.dictionaryName') }}：</label>
                        <a-input
                          @press-enter="getDictionariess"
                          v-model:value="seacthContent.dictionariesName"
                          :placeholder="t('view.enterDictionaryNameToSearch')"
                        />
                      </a-space>
                    </div>
                    <div class="row-div">
                      <a-space direction="horizontal" size="small" :wrap="true">
                        <label>{{ t('view.dictionaryType') }}：</label>
                        <a-select
                          :placeholder="t('view.pleaseSelectDictionaryType')"
                          style="width: 170px"
                          allow-clear
                          show-search
                          :filter-option="AntVueCommon.filterOption"
                          v-model:value="seacthContent.dictionariesClass"
                        >
                          <a-select-option value="equipmentType">{{
                            t('view.hardwareDevice')
                          }}</a-select-option>
                          <a-select-option value="systemType">{{
                            t('view.operatingSystem')
                          }}</a-select-option>
                          <a-select-option value="serviceType">{{
                            t('view.softwareService')
                          }}</a-select-option>
                          <a-select-option value="msgType">{{
                            t('view.informationPrompt')
                          }}</a-select-option>
                          <a-select-option value="commonConfig">{{
                            t('view.generalConfiguration')
                          }}</a-select-option>
                          <a-select-option value="performanceAlarmType">{{
                            t('view.devicePerformanceAlarmThreshold')
                          }}</a-select-option>
                          <a-select-option value="collectionFrequency">{{
                            t('view.dataFrequency')
                          }}</a-select-option>
                          <a-select-option value="handPower"
                            >{{ t('view.handheldTerminalPermissions') }}
                          </a-select-option>

                          <a-select-option value="cirType">{{
                            t('view.locomotiveType')
                          }}</a-select-option>
                          <a-select-option value="userFunction"
                            >{{ t('view.userFunctionCode') }}
                          </a-select-option>
                          <a-select-option value="dispatchUserFunction"
                            >{{ t('view.dispatchUserFunctionCode') }}
                          </a-select-option>
                          <a-select-option value="vehicleType"
                            >{{ t('view.vehicleTypeCategory') }}
                          </a-select-option>
                          <a-select-option value="Ln_L4L5"
                            >{{ t('view.positionTypeL4L5') }}
                          </a-select-option>
                        </a-select>
                      </a-space>
                    </div>
                    <div class="row-div">
                      <a-space direction="horizontal" size="small" :wrap="true">
                        <label>{{ t('view.belongsToServiceType') }}：</label>
                        <a-select
                          style="width: 170px"
                          allow-clear
                          show-search
                          :filter-option="AntVueCommon.filterOption"
                          :placeholder="t('view.pleaseSelectServiceType')"
                          v-model:value="seacthContent.serviceType"
                          :options="serviceTypeData"
                        />
                      </a-space>
                    </div>
                    <div class="row-div">
                      <a-space direction="horizontal" size="small" :wrap="true">
                        <a-button @click="getDictionariess" type="primary">{{
                          t('view.query')
                        }}</a-button>
                        <a-button @click="resetSeacth">{{ t('view.resetForm') }}</a-button>
                      </a-space>
                    </div>
                  </a-space>
                </AuthDom>
                <AuthDom auth="dictionariesManage_add">
                  <a-space
                    direction="horizontal"
                    size="small"
                    :wrap="true"
                    style="margin-bottom: 0"
                  >
                    <div class="row-div">
                      <a-space direction="horizontal" size="small" :wrap="true">
                        <a-button class="ant-btn" @click="showFrom('add', null, 0)">{{
                          t('view.addDictionary')
                        }}</a-button>
                        <!-- 新增顶级字典 -->
                      </a-space>
                    </div>
                  </a-space>
                </AuthDom>
                <AuthDom auth="dictionariesManage_sync_performance">
                  <a-space
                    direction="horizontal"
                    size="small"
                    :wrap="true"
                    style="margin-bottom: 0"
                  >
                    <div class="row-div">
                      <a-space direction="horizontal" size="small" :wrap="true">
                        <a-spin :spinning="syncMqttPerformance">
                          <a-button
                            class="ant-btn"
                            @click="syncPerformance('collectionFrequency')"
                            >{{ t('view.synchronizeDevicePerformanceReportFrequency') }}</a-button
                          >
                        </a-spin>
                      </a-space>
                    </div>
                  </a-space>
                </AuthDom>
              </a-space>
            </div>
          </template>
        </vxe-toolbar>
        <div style="width: 100%; height: calc(100% - 74px)">
          <vxe-table
            id="dictionariesManage"
            :scroll-y="{ enabled: true }"
            :border="true"
            :auto-resize="true"
            height="100%"
            ref="tableRef"
            :show-overflow="true"
            :show-header-overflow="true"
            :loading="loading"
            :custom-config="{ storage: true }"
            :row-config="{ isHover: true, useKey: true, keyField: 'dictionariesId' }"
            :column-config="{ resizable: true }"
            :tree-config="{ transform: true, rowField: 'dictionariesId', parentField: 'parentId' }"
            :data="tableConfigData"
          >
            <vxe-column
              type="seq"
              :title="t('view.serialNumber')"
              :minWidth="locale == 'zh-CN' ? 70 : 160"
              fixed="left"
            />
            <vxe-column
              field="dictionariesId"
              :title="t('view.recordId')"
              :visible="false"
              minWidth="136"
              fixed="left"
            />
            <vxe-column
              field="dictionariesClass"
              :title="t('view.dictionaryType')"
              :sortable="true"
              minWidth="166"
              fixed="left"
            >
              <template #default="{ row }">
                <span>{{
                  row.dictionariesClass == 'equipmentType'
                    ? t('view.hardwareDevice')
                    : row.dictionariesClass == 'systemType'
                      ? t('view.operatingSystem')
                      : row.dictionariesClass == 'serviceType'
                        ? t('view.softwareService')
                        : row.dictionariesClass == 'msgType'
                          ? t('view.informationPrompt')
                          : row.dictionariesClass == 'performanceAlarmType'
                            ? t('view.devicePerformanceAlarmThreshold')
                            : row.dictionariesClass == 'collectionFrequency'
                              ? t('view.dataFrequency')
                              : row.dictionariesClass == 'commonConfig'
                                ? t('view.generalConfiguration')
                                : row.dictionariesClass == 'cirType'
                                  ? t('view.locomotiveType')
                                  : row.dictionariesClass == 'userFunction'
                                    ? t('view.userFunctionCode')
                                    : row.dictionariesClass == 'dispatchUserFunction'
                                      ? t('view.dispatchUserFunctionCode')
                                      : row.dictionariesClass == 'vehicleType'
                                        ? t('view.vehicleTypeCategory')
                                        : row.dictionariesClass == 'handPower'
                                          ? t('view.handheldTerminalPermissions')
                                          : row.dictionariesClass == 'Ln_L4L5'
                                            ? t('view.positionTypeL4L5')
                                            : ''
                }}</span>
              </template>
            </vxe-column>
            <vxe-column
              field="dictionariesName"
              :title="t('view.dictionaryName')"
              tree-node
              :sortable="true"
              minWidth="166"
              fixed="left"
            />
            <vxe-column
              field="dictionariesNameCn"
              :title="t('view.dictionaryNameCn')"
              tree-node
              :sortable="true"
              minWidth="220"
              :visible="false"
            />
            <vxe-column
              field="dictionariesNameEn"
              :title="t('view.dictionaryNameEn')"
              tree-node
              :sortable="true"
              minWidth="220"
              :visible="false"
            />
            <vxe-column
              field="dictionariesNameFr"
              :title="t('view.dictionaryNameFr')"
              tree-node
              :sortable="true"
              minWidth="226"
              :visible="false"
            />
            <vxe-column
              field="serviceTypeName"
              :title="t('view.belongsToServiceType')"
              :sortable="true"
              minWidth="186"
            />
            <vxe-column field="isKeyMaster" :title="t('view.isCustomPrimaryKey')" minWidth="186">
              <template #default="{ row }">
                <span :style="{ color: row.isKeyMaster ? 'green' : 'red' }">{{
                  row.isKeyMaster ? t('view.yes') : t('view.no')
                }}</span>
              </template>
            </vxe-column>
            <vxe-column
              field="dictionariesKey"
              :title="t('view.customPrimaryKeyValue')"
              :sortable="true"
              minWidth="260"
            />
            <vxe-column field="isSystem" :title="t('view.isSystem')" minWidth="140">
              <template #default="{ row }">
                <span :style="{ color: row.isSystem ? 'green' : 'red' }">{{
                  row.isSystem ? t('view.yes') : t('view.no')
                }}</span>
              </template>
            </vxe-column>
            <vxe-column
              field="isSync"
              :title="t('view.isSynchronized')"
              minWidth="170"
              :visible="false"
            >
              <template #default="{ row }">
                <span
                  v-if="row.dictionariesClass == 'collectionFrequency'"
                  :style="{ color: row.isSync ? 'green' : 'red' }"
                  >{{ row.isSync ? t('view.yes') : t('view.no') }}</span
                >
                <span v-else style="color: green">{{ t('view.noSynchronizationNeeded') }}</span>
              </template>
            </vxe-column>
            <vxe-column
              field="syncTime"
              :title="t('view.synchronizationTime')"
              :visible="false"
              :sortable="true"
              minWidth="196"
            />
            <vxe-column
              field="orderIndex"
              :title="t('view.sorting')"
              :visible="false"
              :sortable="true"
              minWidth="100"
            />
            <vxe-column
              field="other"
              :title="t('view.auxiliaryInformation')"
              :showOverflow="true"
              :sortable="true"
              minWidth="196"
            />
            <vxe-column
              field="remark"
              :title="t('view.remarks')"
              :showOverflow="true"
              :sortable="true"
              minWidth="230"
            />
            <vxe-column
              field="createTime"
              :title="t('view.creationTime')"
              :visible="false"
              :sortable="true"
              minWidth="150"
            />
            <vxe-column
              field="createUser"
              :title="t('view.creator')"
              :visible="false"
              :sortable="true"
              minWidth="130"
            />
            <vxe-column
              field="modifyTime"
              :title="t('view.modificationTime')"
              :visible="false"
              :sortable="true"
              minWidth="170"
            />
            <vxe-column
              field="modifyUser"
              :title="t('view.modifier')"
              :visible="false"
              :sortable="true"
              minWidth="130"
            />
            <vxe-column :title="t('view.action')" width="140" fixed="right">
              <template #default="{ row }">
                <div :class="`tableStyle`">
                  <template v-if="!row.isSystem">
                    <!-- <AuthDom auth="dictionariesManage_table_add">
                      <IconFontClass
                        name="icon-baseui-tianjiawukuang"
                        @click="showFrom('add', row, row.dictionariesId)"
                        style="color: #0a61bd"
                        :title="增加子级"
                      />
                    </AuthDom> -->
                    <AuthDom auth="dictionariesManage_table_edit">
                      <IconFontClass
                        name="icon-baseui-edit-fill"
                        @click="showFrom('edit', row, row.parentId)"
                        style="color: #0a61bd"
                        :title="t('view.edit')"
                      />
                    </AuthDom>
                    <AuthDom auth="dictionariesManage_table_delete">
                      <IconFontClass
                        name="icon-baseui-guanbicuowu"
                        @click="remove(row)"
                        style="color: red"
                        :title="t('view.delete')"
                      />
                    </AuthDom>
                  </template>
                  <span v-else style="color: red">{{
                    t('view.systemDictionaryCannotBeModified')
                  }}</span>
                </div>
              </template>
            </vxe-column>
          </vxe-table>
        </div>
      </div>
    </a-spin>
    <a-drawer
      :headerStyle="{ height: '49px', borderBottom: '2px solid #eee' }"
      :width="locale == 'zh-CN' ? 500 : 600"
      :visible="isShowForm"
      :title="t('view.dictionary')"
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
          name="dictionariesNameCn"
          :label="t('view.dictionaryNameCn')"
          :rules="[
            { required: true, message: '' },
            { max: 40, message: t('view.dictionaryNameTooLong', [40]) },
            { validator: formValidator.empty, message: t('view.pleaseEnterDictionaryName') },
          ]"
        >
          <a-input
            v-model:value="formData.dictionariesNameCn"
            :placeholder="t('view.pleaseEnterDictionaryName')"
            autocomplete="off"
          />
        </a-form-item>
        <a-form-item
          name="dictionariesNameEn"
          :label="t('view.dictionaryNameEn')"
          :rules="[
            { required: true, message: '' },
            { max: 40, message: t('view.dictionaryNameTooLong', [40]) },
            { validator: formValidator.empty, message: t('view.pleaseEnterDictionaryName') },
          ]"
        >
          <a-input
            v-model:value="formData.dictionariesNameEn"
            :placeholder="t('view.pleaseEnterDictionaryName')"
            autocomplete="off"
          />
        </a-form-item>
        <a-form-item
          name="dictionariesNameFr"
          :label="t('view.dictionaryNameFr')"
          :rules="[
            { required: true, message: '' },
            { max: 40, message: t('view.dictionaryNameTooLong', [40]) },
            { validator: formValidator.empty, message: t('view.pleaseEnterDictionaryName') },
          ]"
        >
          <a-input
            v-model:value="formData.dictionariesNameFr"
            :placeholder="t('view.pleaseEnterDictionaryName')"
            autocomplete="off"
          />
        </a-form-item>
        <a-form-item
          name="dictionariesClass"
          :label="t('view.dictionaryType')"
          :rules="[{ required: true, message: t('view.pleaseSelectDictionaryType') }]"
        >
          <a-select
            :placeholder="t('view.pleaseSelectDictionaryType')"
            :rules="[{ required: true, message: t('view.pleaseSelectDictionaryType') }]"
            v-model:value="formData.dictionariesClass"
            :disabled="dictionariesClass_disabled"
            :title="dictionariesClass_disabled ? t('view.followParentAndCannotBeModified') : ''"
          >
            <a-select-option value="equipmentType">{{ t('view.hardwareDevice') }}</a-select-option>
            <a-select-option value="systemType">{{ t('view.operatingSystem') }}</a-select-option>
            <a-select-option value="serviceType">{{ t('view.softwareService') }}</a-select-option>
            <a-select-option value="msgType">{{ t('view.informationPrompt') }}</a-select-option>
            <a-select-option value="commonConfig">{{
              t('view.generalConfiguration')
            }}</a-select-option>

            <a-select-option value="handPower"
              >{{ t('view.handheldTerminalPermissions') }}
            </a-select-option>
            <a-select-option value="cirType">{{ t('view.locomotiveType') }}</a-select-option>
            <a-select-option value="userFunction"
              >{{ t('view.userFunctionCode') }}
            </a-select-option>
            <a-select-option value="dispatchUserFunction"
              >{{ t('view.dispatchUserFunctionCode') }}
            </a-select-option>
            <a-select-option value="vehicleType"
              >{{ t('view.vehicleTypeCategory') }}
            </a-select-option>
            <a-select-option value="Ln_L4L5">{{ t('view.positionTypeL4L5') }} </a-select-option>
            <a-select-option value="handPower"
              >{{ t('view.handheldTerminalPermissions') }}
            </a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item
          name="isKeyMaster"
          :label="t('view.isCustomPrimaryKey')"
          :rules="[{ required: true, message: t('view.pleaseSelectWhetherToCustomizePrimaryKey') }]"
        >
          <a-switch
            :title="dictionariesClass_disabled ? t('view.followParentAndCannotBeModified') : ''"
            :disabled="dictionariesClass_disabled"
            v-model:checked="formData.isKeyMaster"
          />
        </a-form-item>
        <a-form-item
          v-if="formData.isKeyMaster"
          name="dictionariesKey"
          :label="t('view.customPrimaryKeyValue')"
          :rules="[
            { required: true, message: '' },
            { max: 50, message: t('view.customPrimaryKeyValueTooLong', [50]) },
            {
              validator: formValidator.empty,
              message: t('view.pleaseInputCustomizedPrimaryKeyValue'),
            },
          ]"
        >
          <a-input
            v-model:value="formData.dictionariesKey"
            :placeholder="t('view.pleaseEnterDictionaryName')"
            autocomplete="off"
          />
        </a-form-item>
        <a-form-item
          name="orderIndex"
          :label="t('view.dictionarySorting')"
          :rules="[
            { required: true, message: t('view.pleaseEnterDictionarySorting') },
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
            :precision="3"
            v-model:value="formData.orderIndex"
            :placeholder="t('view.pleaseEnterDictionarySorting')"
            autocomplete="off"
          />
        </a-form-item>
        <a-form-item :label="t('view.belongsToServiceType')" name="serviceType">
          <a-select
            :placeholder="t('view.allServicesWillBeAvailable')"
            allow-clear
            show-search
            :filter-option="AntVueCommon.filterOption"
            v-model:value="formData.serviceType"
            :options="serviceTypeData"
          />
        </a-form-item>
        <a-form-item
          name="other"
          :label="t('view.auxiliaryInformation')"
          :rules="[{ max: 250, message: t('view.attachedInformationTooLong') }]"
        >
          <a-textarea
            :placeholder="t('view.pleaseEnterAuxiliaryInformation')"
            :rows="3"
            v-model:value="formData.other"
            autocomplete="off"
          />
        </a-form-item>
        <a-form-item
          name="remark"
          :label="t('view.remarks')"
          :rules="[{ max: 250, message: t('view.remarksTooLong', [250]) }]"
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
  </MyContent>
</template>
<script setup lang="ts">
  import AntVueCommon from '@/utils/MyCommon/AntVueCommon';
  import formValidator from '@/utils/MyCommon/formValidator';
  import myCommon from '@/utils/MyCommon/common';
  import { ref, reactive, createVNode, nextTick, watch, onMounted } from 'vue';
  import { useDesign } from '@/hooks/web/useDesign';
  import dictionariesApi from '@/api/dictionaries';
  import { message, Modal } from 'ant-design-vue';
  import { ExclamationCircleOutlined } from '@ant-design/icons-vue';
  import { useI18n } from '@/hooks/web/useI18n';
  import { useLocaleStore } from '@/store/modules/locale';

  const { t } = useI18n();
  const localeStore = useLocaleStore();
  const locale = localeStore.getLocale;
  defineOptions({ name: 'DictionariesManage' });
  const { prefixCls } = useDesign('suitManage-');
  const loading = ref(true);
  const isRunLoading = ref(false);
  const tableConfigData = ref([]);
  const defFromData = reactive({
    dictionariesNameCn: null,
    dictionariesNameEn: null,
    dictionariesNameFr: null,
    dictionariesClass: null,
    orderIndex: null,
    parentId: 0,
    isKeyMaster: false,
    dictionariesKey: null,
    remark: null,
    other: null,
    serviceType: null,
  });
  const formData = ref(_.cloneDeep(defFromData));
  const formRef = ref({});
  const tableRef = ref({});
  const toolbarRef = ref({});
  const isShowForm = ref(false);
  const fromSpinning = ref(false);
  const dictionariesClass_disabled = ref(false);
  let saveType = 'add';
  const seacthContent = ref({
    dictionariesName: '',
    dictionariesClass: null,
    serviceType: null,
  });
  const syncMqttPerformance = ref(false);
  const serviceTypeData = ref([]);

  getDictionariess();
  getServerTypes();

  function showFrom(type, row, pid) {
    getServerTypes();
    saveType = type;
    if (type == 'add') {
      isShowForm.value = true;
      formData.value.parentId = pid == null ? 0 : pid;
      dictionariesClass_disabled.value = formData.value.parentId != 0;
      if (formData.value.parentId != 0) {
        formData.value.dictionariesClass = row.dictionariesClass;
        formData.value.isKeyMaster = row.isKeyMaster;
      }
    } else {
      dictionariesClass_disabled.value = true;
      //编辑
      getByid(row.dictionariesId);
    }
  }

  //删除字典信息
  function remove(row) {
    Modal.confirm({
      maskClosable: true,
      // title: '删除该项，子集数据也将被删除，是否删除?',
      title: t('view.areYouSureYouWantToDelete'),
      icon: createVNode(ExclamationCircleOutlined),
      content: '',
      onOk() {
        isRunLoading.value = true;
        dictionariesApi
          .DeleteDictionaries(row.dictionariesId)
          .then((data) => {
            isRunLoading.value = false;
            try {
              if (data) {
                tableConfigData.value = tableConfigData.value?.filter(
                  (m) => data.indexOf(m.dictionariesId) == -1,
                );
              }
              message.success(t('view.deletionSuccessful'));
            } catch (error) {}
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
    formData.value = _.cloneDeep(defFromData);
    isShowForm.value = false;
    formRef.value.clearValidate();
  }

  //获取字典
  function getByid(id) {
    isRunLoading.value = true;
    dictionariesApi
      .GetDictionaries(id.toString())
      .then((data) => {
        isRunLoading.value = false;
        if (data) {
          formData.value = data;
          saveType = 'edit';
          isShowForm.value = true;
        } else {
          message.error(t('view.failedToRetrieveDictionaryInformation'));
        }
      })
      .catch(() => {
        isRunLoading.value = false;
      });
  }

  //获取列表
  function getDictionariess() {
    loading.value = true;
    dictionariesApi
      .GetDictionariess({
        ...seacthContent.value,
        execompleteBefore: () => {
          loading.value = false;
        },
      })
      .then((data) => {
        tableConfigData.value = data;
      })
      .catch(() => {
        tableConfigData.value = [];
      });
  }

  //新增和编辑
  function saveFrom() {
    formRef.value.validate().then(() => {
      fromSpinning.value = true;
      formData.value.execompleteBefore = () => {
        fromSpinning.value = false;
      };
      if (saveType == 'add') {
        dictionariesApi.AddDictionaries(formData.value).then((data) => {
          data.serviceTypeName = serviceTypeData.value.find(
            (m) => m.key == data.serviceType,
          )?.label;
          tableConfigData.value.splice(0, 0, data);
          formClose();
          message.success(t('view.additionSuccessful'));
        });
      } else {
        dictionariesApi.UpdateDictionaries(formData.value).then((data) => {
          const oldData = tableConfigData.value.find(
            (m) => m.dictionariesId == data.dictionariesId,
          );
          if (oldData) {
            delete data.createtTime;
            delete data.createUser;
            myCommon.objectReplace(oldData, data);
            oldData.serviceTypeName = serviceTypeData.value.find(
              (m) => m.key == data.serviceType,
            )?.label;
          }
          formClose();
          message.success(t('view.updateSuccessful'));
        });
      }
    });
  }

  //同步性能数据
  function syncPerformance(dictionariesClass) {
    syncMqttPerformance.value = true;
    dictionariesApi
      .UpdateSync(dictionariesClass)
      .then((data) => {
        syncMqttPerformance.value = false;
        if (data) {
          message.success(t('view.synchronizationSuccessful'));
          tableRef.value.getTableData().fullData.forEach((item) => {
            if (item.dictionariesClass == dictionariesClass) {
              item.isSync = true;
            }
          });
        } else {
          message.successt(t('view.synchronizationFailed'));
        }
      })
      .catch(() => {
        syncMqttPerformance.value = false;
      });
  }

  //获取服务类型数据
  function getServerTypes() {
    dictionariesApi
      .GetDictionariesSimple({
        dictionariesclass: ['serviceType'],
      })
      .then((data) => {
        serviceTypeData.value = data;
      })
      .catch(() => {
        serviceTypeData.value = [];
      });
  }

  //重置搜索条件
  function resetSeacth() {
    seacthContent.value = {
      dictionariesName: null,
      dictionariesClass: null,
      serviceType: null,
    };
  }

  // watch(
  //   () => (formData.value.dictionariesClass, formData.value.isKeyMaster),
  //   () => {
  //     if (isShowForm.value) {
  //       message.info('字典类型、是否自定义键 新增后不可修改');
  //     }
  //   },
  //   { deep: true },
  // );

  onMounted(() => {
    // const elink = document.createElement('a');
    // elink.style.display = 'none';
    // elink.href = '/uploads/loginback.zip';
    // elink.rel = 'noopener noreferrer';
    // elink.download = 'loginback.zip';
    // document.body.appendChild(elink);
    // elink.click();
    // URL.revokeObjectURL(elink.href); // 释放URL 对象
    // document.body.removeChild(elink);

    const $table = tableRef.value;
    const $toolbar = toolbarRef.value;
    if ($table && $toolbar) {
      $table.connect($toolbar);
    }
  });
</script>
<style lang="less" scoped>
  @prefixCls: ~'@{namespace}-suitManage-';

  .@{prefixCls} {
    overflow-x: hidden;

    .@{prefixCls}tableBtn {
      width: 100%;
    }
  }
</style>
