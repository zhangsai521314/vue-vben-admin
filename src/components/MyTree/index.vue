<template>
  <div :class="`${prefixCls}`" :id="id">
    <div
      style="display: flex; flex-direction: row; justify-content: space-between; margin: 0 0 -1px 0"
    >
      <a-input-search
        v-if="props.isShowSearch"
        v-model:value="searchContent"
        placeholder="搜索"
        :style="{ width: '100%' }"
      />
      <div
        style="
          border: 1px solid #e5e7eb;
          margin-left: -2px;
          margin-bottom: 1px;
          height: 32px;
          overflow: hidden;
          display: flex;
          flex-direction: row;
          justify-content: space-between;
        "
      >
        <IconFontClass
          v-if="props.isShowAllCheck"
          :class="{ show: isShowCheck }"
          style="
            font-size: 23px;
            line-height: 31px;
            height: 30px;
            display: inline-block;
            margin-top: 1px;
            border-radius: 1px;
            cursor: pointer;
          "
          name="icon-baseui-yanjing"
          @click="showCheck()"
          title="查看选中"
        />
        <slot name="addbtn"></slot>
      </div>
    </div>
    <myTreeCheck
      v-if="props.isShowAllCheck"
      v-show="isShowCheck"
      :style="{
        height: 'calc(100% - 33px)',
        width: '100%',
        border: props.isBorder ? '1px solid #e5e7eb' : 'none',
        borderTop: 'none',
      }"
      :dataList="dataList"
      :checkedKeys="checkedKeys"
      @clear="clearCheck"
    />
    <div
      v-show="!isShowCheck"
      :style="{
        width: '100%',
        border: props.isBorder ? '1px solid #e5e7eb' : 'none',
        borderTop: 'none',
      }"
      :class="{ danXuan: props.isRadio }"
    >
      <a-tree
        :show-icon="props.showIcon"
        :disabled="props.disabled"
        :height="treeHeight"
        :checkable="props.checkable"
        :checkStrictly="props.checkStrictly"
        :tree-data="props.data"
        :checkedKeys="checkedKeys"
        v-model:expandedKeys="expandedKeys"
        @select="treeClick"
        @check="treeCheck"
      >
        <template #title="node">
          <!-- 节点插槽 -->
          <div
            :class="`${prefixCls}custom`"
            @mousemove="treeTitleMousemove"
            @mouseout="treeTitleMouseout"
          >
            <span v-if="node.title.indexOf(searchContent) > -1" @click="treeTitleClick(node)">
              {{ node.title.substr(0, node.title.indexOf(searchContent)) }}
              <span style="color: #f50">{{ searchContent }}</span>
              {{ node.title.substr(node.title.indexOf(searchContent) + searchContent.length) }}
            </span>
            <span v-else @click="treeTitleClick(node)">{{ node.title }}</span>
            <span :class="`${prefixCls}option`">
              <!-- 节点后的操作按钮 -->
              <slot name="titlebtn" :param="node"></slot>
            </span>
          </div>
        </template>
        <template #icon="node">
          <slot name="icon" :param="node"></slot>
        </template>
      </a-tree>
    </div>
  </div>
</template>
<script setup>
  import { useDesign } from '@/hooks/web/useDesign';
  import { ref, onMounted, watch, onUpdated, nextTick } from 'vue';
  import myTreeCheck from '@/components/MyTreeCheck/index.vue';
  //定时器
  import { useTimeFn } from '@/hooks/core/useTime_';
  const props = defineProps({
    //是否显示图标
    showIcon: {
      type: Boolean,
      default() {
        return false;
      },
    },
    //最大高度
    maxHeight: {
      type: Number,
      default() {
        return null;
      },
    },
    //禁止操作
    disabled: {
      type: Boolean,
      default() {
        return false;
      },
    },
    //是否带选框
    checkable: {
      type: Boolean,
      default() {
        return true;
      },
    },
    //父级是否可选中
    isParentCheck: {
      type: Boolean,
      default() {
        return false;
      },
    },
    //子集是否可选中
    isLeafCheck: {
      type: Boolean,
      default() {
        return true;
      },
    },
    //是否单选
    isRadio: {
      type: Boolean,
      default() {
        return false;
      },
    },
    //是否展示搜索
    isShowSearch: {
      type: Boolean,
      default() {
        return true;
      },
    },
    //默认选中
    checkedKeys: {
      type: Array,
      default() {
        return [];
      },
    },
    //默认展开
    expandedKeys: {
      type: Array,
      default() {
        return [];
      },
    },
    //状态下节点选择完全受代码控（父子节点选中状态不再关联）
    checkStrictly: {
      type: Boolean,
      default() {
        return false;
      },
    },
    //数据源
    data: {
      type: Array,
      default() {
        return [];
      },
    },
    //是否注册windows.size变化更改树大小
    isOnresize: {
      type: Boolean,
      default() {
        return true;
      },
    },
    //是否显示边框
    isBorder: {
      type: Boolean,
      default() {
        return true;
      },
    },
    //是否展示选中框
    isShowAllCheck: {
      type: Boolean,
      default() {
        return true;
      },
    },
    //点击父级文字是否展开
    isTreeTitleClick: {
      type: Boolean,
      default() {
        return true;
      },
    },
  });
  const isShowCheck = ref(false);
  const emits = defineEmits(['select', 'clear', 'check']);
  const id = myCommon.uniqueId();
  let maxHeight;
  const treeHeight = ref(10);
  const { prefixCls } = useDesign('myTree-');
  //备份展开节点，清除回复展开
  let backExpandedKeys = [];
  let isBack = false;
  //展开的节点
  const expandedKeys = ref(props.expandedKeys);
  //选中的节点
  const checkedKeys = ref(props.checkedKeys);
  //搜索值
  const searchContent = ref('');
  const timeKey = `components_MyTree_${myCommon.uniqueId()}`;

  //内容改变
  function treeClick(selectedKeys, nodeInfo) {
    emits('select', selectedKeys, nodeInfo);
  }

  //单击节点文字选中和折叠展开实现
  function treeTitleClick(node) {
    if (props.isTreeTitleClick) {
      if (node.children.length > 0 || (node.isLeaf != undefined && !node.isLeaf)) {
        if (node.expanded) {
          //折叠
          //这句pros.expandedKeys不会跟着改变。
          // expandedKeys.value = expandedKeys.value.filter(m => m != node.key);
          //这句pros.expandedKeys会跟着改变。不知道props.expandedKeys为什么会改变
          //在a-drawer组件中使用，需要点击前面的展开图标触发后，点击文字才有用。不知道为什么
          expandedKeys.value.splice(expandedKeys.value.indexOf(node.key), 1);
        } else {
          //我也不知道为啥expandedKeys.value.push(node.key);在抽屉里不行
          const v = expandedKeys.value.filter((m) => m != node.key);
          v.push(node.key);
          expandedKeys.value = v;
        }
      } else {
        chenck(node);
      }
    } else {
      chenck(node);
    }
  }

  //点击选框单选实现。注意tree的checkedKeys不要加v-model
  function treeCheck(checkeds, node_) {
    chenck(node_.node);
  }

  //节点的选中与取消
  function chenck(node) {
    if (!node.checked) {
      //选中
      if (
        (props.isLeafCheck &&
          ((node.isLeaf == undefined && node.children.length == 0) || node.isLeaf)) ||
        (props.isParentCheck &&
          ((node.isLeaf == undefined && node.children.length > 0) || !node.isLeaf))
      ) {
        if (props.isRadio) {
          checkedKeys.value.length = 0;
          checkedKeys.value.push(node.key);
        } else {
          checkedKeys.value.push(node.key);
        }
      }
    } else {
      if (!props.isRadio) {
        checkedKeys.value.splice(checkedKeys.value.indexOf(node.key), 1);
      }
    }
    emits('check', node);
  }

  //显示树操作按钮
  function treeTitleMousemove(event) {
    treeTitleMouseout(event);
    if ($(event.target).hasClass(`${prefixCls}custom`)) {
      $(event.target).find(`.${prefixCls}option`).show();
    } else {
      $(event.target).parents(`.${prefixCls}custom`).find(`.${prefixCls}option`).show();
    }
    if (
      $(event.target).parents(`.${prefixCls}custom`).find(`.${prefixCls}option`).find('*').length >
      0
    ) {
      $(event.target).parents(`.ant-tree-treenode`).addClass('ant-tree-padding');
    }
  }
  //隐藏树操作按钮
  function treeTitleMouseout(event) {
    $(`.${prefixCls}option`).hide();
    $(event.target).parents(`.ant-tree-treenode`).removeClass('ant-tree-padding');
  }

  //显示与关闭选中框
  function showCheck() {
    isShowCheck.value = !isShowCheck.value;
  }

  //还原搜索之前的展开
  watch(
    () => expandedKeys.value,
    () => {
      if (searchContent.value == '' && isBack) {
        isBack = false;
        expandedKeys.value = backExpandedKeys;
        backExpandedKeys = [];
      }
    },
  );

  //搜索
  const dataList = ref([]);
  let expandeds = [];
  //转换为普通表数据
  const generateList = (datas, data) => {
    for (let i = 0; i < data.length; i++) {
      const node = data[i];
      const key = node.key;
      const title = node.title;
      const parentid = node.parentid;
      datas.push({ key, title, parentid });
      if (node.children) {
        generateList(datas, node.children);
      }
    }
  };
  //获取所有父级主键
  function getParentKey(node) {
    expandeds.push(node.key);
    if (node.parentid != '0') {
      const parent = dataList.value.find((m) => m.key == node.parentid);
      getParentKey(parent);
    }
  }
  watch(searchContent, (value) => {
    expandeds = [];
    if (!isBack) {
      isBack = true;
      backExpandedKeys = expandedKeys.value;
    }
    if (value != '') {
      dataList.value.map((item) => {
        if (item.title.indexOf(value) > -1) {
          getParentKey(item);
        }
      });
      expandeds = expandeds.filter((item, i, self) => item && self.indexOf(item) === i);
    }
    expandedKeys.value = expandeds;
  });
  //搜索

  //清除选中
  function clearCheck(isClearAll, clearKey) {
    if (isClearAll) {
      checkedKeys.value = [];
    } else {
      checkedKeys.value = checkedKeys.value.filter((m) => m != clearKey);
    }
    nextTick(() => {
      emits('clear', isClearAll, clearKey);
    });
  }

  defineExpose({
    //获取选中
    getChecks: () => {
      return checkedKeys.value;
    },
    //获取选中的nodes
    getCheckNodes: () => {
      return dataList.value.filter((m) => checkedKeys.value.includes(m.key));
    },
    //根据key获取node
    getKeyNode: (key) => {
      return dataList.value.find((m) => m.key == key);
    },
    //根据key清除指定选中
    clearKeyChecks: (key) => {
      checkedKeys.value.splice(checkedKeys.value.indexOf(key), 1);
    },
    //清除所有选中
    allClearChecks: () => {
      checkedKeys.value = [];
    },
  });

  watch(
    () => props.checkedKeys,
    () => {
      checkedKeys.value = props.checkedKeys;
    },
  );

  watch(
    () => props.expandedKeys,
    () => {
      expandedKeys.value = props.expandedKeys;
    },
  );

  watch(
    () => props.data,
    () => {
      const datas = [];
      generateList(datas, props.data);
      dataList.value = datas;
    },
    { immediate: true },
  );

  watch(
    () => props.maxHeight,
    () => {
      if (props.maxHeight) {
        maxHeight = props.maxHeight;
        if (maxHeight && props.isShowSearch) {
          maxHeight = props.maxHeight - 32;
        }
      }
    },
    { immediate: true },
  );

  function size() {
    debugger;
    let height = $(`#${id}`).height();
    if (props.isShowSearch) {
      height = height - 34;
    }
    height = maxHeight != undefined ? (height >= maxHeight ? maxHeight : height) : height;
    if (treeHeight.value != height) {
      treeHeight.value = height;
    }
  }

  onMounted(() => {
    //因为ant-tree不支持100%的高度的虚拟滚动。解决方式增加监听赋予父级高度
    size();
    if (props.isOnresize) {
      window.onresize = () => {
        size();
      };
    }
    //加这个主要是设备模型那不知道什么原因$(`#${id}`).height()获取的不对
    useTimeFn(
      setInterval(() => {
        size();
      }, 100),
      timeKey,
      'onMounted',
    );
  });

  onUpdated(() => {
    size();
  });
</script>
<style lang="less" scoped>
  @prefix-cls: ~'@{namespace}-myTree-';

  .@{prefix-cls} {
    width: 100%;
    height: 100%;

    .show {
      background-color: #2e74ffce;
    }

    .danXuan {
      :deep(.ant-tree-checkbox-inner) {
        //单选样式
        border-radius: 10px;
      }
    }

    :deep(.ant-tree-iconEle) {
      margin-left: -14px;
      margin-top: -4px;
    }

    :deep(.ant-tree-title) {
      margin-left: 3px;
      display: inline-block;
    }
  }
</style>
