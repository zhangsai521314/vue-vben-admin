<template>
  <MyContent>
    <a-spin :spinning="isRunGet">
      <!-- 开启多字段排序 -->
      <!-- :sort-config="{ multiple: true }" -->
      <vxe-grid
        :scroll-y="{ enabled: true }"
        v-bind="tableConfig"
        id="ddServcerLacci"
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
              <AuthDom auth="ddServcer_lacci_query">
                <a-space direction="horizontal" size="small" :wrap="true" style="margin-bottom: 0">
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
                      <label>{{ t('view.eciName') }}：</label>
                      <a-input
                        @press-enter="getDDServerTLaccis"
                        v-model:value="seacthContent.name"
                        :placeholder="t('view.enterEciNameToQuery')"
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
              <AuthDom auth="ddServcer_lacci_add">
                <a-space direction="horizontal" size="small" :wrap="true" style="margin-bottom: 0">
                  <div class="row-div">
                    <a-space direction="horizontal" size="small" :wrap="true">
                      <a-button class="ant-btn" @click="showFrom()">{{
                        t('view.addEci')
                      }}</a-button>
                    </a-space>
                  </div>
                </a-space>
              </AuthDom>
              <AuthDom auth="ddServcer_lacci_pusMq">
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
        <template #default="{ row }">
          <div :class="`tableOption`">
            <AuthDom auth="ddServcer_lacci_table_edit">
              <IconFontClass
                name="icon-baseui-edit-fill"
                @click="showFrom(row)"
                style="color: #0749df"
                :title="t('view.edit')"
              />
            </AuthDom>
            <AuthDom auth="ddServcer_lacci_table_delete">
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
            :label="t('view.eciName')"
            name="name"
            :rules="[
              { required: true, message: '' },
              { max: 40, message: t('view.eciNameIsTooLong') },
              { validator: formValidator.empty, message: t('view.pleaseEnterEciName') },
            ]"
          >
            <a-input
              :placeholder="t('view.pleaseEnterEciName')"
              v-model:value="formData.name"
              autocomplete="off"
            />
          </a-form-item>
          <a-form-item
            :label="t('view.eciNumber')"
            name="lacci"
            :rules="[
              { required: true, message: '' },
              { min: 4, message: t('view.eciNumberMustBe4To8Digits') },
              { max: 8, message: t('view.eciNumberMustBe4To8Digits') },
              { validator: formValidator.empty, message: t('view.pleaseEnterEciNumber') },
            ]"
          >
            <a-input
              :placeholder="t('view.pleaseEnterEciNumber')"
              v-model:value="formData.lacci"
              autocomplete="off"
            />
          </a-form-item>
          <a-form-item
            name="longitude"
            :label="t('view.longitude')"
            :rules="[{ validator: formValidator.longitude }]"
          >
            <a-input
              style="width: 262px"
              :placeholder="t('view.pleaseEnterLongitude')"
              v-model:value="formData.longitude"
              autocomplete="off"
            />
          </a-form-item>
          <a-form-item
            name="latitude"
            :label="t('view.latitude')"
            :rules="[{ validator: formValidator.latitude }]"
          >
            <a-input
              style="width: 262px"
              :placeholder="t('view.pleaseEnterLatitude')"
              v-model:value="formData.latitude"
              autocomplete="off"
            />
          </a-form-item>
          <a-form-item
            name="reamrk"
            :label="t('view.remark')"
            :rules="[{ max: 250, message: t('view.remarkIsTooLong') }]"
          >
            <a-textarea
              :placeholder="t('view.pleaseInputRemarkInformation')"
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
  import { ref, reactive, createVNode } from 'vue';
  import { VxeGrid, VxeGridProps } from 'vxe-table';
  import { Lacci as lacciApi } from '@/api/ddServcer';
  import commonApi from '@/api/common';
  import { useMqttStoreWithOut } from '@/store/modules/mqtt';
  import { message, Modal } from 'ant-design-vue';
  import { ExclamationCircleOutlined } from '@ant-design/icons-vue';
  import { useI18n } from '@/hooks/web/useI18n';
  import { useLocaleStore } from '@/store/modules/locale';

  const { t } = useI18n();
  const localeStore = useLocaleStore();
  const locale = localeStore.getLocale;
  defineOptions({ name: 'DDServcerLacci' });
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
        field: 'id',
        title: t('view.recordId'),
        sortable: true,
        visible: false,
        fixed: 'left',
        minWidth: locale == 'zh-CN' ? 130 : 150,
      },
      {
        field: 'name',
        title: t('view.eciName'),
        showOverflow: true,
        sortable: true,
        minWidth: locale == 'zh-CN' ? 100 : 110,
        fixed: 'left',
      },
      {
        field: 'lacci',
        title: t('view.eciNumber'),
        showOverflow: true,
        sortable: true,
        minWidth: locale == 'zh-CN' ? 100 : 120,
      },
      {
        field: 'longitude',
        title: t('view.longitude'),
        showOverflow: true,
        sortable: true,
        minWidth: 100,
      },

      {
        field: 'latitude',
        title: t('view.latitude'),
        showOverflow: true,
        sortable: true,
        minWidth: 100,
      },
      {
        field: 'reamrk',
        title: t('view.remarks'),
        showOverflow: true,
        visible: false,
        sortable: true,
        minWidth: 100,
      },
      {
        field: 'action_',
        title: t('view.action'),
        minWidth: 90,
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
    sortlist: ['lacci asc'],
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
      title: t('view.areYouSureYouWantToDelete'),
      icon: createVNode(ExclamationCircleOutlined),
      content: '',
      onOk() {
        isRunGet.value = true;
        lacciApi
          .DeleteDDServerTLacci(row.id.toString())
          .then(() => {
            isRunGet.value = false;
            message.success(t('view.deletionSuccessful'));
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
          message.error(t('view.failedToRetrieveEciInformation'));
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
          message.success(t('view.additionSuccessful'));
          page.total = page.total + 1;
        });
      } else {
        lacciApi.UpdateDDServerTLacci(formData.value).then((data) => {
          const oldData = tableConfig.data.find((m) => m.id == data.id);
          if (oldData) {
            myCommon.objectReplace(oldData, formData.value);
          }
          formClose();
          message.success(t('view.updateSuccessful'));
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
