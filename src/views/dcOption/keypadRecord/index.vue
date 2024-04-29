<template>
  <MyContent :class="prefixCls">
    <vxe-grid
      v-bind="tableConfig"
      id="mytable"
      ref="tableRef"
      :loading="loading"
      :row-config="{ keyField: 'keyId' }"
      :column-config="{ resizable: true }"
      :custom-config="{ storage: true }"
    >
      <template #toolbar_buttons>
        <div :class="`tableBtn`">
          <a-space direction="horizontal" size="small" style="margin-left: 5px">
            <AuthDom auth="message_query">
              <a-space direction="horizontal" size="small" :wrap="true" style="margin-bottom: 0">
                <div class="row-div">
                  <a-space direction="horizontal" size="small" :wrap="true">
                    <label>按键时间：</label>
                    <a-config-provider :locale="zhCN">
                      <a-range-picker
                        allowClear
                        v-model:value="timeValue"
                        :showTime="true"
                        format="YYYY-MM-DD HH:mm:ss"
                      />
                    </a-config-provider>
                  </a-space>
                </div>
                <div class="row-div">
                  <a-space direction="horizontal" size="small" :wrap="true">
                    <label>服务名称：</label>
                    <a-select
                      style="width: 170px"
                      allow-clear
                      show-search
                      :filter-option="AntVueCommon.filterOption"
                      v-model:value="seacthContent.serviceId"
                      :options="serviceData"
                    />
                  </a-space>
                </div>
                <div class="row-div">
                  <a-space direction="horizontal" size="small" :wrap="true">
                    <a-button @click="getDCOptionCallRecords()" type="primary">查询</a-button>
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
    </vxe-grid>
  </MyContent>
</template>
<script setup lang="tsx">
  import myCommon from '@/utils/MyCommon/common';
  import AntVueCommon from '@/utils/MyCommon/AntVueCommon';
  import { ref, reactive, createVNode, nextTick, onMounted, watch, unref } from 'vue';
  import { useDesign } from '@/hooks/web/useDesign';
  import { VxeGrid, VxeGridProps } from 'vxe-table';
  import { KeypadRecord as keypadRecordApi } from '@/api/dcOption';
  import serviceApi from '@/api/software';
  import zhCN from 'ant-design-vue/es/locale/zh_CN';
  import dayjs from 'dayjs';
  import 'dayjs/locale/zh-cn';
  import { message, Modal } from 'ant-design-vue';

  defineOptions({ name: 'KeypadRecord' });
  const { prefixCls } = useDesign('keypadRecord-');
  const loading = ref(true);
  const tableConfig = reactive<VxeGridProps>({
    height: 'auto',
    columns: [
      //基础
      { type: 'seq', title: '序号', width: 50 },
      {
        field: 'keyId',
        title: '主键ID',
        visible: false,
        showOverflow: true,
        showHeaderOverflow: true,
      },
      {
        field: 'serviceName',
        title: '服务名称',
        showOverflow: true,
        showHeaderOverflow: true,
      },
      {
        field: 'serviceCode',
        title: '服务编号',
        visible: false,
        showOverflow: true,
        showHeaderOverflow: true,
      },
      {
        field: 'content',
        title: '按键内容',
        showOverflow: false,
        showHeaderOverflow: true,
      },
      {
        field: 'startTime',
        title: '按键开始时间',
        width: 150,
        showOverflow: true,
        showHeaderOverflow: true,
      },
      {
        field: 'endTime',
        title: '按键结束时间',
        width: 150,
        showOverflow: true,
        showHeaderOverflow: true,
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
  const tableRef = ref({});
  const seacthContent = ref({
    serviceId: null,
    startTime: null,
    endTime: null,
  });
  const timeValue = ref(null);
  //   [
  //   dayjs(dayjs().subtract(7, 'day').format('YYYY-MM-DD')),
  //   dayjs(dayjs().add(1, 'day').format('YYYY-MM-DD')),
  // ]
  const serviceData = ref([]);
  const page = reactive({
    current: 1,
    size: 20,
    total: 0,
  });

  getDCOptionCallRecords();
  getServices();

  //获取列表
  function getDCOptionCallRecords() {
    loading.value = true;
    seacthContent.value.startTime =
      timeValue.value == null ? null : timeValue.value[0].format('YYYY-MM-DD HH:mm:ss');
    seacthContent.value.endTime =
      timeValue.value == null ? null : timeValue.value[1].format('YYYY-MM-DD HH:mm:ss');
    keypadRecordApi
      .GetDCOptionKeypadRecords({
        PageIndex: page.current,
        PageSize: page.size,
        ...seacthContent.value,
        execompleteBefore: () => {
          loading.value = false;
        },
      })
      .then((data) => {
        tableConfig.data = data.source;
        page.total = data.totalCount;
      })
      .catch(() => {
        tableConfig.data = [];
        page.total = 0;
      });
  }

  function handlePageChange() {
    getDCOptionCallRecords();
  }

  //获取服务列表
  function getServices() {
    serviceApi
      .GetServicesSimple({})
      .then((data) => {
        serviceData.value = data;
      })
      .catch(() => {
        serviceData.value = [];
      });
  }
</script>
<style lang="less" scoped>
  @prefixCls: ~'@{namespace}-keypadRecord-';

  .@{prefixCls} {
    .row-div {
      height: 30px;
    }

    .tableBtn {
      width: 100%;
    }
  }
  .@{prefixCls}play {
    width: 100%;
    height: 370px;
  }
</style>
