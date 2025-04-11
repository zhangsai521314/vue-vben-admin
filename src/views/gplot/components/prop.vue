<template>
  <div :class="`${prefixCls}prop`">
    <template
      v-if="
        props.graphObRef &&
        !Array.isArray(gplotStore.gplotKeyOb[props.graphObRef.gplotKey].selectedOb) &&
        gplotStore.gplotKeyOb[props.graphObRef.gplotKey].selectedOb != null
      "
    >
      <div :class="`${prefixCls}prop-attr`">
        <a-tabs
          v-model:activeKey="nodeTabsActiveKey"
          :tabBarStyle="{ height: '32px', marginBottom: '0.5px', background: '#fff' }"
        >
          <a-tab-pane key="attr" :tab="t('view.attribute')">
            <a-form
              :label-col="{ span: 10 }"
              :wrapper-col="{ span: 14 }"
              autocomplete="off"
              :model="gplotStore.gplotKeyOb[props.graphObRef.gplotKey].selectedOb.style"
            >
              <a-form-item style="margin-top: 1px" name="id" :label="t('view.nodeId')">
                <a-input
                  disabled
                  :value="gplotStore.gplotKeyOb[props.graphObRef.gplotKey].selectedOb.id"
                />
              </a-form-item>
              <a-form-item
                :class="{
                  'not-click':
                    gplotStore.gplotKeyOb[props.graphObRef.gplotKey].selectedOb.data.myType !=
                    'node',
                }"
                name="size"
                :label="t('view.overallSize')"
              >
                <a-input-number
                  v-model:value="
                    gplotStore.gplotKeyOb[props.graphObRef.gplotKey].selectedOb.style.size
                  "
                  min="0"
                  :max="99999"
                  :precision="0"
                  addon-after="px"
                />
              </a-form-item>
              <a-form-item
                :class="{
                  'not-click':
                    gplotStore.gplotKeyOb[props.graphObRef.gplotKey].selectedOb.data.myType !=
                    'node',
                }"
                name="x"
                :label="t('view.horizontalPositionX')"
                :rules="[
                  { required: true, message: t('view.pleaseEnterTheHorizontalPosition', ['X']) },
                ]"
              >
                <a-input-number
                  style="width: 100px"
                  v-model:value="
                    gplotStore.gplotKeyOb[props.graphObRef.gplotKey].selectedOb.style.x
                  "
                  addon-after="px"
                />
              </a-form-item>
              <a-form-item
                :class="{
                  'not-click':
                    gplotStore.gplotKeyOb[props.graphObRef.gplotKey].selectedOb.data.myType !=
                    'node',
                }"
                name="y"
                :label="t('view.horizontalPositionY')"
                :rules="[
                  { required: true, message: t('view.pleaseEnterTheHorizontalPosition', ['Y']) },
                ]"
              >
                <a-input-number
                  v-model:value="
                    gplotStore.gplotKeyOb[props.graphObRef.gplotKey].selectedOb.style.y
                  "
                  addon-after="px"
                />
              </a-form-item>
              <!-- <a-form-item
                :class="{
                  'not-click':
                    gplotStore.gplotKeyOb[props.graphObRef.gplotKey].selectedOb.data.myType !=
                      'node' &&
                    gplotStore.gplotKeyOb[props.graphObRef.gplotKey].selectedOb.data.myType !=
                      'combo',
                }"
                name="fill"
                :label="背景颜色"
              >
                <div>
                  <selectColor
                    :color="gplotStore.gplotKeyOb[props.graphObRef.gplotKey].selectedOb.style.fill"
                    @change="
                      (value) => {
                        gplotStore.gplotKeyOb[props.graphObRef.gplotKey].selectedOb.style.fill =
                          value;
                      }
                    "
                  />
                </div>
              </a-form-item> -->
              <a-form-item
                :class="{
                  'not-click':
                    gplotStore.gplotKeyOb[props.graphObRef.gplotKey].selectedOb.data.myType !=
                    'node',
                }"
                name="iconFill"
                :label="t('view.iconColor')"
              >
                <div>
                  <selectColor
                    :color="
                      gplotStore.gplotKeyOb[props.graphObRef.gplotKey].selectedOb.style.iconFill
                    "
                    @change="
                      (value) => {
                        gplotStore.gplotKeyOb[props.graphObRef.gplotKey].selectedOb.style.iconFill =
                          value;
                      }
                    "
                  />
                </div>
              </a-form-item>
              <a-form-item
                :class="{
                  'not-click':
                    gplotStore.gplotKeyOb[props.graphObRef.gplotKey].selectedOb.data.myType !=
                    'node',
                }"
                name="iconFontSize"
                :label="t('view.iconSize')"
                :autoLink="false"
              >
                <a-row>
                  <a-slider
                    class="aSlider"
                    v-model:value="
                      gplotStore.gplotKeyOb[props.graphObRef.gplotKey].selectedOb.style.iconFontSize
                    "
                    :min="0"
                    :max="1000"
                    :included="false"
                    :tipFormatter="null"
                  />
                  <a-input-number
                    style="width: 90px !important"
                    v-model:value="
                      gplotStore.gplotKeyOb[props.graphObRef.gplotKey].selectedOb.style.iconFontSize
                    "
                    min="0"
                    :max="1000"
                    :precision="0"
                    addon-after="px"
                  />
                </a-row>
              </a-form-item>
              <a-form-item
                :class="{
                  'not-click':
                    gplotStore.gplotKeyOb[props.graphObRef.gplotKey].selectedOb.data.myType ==
                    'node',
                }"
                name="stroke"
                :label="t('view.lineColor')"
              >
                <div>
                  <selectColor
                    :color="
                      gplotStore.gplotKeyOb[props.graphObRef.gplotKey].selectedOb.style.stroke
                    "
                    @change="
                      (value) => {
                        gplotStore.gplotKeyOb[props.graphObRef.gplotKey].selectedOb.style.stroke =
                          value;
                      }
                    "
                  />
                </div>
              </a-form-item>

              <!-- <a-form-item
                :class="{
                  'not-click':
                    gplotStore.gplotKeyOb[props.graphObRef.gplotKey].selectedOb.data.myType ==
                    'node',
                }"
                name="lineWidth"
                :label="t('view.lineWidth')"
                :rules="[{ required: true, message: t('view.pleaseEnterTheLineWidthk') }]"
                :autoLink="false"
              >
                <a-row>
                  <a-slider
                    class="aSlider"
                    v-model:value="
                      gplotStore.gplotKeyOb[props.graphObRef.gplotKey].selectedOb.style.lineWidth
                    "
                    :min="0"
                    :max="50"
                    :included="false"
                    :tipFormatter="null"
                  />
                  <a-input-number
                    style="width: 90px !important"
                    v-model:value="
                      gplotStore.gplotKeyOb[props.graphObRef.gplotKey].selectedOb.style.lineWidth
                    "
                    addon-after="px"
                    :min="0"
                    :max="50"
                  />
                </a-row>
              </a-form-item> -->

              <a-form-item
                name="opacity"
                :label="t('view.transparency')"
                :rules="[{ required: true, message: t('view.pleaseEnterTheTransparency') }]"
                :autoLink="false"
              >
                <a-row>
                  <a-slider
                    class="aSlider"
                    v-model:value="
                      gplotStore.gplotKeyOb[props.graphObRef.gplotKey].selectedOb.style.opacity
                    "
                    :min="0"
                    :max="1"
                    :included="false"
                    :tipFormatter="null"
                    :step="0.0001"
                  />
                  <a-input-number
                    style="width: 90px !important"
                    v-model:value="
                      gplotStore.gplotKeyOb[props.graphObRef.gplotKey].selectedOb.style.opacity
                    "
                    min="0"
                    :max="1"
                    :step="0.0001"
                  />
                </a-row>
              </a-form-item>
              <a-form-item
                :class="{
                  'not-click':
                    gplotStore.gplotKeyOb[props.graphObRef.gplotKey].selectedOb.data.myType ==
                      'combo' ||
                    gplotStore.gplotKeyOb[props.graphObRef.gplotKey].selectedOb.data.myType ==
                      'edge',
                }"
                name="labelTextCn"
                :label="t('view.textContentCn')"
              >
                <a-textarea
                  maxlength="60"
                  v-model:value="
                    gplotStore.gplotKeyOb[props.graphObRef.gplotKey].selectedOb.style.labelTextCn
                  "
                  @change="(v) => labelTextChange('cn')"
                  :placeholder="t('view.textContentCn')"
                />
              </a-form-item>
              <a-form-item
                :class="{
                  'not-click':
                    gplotStore.gplotKeyOb[props.graphObRef.gplotKey].selectedOb.data.myType ==
                      'combo' ||
                    gplotStore.gplotKeyOb[props.graphObRef.gplotKey].selectedOb.data.myType ==
                      'edge',
                }"
                name="labelTextEn"
                :label="t('view.textContentEn')"
              >
                <a-textarea
                  maxlength="60"
                  v-model:value="
                    gplotStore.gplotKeyOb[props.graphObRef.gplotKey].selectedOb.style.labelTextEn
                  "
                  @change="(v) => labelTextChange('en')"
                  :placeholder="t('view.textContentEn')"
                />
              </a-form-item>
              <a-form-item
                :class="{
                  'not-click':
                    gplotStore.gplotKeyOb[props.graphObRef.gplotKey].selectedOb.data.myType ==
                      'combo' ||
                    gplotStore.gplotKeyOb[props.graphObRef.gplotKey].selectedOb.data.myType ==
                      'edge',
                }"
                name="labelTextFr"
                :label="t('view.textContentFr')"
              >
                <a-textarea
                  maxlength="60"
                  v-model:value="
                    gplotStore.gplotKeyOb[props.graphObRef.gplotKey].selectedOb.style.labelTextFr
                  "
                  @change="(v) => labelTextChange('fr')"
                  :placeholder="t('view.textContentFr')"
                />
              </a-form-item>
              <a-form-item
                :class="{
                  'not-click':
                    gplotStore.gplotKeyOb[props.graphObRef.gplotKey].selectedOb.data.myType ==
                      'combo' ||
                    gplotStore.gplotKeyOb[props.graphObRef.gplotKey].selectedOb.data.myType ==
                      'edge',
                }"
                name="labelFill"
                :label="t('view.textColor')"
              >
                <div>
                  <selectColor
                    :color="
                      gplotStore.gplotKeyOb[props.graphObRef.gplotKey].selectedOb.style.labelFill
                    "
                    @change="
                      (value) => {
                        gplotStore.gplotKeyOb[
                          props.graphObRef.gplotKey
                        ].selectedOb.style.labelFill = value;
                      }
                    "
                  />
                </div>
              </a-form-item>
              <a-form-item
                :class="{
                  'not-click':
                    gplotStore.gplotKeyOb[props.graphObRef.gplotKey].selectedOb.data.myType ==
                      'combo' ||
                    gplotStore.gplotKeyOb[props.graphObRef.gplotKey].selectedOb.data.myType ==
                      'edge',
                }"
                name="labelFontSize"
                :label="t('view.textSize')"
                :autoLink="false"
              >
                <a-row>
                  <a-slider
                    class="aSlider"
                    v-model:value="
                      gplotStore.gplotKeyOb[props.graphObRef.gplotKey].selectedOb.style
                        .labelFontSize
                    "
                    :min="0"
                    :max="100"
                    :included="false"
                    :tipFormatter="null"
                  />
                  <a-input-number
                    style="width: 90px !important"
                    v-model:value="
                      gplotStore.gplotKeyOb[props.graphObRef.gplotKey].selectedOb.style
                        .labelFontSize
                    "
                    min="0"
                    :max="100"
                    :precision="0"
                    addon-after="px"
                  />
                </a-row>
              </a-form-item>
              <a-form-item
                :class="{
                  'not-click':
                    gplotStore.gplotKeyOb[props.graphObRef.gplotKey].selectedOb.data.myType ==
                      'combo' ||
                    gplotStore.gplotKeyOb[props.graphObRef.gplotKey].selectedOb.data.myType ==
                      'edge',
                }"
                name="labelOffsetX"
                :label="t('view.textOffsetX')"
              >
                <a-input-number
                  v-model:value="
                    gplotStore.gplotKeyOb[props.graphObRef.gplotKey].selectedOb.style.labelOffsetX
                  "
                  addon-after="px"
                />
              </a-form-item>
              <a-form-item
                :class="{
                  'not-click':
                    gplotStore.gplotKeyOb[props.graphObRef.gplotKey].selectedOb.data.myType ==
                      'combo' ||
                    gplotStore.gplotKeyOb[props.graphObRef.gplotKey].selectedOb.data.myType ==
                      'edge',
                }"
                name="labelOffsetY"
                :label="t('view.textOffsetY')"
              >
                <a-input-number
                  v-model:value="
                    gplotStore.gplotKeyOb[props.graphObRef.gplotKey].selectedOb.style.labelOffsetY
                  "
                  addon-after="px"
                />
              </a-form-item>
              <!-- 
               <a-form-item
                :class="{
                  'not-click':
                    gplotStore.gplotKeyOb[props.graphObRef.gplotKey].selectedOb.data.myType ==
                    'combo',
                }"
                name="labelBackground"
                :label="t('view.textBackground')"
              >
                <a-checkbox
                  v-model:checked="
                    gplotStore.gplotKeyOb[props.graphObRef.gplotKey].selectedOb.style
                      .labelBackground
                  "
                />
              </a-form-item>
              <a-form-item
                name="labelBackgroundFill"
                :label="t('view.textColorBackground')"
                v-show="
                  gplotStore.gplotKeyOb[props.graphObRef.gplotKey].selectedOb.style.labelBackground
                "
              >
                <div>
                  <selectColor
                    :color="
                      gplotStore.gplotKeyOb[props.graphObRef.gplotKey].selectedOb.style
                        .labelBackgroundFill
                    "
                    @change="
                      (value) => {
                        gplotStore.gplotKeyOb[
                          props.graphObRef.gplotKey
                        ].selectedOb.style.labelBackgroundFill = value;
                      }
                    "
                  />
                </div>
              </a-form-item>
              <a-form-item
                :class="{
                  'not-click':
                    gplotStore.gplotKeyOb[props.graphObRef.gplotKey].selectedOb.data.myType ==
                    'combo',
                }"
                name="labelBackgroundStroke"
                :label="文字边框颜色"
                v-show="
                  gplotStore.gplotKeyOb[props.graphObRef.gplotKey].selectedOb.style.labelBackground
                "
              >
                <div>
                  <selectColor
                    :color="
                      gplotStore.gplotKeyOb[props.graphObRef.gplotKey].selectedOb.style
                        .labelBackgroundStroke
                    "
                    @change="
                      (value) => {
                        gplotStore.gplotKeyOb[
                          props.graphObRef.gplotKey
                        ].selectedOb.style.labelBackgroundStroke = value;
                      }
                    "
                  />
                </div>
              </a-form-item>
              <a-form-item
                :class="{
                  'not-click':
                    gplotStore.gplotKeyOb[props.graphObRef.gplotKey].selectedOb.data.myType ==
                    'combo',
                }"
                name="labelBackgroundLineWidth"
                :label="文字边框宽度"
                v-show="
                  gplotStore.gplotKeyOb[props.graphObRef.gplotKey].selectedOb.style.labelBackground
                "
                :autoLink="false"
              >
                <a-row>
                  <a-slider
                    style="width: 64px; margin-right: 9px"
                    v-model:value="
                      gplotStore.gplotKeyOb[props.graphObRef.gplotKey].selectedOb.style
                        .labelBackgroundLineWidth
                    "
                    :min="0"
                    :max="100"
                    :included="false"
                    :tipFormatter="null"
                  />
                  <a-input-number
                    class="myInputNumber"
                    style="width: 90px !important"
                    v-model:value="
                      gplotStore.gplotKeyOb[props.graphObRef.gplotKey].selectedOb.style
                        .labelBackgroundLineWidth
                    "
                    min="0"
                    :max="100"
                    :precision="0"
                  />
                </a-row>
              </a-form-item>
              <a-form-item
                :class="{
                  'not-click':
                    gplotStore.gplotKeyOb[props.graphObRef.gplotKey].selectedOb.data.myType ==
                    'combo',
                }"
                name="labelBackgroundRadius"
                :label="文字边框圆角"
                v-show="
                  gplotStore.gplotKeyOb[props.graphObRef.gplotKey].selectedOb.style.labelBackground
                "
                :autoLink="false"
              >
                <a-row>
                  <a-slider
                    style="width: 64px; margin-right: 9px"
                    v-model:value="
                      gplotStore.gplotKeyOb[props.graphObRef.gplotKey].selectedOb.style
                        .labelBackgroundRadius
                    "
                    :min="0"
                    :max="100"
                    :included="false"
                    :tipFormatter="null"
                  />
                  <a-input-number
                    class="myInputNumber"
                    style="width: 90px !important"
                    v-model:value="
                      gplotStore.gplotKeyOb[props.graphObRef.gplotKey].selectedOb.style
                        .labelBackgroundRadius
                    "
                    min="0"
                    :max="100"
                    :precision="0"
                  />
                </a-row>
              </a-form-item>
              <a-form-item
                :class="{
                  'not-click':
                    gplotStore.gplotKeyOb[props.graphObRef.gplotKey].selectedOb.data.myType ==
                    'combo',
                }"
                name="labelBackgroundOpacity"
                :label="文字边框透明"
                v-show="
                  gplotStore.gplotKeyOb[props.graphObRef.gplotKey].selectedOb.style.labelBackground
                "
                :autoLink="false"
              >
                <a-row>
                  <a-slider
                    class="aSlider"
                    v-model:value="
                      gplotStore.gplotKeyOb[props.graphObRef.gplotKey].selectedOb.style
                        .labelBackgroundOpacity
                    "
                    :min="0"
                    :max="100"
                    :included="false"
                    :tipFormatter="null"
                  />
                  <a-input-number
                    style="width: 90px !important"
                    v-model:value="
                      gplotStore.gplotKeyOb[props.graphObRef.gplotKey].selectedOb.style
                        .labelBackgroundOpacity
                    "
                    min="0"
                    :max="100"
                    :precision="0"
                    addon-after="%"
                  />
                </a-row>
              </a-form-item>
              <a-form-item
                :class="{
                  'not-click':
                    gplotStore.gplotKeyOb[props.graphObRef.gplotKey].selectedOb.data.myType ==
                    'combo',
                }"
                name="labelBackgroundLineDash"
                :label="文字边框分割"
                v-show="
                  gplotStore.gplotKeyOb[props.graphObRef.gplotKey].selectedOb.style.labelBackground
                "
                :autoLink="false"
              >
                <a-row>
                  <a-slider
                    style="width: 64px; margin-right: 9px"
                    v-model:value="
                      gplotStore.gplotKeyOb[props.graphObRef.gplotKey].selectedOb.style
                        .labelBackgroundLineDash
                    "
                    :min="0"
                    :max="100"
                    :included="false"
                    :tipFormatter="null"
                  />
                  <a-input-number
                    class="myInputNumber"
                    style="width: 90px !important"
                    v-model:value="
                      gplotStore.gplotKeyOb[props.graphObRef.gplotKey].selectedOb.style
                        .labelBackgroundLineDash
                    "
                    min="0"
                    :max="100"
                    :precision="0"
                  />
                </a-row>
              </a-form-item> -->
              <a-form-item
                :class="{
                  'not-click':
                    gplotStore.gplotKeyOb[props.graphObRef.gplotKey].selectedOb.data.myType !=
                    'edge',
                }"
                name="startArrow"
                :label="t('view.startArrow')"
              >
                <a-checkbox
                  v-model:checked="
                    gplotStore.gplotKeyOb[props.graphObRef.gplotKey].selectedOb.style.startArrow
                  "
                />
              </a-form-item>
              <!-- <a-form-item
                name="startArrowType"
                :label="开始箭头类型"
                v-show="
                  gplotStore.gplotKeyOb[props.graphObRef.gplotKey].selectedOb.style.startArrow
                "
              >
                <a-select
                  allow-clear
                  v-model:value="
                    gplotStore.gplotKeyOb[props.graphObRef.gplotKey].selectedOb.style.startArrowType
                  "
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
                      <IconFontClass name="icon-baseui-xiangzuojiantou" style="margin-right: 2px" />
                      简易箭头
                    </span>
                  </a-select-option>
                </a-select>
              </a-form-item> -->

              <!-- <a-form-item
                name="startArrowSize"
                :label="开始箭头大小"
                v-show="
                  gplotStore.gplotKeyOb[props.graphObRef.gplotKey].selectedOb.style.startArrow
                "
                :autoLink="false"
              >
                <a-row>
                  <a-slider
                    style="width: 64px; margin-right: 9px"
                    v-model:value="
                      gplotStore.gplotKeyOb[props.graphObRef.gplotKey].selectedOb.style
                        .startArrowSize
                    "
                    :min="0"
                    :max="100"
                    :included="false"
                    :tipFormatter="null"
                  />
                  <a-input-number
                    class="myInputNumber"
                    style="width: 90px !important"
                    v-model:value="
                      gplotStore.gplotKeyOb[props.graphObRef.gplotKey].selectedOb.style
                        .startArrowSize
                    "
                    min="0"
                    :max="100"
                    :precision="0"
                  />
                </a-row>
              </a-form-item> -->
              <a-form-item
                :class="{
                  'not-click':
                    gplotStore.gplotKeyOb[props.graphObRef.gplotKey].selectedOb.data.myType !=
                    'edge',
                }"
                name="endArrow"
                :label="t('view.endArrow')"
              >
                <a-checkbox
                  v-model:checked="
                    gplotStore.gplotKeyOb[props.graphObRef.gplotKey].selectedOb.style.endArrow
                  "
                />
              </a-form-item>
              <!--
              <a-form-item
                name="endArrowType"
                :label="结束箭头类型"
                v-show="gplotStore.gplotKeyOb[props.graphObRef.gplotKey].selectedOb.style.endArrow"
              >
                <a-select
                  allow-clear
                  v-model:value="
                    gplotStore.gplotKeyOb[props.graphObRef.gplotKey].selectedOb.style.endArrowType
                  "
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
                      <IconFontClass name="icon-baseui-xiangzuojiantou" style="margin-right: 2px" />
                      简易箭头
                    </span>
                  </a-select-option>
                </a-select>
              </a-form-item>
              <a-form-item
                name="endArrowSize"
                :label="结束箭头大小"
                v-show="gplotStore.gplotKeyOb[props.graphObRef.gplotKey].selectedOb.style.endArrow"
                :autoLink="false"
              >
                <a-row>
                  <a-slider
                    style="width: 64px; margin-right: 9px"
                    v-model:value="
                      gplotStore.gplotKeyOb[props.graphObRef.gplotKey].selectedOb.style.endArrowSize
                    "
                    :min="0"
                    :max="100"
                    :included="false"
                    :tipFormatter="null"
                  />
                  <a-input-number
                    class="myInputNumber"
                    style="width: 90px !important"
                    v-model:value="
                      gplotStore.gplotKeyOb[props.graphObRef.gplotKey].selectedOb.style.endArrowSize
                    "
                    :min="0"
                    :max="100"
                    :precision="0"
                  />
                </a-row>
              </a-form-item>
              -->

              <a-divider orientation="center">{{ t('view.statusConfiguration') }}</a-divider>
              <!-- <a-form-item name="startArrow" :label="灵活绑定">
                <a-checkbox
                  v-model:checked="
                    gplotStore.gplotKeyOb[props.graphObRef.gplotKey].selectedOb.data.myIsAgileState
                  "
                />
              </a-form-item> -->
              <a-form-item
                v-show="
                  !gplotStore.gplotKeyOb[props.graphObRef.gplotKey].selectedOb.data.myIsAgileState
                "
                :label="t('view.bindingService')"
                name="myServiceId"
              >
                <a-select
                  :placeholder="t('view.pleaseSelectTheBindingSoftwareService')"
                  style="width: 170px"
                  allow-clear
                  show-search
                  :filter-option="AntVueCommon.filterOption"
                  v-model:value="
                    gplotStore.gplotKeyOb[props.graphObRef.gplotKey].selectedOb.data.myServiceId
                  "
                  :options="serviceTreeData"
                />
              </a-form-item>
              <a-table
                v-show="
                  !gplotStore.gplotKeyOb[props.graphObRef.gplotKey].selectedOb.data.myIsAgileState
                "
                :columns="selectedObAgileStateColumns"
                :data-source="
                  selectedObAgileStateDatasource(
                    gplotStore.gplotKeyOb[props.graphObRef.gplotKey].selectedOb.data.mySimpleState,
                  )
                "
                bordered
                size="small"
                style="min-height: 400px; overflow: auto"
                :pagination="false"
              >
                <template #bodyCell="{ column, text, record }">
                  <template v-if="column.dataIndex == 'level'">
                    <div style="width: 36px">{{ text }}</div>
                  </template>
                  <template v-else-if="column.dataIndex == 'color'">
                    <div>
                      <selectColor
                        :color="record.color"
                        @change="
                          (value) => {
                            record.color = value;
                          }
                        "
                      />
                    </div>
                  </template>
                  <template v-else-if="column.dataIndex == 'open'">
                    <div style="width: 36px">
                      <a-switch v-model:checked="record.open" size="small"
                    /></div>
                  </template>
                </template>
              </a-table>
              <a-table
                v-show="
                  gplotStore.gplotKeyOb[props.graphObRef.gplotKey].selectedOb.data.myIsAgileState
                "
                :columns="selectedObStateColumns"
                :data-source="
                  _.sortBy(
                    gplotStore.gplotKeyOb[props.graphObRef.gplotKey].selectedOb.data.myAgileState,
                    (m) => m.level,
                  )
                "
                bordered
                size="small"
                style="min-height: 400px; overflow: auto"
                :pagination="false"
              >
                <template #bodyCell="{ column, text, record }">
                  <template v-if="column.dataIndex == 'operation'">
                    <div style="width: 64px">
                      <a-space>
                        <a @click="showSelectedObState(record)">编辑</a>
                        <a-popconfirm title="是否删除?" @confirm="delteSelectedObState(record.key)">
                          <a style="color: red">删除</a>
                        </a-popconfirm></a-space
                      >
                    </div>
                  </template>
                  <template v-else-if="column.dataIndex == 'color'">
                    <div>
                      <selectColor
                        :color="record.color"
                        @change="
                          (value) => {
                            record.color = value;
                          }
                        "
                      />
                    </div>
                  </template>
                  <template v-else>
                    <div style="width: 88px">{{ text }}</div></template
                  >
                </template>
                <template #footer>
                  <div>
                    <IconFontClass
                      name="icon-baseui-tianjiawukuang"
                      style="color: #0960bd; font-size: 12px; cursor: pointer; user-select: none"
                      @click="showSelectedObState()"
                      >添加</IconFontClass
                    >
                    <a-popconfirm title="是否清空?" @confirm="clearSelectedObStates()">
                      <IconFontClass
                        name="icon-baseui-delete"
                        style="
                          margin-left: 10px;
                          color: red;
                          font-size: 12px;
                          cursor: pointer;
                          user-select: none;
                        "
                        >清空</IconFontClass
                      >
                    </a-popconfirm>
                  </div>
                </template>
              </a-table>
            </a-form>
          </a-tab-pane>
          <!-- <a-tab-pane key="event" tab="交互"> 交互 </a-tab-pane>
          <template v-if="false">
            <a-tab-pane key="event" tab="交互">
              <div :class="`${prefixCls}attr-event`">
                <div
                  :class="`${prefixCls}event-content`"
                  v-show="
                    gplotStore.gplotKeyOb[props.graphObRef.gplotKey].selectedOb.data.event.length >
                    0
                  "
                >
                  <a-collapse v-model:activeKey="attrEventActiveKey">
                    <a-collapse-panel
                      v-for="item in gplotStore.gplotKeyOb[props.graphObRef.gplotKey].selectedOb
                        .data.event"
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
                            <a-select v-model:value="item.event" style="width: 120px">
                              <a-select-option value="click">单击</a-select-option>
                              <a-select-option
                                :disabled="
                                  gplotStore.gplotKeyOb[
                                    props.graphObRef.gplotKey
                                  ].selectedOb.data.event.find((m) => m.event == 'rightClick') !=
                                  undefined
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
                                  :title="t('view.edit')"
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
                                  :title="t('view.delete')"
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
                  v-show="
                    gplotStore.gplotKeyOb[props.graphObRef.gplotKey].selectedOb.data.event.length ==
                    0
                  "
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
          </template> -->
        </a-tabs>
      </div>
    </template>
    <template
      v-else-if="
        props.graphObRef && gplotStore.gplotKeyOb[props.graphObRef.gplotKey].selectedOb == null
      "
    >
      <div :class="`${prefixCls}prop-container`">
        <a-tabs
          v-model:activeKey="containerTabsActiveKey"
          :tabBarStyle="{ height: '32px', marginBottom: '0.5px', background: '#fff' }"
        >
          <a-tab-pane key="containerConfig" :tab="t('view.containerConfiguration')">
            <a-form
              :label-col="{ span: locale == 'fr-FR' ? 14 : locale == 'zh-CN' ? 10 : 12 }"
              :wrapper-col="{ span: locale == 'fr-FR' ? 12 : locale == 'zh-CN' ? 14 : 12 }"
              autocomplete="off"
              :model="gplotStore.gplotKeyOb[props.graphObRef.gplotKey].containerConfig"
            >
              <!-- <a-divider orientation="center">编辑配置</a-divider> -->
              <a-form-item name="gridShow" :label="t('view.gridDisplay')">
                <a-switch
                  v-model:checked="
                    gplotStore.gplotKeyOb[props.graphObRef.gplotKey].containerConfig.grid.myIsShow
                  "
                />
              </a-form-item>
              <a-form-item name="background" :label="t('view.backgroundColor')">
                <div>
                  <selectColor
                    :color="
                      gplotStore.gplotKeyOb[props.graphObRef.gplotKey].containerConfig.background
                        .myBackground
                    "
                    @change="
                      (value) => {
                        gplotStore.gplotKeyOb[
                          props.graphObRef.gplotKey
                        ].containerConfig.background.myBackground = value;
                      }
                    "
                  />
                </div>
              </a-form-item>
              <a-form-item name="backgroundImg" :label="t('view.backgroundImage')">
                <div class="upbackimg">
                  <a-upload
                    v-model:fileList="fileList"
                    :maxCount="1"
                    :multiple="false"
                    accept=".png,.jpg,.jpeg,.svg"
                    :before-upload="(file) => beforeUpload(file, 'backgroundImage')"
                  >
                    <div
                      v-if="
                        !gplotStore.gplotKeyOb[props.graphObRef.gplotKey].containerConfig.background
                          .backgroundImage
                      "
                    >
                      <IconFontClass style="font-size: 16px" name="icon-baseui-tupian2" />
                    </div>
                    <div
                      v-else
                      :style="{
                        width: '25px',
                        height: '25px',
                        backgroundRepeat: 'no-repeat',
                        backgroundSize: '100% 100%',
                        backgroundImage:
                          gplotStore.gplotKeyOb[props.graphObRef.gplotKey].containerConfig
                            .background.backgroundImage,
                      }"
                    >
                    </div>
                  </a-upload>
                  <IconFontClass
                    @click="deleteBackgroundImg('backgroundImage')"
                    v-show="
                      gplotStore.gplotKeyOb[props.graphObRef.gplotKey].containerConfig.background
                        .backgroundImage
                    "
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
              </a-form-item>
              <a-form-item name="zoom" :label="t('view.zoomSize')" :autoLink="false">
                <a-row>
                  <a-slider
                    class="aSlider"
                    v-model:value="
                      gplotStore.gplotKeyOb[props.graphObRef.gplotKey].containerConfig.zoom
                    "
                    :min="0"
                    :max="10"
                    :step="0.01"
                    :included="false"
                    :tipFormatter="null"
                    @change="
                      props.graphObRef.zoomChange(
                        gplotStore.gplotKeyOb[props.graphObRef.gplotKey].containerConfig.zoom,
                      )
                    "
                  />
                  <a-input-number
                    style="width: 82px !important"
                    v-model:value="
                      gplotStore.gplotKeyOb[props.graphObRef.gplotKey].containerConfig.zoom
                    "
                    :min="0"
                    :max="10"
                    :precision="3"
                    :step="0.01"
                    @change="
                      props.graphObRef.zoomChange(
                        gplotStore.gplotKeyOb[props.graphObRef.gplotKey].containerConfig.zoom,
                      )
                    "
                  />
                </a-row>
                <a-row style="margin: 2px 0">
                  <a-space size="1">
                    <a-tooltip>
                      <template #title>{{
                        t('view.translateTheGraphToTheCenterOfTheViewport')
                      }}</template>
                      <a-tag
                        @click="
                          () => {
                            if (props.graphObRef) {
                              props.graphObRef.fitCenter();
                            }
                          }
                        "
                        >fitCenter</a-tag
                      >
                    </a-tooltip>
                    <a-tooltip>
                      <template #title>{{
                        t('view.scaleGraphToFitAndTranslateToViewportCenter')
                      }}</template>
                      <a-tag
                        @click="
                          () => {
                            if (props.graphObRef) {
                              props.graphObRef.fitView();
                            }
                          }
                        "
                        >fitView</a-tag
                      >
                    </a-tooltip>
                  </a-space>
                </a-row>
              </a-form-item>
              <a-divider orientation="center">{{ t('view.displayConfiguration') }}</a-divider>
              <a-form-item name="runType" :label="t('view.canvas')">
                <a-checkbox-group
                  v-model:value="
                    gplotStore.gplotKeyOb[props.graphObRef.gplotKey].containerConfig.runType
                  "
                >
                  <a-checkbox value="zommCanvas">{{ t('view.lockCanvasZoom') }}</a-checkbox>
                  <a-checkbox value="dragCanvas">{{ t('view.lockCanvasPan') }}</a-checkbox>
                </a-checkbox-group>
              </a-form-item>
              <a-form-item name="fit" :label="t('view.imagePanCenter')">
                <a-radio-group
                  v-model:value="
                    gplotStore.gplotKeyOb[props.graphObRef.gplotKey].containerConfig.fit
                  "
                >
                  <a-radio value="fitCenter">{{ t('view.panToViewportCenter') }}</a-radio>
                  <a-radio value="fitView">{{ t('view.zoomAndPanToViewportCenter') }}</a-radio>
                </a-radio-group>
              </a-form-item>
              <!-- <a-divider orientation="center">数据源配置</a-divider> 
            <a-table
                :columns="allDataConfigColumns"
                :data-source="
                  gplotStore.gplotKeyOb[props.graphObRef.gplotKey].containerConfig.allDataConfig
                "
                bordered
                size="small"
                style="min-height: 400px; overflow: auto"
                :pagination="false"
              >
                <template #bodyCell="{ column, text, record }">
                  <template v-if="column.dataIndex == 'operation'">
                    <div style="width: 64px">
                      <a-space>
                        <a @click="showAllDataConfig(record)">配置</a>
                        <a-popconfirm title="是否删除?" @confirm="delteAllDataConfig(record.key)">
                          <a style="color: red">删除</a>
                        </a-popconfirm></a-space
                      >
                    </div>
                  </template>
                  <template v-else>
                    <div style="width: 88px">{{ text }}</div></template
                  >
                </template>
                <template #footer>
                  <div>
                    <IconFontClass
                      name="icon-baseui-tianjiawukuang"
                      style="color: #0960bd; font-size: 12px; cursor: pointer; user-select: none"
                      @click="showAllDataConfig()"
                      >添加</IconFontClass
                    >
                    <a-popconfirm title="是否清空?" @confirm="clearAllDataConfigs()">
                      <IconFontClass
                        name="icon-baseui-delete"
                        style="
                          margin-left: 10px;
                          color: red;
                          font-size: 12px;
                          cursor: pointer;
                          user-select: none;
                        "
                        >清空</IconFontClass
                      >
                    </a-popconfirm>
                  </div>
                </template>
              </a-table> -->
            </a-form>
          </a-tab-pane>
        </a-tabs>
      </div>
    </template>
    <template v-else-if="props.graphObRef">
      <div style="text-align: center">
        <IconFontClass
          name="icon-baseui-zanwuneirong"
          :isSvg="true"
          style="margin: 0 auto; font-size: 176px"
        />
        <div style="font-size: 16px"> {{ t('view.multipleItemsAreNotSupportedToBeChanged') }}</div>
      </div>
    </template>
  </div>
  <a-drawer
    v-if="false"
    :bodyStyle="{ overflowY: 'hidden', overflowX: 'hidden' }"
    :headerStyle="{ height: '49px', borderBottom: '2px solid #eee' }"
    :width="320"
    :visible="isShowRightMneu"
    :title="t('view.rightClickMenu')"
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
      <a-button type="primary" @click="saveRightMenu">{{ t('view.save') }}</a-button>
      <a-button style="margin-left: 8px" @click="closeRightMenu">{{ t('view.close') }}</a-button>
    </template>
  </a-drawer>
  <!-- 
  <a-drawer
    :bodyStyle="{ overflow: 'hidden' }"
    :headerStyle="{ height: '49px', borderBottom: '2px solid #eee' }"
    :width="500"
    :visible="isShowSourceDataConfig"
    title="数据配置"
    :footer-style="{ textAlign: 'right' }"
    @close="closeAllDataConfig"
  >
    <a-form
      ref="newAllDataConfigRef"
      :model="newAllDataConfig"
      :label-col="{ span: 4 }"
      :style="{ paddingRight: '2px' }"
      autocomplete="off"
    >
      <a-form-item
        name="key"
        :rules="[{ required: true, message: '请输入全数据配置唯一主键' }]"
        :label="主键"
      >
        <a-input
          :disabled="!isSaveAllDataConfigAdd"
          placeholder="请输入全数据配置唯一主键"
          v-model:value="newAllDataConfig.key"
        />
      </a-form-item>
      <a-form-item name="name" :label="名称">
        <a-input placeholder="请输入名称" v-model:value="newAllDataConfig.name" />
      </a-form-item>
     <a-form-item
        name="topic"
        :rules="[{ required: true, message: '请选择通信主题' }]"
        :label="通信主题"
      >
        <a-select placeholder="请选择通信主题" v-model:value="newAllDataConfig.topic">
          <a-select-option value="Data/Monitor/WebMsg/+">服务报警</a-select-option>
        </a-select>
      </a-form-item> 
      <a-form-item
        :labelCol="{ span: 24 }"
        name="getValue"
        :rules="[{ required: true, message: t('view.pleaseEnterDataProcessing') }]"
        :label="t('view.pleaseEnterDataProcessing')"
      >
        <codemirror
          :modelValue="newAllDataConfig.getValue"
          :style="{ height: '300px', overflow: 'auto' }"
          lang="javascript"
          @change="
            (value) => {
              newAllDataConfig.getValue = value;
            }
          "
        />
      </a-form-item>
    </a-form>
    <template #footer>
      <a-button type="primary" @click="saveAllDataConfig">{{ t('view.save') }}</a-button>
      <a-button style="margin-left: 8px" @click="closeAllDataConfig">{{
        t('view.close')
      }}</a-button>
    </template>
  </a-drawer>
  <a-drawer
    :bodyStyle="{ overflow: 'hidden' }"
    :headerStyle="{ height: '49px', borderBottom: '2px solid #eee' }"
    :width="500"
    :visible="isShowSelectedObState"
    title="灵活状态配置"
    :footer-style="{ textAlign: 'right' }"
    @close="closeSelectedObState"
  >
    <a-form
      ref="newSelectedObStateRef"
      :model="newSelectedObState"
      :label-col="{ span: 4 }"
      :style="{ paddingRight: '2px' }"
      autocomplete="off"
    >
      <a-form-item
        name="name"
        :label="状态名称"
        :rules="[{ required: true, message: '请输入状态名称' }]"
      >
        <a-input placeholder="请输入状态名称" v-model:value="newSelectedObState.name" />
      </a-form-item>
      <a-form-item
        name="level"
        :label="优先级"
        :rules="[{ required: true, message: '请输入优先级' }]"
      >
        <a-input-number
          min="0"
          :max="99999"
          :precision="0"
          placeholder="请输入优先级"
          v-model:value="newSelectedObState.level"
        />
      </a-form-item>
      <a-form-item name="color" :label="变化颜色">
        <div>
          <selectColor
            :color="newSelectedObState.color"
            @change="
              (value) => {
                newSelectedObState.color = value;
              }
            "
          />
        </div>
      </a-form-item>
      <a-form-item
        :labelCol="{ span: 24 }"
        name="isChange"
        :rules="[{ required: true, message: t('view.pleaseEnterDataProcessing') }]"
        :label="t('view.pleaseEnterDataProcessing')"
      >
        <codemirror
          :modelValue="newSelectedObState.isChange"
          :style="{ height: '300px', overflow: 'auto' }"
          lang="javascript"
          @change="
            (value) => {
              newSelectedObState.isChange = value;
            }
          "
        />
      </a-form-item>
    </a-form>
    <template #footer>
      <a-button type="primary" @click="saveSelectedObState">{{ t('view.save') }}</a-button>
      <a-button style="margin-left: 8px" @click="closeSelectedObState">{{
        t('view.close')
      }}</a-button>
    </template>
  </a-drawer> -->
</template>
<script setup>
  import AntVueCommon from '@/utils/MyCommon/AntVueCommon';
  import myTree from '/@/components/MyTree/index.vue';
  import action from './action.vue';
  import selectColor from '/@/components/MySelectColor/index.vue';
  import { message } from 'ant-design-vue';
  import { ref, watch, unref } from 'vue';
  import { useDesign } from '/@/hooks/web/useDesign';
  import codemirror from '/@/components/MyCodemirror/codemirror.vue';
  import { useGplotStoreWithOut } from '@/store/modules/gplot';
  import softwareApi from '@/api/software';
  import _ from 'lodash-es';
  import { useI18n } from '@/hooks/web/useI18n';
  import { useLocaleStore } from '@/store/modules/locale';

  const { t } = useI18n();
  const localeStore = useLocaleStore();
  const locale = localeStore.getLocale;
  const { prefixCls } = useDesign('GplotManage-');
  const props = defineProps({
    //拓扑对象
    graphObRef: {
      type: Object,
      default() {
        return null;
      },
    },
    //选中的组件
    selectedOb: {
      type: Object,
      default() {
        return {};
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
  const containerTabsActiveKey = ref('containerConfig');
  const fileList = ref([]);
  const nodeTabsActiveKey = ref('attr');

  const allDataConfigColumns = [
    {
      title: t('view.attributeKey'),
      dataIndex: 'key',
    },
    {
      title: t('view.name'),
      dataIndex: 'name',
    },
    {
      field: 'action_',
      title: t('view.action'),
      dataIndex: 'operation',
    },
  ];
  const isShowSourceDataConfig = ref(false);
  const newAllDataConfig = ref({});
  const newAllDataConfigRef = ref({});
  const isSaveAllDataConfigAdd = ref(true);

  const selectedObStateColumns = [
    {
      title: t('view.name'),
      dataIndex: 'name',
    },
    {
      title: t('view.color'),
      dataIndex: 'color',
    },
    {
      field: 'action_',
      title: t('view.action'),
      dataIndex: 'operation',
    },
  ];
  const selectedObAgileStateColumns = [
    {
      title: t('view.status'),
      dataIndex: 'name',
    },
    {
      title: t('view.priority'),
      dataIndex: 'level',
    },
    {
      title: t('view.color'),
      dataIndex: 'color',
    },
    {
      title: t('view.open'),
      dataIndex: 'open',
    },
  ];
  const isShowSelectedObState = ref(false);
  const newSelectedObState = ref({});
  const newSelectedObStateRef = ref({});
  const isSaveSelectedObStateAdd = ref(true);
  const serviceTreeData = ref([]);

  getServiceTreeData();
  //容器颜色的改变
  function containerColorChange(attr, color) {
    gplotStore.gplotKeyOb[props.graphObRef.gplotKey].containerConfig.background[attr] = color;
  }
  //属性颜色的改变
  function colorChange(attr, color) {
    gplotStore.gplotKeyOb[props.graphObRef.gplotKey].selectedOb.style[attr] = color;
  }
  //容器背景图片上传
  function beforeUpload(file, attr) {
    return new Promise((resolve, reject) => {
      const isLt5M = file.size / 1024 / 1024 < 3;
      if (
        file.name.indexOf('.') == -1 ||
        !['png', 'jpg', 'jpeg', 'svg'].includes(
          file.name.split('.')[file.name.split('.').length - 1],
        )
      ) {
        file['remove'] = true;
        message.warning(t('view.selectedFileTypeMismatch'));
      } else if (!isLt5M) {
        message.error(t('view.fileSizeMustNotExceed', ['3MB']));
      } else {
        myCommon
          .imgBase64(file)
          .then((data) => {
            gplotStore.gplotKeyOb[props.graphObRef.gplotKey].containerConfig.background[attr] =
              `url(${data})`;
          })
          .catch((error) => {
            console.error(error);
            message.error(t('view.imageConversionFailed'));
          });
      }
      //解决这个组件上传的个数超过限制时会报：warning.js:6 Warning: [antdv: Checkbox] `value` is not validate prop, do you mean `checked`?
      fileList.value = [];
      reject();
    });
  }
  //删除容器背景图片
  function deleteBackgroundImg(attr) {
    gplotStore.gplotKeyOb[props.graphObRef.gplotKey].containerConfig.background[attr] = '';
  }

  //保存全局数据配置
  function saveAllDataConfig() {
    newAllDataConfigRef.value.validate().then(() => {
      if (isSaveAllDataConfigAdd.value) {
        if (
          gplotStore.gplotKeyOb[props.graphObRef.gplotKey].containerConfig.allDataConfig.find(
            (m) => m.key == newAllDataConfig.value.key,
          )
        ) {
          message.warning(t('view.primaryKeyDuplicatedCannotAdd'));
          return;
        }
      }
      try {
        const executeFunc = new Function('dataOb', newAllDataConfig.value.getValue);
        executeFunc('');
        if (isSaveAllDataConfigAdd.value) {
          gplotStore.gplotKeyOb[props.graphObRef.gplotKey].containerConfig.allDataConfig.push(
            newAllDataConfig.value,
          );
          message.success(t('view.additionSuccessful'));
        } else {
          const oldData = gplotStore.gplotKeyOb[
            props.graphObRef.gplotKey
          ].containerConfig.allDataConfig.find((m) => m.key == newAllDataConfig.value.key);
          myCommon.objectReplace(oldData, newAllDataConfig.value);
          message.success(t('view.updateSuccessful'));
        }
        isShowSourceDataConfig.value = false;
      } catch (error) {
        message.error('javaScript编码错误，请检查');
      }
    });
  }
  //清除所有数据配置
  function clearAllDataConfigs() {
    gplotStore.gplotKeyOb[props.graphObRef.gplotKey].containerConfig.allDataConfig = [];
  }
  //根据key删除数据配置
  function delteAllDataConfig(key) {
    if (myCommon.isnull(key)) {
      message.warning('主键缺失，不可删除');
    } else {
      gplotStore.gplotKeyOb[props.graphObRef.gplotKey].containerConfig.allDataConfig =
        gplotStore.gplotKeyOb[props.graphObRef.gplotKey].containerConfig.allDataConfig.filter(
          (m) => m.key != key,
        );
    }
  }
  //显示数据配置
  function showAllDataConfig(data) {
    newAllDataConfig.value = data
      ? _.cloneDeep(data)
      : {
          //数据来源类型
          type: 'mqtt',
          //主题
          topic: 'Data/Monitor/WebMsg/+',
          //值获取，
          getValue:
            '//默认参数dataOb为收到的数据对象\n//必须有返回值，返回值类型为undefined时表示该返回值无效\nif(dataOb)\n{\n//编辑您的计算逻辑并return值\n\nreturn dataOb;\n\n}\nelse{\n return undefined \n}\n',
          //值键值
          key: myCommon.uniqueId(),
          //值描述名称
          name: '',
        };
    isSaveAllDataConfigAdd.value = data ? false : true;
    isShowSourceDataConfig.value = true;
  }
  //关闭数据配置
  function closeAllDataConfig() {
    newAllDataConfigRef.value.clearValidate();
    isShowSourceDataConfig.value = false;
  }

  //保存选中节点的状态配置
  function saveSelectedObState() {
    newSelectedObStateRef.value.validate().then(() => {
      if (
        (isSaveSelectedObStateAdd.value &&
          gplotStore.gplotKeyOb[props.graphObRef.gplotKey].selectedOb.data.myAgileState.find(
            (m) => m.name == newSelectedObState.value.name,
          )) ||
        gplotStore.gplotKeyOb[props.graphObRef.gplotKey].selectedOb.data.myAgileState.find(
          (m) => m.name == newSelectedObState.value.name && m.key != newSelectedObState.value.key,
        )
      ) {
        message.warning('名称重复，不可添加');
        return;
      }
      try {
        const executeFunc = new Function('allDataValue', newSelectedObState.value.isChange);
        const runValue = executeFunc('');
        if (typeof runValue === 'boolean') {
          if (isSaveSelectedObStateAdd.value) {
            gplotStore.gplotKeyOb[props.graphObRef.gplotKey].selectedOb.data.myAgileState.push(
              newSelectedObState.value,
            );
            message.success(t('view.additionSuccessful'));
          } else {
            const oldData = gplotStore.gplotKeyOb[
              props.graphObRef.gplotKey
            ].selectedOb.data.myAgileState.find((m) => m.key == newSelectedObState.value.key);
            myCommon.objectReplace(oldData, newSelectedObState.value);
            message.success('view.updateSuccessful');
          }
          isShowSelectedObState.value = false;
        } else {
          message.error('返回值错误，请检查');
        }
      } catch (error) {
        message.error('数据处理错误，请检查');
      }
    });
  }
  //清除选中节点的所有状态配置
  function clearSelectedObStates() {
    gplotStore.gplotKeyOb[props.graphObRef.gplotKey].selectedOb.data.myAgileState = [];
  }
  //根据key删除选中节点的状态配置
  function delteSelectedObState(key) {
    if (myCommon.isnull(key)) {
      message.warning('主键缺失，不可删除');
    } else {
      gplotStore.gplotKeyOb[props.graphObRef.gplotKey].selectedOb.data.myAgileState =
        gplotStore.gplotKeyOb[props.graphObRef.gplotKey].selectedOb.data.myAgileState.filter(
          (m) => m.key != key,
        );
    }
  }
  //显示选中节点的状态配置
  function showSelectedObState(data) {
    (newSelectedObState.value = data
      ? _.cloneDeep(data)
      : {
          key: myCommon.uniqueId(),
          //allDataValue为containerConfig下的allDataValue，可以根据allDataConfig的key获取所有绑定的的值，返回bool值
          isChange:
            '//默认参数allDataValue为该画布下所有数据源对象\n//您可以根据自己在数据配置中设置的主键，从allDataValue对象中获取数据\n//必须有返回值，返回值类型为bool\nif(allDataValue)\n{\n//编辑您的计算逻辑并return值;\n\nreturn true;\n}\nelse{\n return false \n}\n',
          //isChange为true时更改的颜色
          color: 'red',
          //myAgileState中的优先计算的等级
          level: 1,
          //状态名称
          name: '',
        }),
      (isSaveSelectedObStateAdd.value = data ? false : true);
    isShowSelectedObState.value = true;
  }
  //关闭选中节点的状态配置
  function closeSelectedObState() {
    newSelectedObStateRef.value.clearValidate();
    isShowSelectedObState.value = false;
  }

  //获取软件服务树上传性能数据的
  function getServiceTreeData() {
    softwareApi.GetServiceSimpleUppDatas().then((data) => {
      serviceTreeData.value = data;
    });
  }

  //简单绑定数据表格，中英法名称列转换
  function selectedObAgileStateDatasource(data) {
    data.forEach((item) => {
      switch (item.code) {
        case 'isOnline':
          item.name = t('view.interrupt');
          break;
        case 'isAlarm':
        case 'isNormal':
          item.name = t('view.alarm');
          break;
        case 'isPerformanceNormal':
          item.name = t('view.performanceExceeded');
          break;
      }
    });
    return data;
  }

  function labelTextChange(l) {
    if (locale == 'zh-CN' && l == 'cn') {
      gplotStore.gplotKeyOb[props.graphObRef.gplotKey].selectedOb.style.labelText =
        gplotStore.gplotKeyOb[props.graphObRef.gplotKey].selectedOb.style.labelTextCn;
    } else if (locale == 'en-US' && l == 'en') {
      gplotStore.gplotKeyOb[props.graphObRef.gplotKey].selectedOb.style.labelText =
        gplotStore.gplotKeyOb[props.graphObRef.gplotKey].selectedOb.style.labelTextEn;
    } else if (locale == 'fr-FR' && l == 'fr') {
      gplotStore.gplotKeyOb[props.graphObRef.gplotKey].selectedOb.style.labelText =
        gplotStore.gplotKeyOb[props.graphObRef.gplotKey].selectedOb.style.labelTextFr;
    }
  }
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

    :deep(.ant-radio-group) {
      display: flex;
      flex-direction: column;
      white-space: nowrap;
    }

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

      :deep(.ant-collapse) {
        border-radius: 0;
      }

      :deep(.ant-collapse > .ant-collapse-item:last-child) {
        border-radius: 0;
      }

      .backgroundColor {
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

      :deep(.ant-divider-horizontal.ant-divider-with-text) {
        margin: 5px 0;
        color: #0960bd;
        font-size: 13px;
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
