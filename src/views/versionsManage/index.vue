<template>
  <MyContent :class="prefixCls">
    <vxe-grid
      :scroll-y="{ enabled: true }"
      v-bind="tableConfig"
      id="mytable"
      ref="tableRef"
      :auto-resize="true"
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
          <AuthDom auth="userManage_table_edit">
            <IconFontClass
              name="icon-baseui-edit-fill"
              @click="showFrom(row)"
              style="color: #0749df"
              title="编辑"
            />
          </AuthDom>
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
          v-show="saveType == 'add'"
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
          name="runPlatform"
          label="运行平台"
          :rules="[{ required: true, message: '请选择运行平台' }]"
        >
          <a-select v-model:value="formData.runPlatform">
            <a-select-option :value="1"> Windows</a-select-option>
            <a-select-option :value="2"> Android</a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item
          name="isBrowserDown"
          label="浏览器下载"
          :rules="[{ required: true, message: '请选择是否可以浏览下载安装包' }]"
        >
          <a-switch v-model:checked="formData.isBrowserDown" />
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
        <a-form-item
          v-if="formData.isBrowserDown"
          name="iconBase64"
          label="logo图片"
          :rules="[{ required: true, message: 'logo图片缺失' }]"
        >
          <a-upload
            style="margin-bottom: 20px"
            v-show="formData.isBrowserDown"
            :fileList="fileList"
            :maxCount="1"
            name="file"
            :multiple="false"
            accept=".png,.jpg,.jpeg"
            :before-upload="beforeUpload"
            @reject="fileReject"
          >
            <div v-if="formData.iconBase64">
              <img class="image-container" :src="formData.iconBase64" alt="avatar" />
            </div>
            <div
              v-else
              style="
                display: flex;
                position: relative;
                align-items: center;
                justify-content: center;
                width: 100px;
                height: 100px;
                border: 1px dotted #666;
                cursor: pointer;
              "
            >
              <IconFontClass
                style="font-size: 25px"
                name=" icon-baseui-yunshangchuan"
                title="上传"
              />
            </div>
          </a-upload>
          <IconFontClass
            v-if="formData.iconBase64"
            style="position: absolute; top: 38px; font-size: 18px; cursor: pointer"
            name=" icon-baseui-delete"
            @click="
              () => {
                fileList = [];
                formData.iconBase64 = null;
              }
            "
            title="删除"
          />
        </a-form-item>
        <a-form-item name="configFilePath" label="配置文件">
          <a-upload
            :fileList="configFileList"
            :maxCount="1"
            name="file"
            :multiple="false"
            accept=".zip,.rar"
            :before-upload="configBeforeUpload"
            @reject="configFileReject"
          >
            <div v-if="!myCommon.isnull(formData.configFilePath)" style="position: relative">
              <a-input
                style="width: 300px"
                :value="
                  formData.configFilePath.split('/')[formData.configFilePath.split('/').length - 1]
                "
              />
              <div
                style="
                  position: absolute;
                  z-index: 20;
                  top: 0;
                  left: 0;
                  width: 300px;
                  height: 32px;
                  cursor: pointer;
                "
              >
              </div>
            </div>
            <div v-else>
              <a-input style="width: 300px" placeholder="点击上传配置文件" />
              <div
                style="
                  position: absolute;
                  z-index: 20;
                  top: 0;
                  left: 0;
                  width: 300px;
                  height: 32px;
                  cursor: pointer;
                "
              >
              </div>
            </div>
          </a-upload>
          <IconFontClass
            v-if="formData.configFilePath"
            style="position: absolute; right: -20px; font-size: 18px; cursor: pointer"
            name=" icon-baseui-delete"
            @click="
              () => {
                configFileList = [];
                formData.configFilePath = null;
              }
            "
            title="删除"
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
  import myCommon from '@/utils/MyCommon/common';
  import AntVueCommon from '@/utils/MyCommon/AntVueCommon';
  import { ref, reactive, createVNode } from 'vue';
  import { VxeGrid, VxeGridProps } from 'vxe-table';
  import versionsApi from '@/api/versions';
  import { message, Modal } from 'ant-design-vue';
  import { ExclamationCircleOutlined } from '@ant-design/icons-vue';
  import his from './his.vue';
  import { useDesign } from '@/hooks/web/useDesign';
  import formValidator from '@/utils/MyCommon/formValidator';

  defineOptions({ name: 'VersionsManage' });
  const { prefixCls } = useDesign('versionsManage-');
  const loading = ref(true);
  const tableConfig = reactive<VxeGridProps>({
    height: 'auto',
    columns: [
      //基础
      { type: 'seq', title: '序号', minWidth: 50, fixed: 'left' },
      {
        field: 'versionId',
        title: '记录ID',
        visible: false,
        showOverflow: true,
        showHeaderOverflow: true,
        minWidth: 130,
        fixed: 'left',
      },
      {
        field: 'serviceName',
        title: '服务类型名称',
        showOverflow: true,
        showHeaderOverflow: true,
        sortable: true,
        minWidth: 150,
        fixed: 'left',
      },
      {
        field: 'runNumber',
        title: '正式版本',
        showOverflow: true,
        showHeaderOverflow: true,
        sortable: true,
        slots: {
          default: 'runNumber',
        },
        minWidth: 150,
      },
      {
        field: 'isForce',
        title: '是否强制升级',
        minWidth: 120,
        showOverflow: true,
        showHeaderOverflow: true,
        // sortable: true,
        cellRender: { name: 'render_isno' },
      },
      {
        field: 'isSync',
        title: '是否已同步',
        minWidth: 130,
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
        minWidth: 150,
        showOverflow: true,
        sortable: true,
        showHeaderOverflow: true,
      },
      {
        field: 'syncUserName',
        title: '同步人员',
        minWidth: 130,
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
        minWidth: 100,
      },
      {
        field: 'createTime',
        title: '创建时间',
        minWidth: 150,
        showOverflow: true,
        showHeaderOverflow: true,
        sortable: true,
      },
      {
        field: 'createUser',
        title: '创建人',
        minWidth: 130,
        showOverflow: true,
        showHeaderOverflow: true,
        sortable: true,
      },
      {
        field: 'modifyTime',
        title: '修改时间',
        minWidth: 150,
        visible: false,
        showOverflow: true,
        showHeaderOverflow: true,
        sortable: true,
      },
      {
        field: 'modifyUser',
        title: '修改用户',
        visible: false,
        showOverflow: true,
        showHeaderOverflow: true,
        sortable: true,
        minWidth: 130,
      },
      {
        title: '操作',
        minWidth: 110,
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
    runPlatform: true,
    isBrowserDown: true,
    iconBase64: null,
    configFilePath: null,
  });
  const formData = ref(_.cloneDeep(defFromData));
  const formRef = ref(null);
  const tableRef = ref({});
  const isShowForm = ref(false);
  const fromSpinning = ref(false);
  const saveType = ref('edit');
  const isShowVis = ref(false);
  const dictionariesData_add = ref([]);
  const versionId = ref('');
  const fileList = ref([]);
  const configFileList = ref([]);

  getVersions();

  function showHis(row) {
    versionId.value = row.versionId;
    isShowVis.value = true;
  }

  function showFrom(row) {
    getServerTypes();
    fileList.value = [];
    configFileList.value = [];
    formData.value.iconBase64 = null;
    saveType.value = 'add';
    isShowForm.value = true;
    if (myCommon.isnull(row)) {
      saveType.value = 'add';
      isShowForm.value = true;
    } else {
      //编辑
      getVersion(row.versionId);
    }
  }

  //获取用户
  function getVersion(versionId) {
    loading.value = true;
    versionsApi
      .GetVersion(versionId.toString())
      .then((data) => {
        loading.value = false;
        if (data) {
          delete data.createTime;
          delete data.createUser;
          delete data.modifyTime;
          delete data.modifyUser;
          formData.value = data;
          saveType.value = 'edit';
          isShowForm.value = true;
        } else {
          message.error('获取版本信息失败');
        }
      })
      .catch(() => {
        loading.value = false;
      });
  }

  //上传之前
  function beforeUpload(file) {
    fileList.value = [];
    const isLt5M = file.size / 1024 / 1024 < 5;
    if (!isLt5M) {
      file['remove'] = true;
      message.error('logo图片不可超过5MB');
    } else {
      fileList.value.push(file);
      myCommon.imgBase64(file).then((base64) => {
        formData.value.iconBase64 = base64;
        formRef.value.validate(['iconBase64']);
      });
    }
    return false;
  }
  //拖拽文件不符合 accept 类型时的回调
  function fileReject() {
    message.warning('选择文件类型不符合');
  }

  //拖拽文件不符合 accept 类型时的回调
  function configFileReject() {
    message.warning('选择文件类型不符合');
  }
  //上传之前
  function configBeforeUpload(file) {
    configFileList.value = [];
    const isLt5M = file.size / 1024 / 1024 < 20;
    if (!isLt5M) {
      file['remove'] = true;
      message.error('软件包不可超过20MB');
    } else {
      configFileList.value.push(file);
      formData.value.configFilePath = file.name;
    }
    return false;
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
      let _formData = new FormData();
      if (configFileList.value.length > 0) {
        _formData.append('configFile', configFileList.value[0]);
      }
      for (const key in formData.value) {
        _formData.append(key, formData.value[key]);
      }
      if (saveType.value == 'add') {
        versionsApi
          .AddVersions(_formData)
          .then(() => {
            fromSpinning.value = false;
            fileList.value = [];
            configFileList.value = [];
            getVersions();
            formClose();
            message.success('新增软件包类型成功');
          })
          .catch(() => {
            fromSpinning.value = false;
          });
      } else {
        versionsApi
          .UpdateVersion(_formData)
          .then((data) => {
            fromSpinning.value = false;
            if (data) {
              message.success('更新版本信息成功');
              fileList.value = [];
              configFileList.value = [];
              formClose();
              getVersions();
            } else {
              message.error('更新版本信息失败');
            }
          })
          .catch(() => {
            fromSpinning.value = false;
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
        message.success('更新终端版本成功');
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

  :deep(.ant-upload-list) {
    display: none;
  }

  .image-container {
    width: 100px;
    height: 100px;
  }

  .image-container::before {
    content: '';
    display: block;
    width: 100%;
    height: 100%;
    border: 1px solid rgb(214 214 214);
    background-color: inherit;
  }
</style>
