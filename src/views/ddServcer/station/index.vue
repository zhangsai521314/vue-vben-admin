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
              style="margin-left: 5px; line-height: 50px"
            >
              <AuthDom auth="ddServcer_station_query">
                <a-space direction="horizontal" size="small">
                  <a-input
                    @press-enter="initPage"
                    v-model:value="seacthContent.name"
                    placeholder="输入车站查询"
                  />
                  <a-button @click="initPage" type="primary">查询</a-button>
                </a-space>
              </AuthDom>
              <AuthDom auth="ddServcer_station_add">
                <a-button class="ant-btn" @click="showFrom(null)">新增线路</a-button>
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
            <AuthDom auth="ddServcer_station_table_edit">
              <IconFontClass
                name="icon-baseui-edit-fill"
                @click="showFrom(row)"
                style="color: #0749df"
                title="编辑"
              />
            </AuthDom>
            <AuthDom auth="ddServcer_station_table_delete">
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
              placeholder="请选择所属线路"
              v-model:value="formData.lineId"
              :options="lineDatas"
              :allowClear="true"
            />
          </a-form-item>
          <a-form-item
            label="车站名称"
            name="name"
            :rules="[
              { required: true, message: '' },
              { max: 50, message: '车站名称过长' },
              { validator: formValidator.empty, message: '请输入车站名称' },
            ]"
          >
            <a-input
              placeholder="请输入车站名称"
              v-model:value="formData.name"
              autocomplete="off"
            />
          </a-form-item>
          <a-form-item
            label="车站号码"
            name="code"
            :rules="[
              { required: true, message: '' },
              { max: 50, message: '车站号码过长' },
              { validator: formValidator.empty, message: '请输入车站号码' },
            ]"
          >
            <a-input
              placeholder="请输入车站号码"
              v-model:value="formData.code"
              autocomplete="off"
            />
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
              min="-999999999"
              max="999999999"
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
              min="-999999999"
              max="999999999"
            />
          </a-form-item>
          <a-form-item label="上一车站" name="prevStationId">
            <a-select
              v-model:value="formData.prevStationId"
              :options="stationDatas.filter((m) => m.key != formData.nextStationId)"
              :allowClear="true"
              placeholder="请选择上一车站"
            />
          </a-form-item>
          <a-form-item label="下一车站" name="nextStationId">
            <a-select
              v-model:value="formData.nextStationId"
              :options="stationDatas.filter((m) => m.key != formData.prevStationId)"
              :allowClear="true"
              placeholder="请选择下一车站"
            />
          </a-form-item>
          <a-form-item
            name="groupCallNumber"
            label="全呼车站号码"
            :rules="[
              { required: true, message: '' },
              { max: 250, message: '全呼车站号码过长' },
              { validator: formValidator.positiveInteger, message: '全呼车站号码格式为自然数' },
              { validator: formValidator.empty, message: '请输入全呼车站号码' },
            ]"
          >
            <a-input
              placeholder="请输入全呼车站号码"
              v-model:value="formData.groupCallNumber"
              autocomplete="off"
            />
          </a-form-item>
          <a-form-item
            name="groupCallPriority"
            label="全呼车站优先级"
            :rules="[{ required: true, message: '请输入全呼车站优先级' }]"
          >
            <a-input-number
              placeholder="请输入全呼车站优先级"
              style="width: 262px"
              min="1"
              max="999999999"
              :precision="0"
              v-model:value="formData.groupCallPriority"
            />
          </a-form-item>
          <a-form-item
            name="tempCallNumber"
            label="邻站组呼号码"
            :rules="[
              { required: true, message: '' },
              { max: 250, message: '邻站组呼号码过长' },
              { validator: formValidator.positiveInteger, message: '邻站组呼号码格式为自然数' },
              { validator: formValidator.empty, message: '请输入邻站组呼号码' },
            ]"
          >
            <a-input
              placeholder="请输入邻站组呼号码"
              v-model:value="formData.tempCallNumber"
              autocomplete="off"
            />
          </a-form-item>
          <a-form-item
            name="tempCallPriority"
            label="邻站组呼优先级"
            :rules="[{ required: true, message: '请输入邻站组呼优先级' }]"
          >
            <a-input-number
              placeholder="请输入邻站组呼优先级"
              style="width: 262px"
              min="1"
              max="999999999"
              :precision="0"
              v-model:value="formData.tempCallPriority"
            />
          </a-form-item>

          <a-form-item name="startGlb" label="起始公里标">
            <a-input-number
              placeholder="请输入起始公里标"
              v-model:value="formData.startGlb"
              autocomplete="off"
            />
          </a-form-item>
          <a-form-item name="endGlb" label="终止公里标">
            <a-input-number
              placeholder="请输入终止公里标"
              v-model:value="formData.endGlb"
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
<script setup lang="ts">
  import myCommon from '@/utils/MyCommon/common';
  import formValidator from '@/utils/MyCommon/formValidator';
  import { ref, reactive, createVNode, nextTick, watch, unref } from 'vue';
  import { VxeGrid, VxeGridProps } from 'vxe-table';
  import { Line as lineApi, Station as stationApi } from '@/api/ddServcer';

  import { message, Modal } from 'ant-design-vue';
  import { ExclamationCircleOutlined } from '@ant-design/icons-vue';

  defineOptions({ name: 'DDServcerStation' });
  const isRunGet = ref(false);
  const loading = ref(true);
  const tableConfig = reactive<VxeGridProps>({
    height: 'auto',
    columns: [
      //基础
      { type: 'seq', title: '序号', width: 50, fixed: 'left' },
      {
        field: 'id',
        title: '车站ID',
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
        visible: false,
      },
      {
        field: 'name',
        title: '车站名称',
        showOverflow: true,
        showHeaderOverflow: true,
        sortable: true,
      },
      {
        field: 'code',
        title: '车站号码',
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
        field: 'prevStationName',
        title: '上一站',
        showOverflow: true,
        showHeaderOverflow: true,
        sortable: true,
      },
      {
        field: 'nextStationName',
        title: '下一站',
        showOverflow: true,
        showHeaderOverflow: true,
        sortable: true,
      },
      {
        field: 'groupCallNumber',
        title: '全呼车站号码',
        showOverflow: true,
        showHeaderOverflow: true,
        sortable: true,
      },
      {
        field: 'groupCallPriority',
        title: '全呼车站优先级',
        showOverflow: true,
        showHeaderOverflow: true,
        sortable: true,
      },
      {
        field: 'tempCallNumber',
        title: '邻站组呼号码',
        showOverflow: true,
        showHeaderOverflow: true,
        sortable: true,
      },
      {
        field: 'tempCallPriority',
        title: '邻站组呼优先级',
        showOverflow: true,
        showHeaderOverflow: true,
        sortable: true,
      },
      {
        field: 'startGlb',
        title: '起始公里标',
        showOverflow: true,
        showHeaderOverflow: true,
        sortable: true,
        visible: false,
      },
      {
        field: 'endGlb',
        title: '终止公里标',
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
        field: 'updateTime',
        title: '更新时间',
        showOverflow: true,
        showHeaderOverflow: true,
        sortable: true,
        width: 150,
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
    remark: null,
    name: null,
    code: null,
    dcFn: null,
    dcIsdn: null,
    groupAllCirNumber: null,
    groupAllCirPriority: null,
    groupAllDcNumber: null,
    groupAllDcPriority: null,
    groupAllBroadcastNumber: null,
    groupAllBroadcastPriority: null,
    startGlb: null,
    endGlb: null,
    tempCallPriority: null,
    tempCallNumber: null,
    groupCallPriority: null,
    groupCallNumber: null,
    prevStationId: null,
    nextStationId: null,
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
    sortlist: ['updateTime desc'],
  });
  const seacthContent = ref({
    name: '',
  });
  const lineDatas = ref([]);
  const stationDatas = ref([]);

  getDDServerStations();

  //页码改变
  function handlePageChange() {
    getDDServerStations();
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
    getDDServerStations();
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
    getDDServerStationSimple();
    getDDServerLineSimple();
    if (myCommon.isnull(row)) {
      saveType.value = 'add';
      isShowForm.value = true;
    } else {
      //编辑
      getDDServerStation(row.id);
    }
  }

  //删除线路信息
  function remove(row) {
    Modal.confirm({
      maskClosable: true,
      title: '是否删除?',
      icon: createVNode(ExclamationCircleOutlined),
      content: '',
      onOk() {
        isRunGet.value = true;
        stationApi
          .DeleteDDServerStation(row.id.toString())
          .then(() => {
            isRunGet.value = false;
            message.success('删除线路信息成功');
            getDDServerStations();
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

  //获取线路
  function getDDServerStation(id) {
    isRunGet.value = true;
    stationApi
      .GetDDServerStation(id.toString())
      .then((data) => {
        isRunGet.value = false;
        if (data) {
          formData.value = data;
          saveType.value = 'edit';
          isShowForm.value = true;
        } else {
          message.error('获取线路信息失败');
        }
      })
      .catch(() => {
        isRunGet.value = false;
      });
  }

  //获取线路列表
  function getDDServerStations() {
    loading.value = true;
    stationApi
      .GetDDServerStations({
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
        stationApi.AddDDServerStation(formData.value).then((data) => {
          data.lineName = lineDatas.value.find((m) => m.key == data.lineId).label;
          data.prevStationName = stationDatas.value.find((m) => m.key == data.prevStationId)?.label;
          data.nextStationName = stationDatas.value.find((m) => m.key == data.nextStationId)?.label;
          tableConfig.data?.splice(0, 0, data);
          formClose();
          message.success('新增线路成功');
        });
      } else {
        stationApi.UpdateDDServerStation(formData.value).then((data) => {
          const oldData = tableRef.value.getRowById(data.id);
          myCommon.objectReplace(oldData, formData.value);
          oldData.lineName = lineDatas.value.find((m) => m.key == formData.value.lineId).label;
          oldData.prevStationName = stationDatas.value.find(
            (m) => m.key == formData.value.prevStationId,
          )?.label;
          oldData.nextStationName = stationDatas.value.find(
            (m) => m.key == formData.value.nextStationId,
          )?.label;
          oldData.updateTime = data.updateTime;
          formClose();
          message.success('更新线路信息成功');
        });
      }
    });
  }

  function initPage() {
    page.current = 1;
    page.total = 0;
    getDDServerStations();
  }

  function getDDServerStationSimple() {
    stationApi.GetDDServerStationSimple().then((data) => {
      stationDatas.value = data;
    });
  }

  function getDDServerLineSimple() {
    lineApi.GetDDServerLineSimple().then((data) => {
      lineDatas.value = data;
    });
  }
</script>
<style lang="less" scoped>
  @prefixCls: ~'@{namespace}-DDServcerStation-';

  .fanZhun {
    display: inline-block;
    transform: rotateX(180deg);
  }
</style>
