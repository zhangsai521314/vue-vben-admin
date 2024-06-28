<template>
  <MyContent :class="prefixCls">
    <div>
      <div style="width: 100%; height: 100%">
        <gplot ref="graphObRef" :gplotId="_gplotId" :menuId="_menuId" :viewType="props.viewType" />
      </div>
      <div style="display: none; width: 100%">
        <vxe-toolbar ref="toolbarRef" custom />
        <vxe-table
          id="bu_jia_id_storage_wu_xiao"
          height="400px"
          :border="true"
          ref="tableAlarmRef"
          show-overflow
          :row-config="{ isHover: true, useKey: true }"
          :custom-config="{ storage: true }"
          :column-config="{ resizable: true }"
          :data="mqttStore.msgData"
        >
          <vxe-column field="msgId" title="告警id" :visible="false" />
          <vxe-column field="serviceId" title="服务id" :visible="false" />
          <vxe-column field="serviceCode" title="服务编号" :visible="false" />
          <vxe-column field="serviceName" title="服务名称" />
          <vxe-column field="msgType" title="信息类型" :visible="false">
            <template #default="{ row }">
              {{
                dictionariesData.find((m) => row.msgType == m.dictionariesKey)
                  ? dictionariesData.find((m) => row.msgType == m.dictionariesKey).label
                  : row.msgType
              }}
            </template>
          </vxe-column>
          <vxe-column field="msgTitle" title="信息标题" />
          <vxe-column field="msgContent" title="信息内容" :showOverflow="false" />
          <vxe-column field="msgStatus" title="信息状态" width="80">
            <template #default="{ row }">
              <span
                :style="{
                  color:
                    row.msgStatus == 1
                      ? 'red'
                      : row.msgStatus == 2
                        ? 'green'
                        : row.msgStatus == 3
                          ? '#0960bd '
                          : '',
                }"
              >
                {{
                  row.msgClass == 1
                    ? '提示'
                    : row.msgStatus == 1
                      ? '故障'
                      : row.msgStatus == 2
                        ? '恢复'
                        : ''
                }}</span
              >
            </template>
          </vxe-column>
          <vxe-column field="msgStartTime" title="告警开始时间" width="150">
            <template #default="{ row }">
              {{ row.msgStartTime ? dayjs(row.msgStartTime).format('YYYY-MM-DD HH:mm:ss') : '' }}
            </template>
          </vxe-column>
          <vxe-column field="msgEndTime" title="告警结束时间" width="150">
            <template #default="{ row }">
              {{ row.msgEndTime ? dayjs(row.msgEndTime).format('YYYY-MM-DD HH:mm:ss') : '' }}
            </template>
          </vxe-column>
          <vxe-column field="msgDuration" title="告警持续时间" width="120">
            <template #default="{ row }">
              {{
                row.msgDuration == null
                  ? ''
                  : row.msgDuration >= 0 && row.msgDuration <= 60
                    ? `${parseInt(row.msgDuration)}秒`
                    : row.msgDuration > 60 && row.msgDuration <= 3600
                      ? `${parseFloat(row.msgDuration / 60).toFixed(1)}分`
                      : row.msgDuration > 3600 && row.msgDuration <= 86400
                        ? `${parseFloat(row.msgDuration / 60 / 60).toFixed(1)}时`
                        : row.msgDuration > 86400
                          ? `${parseFloat(row.msgDuration / 60 / 60 / 24).toFixed(1)}天`
                          : ''
              }}
            </template>
          </vxe-column>
          <vxe-column field="confirmTime" title="确认时间" width="150">
            <template #default="{ row }">
              {{ row.confirmTime ? dayjs(row.confirmTime).format('YYYY-MM-DD HH:mm:ss') : '' }}
            </template>
          </vxe-column>
          <vxe-column field="confirmUser" title="确认人员" :visible="false" />
        </vxe-table>
      </div>
    </div>
  </MyContent>
</template>

<script setup lang="ts">
  import { useRouter } from 'vue-router';
  import gplot from './components/gplot.vue';
  import { useDesign } from '@/hooks/web/useDesign';
  import { unref, ref, onMounted } from 'vue';
  import { useMqttStoreWithOut } from '@/store/modules/mqtt';
  import dictionariesApi from '@/api/dictionaries';
  import dayjs from 'dayjs';

  const props = defineProps({
    viewType: {
      type: String,
      default() {
        return 'monitor';
      },
    },
    gplotId: {
      type: String,
      default() {
        return null;
      },
    },
  });
  defineOptions({ name: 'GplotIndex' });
  const { prefixCls } = useDesign('GplotIndex-');
  const mqttStore = useMqttStoreWithOut();
  const dictionariesData = ref([]);
  //获取url参数
  const { currentRoute } = useRouter();
  const _gplotId = ref(props.gplotId);
  const tableAlarmRef = ref({});
  const toolbarRef = ref({});
  const _menuId = ref();
  const { menuId } = unref(currentRoute).params;
  _menuId.value = menuId;

  getDictionaries();
  //获取字典
  function getDictionaries() {
    dictionariesApi
      .GetDictionariesimple({
        dictionariesclass: ['msgType'],
      })
      .then((data) => {
        dictionariesData.value = data;
      })
      .catch(() => {
        dictionariesData.value = [];
      });
  }

  onMounted(() => {
    // // 将表格和工具栏进行关联
    const $table = tableAlarmRef.value;
    const $toolbar = toolbarRef.value;
    if ($table && $toolbar) {
      $table.connect($toolbar);
    }
  });
</script>

<style lang="less" scoped>
  @prefixCls: ~'@{namespace}-GplotIndex-';
  .@{prefixCls} {
    > div {
      display: flex;
      flex-direction: column;
      width: 100%;
      height: 100%;
    }
  }
</style>
