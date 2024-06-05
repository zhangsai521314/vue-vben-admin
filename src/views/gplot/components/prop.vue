<template>
  <div :class="`${prefixCls}prop`">
    <template v-if="props.selectedOb.attribute.obtype == 'container'">
      <div :class="`${prefixCls}prop-container`">
        <div> 全部配置 </div>
        <div>
          <a-collapse
            v-model:activeKey="propContainerActiveKey"
            :class="`${prefixCls}prop-container-content`"
          >
            <a-collapse-panel key="container" header="画布">
              <div :class="`${prefixCls}prop-config`">
                <!-- <div>
                                    <div>
                                        <a-tooltip>
                                            <template #title>画布根据内容自动扩展</template>
                                            无限画布
                                            <IconFontClass
                                                style="font-size: 13px"
                                                name="icon-iNeuOS-tishi" />
                                        </a-tooltip>
                                    </div>
                                    <div>
                                        <a-switch v-model:checked="props.containerConfig.infinite" size="small" @change="infiniteChange" />
                                    </div>
                                </div> -->
                <div>
                  <div> 网格显示 </div>
                  <div>
                    <a-switch
                      :disabled="props.containerConfig.infinite"
                      v-model:checked="props.containerConfig.gridShow"
                      size="small"
                      @change="gridShowChange"
                    />
                  </div>
                </div>
                <div>
                  <div> 画布大小 </div>
                  <div>
                    <a-select
                      :disabled="props.containerConfig.infinite"
                      v-model:value="props.containerConfig.size"
                      @change="(value) => changeCanvasSize(value)"
                      style="width: 130px"
                      size="small"
                    >
                      <a-select-option value="custom">自定义</a-select-option>
                      <a-select-opt-group>
                        <template #label>
                          <span>
                            <user-outlined />
                            屏幕
                          </span>
                        </template>
                        <a-select-option value="1024x768">1024x768px</a-select-option>
                        <a-select-option value="1366x768">1366x768px</a-select-option>
                        <a-select-option value="1280x800">1280x800px</a-select-option>
                        <a-select-option value="1440x900">1440x900px</a-select-option>
                        <a-select-option value="1600x900">1600x900px</a-select-option>
                        <a-select-option value="1920x1080">1920x1080px</a-select-option>
                      </a-select-opt-group>
                      <a-select-opt-group label="纸张">
                        <a-select-option value="a3">A3(1870x2646)</a-select-option>
                        <a-select-option value="a4">A4(1323x1870)</a-select-option>
                        <a-select-option value="a5">A5(933x1323)</a-select-option>
                      </a-select-opt-group>
                    </a-select>
                  </div>
                </div>
                <template v-if="containerConfigSize == 'custom'">
                  <div>
                    <div> 宽度 </div>
                    <div>
                      <a-input-number
                        :disabled="props.containerConfig.infinite"
                        style="width: 130px"
                        v-model:value="props.containerConfig.sizeWidth"
                        @change="
                          (value) =>
                            selectedObSetConfig(
                              'canvas|sizeWidth',
                              value + 'x' + props.containerConfig.sizeHeight,
                            )
                        "
                        min="100"
                        addon-after="px"
                        size="small"
                      />
                    </div>
                  </div>
                  <div>
                    <div> 高度 </div>
                    <div>
                      <a-input-number
                        :disabled="props.containerConfig.infinite"
                        style="width: 130px"
                        v-model:value="props.containerConfig.sizeHeight"
                        @change="
                          (value) =>
                            selectedObSetConfig(
                              'canvas|sizeHeight',
                              props.containerConfig.sizeWidth + 'x' + value,
                            )
                        "
                        min="100"
                        addon-after="px"
                        size="small"
                      />
                    </div>
                  </div>
                </template>
                <div>
                  <div> 背景颜色 </div>
                  <div class="upbackcolor">
                    <selectColor
                      :color="props.containerConfig.backgroundColor"
                      @change="(value) => colorChange('canvas|backgroundColor', value)"
                    />
                    <IconFontClass
                      @click="deleteBackgroundColor('canvas|backgroundColor')"
                      v-show="props.containerConfig.backgroundColor"
                      style="
                        position: absolute;
                        top: -2px;
                        right: 0;
                        font-size: 12px;
                        cursor: pointer;
                      "
                      name="icon-iNeuOS-delete"
                    />
                  </div>
                </div>
                <div :class="{ 'not-click ': props.containerConfig.infinite }">
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
                        <div v-if="!props.containerConfig.backgroundImg">
                          <IconFontClass style="font-size: 16px" name="icon-iNeuOS-tupian2" />
                        </div>
                        <div v-else>
                          <img
                            style="
                              width: 25px;
                              height: 25px;
                              background-repeat: no-repeat;
                              background-size: 100% 100%;
                            "
                            :src="props.containerConfig.backgroundImg"
                          />
                        </div>
                      </a-upload>
                      <IconFontClass
                        @click="deleteBackgroundImg('canvas|backgroundImg')"
                        v-show="props.containerConfig.backgroundImg"
                        style="
                          position: absolute;
                          top: -2px;
                          right: 0;
                          font-size: 12px;
                          cursor: pointer;
                        "
                        name="icon-iNeuOS-delete"
                      />
                    </div>
                  </div>
                </div>
                <div>
                  <div> 缩放 </div>
                  <div style=" display: flex;width: 200px; height: 25px">
                    <div style="width: 100%">
                      <a-slider
                        @change="zoomChange"
                        v-model:value="props.containerConfig.zoom"
                        :min="10"
                        max="500"
                        :marks="marks"
                        :included="false"
                        :tipFormatter="null"
                      />
                    </div>
                    <span style="line-height: 28px">{{ props.containerConfig.zoom }}%</span>
                  </div>
                </div>
                <!-- <div>
                                    <a-space size="1">
                                        <a-tag @click=zoomChange(-1) style="padding: 0px 1px;margin:0 1 0 0;">缩放到内容</a-tag>
                                        <a-tag @click=zoomChange(-2) style="padding: 0px 1px;margin: 1;">缩放到宽度</a-tag>
                                        <a-tag @click=zoomChange(-3) style="padding: 0px 1px;margin: 1;">缩放到画布</a-tag>
                                        <a-tag @click=zoomChange(-4) style="padding: 0px 1px;margin: 0 0 0 1;">重置缩放</a-tag>
                                    </a-space>
                                </div> -->
              </div>
            </a-collapse-panel>
            <a-collapse-panel key="request" header="接口">
              <div :class="`${prefixCls}prop-config`">
                <div>
                  <div> 刷新频率 </div>
                  <div>
                    <a-input-number
                      style="width: 130px"
                      v-model:value="props.containerConfig.requstRefresh"
                      min="100"
                      addon-after="毫秒"
                      size="small"
                    />
                  </div>
                </div>
                <div>
                  <div style="color: #d1d1d1">
                    <a-tooltip>
                      <template #title>自定义组态数据接口的信息</template>
                      数据接口
                      <IconFontClass style="font-size: 13px" name="icon-iNeuOS-tishi" />
                    </a-tooltip>
                  </div>
                </div>
                <div>
                  <div style="margin-left: 10px"> 接口状态 </div>
                  <div>
                    <a-switch v-model:checked="props.containerConfig.requestUse" size="small" />
                  </div>
                </div>
                <div>
                  <div style="margin-left: 10px">
                    <a-tooltip>
                      <template #title>点击查看接口规范</template>
                      当前值
                      <IconFontClass style="font-size: 13px" name="icon-iNeuOS-tishi" />
                    </a-tooltip>
                  </div>
                  <div>
                    <a-input
                      style="width: 160px"
                      size="small"
                      v-model:value="props.containerConfig.requstNewValue"
                    />
                  </div>
                </div>
                <div>
                  <div style="margin-left: 10px">
                    <a-tooltip>
                      <template #title>点击查看接口规范</template>
                      历史值
                      <IconFontClass style="font-size: 13px" name="icon-iNeuOS-tishi" />
                    </a-tooltip>
                  </div>
                  <div>
                    <a-input
                      style="width: 160px"
                      size="small"
                      v-model:value="props.containerConfig.requstHistoryValue"
                    />
                  </div>
                </div>
                <div>
                  <div style="margin-left: 10px">
                    <a-tooltip>
                      <template #title>点击查看接口规范</template>
                      数据点
                      <IconFontClass style="font-size: 13px" name="icon-iNeuOS-tishi" />
                    </a-tooltip>
                  </div>
                  <div>
                    <a-input
                      style="width: 160px"
                      size="small"
                      v-model:value="props.containerConfig.requstTags"
                    />
                  </div>
                </div>
              </div>
            </a-collapse-panel>
            <a-collapse-panel key="run" header="展示">
              <div :class="`${prefixCls}prop-config`">
                <div>
                  <a-checkbox-group v-model:value="props.containerConfig.runType">
                    <a-checkbox value="zomm">锁定缩放</a-checkbox>
                    <a-checkbox value="translation">锁定平移</a-checkbox>
                    <!-- <a-checkbox :disabled="props.containerConfig.infinite" style="margin-left: 0px;" value="follow">锁定背景跟随</a-checkbox> -->
                  </a-checkbox-group>
                </div>
              </div>
            </a-collapse-panel>
          </a-collapse>
        </div>
      </div>
    </template>
    <template v-else>
      <div :class="`${prefixCls}prop-attr`">
        <a-tabs
          v-model:activeKey="configTabsActiveKey"
          :tabBarStyle="{ height: '32px', marginBottom: '0.5px', background: '#fff' }"
        >
          <template v-if="props.selectedOb.attribute.obtype != 'frameSelect'">
            <a-tab-pane key="attr" tab="属性">
              <a-collapse
                v-model:activeKey="propAttrActiveKey"
                :class="`${prefixCls}prop-attr-content`"
              >
                <a-collapse-panel key="img" header="描述">
                  <div :class="`${prefixCls}prop-config`">
                    <div>
                      <div> 物体ID </div>
                      <div>
                        <a-input
                          size="small"
                          v-model:value="props.selectedOb.attribute.key"
                          style="width: 160px"
                          placeholder="物体ID"
                          disabled
                        />
                      </div>
                    </div>
                    <div>
                      <div> 名称 </div>
                      <div>
                        <a-input
                          size="small"
                          v-model:value="props.selectedOb.attribute.name"
                          style="width: 160px"
                          placeholder="物体名称"
                          @change="($event) => selectedObSetConfig('attribute|name', $event, true)"
                        />
                      </div>
                    </div>
                  </div>
                </a-collapse-panel>
                <a-collapse-panel key="img" header="图形">
                  <div :class="`${prefixCls}prop-config`">
                    <div>
                      <div>
                        <a-input-number
                          style="width: 84px"
                          v-model:value="props.selectedOb.attribute.left"
                          addon-after="x"
                          size="small"
                          @change="(value) => selectedObSetConfig('attribute|left', value)"
                        />
                        -
                        <a-input-number
                          style="width: 84px"
                          v-model:value="props.selectedOb.attribute.top"
                          addon-after="y"
                          size="small"
                          @change="(value) => selectedObSetConfig('attribute|top', value)"
                        />
                        -
                        <a-input-number
                          style="width: 60px"
                          v-model:value="props.selectedOb.attribute.angle"
                          min="0"
                          addon-after="°"
                          size="small"
                          @change="(value) => selectedObSetConfig('attribute|angle', value)"
                        />
                      </div>
                    </div>
                    <div>
                      <div>
                        <a-input-number
                          style="width: calc((100% - 22px) / 2)"
                          v-model:value="props.selectedOb.attribute.width"
                          min="0"
                          addon-after="宽"
                          size="small"
                          @change="(value) => selectedObSetConfig('attribute|width', value)"
                        />
                        <a-tooltip>
                          <template #title>锁定宽高</template>
                          <IconFontClass
                            @click="
                              selectedObSetConfig(
                                'attribute|lockWidthHeight',
                                !props.selectedOb.attribute.lockWidthHeight,
                              )
                            "
                            :class="{ selectedColor: props.selectedOb.attribute.lockWidthHeight }"
                            style=" padding: 0 3px;font-size: 16px"
                            name="icon-iNeuOS-suo2"
                          />
                        </a-tooltip>
                        <a-input-number
                          style="width: calc((100% - 22px) / 2)"
                          v-model:value="props.selectedOb.attribute.height"
                          min="0"
                          addon-after="高"
                          size="small"
                          @change="(value) => selectedObSetConfig('attribute|height', value)"
                        />
                      </div>
                    </div>
                    <div
                      v-show="
                        !['elemnt-video', 'elemnt-iframe', 'elemnt-chart'].includes(
                          props.selectedOb.attribute.obtype,
                        )
                      "
                    >
                      <div>
                        <a-input-number
                          style="width: calc((100% + 50px) / 2)"
                          v-model:value="props.selectedOb.attribute.skewy"
                          min="0"
                          addon-after="skewY"
                          size="small"
                          @change="(value) => selectedObSetConfig('attribute|skewy', value)"
                        />
                      </div>
                    </div>
                    <div>
                      <div :class="`${prefixCls}config-quick`">
                        <a-tooltip>
                          <template #title>隐藏</template>
                          <IconFontClass
                            :class="{ selectedColor: props.selectedOb.attribute.visible == 0 }"
                            @click="hideClick"
                            name="icon-iNeuOS-yincang"
                          />
                        </a-tooltip>
                        <a-tooltip>
                          <template #title>锁定全部配置</template>
                          <IconFontClass
                            @click="
                              selectedObSetConfig(
                                'attribute|lockAll',
                                !props.selectedOb.attribute.lockAll,
                              )
                            "
                            :class="{ selectedColor: props.selectedOb.attribute.lockAll }"
                            name="icon-iNeuOS-suo2"
                          />
                        </a-tooltip>
                        <a-tooltip>
                          <template #title>垂直翻转</template>
                          <IconFontClass
                            @click="selectedObSetConfig('vertical')"
                            name="icon-iNeuOS-vertical"
                          />
                        </a-tooltip>
                        <a-tooltip>
                          <template #title>水平翻转</template>
                          <IconFontClass
                            @click="selectedObSetConfig('horizontal')"
                            name="icon-iNeuOS-horizontal"
                          />
                        </a-tooltip>
                        <a-tooltip>
                          <template #title>置顶层</template>
                          <IconFontClass
                            style="font-size: 14px"
                            @click="levelOption('topLevel')"
                            name="icon-iNeuOS-zhidingceng"
                          />
                        </a-tooltip>
                        <a-tooltip>
                          <template #title>置底层</template>
                          <IconFontClass
                            style="font-size: 14px"
                            @click="levelOption('groundLevel')"
                            name="icon-iNeuOS-zhidiceng"
                          />
                        </a-tooltip>
                        <a-tooltip>
                          <template #title>置上一级</template>
                          <IconFontClass
                            style=" position: absolute; bottom: -5px;font-size: 21px"
                            @click="levelOption('up')"
                            name="icon-iNeuOS-shangyiji"
                          />
                        </a-tooltip>
                        <a-tooltip>
                          <template #title>置下一级</template>
                          <IconFontClass
                            style=" position: absolute; top: -2px; left: 185px;font-size: 21px"
                            @click="levelOption('bottom')"
                            name="icon-iNeuOS-xiayiji"
                          />
                        </a-tooltip>
                      </div>
                    </div>
                  </div>
                </a-collapse-panel>
                <template
                  v-if="
                    !props.selectedOb._objects &&
                    (props.showSign.indexOf('graphical') != -1 ||
                      props.showSign.indexOf('button') != -1 ||
                      props.showSign.indexOf('text') != -1)
                  "
                >
                  <a-collapse-panel key="appearance" header="外观">
                    <div :class="`${prefixCls}prop-config`">
                      <div>
                        <div v-show="props.showSign.indexOf('graphical') != -1">
                          <div>
                            <selectColor
                              :color="props.selectedOb.attribute.lineColor"
                              @change="(value) => selectedObSetConfig('attribute|lineColor', value)"
                            />
                          </div>
                          <div> 线条颜色 </div>
                        </div>
                        <div v-show="props.showSign.indexOf('graphical') != -1">
                          <div>
                            <selectColor
                              :color="props.selectedOb.attribute.fillColor"
                              @change="(value) => selectedObSetConfig('attribute|fillColor', value)"
                            />
                          </div>
                          <div> 填充色 </div>
                        </div>
                        <div>
                          <div>
                            <selectColor
                              :color="props.selectedOb.attribute.background"
                              @change="
                                (value) => selectedObSetConfig('attribute|background', value)
                              "
                            />
                          </div>
                          <div> 背景色 </div>
                        </div>
                        <div v-show="props.showSign.indexOf('graphical') != -1">
                          <div>
                            <a-input-number
                              style="width: 71px"
                              v-model:value="props.selectedOb.attribute.lineWidth"
                              min="0"
                              addon-after="px"
                              size="small"
                              @change="(value) => selectedObSetConfig('attribute|lineWidth', value)"
                            />
                          </div>
                          <div> 线条宽度 </div>
                        </div>
                        <!-- <div>
                                                <div>
                                                    <a-select
                                                        size="small"
                                                        style="width: 80px;"
                                                        v-model:value="props.selectedOb.attribute.borderType"
                                                        :options="borderOptions" />
                                                </div>
                                                <div>
                                                    线条样式
                                                </div>
                                            </div>
                                            <div style="width: 100%;display: flex;flex-direction: row;">
                                                <div>
                                                    <div>
                                                        <a-input-number style="width: 71px;" v-model:value="props.selectedOb.attribute.border_size" min="0" addon-after="px" size="small" />
                                                    </div>
                                                    <div>
                                                        线条宽度
                                                    </div>
                                                </div>
                                                <div style="width: 10px;"></div>
                                                <div>
                                                    <div>
                                                        <a-input-number style="width: 71px;" v-model:value="props.selectedOb.attribute.opacity" min="0" max="100" addon-after="%" size="small" />
                                                    </div>
                                                    <div>
                                                        不透明度
                                                    </div>
                                                </div>
                                            </div> -->
                      </div>
                    </div>
                  </a-collapse-panel>
                </template>
                <template
                  v-if="
                    !props.selectedOb._objects &&
                    props.showSign.indexOf('chart') == -1 &&
                    (props.showSign.indexOf('text') == -1 || props.showSign.indexOf('source') != -1)
                  "
                >
                  <a-collapse-panel key="source" header="数据">
                    <template v-if="props.showSign.indexOf('source') != -1">
                      <div :class="`${prefixCls}prop-config`">
                        <div>
                          <div> 默认值 </div>
                          <div>
                            <a-input
                              style="width: 160px"
                              size="small"
                              v-model:value="props.selectedOb.attribute.defaultValue"
                              @change="
                                ($event) =>
                                  selectedObSetConfig('attribute|defaultValue', $event, true)
                              "
                            />
                          </div>
                        </div>
                        <div>
                          <div> 小数位 </div>
                          <div>
                            <a-input-number
                              style="width: 160px"
                              min="0"
                              max="18"
                              size="small"
                              v-model:value="props.selectedOb.attribute.digit"
                            />
                          </div>
                        </div>
                        <div :style="{ height: `450px`, width: '100%', overflow: 'hidden' }"> </div>
                      </div>
                    </template>
                    <template v-if="props.showSign.indexOf('video') != -1">
                      <div :class="`${prefixCls}prop-config`">
                        <div>
                          <div> 选择视频 </div>
                          <div>
                            <a-select
                              size="small"
                              style="width: 160px"
                              v-model:value="props.selectedOb.attribute.videoId"
                              @change="(value) => selectedObSetConfig('attribute|videoId', value)"
                            >
                              <a-select-option
                                v-for="(item, i) in props.videoData"
                                :key="i"
                                :value="item.id"
                                >{{ item.name }}</a-select-option
                              >
                            </a-select>
                          </div>
                        </div>
                        <div>
                          <div> 视频类型 </div>
                          <div>
                            <a-select
                              :disabled="props.selectedOb.attribute.videoId != 'custom'"
                              size="small"
                              style="width: 160px"
                              v-model:value="props.selectedOb.attribute.type"
                              @change="(value) => selectedObSetConfig('attribute|type', value)"
                            >
                              <a-select-option value="rtmp">rtmp</a-select-option>
                              <a-select-option value="hls">hls</a-select-option>
                              <a-select-option value="websocket">websocket</a-select-option>
                              <a-select-option value="mp4(H.264)">mp4(H.264)</a-select-option>
                              <a-select-option value="webm">webm</a-select-option>
                              <a-select-option value="ogv">ogv </a-select-option>
                              <a-select-option value="m3u8">m3u8</a-select-option>
                            </a-select>
                          </div>
                        </div>
                        <div>
                          <div> 视频地址 </div>
                          <div>
                            <a-input
                              :disabled="
                                props.selectedOb.attribute.videoId != 'custom' ||
                                !props.selectedOb.attribute.type
                              "
                              style="width: 160px"
                              size="small"
                              v-model:value="props.selectedOb.attribute.src"
                              @change="
                                ($event) => selectedObSetConfig('attribute|src', $event, true)
                              "
                            />
                          </div>
                        </div>
                      </div>
                    </template>
                    <template v-if="props.showSign.indexOf('iframe') != -1">
                      <div :class="`${prefixCls}prop-config`">
                        <div>
                          <div> 链接地址 </div>
                          <div>
                            <a-input
                              style="width: 160px"
                              size="small"
                              v-model:value="props.selectedOb.attribute.src"
                              @change="
                                ($event) => selectedObSetConfig('attribute|src', $event, true)
                              "
                            />
                          </div>
                        </div>
                      </div>
                    </template>
                  </a-collapse-panel>
                </template>
                <template v-if="!props.selectedOb._objects && props.showSign.indexOf('text') != -1">
                  <a-collapse-panel key="text" header="文本">
                    <div :class="`${prefixCls}prop-config`">
                      <div
                        v-show="
                          props.showSign.indexOf('newtime') == -1 &&
                          (props.showSign.indexOf('source') == -1 ||
                            props.showSign.indexOf('button') != -1)
                        "
                      >
                        <div> 文字内容 </div>
                        <div>
                          <a-input
                            size="small"
                            v-model:value="props.selectedOb.text"
                            style="width: 160px"
                            placeholder="文字内容"
                            @change="($event) => selectedObSetConfig('text', $event, true)"
                          />
                        </div>
                      </div>
                      <div>
                        <div> 字体颜色 </div>
                        <div style="width: calc(100% - 101px)">
                          <selectColor
                            :color="props.selectedOb.attribute.fontColor"
                            @change="(value) => selectedObSetConfig('attribute|fontColor', value)"
                          />
                        </div>
                      </div>
                      <div>
                        <div>
                          <div>
                            <a-select
                              size="small"
                              style="width: 120px"
                              v-model:value="props.selectedOb.attribute.fontFamily"
                              :options="fontFamilyOptions"
                              @change="(value) => selectedObSetConfig('fontFamily', value)"
                            >
                              <template #option="{ value, label }">
                                <span :class="value"> {{ label }}</span>
                              </template>
                            </a-select>
                          </div>
                          <div> 字体 </div>
                        </div>
                        <div>
                          <div>
                            <a-input-number
                              style="width: 120px"
                              v-model:value="props.selectedOb.attribute.fontSize"
                              min="12"
                              addon-after="pt"
                              size="small"
                              @change="(value) => selectedObSetConfig('fontSize', value)"
                            />
                          </div>
                          <div> 字号 </div>
                        </div>
                        <!-- <div>
                                                    <div>
                                                        <a-select
                                                            size="small"
                                                            style="width: 78px;"
                                                            v-model:value="props.selectedOb.attribute.borderType"
                                                            :options="borderOptions" />
                                                    </div>
                                                    <div>
                                                        线条样式
                                                    </div>
                                                </div> -->
                        <div
                          style="
                            display: flex;
                            flex-direction: row;
                            justify-content: space-between;
                            width: 100%;
                          "
                        >
                          <div>
                            <div>
                              <a-input-number
                                style="width: 120px"
                                v-model:value="props.selectedOb.attribute.lineHeight"
                                min="1"
                                addon-after="px"
                                size="small"
                                @change="
                                  (value) => selectedObSetConfig('attribute|lineHeight', value)
                                "
                              />
                            </div>
                            <div> 行高 </div>
                          </div>
                          <div>
                            <div>
                              <a-input-number
                                style="width: 120px"
                                v-model:value="props.selectedOb.attribute.charSpacing"
                                min="0"
                                addon-after="px"
                                size="small"
                                @change="
                                  (value) => selectedObSetConfig('attribute|charSpacing', value)
                                "
                              />
                            </div>
                            <div> 内边距 </div>
                          </div>
                        </div>
                        <!-- <div style="width: 100%;display: flex;flex-direction: row;justify-content: space-between;">
                                                    <div>
                                                        <div>
                                                            <a-input-number style="width: 120px;" v-model:value="props.selectedOb.attribute.fontLeft" min="0" addon-after="px" size="small" />
                                                        </div>
                                                        <div>
                                                            左缩进
                                                        </div>
                                                    </div>
                                                    <div>
                                                        <div>
                                                            <a-input-number style="width: 120px;" v-model:value="props.selectedOb.attribute.fontRight" min="0" addon-after="px" size="small" />
                                                        </div>
                                                        <div>
                                                            右缩进
                                                        </div>
                                                    </div>
                                                </div> -->
                      </div>
                      <div>
                        <IconFontClass
                          style="font-size: 18px"
                          @click="selectedObSetConfig('attribute|fontWeight')"
                          name="icon-iNeuOS-jiacu"
                        />
                        <IconFontClass
                          style="font-size: 18px"
                          @click="selectedObSetConfig('attribute|fontStyle')"
                          name="icon-iNeuOS-fontitalics"
                        />
                        <IconFontClass
                          style="font-size: 18px"
                          @click="selectedObSetConfig('attribute|underline')"
                          name="icon-iNeuOS-xiahuaxian"
                        />
                        <IconFontClass
                          style="font-size: 18px"
                          @click="selectedObSetConfig('attribute|linethrough')"
                          name="icon-iNeuOS-zhonghuaxian"
                        />
                        <IconFontClass
                          style="font-size: 18px"
                          @click="selectedObSetConfig('textAlign|left')"
                          name="icon-iNeuOS-zuoduiqi"
                        />
                        <IconFontClass
                          style="font-size: 18px"
                          @click="selectedObSetConfig('textAlign|center')"
                          name="icon-iNeuOS-juzhongduiqi"
                        />
                        <IconFontClass
                          style="font-size: 18px"
                          @click="selectedObSetConfig('textAlign|right')"
                          name="icon-iNeuOS-youduiqi"
                        />
                      </div>
                      <div v-show="props.showSign.indexOf('newtime') != -1">
                        <div> 时间格式 </div>
                        <div style="width: calc(100% - 100px)">
                          <a-select
                            size="small"
                            style="width: 100%"
                            v-model:value="props.selectedOb.attribute.newTimeFormat"
                            @change="
                              (value) => selectedObSetConfig('attribute|newTimeFormat', value)
                            "
                          >
                            <a-select-option value="YYYY-MM-DD hh:mm:ss"
                              >年-月-日 时:分:秒</a-select-option
                            >
                            <a-select-option value="hh:mm:ss">时:分:秒</a-select-option>
                          </a-select>
                        </div>
                      </div>
                    </div>
                  </a-collapse-panel>
                </template>
                <template
                  v-if="!props.selectedOb._objects && props.showSign.indexOf('chart') != -1"
                >
                  <a-collapse-panel
                    key="chart"
                    header="图表"
                    style="padding: 0"
                    :class="`${prefixCls}prop-attr-chart`"
                  >
                    <a-collapse
                      v-model:activeKey="chartAttrActiveKey"
                      :class="`${prefixCls}prop-attr-chart-content`"
                    >
                      <template
                        v-if="
                          !['jindu', 'yibiao', 'yewei'].includes(
                            props.selectedOb.attribute.options.chartType.split('_')[0],
                          )
                        "
                      >
                        <a-collapse-panel key="text" header="标题">
                          <div :class="`${prefixCls}prop-config`">
                            <div>
                              <div> 显示 </div>
                              <div>
                                <a-switch
                                  v-model:checked="props.selectedOb.attribute.options.showTitle"
                                />
                              </div>
                            </div>
                            <div>
                              <div> 内容 </div>
                              <div>
                                <a-input
                                  v-model:value="props.selectedOb.attribute.options.title"
                                  size="small"
                                  style="width: 160px"
                                  @change="
                                    ($event) =>
                                      selectedObSetConfig('attribute|options|title', $event, true)
                                  "
                                />
                              </div>
                            </div>
                            <div>
                              <div> 颜色 </div>
                              <div class="upbackcolor">
                                <selectColor
                                  :color="props.selectedOb.attribute.options.titleColor"
                                  @change="
                                    (value) => colorChange('selectObChart_titleColor', value)
                                  "
                                />
                              </div>
                            </div>
                          </div>
                        </a-collapse-panel>
                      </template>
                      <a-collapse-panel key="layout" header="布局">
                        <div :class="`${prefixCls}prop-config`">
                          <div>
                            <div> 颜色 </div>
                            <div class="upbackcolor">
                              <selectColor
                                :color="props.selectedOb.attribute.options.backgroundColor"
                                @change="
                                  (value) => colorChange('selectObChart_backgroundColor', value)
                                "
                              />
                            </div>
                          </div>
                        </div>
                      </a-collapse-panel>
                      <a-collapse-panel key="chart" :header="props.selectedOb.attribute.name">
                        <div :class="`${prefixCls}prop-config`">
                          <template v-if="props.selectedOb.attribute.options.chartType == 'bar_2'">
                            <div>
                              <div> 预警值 </div>
                              <div>
                                <a-input-number
                                  size="small"
                                  style="width: 160px"
                                  v-model:value="props.selectedOb.attribute.options.warningValue"
                                />
                              </div>
                            </div>
                            <div>
                              <div> 预警线颜色 </div>
                              <div>
                                <selectColor
                                  :color="props.selectedOb.attribute.options.warningColor"
                                  @change="
                                    (value) => colorChange('selectObChart_warningColor', value)
                                  "
                                />
                              </div>
                            </div>
                            <div>
                              <div> 报警值 </div>
                              <div>
                                <a-input-number
                                  size="small"
                                  style="width: 160px"
                                  v-model:value="props.selectedOb.attribute.options.alarmValue"
                                />
                              </div>
                            </div>
                            <div>
                              <div> 报警线颜色 </div>
                              <div>
                                <selectColor
                                  :color="props.selectedOb.attribute.options.alarmColor"
                                  @change="
                                    (value) => colorChange('selectObChart_alarmColor', value)
                                  "
                                />
                              </div>
                            </div>
                          </template>
                          <template
                            v-if="
                              ['jindu'].includes(
                                props.selectedOb.attribute.options.chartType.split('_')[0],
                              )
                            "
                          >
                            <div>
                              <div> 渐变色 </div>
                              <div style="height: 25px">
                                <div style="display: inline-block">
                                  <selectColor
                                    :color="props.selectedOb.attribute.options.gradientColorStart"
                                    @change="
                                      (value) =>
                                        colorChange('selectObChart_gradientColorStart', value)
                                    "
                                  />
                                </div>
                                <div style="display: inline-block; margin-left: 10px">
                                  <selectColor
                                    :color="props.selectedOb.attribute.options.gradientColorEnd"
                                    @change="
                                      (value) =>
                                        colorChange('selectObChart_gradientColorEnd', value)
                                    "
                                  />
                                </div>
                              </div>
                            </div>
                          </template>
                          <template
                            v-if="
                              ['jindu', 'yewei'].includes(
                                props.selectedOb.attribute.options.chartType.split('_')[0],
                              )
                            "
                          >
                            <div>
                              <div> 底色 </div>
                              <div>
                                <selectColor
                                  :color="props.selectedOb.attribute.options.dColor"
                                  @change="(value) => colorChange('selectObChart_dColor', value)"
                                />
                              </div>
                            </div>
                          </template>
                          <template
                            v-if="
                              ['jindu'].includes(
                                props.selectedOb.attribute.options.chartType.split('_')[0],
                              )
                            "
                          >
                            <div>
                              <div> 边框色 </div>
                              <div>
                                <selectColor
                                  :color="props.selectedOb.attribute.options.borderColor"
                                  @change="
                                    (value) => colorChange('selectObChart_borderColor', value)
                                  "
                                />
                              </div>
                            </div>
                          </template>
                          <template
                            v-if="
                              ['yewei'].includes(
                                props.selectedOb.attribute.options.chartType.split('_')[0],
                              )
                            "
                          >
                            <div>
                              <div> 顶色 </div>
                              <div>
                                <selectColor
                                  :color="props.selectedOb.attribute.options.tColor"
                                  @change="(value) => colorChange('selectObChart_tColor', value)"
                                />
                              </div>
                            </div>
                          </template>
                          <template
                            v-if="
                              ['yewei_2'].includes(
                                props.selectedOb.attribute.options.chartType.split('_')[0],
                              )
                            "
                          >
                            <div>
                              <div> 圆环色 </div>
                              <div>
                                <selectColor
                                  :color="props.selectedOb.attribute.options.yuanHuanColor"
                                  @change="
                                    (value) => colorChange('selectObChart_yuanHuanColor', value)
                                  "
                                />
                              </div>
                            </div>
                          </template>
                          <template
                            v-if="
                              ['leida'].includes(
                                props.selectedOb.attribute.options.chartType.split('_')[0],
                              )
                            "
                          >
                            <div>
                              <div> 边框色 </div>
                              <div>
                                <selectColor
                                  :color="props.selectedOb.attribute.options.bkcolor"
                                  @change="(value) => colorChange('selectObChart_bkcolor', value)"
                                />
                              </div>
                            </div>
                            <div>
                              <div> 填充色 </div>
                              <div>
                                <selectColor
                                  :color="props.selectedOb.attribute.options.fillColor"
                                  @change="(value) => colorChange('selectObChart_fillColor', value)"
                                />
                              </div>
                            </div>
                          </template>
                          <template
                            v-if="
                              ['jindu', 'yewei'].includes(
                                props.selectedOb.attribute.options.chartType.split('_')[0],
                              )
                            "
                          >
                            <div>
                              <div> 值类型 </div>
                              <div>
                                <a-radio-group
                                  :disabled="
                                    props.selectedOb.attribute.options.chartType == 'jindu_2'
                                  "
                                  v-model:value="props.selectedOb.attribute.options.progressType"
                                  button-style="solid"
                                  size="small"
                                >
                                  <a-radio-button value="number">数值</a-radio-button>
                                  <a-radio-button value="%">百分比</a-radio-button>
                                </a-radio-group>
                              </div>
                            </div>
                          </template>
                          <template
                            v-if="
                              ['jindu', 'yibiao', 'yewei'].includes(
                                props.selectedOb.attribute.options.chartType.split('_')[0],
                              )
                            "
                          >
                            <div
                              v-show="
                                !['jindu', 'yewei'].includes(
                                  props.selectedOb.attribute.options.chartType.split('_')[0],
                                )
                              "
                            >
                              <div> 下限值 </div>
                              <div>
                                <a-input-number
                                  v-model:value="props.selectedOb.attribute.options.rangeMin"
                                  size="small"
                                  style="width: 160px"
                                />
                              </div>
                            </div>
                            <div>
                              <div> 上限值 </div>
                              <div>
                                <a-input-number
                                  v-model:value="props.selectedOb.attribute.options.rangeMax"
                                  size="small"
                                  style="width: 160px"
                                />
                              </div>
                            </div>
                          </template>
                        </div>
                      </a-collapse-panel>
                      <template
                        v-if="
                          !['yibiao'].includes(
                            props.selectedOb.attribute.options.chartType.split('_')[0],
                          )
                        "
                      >
                        <a-collapse-panel key="legend" header="图例">
                          <div :class="`${prefixCls}prop-config`">
                            <div>
                              <div> 显示 </div>
                              <div>
                                <a-switch
                                  v-model:checked="props.selectedOb.attribute.options.showLegend"
                                />
                              </div>
                            </div>
                            <div
                              v-show="
                                ['yewei', 'jindu'].includes(
                                  props.selectedOb.attribute.options.chartType.split('_')[0],
                                )
                              "
                            >
                              <div> 颜色 </div>
                              <div>
                                <selectColor
                                  :color="props.selectedOb.attribute.options.legendColor"
                                  @change="
                                    (value) => colorChange('selectObChart_legendColor', value)
                                  "
                                />
                              </div>
                            </div>
                          </div>
                        </a-collapse-panel>
                      </template>
                      <template
                        v-if="
                          !['jindu', 'pie', 'yibiao', 'yewei'].includes(
                            props.selectedOb.attribute.options.chartType.split('_')[0],
                          )
                        "
                      >
                        <a-collapse-panel key="x" header="x轴">
                          <div :class="`${prefixCls}prop-config`">
                            <div>
                              <div> 分割线 </div>
                              <div>
                                <a-switch
                                  v-model:checked="
                                    props.selectedOb.attribute.options.showXSplitLine
                                  "
                                />
                              </div>
                            </div>
                            <div>
                              <div> 分割线色 </div>
                              <div>
                                <selectColor
                                  :color="props.selectedOb.attribute.options.xSplitLineColor"
                                  @change="
                                    (value) => colorChange('selectObChart_xSplitLineColor', value)
                                  "
                                />
                              </div>
                            </div>
                            <div>
                              <div> 轴线色 </div>
                              <div>
                                <selectColor
                                  :color="props.selectedOb.attribute.options.xAxisLineColor"
                                  @change="
                                    (value) => colorChange('selectObChart_xAxisLineColor', value)
                                  "
                                />
                              </div>
                            </div>
                            <div>
                              <div> 刻度颜色 </div>
                              <div>
                                <selectColor
                                  :color="props.selectedOb.attribute.options.xAxisLabelColor"
                                  @change="
                                    (value) => colorChange('selectObChart_xAxisLabelColor', value)
                                  "
                                />
                              </div>
                            </div>
                          </div>
                        </a-collapse-panel>
                        <a-collapse-panel key="y" header="y轴">
                          <div :class="`${prefixCls}prop-config`">
                            <div>
                              <div> 下限值 </div>
                              <div>
                                <a-input-number
                                  v-model:value="props.selectedOb.attribute.options.rangeMin"
                                  size="small"
                                  style="width: 160px"
                                />
                              </div>
                            </div>
                            <div>
                              <div> 上限值 </div>
                              <div>
                                <a-input-number
                                  v-model:value="props.selectedOb.attribute.options.rangeMax"
                                  size="small"
                                  style="width: 160px"
                                />
                              </div>
                            </div>
                            <div>
                              <div> 分割线 </div>
                              <div>
                                <a-switch
                                  v-model:checked="
                                    props.selectedOb.attribute.options.showYSplitLine
                                  "
                                />
                              </div>
                            </div>
                            <div>
                              <div> 分割线色 </div>
                              <div>
                                <selectColor
                                  :color="props.selectedOb.attribute.options.ySplitLineColor"
                                  @change="
                                    (value) => colorChange('selectObChart_ySplitLineColor', value)
                                  "
                                />
                              </div>
                            </div>
                            <div>
                              <div> 轴线色 </div>
                              <div>
                                <selectColor
                                  :color="props.selectedOb.attribute.options.yAxisLineColor"
                                  @change="
                                    (value) => colorChange('selectObChart_yAxisLineColor', value)
                                  "
                                />
                              </div>
                            </div>
                            <div>
                              <div> 刻度颜色 </div>
                              <div>
                                <selectColor
                                  :color="props.selectedOb.attribute.options.yAxisLabelColor"
                                  @change="
                                    (value) => colorChange('selectObChart_yAxisLabelColor', value)
                                  "
                                />
                              </div>
                            </div>
                          </div>
                        </a-collapse-panel>
                      </template>
                      <a-collapse-panel key="source" header="数据">
                        <div :class="`${prefixCls}prop-config`">
                          <div>
                            <div> 刷新数据 </div>
                            <div>
                              <a-switch
                                v-model:checked="props.selectedOb.attribute.options.isRefresh"
                              />
                            </div>
                          </div>
                          <div>
                            <div> 刷新频率 </div>
                            <div>
                              <a-input-number
                                v-model:value="props.selectedOb.attribute.options.refreshFrequency"
                                min="1"
                                size="small"
                                style="width: 120px"
                              >
                                <template #addonAfter>
                                  <a-select
                                    v-model:value="
                                      props.selectedOb.attribute.options.refreshInterval
                                    "
                                    style="width: 60px"
                                  >
                                    <a-select-option value="s">秒</a-select-option>
                                    <a-select-option value="m">分</a-select-option>
                                  </a-select>
                                </template>
                              </a-input-number>
                            </div>
                          </div>
                          <div v-show="props.selectedOb.attribute.options.urlDataType == 'history'">
                            <div> 时间间隔 </div>
                            <div>
                              <a-input-number
                                v-model:value="props.selectedOb.attribute.options.timeFrequency"
                                min="1"
                                size="small"
                                style="width: 120px"
                              >
                                <template #addonAfter>
                                  <a-select
                                    v-model:value="props.selectedOb.attribute.options.timeInterval"
                                    style="width: 60px"
                                  >
                                    <a-select-option value="m">分</a-select-option>
                                    <a-select-option value="h">时</a-select-option>
                                    <a-select-option value="d">天</a-select-option>
                                  </a-select>
                                </template>
                              </a-input-number>
                            </div>
                          </div>
                          <div :style="{ height: `450px`, width: '100%', overflow: 'hidden' }">
                          </div>
                        </div>
                      </a-collapse-panel>
                      <template v-if="props.selectedOb.attribute.options.urlDataType == 'history'">
                        <a-collapse-panel key="sourceConfig" header="数据配置">
                          <div :class="`${prefixCls}prop-config`">
                            <div
                              v-for="(tag, index) in props.selectedOb.attribute.dataInfo.tags"
                              :key="index"
                              style="flex-direction: initial; flex-wrap: initial"
                            >
                              <div>
                                <a-input :value="tag.tagname" :disabled="true" size="small" />
                              </div>
                              <div style="display: flex">
                                <selectColor
                                  :color="tag.color"
                                  @change="
                                    (value) => colorChange('selectObChart_tagColor', value, tag)
                                  "
                                />
                                <a-input-number
                                  placeholder="小值过滤"
                                  :controls="false"
                                  style="width: 72px"
                                  v-model:value="tag.filtermin"
                                  size="small"
                                />
                                <a-input-number
                                  placeholder="大值过滤"
                                  :controls="false"
                                  style="width: 72px; margin-left: 1px"
                                  v-model:value="tag.filtermax"
                                  size="small"
                                />
                              </div>
                            </div>
                          </div>
                        </a-collapse-panel>
                      </template>
                    </a-collapse>
                  </a-collapse-panel>
                </template>
              </a-collapse>
            </a-tab-pane>
          </template>
          <template
            v-if="
              !props.selectedOb._objects &&
              props.showSign.indexOf('chart') == -1 &&
              props.showSign.indexOf('video') == -1 &&
              props.showSign.indexOf('iframe') == -1
            "
          >
            <a-tab-pane key="cartoon" tab="动画">
              <template v-if="!props.selectedOb._objects">
                <div :class="`${prefixCls}attr-cartoon`">
                  <div
                    :class="`${prefixCls}cartoon-content`"
                    v-show="props.selectedOb.attribute.alarm.length > 0"
                  >
                    <a-collapse v-model:activeKey="attrCartoonActiveKey">
                      <a-collapse-panel
                        v-for="item in props.selectedOb.attribute.alarm"
                        :key="item.functionname"
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
                          <!-- <div>
                                                    <div>
                                                        优先级
                                                    </div>
                                                    <div>
                                                        <a-input-number v-model:value="item.priority" size="small" style="width: 60px" />
                                                    </div>
                                                </div> -->
                          <div>
                            <div> 动画类型 </div>
                            <div>
                              <a-select
                                v-model:value="item.action"
                                style="width: 120px"
                                size="small"
                              >
                                <a-select-option :value="3">变色+闪烁</a-select-option>
                                <a-select-option :value="0">变色</a-select-option>
                                <a-select-option :value="4">旋转</a-select-option>
                                <!-- <a-select-option value="5">移动</a-select-option> -->
                                <a-select-option :value="6">隐藏</a-select-option>
                              </a-select>
                            </div>
                          </div>
                          <div v-show="[0, 3].includes(item.action)">
                            <div> 颜色 </div>
                            <div>
                              <selectColor
                                :color="item.color"
                                @change="(value) => colorChange('alarm_color', value, item)"
                              />
                            </div>
                          </div>
                          <div v-show="[0, 3].includes(item.action)">
                            <div> 色值方式 </div>
                            <div>
                              <a-select
                                v-model:value="item.filters"
                                style="width: 120px"
                                size="small"
                              >
                                <a-select-option value="add">添加</a-select-option>
                                <a-select-option value="diff" class="">差异</a-select-option>
                                <a-select-option value="subtract" class="">减去</a-select-option>
                                <a-select-option value="multiply" class="">乘</a-select-option>
                                <a-select-option value="screen" class="">屏幕</a-select-option>
                                <a-select-option value="lighten" class="">减轻</a-select-option>
                                <a-select-option value="darken" class="">变暗</a-select-option>
                                <a-select-option value="overlay" class="">覆盖</a-select-option>
                                <a-select-option value="exclusion" class="">排除</a-select-option>
                                <a-select-option value="tint" class="">着色</a-select-option>
                              </a-select>
                            </div>
                          </div>
                          <div>
                            <div> 触发条件： </div>
                          </div>
                          <div>
                            <div style="width: 100%; height: 200px">
                              <codemirror
                                :code="item.functionstr"
                                :style="{ height: '100%', overflow: 'auto' }"
                                lang="javascript"
                                @change="(value) => alarmCodeChange(item, value)"
                              />
                            </div>
                          </div>
                        </div>
                        <template #extra>
                          <IconFontClass
                            @click="deleteAlarm(item)"
                            style="font-size: 12px; font-weight: 700"
                            name="icon-iNeuOS-guanbicuowu"
                          />
                        </template>
                      </a-collapse-panel>
                    </a-collapse>
                  </div>
                  <div
                    style=" opacity: 0.5;text-align: center"
                    v-show="props.selectedOb.attribute.alarm.length == 0"
                  >
                    <IconFontClass
                      :isSvg="true"
                      style="font-size: 180px"
                      name="icon-iNeuOS-bianji1"
                    />
                  </div>
                  <div style=" height: 40px; padding-top: 5px;text-align: center">
                    <a-button type="primary" @click="addAlarm">添加动画</a-button>
                  </div>
                </div>
              </template>
            </a-tab-pane>
          </template>
          <template
            v-if="
              !props.selectedOb._objects &&
              props.showSign.indexOf('chart') == -1 &&
              props.showSign.indexOf('video') == -1 &&
              props.showSign.indexOf('iframe') == -1
            "
          >
            <a-tab-pane key="event" tab="交互">
              <template v-if="!props.selectedOb._objects">
                <div :class="`${prefixCls}attr-event`">
                  <div
                    :class="`${prefixCls}event-content`"
                    v-show="props.selectedOb.attribute.event.length > 0"
                  >
                    <a-collapse v-model:activeKey="attrEventActiveKey">
                      <a-collapse-panel
                        v-for="item in props.selectedOb.attribute.event"
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
                              <a-select
                                v-model:value="item.event"
                                style="width: 120px"
                                size="small"
                              >
                                <a-select-option value="click">单击</a-select-option>
                                <a-select-option
                                  :disabled="
                                    props.selectedOb.attribute.event.find(
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
                                    name="icon-iNeuOS-tianjiawukuang"
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
                                    name="icon-iNeuOS-edit-fill"
                                    @click="showAddRightMenu(node.param, false, 'edit')"
                                    title="编辑"
                                    style="color: #10893e"
                                  />
                                  <IconFontClass
                                    name="icon-iNeuOS-tianjiawukuang"
                                    @click="showAddRightMenu(node.param, false, 'add')"
                                    title="添加"
                                    style=" margin-right: 2px;color: #0960bd"
                                  />
                                  <IconFontClass
                                    @click="removeRightMenu(node.param)"
                                    name="icon-iNeuOS-shanchu"
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
                            name="icon-iNeuOS-guanbicuowu"
                          />
                        </template>
                      </a-collapse-panel>
                    </a-collapse>
                  </div>
                  <div
                    v-show="props.selectedOb.attribute.event.length == 0"
                    style=" opacity: 0.5;text-align: center"
                  >
                    <IconFontClass
                      :isSvg="true"
                      style="font-size: 180px"
                      name="icon-iNeuOS-bianji1"
                    />
                  </div>
                  <div style=" height: 40px; padding-top: 5px;text-align: center">
                    <a-button type="primary" @click="addEvent">添加交互</a-button>
                  </div>
                </div>
              </template>
            </a-tab-pane>
          </template>
        </a-tabs>
      </div>
    </template>
    <div class="prop-bottom">
      <slot name="footer"></slot>
    </div>
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
  import myTree from '/@/components/MyTree/index.vue';
  import action from './action.vue';
  import selectColor from '/@/components/MySelectColor/index.vue';
  import { message } from 'ant-design-vue';
  import { ref, watch } from 'vue';
  import { useDesign } from '/@/hooks/web/useDesign';
  import codemirror from '/@/components/MyCodemirror/codemirror.vue';

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
          //是否无限画布
          infinite: true,
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
  const marks = ref({
    100: '100%',
  });
  const { prefixCls } = useDesign('modeling');
  const propContainerActiveKey = ref(['container', 'request', 'run']);
  const containerConfigSize = ref('custom');
  const configTabsActiveKey = ref('attr');
  const propAttrActiveKey = ref(['img', 'appearance', 'source', 'text', 'chart']);
  const chartAttrActiveKey = ref([
    'text',
    'layout',
    'chart',
    'legend',
    'x',
    'y',
    'source',
    'sourceConfig',
  ]);
  //上传的文件信息
  const fileList = ref([]);
  //线条类型
  const borderOptions = ref([
    {
      title: 'solid',
      value: 'solid',
    },
    {
      title: 'dashed',
      value: 'dashed',
    },
    {
      title: 'dotted',
      value: 'dotted',
    },
    {
      title: 'double',
      value: 'double',
    },
  ]);
  //字体候选项
  const fontFamilyOptions = ref([
    {
      label: '宋体',
      value: 'songTi',
    },
    {
      label: '楷体',
      value: 'kaiTi',
    },
  ]);
  //默认展开的动画标签
  const attrCartoonActiveKey = ref(
    props.selectedOb.attribute.alarm.length > 0
      ? props.selectedOb.attribute.alarm.map((m) => {
          return m.functionname;
        })
      : [],
  );
  const attrEventActiveKey = ref(
    props.selectedOb.attribute.event.length > 0
      ? props.selectedOb.attribute.event.map((m) => {
          return m.key;
        })
      : [],
  );
  //指定数据点选中
  const tagCheckedKeys = ref([]);
  let changeTime = 0;
  //是否显示右键菜单事件增加
  const isShowRightMneu = ref(false);
  const rightNewData = ref(null);
  //右键事件id
  let rightEventId;
  let rightSaveType;

  //容器背景图片上传
  function beforeUpload(file, key) {
    return new Promise((resolve, reject) => {
      const isLt5M = file.size / 1024 / 1024 < 5;
      if (!isLt5M) {
        message.error('文件大小不可超过 5MB');
      } else {
        myCommon
          .ImgBase64(file)
          .then((data) => {
            props.updateSelectContainerValue('backgroundImg', data);
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => {
              const img = document.createElement('img');
              img.src = reader.result;
              img.onload = () => {
                const containerOb = props.containerObArray.find(
                  (m) => m.canvasId == props.selectedOb.attribute.containerId,
                );
                containerOb.canvasOb.visibleAreaShowOrNone(
                  true,
                  props.containerConfig.gridShow,
                  props.containerConfig.backgroundColor,
                  img,
                );
              };
            };
          })
          .catch((error) => {
            console.error(error);
            message.error('图片转换失败');
          });
      }
      //解决这个组件上传的个数超过限制时会报：warning.js:6 Warning: [antdv: Checkbox] `value` is not validate prop, do you mean `checked`?
      fileList.value = [];
      reject();
    });
  }

  //更改画布的大小
  function changeCanvasSize(value) {
    const containerOb = props.containerObArray.find(
      (m) => m.canvasId == props.selectedOb.attribute.containerId,
    );
    if (value != 'custom') {
      if (value == 'a3') {
        containerOb.canvasOb.refreshCanvasSize(1870, 2646);
      } else if (value == 'a4') {
        containerOb.canvasOb.refreshCanvasSize(1323, 1870);
      } else if (value == 'a5') {
        containerOb.canvasOb.refreshCanvasSize(933, 1323);
      } else {
        containerOb.canvasOb.refreshCanvasSize(
          parseInt(value.split('x')[0]),
          parseInt(value.split('x')[1]),
        );
      }
    }
  }

  //缩放
  function zoomChange(value) {
    if (value > -1) {
      const containerOb = props.containerObArray.find(
        (m) => m.canvasId == props.selectedOb.attribute.containerId,
      );
      containerOb.canvasOb.cavasZomm(value / 100);
    } else {
      message.info('开发中');
    }
  }

  //选中组件更改配置值
  function selectedObSetConfig(key, value, delay = false, way = 'equal', rightEventId) {
    const containerOb = props.containerObArray.find(
      (m) => m.canvasId == props.selectedOb.attribute.containerId,
    );
    if (delay) {
      clearTimeout(changeTime);
      changeTime = setTimeout(() => {
        containerOb.canvasOb.edit_set_config(key, value.target.value, way, rightEventId);
      }, 100);
    } else {
      containerOb.canvasOb.edit_set_config(key, value, way, rightEventId);
    }
  }

  //隐藏显示
  function hideClick() {
    const containerOb = props.containerObArray.find(
      (m) => m.canvasId == props.selectedOb.attribute.containerId,
    );
    containerOb.canvasOb.edit_show_hide();
  }

  //颜色改变
  function colorChange(key, color, item) {
    switch (key) {
      case 'alarm_color':
        const alarms = _.cloneDeep(props.selectedOb.attribute.alarm);
        const alatm_ = alarms.find((m) => m.functionname == item.functionname);
        alatm_.color = color;
        selectedObSetConfig('attribute|alarm', alarms);
        break;
      case 'canvas|backgroundColor':
        //画布背景色
        props.updateSelectContainerValue('backgroundColor', color);
        const containerOb = props.containerObArray.find(
          (m) => m.canvasId == props.selectedOb.attribute.containerId,
        );
        containerOb.canvasOb.visibleAreaShowOrNone(true, props.containerConfig.gridShow, color);
        break;
      case 'selectObChart_tagColor':
        //图表的选中数据点的颜色
        const tags = _.cloneDeep(props.selectedOb.attribute.dataInfo.tags);
        const tag = tags.find((m) => m.tagid == item.tagid);
        tag.color = color;
        selectedObSetConfig('attribute|dataInfo|tags', tags);
        break;
      //图表的背景颜色
      case 'selectObChart_backgroundColor':
      //图表的标题颜色
      case 'selectObChart_titleColor':
      //X轴线的颜色
      case 'selectObChart_xAxisLineColor':
      //X轴分割线的颜色
      case 'selectObChart_xSplitLineColor':
      //X轴刻度颜色
      case 'selectObChart_xAxisLabelColor':
      case 'selectObChart_ySplitLineColor':
      case 'selectObChart_yAxisLabelColor':
      case 'selectObChart_yAxisLineColor':
      case 'selectObChart_legendColor':
      case 'selectObChart_dColor':
      case 'selectObChart_gradientColorStart':
      case 'selectObChart_gradientColorEnd':
      case 'selectObChart_tColor':
      case 'selectObChart_borderColor':
        selectedObSetConfig(`attribute|options|${key.split('_')[1]}`, color);
        break;
    }
  }

  //动画代码改变
  function alarmCodeChange(item, value) {
    item.functionstr = value;
  }

  //点击树数据点
  function tagCheck(checkedKeys, node, type) {
    if (type == 'chart') {
      let t = _.cloneDeep(props.selectedOb.attribute.dataInfo.tags);
      //图表
      if (!node.checked) {
        //选中
        t.push({
          tagid: node.key, //名称
          tagname: node.title, //名称
          filtermin: null, //过滤最小值
          filtermax: null, //过滤最大值
          color: myCommon.getColor(), //颜色
          tagunit: node.tagunit, //单位
          tagquantiles: node.tagquantiles, //小数位
        });
        tagCheckedKeys.value.push(node.key);
      } else {
        t = t.filter((m) => m.tagid != node.key);
        tagCheckedKeys.value = tagCheckedKeys.value.filter((m) => m != node.key);
      }
      selectedObSetConfig('attribute|dataInfo|tags', t, false, 'equal');
    } else {
      if (!node.checked) {
        //选中
        selectedObSetConfig('attribute|deviceId', node.parentid);
        selectedObSetConfig('attribute|tagId', node.key);
        selectedObSetConfig('attribute|tagName', node.title);
      } else {
        selectedObSetConfig('attribute|deviceId', '');
        selectedObSetConfig('attribute|tagId', '');
        selectedObSetConfig('attribute|tagName', '');
      }
    }
  }

  //清除数据点选中
  function closeTagCheck(isClearAll, clearKey, type) {
    if (type == 'chart' && isClearAll) {
      selectedObSetConfig('attribute|dataInfo|tags', [], false, 'equal');
    } else {
      tagCheck([], { checked: true, key: clearKey }, type);
    }
  }

  //添加动作
  function addAlarm() {
    const functionName = myCommon.uniqueId();
    selectedObSetConfig(
      'attribute|alarm',
      {
        title: '动画', //名称
        open: true, //是否开启 on/off
        color: 'red', //颜色
        functionstr: `function ${functionName}(tagvalue) { 
           return true;
            }`, //方法体
        filters: 'add', //色值方式：
        amplitude: 30, //幅度
        priority: 1, //优先级
        functionname: functionName, //方法名
        action: 3, ///0报警色/1跳动/2抖动/3报警色+闪烁/4旋转/5移动
        rotate: 0, //0顺时针/1逆时针
        move: 'up', //up向上/down向下/left向左/right向右
        isExecuting: false, //是否执行的是此报警方法
      },
      false,
      'push',
    );
    attrCartoonActiveKey.value.push(functionName);
  }

  //删除动作
  function deleteAlarm(item) {
    selectedObSetConfig(
      'attribute|alarm',
      props.selectedOb.attribute.alarm.filter((m) => m.functionname != item.functionname),
    );
  }

  //添加交互动作
  function addEvent() {
    const id = myCommon.uniqueId();
    selectedObSetConfig(
      'attribute|event',
      {
        key: id,
        title: '交互',
        isShowMenuName: false,
        menuName: '',
        //click、rightClick
        event: 'click',
        open: true, //配置是否有效
        type: '', //单击事件类型。open_url(打开连接)/instructions(下发指令)
        //右键菜单数据
        children: [
          // key: myCommon.uniqueId(),
          // title: "",
          // children: [],
          // isShowMenuName: true,
          // parentid: isRoot ? 0 : item.key,
          // open: true,
          // type: "",//单击事件类型。open_url(打开连接)/instructions(下发指令)
          // isValid: false,//配置是否有效
          // instructions: {
          //     //指令类型 bool:下发布尔值（点击基数下发真点击偶数下发真），fixed:指定值（每次都下发一样的值），custom:下发自定义的值（弹出输入值框）
          //     instructions_type: "bool",
          //     open_value: "1",//开指令值
          //     close_value: "0",//关指令值
          //     fixed_value: "",//下发的固定值
          // },
          // openurl: {
          //     url: "",//菜单打开的地址
          //     target: "page_alert",//打开地址的方式内部打开和新浏览器标签打开。page_alert(页内弹出)/new_label(新页打开)
          //     sizeUit: 'px',//窗口大小单位
          //     width: 600,//打开窗口的宽度
          //     height: 500,//打开窗口的高度
          //     urlType: "custom",//url的类型，custom(自定义地址)/inside(监测页面)
          //     menuid: "",//urlType为inside时的菜单id
          // },
          // requesturl: {
          //     url: "",//请求地址
          //     reques_type: "",//请求地址方式
          //     isreturn: false //是否弹出返回消息
          // }
        ],
        instructions: {
          //指令类型 bool:下发布尔值（点击基数下发真点击偶数下发真），fixed:指定值（每次都下发一样的值），custom:下发自定义的值（弹出输入值框）
          instructions_type: 'bool',
          open_value: '1', //开指令值
          close_value: '0', //关指令值
          fixed_value: '', //下发的固定值
        },
        openurl: {
          url: '', //菜单打开的地址
          target: 'page_alert', //打开地址的方式内部打开和新浏览器标签打开。page_alert(页内弹出)/new_label(新页打开)
          sizeUit: 'px', //窗口大小单位
          width: 600, //打开窗口的宽度
          height: 500, //打开窗口的高度
          urlType: 'custom', //url的类型，custom(自定义地址)/inside(监测页面)
          menuid: '', //urlType为inside时的菜单id
        },
        requesturl: {
          url: '', //请求地址
          reques_type: '', //请求地址方式
          isreturn: false, //是否弹出返回消息
        },
      },
      false,
      'push',
    );
    attrEventActiveKey.value.push(id);
  }

  function updateEventItem(item) {
    if (!item.hasOwnProperty('righteventid')) {
      const oldData = _.cloneDeep(props.selectedOb.attribute.event);
      oldData.forEach((m) => {
        if (m.key == item.key) {
          myCommon.objectReplace(m, item);
        }
      });
      selectedObSetConfig('attribute|event', oldData, false, 'equal');
    } else {
      myCommon.objectReplace(rightNewData.value, item);
    }
  }

  //删除交互动作
  function deleteEvent(item) {
    selectedObSetConfig(
      'attribute|event',
      props.selectedOb.attribute.event.filter((m) => m.key != item.key),
    );
  }

  //清空颜色
  function deleteBackgroundColor(key) {
    const containerOb = props.containerObArray.find(
      (m) => m.canvasId == props.selectedOb.attribute.containerId,
    );
    switch (key) {
      case 'canvas|backgroundColor':
        props.updateSelectContainerValue('backgroundColor', '');
        containerOb.canvasOb.visibleAreaShowOrNone(true, props.containerConfig.gridShow, '');
        break;
      case 'selectObChart_background':
        break;
    }
  }

  //删除背景图片
  function deleteBackgroundImg(key) {
    const containerOb = props.containerObArray.find(
      (m) => m.canvasId == props.selectedOb.attribute.containerId,
    );
    switch (key) {
      case 'canvas|backgroundImg':
        props.updateSelectContainerValue('backgroundImg', '');
        containerOb.canvasOb.visibleAreaShowOrNone(
          true,
          props.containerConfig.gridShow,
          props.containerConfig.backgroundColor,
        );
        break;
      case 'selectObChart_backgroundImg':
        break;
    }
  }

  //网格显示与隐藏
  function gridShowChange(value) {
    const containerOb = props.containerObArray.find(
      (m) => m.canvasId == props.selectedOb.attribute.containerId,
    );
    containerOb.canvasOb.visibleAreaShowOrNone(true, value, props.containerConfig.backgroundColor);
  }

  //画布
  function infiniteChange(value) {
    const containerOb = props.containerObArray.find(
      (m) => m.canvasId == props.selectedOb.attribute.containerId,
    );
    containerOb.canvasOb.infiniteChange(value);
  }

  //显示增加右键菜单
  function showAddRightMenu(item, isRoot = false, type) {
    rightEventId = item.key;
    rightSaveType = type;
    if (type == 'add') {
      rightNewData.value = {
        righteventid: rightEventId,
        key: myCommon.uniqueId(),
        title: '',
        children: [],
        isShowMenuName: true,
        parentid: isRoot ? 0 : item.key,
        open: true,
        type: '', //单击事件类型。open_url(打开连接)/instructions(下发指令)
        isValid: false, //配置是否有效
        instructions: {
          //指令类型 bool:下发布尔值（点击基数下发真点击偶数下发真），fixed:指定值（每次都下发一样的值），custom:下发自定义的值（弹出输入值框）
          instructions_type: 'bool',
          open_value: '1', //开指令值
          close_value: '0', //关指令值
          fixed_value: '', //下发的固定值
        },
        openurl: {
          url: '', //菜单打开的地址
          target: 'page_alert', //打开地址的方式内部打开和新浏览器标签打开。page_alert(页内弹出)/new_label(新页打开)
          sizeUit: 'px', //窗口大小单位
          width: 600, //打开窗口的宽度
          height: 500, //打开窗口的高度
          urlType: 'custom', //url的类型，custom(自定义地址)/inside(监测页面)
          menuid: '', //urlType为inside时的菜单id
        },
        requesturl: {
          url: '', //请求地址
          reques_type: '', //请求地址方式
          isreturn: false, //是否弹出返回消息
        },
      };
    } else {
      rightEventId = item.righteventid;
      rightNewData.value = _.cloneDeep(item);
    }
    isShowRightMneu.value = true;
  }

  //保存右键菜单
  function saveRightMenu() {
    if (rightSaveType == 'add') {
      selectedObSetConfig('attribute|event|data', rightNewData.value, false, '', rightEventId);
    } else {
      selectedObSetConfig('attribute|event|data|edit', rightNewData.value, false, '', rightEventId);
    }
    closeRightMenu();
  }

  //删除右键菜单
  function removeRightMenu(item) {
    if (item.parentid == 0) {
      selectedObSetConfig('attribute|event|data|delete', item, false, '', item.righteventid);
    } else {
      selectedObSetConfig('attribute|event|data|delete', item, false, '', item.parentid);
    }
  }

  //关闭右键菜单事件
  function closeRightMenu() {
    isShowRightMneu.value = false;
    rightNewData.value = null;
  }

  //层级设置
  function levelOption(runType) {
    const containerOb = props.containerObArray.find(
      (m) => m.canvasId == props.selectedOb.attribute.containerId,
    );
    if (containerOb) {
      switch (runType) {
        case 'topLevel':
          containerOb.canvasOb.canvas.bringToFront(containerOb.canvasOb.canvas.getActiveObject());
          break;
        case 'groundLevel':
          containerOb.canvasOb.canvas.sendToBack(containerOb.canvasOb.canvas.getActiveObject());
          containerOb.canvasOb.canvas.sendToBack(containerOb.canvasOb.canvasObject.visibleArea);
          break;
        case 'up':
          containerOb.canvasOb.canvas.bringForward(containerOb.canvasOb.canvas.getActiveObject());
          break;
        case 'bottom':
          containerOb.canvasOb.canvas.sendBackwards(containerOb.canvasOb.canvas.getActiveObject());
          containerOb.canvasOb.canvas.sendToBack(containerOb.canvasOb.canvasObject.visibleArea);
          break;
      }
    }
  }

  //监控选中数据点改变
  watch(
    () => props.selectedOb,
    () => {
      configTabsActiveKey.value = 'attr';
      if (props.selectedOb.attribute.sign != 'chart') {
        tagCheckedKeys.value =
          props.selectedOb.attribute.tagId == '' ? [] : [props.selectedOb.attribute.tagId];
      } else {
        const t = [];
        props.selectedOb.attribute.dataInfo.tags.forEach((tag) => {
          t.push(tag.tagid);
        });
        tagCheckedKeys.value = t;
      }
    },
    { amplitude: true },
  );
</script>
<style lang="less" scoped>
  @prefixCls: ~'@{namespace}-modeling';

  :deep(.ant-slider-mark) {
    top: -18px;
  }

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
      // height: 100%;
      height: calc(100% - 25px);

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

      .@{prefixCls}prop-attr-content {
        .@{prefixCls}prop-attr-chart {
          :deep(.ant-collapse-content-box) {
            padding: 0;
          }

          .@{prefixCls}prop-attr-chart-content {
            padding: 0;
            border: none;

            :deep(.ant-collapse-header) {
              padding: 3px 60px;
            }

            :deep(.ant-collapse-content-box) {
              padding: 0;
            }
          }
        }
      }
    }

    .prop-bottom {
      width: 100%;
      margin-top: 1px;
      float: right;
    }
  }
</style>
