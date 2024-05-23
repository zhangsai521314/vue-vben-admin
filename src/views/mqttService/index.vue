<template>
  <MyContent>
    <vxe-grid
      v-bind="tableConfig"
      id="mytable"
      ref="tableRef"
      :loading="loading"
      :row-config="{ keyField: 'mqttId' }"
      :column-config="{ resizable: true }"
      :custom-config="{ storage: true }"
    >
      <template #toolbar_buttons>
        <div :class="`tableBtn`">
          <a-space direction="horizontal" size="small" style="margin-left: 5px; line-height: 50px">
            <AuthDom auth="mqttService_query">
              <a-space direction="horizontal" size="small">
                <a-button @click="getMqtts" type="primary">查询</a-button>
              </a-space>
            </AuthDom>
            <AuthDom auth="mqttService_add">
              <a-button class="ant-btn" @click="showFrom()">新增通信类型</a-button>
            </AuthDom>
          </a-space>
        </div>
      </template>
      <template #default="{ row }">
        <div :class="`tableOption`">
          <AuthDom auth="mqttService_table_version">
            <IconFontClass
              name="icon-baseui-edit-fill"
              @click="showFrom(row)"
              style="color: #0a61bd"
              title="编辑"
            />
          </AuthDom>
          <AuthDom auth="mqttService_table_delete">
            <IconFontClass
              name="icon-baseui-guanbicuowu"
              @click="remove(row)"
              style="color: red"
              title="删除"
            />
          </AuthDom>
        </div>
      </template>
      <template #ipport="{ row }">
        {{ row.mqttIp }}{{ row.mqttPort ? ':' + row.mqttPort : '' }}
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
        <a-form-item label="服务类型" name="serviceType">
          <a-select
            :disabled="saveType != 'add'"
            show-search
            :filter-option="AntVueCommon.filterOption"
            placeholder="请选择服务类型"
            :rules="[{ required: true, message: '请选择软件类型' }]"
            v-model:value="formData.serviceType"
            :options="dictionariesData.filter((m) => m.dictionariesClass == 'serviceType')"
          />
        </a-form-item>
        <a-space>
          <a-form-item
            :labelCol="{ span: 8, offset: 2 }"
            label="通信地址"
            name="mqttIp"
            :rules="[{ required: true, message: '请输入通信地址Ip' }]"
          >
            <a-input placeholder="IP" v-model:value="formData.mqttIp" style="margin-left: 2px" />
          </a-form-item>
          <a-form-item
            label=""
            name="mqttPort"
            :rules="[{ required: true, message: '请输入通信地址端口' }]"
          >
            <a-input placeholder="端口号" v-model:value="formData.mqttPort" style="width: 134px" />
          </a-form-item>
        </a-space>
        <a-form-item
          label="MQTT用户名"
          name="mqttName"
          :rules="[{ required: true, message: '请输入MQTT用户名' }]"
        >
          <a-input
            placeholder="请输入MQTT用户名"
            v-model:value="formData.mqttName"
            autocomplete="off"
          />
        </a-form-item>
        <a-form-item
          label="MQTT密码"
          name="mqttName"
          :rules="[{ required: true, message: '请输入MQTT密码' }]"
        >
          <a-input
            placeholder="请输入MQTT密码"
            v-model:value="formData.mqttPwd"
            autocomplete="off"
          />
        </a-form-item>
        <a-form-item
          name="orderIndex"
          label="排序"
          :rules="[{ required: true, message: '请输入排序' }]"
        >
          <a-input-number
            placeholder="请输入排序"
            style="width: 300px"
            :precision="3"
            v-model:value="formData.orderIndex"
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
<script setup lang="tsx">
  import AntVueCommon from '@/utils/MyCommon/AntVueCommon';
  import { ref, reactive, createVNode } from 'vue';
  import { VxeGrid, VxeGridProps } from 'vxe-table';
  import mqttApi from '@/api/mqttService';
  import { message, Modal } from 'ant-design-vue';
  import { ExclamationCircleOutlined } from '@ant-design/icons-vue';
  import { useDesign } from '@/hooks/web/useDesign';

  defineOptions({ name: 'MqttService' });
  const { prefixCls } = useDesign('mqttService-');
  const loading = ref(true);
  const tableConfig = reactive<VxeGridProps>({
    height: 'auto',
    columns: [
      //基础
      { type: 'seq', title: '序号', width: 50, fixed: 'left' },
      {
        field: 'mqttId',
        title: '通信ID',
        visible: false,
        showOverflow: true,
        showHeaderOverflow: true,
      },
      {
        field: 'serviceName',
        title: '服务类型名称',
        showOverflow: true,
        showHeaderOverflow: true,
        sortable: true,
      },
      {
        field: 'mqttIp',
        title: 'MQTT地址',
        showOverflow: true,
        showHeaderOverflow: true,
        sortable: true,
        slots: {
          default: 'ipport',
        },
      },
      {
        field: 'mqttName',
        title: 'MQTT用户名',
        showOverflow: true,
        showHeaderOverflow: true,
        sortable: true,
      },
      {
        field: 'mqttPwd',
        title: 'MQTT密码',
        showOverflow: true,
        showHeaderOverflow: true,
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
        field: 'createTime',
        title: '创建时间',
        width: 150,
        showOverflow: true,
        showHeaderOverflow: true,
        sortable: true,
      },
      {
        field: 'createUser',
        title: '创建人',
        width: 130,
        showOverflow: true,
        showHeaderOverflow: true,
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
    serviceType: null,
    mqttIp: null,
    mqttPort: null,
    mqttName: null,
    mqttPwd: null,
    orderIndex: null,
  });
  const formData = ref(_.cloneDeep(defFromData));
  const formRef = ref(null);
  const tableRef = ref({});
  const isShowForm = ref(false);
  const fromSpinning = ref(false);
  let saveType = 'add';
  const isShowVis = ref(false);
  const dictionariesData = ref([]);
  const versionId = ref('');

  getMqtts();

  function showFrom(row) {
    if (myCommon.isnull(row)) {
      getServerTypes();
      formData.value = _.cloneDeep(defFromData);
      saveType = 'add';
      isShowForm.value = true;
    } else {
      getServerTypes(row.dictionariesId);
      //编辑
      getByid(row.mqttId);
    }
  }

  //删除软件包信息
  function remove(row) {
    Modal.confirm({
      maskClosable: true,
      title: '是否删除?',
      icon: createVNode(ExclamationCircleOutlined),
      content: '',
      onOk() {
        loading.value = true;
        mqttApi
          .DeleteMqtt(row.versionId)
          .then(() => {
            loading.value = false;
            tableRef.value.remove(row);
            message.success('删除软件版本包成功');
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
    formRef.value.clearValidate();
  }

  //获取软件包列表
  function getMqtts() {
    loading.value = true;
    mqttApi
      .GetMqtts({
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
        mqttApi.AddMqtt(formData.value).then((data) => {
          data.serviceName = dictionariesData.value.find((m) => m.key == data.serviceType).label;
          tableRef.value.insert(data);
          formClose();
          message.success('新增软件包类型成功');
        });
      } else {
        mqttApi.UpdateMqtt(formData.value).then((data) => {
          const oldData = tableRef.value.getRowById(data.mqttId);
          myCommon.objectReplace(oldData, data);
          delete formData.value.createUser;
          oldData.modifyTime = data.modifyTime;
          oldData.modifyUser = data.modifyUser;
          oldData.serviceName = dictionariesData.value.find(
            (m) => m.key == data.serviceType,
          )?.label;
          formClose();
          message.success('更新软件信息成功');
        });
      }
    });
  }

  //获取字典
  function getServerTypes(dictionariesId = null) {
    mqttApi
      .GetServerTypes(dictionariesId)
      .then((data) => {
        dictionariesData.value = data;
      })
      .catch(() => {
        dictionariesData.value = [];
      });
  }

  function getByid(id) {
    loading.value = true;
    mqttApi
      .GetMqtt(id)
      .then((data) => {
        loading.value = false;
        if (data) {
          formData.value = data;
          saveType = 'edit';
          isShowForm.value = true;
        } else {
          message.error('获取通信信息失败');
        }
      })
      .catch(() => {
        loading.value = false;
      });
  }
</script>
<style lang="less" scoped>
  @prefixCls: ~'@{namespace}-mqttService-';

  .tableBtn {
    width: 100%;
  }
</style>
