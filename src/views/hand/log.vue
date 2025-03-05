<template>
  <div style="height: 100%">
    <vxe-grid
      :scroll-y="{ enabled: true }"
      v-bind="tableConfig"
      id="handIndex"
      ref="tableRef"
      :loading="loading"
      :row-config="{ keyField: 'handId' }"
      :column-config="{ resizable: true }"
      :custom-config="{ storage: true }"
      :seq-config="{ startIndex: (page.current - 1) * page.size }"
    >
      <template #fileName="{ row }">
        <a :href="row.filePath" :download="row.fileName">{{ row.fileName }}</a>
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
  </div>
</template>
<script setup lang="ts">
  import { ref, reactive, createVNode, nextTick, watch } from 'vue';
  import { VxeGrid, VxeGridProps } from 'vxe-table';
  import handApi from '@/api/hand';
  import { useI18n } from '@/hooks/web/useI18n';
  import { useLocaleStore } from '@/store/modules/locale';

  const { t } = useI18n();
  const localeStore = useLocaleStore();
  const locale = localeStore.getLocale;
  //vue3使用defineProps接收传过来的参数
  const props = defineProps({
    //增加组件
    handId: {
      type: String,
      default() {
        return null;
      },
    },
  });
  const loading = ref(true);
  const page = reactive({
    current: 1,
    size: 20,
    total: 0,
    sortlist: [],
  });

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
      },
      {
        field: 'dataTime',
        title: t('view.fileTime'),
        minWidth: 150,
        showOverflow: true,
      },
      {
        field: 'fileName',
        title: t('view.fileName'),
        showOverflow: true,
        minWidth: 200,

        slots: {
          default: 'fileName',
        },
      },
    ],
    data: [],
  });
  const tableRef = ref({});

  //获取软件包列表
  function getHandLog() {
    if (props.handId) {
      loading.value = true;
      handApi
        .GetHandLog({
          PageIndex: page.current,
          PageSize: page.size,
          handId: props.handId,
        })
        .then((data) => {
          loading.value = false;
          tableConfig.data = data.source;
          page.total = data.totalCount;
          page.current = data.pageIndex;
        })
        .catch(() => {
          loading.value = false;
          tableConfig.data = [];
          page.total = 0;
        });
    }
  }
  //页码改变
  function handlePageChange() {
    getHandLog();
  }

  watch(
    () => props.handId,
    () => {
      getHandLog();
    },
    { immediate: true },
  );
</script>
<style lang="less" scoped>
  @prefixCls: ~'@{namespace}-versionsManage-his-';

  .tableBtn {
    width: 100%;
  }

  :deep(.ant-upload-list-item-actions) {
    display: none;
  }
</style>
