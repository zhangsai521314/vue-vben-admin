<!--菜单表单-->
<template>
  <a-drawer
    :headerStyle="{ height: '49px', borderBottom: '2px solid #eee' }"
    :width="props.width"
    :visible="props.isShow"
    :title="props.ztitle"
    :footer-style="{ textAlign: 'right' }"
    @close="props.cancel"
  >
    <a-form
      :model="props.fromData"
      :label-col="{ span: 8 }"
      :style="{ paddingRight: '2px' }"
      :wrapper-col="{ span: 16 }"
      autocomplete="off"
      ref="menuRef"
    >
      <a-form-item
        name="menuname"
        label="名称"
        :rules="[
          { required: true, message: '' },
          { validator: formValidator.empty, message: '请输入名称' },
        ]"
      >
        <a-input v-model:value="props.fromData.menuname" />
      </a-form-item>
      <a-form-item name="opensizetype" label="窗口大小">
        <a-select :disabled="saveType == 'edit'" v-model:value="props.fromData.opensizetype">
          <a-select-option :value="1">正常(1360px*750px)</a-select-option>
          <a-select-option :value="2">最大化</a-select-option>
          <a-select-option :value="3">自定义</a-select-option>
        </a-select>
      </a-form-item>
      <template v-if="props.fromData.opensizetype == '3'">
        <a-form-item
          name="openwidth"
          label="宽度"
          :rules="[{ required: true, message: '请输入宽度' }]"
        >
          <a-input-number
            :style="{ width: '100%' }"
            v-model:value="props.fromData.openwidth"
            :min="1350"
          />
        </a-form-item>
        <a-form-item
          name="openheight"
          label="高度"
          :rules="[{ required: true, message: '请输入高度' }]"
        >
          <a-input-number
            :style="{ width: '100%' }"
            v-model:value="props.fromData.openheight"
            :min="750"
          />
        </a-form-item>
      </template>
      <a-form-item
        name="orderindex"
        label="排序"
        :rules="[{ required: true, message: '请输入排序' }]"
      >
        <a-input-number
          :style="{ width: '100%' }"
          v-model:value="props.fromData.orderindex"
          :min="0"
        />
      </a-form-item>
      <a-form-item label="桌面">
        <a-switch
          v-model:checked="props.fromData.isdesktop"
          checked-children="是"
          un-checked-children="否"
        />
      </a-form-item>
      <!-- <a-form-item label="移动端">
        <a-switch
          v-model:checked="props.fromData.ismobile"
          checked-children="是"
          un-checked-children="否"
        />
      </a-form-item> -->
    </a-form>
    <template #footer>
      <slot name="footer_"></slot>
    </template>
  </a-drawer>
</template>
<script setup>
  import formValidator from '@/utils/MyCommon/formValidator';
  import { ref } from 'vue';
  //vue3使用defineProps接收传过来的参数
  const props = defineProps({
    fromData: {
      type: Object,
      default() {
        return {
          menuicon: 'icon-baseui-biaodan',
          parentid: 0,
          menuname: '',
          orderindex: null,
          isdesktop: true,
          ismobile: false,
          opensizetype: 2,
          openwidth: 1365,
          openheight: 750,
        };
      },
    },
    ztitle: {
      type: String,
      default() {
        return '菜单配置';
      },
    },
    btnCancelTitle: {
      type: String,
      default() {
        return '取消';
      },
    },
    btnConfirmTitle: {
      type: String,
      default() {
        return '保存';
      },
    },
    width: {
      type: Number,
      default() {
        return 500;
      },
    },
    //是否显示
    isShow: {
      type: Boolean,
      default() {
        return false;
      },
    },
    //取消事件
    cancel: {
      type: Function,
      default() {
        return function () {};
      },
    },
  });
  const menuRef = ref({});
</script>
