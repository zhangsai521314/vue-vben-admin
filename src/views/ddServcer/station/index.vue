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
                    placeholder="输入车站名称查询"
                  />
                  <a-button @click="initPage" type="primary">查询</a-button>
                </a-space>
              </AuthDom>
              <AuthDom auth="ddServcer_station_add">
                <a-button class="ant-btn" @click="showFrom(null)">新增车站</a-button>
              </AuthDom>
              <AuthDom auth="ddServcer_station_pusMq">
                <a-spin :spinning="isRunMushMq" title="命令发送中">
                  <a-button class="ant-btn" @click="pushMq()">同步命令</a-button>
                </a-spin>
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
              show-search
              :filter-option="AntVueCommon.filterOption"
              :options="lineDatas"
              :allowClear="true"
            />
          </a-form-item>
          <a-form-item
            label="车站名称"
            name="name"
            :rules="[
              { required: true, message: '' },
              { max: 40, message: '车站名称过长' },
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
            name="longitude"
            label="经度"
            :rules="[
              { required: true, message: '请输入经度' },
              {
                validator: formValidator.longitude,
                message: '经度范围是-180至180，不超过10位小数',
              },
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
              { required: true, message: '请输入纬度' },
              { validator: formValidator.latitude },
            ]"
          >
            <a-input
              style="width: 262px"
              placeholder="请输入纬度"
              v-model:value="formData.latitude"
              autocomplete="off"
            />
          </a-form-item>
          <a-form-item label="上一车站" name="prevStationId">
            <a-select
              v-model:value="formData.prevStationId"
              show-search
              :filter-option="AntVueCommon.filterOption"
              :options="stationDatas.filter((m) => m.key != formData.nextStationId)"
              :allowClear="true"
              placeholder="请选择上一车站"
            />
          </a-form-item>
          <a-form-item label="下一车站" name="nextStationId">
            <a-select
              v-model:value="formData.nextStationId"
              show-search
              :filter-option="AntVueCommon.filterOption"
              :options="stationDatas.filter((m) => m.key != formData.prevStationId)"
              :allowClear="true"
              placeholder="请选择下一车站"
            />
          </a-form-item>
          <a-form-item
            name="startGlb"
            label="起始公里标(米)"
            :rules="[
              {
                validator: formValidator.min,
                min: -9999999,
                message: '起始公里标-9999999至9999999',
              },
              {
                validator: formValidator.max,
                max: 9999999,
                message: '起始公里标-9999999至9999999',
              },
            ]"
          >
            <a-input-number
              :precision="0"
              placeholder="请输入起始公里标"
              v-model:value="formData.startGlb"
              autocomplete="off"
            />
          </a-form-item>
          <a-form-item
            name="endGlb"
            label="终止公里标(米)"
            :rules="[
              {
                validator: formValidator.min,
                min: -9999999,
                message: '终止公里标-9999999至9999999',
              },
              {
                validator: formValidator.max,
                max: 9999999,
                message: '终止公里标-9999999至9999999',
              },
            ]"
          >
            <a-input-number
              :precision="0"
              placeholder="请输入终止公里标"
              v-model:value="formData.endGlb"
              autocomplete="off"
            />
          </a-form-item>
          <a-form-item
            v-if="saveType == 'edit'"
            :wrapper-col="{ span: 20, offset: 12 }"
            style="position: relative; height: 0"
          >
            <IconFontClass
              name="icon-baseui-zhankai"
              :title="isShowUpdate ? '修改二级信息' : '不修改二级信息'"
              @click="
                () => {
                  isShowUpdate = !isShowUpdate;
                }
              "
              style="position: absolute; top: -2px; left: 16%; cursor: pointer"
              :class="{
                fanZhun: isShowUpdate,
              }"
            />
          </a-form-item>
          <template v-if="isShowUpdate || saveType == 'add'">
            <a-form-item
              v-if="saveType == 'edit'"
              name="programUpdatePassWord"
              label="二级修改密码"
              :rules="[{ required: true, message: '修改信息请输入二级密码' }]"
            >
              <a-input
                placeholder="修改信息请输入二级密码"
                v-model:value="formData.programUpdatePassWord"
                autocomplete="off"
              />
            </a-form-item>
            <a-form-item
              label="车站代码"
              name="code"
              :rules="[
                { required: true, message: '' },
                { min: 1, message: '车站代码是1至5位' },
                { max: 5, message: '车站代码是1至5位' },
                { validator: formValidator.empty, message: '请输入车站代码' },
                { validator: formValidator.positiveInteger, message: '车站代码格式为自然数' },
              ]"
            >
              <a-input
                :disabled="myCommon.isnull(formData.programUpdatePassWord) && saveType == 'edit'"
                placeholder="请输入车站代码"
                v-model:value="formData.code"
                autocomplete="off"
              />
            </a-form-item>
            <a-form-item
              label="功能号"
              name="dcFn"
              :rules="[
                { required: true, message: '' },
                { min: 9, message: '功能号是9位' },
                { max: 9, message: '功能号是9位' },
                { validator: formValidator.empty, message: '请输入功能号' },
                { validator: formValidator.positiveInteger, message: '功能号格式为自然数' },
              ]"
            >
              <a-input
                :disabled="myCommon.isnull(formData.programUpdatePassWord) && saveType == 'edit'"
                placeholder="请输入车站代码"
                v-model:value="formData.dcFn"
                autocomplete="off"
              />
            </a-form-item>
            <a-form-item
              label="ISDN号"
              name="dcIsdn"
              :rules="[
                { required: true, message: '' },
                { min: 4, message: 'ISDN号是4位' },
                { max: 4, message: 'ISDN号是4位' },
                { validator: formValidator.empty, message: '请输入ISDN号' },
                { validator: formValidator.positiveInteger, message: 'ISDN号格式为自然数' },
              ]"
            >
              <a-input
                :disabled="myCommon.isnull(formData.programUpdatePassWord) && saveType == 'edit'"
                placeholder="请输入车站代码"
                v-model:value="formData.dcIsdn"
                autocomplete="off"
              />
            </a-form-item>
            <a-form-item
              name="groupCallNumber"
              label="站内组呼号码"
              :rules="[
                { required: true, message: '' },
                { min: 3, message: '站内组呼号码是3至10位' },
                { max: 10, message: '站内组呼号码是3至10位' },
                { validator: formValidator.positiveInteger, message: '站内组呼号码格式为自然数' },
                { validator: formValidator.empty, message: '请输入站内组呼号码' },
              ]"
            >
              <a-input
                :disabled="myCommon.isnull(formData.programUpdatePassWord) && saveType == 'edit'"
                placeholder="请输入站内组呼号码"
                v-model:value="formData.groupCallNumber"
                autocomplete="off"
              />
            </a-form-item>
            <a-form-item
              name="groupCallPriority"
              label="站内组呼优先级"
              :rules="[
                { required: true, message: '请输入站内组呼优先级' },
                { validator: formValidator.min, min: 1, message: '站内组呼优先级1至15' },
                { validator: formValidator.max, max: 15, message: '站内组呼优先级1至15' },
              ]"
            >
              <a-input-number
                :disabled="myCommon.isnull(formData.programUpdatePassWord) && saveType == 'edit'"
                placeholder="请输入站内组呼优先级"
                style="width: 262px"
                :precision="0"
                v-model:value="formData.groupCallPriority"
              />
            </a-form-item>
            <a-form-item
              name="tempCallNumber"
              label="邻站组呼号码"
              :rules="[
                { required: true, message: '' },
                { min: 3, message: '邻站组呼号码是3位至10位' },
                { max: 10, message: '邻站组呼号码是3位至10位' },
                { validator: formValidator.positiveInteger, message: '邻站组呼号码格式为自然数' },
                { validator: formValidator.empty, message: '请输入邻站组呼号码' },
              ]"
            >
              <a-input
                :disabled="myCommon.isnull(formData.programUpdatePassWord) && saveType == 'edit'"
                placeholder="请输入邻站组呼号码"
                v-model:value="formData.tempCallNumber"
                autocomplete="off"
              />
            </a-form-item>
            <a-form-item
              name="tempCallPriority"
              label="邻站组呼优先级"
              :rules="[
                { required: true, message: '请输入邻站组呼优先级' },
                { validator: formValidator.min, min: 1, message: '邻站组呼优先级1至15' },
                { validator: formValidator.max, max: 15, message: '邻站组呼优先级1至15' },
              ]"
            >
              <a-input-number
                :disabled="myCommon.isnull(formData.programUpdatePassWord) && saveType == 'edit'"
                placeholder="请输入邻站组呼优先级"
                style="width: 262px"
                :precision="0"
                v-model:value="formData.tempCallPriority"
              />
            </a-form-item>
          </template>
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
  import AntVueCommon from '@/utils/MyCommon/AntVueCommon';
  import myCommon from '@/utils/MyCommon/common';
  import formValidator from '@/utils/MyCommon/formValidator';
  import { ref, reactive, createVNode, nextTick, watch, unref } from 'vue';
  import { VxeGrid, VxeGridProps } from 'vxe-table';
  import { Line as lineApi, Station as stationApi } from '@/api/ddServcer';
  import commonApi from '@/api/common';
  import { message, Modal } from 'ant-design-vue';
  import { ExclamationCircleOutlined } from '@ant-design/icons-vue';
  import { useMqttStoreWithOut } from '@/store/modules/mqtt';

  defineOptions({ name: 'DDServcerStation' });
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
        title: '车站代码',
        showOverflow: true,
        showHeaderOverflow: true,
        sortable: true,
      },
      {
        field: 'dcFn',
        title: '功能号',
        showOverflow: true,
        showHeaderOverflow: true,
        sortable: true,
      },
      {
        field: 'dcIsdn',
        title: 'ISDN号',
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
        title: '站内组呼号码',
        showOverflow: true,
        showHeaderOverflow: true,
        sortable: true,
      },
      {
        field: 'groupCallPriority',
        title: '站内组呼优先级',
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
        title: '备注信息',
        showOverflow: true,
        showHeaderOverflow: true,
        visible: false,
        sortable: true,
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
    programUpdatePassWord: null,
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
    sortlist: ['stationId asc'],
  });
  const seacthContent = ref({
    name: '',
  });
  const lineDatas = ref([]);
  const stationDatas = ref([]);
  const isShowUpdate = ref(false);
  const isRunMushMq = ref(false);
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
    isShowUpdate.value = false;
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
        stationApi.AddDDServerStation(formData.value).then((data) => {
          data.lineName = lineDatas.value.find((m) => m.key == data.lineId).label;
          data.prevStationName = stationDatas.value.find((m) => m.key == data.prevStationId)?.label;
          data.nextStationName = stationDatas.value.find((m) => m.key == data.nextStationId)?.label;
          tableConfig.data?.splice(0, 0, data);
          formClose();
          message.success('新增线路成功');
          page.total = page.total + 1;
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
  //发送命令
  function pushMq() {
    isRunMushMq.value = true;
    commonApi.PushDDServerUpdateDBMq({
      MqInfo: JSON.stringify({
        Type: 2,
        ClientId: mqttStore.mqttClient.options.clientId,
      }),
      execompleteBefore: () => {
        isRunMushMq.value = false;
      },
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
