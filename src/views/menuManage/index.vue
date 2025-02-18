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
                        <label>{{ t('view.menuName') }}：</label>
                        <a-input
                          @press-enter="getMenus"
                          v-model:value="seacthContent.menuName"
                          :placeholder="t('view.enterMenuNameToSearch')"
                        />
                      </a-space>
                    </div>
                    <div class="row-div">
                      <a-space direction="horizontal" size="small" :wrap="true">
                        <a-button @click="getMenus" type="primary">{{ t('view.query') }}</a-button>
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
                        <a-button class="ant-btn" @click="showFrom('add', null)">{{
                          t('view.addMenu')
                        }}</a-button>
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
            id="menuManage"
            :scroll-y="{ enabled: true }"
            :auto-resize="true"
            :border="true"
            ref="tableRef"
            height="100%"
            show-overflow
            :custom-config="{ storage: true }"
            :row-config="{ keyField: 'menuId' }"
            :column-config="{ resizable: true }"
            :tree-config="{ transform: true, rowField: 'menuId', parentField: 'parentId' }"
            :data="tableConfigData"
          >
            >
            <vxe-column
              type="seq"
              :title="t('view.serialNumber')"
              :minWidth="locale == 'zh-CN' ? 70 : 160"
              fixed="left"
            />
            <vxe-column
              field="menuId"
              :title="t('view.recordId')"
              :visible="false"
              :minWidth="136"
              fixed="left"
            />
            <vxe-column
              field="menuName"
              :title="t('view.menuName')"
              tree-node
              :sortable="true"
              :minWidth="150"
              fixed="left"
            >
              <template #default="{ row }">
                <span>
                  <template v-if="row.menuType != 7">
                    <IconFontClass :name="row.menuIcon" style="margin-right: 2px" />
                  </template>
                  <span>{{ row.menuName }}</span>
                </span>
              </template>
            </vxe-column>
            <vxe-column
              field="menuNameCn"
              :title="t('view.menuNameCn')"
              tree-node
              :sortable="true"
              :minWidth="180"
              visible="false"
            >
              <template #default="{ row }">
                <span>
                  <template v-if="row.menuType != 7">
                    <IconFontClass :name="row.menuIcon" style="margin-right: 2px" />
                  </template>
                  <span>{{ row.menuNameCn }}</span>
                </span>
              </template>
            </vxe-column>
            <vxe-column
              field="menuNameEn"
              :title="t('view.menuNameEn')"
              tree-node
              :sortable="true"
              :minWidth="180"
              visible="false"
            >
              <template #default="{ row }">
                <span>
                  <template v-if="row.menuType != 7">
                    <IconFontClass :name="row.menuIcon" style="margin-right: 2px" />
                  </template>
                  <span>{{ row.menuNameEn }}</span>
                </span>
              </template>
            </vxe-column>
            <vxe-column
              field="menuNameFr"
              :title="t('view.menuNameFr')"
              tree-node
              :sortable="true"
              :minWidth="184"
              visible="false"
            >
              <template #default="{ row }">
                <span>
                  <template v-if="row.menuType != 7">
                    <IconFontClass :name="row.menuIcon" style="margin-right: 2px" />
                  </template>
                  <span>{{ row.menuNameFr }}</span>
                </span>
              </template>
            </vxe-column>
            <vxe-column
              field="menuType"
              :title="t('view.menuType')"
              :sortable="true"
              :minWidth="130"
            >
              <template #default="{ row }">
                <span
                  :class="{
                    defMenu: row.menuType != 7,
                    menuBtn: row.menuType == 7,
                  }"
                  >{{ row.menuType == 7 ? t('view.button') : t('view.menu') }}</span
                >
              </template>
            </vxe-column>
            <vxe-column
              field="menuUrl"
              :title="t('view.accessAddress')"
              :sortable="true"
              :minWidth="250"
            />
            <vxe-column
              field="authName"
              :title="t('view.permissionIdentifier')"
              :sortable="true"
              :minWidth="194"
            />
            <vxe-column field="isValid" :title="t('view.enableOrDisable')" :minWidth="130">
              <template #default="{ row }">
                <span :style="{ color: row.isValid ? 'green' : 'red' }">{{
                  row.isValid ? t('view.yes') : t('view.no')
                }}</span>
              </template>
            </vxe-column>
            <vxe-column
              field="orderIndex"
              :title="t('view.sorting')"
              :sortable="true"
              :minWidth="100"
            />
            <vxe-column
              field="createTime"
              :title="t('view.creationTime')"
              :visible="false"
              :sortable="true"
              :minWidth="150"
            />
            <vxe-column
              field="createUser"
              :title="t('view.creator')"
              :visible="false"
              :sortable="true"
              :minWidth="130"
            />
            <vxe-column
              field="modifyTime"
              :title="t('view.modificationTime')"
              :visible="false"
              :sortable="true"
              :minWidth="170"
            />
            <vxe-column
              field="modifyUser"
              :title="t('view.modifier')"
              :visible="false"
              :sortable="true"
              :minWidth="130"
            />
            <vxe-column :title="t('view.action')" :minWidth="140" fixed="right">
              <template #default="{ row }">
                <div :class="`tableStyle`">
                  <AuthDom auth="menuManage_table_add">
                    <IconFontClass
                      name="icon-baseui-tianjiawukuang"
                      @click="showFrom('add', row, row.menuId)"
                      style="color: #0a61bd"
                      :title="t('view.addSubLevel')"
                    />
                  </AuthDom>
                  <AuthDom auth="menuManage_table_edit">
                    <IconFontClass
                      name="icon-baseui-edit-fill"
                      @click="showFrom('edit', row, row.parentId)"
                      style="color: #0a61bd"
                      :title="t('view.edit')"
                    />
                  </AuthDom>
                  <AuthDom auth="menuManage_table_delete">
                    <IconFontClass
                      name="icon-baseui-guanbicuowu"
                      @click="remove(row)"
                      style="color: red"
                      :title="t('view.delete')"
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
      :width="locale == 'zh-CN' ? 500 : 600"
      :visible="isValidForm"
      :title="t('view.menu')"
      :footer-style="{ textAlign: 'right' }"
      @close="formClose"
    >
      <a-form
        :label-col="{ span: locale == 'zh-CN' ? 6 : 10 }"
        :style="{ paddingRight: '2px' }"
        autocomplete="off"
        ref="formRef"
        :model="formData"
      >
        <a-form-item
          name="menuType"
          :label="t('view.menuType')"
          :rules="[{ required: true, message: t('view.pleaseSelectMenuType') }]"
        >
          <a-select v-model:value="formData.menuType" :placeholder="t('view.pleaseSelectMenuType')">
            <a-select-option :value="1">{{ t('view.systemMenu') }}</a-select-option>
            <a-select-option :value="7">{{ t('view.button') }}</a-select-option>
            <a-select-option :value="5">{{ t('view.openExternalLinkInNewPage') }}</a-select-option>
            <a-select-option :value="6">{{ t('view.embedOpenExternalLink') }}</a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item
          v-if="formData.menuType == 7"
          name="parentId"
          :label="t('view.parentMenu')"
          :rules="[
            { required: true, message: '' },
            { validator: formValidator.empty, message: t('view.pleaseSelectParentMenu') },
          ]"
        >
          <a-tree-select
            v-model:value="formData.parentId"
            show-search
            style="width: 100%"
            :dropdown-style="{ maxHeight: '400px', overflow: 'auto' }"
            :placeholder="t('view.pleaseSelectParentMenu')"
            allow-clear
            show-arrow
            :filterTreeNode="AntVueCommon.filterTreeNode"
            :tree-data="menuTreeDatas"
          />
        </a-form-item>
        <a-form-item v-else name="parentId" :label="t('view.parentMenu')">
          <a-tree-select
            v-model:value="formData.parentId"
            show-search
            style="width: 100%"
            :dropdown-style="{ maxHeight: '400px', overflow: 'auto' }"
            :placeholder="t('view.pleaseSelectParentMenu')"
            allow-clear
            show-arrow
            :filterTreeNode="AntVueCommon.filterTreeNode"
            :tree-data="menuTreeDatas"
          />
        </a-form-item>
        <a-form-item
          name="menuNameCn"
          :label="formData.menuType == 7 ? t('view.buttonNameCn') : t('view.menuNameCn')"
          :rules="[
            { required: true, message: '' },
            {
              max: 50,
              message:
                formData.menuType == 7
                  ? t('view.buttonNameTooLong', [50])
                  : t('view.menuNameTooLong', [50]),
            },
            {
              validator: formValidator.empty,
              message:
                formData.menuType == 7
                  ? t('view.pleaseEnterButtonName')
                  : t('view.pleaseEnterMenuName'),
            },
          ]"
        >
          <a-input
            v-model:value="formData.menuNameCn"
            :placeholder="
              formData.menuType == 7
                ? t('view.pleaseEnterButtonName')
                : t('view.pleaseEnterMenuName')
            "
            autocomplete="off"
          />
        </a-form-item>
        <a-form-item
          name="menuNameEn"
          :label="formData.menuType == 7 ? t('view.buttonNameEn') : t('view.menuNameEn')"
          :rules="[
            { required: true, message: '' },
            {
              max: 50,
              message:
                formData.menuType == 7
                  ? t('view.buttonNameTooLong', [50])
                  : t('view.menuNameTooLong', [50]),
            },
            {
              validator: formValidator.empty,
              message:
                formData.menuType == 7
                  ? t('view.pleaseEnterButtonName')
                  : t('view.pleaseEnterMenuName'),
            },
          ]"
        >
          <a-input
            v-model:value="formData.menuNameEn"
            :placeholder="
              formData.menuType == 7
                ? t('view.pleaseEnterButtonName')
                : t('view.pleaseEnterMenuName')
            "
            autocomplete="off"
          />
        </a-form-item>
        <a-form-item
          name="menuNameFr"
          :label="formData.menuType == 7 ? t('view.buttonNameFr') : t('view.menuNameFr')"
          :rules="[
            { required: true, message: '' },
            {
              max: 50,
              message:
                formData.menuType == 7
                  ? t('view.buttonNameTooLong', [50])
                  : t('view.menuNameTooLong', [50]),
            },
            {
              validator: formValidator.empty,
              message:
                formData.menuType == 7
                  ? t('view.pleaseEnterButtonName')
                  : t('view.pleaseEnterMenuName'),
            },
          ]"
        >
          <a-input
            v-model:value="formData.menuNameFr"
            :placeholder="
              formData.menuType == 7
                ? t('view.pleaseEnterButtonName')
                : t('view.pleaseEnterMenuName')
            "
            autocomplete="off"
          />
        </a-form-item>
        <template v-if="formData.menuType != 7">
          <a-form-item
            name="menuUrl"
            :label="t('view.accessAddress')"
            :rules="[{ max: 1024, message: t('view.accessAddressTooLong', [1024]) }]"
          >
            <a-input
              v-model:value="formData.menuUrl"
              :placeholder="t('view.pleaseEnterAccessAddress')"
              autocomplete="off"
            />
          </a-form-item>
          <a-form-item
            name="menuIcon"
            :label="t('view.menuIcon')"
            :rules="[{ required: true, message: t('view.pleaseSelectMenuIcon') }]"
          >
            <a-select
              allow-clear
              show-search
              :filter-option="AntVueCommon.filterOption"
              v-model:value="formData.menuIcon"
              style="width: 100%"
              :placeholder="t('view.pleaseSelectMenuIcon')"
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
          :label="t('view.permissionIdentifier')"
          :rules="[
            { required: true, message: '' },
            { max: 60, message: t('view.permissionIdentifierTooLong', [60]) },
            { validator: formValidator.empty, message: t('view.pleaseEnterPermissionIdentifier') },
          ]"
        >
          <a-input
            v-model:value="formData.authName"
            :placeholder="t('view.pleaseEnterPermissionIdentifier')"
            autocomplete="off"
          />
        </a-form-item>
        <a-form-item
          name="isValid"
          :label="t('view.enableOrDisable')"
          :placeholder="t('view.pleaseSelectEnableOrDisable')"
          :rules="[{ required: true, message: t('view.pleaseSelectEnableOrDisable') }]"
        >
          <a-switch v-model:checked="formData.isValid" />
        </a-form-item>
        <a-form-item
          name="orderIndex"
          :label="t('view.menuSorting')"
          :rules="[
            { required: true, message: t('view.pleaseEnterMenuSorting') },
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
            :placeholder="t('view.pleaseEnterMenuSorting')"
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
  import formValidator from '@/utils/MyCommon/formValidator';
  import AntVueCommon from '@/utils/MyCommon/AntVueCommon';
  import { ref, reactive, createVNode, nextTick, watch, onMounted } from 'vue';
  import { useDesign } from '@/hooks/web/useDesign';
  import menuApi from '@/api/menu';
  import iconApi from '@/api/icon';
  import { message, Modal } from 'ant-design-vue';
  import { ExclamationCircleOutlined } from '@ant-design/icons-vue';
  import { useI18n } from '@/hooks/web/useI18n';
  import { useLocaleStore } from '@/store/modules/locale';

  const { t } = useI18n();
  const localeStore = useLocaleStore();
  const locale = localeStore.getLocale;
  defineOptions({ name: 'MenuManage' });
  const { prefixCls } = useDesign('menuManage-');
  const loading = ref(true);
  const tableConfigData = ref([]);
  const defFromData = reactive({
    menuNameCn: null,
    menuNameEn: null,
    menuNameFr: null,
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
    if (row != null && row.menuType == 2) {
      message.info(t('view.topologyMenuCannotBeEditedOrAdded'));
      return;
    }
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
      title: t('view.deleteLevelOk'),
      icon: createVNode(ExclamationCircleOutlined),
      content: '',
      onOk() {
        loading.value = true;
        menuApi
          .DeleteMenu(row.menuId)
          .then((data) => {
            loading.value = false;
            try {
              if (data) {
                tableConfigData.value = tableConfigData.value?.filter(
                  (m) => data.indexOf(m.menuId) == -1,
                );
              }
              message.success(t('view.deletionSuccessful'));
              getMenuTreeDatas();
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
    isValidForm.value = false;
    formRef.value.clearValidate();
    getMenuTreeDatas();
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
          message.error(t('view.failedToRetrieveMenuInformation'));
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
          message.success(t('view.additionSuccessful'));
        });
      } else {
        menuApi.UpdateMenu(d).then((data) => {
          const oldData = tableConfigData.value.find((m) => m.menuId == data.menuId);
          if (oldData && oldData.parentId == data.parentId) {
            delete data.createtTime;
            delete data.createUser;
            myCommon.objectReplace(oldData, data);
          } else {
            getMenus();
          }
          formClose();
          message.success(t('view.updateSuccessful'));
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
        message.warning(t('view.parentCannotBeItself'));
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
