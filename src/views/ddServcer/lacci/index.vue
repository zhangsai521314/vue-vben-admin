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
        :seq-config="{ startIndex: (page.current - 1) * page.size }"
        :row-config="{ keyField: 'id' }"
        :column-config="{ resizable: true }"
        :custom-config="{ storage: true }"
        @sort-change="onSortChange"
      >
        <template #toolbar_buttons>
          <div :class="`tableBtn`">
            <a-space direction="horizontal" size="small" style="margin-left: 5px">
              <AuthDom auth="ddServcer_lacci_query">
                <a-space direction="horizontal" size="small" :wrap="true" style="margin-bottom: 0">
                  <div class="row-div">
                    <a-space direction="horizontal" size="small" :wrap="true">
                      <label>ECI名称：</label>
                      <a-input
                        @press-enter="getDDServerTLaccis"
                        v-model:value="seacthContent.name"
                        placeholder="输入ECI名称查询"
                      />
                    </a-space>
                  </div>
                  <div class="row-div">
                    <a-space direction="horizontal" size="small" :wrap="true">
                      <label>ECI：</label>
                      <a-input
                        @press-enter="initPage()"
                        v-model:value="seacthContent.lacci"
                        placeholder="输入ECI查询"
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
              <AuthDom auth="ddServcer_lacci_add">
                <a-space direction="horizontal" size="small" :wrap="true" style="margin-bottom: 0">
                  <div class="row-div">
                    <a-space direction="horizontal" size="small" :wrap="true">
                      <a-button class="ant-btn" @click="showFrom()">新增ECI</a-button>
                    </a-space>
                  </div>
                </a-space>
              </AuthDom>
              <AuthDom auth="ddServcer_lacci_pusMq">
                <a-space direction="horizontal" size="small" :wrap="true" style="margin-bottom: 0">
                  <div class="row-div">
                    <a-space direction="horizontal" size="small" :wrap="true">
                      <a-spin :spinning="isRunMushMq" title="命令发送中">
                        <a-button class="ant-btn" @click="pushMq()">同步命令</a-button>
                      </a-spin>
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
            <AuthDom auth="ddServcer_lacci_table_edit">
              <IconFontClass
                name="icon-baseui-edit-fill"
                @click="showFrom(row)"
                style="color: #0749df"
                title="编辑"
              />
            </AuthDom>
            <AuthDom auth="ddServcer_lacci_table_delete">
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
            label="名称"
            name="name"
            :rules="[
              { required: true, message: '' },
              { max: 40, message: 'ECI名称过长' },
              { validator: formValidator.empty, message: '请输入ECI名称' },
            ]"
          >
            <a-input placeholder="请输入ECI名称" v-model:value="formData.name" autocomplete="off" />
          </a-form-item>
          <a-form-item
            label="ECI"
            name="lacci"
            :rules="[
              { required: true, message: '' },
              { min: 4, message: 'ECI过短' },
              { max: 8, message: 'ECI过长' },
              { validator: formValidator.empty, message: '请输入ECI' },
            ]"
          >
            <a-input placeholder="请输入ECI" v-model:value="formData.lacci" autocomplete="off" />
          </a-form-item>
          <a-form-item
            name="longitude"
            label="经度"
            :rules="[
              { max: 16, message: '经度过长' },
              { validator: formValidator.longitude, message: '经度格式不正确' },
            ]"
          >
            <a-input
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
              { max: 16, message: '纬度过长' },
              { validator: formValidator.latitude, message: '纬度格式不正确' },
            ]"
          >
            <a-input
              style="width: 262px"
              placeholder="请输入纬度"
              v-model:value="formData.latitude"
              autocomplete="off"
            />
          </a-form-item>
          <a-form-item name="reamrk" label="备注" :rules="[{ max: 250, message: '备注过长' }]">
            <a-textarea
              placeholder="请输入备注"
              :rows="3"
              v-model:value="formData.reamrk"
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
  import { ref, reactive, createVNode, nextTick, watch, unref } from 'vue';
  import { VxeGrid, VxeGridProps } from 'vxe-table';
  import { Line as lineApi, Station as stationApi, Lacci as lacciApi } from '@/api/ddServcer';
  import commonApi from '@/api/common';
  import { useMqttStoreWithOut } from '@/store/modules/mqtt';
  import { message, Modal } from 'ant-design-vue';
  import { ExclamationCircleOutlined } from '@ant-design/icons-vue';

  defineOptions({ name: 'DDServcerLacci' });
  const mqttStore = useMqttStoreWithOut();
  const isRunGet = ref(false);
  const loading = ref(true);
  const tableConfig = reactive<VxeGridProps>({
    height: 'auto',
    columns: [
      //基础
      { type: 'seq', title: '序号', width: 50, fixed: 'left' },
      {
        field: 'id',
        title: '记录ID',
        visible: false,
        showHeaderOverflow: true,
        fixed: 'left',
      },
      {
        field: 'name',
        title: 'ECI名称',
        showOverflow: true,
        showHeaderOverflow: true,
        sortable: true,
      },
      {
        field: 'lacci',
        title: 'ECI',
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
      },

      {
        field: 'latitude',
        title: '纬度',
        showOverflow: true,
        showHeaderOverflow: true,
        sortable: true,
      },
      {
        field: 'reamrk',
        title: '备注信息',
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
    lineId: null,
    stationId: null,
    reamrk: null,
    name: null,
    lacci: null,
    latitude: null,
    longitude: null,
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
    lacci: '',
  });
  const isRunMushMq = ref(false);
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
    if (myCommon.isnull(row)) {
      saveType.value = 'add';
      isShowForm.value = true;
    } else {
      //编辑
      getDDServerTLacci(row.id);
    }
  }

  //删除ECI信息
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
            message.success('删除ECI信息成功');
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

  //获取ECI
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
          message.error('获取ECI信息失败');
        }
      })
      .catch(() => {
        isRunGet.value = false;
      });
  }

  //获取ECI列表
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
        page.current = data.pageIndex;
      });
  }

  function initPage() {
    page.current = 1;
    page.total = 0;
    getDDServerTLaccis();
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
          tableConfig.data?.splice(0, 0, data);
          formClose();
          message.success('新增ECI成功');
          page.total = page.total + 1;
        });
      } else {
        lacciApi.UpdateDDServerTLacci(formData.value).then((data) => {
          const oldData = tableRef.value.getRowById(data.id);
          myCommon.objectReplace(oldData, formData.value);
          formClose();
          message.success('更新ECI信息成功');
        });
      }
    });
  }

  //发送命令
  function pushMq() {
    isRunMushMq.value = true;
    commonApi.PushDDServerUpdateDBMq({
      MqInfo: JSON.stringify({
        Type: 3,
        ClientId: mqttStore.mqttClient.options.clientId,
      }),
      execompleteBefore: () => {
        isRunMushMq.value = false;
      },
    });
  }
</script>
<style lang="less" scoped>
  @prefixCls: ~'@{namespace}-DDServcerLacci-';

  .fanZhun {
    display: inline-block;
    transform: rotateX(180deg);
  }
</style>
