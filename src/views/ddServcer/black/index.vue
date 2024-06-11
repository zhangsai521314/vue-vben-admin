<template>
  <MyContent>
    <a-spin :spinning="isRunGet" title="正在执行...">
      <!-- 开启多字段排序 -->
      <!-- :sort-config="{ multiple: true }" -->
      <vxe-grid
        v-bind="tableConfig"
        id="mytable"
        ref="tableRef"
        :loading="loading"
        :row-config="{ keyField: 'id' }"
        :column-config="{ resizable: true }"
        :custom-config="{ storage: true }"
        @sort-change="onSortChange"
      >
        <template #toolbar_buttons>
          <div :class="`tableBtn`">
            <a-space direction="horizontal" size="small" style="margin-left: 5px">
              <AuthDom auth="ddServcer_black_query">
                <a-space direction="horizontal" size="small" :wrap="true" style="margin-bottom: 0">
                  <div class="row-div">
                    <a-space direction="horizontal" size="small" :wrap="true">
                      <label>IP：</label>
                      <a-input
                        @press-enter="initPage"
                        v-model:value="seacthContent.ip"
                        placeholder="输入IP查询"
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
              <AuthDom auth="ddServcer_black_add">
                <a-space direction="horizontal" size="small" :wrap="true" style="margin-bottom: 0">
                  <div class="row-div">
                    <a-space direction="horizontal" size="small" :wrap="true">
                      <a-button class="ant-btn" @click="showFrom()">新增黑名单</a-button>
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
            <AuthDom auth="ddServcer_black_table_edit">
              <IconFontClass
                name="icon-baseui-edit-fill"
                @click="showFrom(row)"
                style="color: #0749df"
                title="编辑"
              />
            </AuthDom>
            <AuthDom auth="ddServcer_black_table_delete">
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
            label="IP"
            name="ip"
            :rules="[
              { required: true, message: '' },
              { validator: formValidator.ip, message: 'IP地址不正确' },
              { validator: formValidator.empty, message: '请输入IP' },
            ]"
          >
            <a-input placeholder="请输入黑名单IP" v-model:value="formData.ip" autocomplete="off" />
          </a-form-item>
          <a-form-item name="remark" label="备注" :rules="[{ max: 250, message: '备注过长' }]">
            <a-textarea
              placeholder="请输入备注"
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
    </a-spin>
  </MyContent>
</template>
<script setup lang="ts">
  import myCommon from '@/utils/MyCommon/common';
  import formValidator from '@/utils/MyCommon/formValidator';
  import { ref, reactive, createVNode, nextTick, watch } from 'vue';
  import { VxeGrid, VxeGridProps } from 'vxe-table';
  import { Black as blackApi } from '@/api/ddServcer';
  import { message, Modal } from 'ant-design-vue';
  import { ExclamationCircleOutlined } from '@ant-design/icons-vue';

  defineOptions({ name: 'DDServcerBlack' });
  const isRunGet = ref(false);
  const loading = ref(true);
  const tableConfig = reactive<VxeGridProps>({
    height: 'auto',
    columns: [
      //基础
      { type: 'seq', title: '序号', width: 50, fixed: 'left' },
      {
        field: 'id',
        title: '黑名单ID',
        visible: false,
        showHeaderOverflow: true,
        fixed: 'left',
      },
      {
        field: 'ip',
        title: 'IP',
        showOverflow: true,
        showHeaderOverflow: true,
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
        field: 'updateTime',
        title: '更新时间',
        width: 150,
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
    remark: '',
    ip: null,
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
    sortlist: ['updateTime desc'],
  });
  const seacthContent = ref({
    ip: '',
  });

  getDDServerBlacks();

  //页码改变
  function handlePageChange() {
    getDDServerBlacks();
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
    getDDServerBlacks();
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
      formData.value = _.cloneDeep(defFromData);
      saveType.value = 'add';
      isShowForm.value = true;
    } else {
      //编辑
      getDDServerBlack(row.id);
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
        blackApi
          .DeleteDDServerBlack(row.id.toString())
          .then(() => {
            isRunGet.value = false;
            message.success('删除黑名单信息成功');
            getDDServerBlacks();
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
    formRef.value.clearValidate();
  }

  //获取黑名单
  function getDDServerBlack(id) {
    isRunGet.value = true;
    blackApi
      .GetDDServerBlack(id.toString())
      .then((data) => {
        isRunGet.value = false;
        if (data) {
          formData.value = data;
          saveType.value = 'edit';
          isShowForm.value = true;
        } else {
          message.error('获取黑名单信息失败');
        }
      })
      .catch(() => {
        isRunGet.value = false;
      });
  }

  //获取黑名单列表
  function getDDServerBlacks() {
    loading.value = true;
    blackApi
      .GetDDServerBlacks({
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
        blackApi.AddDDServerBlack(formData.value).then((data) => {
          tableConfig.data?.splice(0, 0, data);
          formClose();
          message.success('新增黑名单成功');
          page.total = page.total + 1;
        });
      } else {
        blackApi.UpdateDDServerBlack(formData.value).then((data) => {
          const oldData = tableRef.value.getRowById(data.id);
          myCommon.objectReplace(oldData, formData.value);
          oldData.updateTime = data.updateTime;
          formClose();
          message.success('更新黑名单信息成功');
        });
      }
    });
  }

  function initPage() {
    page.current = 1;
    page.total = 0;
    getDDServerBlacks();
  }
</script>
<style lang="less" scoped>
  @prefixCls: ~'@{namespace}-ddServcerblack-';

  .fanZhun {
    display: inline-block;
    transform: rotateX(180deg);
  }
</style>
