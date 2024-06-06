<template>
  <MyContent>
    <vxe-grid
      v-bind="tableConfig"
      id="mytable"
      ref="tableRef"
      :loading="loading"
      :row-config="{ keyField: 'serviceId' }"
      :column-config="{ resizable: true }"
      :custom-config="{ storage: true }"
    >
      <template #toolbar_buttons>
        <div :class="`tableBtn`">
          <a-space direction="horizontal" size="small" style="margin-left: 5px">
            <AuthDom auth="softwareManage_query">
              <a-space direction="horizontal" size="small" :wrap="true" style="margin-bottom: 0">
                <div class="row-div">
                  <a-space direction="horizontal" size="small" :wrap="true">
                    <label>所属部门：</label>
                    <a-tree-select
                      v-model:value="seacthContent.orgId"
                      show-search
                      style="width: 170px"
                      :dropdown-style="{ maxHeight: '400px', overflow: 'auto' }"
                      placeholder="请选择用户部门"
                      allow-clear
                      show-arrow
                      :filterTreeNode="AntVueCommon.filterTreeNode"
                      :tree-data="organizationDatas"
                    />
                  </a-space>
                </div>
                <div class="row-div">
                  <a-space direction="horizontal" size="small" :wrap="true">
                    <label>软件名称：</label>
                    <a-input
                      @press-enter="getSoftwares()"
                      v-model:value="seacthContent.serviceName"
                      placeholder="输入软件名称查询"
                    />
                  </a-space>
                </div>
                <div class="row-div">
                  <a-space direction="horizontal" size="small" :wrap="true">
                    <a-button @click="getSoftwares()" type="primary">查询</a-button>
                    <a-button @click="resetSeacth">重置表单</a-button>
                    <a-radio-group v-model:value="refresh" button-style="solid">
                      <a-radio-button value="yes">开启自动刷新</a-radio-button>
                      <a-radio-button value="no">关闭自动刷新</a-radio-button>
                      <a-radio-button value="time" disabled>{{ refreshTime }}秒</a-radio-button>
                    </a-radio-group>
                  </a-space>
                </div>
              </a-space>
            </AuthDom>
            <AuthDom auth="softwareManage_add">
              <a-space direction="horizontal" size="small" :wrap="true" style="margin-bottom: 0">
                <div class="row-div">
                  <a-space direction="horizontal" size="small" :wrap="true">
                    <a-button class="ant-btn" @click="showFrom()">新增软件</a-button>
                  </a-space>
                </div>
              </a-space>
            </AuthDom>
          </a-space>
        </div>
      </template>
      <template #runStatus="{ row }">
        <span
          :style="{
            color:
              row.runStatus == '故障' || row.runStatus == '中断'
                ? 'red'
                : row.runStatus == '正常运行'
                  ? 'green'
                  : '',
          }"
        >
          {{ row.runStatus }}</span
        >
      </template>
      <template #default="{ row }">
        <div :class="`tableOption`">
          <AuthDom auth="softwareManage_table_showconfig">
            <IconFontClass
              name="icon-baseui-wenben1"
              @click="showConfig(row)"
              style="color: #0fc10e"
              title="查看配置"
            />
          </AuthDom>
          <AuthDom auth="softwareManage_table_showlog">
            <IconFontClass
              name="icon-baseui-flowcontrol-log"
              @click="showLog(row)"
              style="color: #0fc10e"
              title="查看日志"
            />
          </AuthDom>
          <AuthDom auth="softwareManage_table_edit">
            <IconFontClass
              name="icon-baseui-edit-fill"
              @click="showFrom(row)"
              style="color: #0a61bd"
              title="编辑"
            />
          </AuthDom>
          <AuthDom auth="softwareManage_table_delete">
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
          :rules="[{ required: true, message: '请选择所属部门' }]"
          label="所属部门"
          name="orgId"
        >
          <a-tree-select
            v-model:value="formData.orgId"
            show-search
            style="width: 100%"
            :dropdown-style="{ maxHeight: '400px', overflow: 'auto' }"
            placeholder="请选择所属部门"
            allow-clear
            show-arrow
            :filterTreeNode="AntVueCommon.filterTreeNode"
            :tree-data="organizationDatas"
          />
        </a-form-item>
        <a-form-item
          label="服务类型"
          name="serviceType"
          :rules="[{ required: true, message: '请选择软件类型' }]"
        >
          <a-select
            show-search
            :filter-option="AntVueCommon.filterOption"
            placeholder="请选择服务类型"
            v-model:value="formData.serviceType"
            :options="dictionariesData.filter((m) => m.dictionariesClass == 'serviceType')"
          />
        </a-form-item>
        <a-form-item
          label="所属设备"
          name="equipmentId"
          :rules="[{ required: true, message: '请选择所属设备' }]"
        >
          <a-select
            allowClear
            show-search
            :filter-option="AntVueCommon.filterOption"
            placeholder="请选择所属设备"
            v-model:value="formData.equipmentId"
            :options="equipmentData"
          />
        </a-form-item>
        <a-form-item
          name="serviceName"
          label="软件名称"
          :rules="[
            { required: true, message: '' },
            { max: 50, message: '软件名称过长' },
            { validator: formValidator.empty, message: '请输入软件名称' },
          ]"
        >
          <a-input
            v-model:value="formData.serviceName"
            placeholder="请输入软件名称"
            autocomplete="off"
          />
        </a-form-item>
        <a-form-item
          name="serviceCode"
          label="唯一编号"
          :rules="[
            { required: true, message: '' },
            { max: 20, message: '唯一编号过长' },
            { validator: formValidator.empty, message: '请输入唯一编号' },
          ]"
        >
          <a-input
            v-model:value="formData.serviceCode"
            placeholder="请输入唯一编号"
            autocomplete="off"
          />
        </a-form-item>
        <a-form-item
          name="filePath"
          label="部署路径"
          :rules="[{ max: 20, message: '部署路径过长' }]"
        >
          <a-input
            placeholder="请输入部署路径"
            v-model:value="formData.filePath"
            autocomplete="off"
          />
        </a-form-item>
        <a-form-item name="port" label="运行端口">
          <a-input
            placeholder="请输入运行端口"
            v-model:value="formData.port"
            autocomplete="off"
            :min="0"
            :max="9999999999"
          />
        </a-form-item>
        <a-form-item
          name="isUpPerformance"
          label="性能上报"
          :rules="[{ required: true, message: '请选择是否开启性能上报' }]"
        >
          <a-switch v-model:checked="formData.isUpPerformance" />
        </a-form-item>
        <a-form-item
          name="orderIndex"
          label="软件排序"
          :rules="[{ required: true, message: '请输入软件排序' }]"
        >
          <a-input-number
            placeholder="请输入软件排序"
            :precision="3"
            :min="-99999"
            :max="99999"
            style="width: 300px"
            v-model:value="formData.orderIndex"
          />
        </a-form-item>
        <a-form-item
          name="remark"
          label="备注信息"
          :rules="[{ max: 250, message: '备注信息过长' }]"
        >
          <a-textarea
            placeholder="请输入备注信息"
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
    <a-drawer
      :headerStyle="{ height: '49px', borderBottom: '2px solid #eee' }"
      :width="700"
      :visible="isShowConfig"
      title="服务配置"
      :footer-style="{ textAlign: 'right' }"
      @close="closeConfig"
    >
      <div :class="`${prefixCls}codemirror`">
        <a-spin :spinning="isRunGetConfig" tip="正在获取配置...">
          <codemirror
            ref="codemirrorRef"
            :modelValue="modelValue"
            :style="{ height: '100%', overflow: 'auto' }"
            :language="codemirrorLanguage"
          />
        </a-spin>
      </div>
      <template #footer>
        <a-spin :spinning="fromSpinning">
          <a-button style="margin-left: 8px" @click="closeConfig">关闭</a-button>
        </a-spin>
      </template>
    </a-drawer>
    <a-drawer
      :headerStyle="{ height: '49px', borderBottom: '2px solid #eee' }"
      :width="700"
      :visible="isShowLog"
      title="服务日志"
      :footer-style="{ textAlign: 'right' }"
      @close="closeLog"
    >
      <vxe-table
        :class="`${prefixCls}logTable`"
        ref="logTableRef"
        :loading="isRunGetLog"
        :data="logCollectionData"
        border="none"
        :show-header="true"
        :show-overflow="true"
        :show-footer="false"
        :menu-config="logMenuConfig"
        :checkbox-config="checkboxConfig"
        @menu-click="contextMenuClickEvent"
        :row-config="{ isCurrent: true, isHover: true }"
      >
        <vxe-column type="checkbox" width="60" />
        <vxe-column field="Name" title="名称">
          <template #default="{ row }">
            <span @dblclick="logNamedblclick(row)" class="name">
              <IconFontClass
                :title="row.IsBack ? '返回上一层目录' : row.Name"
                :name="
                  row.IsBack
                    ? 'icon-baseui-fanhuishangyiji'
                    : row.IsParent
                      ? 'icon-baseui-wenjianjia'
                      : row.Name.lastIndexOf('.') == -1
                        ? 'icon-baseui-weizhiwenjian'
                        : ['txt', 'log'].includes(
                              row.Name.substring(row.Name.lastIndexOf('.') + 1).toLowerCase(),
                            )
                          ? 'icon-baseui-wenben1'
                          : 'icon-baseui-weizhiwenjian'
                "
              />
              {{ row.Name }}
            </span>
          </template>
        </vxe-column>
        <vxe-column field="Size" title="大小(KB)" align="right">
          <template #default="{ row }">
            {{ row.Size != -1 ? row.Size : '' }}
          </template>
        </vxe-column>
        <vxe-column field="Time" title="上次修改时间" align="right">
          <template #default="{ row }">
            {{ row.Time ? dayjs(row.Time).format('YYYY-MM-DD HH:mm:ss') : '' }}
          </template>
        </vxe-column>
      </vxe-table>
      <template #footer>
        <a-spin :spinning="fromSpinning">
          <a-button style="margin-left: 8px" type="primary" @click="downLogMqtt">下载</a-button>
          <a-button style="margin-left: 8px" @click="closeLog">关闭</a-button>
        </a-spin>
      </template>
    </a-drawer>
  </MyContent>
</template>
<script setup lang="ts">
  import codemirror from '/@/components/MyCodemirror/codemirror.vue';
  import formValidator from '@/utils/MyCommon/formValidator';
  import AntVueCommon from '@/utils/MyCommon/AntVueCommon';
  import myCommon from '@/utils/MyCommon/common';
  import { ref, reactive, createVNode, nextTick, watch, onMounted } from 'vue';
  import { useDesign } from '@/hooks/web/useDesign';
  import dayjs from 'dayjs';
  import {
    VxeGrid,
    VxeGridProps,
    VXETable,
    VxeTablePropTypes,
    VxeColumnPropTypes,
    VxeTableEvents,
  } from 'vxe-table';
  import softwareApi from '@/api/software';
  import { message, Modal } from 'ant-design-vue';
  import { ExclamationCircleOutlined } from '@ant-design/icons-vue';
  import dictionariesApi from '@/api/dictionaries';
  import equipmentApi from '@/api/equipment';
  import { tryOnUnmounted } from '@vueuse/core';
  import { useMqttStoreWithOut } from '@/store/modules/mqtt';
  import { useUserStore } from '@/store/modules/user';
  import organizationApi from '@/api/organization';

  defineOptions({ name: 'SoftwareManage' });
  const { prefixCls } = useDesign('softwareManage-');
  const mqttStore = useMqttStoreWithOut();
  const userStore = useUserStore();
  const loading = ref(true);
  const tableConfig = reactive<VxeGridProps>({
    height: 'auto',
    columns: [
      //基础
      { type: 'seq', title: '序号', width: 50, fixed: 'left' },
      {
        field: 'serviceId',
        title: '软件ID',
        visible: false,
        showOverflow: true,
        showHeaderOverflow: true,
      },
      {
        field: 'orgName',
        title: '所属部门',
        showOverflow: true,
        showHeaderOverflow: true,
        sortable: true,
      },
      {
        field: 'equipmentName',
        title: '所属设备',
        showOverflow: true,
        showHeaderOverflow: true,
        sortable: true,
      },
      {
        field: 'serviceType',
        title: '服务类型',
        showOverflow: true,
        showHeaderOverflow: true,
        sortable: true,
      },
      {
        field: 'serviceName',
        title: '软件名称',
        showOverflow: true,
        showHeaderOverflow: true,
        sortable: true,
      },
      {
        field: 'serviceCode',
        title: '唯一编号',
        showOverflow: true,
        showHeaderOverflow: true,
        sortable: true,
      },
      {
        field: 'filePath',
        title: '部署路径',
        showOverflow: true,
        showHeaderOverflow: true,
        sortable: true,
      },
      {
        field: 'port',
        title: '运行端口',
        showOverflow: true,
        showHeaderOverflow: true,
        sortable: true,
      },
      {
        field: 'runStatus',
        title: '软件状态',
        showOverflow: true,
        showHeaderOverflow: true,
        sortable: true,
        slots: {
          default: 'runStatus',
        },
      },
      {
        field: 'isUpPerformance',
        title: '性能上报',
        showOverflow: true,
        showHeaderOverflow: true,
        cellRender: { name: 'render_isno' },
      },
      {
        field: 'orderIndex',
        title: '排序',
        showOverflow: true,
        showHeaderOverflow: true,
        visible: false,
        sortable: true,
      },
      {
        field: 'remark',
        title: '信息备注',
        showOverflow: true,
        showHeaderOverflow: true,
        sortable: true,
      },
      {
        field: 'createTime',
        title: '创建时间',
        width: 150,
        showOverflow: true,
        showHeaderOverflow: true,
        visible: false,
        sortable: true,
      },
      {
        field: 'createUser',
        title: '创建人',
        width: 130,
        showOverflow: true,
        showHeaderOverflow: true,
        visible: false,
        sortable: true,
      },
      {
        field: 'modifyTime',
        title: '修改时间',
        width: 150,
        showOverflow: true,
        showHeaderOverflow: true,
        visible: false,
        sortable: true,
      },
      {
        field: 'modifyUser',
        title: '修改人',
        width: 130,
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
    serviceName: '',
    projectid: 1,
    address: '',
    remark: '',
    orderIndex: null,
    port: '',
    serviceType: null,
    filePath: '',
    runStatus: '运行',
    serviceCode: '',
    isUpPerformance: false,
    orgId: null,
  });
  const formData = ref(_.cloneDeep(defFromData));
  const formRef = ref(null);
  const tableRef = ref({});
  const isShowForm = ref(false);
  const fromSpinning = ref(false);
  let saveType = 'add';
  const dictionariesData = ref([]);
  const equipmentData = ref([]);
  const seacthContent = ref({
    orgId: null,
    serviceName: '',
  });
  const refresh = ref('yes');
  const refreshTime = ref(10);
  let refreshTimeId;

  //配置信息
  const isRunGetConfig = ref(false);
  const isShowConfig = ref(false);
  const codemirrorRef = ref(null);
  const codemirrorLanguage = ref('json');
  const modelValue = ref('');

  //公用
  let newServerCode = null;
  let isShowContent = false;

  //日志信息
  const isShowLog = ref(false);
  const isRunGetLog = ref(false);
  const logCollectionData = ref([]);
  const logTableRef = ref(null);
  let LogDirectory = null;
  //每一步的数据
  let logTableStepData = [];
  //每一步的文件夹名称
  const logTableStepName = ref([]);
  let logTableStepDataRowIndex = [];
  let logTableStep = 0;
  const logMenuConfig = reactive({
    className: prefixCls + 'logTtable',
    body: {
      options: [
        [
          {
            code: 'down',
            name: '下载',
            prefixIcon: 'iconfont icon-baseui-xiazai',
            className: prefixCls + 'logTtable-xiazai-item  sssssss',
          },
        ],
      ],
    },
  });
  const checkboxConfig = reactive({
    checkMethod: ({ row }) => {
      return !row.IsBack;
    },
    visibleMethod({ row }) {
      return !row.IsBack;
    },
  });

  const organizationDatas = ref([]);
  let _organizationDatas = [];

  getOrganization();
  getSoftwares(true);

  //重置搜索条件
  function resetSeacth() {
    seacthContent.value = {
      orgId: null,
      serviceName: '',
    };
  }

  function showFrom(row) {
    stopRefresh();
    getOrganization();
    getDictionaries();
    getEquipments();
    if (myCommon.isnull(row)) {
      formData.value = _.cloneDeep(defFromData);
      saveType = 'add';
      isShowForm.value = true;
    } else {
      //编辑
      getByid(row.serviceId);
    }
  }

  //删除软件信息
  function remove(row) {
    Modal.confirm({
      maskClosable: true,
      title: '是否删除?',
      icon: createVNode(ExclamationCircleOutlined),
      content: '',
      onOk() {
        loading.value = true;
        softwareApi
          .DeleteService(row.serviceId)
          .then(() => {
            loading.value = false;
            tableConfig.data = tableConfig.data?.filter((m) => m.serviceId != row.serviceId);
            message.success('删除软件信息成功');
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
    isShowForm.value = false;
    newServerCode = null;
    formRef.value.clearValidate();
  }

  //获取软件列表
  function getByid(id) {
    loading.value = true;
    softwareApi
      .GetService(id)
      .then((data) => {
        loading.value = false;
        if (data) {
          formData.value = data;
          saveType = 'edit';
          isShowForm.value = true;
        } else {
          message.error('获取软件信息失败');
        }
      })
      .catch(() => {
        loading.value = false;
      });
  }

  //获取软件列表
  function getSoftwares(isAuto = false) {
    loading.value = true;
    if (!isAuto) {
      refresh.value = 'no';
    }
    softwareApi
      .GetServices({
        ...seacthContent.value,
        execompleteBefore: () => {
          loading.value = false;
        },
      })
      .then((data) => {
        tableConfig.data = data;
        refreshData();
      })
      .catch(() => {
        tableConfig.data = [];
        refreshData();
      });
  }

  //新增和编辑
  function saveFrom() {
    formRef.value.validate().then(() => {
      fromSpinning.value = true;
      const execompleteBefore = () => {
        fromSpinning.value = false;
      };
      formData.value['execompleteBefore'] = execompleteBefore;
      if (saveType == 'add') {
        softwareApi.AddService(formData.value).then((data) => {
          data.serviceType = dictionariesData.value.find((m) => m.key == data.serviceType)?.label;
          data.equipmentName = equipmentData.value.find((m) => m.key == data.equipmentId)?.label;
          data.orgName = _organizationDatas.find((m) => m.key == data.orgId)?.label;
          tableConfig.data?.splice(0, 0, data);
          formClose();
          message.success('新增软件成功');
        });
      } else {
        softwareApi.UpdateService(formData.value).then((data) => {
          const oldData = tableRef.value.getRowById(data.serviceId);
          delete formData.value.createUser;
          myCommon.objectReplace(oldData, data);
          oldData.modifyTime = data.modifyTime;
          oldData.modifyUser = data.modifyUser;
          oldData.serviceType = dictionariesData.value.find(
            (m) => m.key == data.serviceType,
          )?.label;
          oldData.equipmentName = equipmentData.value.find((m) => m.key == data.equipmentId)?.label;
          oldData.orgName = _organizationDatas.find((m) => m.key == data.orgId)?.label;
          formClose();
          message.success('更新软件信息成功');
        });
      }
    });
  }

  //获取字典
  function getDictionaries() {
    dictionariesApi
      .GetDictionariesimple({
        dictionariesClass: ['serviceType'],
      })
      .then((data) => {
        dictionariesData.value = data;
      })
      .catch(() => {
        dictionariesData.value = [];
      });
  }

  //获取设备
  function getEquipments() {
    equipmentApi
      .GetEquipmentSimple({
        execompleteBefore: () => {
          loading.value = false;
        },
      })
      .then((data) => {
        equipmentData.value = data;
      })
      .catch(() => {
        equipmentData.value = [];
      });
  }

  //刷新数据
  function refreshData() {
    if (refresh.value == 'yes') {
      refreshTimeId = setTimeout(() => {
        if (refreshTime.value <= 0) {
          refreshTime.value = 10;
          nextTick(() => {
            getSoftwares(true);
          });
        } else {
          refreshTime.value = refreshTime.value - 1;
          nextTick(() => {
            refreshData();
          });
        }
      }, 1000);
    }
  }

  //停止刷新数据
  function stopRefresh() {
    clearTimeout(refreshTimeId);
    refresh.value = 'no';
    refreshTime.value = 10;
  }

  //显示查看服务配置
  function showConfig(row) {
    if (row.isOnline) {
      stopRefresh();
      isShowConfig.value = true;
      newServerCode = row.serviceCode;
      isRunGetConfig.value = true;
      mqttStore.publish(
        mqttStore.lookConfig.replace(mqttStore.monitorClient, '/' + row.serviceCode),
        JSON.stringify({
          ServiceCode: row.serviceCode,
          ClientId: mqttStore.mqttClient.options.clientId,
          UserId: userStore.getUserInfo.userId,
        }),
        function (msg) {
          isRunGetConfig.value = false;
          msg ? message.error(msg) : message.success('请求已发送');
        },
      );
    } else {
      message.info('服务中断，不可获取');
    }
  }

  //关闭查看服务配置
  function closeConfig() {
    isRunGetConfig.value = false;
    isShowConfig.value = false;
    isShowContent = false;
    modelValue.value = '';
    newServerCode = null;
    refresh.value = 'yes';
    mqttStore.setNewServicConfig(null);
  }

  //显示查看服务日志
  function showLog(row) {
    if (row.isOnline) {
      stopRefresh();
      isShowLog.value = true;
      newServerCode = row.serviceCode;
      isRunGetLog.value = true;
      mqttStore.publish(
        mqttStore.lookLog.replace(mqttStore.monitorClient, '/' + row.serviceCode),
        JSON.stringify({
          ServiceCode: row.serviceCode,
          ClientId: mqttStore.mqttClient.options.clientId,
          UserId: userStore.getUserInfo.userId,
          LogLevel: 0,
        }),
        function (msg) {
          isRunGetLog.value = false;
          msg ? message.error(msg) : message.success('请求已发送');
        },
      );
    } else {
      message.info('服务中断，不可获取');
    }
  }

  //关闭查看服务日志
  function closeLog() {
    logCollectionData.value = [];
    isShowLog.value = false;
    logTableStepName.value = [];
    logTableStepData = [];
    logTableStepDataRowIndex = [];
    logTableStep = 0;
    isShowContent = false;
    mqttStore.setNewServiceLogShowDirectory(null);
  }

  //表格右键事件
  function contextMenuClickEvent({ menu, row, column }) {
    switch (menu.code) {
      case 'down':
        downLogMqtt();
        break;
    }
  }
  //发送下载日志文件
  function downLogMqtt() {
    const checkDatas = logTableRef.value.getCheckboxRecords(false);
    if (checkDatas && checkDatas.length > 0) {
      const LogFileCollection = [];
      let name = logTableStepName.value.join('\\');
      name = name != '' ? '\\' + name : '';
      checkDatas.forEach((m) => {
        LogFileCollection.push({ Name: `${LogDirectory}${name}\\${m.Name}`, IsParent: m.IsParent });
      });
      mqttStore.publish(
        mqttStore.downLog.replace(mqttStore.monitorClient, '/' + newServerCode),
        JSON.stringify({
          ServiceCode: newServerCode,
          ClientId: mqttStore.mqttClient.options.clientId,
          UserId: userStore.getUserInfo.userId,
          LogFileCollection: LogFileCollection,
        }),
        function (msg) {
          isRunGetLog.value = false;
          msg ? message.error(msg) : message.success('请求已发送');
        },
      );
    } else {
      message.info('请先选中要下载的文件');
    }
  }

  //双击日志名称
  function logNamedblclick(row) {
    if (row.IsBack) {
      logTableStep--;
      logCollectionData.value = logTableStepData[logTableStep];
      logTableStepData.splice(logTableStep + 1);
      logTableStepName.value.splice(logTableStep);
      nextTick(() => {
        logTableRef.value.scrollToRow(logTableStepDataRowIndex[logTableStep - 1]);
        logTableStepDataRowIndex.splice(logTableStep);
      });
    } else if (row.IsParent) {
      logTableStep++;
      logTableStepData.push(row.SubCollection);
      logTableStepName.value.push(row.Name);
      logCollectionData.value = row.SubCollection;
      logTableStepDataRowIndex.push(row);
    }
  }

  //获取部门
  function getOrganization() {
    organizationApi
      .GetOrganizationTree({})
      .then((data) => {
        organizationDatas.value = data;
        myCommon.generateList(_organizationDatas, organizationDatas.value, 'children');
      })
      .catch(() => {
        loading.value = false;
        _organizationDatas = [];
      });
  }

  //监控是否开启自动刷新
  watch(
    () => refresh.value,
    () => {
      if (refresh.value == 'yes') {
        refreshData();
      } else {
        stopRefresh();
      }
    },
  );

  watch(
    () => mqttStore.newServicConfig,
    () => {
      if (
        mqttStore.newServicConfig != null &&
        isShowConfig.value &&
        newServerCode == mqttStore.newServicConfig.ServiceCode &&
        !isShowContent
      ) {
        isShowContent = true;
        isRunGetConfig.value = false;
        nextTick(() => {
          codemirrorLanguage.value = mqttStore.newServicConfig.ContentType;
          modelValue.value = mqttStore.newServicConfig.Content;
        });
      }
    },
  );

  watch(
    () => mqttStore.newServiceLogShowDirectory,
    () => {
      if (
        mqttStore.newServiceLogShowDirectory != null &&
        isShowLog.value &&
        newServerCode == mqttStore.newServiceLogShowDirectory.ServiceCode &&
        !isShowContent
      ) {
        isShowContent = true;
        isRunGetLog.value = false;
        nextTick(() => {
          logCollectionData.value = mqttStore.newServiceLogShowDirectory.LogCollection;
          LogDirectory = mqttStore.newServiceLogShowDirectory.LogDirectory;
          logTableStepData.push(logCollectionData.value);
        });
      }
    },
  );

  watch(
    () => logTableStepName.value,
    () => {
      if (logTableStepName.value.length > 0) {
        nextTick(() => {
          logTableRef.value.insert({
            Name: '...\\' + logTableStepName.value.join('\\'),
            IsBack: true,
            Size: -1,
            Time: '',
          });
        });
      }
    },
    { deep: true },
  );

  //页面卸载后
  tryOnUnmounted(() => {
    stopRefresh();
  });
</script>
<style lang="less" scoped>
  @prefixCls: ~'@{namespace}-softwareManage-';

  .@{prefixCls}codemirror {
    height: 100%;
  }

  .tableBtn {
    width: 100%;
  }
</style>
<style lang="less">
  @prefixCls: ~'@{namespace}-softwareManage-';

  .@{prefixCls}logTtable-xiazai-item {
    width: 110px !important;
  }

  .@{prefixCls}logTable {
    user-select: none;

    .name {
      cursor: pointer;
    }

    .icon-baseui-xiazai {
      top: 0 !important;
    }

    .icon-baseui-wenjianjia {
      color: #ffb100;
    }

    .icon-baseui-wenben1 {
      color: #adadad;
    }

    .icon-baseui-weizhiwenjian {
      color: #0a61bd;
    }

    .icon-baseui-fanhuishangyiji {
      color: green;
    }
  }
</style>
