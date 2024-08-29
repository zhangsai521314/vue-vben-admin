<template>
  <div style="height: 100%">
    <vxe-grid
      v-bind="tableConfig"
      id="mytable"
      ref="tableRef"
      :loading="loading"
      :row-config="{ keyField: 'hisId' }"
      :column-config="{ resizable: true }"
      :custom-config="{ storage: true }"
    >
      <template #toolbar_buttons>
        <div :class="`tableBtn`">
          <a-space direction="horizontal" size="small" style="margin-left: 5px">
            <AuthDom auth="versionsManage_his_query">
              <a-space direction="horizontal" size="small" :wrap="true" style="margin-bottom: 0">
                <div class="row-div">
                  <a-space direction="horizontal" size="small" :wrap="true">
                    <a-button @click="getVersionsHis" type="primary">查询</a-button>
                  </a-space>
                </div>
              </a-space>
            </AuthDom>
            <AuthDom auth="versionsManage_his_add">
              <a-space direction="horizontal" size="small" :wrap="true" style="margin-bottom: 0">
                <div class="row-div">
                  <a-space direction="horizontal" size="small" :wrap="true">
                    <a-button class="ant-btn" @click="showFrom()">新增版本</a-button>
                  </a-space>
                </div>
              </a-space>
            </AuthDom>
          </a-space>
        </div>
      </template>
      <template #isSync="{ row }">
        <a-space v-if="row.isSync != null">
          <span :style="{ color: row.isSync ? 'green' : 'red' }">{{
            row.isSync ? '是' : '否'
          }}</span>
          <AuthDom auth="versionsManage_his_table_sync">
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
      <template #vNumber="{ row }">
        <a
          v-if="row.vNumber !== null"
          :href="row.filePath"
          :download="row.filePath.split('/')[row.filePath.split('/').length - 1]"
          >{{ row.vNumber }}</a
        >
      </template>
    </vxe-grid>
    <a-drawer
      :headerStyle="{ height: '49px', borderBottom: '2px solid #eee' }"
      :width="600"
      :visible="isShowForm"
      title="上传版本文件"
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
          label="版本号"
          name="vNumber"
          :rules="[
            { required: true, message: '' },
            { validator: formValidator.empty, message: '请输入版本号' },
            { max: 20, message: '版本号过长' },
          ]"
        >
          <a-input placeholder="请输入版本号" v-model:value="formData.vNumber" autocomplete="off" />
        </a-form-item>
        <a-form-item
          name="isRun"
          label="是否运行版本"
          :rules="[{ required: true, message: '请选择是否运行版本' }]"
        >
          <a-switch v-model:checked="formData.isRun" />
        </a-form-item>
        <a-form-item
          name="isForce"
          label="是否强制升级"
          :rules="[{ required: true, message: '请选择是否强制升级' }]"
        >
          <a-switch v-model:checked="formData.isForce" />
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
        <a-upload-dragger
          :fileList="fileList"
          :maxCount="1"
          name="file"
          :multiple="false"
          accept=".zip,.rar"
          :before-upload="beforeUpload"
          @reject="fileReject"
        >
          <IconFontClass
            name="icon-baseui-shangchuan"
            :style="{ color: '#00b8ff', fontSize: '50px' }"
          />
          <p class="ant-upload-text" :style="{ color: 'black', fontSize: '20px' }"
            >点击上传，或将软件包拖拽到此处</p
          >
          <p class="ant-upload-hint"> </p>
        </a-upload-dragger>
      </a-form>
      <template #footer>
        <a-spin :spinning="fromSpinning">
          <a-button type="primary" @click="saveFrom()">保存</a-button>
          <a-button style="margin-left: 8px" @click="formClose">关闭</a-button>
        </a-spin>
      </template>
    </a-drawer>
  </div>
</template>
<script setup lang="ts">
  import formValidator from '@/utils/MyCommon/formValidator';
  import { useUserStore } from '@/store/modules/user';
  import { ref, reactive, createVNode, nextTick, watch } from 'vue';
  import { useDesign } from '@/hooks/web/useDesign';
  import { VxeGrid, VxeGridProps } from 'vxe-table';
  import versionsApi from '@/api/versions';
  import { message, Modal } from 'ant-design-vue';
  import { ExclamationCircleOutlined } from '@ant-design/icons-vue';
  import { getAppEnvConfig } from '@/utils/env';

  //vue3使用defineProps接收传过来的参数
  const props = defineProps({
    //增加组件
    versionId: {
      type: String,
      default() {
        return null;
      },
    },
  });
  const userStore = useUserStore();
  const token = 'Bearer ' + userStore.getToken;
  const { VITE_GLOB_API_URL, VITE_GLOB_API_URL_PREFIX } = getAppEnvConfig();
  const upUrl = `${VITE_GLOB_API_URL}${VITE_GLOB_API_URL_PREFIX}/User/UpdateUserAvatar`;
  const { prefixCls } = useDesign('versionsManage-his');
  const loading = ref(true);
  const tableConfig = reactive<VxeGridProps>({
    height: 'auto',
    columns: [
      //基础
      { type: 'seq', title: '序号', width: 50 },
      {
        field: 'hisId',
        title: '记录ID',
        visible: false,
        showOverflow: true,
        showHeaderOverflow: true,
        fixed: 'left',
      },
      {
        field: 'vNumber',
        title: '版本号',
        width: 100,
        showOverflow: true,
        showHeaderOverflow: true,
        slots: {
          default: 'vNumber',
        },
      },
      {
        field: 'isRun',
        title: '是否运行版本',
        width: 120,
        showOverflow: true,
        showHeaderOverflow: true,
        cellRender: { name: 'render_isno' },
      },
      {
        field: 'isForce',
        title: '是否强制升级',
        width: 120,
        showOverflow: true,
        showHeaderOverflow: true,
        cellRender: { name: 'render_isno' },
      },
      {
        field: 'isSync',
        title: '是否已同步',
        width: 160,
        showOverflow: true,
        showHeaderOverflow: true,
        slots: {
          default: 'isSync',
        },
      },
      {
        field: 'syncTime',
        title: '同步时间',
        width: 150,
        showOverflow: true,
        showHeaderOverflow: true,
      },
      {
        field: 'syncUserName',
        title: '同步人员',
        width: 100,
        showOverflow: true,
        showHeaderOverflow: true,
      },
      {
        field: 'remark',
        title: '备注信息',
        showOverflow: false,
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
      },
      {
        field: 'createUser',
        title: '创建人',
        width: 130,
        showOverflow: true,
        showHeaderOverflow: true,
        visible: false,
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
    vNumber: null,
    isRun: false,
    remark: '',
    versionId: null,
    isForce: false,
  });
  const formData = ref(_.cloneDeep(defFromData));
  const formRef = ref(null);
  const tableRef = ref({});
  const isShowForm = ref(false);
  const fromSpinning = ref(false);
  let saveType = 'add';
  const seacthContent = ref({
    name: '',
  });
  const fileList = ref([]);
  const dictionariesData_add = ref([]);

  function showFrom(row) {
    formData.value.versionId = props.versionId;
    fileList.value = [];
    saveType = 'add';
    isShowForm.value = true;
  }

  //关闭表单
  function formClose() {
    isShowForm.value = false;
    formData.value = _.cloneDeep(defFromData);
    formRef.value.clearValidate();
  }

  //获取软件包列表
  function getVersionsHis() {
    if (props.versionId) {
      loading.value = true;
      versionsApi
        .GetVersionsHis(props.versionId)
        .then((data) => {
          loading.value = false;
          tableConfig.data = data;
        })
        .catch(() => {
          loading.value = false;
          tableConfig.data = [];
        });
    }
  }

  //拖拽文件不符合 accept 类型时的回调
  function fileReject() {
    message.warning('选择文件类型不符合');
  }
  //上传之前
  function beforeUpload(file) {
    fileList.value = [];
    const isLt5M = file.size / 1024 / 1024 < 100;
    if (!isLt5M) {
      file['remove'] = true;
      message.error('软件包不可超过100MB');
    } else {
      fileList.value.push(file);
    }
    return false;
  }

  //保存
  function saveFrom() {
    if (fileList.value.length > 0) {
      formRef.value.validate().then(() => {
        fromSpinning.value = true;
        let _formData = new FormData();
        _formData.append('file', fileList.value[0]);
        for (const key in formData.value) {
          _formData.append(key, formData.value[key]);
        }
        versionsApi
          .AddVersionsHis(_formData)
          .then(() => {
            fileList.value = [];
            fromSpinning.value = false;
            formClose();
            message.success('新增软件版本包成功');
            getVersionsHis();
          })
          .catch((error) => {
            fromSpinning.value = false;
          });
      });
    } else {
      message.warning('请先选择软件包');
    }
  }

  //同步
  function syncChange(row) {
    row.isRunSync = true;
    versionsApi
      .UpdateRunVersionsHis(row.hisId.toString())
      .then(() => {
        row.isRunSync = false;
        message.success('更新运行版本成功');
        getVersionsHis();
      })
      .catch(() => {
        row.isRunSync = false;
      });
  }

  watch(
    () => props.versionId,
    () => {
      getVersionsHis();
    },
    { immediate: true },
  );
</script>
<style lang="less" scoped>
  @prefixCls: ~'@{namespace}-versionsManage-his-';

  .tableBtn {
    width: 100%;
  }

  :deep(.ant-upload-list-item-actions) {
    display: none;
  }
</style>
