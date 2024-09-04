<template>
  <div style="height: 100%">
    <vxe-grid
      v-bind="tableConfig"
      id="mytable"
      ref="tableRef"
      :auto-resize="true"
      :loading="loading"
      :column-config="{ resizable: true }"
      :custom-config="{ storage: true }"
    >
      <template #msgStatus="{ row }">
        <span
          :style="{
            color:
              row.msgStatus == '故障'
                ? 'red'
                : row.msgStatus == '恢复'
                  ? 'green'
                  : row.msgStatus == '确认'
                    ? '#0960bd '
                    : '',
          }"
          >{{ row.msgStatus }}</span
        >
      </template>
    </vxe-grid>
  </div>
</template>
<script setup lang="ts">
  import { ref, reactive, createVNode, nextTick, watch } from 'vue';
  import { useDesign } from '@/hooks/web/useDesign';
  import { VxeGrid, VxeGridProps } from 'vxe-table';
  import messageApi from '@/api/message';

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
      { type: 'seq', title: '序号', width: 50, fixed: 'left' },
      {
        field: 'msgHisId',
        title: '记录ID',
        visible: false,
        showOverflow: true,
        showHeaderOverflow: true,
        fixed: 'left',
      },
      {
        field: 'serviceCode',
        title: '服务编号',
        showOverflow: true,
        visible: false,
        showHeaderOverflow: true,
        fixed: 'left',
      },
      {
        field: 'serviceName',
        title: '服务名称',
        showOverflow: true,
        showHeaderOverflow: true,
        fixed: 'left',
      },
      {
        field: 'msgType',
        title: '信息类型',
        showHeaderOverflow: true,
        visible: false,
      },
      {
        field: 'msgStatus',
        title: '信息状态',
        showOverflow: true,
        width: 100,
        showHeaderOverflow: true,
        slots: {
          default: 'msgStatus',
        },
      },
      {
        field: 'msgTitle',
        title: '信息标题',
        showHeaderOverflow: true,
      },
      {
        field: 'msgContent',
        title: '信息内容',
        showOverflow: false,
      },
      {
        field: 'msgStartTime',
        title: '告警时间',
        width: 150,
        showOverflow: true,
        showHeaderOverflow: true,
      },
      {
        field: 'remark',
        title: '备注信息',
        showOverflow: true,
        showHeaderOverflow: true,
        visible: false,
        sortable: true,
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
