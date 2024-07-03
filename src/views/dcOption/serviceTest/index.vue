<template>
  <MyContent :class="prefixCls">
    <a-spin :spinning="loading">
      <div style="width: 100%; height: 100%">
        <vxe-toolbar ref="toolbarRef" custom>
          <template #buttons>
            <div :class="`tableBtn`">
              <a-space direction="horizontal" size="small" style="margin-left: 5px">
                <AuthDom auth="dcOption_serviceTest_query">
                  <a-space
                    direction="horizontal"
                    size="small"
                    :wrap="true"
                    style="margin-bottom: 0"
                  >
                    <div class="row-div">
                      <a-space direction="horizontal" size="small" :wrap="true">
                        <label>自检时间：</label>
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
                          placeholder="请选择服务名称"
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
                        <a-button @click="initPage()" type="primary">查询</a-button>
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
            id="serviceTest"
            :border="true"
            max-height="100%"
            ref="tableRef"
            show-overflow
            :seq-config="{ startIndex: (page.current - 1) * page.size }"
            :custom-config="{ storage: true }"
            :row-config="{ isHover: true, useKey: true, keyField: 'testId' }"
            :column-config="{ resizable: true }"
            :tree-config="{ transform: true, rowField: 'testId', parentField: 'parentId' }"
            :data="tableConfigData"
            @sort-change="onSortChange"
          >
            <vxe-column field="testId" title="主键id" :visible="false" />
            <vxe-column field="serviceCode" title="服务编号" :visible="false" :sortable="true" />
            <vxe-column field="serviceName" title="服务名称" :sortable="true" />
            <vxe-column field="testStepName" title="自检名称" tree-node :sortable="true" />
            <vxe-column field="testStatus" title="自检状态" :sortable="true">
              <template #default="{ row }">
                <span
                  :class="{
                    defStatus: row.testStatus == 1,
                    jinGaoStatus: row.testStatus == 2,
                    errorStatus: row.testStatus != 2 && row.testStatus != 1,
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
            <vxe-column field="testStep" title="自检步骤(总数)" :sortable="true" />
            <vxe-column field="testTime" title="自检时间" :sortable="true" />
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
<script setup lang="ts">
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
    sortlist: ['testTime desc'],
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
        fullSort: getFullSort(),
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

  /**
   * 排序条件改变
   */
  function onSortChange({ field, order, sortList, column, property, $event }) {
    page.sortlist = [];
    sortList.forEach((item) => {
      var tempstr = item.field + ' ' + item.order;
      page.sortlist.push(tempstr);
    });
    getDCOptionServiceTests();
  }

  function initPage() {
    page.current = 1;
    page.total = 0;
    getDCOptionServiceTests();
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

  //获取服务列表
  function getServices() {
    serviceApi
      .GetServicesSimple({ serviceType: ['DCOption'] })
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

  .jinGaoStatus {
    color: #efa924;
  }
</style>
