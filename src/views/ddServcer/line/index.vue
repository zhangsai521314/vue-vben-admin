<template>
  <MyContent>
    <a-spin :spinning="isRunGet" title="正在执行...">
      <!-- 开启多字段排序 -->
      <!-- :sort-config="{ multiple: true }" -->
      <vxe-grid
        :scroll-y="{ enabled: true }"
        v-bind="tableConfig"
        id="ddServcerLine"
        :auto-resize="true"
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
              <AuthDom auth="ddServcer_line_query">
                <a-space direction="horizontal" size="small" :wrap="true" style="margin-bottom: 0">
                  <div class="row-div">
                    <a-space direction="horizontal" size="small" :wrap="true">
                      <label>线路名称：</label>
                      <a-input
                        @press-enter="initPage"
                        v-model:value="seacthContent.name"
                        placeholder="输入线路名称查询"
                      />
                    </a-space>
                  </div>
                  <div class="row-div">
                    <a-space direction="horizontal" size="small" :wrap="true">
                      <a-button @click="initPage" type="primary">{{t('view.query')}}</a-button>
                    </a-space>
                  </div>
                </a-space>
              </AuthDom>
              <AuthDom auth="ddServcer_line_add">
                <a-button class="ant-btn" @click="showFrom()">新增线路</a-button>
              </AuthDom>
              <AuthDom auth="ddServcer_line_pusMq">
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
            <AuthDom auth="ddServcer_line_table_edit">
              <IconFontClass
                name="icon-baseui-edit-fill"
                @click="showFrom(row)"
                style="color: #0749df"
                title="编辑"
              />
            </AuthDom>
            <AuthDom auth="ddServcer_line_table_delete">
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
            label="线路名称(中)"
            name="nameCn"
            :rules="[
              { required: true, message: '' },
              { max: 40, message: '线路名称(中)过长' },
              { validator: formValidator.empty, message: '请输入线路名称(中)' },
            ]"
          >
            <a-input
              placeholder="请输入线路名称(中)"
              v-model:value="formData.nameCn"
              autocomplete="off"
            />
          </a-form-item>
          <a-form-item
            label="线路名称(英)"
            name="nameEn"
            :rules="[
              { required: true, message: '' },
              { max: 40, message: '线路名称(英)过长' },
              { validator: formValidator.empty, message: '请输入线路名称(英)' },
            ]"
          >
            <a-input
              placeholder="请输入线路名称(英)"
              v-model:value="formData.nameEn"
              autocomplete="off"
            />
          </a-form-item>
          <a-form-item
            label="线路名称(法)"
            name="nameFr"
            :rules="[
              { required: true, message: '' },
              { max: 40, message: '线路名称(法)过长' },
              { validator: formValidator.empty, message: '请输入线路名称(法)' },
            ]"
          >
            <a-input
              placeholder="请输入线路名称(法)"
              v-model:value="formData.nameFr"
              autocomplete="off"
            />
          </a-form-item>
          <a-form-item
            label="线路代码"
            name="code"
            :rules="[
              { required: true, message: '' },
              { min: 3, message: '线路代码是3至6位' },
              { max: 6, message: '线路代码是3至6位' },
              { validator: formValidator.positiveInteger, message: '线路代码格式为自然数' },
              { validator: formValidator.empty, message: '请输入线路代码' },
            ]"
          >
            <a-input
              placeholder="请输入线路代码"
              v-model:value="formData.code"
              autocomplete="off"
            />
          </a-form-item>
          <a-form-item
            name="dcFn"
            label="功能号"
            :rules="[
              { required: true, message: '' },
              { min: 5, message: '功能号名称是5至9位' },
              { max: 9, message: '功能号名称是5至9位' },
              { validator: formValidator.positiveInteger, message: '功能号格式为自然数' },
              { validator: formValidator.empty, message: '请输入功能号' },
            ]"
          >
            <a-input placeholder="请输入功能号" v-model:value="formData.dcFn" autocomplete="off" />
          </a-form-item>
          <a-form-item
            name="dcIsdn"
            label="调度台ISDN"
            :rules="[
              { required: true, message: '' },
              { min: 4, message: '调度台ISDN名称是4至11位' },
              { max: 11, message: '调度台ISDN名称是4至11位' },
              { validator: formValidator.positiveInteger, message: '调度台ISDN格式为自然数' },
              { validator: formValidator.empty, message: '请输入调度台ISDN' },
            ]"
          >
            <a-input
              placeholder="请输入调度台ISDN"
              v-model:value="formData.dcIsdn"
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
              name="groupAllCirNumber"
              label="全呼机车组呼号码"
              :rules="[
                { required: true, message: '' },
                { min: 3, message: '全呼机车组呼号码是3至10位' },
                { max: 10, message: '全呼机车组呼号码是3至10位' },
                {
                  validator: formValidator.positiveInteger,
                  message: '全呼机车组呼号码格式为自然数',
                },
                { validator: formValidator.empty, message: '请输入全呼机车组呼号码' },
              ]"
            >
              <a-input
                :disabled="myCommon.isnull(formData.programUpdatePassWord) && saveType == 'edit'"
                placeholder="请输入全呼机车组呼号码"
                v-model:value="formData.groupAllCirNumber"
                autocomplete="off"
              />
            </a-form-item>
            <a-form-item
              name="groupAllCirPriority"
              label="全呼机车组呼优先级"
              :rules="[
                { required: true, message: '请输入全呼机车组呼优先级' },
                { validator: formValidator.min, min: 1, message: '全呼机车组呼优先级1至15' },
                { validator: formValidator.max, max: 15, message: '全呼机车组呼优先级1至15' },
              ]"
            >
              <a-input-number
                :disabled="myCommon.isnull(formData.programUpdatePassWord) && saveType == 'edit'"
                placeholder="请输入全呼机车组呼优先级"
                style="width: 262px"
                :precision="0"
                v-model:value="formData.groupAllCirPriority"
              />
            </a-form-item>
            <a-form-item
              name="groupAllDcNumber"
              label="全呼车站组呼号码"
              :rules="[
                { required: true, message: '' },
                { min: 3, message: '全呼车站组呼号码是3至10位' },
                { max: 10, message: '全呼车站组呼号码是3至10位' },
                {
                  validator: formValidator.positiveInteger,
                  message: '全呼车站组呼号码格式为正整数',
                },
                { validator: formValidator.empty, message: '请输入全呼车站组呼号码' },
              ]"
            >
              <a-input
                :disabled="myCommon.isnull(formData.programUpdatePassWord) && saveType == 'edit'"
                placeholder="请输入全呼车站组呼号码"
                v-model:value="formData.groupAllDcNumber"
                autocomplete="off"
              />
            </a-form-item>
            <a-form-item
              name="groupAllDcPriority"
              label="全呼车站组呼优先级"
              :rules="[
                { required: true, message: '请输入全呼车站组呼优先级' },
                { validator: formValidator.min, min: 1, message: '全呼车站组呼优先级1至15' },
                { validator: formValidator.max, max: 15, message: '全呼车站组呼优先级1至15' },
              ]"
            >
              <a-input-number
                :disabled="myCommon.isnull(formData.programUpdatePassWord) && saveType == 'edit'"
                placeholder="请输入全呼车站组呼优先级"
                style="width: 262px"
                :precision="0"
                v-model:value="formData.groupAllDcPriority"
              />
            </a-form-item>
            <a-form-item
              name="groupAllBroadcastNumber"
              label="全线广播组呼号码"
              :rules="[
                { required: true, message: '' },
                { min: 3, message: '全线广播组呼号码是3至10位' },
                { max: 10, message: '全线广播组呼号码是3至10位' },
                {
                  validator: formValidator.positiveInteger,
                  message: '全线广播组呼号码格式为自然数',
                },
                { validator: formValidator.empty, message: '请输入全线广播组呼号码' },
              ]"
            >
              <a-input
                :disabled="myCommon.isnull(formData.programUpdatePassWord) && saveType == 'edit'"
                placeholder="请输入全线广播组呼号码"
                v-model:value="formData.groupAllBroadcastNumber"
                autocomplete="off"
              />
            </a-form-item>
            <a-form-item
              name="groupAllBroadcastPriority"
              label="全线广播组呼优先级"
              :rules="[
                { required: true, message: '请输入全线广播组呼优先级' },
                { validator: formValidator.min, min: 1, message: '全线广播组呼优先级1至15' },
                { validator: formValidator.max, max: 15, message: '全线广播组呼优先级1至15' },
              ]"
            >
              <a-input-number
                :disabled="myCommon.isnull(formData.programUpdatePassWord) && saveType == 'edit'"
                placeholder="请输入全线广播组呼优先级"
                style="width: 262px"
                :precision="0"
                v-model:value="formData.groupAllBroadcastPriority"
              />
            </a-form-item>
          </template>
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
            <a-button type="primary" @click="saveFrom">{{ t('view.save') }}</a-button>
            <a-button style="margin-left: 8px" @click="formClose">{{ t('view.close') }}</a-button>
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
  import { Line as lineApi } from '@/api/ddServcer';
  import { message, Modal } from 'ant-design-vue';
  import { ExclamationCircleOutlined } from '@ant-design/icons-vue';
  import { useMqttStoreWithOut } from '@/store/modules/mqtt';
  import commonApi from '@/api/common';
  import { useI18n } from '@/hooks/web/useI18n';
  import { useLocaleStore } from '@/store/modules/locale';

  const { t } = useI18n();
  const localeStore = useLocaleStore();
  const locale = localeStore.getLocale;

  const { t } = useI18n();
  defineOptions({ name: 'DDServcerLine' });
  const mqttStore = useMqttStoreWithOut();
  const isRunGet = ref(false);
  const loading = ref(true);
  const tableConfig = reactive<VxeGridProps>({
    height: 'auto',
    columns: [
      //基础
      {
        type: 'seq',
        title: t('view.serialNumber'),
        minWidth: locale == 'en-US' ? 110 : 70,
        fixed: 'left',
      },
      {
        field: 'id',
        title: t('view.recordId'),
        visible: false,
        showHeaderOverflow: true,
        fixed: 'left',
        minWidth: 130,
      },
      {
        field: 'name',
        title: '线路名称',
        showOverflow: true,
        showHeaderOverflow: true,
        sortable: true,
        minWidth: 200,
        fixed: 'left',
      },
      {
        field: 'nameCn',
        title: '线路名称(中)',
        showOverflow: true,
        showHeaderOverflow: true,
        sortable: true,
        minWidth: 200,
        visible: false,
      },
      {
        field: 'nameEn',
        title: '线路名称(英)',
        showOverflow: true,
        showHeaderOverflow: true,
        sortable: true,
        minWidth: 200,
        visible: false,
      },
      {
        field: 'nameFr',
        title: '线路名称(法)',
        showOverflow: true,
        showHeaderOverflow: true,
        sortable: true,
        minWidth: 200,
        visible: false,
      },
      {
        field: 'code',
        title: '线路代码',
        showOverflow: true,
        showHeaderOverflow: true,
        sortable: true,
        minWidth: 100,
      },
      {
        field: 'dcFn',
        title: '功能号',
        showOverflow: true,
        showHeaderOverflow: true,
        sortable: true,
        minWidth: 100,
      },
      {
        field: 'dcIsdn',
        title: '调度台ISDN',
        showOverflow: true,
        showHeaderOverflow: true,
        sortable: true,
        minWidth: 120,
      },
      {
        field: 'groupAllCirNumber',
        title: '全呼CIR组呼号',
        showOverflow: true,
        showHeaderOverflow: true,
        sortable: true,
        minWidth: 150,
      },
      {
        field: 'groupAllCirPriority',
        title: '全呼CIR组呼优先级',
        showOverflow: true,
        showHeaderOverflow: true,
        sortable: true,
        minWidth: 160,
      },
      {
        field: 'groupAllDcNumber',
        title: '全呼车站组呼号',
        showOverflow: true,
        showHeaderOverflow: true,
        sortable: true,
        minWidth: 150,
      },
      {
        field: 'groupAllDcPriority',
        title: '全呼调度台组优先级',
        showOverflow: true,
        showHeaderOverflow: true,
        sortable: true,
        minWidth: 170,
      },
      {
        field: 'groupAllBroadcastNumber',
        title: '线路广播组呼号',
        showOverflow: true,
        showHeaderOverflow: true,
        sortable: true,
        minWidth: 170,
      },
      {
        field: 'groupAllBroadcastPriority',
        title: '线路广播组呼优先级',
        showOverflow: true,
        showHeaderOverflow: true,
        sortable: true,
        minWidth: 170,
      },
      {
        field: 'reamrk',
        title: '备注信息',
        showOverflow: true,
        showHeaderOverflow: true,
        visible: false,
        sortable: true,
        minWidth: 150,
      },
      {
        field: 'updateTime',
        title: '更新时间',
        showOverflow: true,
        showHeaderOverflow: true,
        sortable: true,
        minWidth: 150,
        visible: false,
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
    reamrk: null,
    nameCn: null,
    nameEn: null,
    nameFr: null,
    code: null,
    dcFn: null,
    dcIsdn: null,
    groupAllCirNumber: null,
    groupAllCirPriority: null,
    groupAllDcNumber: null,
    groupAllDcPriority: null,
    groupAllBroadcastNumber: null,
    groupAllBroadcastPriority: null,
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
    sortlist: ['updateTime desc'],
  });
  const seacthContent = ref({
    name: '',
  });
  const isShowUpdate = ref(false);
  const isRunMushMq = ref(false);
  getDDServerLines();

  //页码改变
  function handlePageChange() {
    getDDServerLines();
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
    getDDServerLines();
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
    getDDServerLines();
  }

  //显示表单
  function showFrom(row) {
    if (myCommon.isnull(row)) {
      saveType.value = 'add';
      isShowForm.value = true;
    } else {
      //编辑
      getDDServerLine(row.id);
    }
  }

  //删除线路信息
  function remove(row) {
    Modal.confirm({
      maskClosable: true,
      title: t('view.areYouSureYouWantToDelete'),
      icon: createVNode(ExclamationCircleOutlined),
      content: '',
      onOk() {
        isRunGet.value = true;
        lineApi
          .DeleteDDServerLine(row.id.toString())
          .then(() => {
            isRunGet.value = false;
            message.success('删除线路信息成功');
            getDDServerLines();
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
    isShowUpdate.value = false;
    formData.value = _.cloneDeep(defFromData);
    formRef.value.clearValidate();
  }

  //获取线路
  function getDDServerLine(id) {
    isRunGet.value = true;
    lineApi
      .GetDDServerLine(id.toString())
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
  function getDDServerLines() {
    loading.value = true;
    lineApi
      .GetDDServerLines({
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
        lineApi.AddDDServerLine(formData.value).then((data) => {
          tableConfig.data?.splice(0, 0, data);
          formClose();
          message.success('新增线路成功');
          page.total = page.total + 1;
        });
      } else {
        lineApi.UpdateDDServerLine(formData.value).then((data) => {
          const oldData = tableConfig.data.find((m) => m.id == data.id);
          if (oldData) {
            myCommon.objectReplace(oldData, formData.value);
            oldData.name = data.name;
            oldData.updateTime = data.updateTime;
          }
          formClose();
          message.success('更新线路信息成功');
        });
      }
    });
  }
  //发送命令
  function pushMq() {
    isRunMushMq.value = true;
    commonApi.PushDDServerUpdateDBMq({
      MqInfo: JSON.stringify({
        Type: 1,
        ClientId: mqttStore.mqttClient.options.clientId,
      }),
      execompleteBefore: () => {
        isRunMushMq.value = false;
      },
    });
  }
</script>
<style lang="less" scoped>
  @prefixCls: ~'@{namespace}-DDServcerLine-';

  .fanZhun {
    display: inline-block;
    transform: rotateX(180deg);
  }
</style>
