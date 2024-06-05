<!-- 左侧组件 -->
<template>
  <div :class="`${prefixCls}bottom-left`">
    <div :class="`${prefixCls}assembly`">
      <div
        @click="assemblyClick(item)"
        v-for="(item, index) in assemblyAll"
        :key="index"
        :class="`${prefixCls}assembly-item`"
      >
        <div :class="{ assemblySelected: item.isSelected }">
          <IconFontClass :style="item.style" :name="item.icon" />
        </div>
        <div>
          {{ item.name }}
        </div>
      </div>
    </div>
    <div :class="`${prefixCls}assembly-content`">
      <div
        :class="`${prefixCls}content-search`"
        v-show="
          assemblyAll.find((m) => m.isSelected).key == 'Custom' ||
          assemblyAll.find((m) => m.isSelected).key == 'ZuJian'
        "
      >
        <a-input-search size="small" placeholder="搜索" enter-button @search="assemblySearch" />
      </div>
      <div
        :class="`${prefixCls}content-upload`"
        style="width: 100%; height: 33px"
        v-show="
          ['Custom', 'model3d_'].includes(
            assemblyAll.find((m) => {
              return m.isSelected == true;
            }).key,
          )
        "
      >
        <div style="width: 100%; padding: 5px">
          <a-button style="width: 100%; height: 23px; line-height: 1px" @click="materialUploadClick"
            >上传</a-button
          >
        </div>
      </div>
      <div
        :class="`${prefixCls}contentSelect`"
        style="width: 100%; height: 33px"
        v-show="
          ['Sys'].includes(
            assemblyAll.find((m) => {
              return m.isSelected == true;
            }).key,
          )
        "
      >
        <div style="width: 100%; padding: 5px">
          <a-button style="width: 100%; height: 23px; line-height: 1px" @click="showCustomSys"
            >素材选择</a-button
          >
        </div>
      </div>
      <div :class="`${prefixCls}content-item`">
        <div
          :class="`${prefixCls}item-Elemnt`"
          v-show="
            assemblyAll.find((m) => {
              return m.isSelected == true;
            }).key == 'Elemnt'
          "
        >
          <div :class="`${prefixCls}Elemnt-item`">
            <div
              v-for="(item, index) in assemblyElemnt"
              :key="index"
              :class="item.type"
              class="assembly-draggable elemnt-item"
            >
              <div>
                <IconFontClass :name="item.icon" />
              </div>
              <div>
                {{ item.name }}
              </div>
            </div>
          </div>
        </div>
        <div
          :class="`${prefixCls}item-sys`"
          v-show="
            assemblyAll.find((m) => {
              return m.isSelected == true;
            }).key == 'Sys'
          "
        >
          <a-spin tip="加载中..." :spinning="loadAssembly.sys">
            <a-collapse
              v-model:activeKey="assemblySysActiveKey"
              :class="`${prefixCls}assembly-sys-bar`"
            >
              <a-collapse-panel
                v-for="item in userAssemblySys"
                :key="item.id"
                :header="item.name"
                @click="(event) => userAssemblySysClick(item, event)"
              >
                <a-spin tip="加载中..." :spinning="userLoadAssemblySysGroup[item.id]">
                  <div :class="`${prefixCls}assemblySys-content`">
                    <template v-if="item.childes != null">
                      <div
                        v-for="(t, index) in item.childes"
                        :key="index"
                        v-show="t.name.indexOf('.') != -1"
                        class="assembly-draggable sys-item"
                      >
                        <template v-if="t.name.indexOf('.') != -1">
                          <img
                            :name="t.name"
                            :mid="t.id"
                            :pid="t.parentid"
                            class="sys-item"
                            :src="
                              t.name.split('.')[1] == 'svg'
                                ? 'data:image/' + t.name.split('.')[1] + ';base64,' + t.thumb
                                : 'data:image/' + t.name.split('.')[1] + ';base64,' + t.thumb
                            "
                          />
                        </template>
                      </div>
                    </template>
                  </div>
                  <template #extra>
                    <IconFontClass
                      @click="assemblySysDelete(item)"
                      style="font-size: 12px"
                      name="icon-iNeuOS-guanbicuowu"
                    />
                  </template>
                </a-spin>
              </a-collapse-panel>
            </a-collapse>
          </a-spin>
        </div>
        <div
          :class="`${prefixCls}item-HuiHua`"
          v-show="
            assemblyAll.find((m) => {
              return m.isSelected == true;
            }).key == 'HuiHua'
          "
        >
          <div :class="`${prefixCls}HuiHua-info`">
            <div>
              <span> 边框 </span>
              <!-- emit事件添加额外参数 -->
              <div>
                <selectColor
                  :color="props.assemblyConfig.borderColor"
                  @change="(value) => colorChange('border', value)"
                />
              </div>
            </div>
            <div>
              <span> 填充 </span>
              <!-- emit事件添加额外参数 -->
              <div>
                <selectColor
                  :color="props.assemblyConfig.fillColor"
                  @change="(value) => colorChange('fillColor', value)"
                />
              </div>
            </div>
            <div>
              <span> 线宽 </span>
              <div style="width: 90px">
                <a-input-number
                  v-model:value="props.assemblyConfig.borderSize"
                  min="0"
                  size="small"
                  @change="borderSizeChange"
                />
              </div>
            </div>
          </div>
          <div :class="`${prefixCls}HuiHua-item`">
            <div
              v-for="(item, index) in assemblyHuiHua"
              :key="index"
              @click="assemblyHuiHuaClick(item)"
              :class="{ assemblySelected: item.isSelected }"
            >
              <div>
                <IconFontClass :name="item.icon" />
              </div>
              <div>
                {{ item.name }}
              </div>
            </div>
          </div>
        </div>
        <div
          :class="`${prefixCls}item-Chart`"
          v-show="
            assemblyAll.find((m) => {
              return m.isSelected == true;
            }).key == 'Chart'
          "
        >
          <div :class="`${prefixCls}Chart-item`">
            <a-tabs
              v-model:activeKey="assemblyChartActiveKey"
              tab-position="left"
              type="card"
              :style="{ height: '100%' }"
              @change="assemblyChartClick"
            >
              <a-tab-pane key="all" tab="全部">
                <div>
                  <template
                    v-for="item in assemblyChart.map((m) => {
                      return m.childes;
                    })"
                  >
                    <div v-for="t in item" :key="`all_${t.key}`">
                      <div>
                        <img
                          :src="t.src"
                          class="assembly-draggable chart-item"
                          :data-chart="t.key"
                          :data-name="t.name"
                          :data-urldatatype="t.data"
                          :data-tagcount="t.tagCount"
                        />
                      </div>
                      <div :class="`${prefixCls}Chart-title`">
                        {{ t.name }}
                      </div>
                    </div>
                  </template>
                </div>
              </a-tab-pane>
              <a-tab-pane v-for="item in assemblyChart" :key="item.key" :tab="item.name">
                <div v-for="(t, index) in item.childes" :key="index" :id="`chat_${item.key}`">
                  <div>
                    <img
                      :src="t.src"
                      class="assembly-draggable chart-item"
                      :data-chart="t.key"
                      :data-name="t.name"
                      :data-urldatatype="t.data"
                      :data-tagcount="t.tagCount"
                    />
                  </div>
                  <div :class="`${prefixCls}Chart-title`">
                    {{ t.name }}
                  </div>
                </div>
              </a-tab-pane>
            </a-tabs>
          </div>
        </div>
        <div
          :class="`${prefixCls}item-sys3d`"
          v-show="
            assemblyAll.find((m) => {
              return m.isSelected == true;
            }).key == 'sys3d'
          "
        >
          <div :class="`${prefixCls}sys3d-item`">
            <div v-for="(item, index) in assembly3dSys" :key="index">
              <div>
                <img :src="item.src" class="" />
              </div>
              <div>
                {{ item.name }}
              </div>
            </div>
          </div>
        </div>
        <div
          :class="`${prefixCls}item-model3d`"
          v-show="
            assemblyAll.find((m) => {
              return m.isSelected == true;
            }).key == 'model3d'
          "
        >
          <div :class="`${prefixCls}model3d-item`">
            <div v-for="(item, index) in assembly3dModel" :key="index">
              <div>
                <img :src="item.src" class="" />
              </div>
              <div>
                {{ item.name }}
              </div>
            </div>
          </div>
        </div>
        <div
          :class="`${prefixCls}item-Custom`"
          v-show="
            assemblyAll.find((m) => {
              return m.isSelected == true;
            }).key == 'Custom'
          "
        >
          <a-spin tip="加载中..." :spinning="loadAssembly.custom">
            <div :class="`${prefixCls}Custom-item`">
              <div v-for="(t, index) in assemblyCustom" :key="index" v-show="t.isshow">
                <div class="assembly-draggable custom-item" :mid="t.id">
                  <template v-if="t.name.indexOf('.') != -1">
                    <img
                      :name="t.name"
                      :mid="t.id"
                      :pid="t.parentid"
                      class="custom-item"
                      :src="
                        t.name.split('.')[1] == 'svg'
                          ? 'data:image/' + t.name.split('.')[1] + '+xml;base64,' + t.thumb
                          : 'data:image/' + t.name.split('.')[1] + ';base64,' + t.thumb
                      "
                    />
                  </template>
                </div>
                <IconFontClass name="icon-iNeuOS-delete" @click="delCustomImg(t)" title="删除" />
                <div>
                  {{ t.name }}
                </div>
              </div>
            </div>
          </a-spin>
        </div>
        <div
          :class="`${prefixCls}item-ZuJian`"
          v-show="
            assemblyAll.find((m) => {
              return m.isSelected == true;
            }).key == 'ZuJian'
          "
        >
          <div :class="`${prefixCls}ZuJian-item`" class="assembly-draggable-zujian">
            <div v-for="(t, index) in assemblyZuJian" :key="index" v-show="t.isshow">
              <div>
                <div>
                  <img
                    :mid="t.id"
                    :name="t.name"
                    class="assembly-draggable zuJian-item"
                    :src="
                      t.name.split('.')[1] == 'svg'
                        ? 'data:image/' + t.name.split('.')[1] + '+xml;base64,' + t.thumb
                        : 'data:image/' + t.name.split('.')[1] + ';base64,' + t.thumb
                    "
                  />
                </div>
                <div>
                  {{ t.name.split('.')[0] }}
                </div>
              </div>
              <IconFontClass name="icon-iNeuOS-delete" @click="delZuJian(t)" title="删除" />
            </div>
          </div>
        </div>
        <div
          :class="`${prefixCls}item-Tree`"
          v-show="
            assemblyAll.find((m) => {
              return m.isSelected == true;
            }).key == 'Tree'
          "
        >
          <slot></slot>
        </div>
      </div>
    </div>
    <a-drawer
      :bodyStyle="{ overflowY: 'auto', overflowX: 'hidden' }"
      :headerStyle="{ height: '49px', borderBottom: '2px solid #eee' }"
      :width="500"
      :visible="upImgIsShow"
      title="上传"
      :footer-style="{ textAlign: 'right' }"
      @close="cancelUpImg"
    >
      <a-upload
        v-model:file-list="upImgfileListModel"
        accept=".png,.jpg,.jpeg,.gif,.svg"
        :multiple="true"
        maxCount="6"
        :data="upImgData"
        :customRequest="imgCustomRequest"
        list-type="picture"
        @change="upImgChange"
        @drop="upImgDrop"
        @reject="upImgReject"
        @remove="upImgRemove"
        :before-upload="beforeUpload"
        :headers="{
          Authorization: token,
        }"
      >
        <p
          class="ant-upload-hint"
          style="width: 356px; margin: 0 auto; margin-left: 35%; color: red; user-select: none"
          >*文件格式 .png,jpg,jpeg,gif,svg</p
        >
        <p
          class="ant-upload-hint"
          style="width: 356px; margin: 0 auto; margin-left: 35%; color: red; user-select: none"
          >*单文件大小＜1M</p
        >
        <p
          class="ant-upload-hint"
          style="width: 356px; margin: 0 auto; margin-left: 35%; color: red; user-select: none"
          >*一次性最多上传6图元</p
        >
        <p
          class="ant-upload-hint"
          style="width: 356px; margin: 0 auto; margin-left: 35%; color: red; user-select: none"
          >*文件名称即为素材名称</p
        >
        <p
          class="ant-upload-drag-icon"
          style="margin: 0 auto 0 50%; color: #40a9ff; font-size: 48px"
        >
          <InboxOutlined />
        </p>
        <p>点击上传</p>
      </a-upload>
      <template #footer>
        <a-spin tip="正在上传..." :spinning="isRunSaveImg">
          <a-button type="primary" @click="upImgCustomRequest">保存</a-button>
          <a-button style="margin-left: 8px" @click="cancelUpImg">关闭</a-button>
        </a-spin>
      </template>
    </a-drawer>
    <div style="display: none" id="loadImgDiv">
      <img style="width: 95px; height: 95px" :src="loadImgDivImg" />
    </div>
    <a-modal
      :confirm-loading="showSysLoading"
      v-model:visible="isShowSys"
      :width="1040"
      title="素材选择"
      @ok="saveCustomSys"
      @cancel="closeCustomSys"
    >
      <a-spin tip="加载中..." :spinning="isLoadSys">
        <div :class="`${prefixCls}CustomSys-content`">
          <div :class="`${prefixCls}CustomSys-left`">
            <myTree
              ref="assemblySysTreeRef"
              :checkStrictly="true"
              :isShowSearch="true"
              :checkedKeys="assemblySysTreeCheckedKeys"
              :data="assemblySysTree"
              @check="assemblySysTreeCheck"
            />
          </div>
          <div :class="`${prefixCls}CustomSys-right`">
            <div>
              {{ clickAssemblySysNode.title }}
            </div>
            <div>
              <img
                v-for="(t, index) in clickAssemblySysNode.childes"
                :key="index"
                :mid="t.id"
                :src="'data:image/' + t.name.split('.')[1] + ';base64,' + t.thumb"
              />
            </div>
          </div>
        </div>
      </a-spin>
    </a-modal>
  </div>
</template>
<script setup>
  import myTree from '/@/components/MyTree/index.vue';
  import { getAppEnvConfig } from '/@/utils/env';
  import { useUserStore } from '/@/store/modules/user';
  import { InboxOutlined, ExclamationCircleOutlined } from '@ant-design/icons-vue';
  import selectColor from '/@/components/MySelectColor/index.vue';
  import { message, Modal } from 'ant-design-vue';
  import { ref, onMounted, nextTick, watch, createVNode } from 'vue';
  import { useDesign } from '/@/hooks/web/useDesign';

  const { prefixCls } = useDesign('modeling');
  const props = defineProps({
    //选中的组件
    selectedOb: {
      type: Object,
      default() {
        return {};
      },
    },
    //组件配置
    assemblyConfig: {
      type: Object,
      default() {
        return {
          //绘画边框颜色
          borderColor: '',
          // 绘画边框大小
          borderSize: 2,
          //填充颜色
          fillColor: '',
        };
      },
    },
    //canvas对象
    containerObArray: {
      type: Array,
      default() {
        return null;
      },
    },
    //增加容器
    addContainer: {
      type: Function,
      default() {
        return (containerId, containerType) => {};
      },
    },
  });
  const userStore = useUserStore();
  const { VITE_GLOB_API_URL, VITE_GLOB_API_URL_PREFIX } = getAppEnvConfig();
  const upUrl = `${VITE_GLOB_API_URL}${VITE_GLOB_API_URL_PREFIX}/Modeling/SaveElements`;
  const token = 'Bearer ' + userStore.getToken;
  //全部的assembly
  const assemblyAll = ref([
    {
      name: '素材',
      key: 'Sys',
      icon: 'icon-iNeuOS-sucai',
      style: '',
      isSelected: true,
    },
    {
      name: '元件',
      key: 'Elemnt',
      icon: 'icon-iNeuOS-zujian',
      style: '',
      isSelected: false,
    },
    {
      name: '绘画',
      key: 'HuiHua',
      icon: 'icon-iNeuOS-huizhi',
      style: 'font-weight: 600;',
      isSelected: false,
    },
    {
      name: '图表',
      key: 'Chart',
      icon: 'icon-iNeuOS-tubiao',
      style: '',
      isSelected: false,
    },
    {
      name: '3D图表',
      key: 'sys3d',
      icon: 'icon-iNeuOS-3d',
      style: '',
      isSelected: false,
    },
    {
      name: '模型',
      key: 'model3d',
      icon: 'icon-iNeuOS-3d1',
      style: '',
      isSelected: false,
      type: 5,
    },
    {
      name: '自定',
      key: 'Custom',
      icon: 'icon-iNeuOS-yunshangchuan1',
      style: '',
      isSelected: false,
      type: 2,
    },
    {
      name: '组件',
      key: 'ZuJian',
      icon: 'icon-iNeuOS-zidingyizujian',
      style: '',
      isSelected: false,
      type: 3,
    },
    {
      name: '元素树',
      key: 'Tree',
      icon: 'icon-iNeuOS-shuliebiao',
      style: '',
      isSelected: false,
    },
  ]);
  const loadImgDivImg = ref('');
  const assemblyChartActiveKey = ref('all');
  const assemblySysActiveKey = ref('1');

  //加载状态
  const loadAssembly = ref({
    sys: true,
    custom: true,
    model3d: true,
    zuJian: true,
  });
  //点击用户sys的每个分级加载状态
  const userLoadAssemblySysGroup = ref({});
  //用户的系统素材图片数据
  const userAssemblySys = ref([]);
  //系统素材全部父级目录及图片数据
  const assemblySysTree = ref([]);
  //用户已经选中的系统素材
  const assemblySysTreeCheckedKeys = ref([]);
  //当前点击的目录
  const clickAssemblySysNode = ref({
    key: 0,
    title: '',
    childes: [],
  });
  //
  const isLoadSys = ref(false);
  const assemblySysTreeRef = ref({});

  //绘画的图片数据
  const assemblyHuiHua = ref([
    {
      name: '画笔',
      icon: 'icon-iNeuOS-huizhi',
      key: 'drawFreeLine',
      isSelected: false,
    },
    {
      name: '箭头',
      icon: 'icon-iNeuOS-jiantou',
      key: 'drawArrowLine',
      isSelected: false,
    },
    {
      name: '直线',
      icon: 'icon-iNeuOS-zhixian',
      key: 'drawBeeLine',
      isSelected: false,
    },
    {
      name: '虚线',
      icon: 'icon-iNeuOS-xiaoxuxian',
      key: 'drawDottedLine',
      isSelected: false,
    },
    {
      name: '圆',
      icon: 'icon-iNeuOS-yuanhuan',
      key: 'drawCircular',
      isSelected: false,
    },
    {
      name: '椭圆',
      icon: 'icon-iNeuOS-tuoyuan',
      key: 'drawEllipse',
      isSelected: false,
    },
    {
      name: '方形',
      icon: 'icon-iNeuOS-zhengfangxing',
      key: 'drawRectangle',
      isSelected: false,
    },
    {
      name: '直角',
      icon: 'icon-iNeuOS-zhijiaosanjiaoxing',
      key: 'drawRightTriangle',
      isSelected: false,
    },
    {
      name: '等边',
      icon: 'icon-iNeuOS-dengyaosanjiaoxing',
      key: 'drawEquilateral',
      isSelected: false,
    },
  ]);
  //元件图片数据
  const assemblyElemnt = [
    // {
    //     name: "2D容器",
    //     icon: "icon-iNeuOS-2d",
    //     type: "elemnt-2d-container"
    // },
    // {
    //     name: "3D容器",
    //     icon: "icon-iNeuOS-3d",
    //     type: "elemnt-3d-container"
    // },
    {
      name: '标题',
      icon: 'icon-iNeuOS-biaoti',
      type: 'elemnt-title',
    },
    {
      name: '数据点',
      icon: 'icon-iNeuOS-shuzi',
      type: 'elemnt-source',
    },
    {
      name: '按钮',
      icon: 'icon-iNeuOS-anniu1',
      type: 'elemnt-button',
    },
    {
      name: '最新时间',
      icon: 'icon-iNeuOS-shijian2',
      type: 'elemnt-newTime',
    },
    {
      name: '视频',
      icon: 'icon-iNeuOS-shipinjiankong',
      type: 'elemnt-video',
    },
    {
      name: 'Iframe',
      icon: 'icon-iNeuOS-iframe1',
      type: 'elemnt-iframe',
    },
    // {
    //     name: "图片",
    //     icon: "icon-iNeuOS-tupian2",
    //     type: "elemnt-img"
    // },
  ];
  //图表图片数据
  const assemblyChart = [
    {
      key: 'line',
      name: '折线图',
      isAssemblyDrag: false,
      childes: [
        {
          name: '折线图',
          key: 'line_1',
          src: '/resource/img/modeling/line_1.png',
          data: 'history',
          tagCount: 'multiple',
        },
      ],
    },
    {
      key: 'bar',
      name: '柱状图',
      isAssemblyDrag: false,
      childes: [
        {
          name: '时序柱状图',
          key: 'bar_1',
          src: '/resource/img/modeling/bar_1.png',
          data: 'history',
          tagCount: 'multiple',
        },
        // {
        //     name: "实时柱状图",
        //     key: "bar_2",
        //     src: "/resource/img/windows/windows_backImg1.png"
        // },
      ],
    },
    {
      key: 'pie',
      name: '饼图',
      isAssemblyDrag: false,
      childes: [
        {
          name: '饼图',
          key: 'pie_1',
          src: '/resource/img/modeling/pie_1.png',
          data: 'new',
          tagCount: 'multiple',
        },
      ],
    },
    {
      key: 'youbiao',
      name: '仪表图',
      isAssemblyDrag: false,
      childes: [
        {
          name: '仪表图',
          key: 'yibiao_1',
          src: '/resource/img/modeling/yibiao_1.png',
          data: 'new',
          tagCount: 'single',
        },
      ],
    },
    {
      key: 'jindu',
      name: '进度图',
      isAssemblyDrag: false,
      childes: [
        {
          name: '进度图1',
          key: 'jindu_1',
          src: '/resource/img/modeling/jindu_1.png',
          data: 'new',
          tagCount: 'single',
        },
        // {
        //     name: "进度图2",
        //     key: "jindu_2",
        //     src: "/resource/img/windows/windows_backImg1.png",
        //     data: "new",
        //     tagCount: 'single',
        // }
      ],
    },
    {
      key: 'yewei',
      name: '液位图',
      isAssemblyDrag: false,
      childes: [
        {
          name: '液位图1',
          key: 'yewei_1',
          src: '/resource/img/modeling/yewei_1.png',
          data: 'new',
          tagCount: 'single',
        },
        // {
        //     name: "液位2",
        //     key: "yewei_2",
        //     src: "/resource/img/windows/windows_backImg1.png",
        //     data: "new",
        //     tagCount: 'single',
        // }
      ],
    },
    {
      key: 'leida',
      name: '雷达图',
      isAssemblyDrag: false,
      childes: [
        // {
        //     name: "雷达图",
        //     key: "leida_1",
        //     src: "/resource/img/windows/windows_backImg1.png",
        //     data: "new",
        //     tagCount: 'multiple',
        // },
      ],
    },
    {
      key: 'ciyun',
      name: '词云图',
      isAssemblyDrag: false,
      childes: [
        // {
        //     name: "词云图",
        //     key: "ciyun_1",
        //     src: "/resource/img/windows/windows_backImg1.png",
        //     data: "new",
        //     tagCount: 'multiple',
        // }
      ],
    },
  ];
  //3d通用元素
  const assembly3dSys = [
    {
      name: '标注',
      src: '/resource/img/windows/windows_backImg1.png',
    },
    {
      name: '折线图',
      src: '/resource/img/windows/windows_backImg1.png',
    },
    {
      name: '柱状图',
      src: '/resource/img/windows/windows_backImg1.png',
    },
    {
      name: '进度图1',
      src: '/resource/img/windows/windows_backImg1.png',
    },
    {
      name: '进度图2',
      src: '/resource/img/windows/windows_backImg1.png',
    },
    {
      name: '雷达图',
      src: '/resource/img/windows/windows_backImg1.png',
    },
  ];
  //3d模型
  const assembly3dModel = ref([
    {
      name: '开发中',
      src: '/resource/img/windows/windows_backImg1.png',
    },
  ]);
  //自定义图片数据
  const assemblyCustom = ref([]);
  //组件图片数据
  const assemblyZuJian = ref([
    {
      name: '开发中.png',
      src: '/resource/img/windows/windows_backImg1.png',
    },
  ]);
  //上传图片的文件
  const upImgfileListModel = ref([]);
  let upImgfileList = [];
  //显示上传图片选择
  const upImgIsShow = ref(false);
  //是否正在保存上传图片
  const isRunSaveImg = ref(false);
  //上传图片的参数
  const upImgData = ref({
    type: 0,
    parentId: 0,
    isShare: false,
  });

  //是否显示素材选择
  const isShowSys = ref(false);
  const showSysLoading = ref(false);

  //获取用户系统分组
  getUserGraphicSourceGroup();
  getGraphicSourceCustom();
  getZuJian();
  getGraphicSourceGroupTree();

  //绘画自定义信息改变
  function colorChange(key, color) {
    const containerOb = props.containerObArray.find(
      (m) => m.canvasId == props.selectedOb.attribute.containerId,
    );
    switch (key) {
      case 'border':
        containerOb.canvasOb.canvasObject.lineColor = color;
        break;
      case 'fillColor':
        //绘画填充颜色
        containerOb.canvasOb.canvasObject.fillColor = color;
        break;
    }
    drawFreeLine();
  }

  //边框大小
  function borderSizeChange(value) {
    const containerOb = props.containerObArray.find(
      (m) => m.canvasId == props.selectedOb.attribute.containerId,
    );
    containerOb.canvasOb.canvasObject.lineWidth = value;
    drawFreeLine();
  }

  //组件搜索
  function assemblySearch(value) {
    if (value == '') {
      switch (assemblyAll.value.find((m) => m.isSelected).key) {
        case 'Sys':
          break;
        case 'Custom':
          assemblyCustom.value.forEach((m) => {
            m.isshow = true;
          });
          break;
        case 'ZuJian':
          assemblyZuJian.value.forEach((m) => {
            m.isshow = true;
          });
          break;
      }
    } else {
      switch (assemblyAll.value.find((m) => m.isSelected).key) {
        case 'Sys':
          break;
        case 'Custom':
          assemblyCustom.value.forEach((m) => {
            if (m.name.indexOf(value) == -1) {
              m.isshow = false;
            }
          });
          break;
        case 'ZuJian':
          assemblyZuJian.value.forEach((m) => {
            if (m.name.indexOf(value) == -1) {
              m.isshow = false;
            }
          });
          break;
      }
    }
  }

  //组件点击
  function assemblyClick(item) {
    let assemblyAll_ = _.clone(assemblyAll.value).map((t) => {
      if (item.icon == t.icon) {
        t.isSelected = true;
        if (t.key != 'HuiHua') {
          if (assemblyHuiHua.value.find((m) => m.isSelected)) {
            assemblyHuiHua.value.find((m) => m.isSelected).isSelected = false;
            const containerOb = props.containerObArray.find(
              (m) => m.canvasId == props.selectedOb.attribute.containerId,
            );
            //关闭绘制
            containerOb.canvasOb.canvas.isDrawingMode = false;
            containerOb.canvasOb.canvasObject.drawingType = null;
            containerOb.canvasOb.canvas.skipTargetFind = false;
            containerOb.canvasOb.canvas.selection = true;
            containerOb.canvasOb.canvas.hoverCursor = 'move';
          }
        }
      } else {
        t.isSelected = false;
      }
      return t;
    });
    assemblyAll.value = assemblyAll_;
  }

  //具体画笔点击
  function assemblyHuiHuaClick(item) {
    const containerOb = props.containerObArray.find(
      (m) => m.canvasId == props.selectedOb.attribute.containerId,
    );
    //关闭自由绘制
    containerOb.canvasOb.canvas.isDrawingMode = false;
    containerOb.canvasOb.canvasObject.drawingType = null;
    if (!item.isSelected) {
      containerOb.canvasOb.canvas.skipTargetFind = true;
      containerOb.canvasOb.canvas.selection = false;
      containerOb.canvasOb.canvas.hoverCursor = 'crosshair'; //绘制时更改鼠标经过canvas元素时的样式十字架
      let assemblyHuiHua_ = _.clone(assemblyHuiHua.value).map((t) => {
        if (item.icon == t.icon) {
          t.isSelected = true;
          if (t.key == 'drawFreeLine') {
            containerOb.canvasOb.drawFreeLine();
          } else {
            containerOb.canvasOb.drawType(t.key);
          }
        } else {
          t.isSelected = false;
        }
        return t;
      });
      assemblyHuiHua.value = assemblyHuiHua_;
    } else {
      item.isSelected = false;
      containerOb.canvasOb.canvasObject.drawingType = null;
      containerOb.canvasOb.canvas.skipTargetFind = false;
      containerOb.canvasOb.canvas.selection = true;
      containerOb.canvasOb.canvas.hoverCursor = 'move';
    }
  }

  //判断是否是自由绘制
  function drawFreeLine() {
    if (assemblyHuiHua.value.find((m) => m.isSelected).key == 'drawFreeLine') {
      const containerOb = props.containerObArray.find(
        (m) => m.canvasId == props.selectedOb.attribute.containerId,
      );
      containerOb.canvasOb.drawFreeLine();
    }
  }

  //素材自定义标签的删除
  function assemblySysDelete(item) {
    message.info('开发中');
  }

  //素材上传
  function materialUploadClick() {
    upImgIsShow.value = true;
  }

  //获取系统素材分级
  function getGraphicSourceGroupTree() {
    loadAssembly.value.sys = true;
    modelingApi.GetGraphicSourceGroupTree().then((data) => {
      assemblySysTree.value = data;
    });
  }

  //获取用户系统素材分级
  function getUserGraphicSourceGroup() {
    loadAssembly.value.sys = true;
    modelingApi
      .GetUserGraphicSourceGroup({
        type: 1,
        parentId: 0,
      })
      .then((data) => {
        loadAssembly.value.sys = false;
        userAssemblySys.value = data.data;
        if (!data.isempty) {
          assemblySysTreeCheckedKeys.value = data.data.map((m) => m.id);
        }
        if (assemblySysTreeCheckedKeys.value.length > 0) {
          clickAssemblySysNode.value = data.data.find(
            (m) => m.id == assemblySysTreeCheckedKeys.value[0],
          );
          assemblySysTreeCheck({
            key: clickAssemblySysNode.value.id,
            type: clickAssemblySysNode.value.type,
          });
        }
      })
      .catch(() => {
        loadAssembly.value.sys = false;
      });
  }

  //用户系统素材点击获取
  function userAssemblySysClick(item, event) {
    if (item.childes == null) {
      userLoadAssemblySysGroup.value[item.id] = true;
      GetGraphicSource(item)
        .then((data) => {
          const sysImg = userAssemblySys.value.find((m) => m.id == item.id);
          sysImg.childes = data;
          nextTick(() => {
            userLoadAssemblySysGroup.value[item.id] = false;
            assemblyDrag($(event.target).parent().find('.assembly-draggable'));
          });
        })
        .catch(() => {
          userLoadAssemblySysGroup.value[item.id] = false;
        });
    }
  }

  //图表分组点击
  function assemblyChartClick(key) {
    const chart = assemblyChart.find((m) => m.key == key);
    if (chart && !chart.isAssemblyDrag) {
      nextTick(() => {
        chart.isAssemblyDrag = true;
        assemblyDrag($(`#chat_${key} .assembly-draggable`));
      });
    }
  }

  //获取自定义素材
  function getGraphicSourceCustom(name) {
    loadAssembly.value.custom = true;
    GetGraphicSource({ type: 2 }, name)
      .then((data) => {
        assemblyCustom.value = data;
        nextTick(() => {
          loadAssembly.value.custom = false;
          assemblyDrag($(`.${prefixCls}Custom-item`).find('.assembly-draggable'));
        });
      })
      .catch(() => {
        loadAssembly.value.custom = false;
      });
  }

  //获取素材
  function GetGraphicSource(params, name) {
    return modelingApi.GetGraphicSource({
      name: name,
      type: params.type,
      parentId: params.id,
    });
  }

  //组件拖拽
  function assemblyDrag($dragadom) {
    //组件图片拖动
    $dragadom.draggable({
      //helper: "clone",//克隆拖动
      helper: function (e) {
        //返回生成拖动dom对象
        //id = "img_' + (new Date()).valueOf() + '"
        //此部分后期考虑如果canva被放大或缩小的情况下拖拽时生成的元素是否变化大小
        if ($(e.target).hasClass('sys-item') || $(e.target).hasClass('custom-item')) {
          return (
            '<img class="sys-item" mid="' +
            $(e.target.outerHTML).attr('mid') +
            '" style="width:95px;height:95px;"src="' +
            $(e.target.outerHTML).attr('src') +
            '">'
          );
        } else if ($(e.target).hasClass('chart-item')) {
          return (
            '<img class="chart-item" mid="' +
            $(e.target.outerHTML).attr('mid') +
            '" style="width:124px;height:73px;"src="' +
            $(e.target.outerHTML).attr('src') +
            '">'
          );
        } else if ($(e.target).hasClass('zuJian-item')) {
          return (
            '<img class="zuJian-item" mid="' +
            $(e.target.outerHTML).attr('mid') +
            '" style="width:124px;height:73px;"src="' +
            $(e.target.outerHTML).attr('src') +
            '">'
          );
        } else if ($(e.target).hasClass('type-custom3d-item')) {
          return (
            '<img objpath="' +
            $(e.target.outerHTML).attr('objpath') +
            '" otherPath="' +
            $(e.target.outerHTML).attr('otherPath') +
            '"  mid="' +
            $(e.target.outerHTML).attr('mid') +
            '" style="width:95px;height:95px;"src="' +
            $(e.target.outerHTML).attr('src') +
            '">'
          );
        } else if ($(e.target).hasClass('type-model3d-item')) {
          return (
            '<img style="width:95px;height:95px;"src="' + $(e.target.outerHTML).attr('src') + '">'
          );
        }
      },
      cursor: 'move',
      zIndex: 9999999,
      appendTo: $('body'),
      //强制draggable只允许在指定元素或区域的范围内移动
      containment: '.draggable-content',
      drag: function (e, ui) {
        //拖动时改变dom的大小
        //ui.helper.width(100);
        //ui.helper.height(100);
      },
    });
    $('.canvas2d').each((i, canvas) => {
      const domId = $(canvas).attr('id');
      if (!myCommon.isnull(domId)) {
        //设置哪个dom为容器
        $(`#${domId}`).droppable({
          accept: $('.assembly-draggable'), //容器允许拖入的dom
          drop: function (event, ui) {
            const containerOb = props.containerObArray.find(
              (m) => m.canvasId == $(this).attr('id'),
            );
            let domx = ui.helper[0].width / 2; //对象的中心点
            let domy = ui.helper[0].height / 2;
            if (isNaN(domx)) {
              domx = ui.helper[0].scrollWidth / 2;
            }
            if (isNaN(domy)) {
              domy = ui.helper[0].scrollHeight / 2;
            }
            const canvansleft = $(this).offset().left + domx;
            const canvansright = $(this).offset().top + domy;
            if ($(ui.draggable).hasClass('sys-item')) {
              const domId = $(ui.helper[0]).attr('mid');
              modelingApi.GetGraphicSourceModel({ id: [domId] }).then((img) => {
                //系统素材图片
                const sourcetype =
                  img.name.split('.')[1] == 'svg' ? 'svg+xml' : img.name.split('.')[1];
                loadImgDivImg.value = `data:image/${sourcetype};base64,${img.source}`;
                nextTick(() => {
                  setTimeout(() => {
                    containerOb.canvasOb.edit_imgAddCanvas(
                      $('#loadImgDiv>img')[0].cloneNode(true),
                      event.clientX - canvansleft,
                      event.clientY - canvansright,
                      'sys-item',
                      domId,
                    );
                  }, 150);
                });
              });
            } else if ($(ui.draggable).hasClass('custom-item')) {
              //自己上传的图片
              containerOb.canvasOb.edit_imgCustomElementsAddCanvas(
                ui.helper[0],
                event.clientX - canvansleft,
                event.clientY - canvansright,
                'custom-item',
                $(ui.helper[0]).attr('mid'),
              );
            } else if ($(ui.draggable).hasClass('elemnt-item')) {
              //元件
              if ($(ui.draggable).hasClass('elemnt-title')) {
                containerOb.canvasOb.edit_textBoxAddCanvas(
                  '标题文本',
                  event.clientX - canvansleft,
                  event.clientY - canvansright,
                  'elemnt-title',
                );
              } else if ($(ui.draggable).hasClass('elemnt-source')) {
                containerOb.canvasOb.edit_textAddCanvas(
                  '0',
                  event.clientX - canvansleft,
                  event.clientY - canvansright,
                  'elemnt-source',
                );
              } else if ($(ui.draggable).hasClass('elemnt-button')) {
                containerOb.canvasOb.edit_buttonCanvas(
                  '按钮',
                  event.clientX - canvansleft,
                  event.clientY - canvansright,
                  'elemnt-button',
                );
              } else if ($(ui.draggable).hasClass('elemnt-video')) {
                containerOb.canvasOb.addDom(
                  event.clientX - canvansleft,
                  event.clientY - canvansright,
                  'elemnt-video',
                );
              } else if ($(ui.draggable).hasClass('elemnt-newTime')) {
                containerOb.canvasOb.edit_netime(
                  event.clientX - canvansleft,
                  event.clientY - canvansright,
                  'elemnt-newTime',
                );
              } else if ($(ui.draggable).hasClass('elemnt-iframe')) {
                containerOb.canvasOb.addDom(
                  event.clientX - canvansleft,
                  event.clientY - canvansright,
                  'elemnt-iframe',
                );
              }
            } else if ($(ui.draggable).hasClass('chart-item')) {
              containerOb.canvasOb.addDom(
                event.clientX - canvansleft,
                event.clientY - canvansright,
                'elemnt-chart',
                $(ui.draggable).data('chart'),
                $(ui.draggable).data('name'),
                $(ui.draggable).data('urldatatype'),
                $(ui.draggable).data('tagcount'),
              );
            } else if ($(ui.draggable).hasClass('zuJian-item')) {
              const domId = $(ui.helper[0]).attr('mid');
              modelingApi.GetGraphicZuJian({ id: [domId] }).then((config) => {
                //获取组件
                nextTick(() => {
                  setTimeout(() => {
                    containerOb.canvasOb.edit_customComponents(
                      JSON.parse(config.jsonconfig),
                      event.clientX - canvansleft,
                      event.clientY - canvansright,
                      'zuJian-item',
                      domId,
                    );
                  }, 150);
                });
              });
            } else if ($(ui.draggable).hasClass('type-ZDYassembly-item-i')) {
              if ($(ui.draggable).data('type') == 'type-text-item-single') {
                containerOb.canvasOb.edit_textBoxAddCanvas(
                  '标题文本',
                  event.clientX - canvansleft,
                  event.clientY - canvansright,
                  'type-text-item',
                );
              } else if ($(ui.draggable).data('type') == 'type-text-item-source') {
                containerOb.canvasOb.edit_textAddCanvas(
                  '0',
                  event.clientX - canvansleft,
                  event.clientY - canvansright,
                  'type-text-source',
                );
              } else if ($(ui.draggable).data('type') == 'elemnt-button') {
                containerOb.canvasOb.edit_buttonCanvas(
                  '按钮',
                  event.clientX - canvansleft,
                  event.clientY - canvansright,
                  'elemnt-button',
                );
              } else if ($(ui.draggable).data('type') == 'elemnt-echart') {
                containerOb.canvasOb.edit_tableChart(
                  $(ui.helper[0]),
                  $(ui.draggable).data('charttype'),
                );
                containerOb.canvasOb.edit_chart($(ui.helper[0]), 'elemnt-video');
              } else if ($(ui.draggable).data('type') == 'type-tablechart-item3d') {
                containerOb.canvasOb.edit_3d_charts($(ui.draggable).data('charttype'));
              } else if ($(ui.draggable).data('type') == 'elemnt-video') {
                containerOb.canvasOb.edit_video($(ui.helper[0]), 'elemnt-video');
              } else if ($(ui.draggable).data('type') == 'elemnt-newTime') {
                containerOb.canvasOb.edit_netime(
                  event.clientX - canvansleft,
                  event.clientY - canvansright,
                  'elemnt-newTime',
                );
              } else if ($(ui.draggable).data('type') == 'elemnt-iframe') {
                containerOb.canvasOb.edit_iframe($(ui.helper[0]), 'elemnt-iframe');
                containerOb.canvasOb.edit_video($(ui.helper[0]), 'elemnt-iframe');
              }
            } else if (
              $(ui.draggable).hasClass('type-model3d-item') ||
              $(ui.draggable).hasClass('type-custom3d-item')
            ) {
              if ($(ui.draggable).data('3dtype') == 'tagging') {
                containerOb.canvasOb.edit_3d_tagging();
              } else if ($(ui.draggable).data('3dtype') == 'custom3d') {
                //var path = $(ui.helper[0]).attr("objpath");
                //path = path.substring(0, path.lastIndexOf("/")).substring(0, path.substring(0, path.lastIndexOf("/")).lastIndexOf("/")) + "/" + path.substring(path.lastIndexOf("/") + 1, path.length);
                containerOb.canvasOb.edit_custom3d(
                  $(ui.helper[0]).attr('objpath'),
                  $(ui.helper[0]).attr('otherPath'),
                );
              }
            }
          },
          tolerance: 'fit', //完全重叠才算
        });
      }
    });
  }

  //元件拖拽
  function elemntDrag() {
    $('.elemnt-item').draggable({
      helper: 'clone', //克隆拖动
      cursor: 'move',
      zIndex: 9999999,
      appendTo: $('body'),
      //强制draggable只允许在指定元素或区域的范围内移动
      containment: '.draggable-content',
      drag: function (e, ui) {
        //拖动时改变dom的大小
        ui.helper.width(95);
        ui.helper.height(95);
      },
    });
  }

  //关闭素材图片上传
  function cancelUpImg() {
    upImgIsShow.value = false;
  }

  //上传文件改变时的状态
  function upImgChange(fileInfo) {
    fileInfo.file.status = 'done';
    upImgfileList.push(fileInfo.file);
  }

  //当文件被拖入上传区域时执行的回调功能
  function upImgDrop(fileInfo) {}

  //拖拽文件不符合 accept 类型时的回调
  function upImgReject() {
    message.warning('选择文件类型不符合');
  }

  //上传之前
  function beforeUpload(file) {
    const isLt5M = file.size / 1024 / 1024 < 5;
    if (!isLt5M) {
      file['remove'] = true;
      message.error(`${file.name} 文件大小不可超过 5MB`);
    }
    return true;
  }

  function imgCustomRequest(file) {}

  //素材上传
  function upImgCustomRequest() {
    if (upImgfileList.length > 0) {
      isRunSaveImg.value = true;
      let formData = new FormData();
      upImgfileList
        .map((m) => {
          return m.originFileObj;
        })
        .forEach((file) => {
          //多文件统一上传
          formData.append('files', file);
        });
      const selectedAssembly = assemblyAll.value.find((m) => m.isSelected == true);
      formData.append('Type', selectedAssembly.type);
      formData.append('Level', 0);
      formData.append('ParentId', 0);
      formData.append('IsShare', false);
      return modelingApi
        .SaveElements(formData)
        .then((data) => {
          upImgfileListModel.value = [];
          isRunSaveImg.value = false;
          if (data.length > 0) {
            switch (selectedAssembly.type) {
              case 2:
                const addCustom = [];
                data.forEach((img) => {
                  addCustom.push(img);
                  assemblyCustom.value.push(img);
                });
                // assemblyCustom.value.concat(addCustom);
                nextTick(() => {
                  data.forEach((img) => {
                    assemblyDrag(
                      $(`.${prefixCls}Custom-item`).find(`.assembly-draggable[mid=${img.id}]`),
                    );
                  });
                });
                break;
              case 3:
                break;
              case 5:
                break;
            }
          } else {
            message.error('素材保存全部失败');
          }
          upImgIsShow.value = false;
        })
        .catch((error) => {
          isRunSaveImg.value = false;
          console.error(error);
          message.error('保存素材报错');
        });
    } else {
      message.warning('请先选择图片');
    }
  }

  //素材删除
  function upImgRemove(fileInfo) {
    upImgfileList = upImgfileList.filter((m) => m.uid != fileInfo.uid);
  }

  //删除自定义图片
  function delCustomImg(t) {
    Modal.confirm({
      maskClosable: true,
      title: '是否删除?',
      icon: createVNode(ExclamationCircleOutlined),
      content: '',
      onOk() {
        modelingApi
          .DeleteSourceModel({ id: t.id })
          .then((data) => {
            if (data) {
              assemblyCustom.value = assemblyCustom.value.filter((m) => m.id != t.id);
            }
          })
          .catch((error) => {
            console.error(error);
          });
      },
      onCancel() {},
    });
  }

  //删除组件
  function delZuJian(t) {
    Modal.confirm({
      maskClosable: true,
      title: '是否删除?',
      icon: createVNode(ExclamationCircleOutlined),
      content: '',
      onOk() {
        modelingApi
          .DeleteSourceModel({ id: t.id })
          .then((data) => {
            if (data) {
              assemblyZuJian.value = assemblyZuJian.value.filter((m) => m.id != t.id);
            }
          })
          .catch((error) => {
            console.error(error);
          });
      },
      onCancel() {},
    });
  }

  //获取组件
  function getZuJian() {
    GetGraphicSource({ type: 3, id: null }, null).then((data) => {
      assemblyZuJian.value = data;
      nextTick(() => {
        assemblyDrag($('.assembly-draggable-zujian').find('.assembly-draggable'));
      });
    });
  }

  function addZuJian(data) {
    data.isshow = true;
    assemblyZuJian.value.push(data);
    nextTick(() => {
      assemblyDrag($('.assembly-draggable-zujian').find('.assembly-draggable:last-child'));
    });
  }

  //素材自定义
  function showCustomSys() {
    isShowSys.value = true;
  }
  function closeCustomSys() {
    isShowSys.value = false;
  }
  //保存用户自定义素材父级
  function saveCustomSys() {
    showSysLoading.value = true;
    assemblySysActiveKey.value = [];
    modelingApi
      .SaveUSerGraphicSourceGroup({ GraphicSourceId: assemblySysTreeCheckedKeys.value })
      .then((data) => {
        showSysLoading.value = false;
        isShowSys.value = false;
        if (data) {
          getUserGraphicSourceGroup();
        } else {
          message.error('保存素材目录失败');
        }
      })
      .catch(() => {
        showSysLoading.value = false;
      });
  }

  //自定义素材目录点击
  function assemblySysTreeCheck(node) {
    if (node.childes == null) {
      isLoadSys.value = true;
      GetGraphicSource({ id: node.key, type: node.type })
        .then((data) => {
          isLoadSys.value = false;
          node.childes = data;
          clickAssemblySysNode.value = node;
        })
        .catch(() => {
          isLoadSys.value = false;
        });
    } else {
      clickAssemblySysNode.value = node;
    }
  }

  onMounted(() => {
    assemblyDrag($('.assembly-draggable'));
    elemntDrag();
  });

  watch(
    () => props.assemblyConfig,
    () => {
      console.log(props.assemblyConfig.borderSize);
    },
    { deep: true },
  );

  //暴露给父组件可以调用的方法
  defineExpose({
    addZuJian,
  });
</script>
<style lang="less" scoped>
  @prefixCls: ~'@{namespace}-modeling';

  .assemblySelected {
    color: #0960bd;
  }

  .@{prefixCls}assembly {
    display: flex;
    flex-direction: column;
    width: 45px;
    border-right: 1px solid #dfe3e8;

    .@{prefixCls}assembly-item {
      display: flex;
      flex-direction: column;
      width: 100%;
      height: 45px;
      text-align: center;
      cursor: pointer;

      > div:first-child {
        height: 25px;

        > i {
          font-size: 20px;
        }
      }

      > div:last-child {
        width: 100%;
        height: 15px;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      .@{prefixCls}assembly-sys {
        > div {
          display: flex;
          flex-flow: row wrap;

          img {
            width: 59px;
            height: 58px;
          }
        }
      }
    }
  }

  .@{prefixCls}assembly-content {
    display: flex;
    flex: 1;
    flex-direction: column;
    overflow-x: hidden;

    .@{prefixCls}content-search {
      height: 30px;
      padding: 5px;
    }

    .@{prefixCls}content-item {
      //占满剩余空间
      flex: 1;
      //占满剩余空间
      flex-basis: 0;
      width: calc(100% + 3px);
      overflow: hidden;

      > div {
        height: 100%;
        overflow: auto;
      }

      .@{prefixCls}item-sys {
        margin-left: 1px;
        padding: 0 4px;

        .@{prefixCls}assembly-sys-bar {
          width: calc(100% - 4px);

          :deep(.ant-collapse-header) {
            padding: 3px 16px;
          }

          :deep(.ant-collapse-content-box) {
            padding: 5px;
          }

          .@{prefixCls}assemblySys-content {
            //网格布局
            display: grid;
            //指定每行4个单元格
            grid-template-columns: repeat(4, auto);
            justify-content: center;
            max-height: 400px;
            overflow: auto;

            img {
              width: 51px;
              height: 51px;
              padding: 2px;
              cursor: move;
            }
          }
        }
      }

      .@{prefixCls}item-HuiHua {
        display: flex;
        flex-direction: column;

        .@{prefixCls}HuiHua-info {
          display: flex;
          flex-direction: row;
          justify-content: space-between;
          height: 35px;
          padding-right: 8px;
          padding-left: 5px;

          > div {
            display: flex;
            flex-direction: row;
            height: 35px;

            span {
              display: block;
              width: 15px;
              line-height: 15px;
            }

            > div {
              padding-top: 3px;
            }
          }
        }

        .@{prefixCls}HuiHua-item {
          display: flex;
          flex-flow: row wrap;
          justify-content: space-between;
          padding: 0 8px 0 4px;
          overflow: auto;

          > div {
            width: 65px;
            height: 65px;
            margin-bottom: 15px;
            background-color: #f3f3f3;
            text-align: center;
            cursor: pointer;

            > div:first-child {
              i {
                font-size: 29px;
                font-weight: 600;
              }
            }

            > div:last-child {
              width: 100%;
              height: 25px;
              overflow: hidden;
              font-weight: initial;
              text-overflow: ellipsis;
              white-space: nowrap;
            }
          }
        }
      }

      .@{prefixCls}item-Elemnt {
        // display: flex;
        // flex-direction: row;
        // flex-wrap: wrap;
        // justify-content: space-between;
        padding: 0 8px 0 4px;
        overflow: auto;

        .@{prefixCls}Elemnt-item {
          display: flex;
          flex-flow: row wrap;
          justify-content: space-between;
          padding-top: 3px;
          padding-left: 2px;

          > div {
            width: 105px;
            height: 70px;
            margin-bottom: 15px;
            background-color: #f3f3f3;
            text-align: center;
            cursor: move;

            > div:first-child {
              i {
                font-size: 32px;
              }
            }

            > div:last-child {
              width: 100%;
              height: 25px;
              overflow: hidden;
              font-weight: initial;
              text-overflow: ellipsis;
              white-space: nowrap;
            }
          }
        }
      }

      .@{prefixCls}item-Chart {
        :deep(.ant-tabs-tab) {
          padding: 5px 16px;
        }

        .@{prefixCls}Chart-item {
          height: 100%;
          padding: 3px 0 3px 5px;

          img {
            width: 124px;
            height: 73px;
          }

          .@{prefixCls}Chart-title {
            text-align: center;
          }
        }
      }

      .@{prefixCls}item-sys3d {
        padding: 0 8px 0 4px;
        overflow: auto;

        .@{prefixCls}sys3d-item {
          display: flex;
          flex-flow: row wrap;
          justify-content: space-between;
          padding-top: 3px;
          padding-left: 2px;

          > div {
            width: 105px;
            height: 84px;
            background-color: #f3f3f3;
            text-align: center;
            cursor: move;

            > div:first-child {
              img {
                height: 65px;
              }
            }

            > div:last-child {
              width: 100%;
              height: 25px;
              overflow: hidden;
              font-weight: initial;
              text-overflow: ellipsis;
              white-space: nowrap;
            }
          }
        }
      }

      .@{prefixCls}item-model3d {
        padding: 0 8px 0 4px;
        overflow: auto;

        .@{prefixCls}model3d-item {
          display: flex;
          flex-flow: row wrap;
          justify-content: space-between;
          padding-top: 3px;
          padding-left: 2px;

          > div {
            width: 100%;
            height: 138px;
            background-color: #f3f3f3;
            text-align: center;
            cursor: move;

            > div:first-child {
              img {
                width: 100%;
                height: 120px;
              }
            }

            > div:last-child {
              width: 100%;
              height: 25px;
              overflow: hidden;
              font-weight: initial;
              text-overflow: ellipsis;
              white-space: nowrap;
            }
          }
        }
      }

      .@{prefixCls}item-Custom {
        padding: 0 8px 0 4px;
        overflow: auto;

        .@{prefixCls}Custom-item {
          display: flex;
          flex-flow: row wrap;
          justify-content: space-between;
          padding-top: 3px;
          padding-left: 2px;

          > div {
            position: relative;
            width: 105px;
            height: 91px;
            margin-bottom: 2px;
            background-color: #f3f3f3;
            text-align: center;
            cursor: move;

            > i {
              display: inline-block;
              position: absolute;
              right: 0;
              bottom: -1px;
              height: 30px;
              border-radius: 1px;
              font-size: 13px;
              line-height: 31px;
              cursor: pointer;
            }

            > div:first-child {
              img {
                width: 100%;
                height: 65px;
                margin: 0 auto;
                background-repeat: no-repeat;
                background-size: 100% 100%;
              }
            }

            > div:last-child {
              width: calc(100% - 12px);
              height: 25px;
              overflow: hidden;
              color: #5e5e5e;
              font-size: 8px;
              font-weight: initial;
              line-height: 26px;
              text-overflow: ellipsis;
              white-space: nowrap;
            }
          }
        }
      }

      .@{prefixCls}item-ZuJian {
        padding: 0 8px 0 4px;
        overflow: auto;

        .@{prefixCls}ZuJian-item {
          display: flex;
          flex-flow: row wrap;
          justify-content: space-between;
          padding-top: 3px;
          padding-left: 2px;

          > div {
            position: relative;
            width: 100%;
            height: 138px;
            margin-bottom: 5px;
            background-color: #f3f3f3;
            text-align: center;
            cursor: move;

            > div > div:first-child {
              img {
                width: 100%;
                height: 120px;
              }
            }

            > div > div:last-child {
              width: calc(100% - 12px);
              height: 25px;
              overflow: hidden;
              font-weight: initial;
              text-overflow: ellipsis;
              white-space: nowrap;
            }

            > i {
              display: inline-block;
              position: absolute;
              right: 0;
              bottom: -1px;
              height: 25px;
              border-radius: 1px;
              font-size: 13px;
              line-height: 31px;
              cursor: pointer;
            }
          }
        }
      }
    }

    .assembly-draggable {
      cursor: move;
    }
  }

  .@{prefixCls}CustomSys-content {
    display: flex;
    width: 100%;
    height: 600px;
    padding: 10px;

    .@{prefixCls}CustomSys-left {
      width: 450px;
    }

    .@{prefixCls}CustomSys-right {
      width: 100%;
      border: 1px solid #e5e7eb;
      border-left: none;

      > div:first-child {
        height: 31px;
        padding-left: 25px;
        border-bottom: 1px solid #e5e7eb;
        font-size: 18px;
        font-weight: 700;
        line-height: 31px;
      }

      > div:last-child {
        display: flex;
        flex-flow: row wrap;
        place-content: flex-start left;
        height: calc(100% - 32px);
        overflow-y: auto;

        > img {
          width: 50px;
          height: 50px;
          margin: 5px;
        }
      }
    }
  }
</style>
