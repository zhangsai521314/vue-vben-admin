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
      <a-form-item name="parentId" label="上级菜单">
        <a-tree-select
          v-model:value="props.fromData.parentId"
          show-search
          style="width: 100%"
          :dropdown-style="{ maxHeight: '400px', overflow: 'auto' }"
          placeholder="请选择上级菜单"
          allow-clear
          show-arrow
          :filterTreeNode="AntVueCommon.filterTreeNode"
          :tree-data="menuTreeDatas"
        />
      </a-form-item>
      <a-form-item
        name="menuName"
        label="菜单名称"
        :rules="[
          { required: true, message: '' },
          { max: 50, message: '菜单名称过长' },
          { validator: formValidator.empty, message: '请输入菜单名称' },
        ]"
      >
        <a-input v-model:value="props.fromData.menuName" />
      </a-form-item>
      <!-- <a-form-item name="openSizeType" label="窗口大小">
        <a-select :disabled="saveType == 'edit'" v-model:value="props.fromData.openSizeType">
          <a-select-option :value="1">正常(1360px*750px)</a-select-option>
          <a-select-option :value="2">最大化</a-select-option>
          <a-select-option :value="3">自定义</a-select-option>
        </a-select>
      </a-form-item>
      <template v-if="props.fromData.openSizeType == '3'">
        <a-form-item
          name="openWidth"
          label="宽度"
          :rules="[{ required: true, message: '请输入宽度' }]"
        >
          <a-input-number
            :style="{ width: '100%' }"
            v-model:value="props.fromData.openWidth"
            :min="1350"
          />
        </a-form-item>
        <a-form-item
          name="openHeight"
          label="高度"
          :rules="[{ required: true, message: '请输入高度' }]"
        >
          <a-input-number
            :style="{ width: '100%' }"
            v-model:value="props.fromData.openHeight"
            :min="750"
          />
        </a-form-item>
      </template> -->
      <a-form-item
        name="orderIndex"
        label="菜单排序"
        :rules="[
          { required: true, message: '请输入菜单排序' },
          { validator: formValidator.min, min: -9999, message: t('view.sortingValueMustBeBetween9999') },
          { validator: formValidator.max, max: 9999, message: t('view.sortingValueMustBeBetween9999') },
        ]"
      >
        <a-input-number
          :precision="3"
          :style="{ width: '100%' }"
          placeholder="请输入菜单排序"
          v-model:value="props.fromData.orderIndex"
        />
      </a-form-item>
      <!-- <a-form-item label="桌面">
        <a-switch
          v-model:checked="props.fromData.isDesktop"
          checked-children="是"
          un-checked-children="否"
        />
      </a-form-item> -->
      <!-- <a-form-item label="移动端">
        <a-switch
          v-model:checked="props.fromData.isMobile"
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
  import AntVueCommon from '@/utils/MyCommon/AntVueCommon';
  import formValidator from '@/utils/MyCommon/formValidator';
  import { ref, watch } from 'vue';
  import menuApi from '@/api/menu';
  //vue3使用defineProps接收传过来的参数
  const props = defineProps({
    fromData: {
      type: Object,
      default() {
        return {
          menuIcon: 'icon-baseui-biaodan',
          parentId: 0,
          menuName: '',
          orderIndex: null,
          isDesktop: true,
          isMobile: false,
          openSizeType: 2,
          openWidth: 1365,
          openHeight: 750,
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
  const menuTreeDatas = ref([]);

  //获取菜单树
  function getMenuTreeDatas() {
    menuApi.GetMenuSimple({ NoMenuType: [7] }).then((data) => {
      menuTreeDatas.value = data;
    });
  }
  watch(
    () => props.isShow,
    () => {
      if (props.isShow) {
        getMenuTreeDatas();
      }
    },
    { immediate: true },
  );
</script>
