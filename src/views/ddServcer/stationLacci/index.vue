<template>
  <MyContent>
    <a-spin :spinning="isRunGet">
      <!-- 开启多字段排序 -->
      <!-- :sort-config="{ multiple: true }" -->
      <vxe-grid
        :scroll-y="{ enabled: true }"
        v-bind="tableConfig"
        id="ddServcerStationLacci"
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
                      <label>{{ t('view.stationName') }}：</label>
                      <a-select
                        :placeholder="t('view.pleaseSelectStationName')"
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
                      <label>{{ t('view.eciNumber') }}：</label>
                      <a-input
                        @press-enter="initPage()"
                        v-model:value="seacthContent.lacci"
                        :placeholder="t('view.inputECINumberToQuery')"
                      />
                    </a-space>
                  </div>
                  <div class="row-div">
                    <a-space direction="horizontal" size="small" :wrap="true">
                      <a-button @click="initPage" type="primary">{{ t('view.query') }}</a-button>
                    </a-space>
                  </div>
                </a-space>
              </AuthDom>
              <AuthDom auth="ddServcer_stationLacci_add">
                <a-space direction="horizontal" size="small" :wrap="true" style="margin-bottom: 0">
                  <div class="row-div">
                    <a-space direction="horizontal" size="small" :wrap="true">
                      <a-button class="ant-btn" @click="showFrom()">{{
                        t('view.addStationECIRelationship')
                      }}</a-button>
                    </a-space>
                  </div>
                </a-space>
              </AuthDom>
              <AuthDom auth="ddServcer_stationLacci_pusMq">
                <a-space direction="horizontal" size="small" :wrap="true" style="margin-bottom: 0">
                  <div class="row-div">
                    <a-space direction="horizontal" size="small" :wrap="true">
                      <a-spin :spinning="isRunMushMq" :title="t('view.commandSending')">
                        <a-button class="ant-btn" @click="pushMq()">{{
                          t('view.syncCommand')
                        }}</a-button>
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
        <template #stationArea="{ row }">
          <span>{{
            row.stationArea == 1
              ? t('view.inStation')
              : row.stationArea == 2
                ? t('view.leftSideOfThisStation')
                : row.stationArea == 3
                  ? t('view.rightSideOfThisStation')
                  : ''
          }}</span>
        </template>
        <template #default="{ row }">
          <div :class="`tableOption`">
            <AuthDom auth="ddServcer_stationLacci_table_edit">
              <IconFontClass
                name="icon-baseui-edit-fill"
                @click="showFrom(row)"
                style="color: #0749df"
                :title="t('view.edit')"
              />
            </AuthDom>
            <AuthDom auth="ddServcer_stationLacci_table_delete">
              <IconFontClass
                name="icon-baseui-guanbicuowu"
                @click="remove(row)"
                style="color: red"
                :title="t('view.delete')"
              />
            </AuthDom>
          </div>
        </template>
      </vxe-grid>
      <a-drawer
        :headerStyle="{ height: '49px', borderBottom: '2px solid #eee' }"
        :width="500"
        :visible="isShowForm"
        :title="t('view.configuration')"
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
            :rules="[{ required: true, message: t('view.pleaseSelectTheAssociatedLine') }]"
            :label="t('view.belongsToLine')"
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
              :placeholder="t('view.pleaseSelectTheAssociatedLine')"
            />
          </a-form-item>
          <a-form-item
            :rules="[{ required: true, message: t('view.pleaseSelectStationName') }]"
            :label="t('view.stationName')"
            name="stationId"
          >
            <a-select
              :disabled="saveType != 'add'"
              v-model:value="formData.stationId"
              :options="stationDatas.filter((m) => m.lineId == formData.lineId)"
              :allowClear="true"
              :placeholder="t('view.pleaseSelectStationName')"
              show-search
              :filter-option="AntVueCommon.filterOption"
            />
          </a-form-item>
          <a-form-item
            :rules="[{ required: true, message: t('view.pleaseSelectTheAssociationType') }]"
            :label="t('view.associationType')"
            name="type"
          >
            <a-select
              v-model:value="formData.type"
              :disabled="saveType != 'add'"
              :placeholder="t('view.pleaseSelectTheAssociationType')"
            >
              <a-select-option :value="1">{{ t('view.inStation') }}</a-select-option>
              <a-select-option :value="2">{{ t('view.leftSideOfThisStation') }}</a-select-option>
              <a-select-option :value="3">{{ t('view.rightSideOfThisStation') }}</a-select-option>
            </a-select>
          </a-form-item>
          <a-form-item
            :rules="[{ required: true, message: t('view.pleaseSelectECINumber') }]"
            :label="t('view.eciNumber')"
            name="lacciIds"
          >
            <a-select
              mode="multiple"
              v-model:value="formData.lacciIds"
              :options="lacciDatas"
              :allowClear="true"
              show-search
              :filter-option="AntVueCommon.filterOption"
              :placeholder="t('view.pleaseSelectECINumber')"
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
  import AntVueCommon from '@/utils/MyCommon/AntVueCommon';
  import myCommon from '@/utils/MyCommon/common';
  import { ref, reactive, createVNode } from 'vue';
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
  import { useI18n } from '@/hooks/web/useI18n';
  import { useLocaleStore } from '@/store/modules/locale';

  const { t } = useI18n();
  const localeStore = useLocaleStore();
  const locale = localeStore.getLocale;
  defineOptions({ name: 'DDServcerStationLacci' });
  const mqttStore = useMqttStoreWithOut();
  const isRunGet = ref(false);
  const loading = ref(true);
  const tableConfig = reactive<VxeGridProps>({
    showOverflow: true,
    showHeaderOverflow: true,
    height: 'auto',
    columns: [
      //基础
      {
        field: 'seq_',
        type: 'seq',
        title: t('view.serialNumber'),
        minWidth: locale == 'zh-CN' ? 70 : 160,
        fixed: 'left',
      },
      {
        field: 'lineName',
        title: t('view.lineName'),
        showOverflow: true,

        sortable: true,
        visible: false,
        minWidth: 200,
        fixed: 'left',
      },
      {
        field: 'stationName',
        title: t('view.stationName'),
        showOverflow: true,
        sortable: false,
        minWidth: 200,
        fixed: 'left',
      },
      {
        field: 'stationArea',
        title: t('view.jurisdictionRange'),
        showOverflow: true,
        sortable: false,
        minWidth: 100,
        slots: {
          default: 'stationArea',
        },
      },
      {
        field: 'laccis',
        title: t('view.eciCollection'),
        showOverflow: true,
        minWidth: 200,
      },
      {
        field: 'action_',
        title: t('view.action'),
        width: 90,
        slots: {
          default: 'default',
        },
        showOverflow: true,

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
  getDDServerStationSimple();
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
    Promise.all([
      getDDServerLineSimple(),
      getDDServerStationSimple(),
      getDDServerLacciNoStationSimple(),
    ])
      .then(() => {
        if (myCommon.isnull(row)) {
          saveType.value = 'add';
          isShowForm.value = true;
        } else {
          //编辑
          getDDServerStationTLacci(row);
        }
      })
      .catch(() => {
        message.error(t('view.failedToGetECIInformation'));
      });
  }

  //删除ECI信息
  function remove(row) {
    Modal.confirm({
      maskClosable: true,
      okText: t('view.confirm'),
      cancelText: t('view.cancel'),
      title: t('view.areYouSureYouWantToDelete'),
      icon: createVNode(ExclamationCircleOutlined),
      content: '',
      onOk() {
        isRunGet.value = true;
        stationLacciApi
          .DeleteDDServerStationLacci({ StationId: row.stationId, Type: row.type })
          .then(() => {
            isRunGet.value = false;
            message.success(t('view.deletionSuccessful'));
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
          data.lacciNumbers.split(',').forEach((m, i) => {
            lacciDatas.value.splice(0, 0, {
              key: data.lacciIds[i],
              label: m,
              value: data.lacciIds[i],
            });
          });
          formData.value.longId = row.longId;
          saveType.value = 'edit';
          isShowForm.value = true;
        } else {
          message.error(t('view.failedToGetECIInformation'));
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
          message.success(t('view.additionSuccessful'));
          getDDServerStationTLaccis();
          page.total = page.total + 1;
        });
      } else {
        stationLacciApi.AUDDServerStationLacci(formData.value).then((data) => {
          formClose();
          message.success(t('view.updateSuccessful'));
          getDDServerStationTLaccis();
        });
      }
    });
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
