<template>
  <div style="height: 100%">
    <vxe-grid
      :scroll-y="{ enabled: true }"
      v-bind="tableConfig"
      id="messageHis"
      ref="tableRef"
      :auto-resize="true"
      :loading="loading"
      :column-config="{ resizable: true }"
      :custom-config="{ storage: true }"
    >
      <template #msgStatus="{ row }">
        <span
          :style="{
            color: row.msgStatus == 1 ? 'red' : row.msgStatus == 2 ? 'green' : '',
          }"
          >{{ row.msgStatus == 1 ? '故障' : row.msgStatus == 2 ? '恢复' : row.msgStatus }}</span
        >
      </template>
    </vxe-grid>
  </div>
</template>
<script setup lang="ts">
  import { ref, reactive, watch } from 'vue';
  import { useDesign } from '@/hooks/web/useDesign';
  import { VxeGrid, VxeGridProps } from 'vxe-table';
  import messageApi from '@/api/message';
  import { useI18n } from '@/hooks/web/useI18n';
  import { useLocaleStore } from '@/store/modules/locale';

  const { t } = useI18n();
  const localeStore = useLocaleStore();
  const locale = localeStore.getLocale;
  //vue3使用defineProps接收传过来的参数
  const props = defineProps({
    //增加组件
    msgId: {
      type: String,
      default() {
        return null;
      },
    },
  });
  const { prefixCls } = useDesign('message-his');
  const loading = ref(true);
  const tableConfig = reactive<VxeGridProps>({
    height: 'auto',
    columns: [
      //基础
      { type: 'seq', showOverflow: true, title: t('view.serialNumber'), width: 50, fixed: 'left' },
      {
        field: 'msgHisId',
        title: t('view.recordId'),
        visible: false,
        showOverflow: true,
        fixed: 'left',
      },
      {
        field: 'msgStartTime',
        title: '告警时间',
        width: 150,
        showOverflow: true,
      },
      {
        field: 'msgStatus',
        title: '信息状态',
        width: 100,
        showOverflow: true,
        slots: {
          default: 'msgStatus',
        },
      },
      {
        field: 'msgTitle',
        title: '信息标题',
        width: 150,
        showOverflow: true,
      },
      {
        field: 'msgContent',
        title: '信息内容',
        width: 150,
        showOverflow: false,
      },
      {
        field: 'remark',
        title: '备注信息',
        showOverflow: true,
        width: 150,
        visible: false,
      },
    ],
    toolbarConfig: {
      custom: true,
    },
    data: [],
  });

  //获取软件包列表
  function getMessagesHis() {
    if (props.msgId) {
      loading.value = true;
      messageApi
        .GetMessagesHis(props.msgId)
        .then((data) => {
          loading.value = false;
          tableConfig.data = data;
        })
        .catch(() => {
          loading.value = false;
          tableConfig.data = [];
        });
    }
  }

  watch(
    () => props.msgId,
    () => {
      getMessagesHis();
    },
    { immediate: true },
  );
</script>
<style lang="less" scoped>
  @prefixCls: ~'@{namespace}-message-his-';

  .tableBtn {
    width: 100%;
  }
</style>
