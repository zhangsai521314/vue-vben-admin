<template>
  <MyContent>
    <vxe-grid
      v-bind="tableConfig"
      id="mytable"
      ref="tableRef"
      :loading="loading"
      :row-config="{ keyField: 'equipmentId' }"
      :column-config="{ resizable: true }"
      :custom-config="{ storage: true }"
    >
      <template #toolbar_buttons>
        <div :class="`tableBtn`">
          <a-space direction="horizontal" size="small" style="margin-left: 5px">
            <AuthDom auth="equipmentManage_query">
              <a-space direction="horizontal" size="small" :wrap="true" style="margin-bottom: 0">
                <div class="row-div">
                  <a-space direction="horizontal" size="small" :wrap="true">
                    <label>所属部门：</label>
                    <a-tree-select
                      v-model:value="seacthContent.orgId"
                      show-search
                      style="width: 170px"
                      :dropdown-style="{ maxHeight: '400px', overflow: 'auto' }"
                      placeholder="请选择所属部门"
                      allow-clear
                      show-arrow
                      :filterTreeNode="AntVueCommon.filterTreeNode"
                      :tree-data="organizationDatas"
                    />
                  </a-space>
                </div>
                <div class="row-div">
                  <a-space direction="horizontal" size="small" :wrap="true">
                    <label>设备名称：</label>
                    <a-input
                      @press-enter="getEquipments"
                      v-model:value="seacthContent.equipmentName"
                      placeholder="输入设备名称查询"
                    />
                  </a-space>
                </div>
                <div class="row-div">
                  <a-space direction="horizontal" size="small" :wrap="true">
                    <a-button @click="getEquipments" type="primary">查询</a-button>
                    <a-button @click="resetSeacth">重置表单</a-button>
                  </a-space>
                </div>
              </a-space>
            </AuthDom>
            <AuthDom auth="equipmentManage_add">
              <a-space direction="horizontal" size="small" :wrap="true" style="margin-bottom: 0">
                <div class="row-div">
                  <a-space direction="horizontal" size="small" :wrap="true">
                    <a-button class="ant-btn" @click="showFrom()">新增设备</a-button>
                  </a-space>
                </div>
              </a-space>
            </AuthDom>
          </a-space>
        </div>
      </template>
      <template #default="{ row }">
        <div :class="`tableOption`">
          <AuthDom auth="equipmentManage_table_edit">
            <IconFontClass
              name="icon-baseui-edit-fill"
              @click="showFrom(row)"
              style="color: #0a61bd"
              title="编辑"
            />
          </AuthDom>
          <AuthDom auth="equipmentManage_table_delete">
            <IconFontClass
              name="icon-baseui-guanbicuowu"
              @click="remove(row)"
              style="color: red"
              title="删除"
            />
          </AuthDom>
        </div>
      </template>
    </vxe-grid>
    <a-drawer
      :headerStyle="{ height: '49px', borderBottom: '2px solid #eee' }"
      :width="500"
      :visible="isShowForm"
      title="配置"
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
          :rules="[{ required: true, message: '请选择所属部门' }]"
          label="所属部门"
          name="orgId"
        >
          <a-tree-select
            v-model:value="formData.orgId"
            show-search
            style="width: 100%"
            :dropdown-style="{ maxHeight: '400px', overflow: 'auto' }"
            placeholder="请选择所属部门"
            allow-clear
            show-arrow
            :filterTreeNode="AntVueCommon.filterTreeNode"
            :tree-data="organizationDatas"
          />
        </a-form-item>
        <a-form-item
          name="equipmentName"
          label="设备名称"
          :rules="[
            { required: true, message: '' },
            { max: 40, message: '设备名称过长' },
            { validator: formValidator.empty, message: '请输入设备名称' },
          ]"
        >
          <a-input
            v-model:value="formData.equipmentName"
            placeholder="请输入设备名称"
            autocomplete="off"
          />
        </a-form-item>
        <a-form-item
          label="设备类型"
          name="equipmentType"
          :rules="[{ required: true, message: '请选择设备类型' }]"
        >
          <a-select
            placeholder="请选择设备类型"
            show-search
            :filter-option="AntVueCommon.filterOption"
            v-model:value="formData.equipmentType"
            :options="dictionariesData.filter((m) => m.dictionariesClass == 'equipmentType')"
          />
        </a-form-item>
        <a-form-item
          label="系统类型"
          name="systemType"
          :rules="[{ required: true, message: '请选择系统类型' }]"
        >
          <a-select
            show-search
            :filter-option="AntVueCommon.filterOption"
            placeholder="请选择系统类型"
            v-model:value="formData.systemType"
            :options="dictionariesData.filter((m) => m.dictionariesClass == 'systemType')"
          />
        </a-form-item>
        <a-form-item
          name="address"
          label="设备地址"
          :rules="[
            { required: true, message: '' },
            { max: 50, message: '设备地址过长' },
            { validator: formValidator.empty, message: '请输入设备地址' },
          ]"
        >
          <a-input
            v-model:value="formData.address"
            placeholder="请输入设备地址"
            autocomplete="off"
          />
        </a-form-item>
        <a-form-item
          name="orderIndex"
          label="设备排序"
          :rules="[{ required: true, message: '请输入设备排序' }]"
        >
          <a-input-number
            placeholder="请输入设备排序"
            style="width: 300px"
            :precision="3"
            :min="-99999"
            :max="99999"
            v-model:value="formData.orderIndex"
          />
        </a-form-item>
        <a-form-item
          name="remark"
          label="备注信息"
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
  import formValidator from '@/utils/MyCommon/formValidator';
  import AntVueCommon from '@/utils/MyCommon/AntVueCommon';
  import myCommon from '@/utils/MyCommon/common';
  import { ref, reactive, createVNode, nextTick, watch } from 'vue';
  import { useDesign } from '@/hooks/web/useDesign';
  import { VxeGrid, VxeGridProps } from 'vxe-table';
  import equipmentApi from '@/api/equipment';
  import { message, Modal } from 'ant-design-vue';
  import { ExclamationCircleOutlined } from '@ant-design/icons-vue';
  import dictionariesApi from '@/api/dictionaries';
  import organizationApi from '@/api/organization';

  defineOptions({ name: 'EquipmentManage' });
  const { prefixCls } = useDesign('equipment-');
  const loading = ref(true);
  const tableConfig = reactive<VxeGridProps>({
    height: 'auto',
    columns: [
      //基础
      { type: 'seq', title: '序号', width: 50, fixed: 'left' },
      {
        field: 'equipmentId',
        title: '记录ID',
        visible: false,
        showOverflow: true,
        showHeaderOverflow: true,
      },
      {
        field: 'orgName',
        title: '所属部门',
        showOverflow: true,
        showHeaderOverflow: true,
        sortable: true,
      },
      {
        field: 'equipmentName',
        title: '设备名称',
        showOverflow: true,
        showHeaderOverflow: true,
        sortable: true,
      },
      {
        field: 'equipmentType',
        title: '硬件类型',
        showOverflow: true,
        showHeaderOverflow: true,
        sortable: true,
      },
      {
        field: 'systemType',
        title: '系统类型',
        showOverflow: true,
        showHeaderOverflow: true,
        sortable: true,
      },
      {
        field: 'address',
        title: '地址',
        showOverflow: true,
        showHeaderOverflow: true,
        sortable: true,
      },
      {
        field: 'orderIndex',
        title: '排序',
        showOverflow: true,
        showHeaderOverflow: true,
        visible: false,
        sortable: true,
      },
      {
        field: 'remark',
        title: '备注信息',
        showOverflow: true,
        showHeaderOverflow: true,
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
        field: 'createUser',
        title: '创建人',
        width: 130,
        showOverflow: true,
        showHeaderOverflow: true,
        visible: false,
        sortable: true,
      },
      {
        field: 'modifyTime',
        title: '修改时间',
        width: 150,
        showOverflow: true,
        showHeaderOverflow: true,
        visible: false,
        sortable: true,
      },
      {
        field: 'modifyUser',
        title: '修改人',
        width: 130,
        showOverflow: true,
        showHeaderOverflow: true,
        visible: false,
        sortable: true,
      },
      {
        title: '操作',
        width: 140,
        slots: {
          default: 'default',
        },
        showOverflow: true,
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
  const defFromData = reactive({
    equipmentName: '',
    projectid: 1,
    equipmentType: null,
    systemType: null,
    address: '',
    remark: '',
    orderIndex: null,
    orgId: null,
  });
  const formData = ref(_.cloneDeep(defFromData));
  const formRef = ref(null);
  const tableRef = ref({});
  const isShowForm = ref(false);
  const fromSpinning = ref(false);
  let saveType = 'add';
  const dictionariesData = ref([]);
  const seacthContent = ref({
    orgId: null,
    equipmentName: '',
  });
  const organizationDatas = ref([]);
  let _organizationDatas = [];

  getOrganization();
  getEquipments();

  //重置搜索条件
  function resetSeacth() {
    seacthContent.value = {
      orgId: null,
      equipmentName: '',
    };
  }

  function showFrom(row) {
    getOrganization();
    getDictionaries();
    if (myCommon.isnull(row)) {
      saveType = 'add';
      isShowForm.value = true;
    } else {
      //编辑
      getByid(row.equipmentId);
    }
  }

  //删除设备信息
  function remove(row) {
    Modal.confirm({
      maskClosable: true,
      title: '是否删除?',
      icon: createVNode(ExclamationCircleOutlined),
      content: '',
      onOk() {
        loading.value = true;
        equipmentApi
          .DeleteEquipment(row.equipmentId)
          .then(() => {
            loading.value = false;
            tableConfig.data = tableConfig.data?.filter((m) => m.equipmentId != row.equipmentId);
            message.success('删除设备信息成功');
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
    isShowForm.value = false;
    formData.value = _.cloneDeep(defFromData);
    formRef.value.clearValidate();
  }

  //获取设备列表
  function getByid(id) {
    loading.value = true;
    equipmentApi
      .GetEquipment(id)
      .then((data) => {
        loading.value = false;
        if (data) {
          formData.value = data;
          saveType = 'edit';
          isShowForm.value = true;
        } else {
          message.error('获取设备信息失败');
        }
      })
      .catch(() => {
        loading.value = false;
      });
  }

  //获取设备列表
  function getEquipments() {
    loading.value = true;
    equipmentApi
      .GetEquipments({
        ...seacthContent.value,
        execompleteBefore: () => {
          loading.value = false;
        },
      })
      .then((data) => {
        tableConfig.data = data;
      })
      .catch(() => {
        tableConfig.data = [];
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
        equipmentApi.AddEquipment(formData.value).then((data) => {
          data.equipmentType = dictionariesData.value.find(
            (m) => m.key == data.equipmentType,
          )?.label;
          data.systemType = dictionariesData.value.find((m) => m.key == data.systemType)?.label;
          data.orgName = _organizationDatas.find((m) => m.key == data.orgId)?.label;
          tableConfig.data?.splice(0, 0, data);
          formClose();
          message.success('新增设备成功');
        });
      } else {
        equipmentApi.UpdateEquipment(formData.value).then((data) => {
          const oldData = tableRef.value.getRowById(data.equipmentId);
          delete formData.value.createUser;
          myCommon.objectReplace(oldData, formData.value);
          oldData.modifyTime = data.modifyTime;
          oldData.modifyUser = data.modifyUser;
          oldData.equipmentType = dictionariesData.value.find(
            (m) => m.key == data.equipmentType,
          )?.label;
          oldData.systemType = dictionariesData.value.find((m) => m.key == data.systemType)?.label;
          oldData.orgName = _organizationDatas.find((m) => m.key == data.orgId)?.label;
          formClose();
          message.success('更新设备信息成功');
        });
      }
    });
  }

  function getDictionaries() {
    dictionariesApi
      .GetDictionariesSimple({
        execompleteBefore: () => {
          loading.value = false;
        },
        dictionariesClass: ['equipmentType', 'systemType'],
      })
      .then((data) => {
        dictionariesData.value = data;
      })
      .catch(() => {
        dictionariesData.value = [];
      });
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
</script>
<style lang="less" scoped>
  @prefixCls: ~'@{namespace}-equipment-';

  .tableBtn {
    width: 100%;
  }
</style>
