<template>
  <MyContent>
    <vxe-grid
      :scroll-y="{ enabled: true }"
      v-bind="tableConfig"
      id="handLog"
      :auto-resize="true"
      ref="tableRef"
      :loading="loading"
      :seq-config="{ startIndex: (page.current - 1) * page.size }"
      :row-config="{ keyField: 'handId' }"
      :column-config="{ resizable: true }"
      :custom-config="{ storage: true }"
      @sort-change="onSortChange"
    >
      <template #toolbar_buttons>
        <div :class="`tableBtn`">
          <a-space direction="horizontal" size="small" style="margin-left: 5px">
            <AuthDom auth="ddServcer_dcStatus_query">
              <a-space direction="horizontal" size="small" :wrap="true" style="margin-bottom: 0">
                <div class="row-div">
                  <a-space direction="horizontal" size="small" :wrap="true">
                    <label>心跳时间：</label>
                    <a-config-provider :locale="zhCN">
                      <a-range-picker
                        :allowClear="false"
                        v-model:value="timeValue"
                        :showTime="true"
                        format="YYYY-MM-DD HH:mm:ss"
                      />
                    </a-config-provider>
                  </a-space>
                </div>
                <div class="row-div">
                  <a-space direction="horizontal" size="small" :wrap="true">
                    <label>ISDN：</label>
                    <a-input
                      @press-enter="initPage()"
                      v-model:value="seacthContent.handIsdn"
                      placeholder="输入ISDN号查询"
                    />
                  </a-space>
                </div>
                <div class="row-div">
                  <a-space direction="horizontal" size="small" :wrap="true">
                    <label>车站名称：</label>
                    <a-tree-select
                      v-model:value="seacthContent.stationCode"
                      show-search
                      style="width: 220px"
                      :dropdown-style="{ maxHeight: '400px', overflow: 'auto' }"
                      placeholder="请选择车站名称"
                      allow-clear
                      show-arrow
                      :filterTreeNode="AntVueCommon.filterTreeNode"
                      :tree-data="stationDatas"
                    />
                  </a-space>
                </div>
                <div class="row-div">
                  <a-space direction="horizontal" size="small" :wrap="true">
                    <label>ECI：</label>
                    <a-input
                      @press-enter="initPage()"
                      v-model:value="seacthContent.eci"
                      placeholder="输入ECI号查询"
                    />
                  </a-space>
                </div>
                <div class="row-div">
                  <a-space direction="horizontal" size="small" :wrap="true">
                    <label>是否在线：</label>
                    <a-select
                      placeholder="请选择是否在线"
                      style="width: 170px"
                      allow-clear
                      v-model:value="seacthContent.isOnline"
                    >
                      <a-select-option :value="true">在线</a-select-option>
                      <a-select-option :value="false">离线</a-select-option>
                    </a-select>
                  </a-space>
                </div>
                <div class="row-div">
                  <a-space direction="horizontal" size="small" :wrap="true">
                    <a-button @click="initPage()" type="primary">查询</a-button>
                    <a-button @click="resetSeacth">重置表单</a-button>
                  </a-space>
                </div>
              </a-space>
            </AuthDom>
          </a-space>
        </div>
      </template>
      <template #default="{ row }">
        <div :class="`tableOption`">
          <AuthDom auth="softwareManage_table_showlog">
            <IconFontClass
              name="icon-baseui-flowcontrol-log"
              @click="showLog(row)"
              style="color: #0fc10e"
              title="查看日志"
            />
          </AuthDom>
          <AuthDom auth="roleManage_table_power">
            <IconFontClass
              name="icon-baseui-quanxianpeizhi"
              @click="formShow(row)"
              style="color: #0a61bd"
              title="分配权限"
            />
          </AuthDom>
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
          label="权限类型"
          name="powerKeys"
          :rules="[{ required: true, message: '请选择权限类型' }]"
        >
          <a-select
            show-search
            :allowClear="true"
            mode="multiple"
            :filter-option="AntVueCommon.filterOption"
            placeholder="请选择权限类型"
            v-model:value="formData.powerKeys"
            :options="dictionariesData"
          />
        </a-form-item>
      </a-form>
      <template #footer>
        <a-spin :spinning="fromSpinning">
          <a-button type="primary" @click="saveHandPower">保存</a-button>
          <a-button style="margin-left: 8px" @click="formClose">关闭</a-button>
        </a-spin>
      </template>
    </a-drawer>
    <a-drawer
      :headerStyle="{ height: '49px', borderBottom: '2px solid #eee' }"
      :width="600"
      :visible="isShowLog"
      title="日志查看"
      :footer-style="{ textAlign: 'right' }"
      @close="formCloseLog"
    >
      <log :handId="handId" />
    </a-drawer>
  </MyContent>
</template>
<script setup lang="ts">
  import AntVueCommon from '@/utils/MyCommon/AntVueCommon';
  import { ref, reactive } from 'vue';
  import { VxeGrid, VxeGridProps } from 'vxe-table';
  import handApi from '@/api/hand';
  import { message } from 'ant-design-vue';
  import log from './log.vue';
  import { useDesign } from '@/hooks/web/useDesign';
  import zhCN from 'ant-design-vue/es/locale/zh_CN';
  import dayjs from 'dayjs';
  import 'dayjs/locale/zh-cn';
  import dictionariesApi from '@/api/dictionaries';
  import { Station as stationApi } from '@/api/ddServcer';

  defineOptions({ name: 'Hand' });
  const { prefixCls } = useDesign('hand-');
  const loading = ref(true);
  const page = reactive({
    current: 1,
    size: 20,
    total: 0,
    sortlist: ['dataTime desc'],
  });
  const seacthContent = ref({
    stationCode: null,
    handIsdn: null,
    startTime: null,
    endTime: null,
    isOnline: null,
    eci: null,
  });
  const tableConfig = reactive<VxeGridProps>({
    height: 'auto',
    columns: [
      //基础
      { type: 'seq', title: '序号', minWidth: 50, fixed: 'left' },
      {
        field: 'handId',
        title: '记录ID',
        visible: false,
        showOverflow: true,
        showHeaderOverflow: true,
        minWidth: 130,
        fixed: 'left',
      },
      {
        field: 'handIsdn',
        title: 'ISDN',
        showOverflow: true,
        showHeaderOverflow: true,
        sortable: true,
        minWidth: 90,
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
        field: 'stationNameCn',
        title: '车站名称(中)',
        showOverflow: true,
        showHeaderOverflow: true,
        sortable: false,
        minWidth: 200,
        visible: false,
      },
      {
        field: 'stationNameEn',
        title: '车站名称(英)',
        showOverflow: true,
        showHeaderOverflow: true,
        sortable: false,
        minWidth: 200,
        visible: false,
      },
      {
        field: 'stationNameFr',
        title: '车站名称(法)',
        showOverflow: true,
        showHeaderOverflow: true,
        sortable: false,
        minWidth: 200,
        visible: false,
      },
      {
        field: 'stationXiaQu',
        title: '车站辖区',
        showOverflow: true,
        showHeaderOverflow: true,
        sortable: false,
        minWidth: 100,
      },
      {
        field: 'eci',
        title: 'ECI',
        showOverflow: true,
        showHeaderOverflow: true,
        sortable: true,
        minWidth: 100,
      },
      {
        field: 'dataTime',
        title: '心跳时间',
        minWidth: 150,
        showOverflow: true,
        sortable: true,
        showHeaderOverflow: true,
      },
      {
        field: 'isOnline',
        title: '是否在线',
        minWidth: 100,
        showOverflow: true,
        showHeaderOverflow: true,
        // sortable: true,
        cellRender: { name: 'render_isno' },
      },
      {
        field: 'isCoerceOut',
        title: '强制注销',
        minWidth: 100,
        showOverflow: true,
        showHeaderOverflow: true,
        // sortable: true,
        cellRender: { name: 'render_isno' },
      },
      {
        field: 'coerceOutTime',
        title: '强制注销时间',
        minWidth: 150,
        showOverflow: true,
        showHeaderOverflow: true,
        sortable: true,
        visible: false,
      },
      {
        field: 'runVersion',
        title: '正式版本',
        showOverflow: true,
        showHeaderOverflow: true,
        sortable: true,
        minWidth: 100,
      },
      {
        field: 'currentVersion',
        title: '终端版本',
        showOverflow: true,
        showHeaderOverflow: true,
        sortable: true,
        minWidth: 100,
      },
      {
        field: 'loginTime',
        title: '登录时间',
        minWidth: 150,
        showOverflow: true,
        showHeaderOverflow: true,
        sortable: true,
        visible: false,
      },
      {
        title: '操作',
        minWidth: 100,
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
    handId: null,
    powerKeys: [],
  });
  const handId = ref(null);
  const formData = ref(_.cloneDeep(defFromData));
  const formRef = ref(null);
  const tableRef = ref({});
  const isShowForm = ref(false);
  const fromSpinning = ref(false);
  const isShowLog = ref(false);
  const timeValue = ref([
    dayjs(dayjs().subtract(7, 'day').format('YYYY-MM-DD')),
    dayjs(dayjs().add(1, 'day').format('YYYY-MM-DD')),
  ]);
  const dictionariesData = ref([]);
  const stationDatas = ref([]);

  getHandList();
  getDicHandPower();
  getDDServerStationTreeCode();

  function showLog(row) {
    handId.value = row.handId;
    isShowLog.value = true;
  }
  function formCloseLog() {
    handId.value = null;
    isShowLog.value = false;
  }

  //显示表单
  function formShow(row) {
    formData.value = row;
    isShowForm.value = true;
    getHandPower(row);
  }

  //关闭表单
  function formClose() {
    isShowForm.value = false;
    formRef.value.clearValidate();
  }

  //页码改变
  function handlePageChange() {
    getHandList();
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
    getHandList();
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

  //获取手持台状态
  function getHandList() {
    loading.value = true;
    seacthContent.value.startTime =
      timeValue.value == null ? null : timeValue.value[0].format('YYYY-MM-DD HH:mm:ss');
    seacthContent.value.endTime =
      timeValue.value == null ? null : timeValue.value[1].format('YYYY-MM-DD HH:mm:ss');
    handApi
      .GetHandList({
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
      })
      .catch(() => {
        tableConfig.data = [];
        page.total = 0;
      });
  }

  //重置搜索条件
  function resetSeacth() {
    seacthContent.value = {
      stationCode: null,
      handIsdn: null,
      startTime: null,
      endTime: null,
      isOnline: null,
      eci: null,
    };
    timeValue.value = [
      dayjs(dayjs().subtract(7, 'day').format('YYYY-MM-DD')),
      dayjs(dayjs().add(1, 'day').format('YYYY-MM-DD')),
    ];
  }

  function initPage() {
    page.current = 1;
    page.total = 0;
    getHandList();
  }

  //获取手持台权限字典
  function getDicHandPower() {
    dictionariesApi
      .GetDictionariesSimpleKey({
        dictionariesclass: ['handPower'],
      })
      .then((data) => {
        dictionariesData.value = data;
      })
      .catch(() => {
        dictionariesData.value = [];
      });
  }

  //获取手持台权限
  function getHandPower(row) {
    handApi
      .GetHandPower(row.handId)
      .then((data) => {
        formData.value.powerKeys = data;
      })
      .catch(() => {
        formData.value.powerKeys = [];
      });
  }

  //保存手持台权限
  function saveHandPower() {
    formRef.value.validate().then(() => {
      fromSpinning.value = true;
      const execompleteBefore = () => {
        fromSpinning.value = false;
      };
      formData.value['execompleteBefore'] = execompleteBefore;
      handApi.SaveHandPower(formData.value).then((data) => {
        if (data) {
          formClose();
          message.success('保存权限成功');
        } else {
          message.error('保存权限失败');
        }
      });
    });
  }

  function getDDServerStationTreeCode() {
    stationApi.GetDDServerStationTreeCode().then((data) => {
      stationDatas.value = data;
    });
  }
</script>
<style lang="less" scoped>
  @prefixCls: ~'@{namespace}-hand-';

  .tableBtn {
    width: 100%;
  }

  :deep(.ant-upload-list-item-actions) {
    display: none;
  }
</style>
