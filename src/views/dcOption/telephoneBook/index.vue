<template>
  <MyContent :class="prefixCls">
    <a-spin :spinning="isRunGet" title="正在执行...">
      <!-- 开启多字段排序 -->
      <!-- :sort-config="{ multiple: true }" -->
      <vxe-grid
        v-bind="tableConfig"
        id="mytable"
        ref="tableRef"
        :auto-resize="true"
        :loading="loading"
        :seq-config="{ startIndex: (page.current - 1) * page.size }"
        :row-config="{ keyField: 'phoneId' }"
        :column-config="{ resizable: true }"
        :custom-config="{ storage: true }"
        @sort-change="onSortChange"
      >
        <template #toolbar_buttons>
          <div :class="`tableBtn`">
            <a-space direction="horizontal" size="small" style="margin-left: 5px">
              <AuthDom auth="dcOption_telephoneBook_query">
                <a-space direction="horizontal" size="small" :wrap="true" style="margin-bottom: 0">
                  <div class="row-div">
                    <a-space direction="horizontal" size="small" :wrap="true">
                      <label>联系名称：</label>
                      <a-input
                        @press-enter="initPage"
                        v-model:value="seacthContent.userName"
                        placeholder="输入联系名称查询"
                      />
                    </a-space>
                  </div>
                  <div class="row-div">
                    <a-space direction="horizontal" size="small" :wrap="true">
                      <a-button @click="initPage" type="primary">查询</a-button>
                    </a-space>
                  </div>
                </a-space>
              </AuthDom>
              <AuthDom auth="dcOption_telephoneBook_add">
                <a-space direction="horizontal" size="small" :wrap="true" style="margin-bottom: 0">
                  <div class="row-div">
                    <a-space direction="horizontal" size="small" :wrap="true">
                      <a-button class="ant-btn" @click="showFrom()">新增电话</a-button>
                    </a-space>
                  </div>
                </a-space>
              </AuthDom>
            </a-space>
          </div>
        </template>
        <template #pager>
          <vxe-pager
            background
            v-model:current-page="page.current"
            v-model:page-size="page.size"
            :total="page.total"
            @page-change="handlePageChange"
          />
        </template>
        <template #default="{ row }">
          <div :class="`tableOption`">
            <AuthDom auth="dcOption_telephoneBook_table_edit">
              <IconFontClass
                name="icon-baseui-edit-fill"
                @click="showFrom(row)"
                style="color: #0749df"
                title="编辑"
              />
            </AuthDom>
            <AuthDom auth="dcOption_telephoneBook_delete">
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
            label="联系名称"
            name="userName"
            :rules="[
              { required: true, message: '请输入联系名称' },
              { max: 40, message: '联系名称过长' },
            ]"
          >
            <a-input
              placeholder="请输入联系名称"
              v-model:value="formData.userName"
              autocomplete="off"
            />
          </a-form-item>
          <a-form-item
            label="联系电话"
            name="phoneNumber"
            :rules="[
              { required: true, message: '请输入联系电话' },
              { max: 18, message: '联系电话过长' },
              { validator: formValidator.positiveInteger, message: '联系电话格式为自然数' },
            ]"
          >
            <a-input
              placeholder="请输入联系电话"
              v-model:value="formData.phoneNumber"
              autocomplete="off"
            />
          </a-form-item>
          <!-- <a-form-item name="remark" label="备注" :rules="[{ max: 250, message: '备注过长' }]">
            <a-textarea
              placeholder="请输入备注"
              :rows="3"
              v-model:value="formData.remark"
              autocomplete="off"
            />
          </a-form-item> -->
        </a-form>
        <template #footer>
          <a-spin :spinning="fromSpinning">
            <a-button type="primary" @click="saveFrom">保存</a-button>
            <a-button style="margin-left: 8px" @click="formClose">关闭</a-button>
          </a-spin>
        </template>
      </a-drawer>
    </a-spin>
  </MyContent>
</template>
<script setup lang="ts">
  import myCommon from '@/utils/MyCommon/common';
  import formValidator from '@/utils/MyCommon/formValidator';
  import { ref, reactive, createVNode, nextTick, watch } from 'vue';
  import { VxeGrid, VxeGridProps } from 'vxe-table';
  import { TelephoneBook as telephoneBookApi } from '@/api/dcOption';
  import { message, Modal } from 'ant-design-vue';
  import { ExclamationCircleOutlined } from '@ant-design/icons-vue';
  import { useDesign } from '@/hooks/web/useDesign';

  defineOptions({ name: 'DCOptionTelephoneBook' });
  const { prefixCls } = useDesign('DCOptionTelephoneBook-');
  const isRunGet = ref(false);
  const loading = ref(true);
  const tableConfig = reactive<VxeGridProps>({
    height: 'auto',
    columns: [
      { type: 'seq', title: '序号', minWidth: 70, fixed: 'left' },
      //基础
      {
        field: 'phoneId',
        title: '记录ID',
        visible: false,
        showHeaderOverflow: true,
        fixed: 'left',
        minWidth: 130,
      },
      {
        field: 'userName',
        title: '联系名称',
        showOverflow: true,
        showHeaderOverflow: true,
        sortable: true,
        minWidth: 200,
        fixed: 'left',
      },
      {
        field: 'phoneNumber',
        title: '联系号码',
        showOverflow: true,
        showHeaderOverflow: true,
        sortable: true,
        minWidth: 100,
      },
      {
        field: 'createTime',
        title: '创建时间',
        minWidth: 150,
        showOverflow: true,
        showHeaderOverflow: true,
        visible: false,
        sortable: true,
      },
      {
        field: 'createUser',
        title: '创建人',
        minWidth: 130,
        showOverflow: true,
        showHeaderOverflow: true,
        visible: false,
        sortable: true,
      },
      {
        field: 'modifyTime',
        title: '修改时间',
        minWidth: 150,
        showOverflow: true,
        showHeaderOverflow: true,
        visible: false,
        sortable: true,
      },
      {
        field: 'modifyUser',
        title: '修改人',
        minWidth: 130,
        showOverflow: true,
        showHeaderOverflow: true,
        visible: false,
        sortable: true,
      },
      {
        title: '操作',
        minWidth: 90,
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
    // remark: '',
    phoneNumber: null,
    userName: null,
  });
  const formData = ref(_.cloneDeep(defFromData));
  const formRef = ref(null);
  const tableRef = ref({});
  const isShowForm = ref(false);
  const fromSpinning = ref(false);
  const saveType = ref('add');
  const page = reactive({
    current: 1,
    size: 20,
    total: 0,
    sortlist: ['modifyTime desc'],
  });
  const seacthContent = ref({
    userName: '',
  });

  getDCOptionTelephoneBooks();

  //页码改变
  function handlePageChange() {
    getDCOptionTelephoneBooks();
  }

  /**
   * 排序条件改变
   */
  function onSortChange({ field, order, sortList, column, property, $event }) {
    page.sortlist = [];
    sortList.forEach((item) => {
      var tempstr = item.field + ' ' + item.order;
      page.sortlist.push(tempstr);
    });
    getDCOptionTelephoneBooks();
  }

  function initPage() {
    page.current = 1;
    page.total = 0;
    getDCOptionTelephoneBooks();
  }

  /**
   * 获取排序条件
   */
  function getFullSort() {
    let fullsort = '';
    page.sortlist.forEach((item) => {
      fullsort += item + ',';
    });
    return fullsort.substring(0, fullsort.length - 1);
  }

  //显示表单
  function showFrom(row) {
    if (myCommon.isnull(row)) {
      saveType.value = 'add';
      isShowForm.value = true;
    } else {
      //编辑
      getDCOptionTelephoneBook(row.phoneId);
    }
  }

  //删除黑名单信息
  function remove(row) {
    Modal.confirm({
      maskClosable: true,
      title: '是否删除?',
      icon: createVNode(ExclamationCircleOutlined),
      content: '',
      onOk() {
        isRunGet.value = true;
        telephoneBookApi
          .DeleteDCOptionTelephoneBook(row.phoneId.toString())
          .then(() => {
            isRunGet.value = false;
            message.success('删除电话信息成功');
            getDCOptionTelephoneBooks();
          })
          .catch(() => {
            isRunGet.value = false;
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

  //获取电话
  function getDCOptionTelephoneBook(id) {
    isRunGet.value = true;
    telephoneBookApi
      .GetDCOptionTelephoneBook(id.toString())
      .then((data) => {
        isRunGet.value = false;
        if (data) {
          formData.value = data;
          saveType.value = 'edit';
          isShowForm.value = true;
        } else {
          message.error('获取电话信息失败');
        }
      })
      .catch(() => {
        isRunGet.value = false;
      });
  }

  //获取电话列表
  function getDCOptionTelephoneBooks() {
    loading.value = true;
    telephoneBookApi
      .GetDCOptionTelephoneBooks({
        ...seacthContent.value,
        execompleteBefore: () => {
          loading.value = false;
        },
        PageIndex: page.current,
        PageSize: page.size,
        fullSort: getFullSort(),
      })
      .then((data) => {
        tableConfig.data = data.source;
        page.total = data.totalCount;
        page.current = data.pageIndex;
      });
  }

  //新增和编辑
  function saveFrom() {
    formRef.value.validate().then(() => {
      fromSpinning.value = true;
      formData.value.execompleteBefore = () => {
        fromSpinning.value = false;
      };
      if (saveType.value == 'add') {
        telephoneBookApi.AddDCOptionTelephoneBook(formData.value).then((data) => {
          tableConfig.data?.splice(0, 0, data);
          formClose();
          message.success('新增电话成功');
          page.total = page.total + 1;
        });
      } else {
        telephoneBookApi.UpdateDCOptionTelephoneBook(formData.value).then((data) => {
          const oldData = tableRef.value.getRowById(data.phoneId);
          delete formData.value.createUser;
          myCommon.objectReplace(oldData, formData.value);
          oldData.modifyTime = data.modifyTime;
          oldData.modifyUser = data.modifyUser;
          formClose();
          message.success('更新电话信息成功');
        });
      }
    });
  }
</script>
<style lang="less" scoped>
  @prefixCls: ~'@{namespace}-DCOptionTelephoneBook-';

  .fanZhun {
    display: inline-block;
    transform: rotateX(180deg);
  }
</style>
