<template>
  <MyContent>
    <vxe-grid
      v-bind="tableConfig"
      id="mytable"
      ref="tableRef"
      :loading="loading"
      :column-config="{ resizable: true }"
      :custom-config="{ storage: true }"
    >
      <template #toolbar_buttons>
        <div :class="`tableBtn`">
          <a-space direction="horizontal" size="small" style="margin-left: 5px">
            <AuthDom auth="versionsManage_query">
              <a-space direction="horizontal" size="small" :wrap="true" style="margin-bottom: 0">
                <div class="row-div">
                  <a-space direction="horizontal" size="small" :wrap="true">
                    <a-button @click="getVersions" type="primary">查询</a-button>
                  </a-space>
                </div>
              </a-space>
            </AuthDom>
            <AuthDom auth="versionsManage_add">
              <a-space direction="horizontal" size="small" :wrap="true" style="margin-bottom: 0">
                <div class="row-div">
                  <a-space direction="horizontal" size="small" :wrap="true">
                    <a-button class="ant-btn" @click="showFrom()">新增软件包类型</a-button>
                  </a-space>
                </div>
              </a-space>
            </AuthDom>
          </a-space>
        </div>
      </template>
      <template #default="{ row }">
        <div :class="`tableOption`">
          <AuthDom auth="versionsManage_table_version">
            <IconFontClass
              name="icon-baseui-jichushezhi"
              @click="showHis(row)"
              style="color: #0a61bd"
              title="版本管理"
            />
          </AuthDom>
          <AuthDom auth="versionsManage_table_delete">
            <IconFontClass
              name="icon-baseui-guanbicuowu"
              @click="remove(row)"
              style="color: red"
              title="删除"
            />
          </AuthDom>
        </div>
      </template>
      <template #isSync="{ row }">
        <a-space v-if="row.isSync != null">
          <span :style="{ color: row.isSync ? 'green' : 'red' }">{{
            row.isSync ? '是' : '否'
          }}</span>
          <AuthDom auth="versionsManage_table_sync">
            <a-spin v-if="row.isRunSync != undefined" :spinning="row.isRunSync">
              <a-button title="更改为此版本" type="primary" size="small" @click="syncChange(row)"
                >开始同步</a-button
              >
            </a-spin>
            <a-button
              title="更改为此版本"
              v-else
              type="primary"
              size="small"
              @click="syncChange(row)"
              >开始同步</a-button
            >
          </AuthDom>
        </a-space>
      </template>
      <template #runNumber="{ row }">
        <a
          v-if="row.runNumber !== null"
          :href="row.filePath"
          :download="row.filePath.split('/')[row.filePath.split('/').length - 1]"
          >{{ row.runNumber }}</a
        >
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
          label="服务类型"
          name="serviceType"
          :rules="[{ required: true, message: '请选择软件类型' }]"
        >
          <a-select
            show-search
            :filter-option="AntVueCommon.filterOption"
            placeholder="请选择服务类型"
            v-model:value="formData.serviceType"
            :options="dictionariesData_add"
          />
        </a-form-item>
        <a-form-item
          name="orderIndex"
          label="软件包排序"
          :rules="[
            { required: true, message: '请输入软件包排序' },
            { validator: formValidator.min, min: -9999, message: '排序值-9999至9999' },
            { validator: formValidator.max, max: 9999, message: '排序值-9999至9999' },
          ]"
        >
          <a-input-number
            placeholder="请输入软件包排序"
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
    <a-drawer
      :headerStyle="{ height: '49px', borderBottom: '2px solid #eee' }"
      :width="1000"
      :visible="isShowVis"
      title="版本管理"
      :footer-style="{ textAlign: 'right' }"
      @close="formCloseHis"
    >
      <his :versionId="versionId" />
    </a-drawer>
  </MyContent>
</template>
<script setup lang="ts">
  import AntVueCommon from '@/utils/MyCommon/AntVueCommon';
  import { ref, reactive, createVNode } from 'vue';
  import { VxeGrid, VxeGridProps } from 'vxe-table';
  import versionsApi from '@/api/versions';
  import { message, Modal } from 'ant-design-vue';
  import { ExclamationCircleOutlined } from '@ant-design/icons-vue';
  import his from './his.vue';
  import { useDesign } from '@/hooks/web/useDesign';

  defineOptions({ name: 'VersionsManage' });
  const { prefixCls } = useDesign('versionsManage-');
  const loading = ref(true);
  const tableConfig = reactive<VxeGridProps>({
    height: 'auto',
    columns: [
      //基础
      { type: 'seq', title: '序号', width: 50, fixed: 'left' },
      {
        field: 'versionId',
        title: '记录ID',
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
        field: 'runNumber',
        title: '当前运行版本号',
        showOverflow: true,
        showHeaderOverflow: true,
        sortable: true,
        slots: {
          default: 'runNumber',
        },
      },
      {
        field: 'isForce',
        title: '是否强制升级',
        width: 140,
        showOverflow: true,
        showHeaderOverflow: true,
        // sortable: true,
        cellRender: { name: 'render_isno' },
      },
      {
        field: 'isSync',
        title: '是否已同步',
        width: 160,
        showOverflow: true,
        showHeaderOverflow: true,
        // sortable: true,
        slots: {
          default: 'isSync',
        },
      },
      {
        field: 'syncTime',
        title: '同步时间',
        width: 150,
        showOverflow: true,
        sortable: true,
        showHeaderOverflow: true,
      },
      {
        field: 'syncUserName',
        title: '同步人员',
        width: 130,
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
    orderIndex: null,
  });
  const formData = ref(_.cloneDeep(defFromData));
  const formRef = ref(null);
  const tableRef = ref({});
  const isShowForm = ref(false);
  const fromSpinning = ref(false);
  let saveType = 'add';
  const isShowVis = ref(false);
  const dictionariesData_add = ref([]);
  const versionId = ref('');

  getVersions();

  function showHis(row) {
    versionId.value = row.versionId;
    isShowVis.value = true;
  }

  function showFrom() {
    getServerTypes();
    saveType = 'add';
    isShowForm.value = true;
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
        versionsApi
          .DeleteVersions(row.versionId)
          .then(() => {
            loading.value = false;
            tableConfig.data = tableConfig.data?.filter((m) => m.versionId != row.versionId);
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
    formData.value = _.cloneDeep(defFromData);
    formRef.value.clearValidate();
  }

  //关闭his
  function formCloseHis() {
    isShowVis.value = false;
    tableConfig.data = [];
    getVersions();
  }

  //获取软件包列表
  function getVersions() {
    loading.value = true;
    versionsApi
      .GetVersions({
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
        versionsApi.AddVersions(formData.value).then((data) => {
          data.serviceName = dictionariesData_add.value.find(
            (m) => m.key == data.serviceType,
          ).label;
          tableConfig.data?.splice(0, 0, data);
          formClose();
          message.success('新增软件包类型成功');
        });
      }
    });
  }

  //获取字典
  function getServerTypes() {
    versionsApi
      .GetServerTypes()
      .then((data) => {
        dictionariesData_add.value = data;
      })
      .catch(() => {
        dictionariesData_add.value = [];
      });
  }

  //同步
  function syncChange(row) {
    row.isRunSync = true;
    versionsApi
      .UpdateRunVersions(row.versionId.toString())
      .then(() => {
        row.isRunSync = false;
        message.success('更新运行版本成功');
      })
      .catch(() => {
        row.isRunSync = false;
      });
  }
</script>
<style lang="less" scoped>
  @prefixCls: ~'@{namespace}-versionsManage-';

  .tableBtn {
    width: 100%;
  }
</style>
