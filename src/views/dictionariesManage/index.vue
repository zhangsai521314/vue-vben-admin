<template>
  <MyContent :class="prefixCls">
    <a-spin :spinning="loading">
      <div style="width: 100%; height: 100%">
        <!-- :refresh="{ queryMethod: getDictionariess }" -->
        <vxe-toolbar ref="toolbarRef" custom>
          <template #buttons>
            <div :class="`tableBtn`">
              <a-space direction="horizontal" size="small" style="margin-left: 5px">
                <AuthDom auth="dictionariesManage_query">
                  <a-space
                    direction="horizontal"
                    size="small"
                    :wrap="true"
                    style="margin-bottom: 0"
                  >
                    <div class="row-div">
                      <a-space direction="horizontal" size="small" :wrap="true">
                        <label>字典名称：</label>
                        <a-input
                          @press-enter="getDictionariess"
                          v-model:value="seacthContent.dictionariesName"
                          placeholder="输入字典名称查询"
                        />
                      </a-space>
                    </div>
                    <div class="row-div">
                      <a-space direction="horizontal" size="small" :wrap="true">
                        <label>字典类型：</label>
                        <a-select
                          placeholder="请选择字典类型"
                          style="width: 170px"
                          allow-clear
                          show-search
                          :filter-option="AntVueCommon.filterOption"
                          v-model:value="seacthContent.dictionariesClass"
                        >
                          <a-select-option value="equipmentType">硬件设备</a-select-option>
                          <a-select-option value="systemType">操作系统</a-select-option>
                          <a-select-option value="serviceType">软件服务</a-select-option>
                          <a-select-option value="msgType">信息提示</a-select-option>
                          <a-select-option value="commonConfig">通用配置</a-select-option>
                          <a-select-option value="performanceAlarmType"
                            >设备性能告警阈值</a-select-option
                          >
                          <a-select-option value="collectionFrequency">数据频率</a-select-option>
                        </a-select>
                      </a-space>
                    </div>
                    <div class="row-div">
                      <a-space direction="horizontal" size="small" :wrap="true">
                        <label>归属服务类型：</label>
                        <a-select
                          style="width: 170px"
                          allow-clear
                          show-search
                          :filter-option="AntVueCommon.filterOption"
                          placeholder="请选择服务类型"
                          v-model:value="seacthContent.serviceType"
                          :options="serviceTypeData"
                        />
                      </a-space>
                    </div>
                    <div class="row-div">
                      <a-space direction="horizontal" size="small" :wrap="true">
                        <a-button @click="getDictionariess" type="primary">查询</a-button>
                        <a-button @click="resetSeacth">重置表单</a-button>
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
                        <a-button class="ant-btn" @click="showFrom('add', null, 0)"
                          >新增字典</a-button
                        >
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
                          <a-button class="ant-btn" @click="syncPerformance('collectionFrequency')"
                            >同步设备性能上报频率</a-button
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
        <div style="width: 100%; height: calc(100% - 62px)">
          <vxe-table
            :border="true"
            max-height="100%"
            ref="tableRef"
            show-overflow
            :row-config="{ isHover: true, useKey: true, keyField: 'dictionariesId' }"
            :column-config="{ resizable: true }"
            :tree-config="{ transform: true, rowField: 'dictionariesId', parentField: 'parentId' }"
            :data="tableConfigData"
          >
            <vxe-column type="seq" title="序号" width="60" />
            <vxe-column field="dictionariesId" title="记录ID" :visible="false" />
            <vxe-column field="dictionariesName" title="字典名称" tree-node :sortable="true" />
            <vxe-column field="dictionariesClass" title="字典类型" :sortable="true">
              <template #default="{ row }">
                <span>{{
                  row.dictionariesClass == 'equipmentType'
                    ? '硬件设备'
                    : row.dictionariesClass == 'systemType'
                      ? '操作系统'
                      : row.dictionariesClass == 'serviceType'
                        ? '软件服务'
                        : row.dictionariesClass == 'msgType'
                          ? '信息提示'
                          : row.dictionariesClass == 'performanceAlarmType'
                            ? '设备性能告警阈值'
                            : row.dictionariesClass == 'collectionFrequency'
                              ? '数据频率'
                              : row.dictionariesClass == 'commonConfig'
                                ? '通用配置'
                                : ''
                }}</span>
              </template>
            </vxe-column>
            <vxe-column field="serviceTypeName" title="归属服务类型" :sortable="true" />
            <vxe-column field="isKeyMaster" title="是否自定义主键">
              <template #default="{ row }">
                <span :style="{ color: row.isKeyMaster ? 'green' : 'red' }">{{
                  row.isKeyMaster ? '是' : '否'
                }}</span>
              </template>
            </vxe-column>
            <vxe-column field="dictionariesKey" title="自定义主键值" :sortable="true" />
            <vxe-column field="isSystem" title="是否系统">
              <template #default="{ row }">
                <span :style="{ color: row.isSystem ? 'green' : 'red' }">{{
                  row.isSystem ? '是' : '否'
                }}</span>
              </template>
            </vxe-column>
            <vxe-column field="isSync" title="是否已同步">
              <template #default="{ row }">
                <span
                  v-if="row.dictionariesClass == 'collectionFrequency'"
                  :style="{ color: row.isSync ? 'green' : 'red' }"
                  >{{ row.isSync ? '是' : '否' }}</span
                >
                <span v-else style="color: green">无需同步</span>
              </template>
            </vxe-column>
            <vxe-column field="syncTime" title="同步时间" :visible="false" :sortable="true" />
            <vxe-column field="orderIndex" title="排序" :visible="false" :sortable="true" />
            <vxe-column field="other" title="附属信息" :showOverflow="true" :sortable="true" />
            <vxe-column field="remark" title="备注信息" :showOverflow="true" :sortable="true" />
            <vxe-column field="createTime" title="创建时间" :visible="false" :sortable="true" />
            <vxe-column field="createUser" title="创建人" :visible="false" :sortable="true" />
            <vxe-column field="modifyTime" title="修改时间" :visible="false" :sortable="true" />
            <vxe-column field="modifyUser" title="修改人" :visible="false" :sortable="true" />
            <vxe-column title="操作" width="140">
              <template #default="{ row }">
                <div :class="`tableStyle`">
                  <template v-if="!row.isSystem">
                    <!-- <AuthDom auth="dictionariesManage_table_add">
                      <IconFontClass
                        name="icon-baseui-tianjiawukuang"
                        @click="showFrom('add', row, row.dictionariesId)"
                        style="color: #0a61bd"
                        title="增加子级"
                      />
                    </AuthDom> -->
                    <AuthDom auth="dictionariesManage_table_edit">
                      <IconFontClass
                        name="icon-baseui-edit-fill"
                        @click="showFrom('edit', row, row.parentId)"
                        style="color: #0a61bd"
                        title="编辑"
                      />
                    </AuthDom>
                    <AuthDom auth="dictionariesManage_table_delete">
                      <IconFontClass
                        name="icon-baseui-guanbicuowu"
                        @click="remove(row)"
                        style="color: red"
                        title="删除"
                      />
                    </AuthDom>
                  </template>
                  <span v-else style="color: red">系统字典不可修改</span>
                </div>
              </template>
            </vxe-column>
          </vxe-table>
        </div>
      </div>
    </a-spin>
    <a-drawer
      :headerStyle="{ height: '49px', borderBottom: '2px solid #eee' }"
      :width="500"
      :visible="isShowForm"
      title="字典"
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
          name="dictionariesName"
          label="字典名称"
          :labelCol="{ span: 7 }"
          :rules="[
            { required: true, message: '' },
            { max: 40, message: '字典名称过长' },
            { validator: formValidator.empty, message: '请输入字典名称' },
          ]"
        >
          <a-input
            v-model:value="formData.dictionariesName"
            placeholder="请输入字典名称"
            autocomplete="off"
          />
        </a-form-item>
        <a-form-item
          name="dictionariesClass"
          label="字典类型"
          :labelCol="{ span: 7 }"
          :rules="[{ required: true, message: '请选择字典类型' }]"
        >
          <a-select
            placeholder="请选择字典类型"
            :rules="[{ required: true, message: '请选择字典类型' }]"
            v-model:value="formData.dictionariesClass"
            :disabled="dictionariesClass_disabled"
            :title="dictionariesClass_disabled ? '跟随父级，不可修改' : ''"
          >
            <a-select-option value="equipmentType">硬件设备</a-select-option>
            <a-select-option value="systemType">操作系统</a-select-option>
            <a-select-option value="serviceType">软件服务</a-select-option>
            <a-select-option value="msgType">信息提示</a-select-option>
            <a-select-option value="performanceType">性能数据性能</a-select-option>
            <a-select-option value="commonConfig">通用配置</a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item
          name="isKeyMaster"
          label="是否自定义主键"
          :labelCol="{ span: 7 }"
          :rules="[{ required: true, message: '请选择是否自定义主键' }]"
        >
          <a-switch
            :title="dictionariesClass_disabled ? '跟随父级，不可修改' : ''"
            :disabled="dictionariesClass_disabled"
            v-model:checked="formData.isKeyMaster"
          />
        </a-form-item>
        <a-form-item
          v-if="formData.isKeyMaster"
          name="dictionariesKey"
          label="自定义主键值"
          :labelCol="{ span: 7 }"
          :rules="[
            { required: true, message: '' },
            { max: 50, message: '自定义主键值过长' },
            { validator: formValidator.empty, message: '请输入自定义主键值' },
          ]"
        >
          <a-input
            v-model:value="formData.dictionariesKey"
            placeholder="请输入字典名称"
            autocomplete="off"
          />
        </a-form-item>
        <a-form-item
          name="orderIndex"
          label="字典排序"
          :labelCol="{ span: 7 }"
          :rules="[{ required: true, message: '请输入字典排序' }]"
        >
          <a-input-number
            style="width: 300px"
            :precision="3"
            v-model:value="formData.orderIndex"
            placeholder="请输入字典排序"
            autocomplete="off"
            :min="-99999"
            :max="99999"
          />
        </a-form-item>
        <a-form-item label="归属服务类型" name="serviceType" :labelCol="{ span: 7 }">
          <a-select
            placeholder="为空则全部服务都可用"
            allow-clear
            show-search
            :filter-option="AntVueCommon.filterOption"
            v-model:value="formData.serviceType"
            :options="serviceTypeData"
          />
        </a-form-item>
        <a-form-item
          name="other"
          label="附属信息"
          :labelCol="{ span: 7 }"
          :rules="[{ max: 250, message: '附属息过长' }]"
        >
          <a-textarea
            placeholder="请输入附属信息"
            :rows="3"
            v-model:value="formData.other"
            autocomplete="off"
          />
        </a-form-item>
        <a-form-item
          name="remark"
          label="备注信息"
          :labelCol="{ span: 7 }"
          :rules="[{ max: 250, message: '备注信息过长' }]"
        >
          <a-textarea
            placeholder="请输入备注信息"
            :rows="3"
            v-model:value="formData.remark"
            autocomplete="off"
          />
        </a-form-item>
      </a-form>
      <template #footer>
        <a-spin :spinning="fromSpinning">
          <a-button type="primary" @click="saveFrom">保存</a-button>
          <a-button style="margin-left: 8px" @click="formClose">关闭</a-button>
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
  import { useMqttStoreWithOut } from '@/store/modules/mqtt';
  import softwareApi from '@/api/software';

  defineOptions({ name: 'DictionariesManage' });
  const mqttStore = useMqttStoreWithOut();
  const { prefixCls } = useDesign('suitManage-');
  const loading = ref(true);
  const tableConfigData = ref([]);
  const defFromData = reactive({
    dictionariesName: '',
    dictionariesClass: null,
    orderIndex: null,
    parentId: 0,
    isKeyMaster: false,
    dictionariesKey: '',
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
      title: '删除该项，子集数据也将被删除，是否删除?',
      icon: createVNode(ExclamationCircleOutlined),
      content: '',
      onOk() {
        loading.value = true;
        dictionariesApi
          .DeleteDictionaries(row.dictionariesId)
          .then((data) => {
            loading.value = false;
            try {
              if (data) {
                tableConfigData.value = tableConfigData.value?.filter(
                  (m) => data.indexOf(m.dictionariesId) == -1,
                );
              }
              message.success('删除字典信息成功');
            } catch (error) {}
          })
          .catch(() => {
            loading.value = false;
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
    loading.value = true;
    dictionariesApi
      .GetDictionaries(id.toString())
      .then((data) => {
        loading.value = false;
        if (data) {
          formData.value = data;
          saveType = 'edit';
          isShowForm.value = true;
        } else {
          message.error('获取字典信息失败');
        }
      })
      .catch(() => {
        loading.value = false;
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
          message.success('新增字典成功');
        });
      } else {
        dictionariesApi.UpdateDictionaries(formData.value).then((data) => {
          delete data.createtTime;
          delete data.createUser;
          const oldData = tableRef.value.getRowById(data.dictionariesId);
          myCommon.objectReplace(oldData, data);
          oldData.serviceTypeName = serviceTypeData.value.find(
            (m) => m.key == data.serviceType,
          )?.label;
          formClose();
          message.success('更新字典信息成功');
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
          message.success('同步成功');
          tableRef.value.getTableData().fullData.forEach((item) => {
            if (item.dictionariesClass == dictionariesClass) {
              item.isSync = true;
            }
          });
        } else {
          message.success('同步失败');
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
        debugger;
        serviceTypeData.value = data;
      })
      .catch(() => {
        debugger;
        serviceTypeData.value = [];
      });
  }

  //重置搜索条件
  function resetSeacth() {
    seacthContent.value = {
      dictionariesName: '',
      dictionariesClass: null,
      serviceType: null,
    };
  }
  watch(
    () => (formData.value.dictionariesClass, formData.value.isKeyMaster),
    () => {
      if (isShowForm.value) {
        message.info('字典类型、自定义键值 新增后不可修改');
      }
    },
    { deep: true },
  );

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
    .@{prefixCls}tableBtn {
      width: 100%;
    }
  }
</style>
