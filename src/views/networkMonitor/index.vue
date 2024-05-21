<template>
  <MyContent :class="prefixCls">
    <div ref="mountRef" id="mountNode" style="width: 100%; height: calc(100% - 456px)"> </div>
    <div style="width: 100%; margin-bottom: 4px">
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
        <vxe-column field="serviceCode" title="服务编号" :visible="false">
          <template #default="{ row }">
            {{
              serviceData.find((m) => row.joinId == m.key)
                ? serviceData.find((m) => row.joinId == m.key).serviceCode
                : ''
            }}
          </template></vxe-column
        >
        <vxe-column field="serviceName" title="服务名称">
          <template #default="{ row }">
            {{
              serviceData.find((m) => row.joinId == m.key)
                ? serviceData.find((m) => row.joinId == m.key).label
                : ''
            }}
          </template>
        </vxe-column>
        <vxe-column field="msgType" title="信息类型">
          <template #default="{ row }">
            {{
              dictionariesData.find((m) => row.msgType == m.dictionarieskey)
                ? dictionariesData.find((m) => row.msgType == m.dictionarieskey).label
                : row.msgType
            }}
          </template>
        </vxe-column>
        <vxe-column field="msgTitle" title="信息标题" />
        <vxe-column field="msgContent" title="信息内容" />
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
              {{ row.msgStatus == 1 ? '故障' : row.msgStatus == 2 ? '恢复' : '' }}</span
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
                  : row.msgDuration > 60 && row.msgDuration <= 360
                    ? `${parseInt(row.msgDuration / 60)}分`
                    : row.msgDuration > 360 && row.msgDuration <= 86400
                      ? `${parseInt(row.msgDuration / 60 / 60)}时`
                      : row.msgDuration > 86400
                        ? `${parseInt(row.msgDuration / 60 / 60 / 24)}天`
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
  </MyContent>
</template>
<script setup lang="ts">
  import { ref, reactive, onMounted, watch, unref, nextTick } from 'vue';
  import { useMqttStoreWithOut } from '@/store/modules/mqtt';
  import { useDesign } from '@/hooks/web/useDesign';
  import { useAppStore } from '@/store/modules/app';
  import G6, { Graph, GraphData, Extensions, extend } from '@antv/g6';
  import { Data } from './data';
  import dayjs from 'dayjs';
  import dictionariesApi from '@/api/dictionaries';
  import serviceApi from '@/api/software';

  defineOptions({ name: 'NetworkMonitor' });
  const { prefixCls } = useDesign('networkMonitor-');
  const mqttStore = useMqttStoreWithOut();
  const appStore = useAppStore();
  let graph;
  const tableAlarmRef = ref({});
  const toolbarRef = ref({});
  const dictionariesData = ref([]);
  const serviceData = ref([]);
  const mountRef = ref<HTMLElement>();

  getDictionaries();
  getServices();

  function g6() {
    //https://g6-next.antv.antgroup.com/apis/item/node/image-node
    //方法：https://g6-next.antv.antgroup.com/apis/graph/graph
    //节点 Node 、边 Edge 和节点分组 Combo
    // 图实例化，至少需要为图设置挂载容器、宽、高
    // const ExtGraph = extend(Graph, {
    //   nodes: {
    //     'modelRect-node': Extensions.ModelRectNode,
    //   },
    // });
    graph = new G6.Graph({
      container: 'mountNode', // 指定挂载容器
      width: mountRef.value?.clientWidth, // 图的宽度
      height: mountRef.value?.clientHeight, // 图的高度
      plugins: [
        {
          type: 'lod-controller',
          disableLod: true, //是否禁用信息分层渲染>增加了这个文字的显示不收缩放影响了
        },
      ],
      // autoFit: 'view',
      // //功能控制
      modes: {
        // default: ['zoom-canvas', 'drag-canvas', 'drag-node'],
        default: ['zoom-canvas'],
      },
      combo: (model) => {
        return {
          id: model.id,
          data: {
            ...model.data,
          },
        };
      },
      data: {
        nodes: [
          {
            id: '517830229491787',
            data: {
              type: 'rect-node',
              parentId: 'combo_fuwuqi',
              x: 580,
              //y: 30,
              keyShape: {
                width: 200,
                height: 120,
                fill: '',
              },
              iconShape: {
                // 自定义字体名称需要设置不然iconfont显示不了，fontFamily 必须和 iconfont.css 里面的 font-family 保持一致！！！！！！！！！
                fontFamily: 'iconfont',
                fill: 'green',
                show: true,
                text: '\ue6ec', //text属性 为 iconfont.css 中的content ，记得在斜线后加u
                width: 50,
                height: 50,
                offsetY: -15,
              },
              labelShape: {
                text: '调度服务器(主)',
                fontSize: 20,
                offsetY: 25,
                position: 'center',
                maxWidth: '300%',
                fill: 'green',
                font: 'normal normal normal 12px "PingFang SC"',
                fontFamily: '"PingFang SC"',
                // maxLines: 2,
              },
            },
          },
          {
            id: '521994003796043',
            data: {
              type: 'rect-node',
              parentId: 'combo_fuwuqi',
              x: 860,
              //y: 30,
              keyShape: {
                width: 200,
                height: 120,
                fill: '',
              },
              iconShape: {
                // 自定义字体名称需要设置不然iconfont显示不了，fontFamily 必须和 iconfont.css 里面的 font-family 保持一致！！！！！！！！！
                fontFamily: 'iconfont',
                fill: 'green',
                show: true,
                text: '\ue6ec', //text属性 为 iconfont.css 中的content ，记得在斜线后加u
                width: 50,
                height: 50,
                offsetY: -15,
              },
              labelShape: {
                text: '调度服务器(备)',
                fontSize: 20,
                offsetY: 25,
                position: 'center',
                maxWidth: '300%',
                fill: 'green',
                font: 'normal normal normal 12px "PingFang SC"',
                fontFamily: '"PingFang SC"',
                // maxLines: 2,
              },
            },
          },
          {
            id: '521994196049995',
            data: {
              type: 'rect-node',
              parentId: 'combo_fuwuqi',
              x: 1140,
              //y: 30,
              keyShape: {
                width: 200,
                height: 120,
                fill: '',
              },
              iconShape: {
                // 自定义字体名称需要设置不然iconfont显示不了，fontFamily 必须和 iconfont.css 里面的 font-family 保持一致！！！！！！！！！
                fontFamily: 'iconfont',
                fill: 'green',
                show: true,
                text: '\ue6e5', //text属性 为 iconfont.css 中的content ，记得在斜线后加u
                width: 50,
                height: 50,
                offsetY: -15,
              },
              labelShape: {
                text: '智能网服务器(主)',
                fontSize: 18,
                offsetY: 25,
                position: 'center',
                maxWidth: '300%',
                maxLines: 2,
                font: 'normal normal normal 12px "PingFang SC"',
                fontFamily: '"PingFang SC"',
                fill: 'green',
              },
            },
          },
          {
            id: '521999945547851',
            data: {
              type: 'rect-node',
              parentId: 'combo_fuwuqi',
              x: 1420,
              //y: 30,
              keyShape: {
                offsetY: -110,
                width: 200,
                height: 120,
                fill: '',
              },
              iconShape: {
                // 自定义字体名称需要设置不然iconfont显示不了，fontFamily 必须和 iconfont.css 里面的 font-family 保持一致！！！！！！！！！
                fontFamily: 'iconfont',
                fill: 'green',
                show: true,
                text: '\ue6e5', //text属性 为 iconfont.css 中的content ，记得在斜线后加u
                width: 50,
                height: 50,
                offsetY: -15,
              },
              labelShape: {
                text: '智能网服务器(备)',
                fontSize: 18,
                offsetY: 25,
                position: 'center',
                maxWidth: '300%',
                maxLines: 2,
                font: 'normal normal normal 12px "PingFang SC"',
                fontFamily: '"PingFang SC"',
                fill: 'green',
              },
            },
          },
          {
            id: '522044780953675',
            data: {
              type: 'rect-node',
              parentId: 'combo_fuwuqi',
              x: 1700,
              //y: 30,
              keyShape: {
                width: 200,
                height: 120,
                fill: '',
              },
              iconShape: {
                // 自定义字体名称需要设置不然iconfont显示不了，fontFamily 必须和 iconfont.css 里面的 font-family 保持一致！！！！！！！！！
                fontFamily: 'iconfont',
                fill: 'green',
                show: true,
                text: '\ue6e0', //text属性 为 iconfont.css 中的content ，记得在斜线后加u
                width: 50,
                height: 50,
                offsetY: -15,
              },
              labelShape: {
                text: '录音服务器',
                fontSize: 18,
                offsetY: 25,
                position: 'center',
                maxWidth: '300%',
                maxLines: 2,
                font: 'normal normal normal 12px "PingFang SC"',
                fontFamily: '"PingFang SC"',
                fill: 'green',
              },
            },
          },

          {
            id: '522045670068299',
            data: {
              type: 'rect-node',
              parentId: 'combo_diaodutai',
              x: 1140,
              y: 150,
              keyShape: {
                width: 200,
                height: 120,
                fill: '',
              },
              iconShape: {
                // 自定义字体名称需要设置不然iconfont显示不了，fontFamily 必须和 iconfont.css 里面的 font-family 保持一致！！！！！！！！！
                fontFamily: 'iconfont',
                fill: 'green',
                show: true,
                text: '\ue6e3', //text属性 为 iconfont.css 中的content ，记得在斜线后加u
                width: 50,
                height: 50,
                offsetY: -15,
              },
              labelShape: {
                text: '调度台',
                fontSize: 18,
                offsetY: 25,
                position: 'center',
                maxWidth: '300%',
                maxLines: 2,
                font: 'normal normal normal 12px "PingFang SC"',
                fontFamily: '"PingFang SC"',
                fill: 'green',
              },
            },
          },

          {
            id: '522045728026699',
            data: {
              type: 'rect-node',
              parentId: 'combo_diaodutai',
              x: 430,
              y: 240,
              keyShape: {
                width: 200,
                height: 120,
                fill: '',
              },
              iconShape: {
                // 自定义字体名称需要设置不然iconfont显示不了，fontFamily 必须和 iconfont.css 里面的 font-family 保持一致！！！！！！！！！
                fontFamily: 'iconfont',
                fill: 'green',
                show: true,
                text: '\ue6e4', //text属性 为 iconfont.css 中的content ，记得在斜线后加u
                width: 50,
                height: 50,
                offsetY: -15,
              },
              labelShape: {
                text: '马瑞巴亚港',
                fontSize: 18,
                offsetY: 25,
                position: 'center',
                maxWidth: '300%',
                maxLines: 2,
                font: 'normal normal normal 12px "PingFang SC"',
                fontFamily: '"PingFang SC"',
                fill: 'green',
              },
            },
          },
          {
            id: '522045728034891',
            data: {
              type: 'rect-node',
              parentId: 'combo_diaodutai',
              x: 714,
              y: 240,
              keyShape: {
                width: 200,
                height: 120,
                fill: '',
              },
              iconShape: {
                // 自定义字体名称需要设置不然iconfont显示不了，fontFamily 必须和 iconfont.css 里面的 font-family 保持一致！！！！！！！！！
                fontFamily: 'iconfont',
                fill: 'green',
                show: true,
                text: '\ue6e4', //text属性 为 iconfont.css 中的content ，记得在斜线后加u
                width: 50,
                height: 50,
                offsetY: -15,
              },
              labelShape: {
                text: '穆萨亚',
                fontSize: 18,
                offsetY: 25,
                position: 'center',
                maxWidth: '300%',
                maxLines: 2,
                font: 'normal normal normal 12px "PingFang SC"',
                fontFamily: '"PingFang SC"',
                fill: 'green',
              },
            },
          },
          {
            id: '522045728038987',
            data: {
              type: 'rect-node',
              parentId: 'combo_diaodutai',
              x: 998,
              y: 240,
              keyShape: {
                width: 200,
                height: 120,
                fill: '',
              },
              iconShape: {
                // 自定义字体名称需要设置不然iconfont显示不了，fontFamily 必须和 iconfont.css 里面的 font-family 保持一致！！！！！！！！！
                fontFamily: 'iconfont',
                //opacity: 0.8,
                fill: 'green',
                show: true,
                text: '\ue6e4', //text属性 为 iconfont.css 中的content ，记得在斜线后加u
                width: 50,
                height: 50,
                offsetY: -15,
              },
              labelShape: {
                text: '科里巴',
                fontSize: 18,
                offsetY: 25,
                position: 'center',
                maxWidth: '300%',
                maxLines: 2,
                font: 'normal normal normal 12px "PingFang SC"',
                fontFamily: '"PingFang SC"',
                fill: 'green',
              },
            },
          },
          {
            id: '522045728059467',
            data: {
              type: 'rect-node',
              parentId: 'combo_diaodutai',
              x: 1282,
              y: 240,
              keyShape: {
                width: 200,
                height: 120,
                fill: '',
              },
              iconShape: {
                // 自定义字体名称需要设置不然iconfont显示不了，fontFamily 必须和 iconfont.css 里面的 font-family 保持一致！！！！！！！！！
                fontFamily: 'iconfont',
                fill: 'green',
                show: true,
                text: '\ue6e4', //text属性 为 iconfont.css 中的content ，记得在斜线后加u
                width: 50,
                height: 50,
                offsetY: -15,
              },
              labelShape: {
                text: '卡萨',
                fontSize: 18,
                offsetY: 25,
                position: 'center',
                maxWidth: '300%',
                maxLines: 2,
                font: 'normal normal normal 12px "PingFang SC"',
                fontFamily: '"PingFang SC"',
                fill: 'green',
              },
            },
          },
          {
            id: '522045728067659',
            data: {
              type: 'rect-node',
              parentId: 'combo_diaodutai',
              x: 1566,
              y: 240,
              keyShape: {
                width: 200,
                height: 120,
                fill: '',
              },
              iconShape: {
                // 自定义字体名称需要设置不然iconfont显示不了，fontFamily 必须和 iconfont.css 里面的 font-family 保持一致！！！！！！！！！
                fontFamily: 'iconfont',
                fill: 'green',
                show: true,
                text: '\ue6e4', //text属性 为 iconfont.css 中的content ，记得在斜线后加u
                width: 50,
                height: 50,
                offsetY: -15,
              },
              labelShape: {
                text: '乌尔卡巴',
                fontSize: 18,
                offsetY: 25,
                position: 'center',
                maxWidth: '300%',
                maxLines: 2,
                font: 'normal normal normal 12px "PingFang SC"',
                fontFamily: '"PingFang SC"',
                fill: 'green',
              },
            },
          },
          {
            id: '522045728075851',
            data: {
              type: 'rect-node',
              parentId: 'combo_diaodutai',
              x: 1850,
              y: 240,
              keyShape: {
                width: 200,
                height: 120,
                fill: '',
              },
              iconShape: {
                // 自定义字体名称需要设置不然iconfont显示不了，fontFamily 必须和 iconfont.css 里面的 font-family 保持一致！！！！！！！！！
                fontFamily: 'iconfont',
                fill: 'green',
                show: true,
                text: '\ue6e4', //text属性 为 iconfont.css 中的content ，记得在斜线后加u
                width: 50,
                height: 50,
                offsetY: -15,
              },
              labelShape: {
                text: '蒙加塔',
                fontSize: 18,
                offsetY: 25,
                position: 'center',
                maxWidth: '300%',
                maxLines: 2,
                font: 'normal normal normal 12px "PingFang SC"',
                fontFamily: '"PingFang SC"',
                fill: 'green',
              },
            },
          },

          {
            id: '522045728092235',
            data: {
              type: 'rect-node',
              parentId: 'combo_diaodutai',
              x: 430,
              y: 350,
              keyShape: {
                width: 200,
                height: 120,
                fill: '',
              },
              iconShape: {
                // 自定义字体名称需要设置不然iconfont显示不了，fontFamily 必须和 iconfont.css 里面的 font-family 保持一致！！！！！！！！！
                fontFamily: 'iconfont',
                //opacity: 0.8,
                fill: 'green',
                show: true,
                text: '\ue6e4', //text属性 为 iconfont.css 中的content ，记得在斜线后加u
                width: 50,
                height: 50,
                offsetY: -15,
              },
              labelShape: {
                text: '法拉纳',
                fontSize: 18,
                offsetY: 25,
                position: 'center',
                maxWidth: '300%',
                maxLines: 2,
                font: 'normal normal normal 12px "PingFang SC"',
                fontFamily: '"PingFang SC"',
                textOverflow: 'ellipsis',
                fill: 'green',
              },
            },
          },
          {
            id: '522045819396171',
            data: {
              type: 'rect-node',
              parentId: 'combo_diaodutai',
              x: 714,
              y: 350,
              keyShape: {
                width: 200,
                height: 120,
                fill: '',
              },
              iconShape: {
                // 自定义字体名称需要设置不然iconfont显示不了，fontFamily 必须和 iconfont.css 里面的 font-family 保持一致！！！！！！！！！
                fontFamily: 'iconfont',
                fill: 'green',
                show: true,
                text: '\ue6e4', //text属性 为 iconfont.css 中的content ，记得在斜线后加u
                width: 50,
                height: 50,
                offsetY: -15,
              },
              labelShape: {
                text: '杜瓦科',
                fontSize: 18,
                offsetY: 25,
                position: 'center',
                maxWidth: '300%',
                maxLines: 2,
                font: 'normal normal normal 12px "PingFang SC"',
                fontFamily: '"PingFang SC"',
                fill: 'green',
              },
            },
          },
          {
            id: '522045819404363',
            data: {
              type: 'rect-node',
              parentId: 'combo_diaodutai',
              x: 998,
              y: 350,
              keyShape: {
                width: 200,
                height: 120,
                fill: '',
              },
              iconShape: {
                // 自定义字体名称需要设置不然iconfont显示不了，fontFamily 必须和 iconfont.css 里面的 font-family 保持一致！！！！！！！！！
                fontFamily: 'iconfont',
                fill: 'green',
                show: true,
                text: '\ue6e4', //text属性 为 iconfont.css 中的content ，记得在斜线后加u
                width: 50,
                height: 50,
                offsetY: -15,
              },
              labelShape: {
                text: '尼亚林科',
                fontSize: 18,
                offsetY: 25,
                position: 'center',
                maxWidth: '300%',
                maxLines: 2,
                font: 'normal normal normal 12px "PingFang SC"',
                fontFamily: '"PingFang SC"',
                fill: 'green',
              },
            },
          },
          {
            id: '522045819408459',
            data: {
              type: 'rect-node',
              parentId: 'combo_diaodutai',
              x: 1282,
              y: 350,
              keyShape: {
                width: 200,
                height: 120,
                fill: '',
              },
              iconShape: {
                // 自定义字体名称需要设置不然iconfont显示不了，fontFamily 必须和 iconfont.css 里面的 font-family 保持一致！！！！！！！！！
                fontFamily: 'iconfont',
                fill: 'green',
                show: true,
                text: '\ue6e4', //text属性 为 iconfont.css 中的content ，记得在斜线后加u
                width: 50,
                height: 50,
                offsetY: -15,
              },
              labelShape: {
                text: '迪安库亚',
                fontSize: 18,
                offsetY: 25,
                position: 'center',
                maxWidth: '300%',
                maxLines: 2,
                font: 'normal normal normal 12px "PingFang SC"',
                fontFamily: '"PingFang SC"',
                fill: 'green',
              },
            },
          },
          {
            id: '522045819412555',
            data: {
              type: 'rect-node',
              parentId: 'combo_diaodutai',
              x: 1566,
              y: 350,
              keyShape: {
                width: 200,
                height: 120,
                fill: '',
              },
              iconShape: {
                // 自定义字体名称需要设置不然iconfont显示不了，fontFamily 必须和 iconfont.css 里面的 font-family 保持一致！！！！！！！！！
                fontFamily: 'iconfont',
                fill: 'green',
                show: true,
                text: '\ue6e4', //text属性 为 iconfont.css 中的content ，记得在斜线后加u
                width: 50,
                height: 50,
                offsetY: -15,
              },
              labelShape: {
                text: '凯鲁阿内',
                fontSize: 18,
                offsetY: 25,
                position: 'center',
                maxWidth: '300%',
                maxLines: 2,
                font: 'normal normal normal 12px "PingFang SC"',
                fontFamily: '"PingFang SC"',
                fill: 'green',
              },
            },
          },
          {
            id: '522045819416651',
            data: {
              type: 'rect-node',
              parentId: 'combo_diaodutai',
              x: 1850,
              y: 350,
              keyShape: {
                width: 200,
                height: 120,
                fill: '',
              },
              iconShape: {
                // 自定义字体名称需要设置不然iconfont显示不了，fontFamily 必须和 iconfont.css 里面的 font-family 保持一致！！！！！！！！！
                fontFamily: 'iconfont',
                fill: 'green',
                show: true,
                text: '\ue6e4', //text属性 为 iconfont.css 中的content ，记得在斜线后加u
                width: 50,
                height: 50,
                offsetY: -15,
              },
              labelShape: {
                text: '西芒杜矿山',
                fontSize: 18,
                offsetY: 25,
                position: 'center',
                maxWidth: '300%',
                maxLines: 2,
                font: 'normal normal normal 12px "PingFang SC"',
                fontFamily: '"PingFang SC"',
                fill: 'green',
              },
            },
          },
        ],
        edges: [
          {
            id: 'combo_fuwuqi_combo_diaodutai',
            source: 'combo_fuwuqi',
            target: 'combo_diaodutai',
            data: {},
          },
        ],
        combos: [
          {
            id: 'combo_fuwuqi',
            data: {
              type: 'rect-combo',
              keyShape: {
                //上、
                // padding: [10, 10, 10, 10],
              },
            },
          },
          {
            id: 'combo_diaodutai',
            data: {
              type: 'rect-combo',
              keyShape: {
                //上、
                // padding: [10, 10, 10, 10],
              },
            },
          },
        ],
      },
    });
    setTimeout(() => {
      graph.fitCenter();
      graph.fitView();
    });
    // graph.on('node:pointerenter', (event) => {
    //   const { itemId } = event;
    //   graph.updateData('node', {
    //     id: itemId,
    //     data: {
    //       iconShape: {
    //         fill: 'green',
    //       },
    //     },
    //   });
    // });
  }

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

  //大小发生改变
  function onDomResize() {
    nextTick(() => {
      setTimeout(() => {
        graph.setSize([mountRef.value?.clientWidth, mountRef.value?.clientHeight]);
        graph.fitCenter();
        graph.fitView();
      }, 200);
    });
  }

  //更改状态
  function changeStatus(item: Nullable<string>) {
    if (item) {
      const vdom = graph.getNodeData(item?.split('_')[0]);
      if (vdom) {
        graph.updateData('node', {
          id: item?.split('_')[0],
          data: {
            iconShape: {
              fill: item?.split('_')[1] == '1' ? 'red' : 'green',
            },
            labelShape: {
              fill: item?.split('_')[1] == '1' ? 'red' : 'green',
            },
            // otherShapes: {
            //   preRect: {
            //     show: item?.split('_')[1] == '1',
            //     fill: item?.split('_')[1] == '1' ? 'red' : '',
            //     width: 10,
            //     radius: 0,
            //   },
            // },
          },
        });
      }
    }
  }

  function initStatus() {
    setTimeout(() => {
      if (mqttStore.isInitAlarmData) {
        for (let i = mqttStore.msgData.length - 1; i >= 0; i--) {
          changeStatus(`${mqttStore.msgData[i].joinId}_${mqttStore.msgData[i].msgStatus}`);
        }
        watch(
          () => mqttStore.changeNewInfoKey,
          () => {
            console.log('watch', mqttStore.changeNewInfoKey);
            changeStatus(mqttStore.changeNewInfoKey);
          },
        );
      } else {
        initStatus();
      }
    });
  }

  watch(
    () => appStore.getMenuSetting.collapsed,
    () => {
      onDomResize();
    },
  );

  onMounted(() => {
    // // 将表格和工具栏进行关联
    const $table = tableAlarmRef.value;
    const $toolbar = toolbarRef.value;
    if ($table && $toolbar) {
      $table.connect($toolbar);
    }

    g6();
    initStatus();

    window.onresize = () => {
      onDomResize();
    };
  });
</script>

<style lang="less" scoped>
  @prefixCls: ~'@{namespace}-suitManage-';

  .@{prefixCls} {
    .@{prefixCls}tableBtn {
      width: 100%;
    }
  }
</style>
