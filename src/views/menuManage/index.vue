<template>
  <MyContent :class="prefixCls">
    <a-spin :spinning="loading">
      <div style="width: 100%; height: 100%">
        <vxe-toolbar ref="toolbarRef" custom>
          <template #buttons>
            <div :class="`tableBtn`">
              <a-space direction="horizontal" size="small" style="margin-left: 5px">
                <AuthDom auth="menuManage_query">
                  <a-space
                    direction="horizontal"
                    size="small"
                    :wrap="true"
                    style="margin-bottom: 0"
                  >
                    <div class="row-div">
                      <a-space direction="horizontal" size="small" :wrap="true">
                        <label>菜单名称：</label>
                        <a-input
                          @press-enter="getMenus"
                          v-model:value="seacthContent.menuName"
                          placeholder="输入名称查询"
                        />
                      </a-space>
                    </div>
                    <div class="row-div">
                      <a-space direction="horizontal" size="small" :wrap="true">
                        <a-button @click="getMenus" type="primary">查询</a-button>
                      </a-space>
                    </div>
                  </a-space>
                </AuthDom>
                <AuthDom auth="menuManage_add">
                  <a-space
                    direction="horizontal"
                    size="small"
                    :wrap="true"
                    style="margin-bottom: 0"
                  >
                    <div class="row-div">
                      <a-space direction="horizontal" size="small" :wrap="true">
                        <a-button class="ant-btn" @click="showFrom('add', null)">新增菜单</a-button>
                      </a-space>
                    </div>
                  </a-space>
                </AuthDom>
              </a-space>
            </div>
          </template>
        </vxe-toolbar>
        <div style="width: 100%; height: calc(100% - 60px)">
          <vxe-table
            :border="true"
            ref="tableRef"
            max-height="100%"
            show-overflow
            :custom-config="{ storage: true }"
            :row-config="{ isHover: true, useKey: true, keyField: 'menuId' }"
            :column-config="{ resizable: true }"
            :tree-config="{ transform: true, rowField: 'menuId', parentField: 'parentId' }"
            :data="tableConfigData"
            :scroll-y="{ enabled: false }"
          >
            >
            <vxe-column type="seq" title="序号" width="60" />
            <vxe-column field="menuId" title="菜单id" :visible="false" />
            <vxe-column field="menuName" title="菜单名称" tree-node :sortable="true">
              <template #default="{ row }">
                <span>
                  <template v-if="row.menuType != 7">
                    <IconFontClass :name="row.menuIcon" style="margin-right: 2px" />
                  </template>
                  <span>{{ row.menuName }}</span>
                </span>
              </template>
            </vxe-column>
            <vxe-column field="menuType" title="菜单类型" :sortable="true">
              <template #default="{ row }">
                <span
                  :class="{
                    defMenu: row.menuType != 7,
                    menuBtn: row.menuType == 7,
                  }"
                  >{{ row.menuType == 7 ? '按钮' : '菜单' }}</span
                >
              </template>
            </vxe-column>
            <vxe-column field="menuUrl" title="访问地址" :sortable="true" />
            <vxe-column field="authName" title="权限标识" :sortable="true" />
            <vxe-column field="isValid" title="是否启用">
              <template #default="{ row }">
                <span :style="{ color: row.isValid ? 'green' : 'red' }">{{
                  row.isValid ? '是' : '否'
                }}</span>
              </template>
            </vxe-column>
            <vxe-column field="orderIndex" title="菜单排序" :sortable="true" />
            <vxe-column field="createTime" title="创建时间" :visible="false" :sortable="true" />
            <vxe-column field="createUser" title="创建人" :visible="false" :sortable="true" />
            <vxe-column field="modifyTime" title="修改时间" :visible="false" :sortable="true" />
            <vxe-column field="modifyUser" title="修改人" :visible="false" :sortable="true" />
            <vxe-column title="操作" width="140">
              <template #default="{ row }">
                <div :class="`tableStyle`">
                  <AuthDom auth="menuManage_table_add">
                    <IconFontClass
                      name="icon-baseui-tianjiawukuang"
                      @click="showFrom('add', row, row.menuId)"
                      style="color: #0a61bd"
                      title="增加子集"
                    />
                  </AuthDom>
                  <AuthDom auth="menuManage_table_edit">
                    <IconFontClass
                      name="icon-baseui-edit-fill"
                      @click="showFrom('edit', row, row.parentId)"
                      style="color: #0a61bd"
                      title="编辑"
                    />
                  </AuthDom>
                  <AuthDom auth="menuManage_table_delete">
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
      :visible="isValidForm"
      title="菜单"
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
          name="menuType"
          label="菜单类型"
          :rules="[{ required: true, message: '请选择菜单类型' }]"
        >
          <a-select v-model:value="formData.menuType">
            <a-select-option :value="1">系统菜单</a-select-option>
            <a-select-option :value="7">操作按钮</a-select-option>
            <a-select-option :value="5">新页面打开外链</a-select-option>
            <a-select-option :value="6">嵌入式打开外链</a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item
          v-if="formData.menuType == 7"
          name="parentId"
          label="上级菜单"
          :rules="[
            { required: true, message: '' },
            { max: 250, message: '菜单名称过长' },
            { validator: formValidator.empty, message: '请输入菜单名称' },
          ]"
        >
          <a-tree-select
            v-model:value="formData.parentId"
            show-search
            style="width: 100%"
            :dropdown-style="{ maxHeight: '400px', overflow: 'auto' }"
            placeholder="请选择上级菜单"
            allow-clear
            show-arrow
            :filterTreeNode="AntVueCommon.filterTreeNode"
            :tree-data="menuTreeDatas"
          />
        </a-form-item>
        <a-form-item v-else name="parentId" label="上级菜单">
          <a-tree-select
            v-model:value="formData.parentId"
            show-search
            style="width: 100%"
            :dropdown-style="{ maxHeight: '400px', overflow: 'auto' }"
            placeholder="请选择上级菜单"
            allow-clear
            show-arrow
            :filterTreeNode="AntVueCommon.filterTreeNode"
            :tree-data="menuTreeDatas"
          />
        </a-form-item>
        <a-form-item
          name="menuName"
          :label="formData.menuType == 7 ? '按钮名称' : '菜单名称'"
          :rules="[
            { required: true, message: '' },
            { max: 250, message: formData.menuType == 7 ? '按钮名称过长' : '菜单名称过长' },
            {
              validator: formValidator.empty,
              message: formData.menuType == 7 ? '请输入按钮名称' : '请输入菜单名称',
            },
          ]"
        >
          <a-input
            v-model:value="formData.menuName"
            :placeholder="formData.menuType == 7 ? '请输入按钮名称' : '请输入菜单名称'"
            autocomplete="off"
          />
        </a-form-item>
        <template v-if="formData.menuType != 7">
          <a-form-item
            name="menuUrl"
            label="访问地址"
            :rules="[{ max: 1024, message: '访问地址过长' }]"
          >
            <a-input
              v-model:value="formData.menuUrl"
              placeholder="请输入访问地址"
              autocomplete="off"
            />
          </a-form-item>
          <a-form-item
            name="menuIcon"
            label="菜单图标"
            :rules="[{ required: true, message: '请选择菜单图标' }]"
          >
            <a-select
              allow-clear
              show-search
              :filter-option="AntVueCommon.filterOption"
              v-model:value="formData.menuIcon"
              style="width: 100%"
              placeholder="请选择菜单图标"
            >
              <a-select-option
                v-for="(item, i) in iconDatas"
                :value="item.label"
                :label="item.label"
                :key="i"
              >
                <span>
                  <IconFontClass :name="item.label" style="margin-right: 2px" />
                  {{ item.label }}</span
                >
              </a-select-option>
            </a-select>
          </a-form-item>
        </template>
        <a-form-item
          v-else
          name="authName"
          label="权限标识"
          :rules="[
            { required: true, message: '' },
            { max: 250, message: '权限标识过长' },
            { validator: formValidator.empty, message: '请输入权限标识' },
          ]"
        >
          <a-input
            v-model:value="formData.authName"
            placeholder="请输入权限标识"
            autocomplete="off"
          />
        </a-form-item>
        <a-form-item
          v-if="formData.menuType != 7"
          name="isValid"
          label="是否启用"
          placeholder="请选择是否启用"
          :rules="[{ required: true, message: '请选择是否启用' }]"
        >
          <a-switch v-model:checked="formData.isValid" />
        </a-form-item>
        <a-form-item
          name="orderIndex"
          label="菜单排序"
          :rules="[{ required: true, message: '请输入排序' }]"
        >
          <a-input-number
            style="width: 300px"
            :precision="3"
            :min="-99999"
            :max="99999"
            v-model:value="formData.orderIndex"
            placeholder="请输入菜单排序"
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
  import { ref, reactive, createVNode, nextTick, watch, onMounted } from 'vue';
  import { useDesign } from '@/hooks/web/useDesign';
  import menuApi from '@/api/menu';
  import iconApi from '@/api/icon';
  import { message, Modal } from 'ant-design-vue';
  import { ExclamationCircleOutlined } from '@ant-design/icons-vue';

  defineOptions({ name: 'MenuManage' });
  const { prefixCls } = useDesign('menuManage-');
  const loading = ref(true);
  const tableConfigData = ref([]);
  const defFromData = reactive({
    menuName: '',
    menuType: null,
    menuUrl: null,
    authName: null,
    orderIndex: null,
    isValid: true,
    parentId: null,
    menuIcon: null,
  });
  const formData = ref(_.cloneDeep(defFromData));
  const formRef = ref({});
  const tableRef = ref({});
  const toolbarRef = ref({});
  const isValidForm = ref(false);
  const fromSpinning = ref(false);
  const seacthContent = ref({
    menuName: '',
  });
  const menuTreeDatas = ref([]);
  let saveType = 'add';
  const iconDatas = ref([]);

  getMenus();
  getIconSimple();

  function showFrom(type, row, pid = null) {
    getMenuTreeDatas();
    saveType = type;
    if (type == 'add') {
      formData.value.parentId = pid;
      isValidForm.value = true;
    } else {
      //编辑
      getByid(row.menuId);
    }
  }

  //删除菜单信息
  function remove(row) {
    Modal.confirm({
      maskClosable: true,
      title: '删除该项，子集数据也将被删除，是否删除?',
      icon: createVNode(ExclamationCircleOutlined),
      content: '',
      onOk() {
        loading.value = true;
        menuApi
          .DeleteMenu(row.menuId)
          .then(() => {
            loading.value = false;
            tableConfigData.value = tableConfigData.value?.filter((m) => m.menuId != row.menuId);
            message.success('删除菜单信息成功');
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
    isValidForm.value = false;
    formRef.value.clearValidate();
  }

  //获取菜单
  function getByid(id) {
    loading.value = true;
    menuApi
      .GetMenu(id.toString())
      .then((data) => {
        loading.value = false;
        if (data) {
          data.parentId = data.parentId == 0 ? null : data.parentId;
          formData.value = data;
          saveType = 'edit';
          isValidForm.value = true;
        } else {
          message.error('获取菜单信息失败');
        }
      })
      .catch(() => {
        loading.value = false;
      });
  }

  //获取列表
  function getMenus() {
    loading.value = true;
    menuApi
      .GetMenuList({
        ...seacthContent.value,
        execompleteBefore: () => {
          loading.value = false;
        },
      })
      .then((data) => {
        tableConfigData.value = data;
        nextTick(() => {
          !myCommon.isnull(seacthContent.value.menuName)
            ? tableRef.value.setAllTreeExpand(true)
            : tableRef.value.clearTreeExpand();
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
      const d = _.cloneDeep(formData.value);
      d.parentId = d.parentId == null ? 0 : d.parentId;
      if (saveType == 'add') {
        menuApi.AddMenu(d).then((data) => {
          tableConfigData.value.splice(0, 0, data);
          formClose();
          message.success('新增菜单成功');
        });
      } else {
        menuApi.UpdateMenu(d).then((data) => {
          formClose();
          message.success('更新菜单信息成功');
          if (tableRef.value.getRowById(data.menuId).parentId == data.parentId) {
            myCommon.objectReplace(tableRef.value.getRowById(data.menuId), data);
          } else {
            getMenus();
          }
        });
      }
    });
  }

  //获取菜单树
  function getMenuTreeDatas() {
    menuApi.GetMenuSimple({ NoMenuType: [7] }).then((data) => {
      menuTreeDatas.value = data;
    });
  }

  //获取图标
  function getIconSimple() {
    iconApi.GetIconSimple().then((data) => {
      iconDatas.value = data;
    });
  }

  watch(
    () => formData.value.parentId,
    () => {
      if (isValidForm.value && formData.value.parentId == formData.value.menuId) {
        formData.value.parentId = null;
        message.warning('父级不能是自己');
      }
    },
  );

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
  @prefixCls: ~'@{namespace}-menuManage-';

  .@{prefixCls} {
    .@{prefixCls}tableBtn {
      width: 100%;
    }

    .defMenu {
      padding: 0 8px;
      border-radius: 3px;
      background-color: #e7eef5;
      color: #11559c;
    }

    .menuBtn {
      padding: 0 8px;
      border-radius: 3px;
      background-color: #f4f4f5;
      color: #909399;
    }
  }
</style>
