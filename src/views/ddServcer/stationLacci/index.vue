<template>
  <MyContent>
    <a-spin :spinning="isRunGet" title="正在执行...">
      <!-- 开启多字段排序 -->
      <!-- :sort-config="{ multiple: true }" -->
      <vxe-grid
        :scroll-y="{ enabled: true }"
        v-bind="tableConfig"
        id="mytable"
        :auto-resize="true"
        ref="tableRef"
        :loading="loading"
        :seq-config="{ startIndex: (page.current - 1) * page.size }"
        :row-config="{ keyField: 'longId' }"
        :column-config="{ resizable: true }"
        :custom-config="{ storage: true }"
        @sort-change="onSortChange"
      >
        <template #toolbar_buttons>
          <div :class="`tableBtn`">
            <a-space direction="horizontal" size="small" style="margin-left: 5px">
              <AuthDom auth="ddServcer_stationLacci_query">
                <a-space direction="horizontal" size="small" :wrap="true" style="margin-bottom: 0">
                  <div class="row-div">
                    <a-space direction="horizontal" size="small" :wrap="true">
                      <label>车站名称：</label>
                      <a-select
                        placeholder="请选择车站名称"
                        style="width: 170px"
                        allow-clear
                        show-search
                        :filter-option="AntVueCommon.filterOption"
                        v-model:value="seacthContent.stationId"
                        :options="stationDatas"
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
              <AuthDom auth="ddServcer_stationLacci_add">
                <a-space direction="horizontal" size="small" :wrap="true" style="margin-bottom: 0">
                  <div class="row-div">
                    <a-space direction="horizontal" size="small" :wrap="true">
                      <a-button class="ant-btn" @click="showFrom()">新增车站ECI关系</a-button>
                    </a-space>
                  </div>
                </a-space>
              </AuthDom>
              <AuthDom auth="ddServcer_stationLacci_pusMq">
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
            <AuthDom auth="ddServcer_stationLacci_table_edit">
              <IconFontClass
                name="icon-baseui-edit-fill"
                @click="showFrom(row)"
                style="color: #0749df"
                title="编辑"
              />
            </AuthDom>
            <AuthDom auth="ddServcer_stationLacci_table_delete">
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
              :disabled="saveType != 'add'"
              v-model:value="formData.lineId"
              show-search
              :filter-option="AntVueCommon.filterOption"
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
              :disabled="saveType != 'add'"
              v-model:value="formData.stationId"
              :options="stationDatas.filter((m) => m.lineId == formData.lineId)"
              :allowClear="true"
              placeholder="请选择所属车站"
              show-search
              :filter-option="AntVueCommon.filterOption"
            />
          </a-form-item>
          <a-form-item
            :rules="[{ required: true, message: '请选择关系类型' }]"
            label="关系类型"
            name="type"
          >
            <a-select
              v-model:value="formData.type"
              :disabled="saveType != 'add'"
              placeholder="请选择关系类型"
            >
              <a-select-option :value="1">站内</a-select-option>
              <a-select-option :value="2">本站左侧</a-select-option>
              <a-select-option :value="3">本站右侧</a-select-option>
            </a-select>
          </a-form-item>
          <a-form-item
            :rules="[{ required: true, message: '请选择ECI名称集合' }]"
            label="ECI名称集合"
            name="lacciIds"
          >
            <a-select
              mode="multiple"
              v-model:value="formData.lacciIds"
              :options="lacciDatas"
              :allowClear="true"
              show-search
              :filter-option="AntVueCommon.filterOption"
              placeholder="请选择ECI名称集合"
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
  import AntVueCommon from '@/utils/MyCommon/AntVueCommon';
  import myCommon from '@/utils/MyCommon/common';
  import { ref, reactive, createVNode, nextTick, watch, unref } from 'vue';
  import { VxeGrid, VxeGridProps } from 'vxe-table';
  import commonApi from '@/api/common';
  import { useMqttStoreWithOut } from '@/store/modules/mqtt';
  import {
    Line as lineApi,
    Station as stationApi,
    Lacci as lacciApi,
    StationLacci as stationLacciApi,
  } from '@/api/ddServcer';
  import { message, Modal } from 'ant-design-vue';
  import { ExclamationCircleOutlined } from '@ant-design/icons-vue';

  defineOptions({ name: 'DDServcerStationLacci' });
  const mqttStore = useMqttStoreWithOut();
  const isRunGet = ref(false);
  const loading = ref(true);
  const tableConfig = reactive<VxeGridProps>({
    height: 'auto',
    columns: [
      //基础
      { type: 'seq', title: '序号', minWidth: 70, fixed: 'left' },
      {
        field: 'lineName',
        title: '线路名称',
        showOverflow: true,
        showHeaderOverflow: true,
        sortable: true,
        visible: false,
        minWidth: 200,
        fixed: 'left',
      },
      {
        field: 'stationName',
        title: '车站名称',
        showOverflow: true,
        showHeaderOverflow: true,
        sortable: false,
        minWidth: 200,
        fixed: 'left',
      },
      {
        field: 'typeName',
        title: '管辖区间',
        showOverflow: true,
        showHeaderOverflow: true,
        sortable: false,
        minWidth: 100,
      },
      {
        field: 'lacciNames',
        title: 'ECI名称集合',
        showOverflow: true,
        showHeaderOverflow: true,
        minWidth: 200,
      },
      {
        field: 'laccis',
        title: 'ECI集合',
        showOverflow: true,
        showHeaderOverflow: true,
        minWidth: 200,
      },
      {
        title: '操作',
        width: 90,
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
    type: null,
    lacciIds: [],
    longId: null,
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
    sortlist: ['indexOrder asc', 'typeOrder asc'],
  });
  const seacthContent = ref({
    lacci: '',
    stationId: null,
  });
  const lacciDatas = ref([]);
  const lineDatas = ref([]);
  const stationDatas = ref([]);
  const isRunMushMq = ref(false);
  getDDServerTLacciSimple();
  getDDServerStationTLaccis();

  //页码改变
  function handlePageChange() {
    getDDServerStationTLaccis();
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
    getDDServerStationTLaccis();
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

  function initPage() {
    page.current = 1;
    page.total = 0;
    getDDServerStationTLaccis();
  }

  //显示表单
  function showFrom(row) {
    getDDServerTLacciSimple();
    getDDServerLineSimple();
    getDDServerLacciNoStationSimple();
    if (myCommon.isnull(row)) {
      saveType.value = 'add';
      isShowForm.value = true;
    } else {
      //编辑
      getDDServerStationTLacci(row);
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
        stationLacciApi
          .DeleteDDServerStationLacci({ StationId: row.stationId, Type: row.type })
          .then(() => {
            isRunGet.value = false;
            message.success('删除ECI信息成功');
            getDDServerStationTLaccis();
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
  function getDDServerStationTLacci(row) {
    isRunGet.value = true;
    stationLacciApi
      .GetDDServerStationLacci({ StationId: row.stationId, Type: row.type })
      .then((data) => {
        isRunGet.value = false;
        if (data) {
          data.lacciIds = data.lacciIds.split(',');
          formData.value = data;
          formData.value.longId = row.longId;
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
  function getDDServerStationTLaccis() {
    loading.value = true;
    stationLacciApi
      .GetDDServerStationLaccis({
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
        stationLacciApi.AUDDServerStationLacci(formData.value).then((data) => {
          formClose();
          message.success('新增ECI成功');
          getDDServerStationTLaccis();
          page.total = page.total + 1;
        });
      } else {
        stationLacciApi.AUDDServerStationLacci(formData.value).then((data) => {
          formClose();
          message.success('更新ECI信息成功');
          getDDServerStationTLaccis();
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

  function getDDServerLacciNoStationSimple() {
    lacciApi.GetDDServerLacciNoStationSimple().then((data) => {
      lacciDatas.value = data;
    });
  }

  function changeLine() {
    formData.value.stationId = null;
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
