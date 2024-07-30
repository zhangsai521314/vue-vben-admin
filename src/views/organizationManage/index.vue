<template>
  <MyContent :class="prefixCls">
    <a-spin :spinning="loading">
      <div style="width: 100%; height: 100%">
        <vxe-toolbar ref="toolbarRef" custom>
          <template #buttons>
            <a-space direction="horizontal" size="small" style="margin-left: 5px">
              <AuthDom auth="organizationManage_query">
                <a-space direction="horizontal" size="small" :wrap="true" style="margin-bottom: 0">
                  <div class="row-div">
                    <a-space direction="horizontal" size="small" :wrap="true">
                      <label>部门名称：</label>
                      <a-input
                        @press-enter="getOrganizations"
                        v-model:value="seacthContent.orgName"
                        placeholder="输入部门名称查询"
                      />
                    </a-space>
                  </div>
                  <div class="row-div">
                    <a-space direction="horizontal" size="small" :wrap="true">
                      <a-button @click="getOrganizations" type="primary">查询</a-button>
                    </a-space>
                  </div>
                </a-space>
              </AuthDom>
              <AuthDom v-if="userData.adminType < 3" auth="organizationManage_add">
                <a-space direction="horizontal" size="small" :wrap="true" style="margin-bottom: 0">
                  <div class="row-div">
                    <a-space direction="horizontal" size="small" :wrap="true">
                      <a-button class="ant-btn" @click="showFrom('add', null, 0)"
                        >新增顶级部门</a-button
                      >
                    </a-space>
                  </div>
                </a-space>
              </AuthDom>
            </a-space>
          </template>
        </vxe-toolbar>
        <div style="width: 100%; height: calc(100% - 62px)">
          <vxe-table
            :border="true"
            max-height="100%"
            ref="tableRef"
            show-overflow
            :row-config="{ isHover: true, useKey: true, keyField: 'orgId' }"
            :column-config="{ resizable: true }"
            :tree-config="{ transform: true, rowField: 'orgId', parentField: 'parentId' }"
            :data="tableConfigData"
          >
            <vxe-column type="seq" title="序号" width="60" />
            <vxe-column field="orgId" title="部门id" :visible="false" />
            <vxe-column field="orgName" title="部门名称" tree-node />
            <vxe-column field="orderIndex" title="部门排序" :visible="false" />
            <vxe-column field="createTime" title="创建时间" :visible="false" />
            <vxe-column field="createUser" title="创建人" :visible="false" />
            <vxe-column field="modifyTime" title="修改时间" :visible="false" />
            <vxe-column field="modifyUser" title="修改人" :visible="false" />
            <vxe-column title="操作" width="140">
              <template #default="{ row }">
                <div :class="`tableStyle`">
                  <AuthDom auth="organizationManage_table_add">
                    <IconFontClass
                      name="icon-baseui-tianjiawukuang"
                      @click="showFrom('add', row, row.orgId)"
                      style="color: #0a61bd"
                      title="增加子级"
                    />
                  </AuthDom>
                  <AuthDom auth="organizationManage_table_edit">
                    <IconFontClass
                      name="icon-baseui-edit-fill"
                      @click="showFrom('edit', row, row.parentId)"
                      style="color: #0a61bd"
                      title="编辑"
                    />
                  </AuthDom>
                  <AuthDom auth="organizationManage_table_delete">
                    <IconFontClass
                      name="icon-baseui-guanbicuowu"
                      @click="remove(row)"
                      style="color: red"
                      title="删除"
                    />
                  </AuthDom>
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
      title="部门"
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
          name="orgName"
          label="部门名称"
          :rules="[
            { required: true, message: '' },
            { max: 40, message: '部门名称过长' },
            { validator: formValidator.empty, message: '请输入部门名称' },
          ]"
        >
          <a-input
            v-model:value="formData.orgName"
            placeholder="请输入部门名称"
            autocomplete="off"
          />
        </a-form-item>
        <a-form-item
          name="orderIndex"
          label="部门排序"
          :rules="[
            { required: true, message: '请输入部门排序' },
            { validator: formValidator.min, min: -9999, message: '排序值-9999至9999' },
            { validator: formValidator.max, max: 9999, message: '排序值-9999至9999' },
          ]"
        >
          <a-input-number
            style="width: 300px"
            v-model:value="formData.orderIndex"
            placeholder="请输入部门排序"
            autocomplete="off"
            :precision="3"
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
  import { ref, reactive, createVNode, nextTick, watch, onMounted } from 'vue';
  import { useDesign } from '@/hooks/web/useDesign';
  import organizationApi from '@/api/organization';
  import { message, Modal } from 'ant-design-vue';
  import { ExclamationCircleOutlined } from '@ant-design/icons-vue';
  import { useUserStore } from '@/store/modules/user';

  defineOptions({ name: 'OrganizationManage' });
  const userStore = useUserStore();
  const userData = ref(_.cloneDeep(userStore.getUserInfo));
  const { prefixCls } = useDesign('organizationManage-');
  const loading = ref(true);
  const tableConfigData = ref([]);
  const defFromData = reactive({
    orgName: '',
    orderIndex: null,
    parentId: 0,
  });
  const formData = ref(_.cloneDeep(defFromData));
  const formRef = ref({});
  const tableRef = ref({});
  const toolbarRef = ref({});
  const isShowForm = ref(false);
  const fromSpinning = ref(false);
  const seacthContent = ref({
    orgName: '',
  });
  let saveType = 'add';

  getOrganizations();

  function showFrom(type, row, pid) {
    saveType = type;
    if (type == 'add') {
      isShowForm.value = true;
      formData.value.parentId = pid == null ? 0 : pid;
    } else {
      //编辑
      getByid(row.orgId);
    }
  }

  //删除部门信息
  function remove(row) {
    Modal.confirm({
      maskClosable: true,
      title: '删除该项，子集数据也将被删除，是否删除?',
      icon: createVNode(ExclamationCircleOutlined),
      content: '',
      onOk() {
        loading.value = true;
        organizationApi
          .DeleteOrganization(row.orgId)
          .then(() => {
            loading.value = false;
            tableConfigData.value = tableConfigData.value?.filter((m) => m.orgId != row.orgId);
            message.success('删除部门信息成功');
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

  //获取部门
  function getByid(id) {
    loading.value = true;
    organizationApi
      .GetOrganization(id.toString())
      .then((data) => {
        loading.value = false;
        if (data) {
          formData.value = data;
          saveType = 'edit';
          isShowForm.value = true;
        } else {
          message.error('获取部门信息失败');
        }
      })
      .catch(() => {
        loading.value = false;
      });
  }

  //获取列表
  function getOrganizations() {
    loading.value = true;
    organizationApi
      .GetOrganizations({
        ...seacthContent.value,
        execompleteBefore: () => {
          loading.value = false;
        },
      })
      .then((data) => {
        tableConfigData.value = data;
        nextTick(() => {
          tableRef.value.setAllTreeExpand(true);
        });
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
        organizationApi.AddOrganization(formData.value).then((data) => {
          tableConfigData.value.splice(0, 0, data);
          formClose();
          message.success('新增部门成功');
        });
      } else {
        organizationApi.UpdateOrganization(formData.value).then((data) => {
          delete data.createtTime;
          delete data.createUser;
          myCommon.objectReplace(tableRef.value.getRowById(data.orgId), data);
          formClose();
          message.success('更新部门信息成功');
        });
      }
    });
  }

  onMounted(() => {
    // 将表格和工具栏进行关联
    const $table = tableRef.value;
    const $toolbar = toolbarRef.value;
    if ($table && $toolbar) {
      $table.connect($toolbar);
    }
  });
</script>
<style lang="less" scoped>
  @prefixCls: ~'@{namespace}-organizationManage-';

  .@{prefixCls} {
    .@{prefixCls}tableBtn {
      width: 100%;
    }
  }
</style>
