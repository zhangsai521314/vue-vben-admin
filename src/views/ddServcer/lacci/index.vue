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
            <a-space
              direction="horizontal"
              size="small"
              style="line-height: 50px; margin-left: 5px"
            >
              <AuthDom auth="line_query">
                <a-space direction="horizontal" size="small">
                  <a-input
                    @press-enter="getDDServerTLaccis"
                    v-model:value="seacthContent.name"
                    placeholder="输入车站查询"
                  />
                  <a-button @click="getDDServerTLaccis" type="primary">查询</a-button>
                </a-space>
              </AuthDom>
              <AuthDom auth="line_add">
                <a-button class="ant-btn" @click="showFrom()">新增小区</a-button>
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
            <AuthDom auth="line_table_edit">
              <IconFontClass
                name="icon-baseui-edit-fill"
                @click="showFrom(row)"
                style="color: #0749df"
                title="编辑"
              />
            </AuthDom>
            <AuthDom auth="line_table_delete">
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
          :label-col="{ span: 8 }"
          :style="{ paddingRight: '2px' }"
          :wrapper-col="{ span: 14 }"
          autocomplete="off"
          ref="formRef"
          :model="formData"
        >
          <a-form-item
            :rules="[{ required: true, message: '请选择所属线路' }]"
            label="所属线路"
            name="lineId"
          >
            <a-select
              v-model:value="formData.lineId"
              :options="lineDatas"
              :allowClear="true"
              @change="changeLine()"
              placeholder="请选择所属线路"
            />
          </a-form-item>
          <a-form-item
            :rules="[{ required: true, message: '请选择所属车站' }]"
            label="所属车站"
            name="stationId"
          >
            <a-select
              v-model:value="formData.stationId"
              :options="stationDatas.filter((m) => m.lineId == formData.lineId)"
              :allowClear="true"
              placeholder="请选择所属车站"
            />
          </a-form-item>
          <a-form-item
            label="小区名称"
            name="name"
            :rules="[
              { required: true, message: '' },
              { max: 50, message: '小区名称过长' },
              { validator: formValidator.empty, message: '请输入小区名称' },
            ]"
          >
            <a-input
              placeholder="请输入小区名称"
              v-model:value="formData.name"
              autocomplete="off"
            />
          </a-form-item>
          <a-form-item
            label="lacci"
            name="lacci"
            :rules="[
              { required: true, message: '' },
              { max: 50, message: 'lacci过长' },
              { validator: formValidator.empty, message: '请输入lacci' },
            ]"
          >
            <a-input placeholder="请输入lacci" v-model:value="formData.lacci" autocomplete="off" />
          </a-form-item>
          <a-form-item
            name="longitude"
            label="经度"
            :rules="[
              { required: true, message: '' },
              { validator: formValidator.empty, message: '请输入经度' },
            ]"
          >
            <a-input-number
              style="width: 262px"
              placeholder="请输入经度"
              v-model:value="formData.longitude"
              autocomplete="off"
            />
          </a-form-item>
          <a-form-item
            name="latitude"
            label="纬度"
            :rules="[
              { required: true, message: '' },
              { validator: formValidator.empty, message: '请输入纬度' },
            ]"
          >
            <a-input-number
              style="width: 262px"
              placeholder="请输入纬度"
              v-model:value="formData.latitude"
              autocomplete="off"
            />
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
<script setup lang="tsx">
  import myCommon from '@/utils/MyCommon/common';
  import formValidator from '@/utils/MyCommon/formValidator';
  import { ref, reactive, createVNode, nextTick, watch, unref } from 'vue';
  import { VxeGrid, VxeGridProps } from 'vxe-table';
  import { Line as lineApi } from '@/api/ddServcer';
  import { Station as stationApi } from '@/api/ddServcer';
  import { Lacci as lacciApi } from '@/api/ddServcer';
  import { message, Modal } from 'ant-design-vue';
  import { ExclamationCircleOutlined } from '@ant-design/icons-vue';

  defineOptions({ name: 'DDServcerLacci' });
  const isRunGet = ref(false);
  const loading = ref(true);
  const tableConfig = reactive<VxeGridProps>({
    height: 'auto',
    columns: [
      //基础
      {
        field: 'id',
        title: '小区id',
        visible: false,
        showHeaderOverflow: true,
        fixed: 'left',
      },
      {
        field: 'lineName',
        title: '线路名称',
        showOverflow: true,
        showHeaderOverflow: true,
        sortable: true,
      },
      {
        field: 'stationName',
        title: '车站名称',
        showOverflow: true,
        showHeaderOverflow: true,
        sortable: true,
      },
      {
        field: 'name',
        title: '小区名称',
        showOverflow: true,
        showHeaderOverflow: true,
        sortable: true,
      },
      {
        field: 'lacci',
        title: 'lacci',
        showOverflow: true,
        showHeaderOverflow: true,
        sortable: true,
      },
      {
        field: 'longitude',
        title: '经度',
        showOverflow: true,
        showHeaderOverflow: true,
        sortable: true,
        visible: false,
      },

      {
        field: 'latitude',
        title: '纬度',
        showOverflow: true,
        showHeaderOverflow: true,
        sortable: true,
        visible: false,
      },
      {
        field: 'remark',
        title: '备注',
        showOverflow: true,
        showHeaderOverflow: true,
        visible: false,
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
    lineId: null,
    stationId: null,
    remark: null,
    name: null,
    lacci: null,
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
    sortlist: ['lineName asc', 'lineName asc'],
  });
  const seacthContent = ref({
    name: '',
  });
  const lineDatas = ref([]);
  const stationDatas = ref([]);

  getDDServerTLaccis();

  //页码改变
  function handlePageChange() {
    getDDServerTLaccis();
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
    getDDServerTLaccis();
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
    getDDServerTLacciSimple();
    getDDServerLineSimple();
    if (myCommon.isnull(row)) {
      saveType.value = 'add';
      isShowForm.value = true;
    } else {
      //编辑
      getDDServerTLacci(row.id);
    }
  }

  //删除小区信息
  function remove(row) {
    Modal.confirm({
      maskClosable: true,
      title: '是否删除?',
      icon: createVNode(ExclamationCircleOutlined),
      content: '',
      onOk() {
        isRunGet.value = true;
        lacciApi
          .DeleteDDServerTLacci(row.id.toString())
          .then(() => {
            isRunGet.value = false;
            message.success('删除小区信息成功');
            getDDServerTLaccis();
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

  //获取小区
  function getDDServerTLacci(id) {
    isRunGet.value = true;
    lacciApi
      .GetDDServerTLacci(id.toString())
      .then((data) => {
        isRunGet.value = false;
        if (data) {
          formData.value = data;
          saveType.value = 'edit';
          isShowForm.value = true;
        } else {
          message.error('获取小区信息失败');
        }
      })
      .catch(() => {
        isRunGet.value = false;
      });
  }

  //获取小区列表
  function getDDServerTLaccis() {
    loading.value = true;
    lacciApi
      .GetDDServerTLaccis({
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
        lacciApi.AddDDServerTLacci(formData.value).then((data) => {
          data.lineName = lineDatas.value.find((m) => m.key == formData.value.lineId)?.label;
          data.stationName = stationDatas.value.find(
            (m) => m.key == formData.value.stationId,
          )?.label;
          tableRef.value.insert(data);
          formClose();
          message.success('新增小区成功');
        });
      } else {
        lacciApi.UpdateDDServerTLacci(formData.value).then((data) => {
          const oldData = tableRef.value.getRowById(data.id);
          myCommon.objectReplace(oldData, formData.value);
          oldData.lineName = lineDatas.value.find((m) => m.key == formData.value.lineId)?.label;
          oldData.stationName = stationDatas.value.find(
            (m) => m.key == formData.value.stationId,
          )?.label;
          formClose();
          message.success('更新小区信息成功');
        });
      }
    });
  }

  function getDDServerTLacciSimple() {
    stationApi.GetDDServerStationSimple().then((data) => {
      stationDatas.value = data;
    });
  }

  function getDDServerLineSimple() {
    lineApi.GetDDServerLineSimple().then((data) => {
      lineDatas.value = data;
    });
  }

  function changeLine() {
    formData.value.stationId = null;
  }
</script>
<style lang="less" scoped>
  @prefixCls: ~'@{namespace}-DDServcerLacci-';

  .fanZhun {
    transform: rotateX(180deg);
    display: inline-block;
  }
</style>
