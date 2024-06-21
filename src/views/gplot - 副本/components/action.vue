<template>
  <div class="content-item" v-show="props.item.isShowMenuName">
    <div> 菜单名称 </div>
    <div>
      <a-input v-model:value="props.item.title" size="small" style="width: 180px" />
    </div>
  </div>
  <template v-if="props.item.event != 'rightClick'">
    <div class="content-item">
      <div> 动作类型 </div>
      <div>
        <a-select v-model:value="props.item.type" style="width: 120px" size="small">
          <a-select-option value="open_url">打开连接</a-select-option>
          <a-select-option value="instructions">下发指令</a-select-option>
          <a-select-option value="request_url">请求接口</a-select-option>
        </a-select>
      </div>
    </div>
  </template>
  <template v-if="props.item.event != 'rightClick' && props.item.type == 'open_url'">
    <div class="content-item">
      <div> 链接类型 </div>
      <div>
        <a-select v-model:value="props.item.openurl.urlType" style="width: 120px" size="small">
          <a-select-option value="custom">自定义地址</a-select-option>
          <a-select-option value="inside">监测页面</a-select-option>
        </a-select>
      </div>
    </div>
    <div class="content-item">
      <div> 打开方式 </div>
      <div>
        <a-select v-model:value="props.item.openurl.target" style="width: 120px" size="small">
          <a-select-option value="page_alert">页内弹出</a-select-option>
          <a-select-option value="new_label">新标签页打开</a-select-option>
        </a-select>
      </div>
    </div>
    <template v-if="props.item.openurl.target == 'page_alert'">
      <div class="content-item">
        <div> 窗口大小单位 </div>
        <div>
          <a-select v-model:value="props.item.openurl.sizeUit" style="width: 120px" size="small">
            <a-select-option value="px">像素</a-select-option>
            <a-select-option value="%">百分比</a-select-option>
          </a-select>
        </div>
      </div>
      <div class="content-item">
        <div>
          <a-input-number
            style="width: calc((100% - 13.5px) / 2)"
            v-model:value="props.item.openurl.width"
            :min="props.item.openurl.sizeUit == 'px' ? 600 : 10"
            addon-after="宽"
            size="small"
          />
          -
          <a-input-number
            style="width: calc((100% - 13.5px) / 2)"
            v-model:value="props.item.openurl.height"
            :min="props.item.openurl.sizeUit == 'px' ? 500 : 10"
            addon-after="高"
            size="small"
          />
        </div>
      </div>
    </template>

    <template v-if="props.item.openurl.urlType == 'inside'">
      <div style="width: 250px; height: 300px; border: 1px solid #e5e7eb; background-color: #fff">
        <myTree
          :isBorder="false"
          :isRadio="true"
          :isShowAllCheck="false"
          :showIcon="false"
          :checkStrictly="true"
          :isShowSearch="true"
          :checkedKeys="[props.item.openurl.menuid]"
          @check="menuCheck"
          :data="props.menuTreeData"
        />
      </div>
    </template>

    <div class="content-item">
      <div> 链接地址 </div>
      <div>
        <a-input
          :disabled="props.item.openurl.urlType == 'inside'"
          v-model:value="props.item.openurl.url"
          size="small"
          style="width: 180px"
        />
      </div>
    </div>
  </template>
  <template v-else-if="props.item.event != 'rightClick' && props.item.type == 'instructions'">
    <div class="content-item">
      <div> 指令类型 </div>
      <div>
        <a-select
          v-model:value="props.item.instructions.instructions_type"
          style="width: 120px"
          size="small"
        >
          <a-select-option value="bool">布尔值</a-select-option>
          <a-select-option value="fixed">固定值</a-select-option>
          <a-select-option value="custom">自定义指令值</a-select-option>
        </a-select>
      </div>
    </div>
    <div class="content-item" v-show="props.item.instructions.instructions_type == 'fixed'">
      <div> 固定值 </div>
      <div>
        <a-input
          v-model:value="props.item.instructions.fixed_value"
          style="width: 120px"
          size="small"
        />
      </div>
    </div>
    <div class="content-item" v-show="props.item.instructions.instructions_type == 'bool'">
      <div>
        <a-input
          style="width: calc((100% - 17px) / 2)"
          v-model:value="props.item.instructions.open_value"
          addon-after="开值"
          size="small"
        />
        <a-tooltip>
          <template #title>
            <p>(1)配置此指令的数据点的值要么为“开指令值”，要么为“关指令值”。</p>
            <p> (2)下发指令时，如果数据点的当前值为“开指令值”时，则下发的为“关指令”。</p>
            <p> (3)下发指令时，如果数据点的当前值为“关指令值”时，则下发的为“开指令”</p>
          </template>
          <IconFontClass style=" margin: 0 2px;font-size: 13px" name="icon-baseui-tishi" />
        </a-tooltip>
        <a-input
          style="width: calc((100% - 17px) / 2)"
          v-model:value="props.item.instructions.close_value"
          addon-after="关值"
          size="small"
        />
      </div>
    </div>
    <div
      class="content-item"
      v-show="props.item.instructions.instructions_type == 'custom'"
      style="color: red"
    >
      在监测页面中单击该控件，在弹出的输入框中输入指令值。
    </div>
  </template>
  <template v-if="props.item.event != 'rightClick' && props.item.type == 'request_url'">
    <div class="content-item">
      <div> 请求类型 </div>
      <div>
        <a-select
          v-model:value="props.item.requesturl.reques_type"
          style="width: 120px"
          size="small"
        >
          <a-select-option value="get">get</a-select-option>
          <!-- <a-select-option value="post">post</a-select-option> -->
        </a-select>
      </div>
    </div>
    <div class="content-item">
      <div> 请求地址 </div>
      <div>
        <a-input style="width: 100%" v-model:value="props.item.requesturl.url" size="small" />
      </div>
    </div>
  </template>
</template>
<script setup>
  import myTree from '/@/components/MyTree/index.vue';
  import { ref, watch, nextTick } from 'vue';

  const props = defineProps({
    //事件
    item: {
      type: Object,
      default() {
        return {
          isShowMenuName: false,
          title: '',
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
            menuId: '', //urlType为inside时的菜单id
          },
          requesturl: {
            url: '', //请求地址
            reques_type: '', //请求地址方式
            isreturn: false, //是否弹出返回消息
          },
        };
      },
    },
    menuTreeData: {
      type: Array,
      default() {
        return [];
      },
    },
    updateEventItem: {
      type: Function,
      default() {
        return (item) => {};
      },
    },
  });

  function menuCheck(node) {
    const item = _.cloneDeep(props.item);
    item.openurl.menuid = node.key;
    item.openurl.url = node.menuurl;
    props.updateEventItem(item);
  }
</script>
<style scoped>
  .content-item {
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    margin: 5px 0;
  }
</style>
