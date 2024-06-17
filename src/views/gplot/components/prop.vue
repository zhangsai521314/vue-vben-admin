<template>
  <div :class="`${prefixCls}prop`">
    <template v-if="gplotStore.selectedOb.data.type == 'container'">
      <div :class="`${prefixCls}prop-container`">
        <a-tabs
          v-model:activeKey="configTabsActiveKey"
          :tabBarStyle="{ height: '32px', marginBottom: '0.5px', background: '#fff' }"
        >
          <a-tab-pane key="containerConfig" tab="容器配置">
            <a-collapse
              v-model:activeKey="propContainerActiveKey"
              :class="`${prefixCls}prop-container-content`"
            >
              <a-collapse-panel key="container" header="画布">
                <div :class="`${prefixCls}prop-config`">
                  <div>
                    <div> 网格显示 </div>
                    <div>
                      <a-switch
                        v-model:checked="gplotStore.containerConfig.gridShow"
                        size="small"
                        @change="gridShowChange"
                      />
                    </div>
                  </div>
                  <div>
                    <div> 背景颜色 </div>
                    <div class="upbackcolor">
                      <selectColor
                        :color="gplotStore.containerConfig.backgroundColor"
                        @change="(value) => colorChange('canvas|backgroundColor', value)"
                      />
                      <IconFontClass
                        @click="deleteBackgroundColor('canvas|backgroundColor')"
                        v-show="gplotStore.containerConfig.backgroundColor"
                        style="
                          position: absolute;
                          top: -2px;
                          right: 0;
                          font-size: 12px;
                          cursor: pointer;
                        "
                        name="icon-baseui-delete"
                      />
                    </div>
                  </div>
                  <div>
                    <div> 背景图片 </div>
                    <div>
                      <div class="upbackimg">
                        <a-upload
                          v-model:fileList="fileList"
                          maxCount="1"
                          :multiple="false"
                          accept=".png,.jpg,.jpeg,.svg"
                          :before-upload="(file) => beforeUpload(file, 'canvas|backgroundImg')"
                        >
                          <div v-if="!gplotStore.containerConfig.backgroundImg">
                            <IconFontClass style="font-size: 16px" name="icon-baseui-tupian2" />
                          </div>
                          <div v-else>
                            <img
                              style="
                                width: 25px;
                                height: 25px;
                                background-repeat: no-repeat;
                                background-size: 100% 100%;
                              "
                              :src="gplotStore.containerConfig.backgroundImg"
                            />
                          </div>
                        </a-upload>
                        <IconFontClass
                          @click="deleteBackgroundImg('canvas|backgroundImg')"
                          v-show="gplotStore.containerConfig.backgroundImg"
                          style="
                            position: absolute;
                            top: -2px;
                            right: 0;
                            font-size: 12px;
                            cursor: pointer;
                          "
                          name="icon-baseui-delete"
                        />
                      </div>
                    </div>
                  </div>
                  <div>
                    <div> 缩放 </div>
                    <div style="display: flex; width: 200px; height: 25px">
                      <div style="width: 100%">
                        <a-slider
                          @change="zoomChange"
                          v-model:value="gplotStore.containerConfig.zoom"
                          :min="10"
                          max="500"
                          :marks="marks"
                          :included="false"
                          :tipFormatter="null"
                        />
                      </div>
                      <span style="line-height: 28px">{{ gplotStore.containerConfig.zoom }}%</span>
                    </div>
                  </div>
                  <div>
                    <a-space size="1">
                      <a-tag @click="zoomChange(-1)" style="margin: 0 1 0 0; padding: 0 1px"
                        >缩放到内容</a-tag
                      >
                      <a-tag @click="zoomChange(-2)" style="margin: 1; padding: 0 1px"
                        >缩放到宽度</a-tag
                      >
                      <a-tag @click="zoomChange(-3)" style="margin: 1; padding: 0 1px"
                        >缩放到画布</a-tag
                      >
                      <a-tag @click="zoomChange(-4)" style="margin: 0 0 0 1; padding: 0 1px"
                        >重置缩放</a-tag
                      >
                    </a-space>
                  </div>
                </div>
              </a-collapse-panel>
              <a-collapse-panel key="run" header="展示">
                <div :class="`${prefixCls}prop-config`">
                  <div>
                    <a-checkbox-group v-model:value="gplotStore.containerConfig.runType">
                      <a-checkbox value="zommCanvas">锁定画布缩放</a-checkbox>
                      <a-checkbox value="dragCanvas">锁定画布平移</a-checkbox>
                    </a-checkbox-group>
                  </div>
                </div>
              </a-collapse-panel>
            </a-collapse>
          </a-tab-pane>
        </a-tabs>
      </div>
    </template>
    <template v-else>
      <div :class="`${prefixCls}prop-attr`">
        <a-tabs
          v-model:activeKey="configTabsActiveKey"
          :tabBarStyle="{ height: '32px', marginBottom: '0.5px', background: '#fff' }"
        >
          <template v-if="true">
            <a-tab-pane key="attr" tab="属性">
              <a-form
                :label-col="{ span: 10 }"
                :wrapper-col="{ span: 14 }"
                autocomplete="off"
                :model="gplotStore.selectedOb.style"
              >
                <a-form-item
                  name="x"
                  label="水平位置X"
                  :rules="[{ required: true, message: '请输入水平位置' }]"
                >
                  <a-input-number
                    style="width: 100px"
                    v-model:value="gplotStore.selectedOb.style.x"
                    addon-after="px"
                    size="small"
                  />
                </a-form-item>
                <a-form-item
                  name="y"
                  label="水平位置Y"
                  :rules="[{ required: true, message: '请输入水平位置y' }]"
                >
                  <a-input-number
                    v-model:value="gplotStore.selectedOb.style.y"
                    addon-after="px"
                    size="small"
                  />
                </a-form-item>
                <a-form-item name="fill" label="背景颜色">
                  <div>
                    <selectColor :color="gplotStore.selectedOb.style.fill" />
                  </div>
                </a-form-item>
                <a-form-item name="stroke" label="线条颜色">
                  <div>
                    <selectColor :color="gplotStore.selectedOb.style.stroke" />
                  </div>
                </a-form-item>
                <a-form-item
                  name="lineWidth"
                  label="线条宽度"
                  :rules="[{ required: true, message: '请输入线条宽度' }]"
                >
                  <a-row>
                    <a-slider
                      class="aSlider"
                      v-model:value="gplotStore.selectedOb.style.lineWidth"
                      :min="1"
                      max="50"
                      :included="false"
                      :tipFormatter="null"
                    />
                    <a-input-number
                      style="width: 90px !important"
                      v-model:value="gplotStore.selectedOb.style.lineWidth"
                      addon-after="px"
                      :min="1"
                      max="50"
                      size="small"
                    />
                  </a-row>
                </a-form-item>
                <a-form-item
                  name="opacity"
                  label="透明度"
                  :rules="[{ required: true, message: '请输入透明度' }]"
                >
                  <a-row>
                    <a-slider
                      class="aSlider"
                      v-model:value="gplotStore.selectedOb.style.opacity"
                      :min="0"
                      max="100"
                      :included="false"
                      :tipFormatter="null"
                    />
                    <a-input-number
                      style="width: 90px !important"
                      v-model:value="gplotStore.selectedOb.style.opacity"
                      min="0"
                      max="100"
                      addon-after="%"
                      size="small"
                    />
                  </a-row>
                </a-form-item>
                <a-form-item name="labelText" label="文字内容">
                  <a-input
                    size="small"
                    v-model:value="gplotStore.selectedOb.style.labelText"
                    placeholder="文字内容"
                  />
                </a-form-item>
                <a-form-item name="labelFill" label="文字颜色">
                  <div>
                    <selectColor :color="gplotStore.selectedOb.style.labelFill" />
                  </div>
                </a-form-item>
                <a-form-item name="labelFontSize" label="文字大小">
                  <a-row>
                    <a-slider
                      class="aSlider"
                      v-model:value="gplotStore.selectedOb.style.labelFontSize"
                      :min="12"
                      max="100"
                      :included="false"
                      :tipFormatter="null"
                    />
                    <a-input-number
                      style="width: 90px !important"
                      v-model:value="gplotStore.selectedOb.style.labelFontSize"
                      min="12"
                      max="100"
                      :precision="0"
                      addon-after="px"
                      size="small"
                    />
                  </a-row>
                </a-form-item>
                <a-form-item name="labelOffsetX" label="文字位移X">
                  <a-input-number
                    v-model:value="gplotStore.selectedOb.style.labelOffsetX"
                    addon-after="px"
                    size="small"
                  />
                </a-form-item>
                <a-form-item name="labelOffsetY" label="文字位移Y">
                  <a-input-number
                    v-model:value="gplotStore.selectedOb.style.labelOffsetY"
                    addon-after="px"
                    size="small"
                  />
                </a-form-item>
                <a-form-item name="labelBackground" label="文字背景">
                  <a-checkbox v-model:checked="gplotStore.selectedOb.style.labelBackground" />
                </a-form-item>

                <a-form-item
                  name="labelBackgroundFill"
                  label="文字背景色"
                  v-show="gplotStore.selectedOb.style.labelBackground"
                >
                  <div>
                    <selectColor :color="gplotStore.selectedOb.style.labelBackgroundFill" />
                  </div>
                </a-form-item>
                <a-form-item
                  name="labelBackgroundStroke"
                  label="文字边框颜色"
                  v-show="gplotStore.selectedOb.style.labelBackground"
                >
                  <div>
                    <selectColor :color="gplotStore.selectedOb.style.labelBackgroundStroke" />
                  </div>
                </a-form-item>
                <a-form-item
                  name="labelBackgroundLineWidth"
                  label="文字边框宽度"
                  v-show="gplotStore.selectedOb.style.labelBackground"
                >
                  <a-row>
                    <a-slider
                      style="width: 64px; margin-right: 9px"
                      v-model:value="gplotStore.selectedOb.style.labelBackgroundLineWidth"
                      :min="0"
                      max="100"
                      :included="false"
                      :tipFormatter="null"
                    />
                    <a-input-number
                      class="myInputNumber"
                      style="width: 90px !important"
                      v-model:value="gplotStore.selectedOb.style.labelBackgroundLineWidth"
                      min="0"
                      max="100"
                      :precision="0"
                    />
                  </a-row>
                </a-form-item>
                <a-form-item
                  name="labelBackgroundRadius"
                  label="文字边框圆角"
                  v-show="gplotStore.selectedOb.style.labelBackground"
                >
                  <a-row>
                    <a-slider
                      style="width: 64px; margin-right: 9px"
                      v-model:value="gplotStore.selectedOb.style.labelBackgroundRadius"
                      :min="0"
                      max="100"
                      :included="false"
                      :tipFormatter="null"
                    />
                    <a-input-number
                      class="myInputNumber"
                      style="width: 90px !important"
                      v-model:value="gplotStore.selectedOb.style.labelBackgroundRadius"
                      min="0"
                      max="100"
                      :precision="0"
                    />
                  </a-row>
                </a-form-item>
                <a-form-item
                  name="labelBackgroundOpacity"
                  label="文字边框透明"
                  v-show="gplotStore.selectedOb.style.labelBackground"
                >
                  <a-row>
                    <a-slider
                      class="aSlider"
                      v-model:value="gplotStore.selectedOb.style.labelBackgroundOpacity"
                      :min="0"
                      max="100"
                      :included="false"
                      :tipFormatter="null"
                    />
                    <a-input-number
                      style="width: 90px !important"
                      v-model:value="gplotStore.selectedOb.style.labelBackgroundOpacity"
                      min="0"
                      max="100"
                      :precision="0"
                      addon-after="%"
                      size="small"
                    />
                  </a-row>
                </a-form-item>
                <a-form-item
                  name="labelBackgroundLineDash"
                  label="文字边框分割"
                  v-show="gplotStore.selectedOb.style.labelBackground"
                >
                  <a-row>
                    <a-slider
                      style="width: 64px; margin-right: 9px"
                      v-model:value="gplotStore.selectedOb.style.labelBackgroundLineDash"
                      :min="0"
                      max="100"
                      :included="false"
                      :tipFormatter="null"
                    />
                    <a-input-number
                      class="myInputNumber"
                      style="width: 90px !important"
                      v-model:value="gplotStore.selectedOb.style.labelBackgroundLineDash"
                      min="0"
                      max="100"
                      :precision="0"
                    />
                  </a-row>
                </a-form-item>
                <a-form-item name="startArrow" label="开始箭头">
                  <a-checkbox v-model:checked="gplotStore.selectedOb.style.startArrow" />
                </a-form-item>
                <a-form-item
                  name="startArrowType"
                  label="开始箭头类型"
                  v-show="gplotStore.selectedOb.style.startArrow"
                >
                  <a-select
                    allow-clear
                    v-model:value="gplotStore.selectedOb.style.startArrowType"
                    style="width: 100%"
                    placeholder="开始箭头类型"
                  >
                    <a-select-option value="triangle">
                      <span>
                        <IconFontClass name="icon-baseui-jiantou1" style="margin-right: 2px" />
                        实心三角
                      </span>
                    </a-select-option>
                    <a-select-option value="circle">
                      <span>
                        <IconFontClass name="icon-baseui-yuandian" style="margin-right: 2px" />
                        圆点
                      </span>
                    </a-select-option>
                    <a-select-option value="diamond">
                      <span>
                        <IconFontClass name="icon-baseui-lingxing" style="margin-right: 2px" />
                        菱形
                      </span>
                    </a-select-option>
                    <a-select-option value="rect">
                      <span>
                        <IconFontClass
                          name="icon-baseui-shixinzhengfangxing"
                          style="margin-right: 2px"
                        />
                        正方形
                      </span>
                    </a-select-option>
                    <a-select-option value="vee">
                      <span>
                        <IconFontClass name="icon-baseui-vee" style="margin-right: 2px" />
                        箭头
                      </span>
                    </a-select-option>
                    <a-select-option value="simple">
                      <span>
                        <IconFontClass
                          name="icon-baseui-xiangzuojiantou"
                          style="margin-right: 2px"
                        />
                        简易箭头
                      </span>
                    </a-select-option>
                  </a-select>
                </a-form-item>
                <a-form-item
                  name="startArrowSize"
                  label="开始箭头大小"
                  v-show="gplotStore.selectedOb.style.startArrow"
                >
                  <a-row>
                    <a-slider
                      style="width: 64px; margin-right: 9px"
                      v-model:value="gplotStore.selectedOb.style.startArrowSize"
                      :min="0"
                      max="100"
                      :included="false"
                      :tipFormatter="null"
                    />
                    <a-input-number
                      class="myInputNumber"
                      style="width: 90px !important"
                      v-model:value="gplotStore.selectedOb.style.startArrowSize"
                      min="0"
                      max="100"
                      :precision="0"
                    />
                  </a-row>
                </a-form-item>
                <a-form-item name="endArrow" label="结束箭头">
                  <a-checkbox v-model:checked="gplotStore.selectedOb.style.endArrow" />
                </a-form-item>
                <a-form-item
                  name="endArrowType"
                  label="结束箭头类型"
                  v-show="gplotStore.selectedOb.style.endArrow"
                >
                  <a-select
                    allow-clear
                    v-model:value="gplotStore.selectedOb.style.endArrowType"
                    style="width: 100%"
                    placeholder="开始箭头类型"
                  >
                    <a-select-option value="triangle">
                      <span>
                        <IconFontClass name="icon-baseui-jiantou1" style="margin-right: 2px" />
                        实心三角
                      </span>
                    </a-select-option>
                    <a-select-option value="circle">
                      <span>
                        <IconFontClass name="icon-baseui-yuandian" style="margin-right: 2px" />
                        圆点
                      </span>
                    </a-select-option>
                    <a-select-option value="diamond">
                      <span>
                        <IconFontClass name="icon-baseui-lingxing" style="margin-right: 2px" />
                        菱形
                      </span>
                    </a-select-option>
                    <a-select-option value="rect">
                      <span>
                        <IconFontClass
                          name="icon-baseui-shixinzhengfangxing"
                          style="margin-right: 2px"
                        />
                        正方形
                      </span>
                    </a-select-option>
                    <a-select-option value="vee">
                      <span>
                        <IconFontClass name="icon-baseui-vee" style="margin-right: 2px" />
                        箭头
                      </span>
                    </a-select-option>
                    <a-select-option value="simple">
                      <span>
                        <IconFontClass
                          name="icon-baseui-xiangzuojiantou"
                          style="margin-right: 2px"
                        />
                        简易箭头
                      </span>
                    </a-select-option>
                  </a-select>
                </a-form-item>
                <a-form-item
                  name="endArrowSize"
                  label="结束箭头大小"
                  v-show="gplotStore.selectedOb.style.endArrow"
                >
                  <a-row>
                    <a-slider
                      style="width: 64px; margin-right: 9px"
                      v-model:value="gplotStore.selectedOb.style.endArrowSize"
                      :min="0"
                      max="100"
                      :included="false"
                      :tipFormatter="null"
                    />
                    <a-input-number
                      class="myInputNumber"
                      style="width: 90px !important"
                      v-model:value="gplotStore.selectedOb.style.endArrowSize"
                      min="0"
                      max="100"
                      :precision="0"
                    />
                  </a-row>
                </a-form-item>
              </a-form>
            </a-tab-pane>
          </template>
          <template v-if="true">
            <a-tab-pane key="event" tab="交互">
              <div :class="`${prefixCls}attr-event`">
                <div
                  :class="`${prefixCls}event-content`"
                  v-show="gplotStore.selectedOb.data.event.length > 0"
                >
                  <a-collapse v-model:activeKey="attrEventActiveKey">
                    <a-collapse-panel
                      v-for="item in gplotStore.selectedOb.data.event"
                      :key="item.key"
                      :header="item.title"
                    >
                      <div :class="`${prefixCls}content-item`">
                        <div>
                          <div> 开启 </div>
                          <div>
                            <a-switch
                              v-model:checked="item.open"
                              checked-children="开"
                              un-checked-children="关"
                            />
                          </div>
                        </div>
                        <div>
                          <div> 事件类型 </div>
                          <div>
                            <a-select v-model:value="item.event" style="width: 120px" size="small">
                              <a-select-option value="click">单击</a-select-option>
                              <a-select-option
                                :disabled="
                                  gplotStore.selectedOb.data.event.find(
                                    (m) => m.event == 'rightClick',
                                  ) != undefined
                                "
                                value="rightClick"
                                >右键</a-select-option
                              >
                            </a-select>
                          </div>
                        </div>
                        <action
                          :item="item"
                          :menuTreeData="props.menuTreeData"
                          :updateEventItem="updateEventItem"
                        />
                        <div v-show="item.event == 'rightClick'">
                          <div> 菜单 </div>
                          <div
                            style="
                              width: 215px;
                              height: 300px;
                              padding: 2px;
                              border: 1px solid #e5e7eb;
                            "
                          >
                            <myTree
                              :isShowAllCheck="false"
                              :showIcon="false"
                              :checkable="false"
                              :checkStrictly="true"
                              :isShowSearch="true"
                              :data="item.children"
                            >
                              <template #addbtn>
                                <IconFontClass
                                  name="icon-baseui-tianjiawukuang"
                                  @click="showAddRightMenu(item, true, 'add')"
                                  title="添加"
                                  style="
                                    display: inline-block;
                                    height: 30px;
                                    margin-top: 1px;
                                    border-radius: 1px;
                                    color: #0960bd;
                                    font-size: 16px;
                                    line-height: 31px;
                                    cursor: pointer;
                                  "
                                />
                              </template>
                              <template #titlebtn="node">
                                <IconFontClass
                                  name="icon-baseui-edit-fill"
                                  @click="showAddRightMenu(node.param, false, 'edit')"
                                  title="编辑"
                                  style="color: #10893e"
                                />
                                <IconFontClass
                                  name="icon-baseui-tianjiawukuang"
                                  @click="showAddRightMenu(node.param, false, 'add')"
                                  title="添加"
                                  style="margin-right: 2px; color: #0960bd"
                                />
                                <IconFontClass
                                  @click="removeRightMenu(node.param)"
                                  name="icon-baseui-shanchu"
                                  style="color: red"
                                  title="删除"
                                />
                              </template>
                            </myTree>
                          </div>
                        </div>
                      </div>
                      <template #extra>
                        <IconFontClass
                          @click="deleteEvent(item)"
                          style="font-size: 12px; font-weight: 700"
                          name="icon-baseui-guanbicuowu"
                        />
                      </template>
                    </a-collapse-panel>
                  </a-collapse>
                </div>
                <div
                  v-show="gplotStore.selectedOb.data.event.length == 0"
                  style="opacity: 0.5; text-align: center"
                >
                  <IconFontClass
                    :isSvg="true"
                    style="font-size: 180px"
                    name="icon-baseui-bianji1"
                  />
                </div>
                <div style="height: 40px; padding-top: 5px; text-align: center">
                  <a-button type="primary" @click="addEvent">添加交互</a-button>
                </div>
              </div>
            </a-tab-pane>
          </template>
        </a-tabs>
      </div>
    </template>
  </div>
  <a-drawer
    :bodyStyle="{ overflowY: 'hidden', overflowX: 'hidden' }"
    :headerStyle="{ height: '49px', borderBottom: '2px solid #eee' }"
    :width="320"
    :visible="isShowRightMneu"
    title="右键菜单"
    :footer-style="{ textAlign: 'right' }"
    @close="closeRightMenu"
  >
    <div v-if="rightNewData">
      <action
        :item="rightNewData"
        :menuTreeData="props.menuTreeData"
        :updateEventItem="updateEventItem"
      />
    </div>
    <template #footer>
      <a-button type="primary" @click="saveRightMenu">保存</a-button>
      <a-button style="margin-left: 8px" @click="closeRightMenu">关闭</a-button>
    </template>
  </a-drawer>
</template>
<script setup>
  import AntVueCommon from '@/utils/MyCommon/AntVueCommon';
  import myTree from '/@/components/MyTree/index.vue';
  import action from './action.vue';
  import selectColor from '/@/components/MySelectColor/index.vue';
  import { message } from 'ant-design-vue';
  import { ref, watch } from 'vue';
  import { useDesign } from '/@/hooks/web/useDesign';
  import codemirror from '/@/components/MyCodemirror/codemirror.vue';
  import { useGplotStoreWithOut } from '@/store/modules/gplot';

  const props = defineProps({
    //选中的组件
    selectedOb: {
      type: Object,
      default() {
        return {};
      },
    },
    //选中的容器配置
    containerConfig: {
      type: Object,
      default() {
        return {
          //容器大小类型
          size: 'custom',
          //宽度
          sizeWidth: '',
          //高度
          sizeHeight: '',
          //背景色
          backgroundColor: '',
          //背景图
          backgroundImg: '',
          //自定义接口是否启用
          requestUse: false,
          //接口刷新频率
          requstRefresh: 1000,
          //运行方式
          runType: [],
        };
      },
    },
    //修改当前选中容器的属性值
    updateSelectContainerValue: {
      type: Function,
      default() {
        return (attr, value) => {};
      },
    },
    //控制属性的显示
    showSign: {
      type: Array,
      default() {
        return [];
      },
    },
    //canvas对象
    containerObArray: {
      type: Array,
      default() {
        return null;
      },
    },
    //视频列表
    videoData: {
      type: Array,
      default() {
        return [];
      },
    },
    menuTreeData: {
      type: Array,
      default() {
        return [];
      },
    },
  });
  const gplotStore = useGplotStoreWithOut();
</script>
<style lang="less" scoped>
  @prefixCls: ~'@{namespace}-GplotManage-';

  :deep(.ant-slider-mark) {
    top: -18px;
  }

  .aSlider {
    position: relative;
    bottom: 3px;
    width: 64px;
    margin-right: 9px;
  }

  // .myInputNumber {
  //   :deep(.ant-input-number-input) {
  //     height: 34px !important;
  //   }
  // }

  //////////////////////////////////////////////////

  .@{prefixCls}prop {
    width: 100%;
    height: 100%;
    overflow: hidden;

    :deep(.ant-collapse-header) {
      font-weight: 900;
    }

    .@{prefixCls}-title {
      color: #d1d1d1;
    }

    :deep(.ant-collapse-content-box) {
      padding: 5px;
    }

    .@{prefixCls}prop-container {
      display: flex;
      flex-direction: column;
      height: 100%;

      > div:first-child {
        width: 100%;
        height: 35px;
        // border-bottom: 1px solid #dfe3e8;
        padding-left: 10px;
        color: rgb(51 51 51);
        font-size: 13px;
        font-weight: 700;
        line-height: 35px;
      }

      > div:last-child {
        flex: 1 auto;
        flex-basis: 0;
        overflow: auto;

        :deep(.ant-collapse-header) {
          padding: 3px 16px;
        }

        :deep(.ant-collapse-content-box) {
          padding: 5px;
        }
      }

      .upbackcolor {
        position: relative;
      }

      .upbackimg {
        position: relative;
        width: 25px;
        height: 25px;
        border: 1px solid #e6e6e6;
        text-align: center;

        :deep(.ant-upload-list) {
          display: none;
        }
      }
    }

    .@{prefixCls}prop-config {
      display: flex;
      flex-flow: row wrap;

      :deep(.ant-tag) {
        margin-inline-end: 5px;
        cursor: pointer;
      }
      .@{prefixCls}config-quick {
        position: relative;

        > i {
          padding: 0;
          padding: 0 5px;
          font-size: 17px;
          font-weight: 500;
        }
      }

      :deep(.ant-input-number-group-addon) {
        padding: 0 2px;
        color: rgb(209 209 209);
        font-size: 10px;
      }

      > div {
        display: flex;
        flex-flow: row wrap;
        justify-content: space-between;
        width: 100%;
        margin-bottom: 5px;
      }

      .upbackcolor {
        position: relative;
      }

      .upbackimg {
        position: relative;
        width: 25px;
        height: 25px;
        border: 1px solid #e6e6e6;
        text-align: center;

        :deep(.ant-upload-list) {
          display: none;
        }
      }
    }

    .@{prefixCls}prop-attr {
      width: calc(100% + 3px);
      // height: 100%;
      height: calc(100% - 25px);
      overflow: hidden;

      :deep(.ant-tabs-content) {
        height: 100%;
      }

      .@{prefixCls}attr-cartoon {
        width: 100%;
        height: 100%;

        .@{prefixCls}content-item {
          > div {
            display: flex;
            flex-direction: row;
            justify-content: space-between;
            margin: 5px 0;
          }
        }
      }

      .@{prefixCls}attr-event {
        width: 100%;
        height: 100%;

        .@{prefixCls}content-item {
          > div {
            display: flex;
            flex-direction: row;
            justify-content: space-between;
            margin: 5px 0;
          }
        }
      }
    }
  }
</style>
