<template>
  <MyContent :class="prefixCls">
    <a-spin :spinning="loading">
      <div style="width: 100%; height: 100%">
        <vxe-toolbar ref="toolbarRef" custom>
          <template #buttons>
            <div :class="`tableBtn`">
              <a-space direction="horizontal" size="small" style="margin-left: 5px">
                <AuthDom auth="message_query">
                  <a-space
                    direction="horizontal"
                    size="small"
                    :wrap="true"
                    style="margin-bottom: 0"
                  >
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
                        <a-button @click="getDCOptionServiceTests()" type="primary">查询</a-button>
                      </a-space>
                    </div>
                  </a-space>
                </AuthDom>
              </a-space>
            </div>
          </template>
        </vxe-toolbar>
        <div style="width: 100%; height: calc(100% - 80px)">
          <vxe-table
            :border="true"
            max-height="100%"
            ref="tableRef"
            show-overflow
            :custom-config="{ storage: true }"
            :row-config="{ isHover: true, useKey: true, keyField: 'testId' }"
            :column-config="{ resizable: true }"
            :tree-config="{ transform: true, rowField: 'testId', parentField: 'parentId' }"
            :data="tableConfigData"
          >
            <vxe-column field="testId" title="主键id" :visible="false" />
            <vxe-column field="serviceCode" title="服务编号" :visible="false" />
            <vxe-column field="serviceName" title="服务名称" />
            <vxe-column field="testStepName" title="自检名称" tree-node />
            <vxe-column field="testStatus" title="自检状态">
              <template #default="{ row }">
                <span
                  :class="{
                    defStatus: row.testStatus == 1,
                    errorStatus: row.testStatus != 1,
                  }"
                  >{{
                    row.testStatus == 0
                      ? '未自检'
                      : row.testStatus == 1
                        ? '通过'
                        : row.testStatus == 2
                          ? '跳过'
                          : '失败'
                  }}</span
                >
              </template>
            </vxe-column>
            <vxe-column field="testStep" title="自检步骤(总数)" />
            <vxe-column field="testTime" title="自检时间" />
          </vxe-table>
          <vxe-pager
            background
            v-model:current-page="page.current"
            v-model:page-size="page.size"
            :total="page.total"
            @page-change="handlePageChange"
          />
        </div>
      </div>
    </a-spin>
  </MyContent>
</template>
<script setup lang="tsx">
  import AntVueCommon from '@/utils/MyCommon/AntVueCommon';
  import { ref, reactive, createVNode, nextTick, watch, onMounted } from 'vue';
  import { useDesign } from '@/hooks/web/useDesign';
  import { ServiceTest as serviceTestApi } from '@/api/dcOption';
  import serviceApi from '@/api/software';

  defineOptions({ name: 'DCOptionServiceTest' });
  const { prefixCls } = useDesign('DCOptionServiceTest-');
  const loading = ref(true);
  const tableConfigData = ref([]);
  const tableRef = ref({});
  const toolbarRef = ref({});
  const seacthContent = ref({
    serviceId: null,
    startTime: null,
    endTime: null,
  });
  const timeValue = ref(null);
  const serviceData = ref([]);
  const page = reactive({
    current: 1,
    size: 20,
    total: 0,
  });

  getDCOptionServiceTests();
  getServices();

  //获取列表
  function getDCOptionServiceTests() {
    loading.value = true;
    seacthContent.value.startTime =
      timeValue.value == null ? null : timeValue.value[0].format('YYYY-MM-DD HH:mm:ss');
    seacthContent.value.endTime =
      timeValue.value == null ? null : timeValue.value[1].format('YYYY-MM-DD HH:mm:ss');
    serviceTestApi
      .GetDCOptionServiceTests({
        ...seacthContent.value,
        PageIndex: page.current,
        PageSize: page.size,
        execompleteBefore: () => {
          loading.value = false;
        },
      })
      .then((data) => {
        tableConfigData.value = data.source;
        page.total = data.totalCount;
      })
      .catch(() => {
        tableConfigData.value = [];
        page.total = 0;
      });
  }

  function handlePageChange() {
    getDCOptionServiceTests();
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

  onMounted(() => {
    // 将表格和工具栏进行关联
    const $table = tableRef.value;
    const $toolbar = toolbarRef.value;
    if ($table && $toolbar) {
      $table.connect($toolbar);
    }
  });
</script>
<style lang="less" scoped>
  @prefixCls: ~'@{namespace}-DCOptionServiceTest-';

  .@{prefixCls} {
    .@{prefixCls}tableBtn {
      width: 100%;
    }
  }
</style>
<style lang="less">
  .defStatus {
    color: green;
  }

  .errorStatus {
    color: red;
  }
</style>
