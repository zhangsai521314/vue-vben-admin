<template>
  <MyContent :class="prefixCls">
    <div :class="`${prefixCls}content-top`">
      <head_
        :isRunexport="isRunexport"
        :viewConfigLoad="viewConfigLoad"
        :menuCheckedIds="checkedIds"
        :getAllConfig="getAllConfig"
        :exportConfig="exportConfig"
        :containerObArray="containerObArray"
        :canvasCotainers="canvasCotainers"
      />
    </div>
    <div :class="`${prefixCls}content-center`">
      <option_
        :isRunexport="isRunexport"
        :getAllConfig="getAllConfig"
        :exportConfig="exportConfig"
        :containerObArray="containerObArray"
        :canvasCotainers="canvasCotainers"
        :menuCheckedIds="checkedIds"
        :showSign="showSign"
        :selectedOb="selectedOb"
        :containerConfig="selectcOntainer"
      />
    </div>
    <!-- <div :class="`${prefixCls}content-bottom`" class="draggable-content">
      <div :class="`${prefixCls}bottom-left`">
        <assembly
          ref="assemblyRef"
          :selectedOb="selectedOb"
          :containerObArray="containerObArray"
          :assemblyConfig="assemblyConfig"
          :addContainer="addContainer"
        >
          <div style="height: 100%; padding-top: 5px">
            <myTree
              :isRadio="true"
              :isBorder="false"
              :isShowAllCheck="false"
              :checkStrictly="true"
              :isShowSearch="true"
              :checkedKeys="assemblyTreeCheckedKeys"
              :data="assemblyTreeData"
              @check="assemblyTreeCheck"
            />
          </div>
        </assembly>
      </div>
      <div :class="`${prefixCls}bottom-right`">
        <prop
          :menuTreeData="menuData"
          :videoData="videoData"
          :containerObArray="containerObArray"
          :showSign="showSign"
          :selectedOb="selectedOb"
          :containerConfig="selectcOntainer"
          :updateSelectContainerValue="updateSelectContainerValue"
        >
          <template #footer>
            <div :class="'prop-bottom'">
              <a-spin
                tip=""
                :spinning="isRunSave"
                :wrapperClassName="{ width: '200px', height: '100%', float: 'left' }"
              >
                <a-button type="primary" @click="showSaveConfig">保存组态</a-button>
              </a-spin>
            </div>
          </template>
        </prop>
      </div>
      <div :class="`${prefixCls}bottom-center`">
        <view2d
          v-for="(item, index) in canvasCotainers.filter((m) => m.canvasType == '2d')"
          :key="index"
          ref="containerObArray"
          :changeSelectOb="changeSelectOb"
          :assemblyConfig="assemblyConfig"
          :canvasId="item.containerId"
          :getvideoData="getvideoData"
          :getSelectob="getSelectob"
          :updateSelectContainerValue="updateSelectContainerValue"
          :showSaveComponent="showSaveComponent"
          :refreshassemblyTreeData="refreshassemblyTreeData"
          viewType="edit"
        />
      </div>
    </div>
    <div>
      <menuDrawer
        :checkedKeys="checkedIds"
        :isRadio="true"
        :width="500"
        :isShow="isShowSaveMenu"
        :cancel="closeSaveConfig"
        :ztitle="'保存配置'"
        :menuType="2"
        :openSizeType="2"
        :isPageEditing="true"
        @change="menuDataChange"
        :footerStyle="{ height: '55px', textAlign: 'right' }"
      >
        <template #footer_>
          <a-spin tip="正在保存配置..." :spinning="isRunSave">
            <a-button type="primary" @click="saveConfig">保存</a-button>
            <a-button style="margin-left: 8px" @click="closeSaveConfig">关闭</a-button>
          </a-spin>
        </template>
      </menuDrawer>
    </div> -->
    <a-drawer
      :bodyStyle="{ overflowY: 'hidden', overflowX: 'hidden' }"
      :headerStyle="{ height: '49px', borderBottom: '2px solid #eee' }"
      :width="420"
      :visible="isZuJianComponent"
      title="保存组件"
      :footer-style="{ textAlign: 'right' }"
      @close="closeZuJianComponent"
    >
      <a-form
        :label-col="{ span: 6 }"
        :style="{ paddingRight: '2px' }"
        :wrapper-col="{ span: 16 }"
        autocomplete="off"
        ref="formRef"
        :model="zuJianInfo"
      >
        <a-form-item
          name="name"
          label="组件名称："
          :rules="[
            {
              required: true,
              message: '请输入组件名称',
            },
            { max: 50, message: '组件名称过长' },
          ]"
        >
          <a-input
            v-model:value="zuJianInfo.name"
            placeholder="请输入组件名称"
            autocomplete="off"
          />
        </a-form-item>
      </a-form>
      <template #footer>
        <a-button type="primary" @click="saveComponent">保存</a-button>
        <a-button style="margin-left: 8px" @click="closeZuJianComponent">关闭</a-button>
      </template>
    </a-drawer>
    <a-modal
      centered
      style="top: 35px"
      v-model:visible="showHotkeyDoc"
      width="645px"
      title="热键参考"
      :footer="null"
      @cancel="cloleHotkeyDoc"
    >
      <div style="height: 500px; overflow: auto">
        <div :class="`${prefixCls}HotkeyDoc-title`"> 编辑 </div>
        <div :class="`${prefixCls}HotkeyDoc-item`">
          <div> <a-tag>Ctrl</a-tag> <a-tag>+</a-tag> </div>
          <div :class="`${prefixCls}HotkeyDoc-illustrate`">放大</div>
        </div>
        <div :class="`${prefixCls}HotkeyDoc-item`">
          <div> <a-tag>Ctrl</a-tag> <a-tag style="width: 24px; text-align: center">-</a-tag> </div>
          <div :class="`${prefixCls}HotkeyDoc-illustrate`">缩小</div>
        </div>
        <div :class="`${prefixCls}HotkeyDoc-item`">
          <div> <a-tag>Ctrl</a-tag> <a-tag>0</a-tag> </div>
          <div :class="`${prefixCls}HotkeyDoc-illustrate`">重置页面比例</div>
        </div>

        <div :class="`${prefixCls}HotkeyDoc-title`"> 画布 </div>
        <div :class="`${prefixCls}HotkeyDoc-item`">
          <div>
            <a-tag>Ctrl</a-tag>
            <a-tag>J</a-tag>
          </div>
          <div :class="`${prefixCls}HotkeyDoc-illustrate`">隐藏所有Canvas</div>
        </div>
        <div :class="`${prefixCls}HotkeyDoc-item`">
          <div>
            <a-tag>Ctrl</a-tag>
            <a-tag>K</a-tag>
          </div>
          <div :class="`${prefixCls}HotkeyDoc-illustrate`">显示所有Canvas</div>
        </div>
        <div :class="`${prefixCls}HotkeyDoc-item`">
          <div>
            <a-tag>Ctrl</a-tag>
            <a-tag>D</a-tag>
          </div>
          <div :class="`${prefixCls}HotkeyDoc-illustrate`">隐藏所有Dom</div>
        </div>
        <div :class="`${prefixCls}HotkeyDoc-item`">
          <div>
            <a-tag>Ctrl</a-tag>
            <a-tag>F</a-tag>
          </div>
          <div :class="`${prefixCls}HotkeyDoc-illustrate`">显示所有Dom</div>
        </div>
        <div :class="`${prefixCls}HotkeyDoc-item`">
          <div>
            <a-tag>Ctrl</a-tag>
            <a-tag>↑</a-tag>
            <a-tag>↓</a-tag>
            <a-tag>←</a-tag>
            <a-tag>→</a-tag>
          </div>
          <div :class="`${prefixCls}HotkeyDoc-illustrate`">移动所选对象</div>
        </div>
        <div :class="`${prefixCls}HotkeyDoc-item`">
          <div>
            <a-tag>Ctrl</a-tag>
            <a-tag>R</a-tag>
          </div>
          <div :class="`${prefixCls}HotkeyDoc-illustrate`">正旋转</div>
        </div>
        <div :class="`${prefixCls}HotkeyDoc-item`">
          <div>
            <a-tag>Ctrl</a-tag>
            <a-tag>Shift</a-tag>
            <a-tag>R</a-tag>
          </div>
          <div :class="`${prefixCls}HotkeyDoc-illustrate`">倒旋转</div>
        </div>
        <!-- <div :class="`${prefixCls}HotkeyDoc-item`">
          <div>
            <a-tag>Ctrl</a-tag> <a-tag>A</a-tag>
          </div>
          <div :class="`${prefixCls}HotkeyDoc-illustrate`">全选</div>
        </div>
        <div :class="`${prefixCls}HotkeyDoc-item`">
          <div>
            <a-tag>Esc</a-tag>
          </div>
          <div :class="`${prefixCls}HotkeyDoc-illustrate`">取消全选</div>
        </div> -->
        <div :class="`${prefixCls}HotkeyDoc-item`">
          <div>
            <a-tag>Del</a-tag>
          </div>
          <div :class="`${prefixCls}HotkeyDoc-illustrate`">删除选择</div>
        </div>
        <div :class="`${prefixCls}HotkeyDoc-item`">
          <div> <a-tag>Ctrl</a-tag> <a-tag>C</a-tag> </div>
          <div :class="`${prefixCls}HotkeyDoc-illustrate`">复制</div>
        </div>
        <div :class="`${prefixCls}HotkeyDoc-item`" style="color: red">
          <div>
            <a-tag>Shift</a-tag>
          </div>
          <div :class="`${prefixCls}HotkeyDoc-illustrate`">保持横纵比/平行移动</div>
        </div>
        <div :class="`${prefixCls}HotkeyDoc-item`">
          <div> <a-tag>Ctrl</a-tag> <a-tag>G</a-tag> </div>
          <div :class="`${prefixCls}HotkeyDoc-illustrate`">组合</div>
        </div>
        <div :class="`${prefixCls}HotkeyDoc-item`">
          <div> <a-tag>Ctrl</a-tag> <a-tag>Shift</a-tag> <a-tag>G</a-tag> </div>
          <div :class="`${prefixCls}HotkeyDoc-illustrate`">取消组合</div>
        </div>
        <div :class="`${prefixCls}HotkeyDoc-item`">
          <div> <a-tag>Ctrl</a-tag> <a-tag>Alt</a-tag> <a-tag>]</a-tag> </div>
          <div :class="`${prefixCls}HotkeyDoc-illustrate`">置顶层</div>
        </div>
        <div :class="`${prefixCls}HotkeyDoc-item`">
          <div> <a-tag>Ctrl</a-tag> <a-tag>Shift</a-tag> <a-tag>[</a-tag> </div>
          <div :class="`${prefixCls}HotkeyDoc-illustrate`">置底层</div>
        </div>
        <div :class="`${prefixCls}HotkeyDoc-item`">
          <div> <a-tag>Ctrl</a-tag> <a-tag>]</a-tag> </div>
          <div :class="`${prefixCls}HotkeyDoc-illustrate`">上移一层</div>
        </div>
        <div :class="`${prefixCls}HotkeyDoc-item`">
          <div> <a-tag>Ctrl</a-tag> <a-tag>[</a-tag> </div>
          <div :class="`${prefixCls}HotkeyDoc-illustrate`">下移一层</div>
        </div>

        <div :class="`${prefixCls}HotkeyDoc-title`"> 文本编辑 </div>
        <div :class="`${prefixCls}HotkeyDoc-item`" style="color: red">
          <div> <a-tag>Ctrl</a-tag> <a-tag>B</a-tag> </div>
          <div :class="`${prefixCls}HotkeyDoc-illustrate`">粗体</div>
        </div>
        <div :class="`${prefixCls}HotkeyDoc-item`" style="color: red">
          <div> <a-tag>Ctrl</a-tag> <a-tag>/</a-tag> </div>
          <div :class="`${prefixCls}HotkeyDoc-illustrate`">斜体</div>
        </div>
        <div :class="`${prefixCls}HotkeyDoc-item`" style="color: red">
          <div> <a-tag>Ctrl</a-tag> <a-tag>_</a-tag> </div>
          <div :class="`${prefixCls}HotkeyDoc-illustrate`">下划线</div>
        </div>
        <div :class="`${prefixCls}HotkeyDoc-item`" style="color: red">
          <div> <a-tag>Ctrl</a-tag> <a-tag>U</a-tag> </div>
          <div :class="`${prefixCls}HotkeyDoc-illustrate`">中线</div>
        </div>
        <div :class="`${prefixCls}HotkeyDoc-item`" style="color: red">
          <div>
            <a-tag>Ctrl</a-tag> <a-tag>Shift</a-tag><a-tag>{{ '>' }}</a-tag>
          </div>
          <div :class="`${prefixCls}HotkeyDoc-illustrate`">增加字体大小</div>
        </div>
        <div :class="`${prefixCls}HotkeyDoc-item`" style="color: red">
          <div>
            <a-tag>Ctrl</a-tag> <a-tag>Shift</a-tag><a-tag>{{ '<' }}</a-tag>
          </div>
          <div :class="`${prefixCls}HotkeyDoc-illustrate`">减小字体大小</div>
        </div>

        <div :class="`${prefixCls}HotkeyDoc-title`"> 其他 </div>
        <div :class="`${prefixCls}HotkeyDoc-item`">
          <div>
            <a-tag>F1</a-tag>
          </div>
          <div :class="`${prefixCls}HotkeyDoc-illustrate`">打开热键参考</div>
        </div>
      </div>
    </a-modal>
  </MyContent>
</template>
<script setup lang="ts">
  import myTree from '/@/components/MyTree/index.vue';
  //快捷键监控
  import shortcutKey from 'keymaster';
  import {
    downloadByUrl,
    downloadByData,
    downloadByBase64,
    downloadByOnlineUrl,
  } from '/@/utils/file/download';
  import head_ from './components/head.vue';
  import option_ from './components/option.vue';
  import assembly from './components/assembly.vue';
  import view2d from './components/view2d.vue';
  // import view3d from "./components/view3d.vue";
  import prop from './components/prop.vue';
  import { message } from 'ant-design-vue';
  import { ref, unref, watch, nextTick } from 'vue';
  import { useDesign } from '/@/hooks/web/useDesign';
  import { PlusOutlined } from '@ant-design/icons-vue';
  import { useRouter } from 'vue-router';
  import commonApi from '/@/api/common';
  import menuDrawer from '/@/components/MyMenu/index.vue';

  import { getAppEnvConfig } from '/@/utils/env';
  import { useUserStore } from '/@/store/modules/user';

  const { VITE_GLOB_API_URL, VITE_GLOB_API_URL_PREFIX } = getAppEnvConfig();
  const userStore = useUserStore();
  const token = 'Bearer ' + userStore.getToken;
  const { prefixCls } = useDesign('modeling');
  const { currentRoute } = useRouter();
  //获取url参数
  const { menuid } = unref(currentRoute).params;
  //菜单默认选中
  const checkedIds = ref(menuid ? [menuid] : []);
  //所有容器配置
  const canvasCotainers = ref([]);
  //所有容器对象（数组）
  const containerObArray = ref(null);
  //选中的组件
  const selectedOb = ref({
    attribute: {
      //对象所在的容器
      containerId: '',
      obtype: 'container', //图元类型：容器(container)、选中多个canvas(objects)等等
      sign: '', //图元标记，编辑器左侧能显示的哪些
      visible: 1, //隐藏，显示
      lockAll: false, //锁定全部配置
      lockWidthHeight: false, //锁定宽高

      key: '',
      name: '',
      top: 0,
      left: 0,
      width: 0,
      height: 0,
      angle: 0,

      imgSourceId: null, //素材图片的地址
      deviceId: '', //设备id
      tagId: '', //绑定的数据点，多点可用虚拟计算点
      groupTagNams: '', //20220615新增，用户存放特殊组件下绑定的所有点名称  ,分割
      groupTagIds: '', //20220615新增，用户存放特殊组件下绑定的所有点id  ,分割
      tagName: '', //数据点名称
      defaultValue: '', //默认值
      digit: 3, //显示保留小数位
      //报警
      alarm: [
        //{
        //title: pass,//名称
        //open: true,//是否开启
        //color: "red",//颜色
        //functionstr: funstr,//方法体
        //amplitude: "",//幅度
        //priority: "1",//优先级
        //functionname: actionname,//方法名
        //action: 3, ///0报警色/1跳动/2抖动/3报警色+闪烁/4旋转/5移动/6隐藏
        //rotate:0,//0顺时针/1逆时针
        //move:up,//up向上/down向下/left向左/right向右
        //isExecuting: false,//是否执行的是此报警方法
        //}
      ],
      //报警执行状态
      alarm_execute_status: false,
      //事件
      event: [
        // {
        //   key: "s1",
        //   title: '交互',
        //   //click、right
        //   event: "click",
        //   open: false,//配置是否有效
        //   type: "",//单击事件类型。open_url(打开连接)/instructions(下发指令)
        //   //右键菜单数据
        //   children: [
        //   ],
        //   instructions: {
        //     //指令类型 bool:下发布尔值（点击基数下发真点击偶数下发真），fixed:指定值（每次都下发一样的值），custom:下发自定义的值（弹出输入值框）
        //     instructions_type: "bool",
        //     open_value: "1",//开指令值
        //     close_value: "0",//关指令值
        //     fixed_value: "",//下发的固定值
        //   },
        //   openurl: {
        //     url: "",//菜单打开的地址
        //     target: "",//打开地址的方式内部打开和新浏览器标签打开。page_alert(页内弹出)/new_label(新页打开)
        //     width: "",//打开窗口的宽度
        //     height: "",//打开窗口的高度
        //     urlType: "",//url的类型，custom(自定义地址)/inside(监测页面)
        //     menuId: "",//urlType为inside时的菜单id
        //   },
        //   requesturl: {
        //     url: "",//请求地址
        //     reques_type: "",//请求地址方式
        //     isreturn: false //是否弹出返回消息
        //   }
        // }
      ],
      //时间组件属性
      newTimeFormat: 'YYYY-MM-DD hh:mm:ss',
      //gif图元的每帧播放速度
      gifFrameTime: 100,

      videoId: '',
      type: '',
      src: '',
      style: {},
      isSelected: false,
      player: null, //播放器返回的对象，保存的时候需要清除
      options: {
        tagCount: 'multiple', //tag数量:single、multiple
        getSourceUrl: '/Data/GetDataHistory', //获取数据的地址
        chartType: 'line', //图表类型 line(单Y轴折线图)/ bar(单Y轴的柱状图)
        showTitle: true, //是否显示标题
        title: '演示数据', //图表的标题
        showLegend: true, //是否显示图例
        legendColor: '#333333', //图例颜色
        timeFrequency: 4, //查询数据的默认时间间隔
        timeInterval: 'h', //查询数据的默认时间间隔类型
        isRefresh: true, //是否刷新数据
        refreshFrequency: 5, //刷新的时间频率
        refreshInterval: 's', //刷新数据时间类型:s(秒)，m(分)
        rangeMin: 0, //量程最小值
        rangeMax: 100, //量程最大值
        alarmValue: '', //报警值
        alarmColor: '', //报警线的色
        warningValue: '', //预警值
        warningColor: '', //预警线的颜色
        dColor: '#ffffff', //底色
        tColor: '#42B8FA', //顶色
        bkcolor: '', //边框色
        yuanHuanColor: '', //圆环色
        fillColor: '', //填充色
        backgroundColor: '#0000001f', //背景色
        titleColor: '#333333', //标题的颜色
        startTime: '', //固定数据开始时间
        endTime: '', //固定数据结束时间
        gradientColorStart: '#1badf9', //渐变色初始色
        gradientColorEnd: '#03fcfe', //渐变色结束色
        showXSplitLine: false, //x轴是否显示分割线
        xAxisLineColor: '#768b9b', //x轴线颜色
        xSplitLineColor: '#768b9b', //x轴分割线颜色
        xAxisLabelColor: '#768b9b', //x轴刻度色
        showYSplitLine: true, //y轴是否显示分割线
        yAxisLineColor: '#768b9b', //y轴线颜色
        ySplitLineColor: '#768b9b', //y轴分割线颜色
        yAxisLabelColor: '#768b9b', //y轴刻度色
        progressType: 'number', //进度值显示的方式：数值(number)、百分比(%)
        renderType: '2d', //渲染方式2d和3d
        render_3d: function (option) {
          //3d图表渲染
        },
        updateRender_3d: function (data) {
          //3d图表数据更新
        },
        chartServiseClick: function name(params, op, setOp) {
          //图表上的数据点的点击
        },
      },
      dataInfo: {
        source: [],
        tags: [
          //{//数据点集合
          //    tagid: "", //数据点id
          //    tagname:"",//名称
          //    filtermin: "", //过滤最小值
          //    filtermax: "", //过滤最大值
          //    color: ""//颜色
          //    tagunit:"",//单位
          //    tagquantiles: node.tagquantiles//小数位
          //}
        ],
      },

      fontLeft: 0, //左缩进
      fontRight: 0, //右缩进
      fontPadding: 0, //内边距
      fontSize: 12, //字体大小
      fontFamily: 'microsoftYaHei', //字体样式
      fontColor: '', //字体颜色
      fontWeight: '', //加粗
      fontUnderline: '', //斜体
      fontOblique: '', //下线
      fontWear: '', //中间穿过的线
      lineHeight: '', //行高
      textAlign: 'left', //对齐方式
      backgroundImage: '', //背景图
      background: '', //背景色
      borderType: '', //边框类型
      borderCorlor: '', //边框颜色
      lineColor: '', //自由绘制线的颜色
      lineWidth: '', //自由绘制线的宽度
      fillColor: '', //自由绘制填充色
      opacity: 1, //不透明度
    },
  });
  //选中的容器
  const selectcOntainer = ref({});
  //组件的一些配置
  const assemblyConfig = ref({
    //绘画边框颜色
    borderColor: '#14D9CC',
    // 绘画边框大小
    borderSize: '2',
    //填充颜色
    fillColor: '',
  });
  //容器的具体配置,第一次从后台获取
  let canvasConfig = {
    // 容器id: {
    //   //canvas组态
    //   canvas2dConfig: null,
    //   //dom组态
    //   domConfig: null,
    //   //canvas组态
    //   canvas3dConfig: null,
    // }
  };

  //控制属性的显示
  const showSign = ref([]);
  //视频列表
  const videoData = ref([
    {
      id: 'custom',
      name: '自定义',
    },
  ]);
  //是否正在显示保存菜单
  const isShowSaveMenu = ref(false);
  //是否正在保存菜单
  const isRunSave = ref(false);
  const isRunexport = ref(false);

  const assemblyRef = ref({});
  const zuJianInfo = ref({ name: '' });
  const formRef = ref();
  const isZuJianComponent = ref(false);
  let saveComponentConfig;
  const showHotkeyDoc = ref(false);
  const assemblyTreeData = ref([]);
  const assemblyTreeCheckedKeys = ref([]);

  const menuData = ref([]);

  // getViewConfig();
  // getVideoList();
  shortcutKey_();

  //更改选中的对象
  function changeSelectOb(ob) {
    selectedOb.value = ob;
    if (ob.attribute.obtype == 'container') {
      selectcOntainer.value = canvasCotainers.value.find(
        (m) => m.containerId == ob.attribute.containerId,
      ).containerConfig;
    }
    nextTick(() => {
      assemblyTreeCheckedKeys.value = [ob.attribute.key];
      chencShowSign();
    });
  }

  //修改当前选中容器的属性值
  function updateSelectContainerValue(attr, value, way) {
    myCommon.changeObAtrrValue(selectcOntainer.value, attr, value, way);
  }

  //增加容器
  function addContainer(containerId, containerType) {
    canvasConfig[containerId] = {
      //canvas组态
      canvas2dConfig: null,
      //dom组态
      domConfig: null,
      //canvas组态
      canvas3dConfig: null,
    };
    canvasCotainers.value.push({
      canvasType: containerType,
      containerId: containerId,
      //容器的配置
      containerConfig: {
        //是否自动扩展
        infinite: false,
        //是否显示网格
        gridShow: true,
        //容器大小类型
        size: 'custom',
        //宽度
        sizeWidth: 1920,
        //高度
        sizeHeight: 936,
        //背景色
        backgroundColor: '#fff',
        //背景图
        backgroundImg: '',
        //自定义接口是否启用
        requestUse: false,
        //获取tag
        requstTags: '',
        //历史值
        requstHistoryValue: '',
        //当前值
        requstNewValue: '',
        //接口刷新频率
        requstRefresh: 1000,
        //运行方式
        runType: [],
        zoom: 100,
        //隐藏所有dom
        showAllDom: true,
        //隐藏所有canvas
        showAllCanvas: true,
      },
    });
    selectedOb.value.containerId = containerId;
  }

  //获取配置
  function getViewConfig() {
    if (checkedIds.value.length > 0) {
      modelingApi
        .GetMenuConfig({
          Id: checkedIds.value[0],
          ConfigType: 'edit',
        })
        .then((data) => {
          if (data) {
            viewConfigLoad(data);
          } else {
            addContainer(`${myCommon.uniqueId()}`, '2d');
          }
        })
        .catch(() => {});
    } else {
      //为了有一个容器，先调用加一个
      addContainer(`${myCommon.uniqueId()}`, '2d');
      //为了有一个容器，先调用加一个
    }
  }

  //配置加载
  function viewConfigLoad(data) {
    if (canvasCotainers.value.length > 0) {
      canvasConfig = {};
      canvasCotainers.value.forEach((m) => {
        window[m.containerId].dispose();
        delete window[m.containerId];
      });
      canvasCotainers.value = [];
    }
    nextTick(() => {
      const globalConfigs = JSON.parse(data.globalconfig);
      const viewConfigs = JSON.parse(data.viewconfig);
      const domConfigs = JSON.parse(data.domconfig);
      const viewConfig3ds = JSON.parse(data.viewconfig3d);
      globalConfigs.forEach((global, index) => {
        canvasConfig[global.containerId] = {
          //canvas组态
          canvas2dConfig: viewConfigs[index],
          //dom组态
          domConfig: domConfigs[index],
          //canvas组态
          canvas3dConfig: null,
        };
      });
      canvasCotainers.value = globalConfigs;
      selectedOb.value.containerId = canvasCotainers.value[0].containerId;
      selectcOntainer.value = canvasCotainers.value[0].containerConfig;
    });
  }

  //检查应该显示哪些属性
  function chencShowSign() {
    if (selectedOb.value.obtype == 'frameSelect') {
      //鼠标框选的，只遍历框选的第一层，后面在放开写
      // showSign_(selectedOb.value);
      showSign.value = [];
    } else {
      showSign.value = selectedOb.value.attribute.sign.split(',');
    }
  }
  function showSign_(canvas) {
    canvas._objects.forEach((item) => {
      if (!item._objects) {
        item.sign.split(',').forEach((s) => {
          if (!showSign.value.find((m) => m == s)) {
            showSign.value.push(s);
          }
        });
      } else {
        showSign_(item);
      }
    });
  }

  //获取视频列表
  function getVideoList() {
    commonApi.GetVideoList().then((data) => {
      videoData.value = videoData.value.concat(data);
    });
  }

  function getvideoData() {
    return videoData.value;
  }

  //获取当前选中的对象
  function getSelectob() {
    return selectedOb.value;
  }

  //显示保存菜单
  function showSaveConfig() {
    isShowSaveMenu.value = true;
  }

  //关闭保存菜单
  function closeSaveConfig() {
    isShowSaveMenu.value = false;
  }

  //保存配置
  function saveConfig() {
    if (checkedIds.value.length > 0) {
      const config = getAllConfig();
      config.MenuId = checkedIds.value[0];
      config.execompleteBefore = () => {
        isRunSave.value = false;
      };
      modelingApi.AddMenuConfig(config).then(() => {
        isShowSaveMenu.value = false;
        message.success('保存配置成功');
      });
    } else {
      isRunSave.value = false;
      message.info('请绑定菜单！');
    }
  }

  //修正保存的配置
  function configCorrect(config) {
    config.forEach((m) => {
      switch (m.type) {
        case 'image':
          if (m.attribute.obtype != 'visibleArea_img') {
            m.src = '';
          }
          break;
        default:
          if (m.objects && m.objects.length > 0) {
            configCorrect(m.objects);
          }
          break;
      }
    });
  }

  //导出配置
  function exportConfig() {
    isRunexport.value = true;
    const config = getAllConfig();
    config.execompleteBefore = () => {
      isRunexport.value = false;
    };
    modelingApi
      .AddPreviewMenuConfig(config)
      .then((data) => {
        downloadByUrl({
          url: `${VITE_GLOB_API_URL}${VITE_GLOB_API_URL_PREFIX}/modeling/exportviewconfig?id=${data}&ConfigType=preview&IsDecrypt=false&MenuId=${checkedIds.value.length > 0 ? checkedIds.value[0] : 0}`,
          target: '_self',
        });
      })
      .catch(() => {});
  }

  //获取能保存的配置
  function getAllConfig() {
    const viewConfigs = [];
    const domConfigs = [];
    const viewConfig3ds = [];
    canvasCotainers.value.forEach((item) => {
      const containerOb = containerObArray.value.find((m) => m.canvasId == item.containerId);
      if (item.canvasType == '2d') {
        containerOb.canvasOb.visibleAreaShowOrNone(false);
        let jsonConfig = '';
        if (
          containerOb.canvasOb.canvas.getObjects().length > 0 ||
          myCommon.isnull(item.containerConfig.backgroundImg) ||
          myCommon.isnull(item.containerConfig.backgroundColor)
        ) {
          jsonConfig = JSON.stringify(containerOb.canvasOb.canvas.toJSON(['attribute']));
        }
        if (jsonConfig) {
          const jsonConfigOb = JSON.parse(jsonConfig);
          if (jsonConfigOb.objects && jsonConfigOb.objects.length > 0) {
            configCorrect(jsonConfigOb.objects);
          }
          viewConfigs.push(JSON.stringify(jsonConfigOb));
        } else {
          viewConfigs.push('');
        }
        containerOb.canvasOb.visibleAreaShowOrNone(true, item.containerConfig.gridShow);
        //获取dom
        domConfigs.push(JSON.stringify(containerOb.canvasOb.getAllDomConfig()));
      } else if (item.canvasType == '3d') {
      }
    });
    return {
      GlobalConfig: JSON.stringify(canvasCotainers.value),
      ViewConfig: JSON.stringify(viewConfigs),
      DomConfig: JSON.stringify(domConfigs),
      ViewConfig3d: JSON.stringify(viewConfig3ds),
    };
  }

  //显示保存组件信息
  function showSaveComponent(config) {
    saveComponentConfig = config;
    isZuJianComponent.value = true;
  }
  function closeZuJianComponent() {
    isZuJianComponent.value = false;
  }

  //保存组件
  function saveComponent() {
    formRef.value.validate().then(() => {
      saveComponentConfig.name = zuJianInfo.value.name + saveComponentConfig.name;
      modelingApi.SaveZuJian(saveComponentConfig).then((data) => {
        assemblyRef.value.addZuJian(data);
        saveComponentConfig.name = '';
        formRef.value.resetFields();
        closeZuJianComponent();
      });
    });
  }

  //每一次操作结束
  function operationEnded(params) {}

  //显示热键文档
  function cloleHotkeyDoc() {
    showHotkeyDoc.value = false;
  }

  function shortcutKey_() {
    shortcutKey('f1', function () {
      event.preventDefault();
      showHotkeyDoc.value = true;
    });
  }

  //组件树操作
  function assemblyTreeCheck(node) {
    const containerOb = containerObArray.value.find((m) => m.canvasId == node.canvasId);
    if (containerOb) {
      let ob;
      const objects = containerOb.canvasOb.canvas.getObjects();
      if (objects) {
        ob = get2dObjById(objects, node.key);
      }
      if (ob) {
        containerOb.canvasOb.canvas.discardActiveObject();
        containerOb.canvasOb.canvas.setActiveObject(ob);
        containerOb.canvasOb.canvas.renderAll();
        containerOb.changeSelectOb(ob);
      } else {
        containerOb.domIdClick(node.key);
      }
    }
  }
  //刷新组件树数据
  function refreshassemblyTreeData(canvasId) {
    const containerOb = containerObArray.value.find((m) => m.canvasId == canvasId);
    if (containerOb) {
      const objects = containerOb.canvasOb.canvas.getObjects();
      const allData = [];
      if (objects) {
        getAllTreeData(canvasId, allData, objects);
      }
      const doms = containerOb.canvasOb.getAllDomConfig();
      getAllTreeData(canvasId, allData, doms);
      assemblyTreeData.value = _.orderBy(allData, ['key'], ['asc']);
    }
  }
  function getAllTreeData(canvasId, allData, datas, parent) {
    datas.forEach(function (t) {
      if (t.attribute && t.attribute.obtype != 'visibleArea') {
        const p = {
          key: t.attribute.key,
          title: t.attribute.name || '-',
          canvasId: canvasId,
          children: [],
          parentid: !parent ? 0 : parent.key,
        };
        if (parent) {
          parent.children.push(p);
        } else {
          allData.push(p);
        }
        if (t.type == 'group' && t._objects.length > 0) {
          getAllTreeData(canvasId, allData, t._objects, p);
        }
      }
    });
  }
  //根据id获取2d对象
  function get2dObjById(objs, key) {
    for (let i = 0; i < objs.length; i++) {
      if (objs[i].attribute.key == key) {
        return objs[i];
      }
      if (
        objs[i].type == 'group' &&
        objs[i].attribute.obtype != 'visibleArea' &&
        objs[i]._objects &&
        objs[i]._objects.length > 0
      ) {
        let ob = get2dObjById(objs[i]._objects, key);
        if (ob) {
          return ob;
        }
      }
    }
  }

  //菜单数据更改
  function menuDataChange(data) {
    menuData.value = data;
  }
</script>
<style lang="less" scoped>
  @prefixCls: ~'@{namespace}-modeling';

  .@{prefixCls} {
    // 弹性布局
    display: flex;
    //弹性布局方向为列(上下排列)
    flex-direction: column;
    font-family: -apple-system, BlinkMacSystemFont, 'Helvetica Neue', Helvetica, 'Segoe UI', Arial,
      Roboto, 'PingFang SC', miui, 'Hiragino Sans GB', 'Microsoft Yahei', sans-serif;
    font-size: 13px;
    font-weight: 400;
    user-select: none;

    .@{prefixCls}content-top {
      //弹性布局
      display: flex;
      //布局排版方向
      flex-direction: row;
      width: 100%;
      height: 35px;
      border-bottom: 1px solid #dfe3e8;
      background: #fafbfc;
      color: #333;
      font-size: 15px;
    }

    .@{prefixCls}content-center {
      display: flex;
      //nowrap不换行
      flex-wrap: nowrap;
      //定义了多根轴线的对齐方式，如果项目只有一根轴线，那么该属性将不起作用。flex-start：与交叉轴的起点对齐
      place-content: flex-start space-between;
      //space-between两端对齐，项目之间的间隔都相等
      width: 100%;
      height: 40px;
      transition: margin-top 0.5s ease-in-out;
      border-bottom: 1px solid #dfe3e8;
      background: #fafbfc;
    }

    .@{prefixCls}content-bottom {
      display: flex;
      flex-direction: row;
      width: 100%;
      height: 100%;
      overflow: hidden;

      .@{prefixCls}bottom-left {
        display: flex;
        flex-direction: row;
        width: 280px;
        height: 100%;
        background-color: #fafbfc;
      }

      .@{prefixCls}bottom-center {
        flex: 1 0;
        height: 100%;
        margin: 2px;
        overflow: auto;
        border-right: 1px solid #cbcbcb;
      }

      .@{prefixCls}bottom-right {
        width: 280px;
        height: 100%;
        background-color: #fafbfc;

        .prop-bottom {
          width: 100%;
          height: 100%;
          overflow: hidden;

          button {
            width: 100%;
            height: 24px;
            border-radius: 0;
            line-height: 1px;
          }

          span {
            line-height: 0px;
          }
        }
      }
    }
  }

  .@{prefixCls}HotkeyDoc-title {
    margin-top: 10px;
    padding-bottom: 10px;
    padding-left: 222px;
    font-size: 16px;
    font-weight: 700;
  }

  .@{prefixCls}HotkeyDoc-item {
    width: 100%;
    height: 25px;
    margin-bottom: 5px;

    > div {
      float: left;
    }

    > div:first-child {
      width: 240px;
      text-align: right;
    }

    > .@{prefixCls}HotkeyDoc-illustrate {
      display: inline-block;
      width: 140px;
    }
  }
</style>
