<!--菜单抽屉-->
<template>
  <div :class="`${prefixCls}`" v-if="props.isDrawer" v-show="props.isShow">
    <a-drawer
      :bodyStyle="{ overflow: 'hidden', padding: '10px' }"
      :headerStyle="{ height: '49px', borderBottom: '2px solid #eee' }"
      :width="props.width"
      :visible="props.isShow"
      :title="props.ztitle"
      :footerStyle="props.footerStyle"
      @close="props.cancel"
    >
      <div
        :id="id"
        style="
          width: 100%;
          height: 100%;
          margin: 5px;
          padding: 11px;
          padding-top: 10px;
          border: 1px solid #f0f0f0;
        "
      >
        <a-spin tip="加载中..." :spinning="isGetTree || isGetMenuInfo">
          <div style="width: 100%" v-if="props.isShowSearch">
            <a-input-search
              v-model:value="searchContent"
              placeholder="搜索"
              :style="
                props.isEdit ? { width: 'calc(100% - 50px)' } : { width: 'calc(100% - 30px)' }
              "
            />
            <IconFontClass
              v-if="props.isEdit"
              name="icon-baseui-add"
              title="新增根菜单"
              :style="{ fontSize: '29px' }"
              @click="showMenuForm('add', node)"
            />
            <IconFontClass
              name="icon-baseui-redo"
              title="刷新菜单"
              :style="{ fontSize: '21px', position: 'relative', top: '-3px' }"
              @click="getTreeData"
            />
          </div>
          <div :class="{ danXuan: props.isRadio }" style="width: 100%; height: 100%">
            <a-tree
              :height="treeHeight"
              :checkable="props.checkable"
              :checkStrictly="true"
              :tree-data="treeData"
              :checkedKeys="checkedKeys"
              v-model:expandedKeys="expandedKeys"
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
                    {{
                      node.title.substr(node.title.indexOf(searchContent) + searchContent.length)
                    }}
                  </span>
                  <span v-else @click="treeTitleClick(node)">{{ node.title }}</span>
                  <span :class="`${prefixCls}option`" style="display: none">
                    <IconFontClass
                      v-if="props.isEdit"
                      :class="{
                        'not-click':
                          !userData.isAdmin &&
                          node.powerType.indexOf('3') == -1 &&
                          node.powerType.indexOf('1') == -1,
                      }"
                      name="icon-baseui-tianjiawukuang"
                      title="添加子菜单"
                      style="color: #10893e"
                      @click="showMenuForm('add', node)"
                    />
                    <IconFontClass
                      v-if="props.isEdit"
                      :class="{
                        'not-click':
                          !userData.isAdmin &&
                          node.powerType.indexOf('2') == -1 &&
                          node.powerType.indexOf('1') == -1,
                      }"
                      name="icon-baseui-edit-fill"
                      title="编辑"
                      style="color: #0a61bd"
                      @click="showMenuForm('edit', node)"
                    />
                    <IconFontClass
                      v-if="props.isEdit"
                      :class="{
                        'not-click':
                          node.children.length > 0 ||
                          (!userData.isAdmin &&
                            node.powerType.indexOf('4') == -1 &&
                            node.powerType.indexOf('1') == -1),
                      }"
                      name="icon-baseui-guanbicuowu"
                      title="删除"
                      style="color: red"
                      @click="removeMenu(node)"
                    />
                  </span>
                </div>
              </template>
            </a-tree>
          </div>
        </a-spin>
      </div>
      <template #footer>
        <slot name="footer_"></slot>
      </template>
    </a-drawer>
  </div>
  <menuConfig
    :fromData="menuFromData"
    :isShow="isShowMenuFrom"
    :width="400"
    :cancel="myCancel"
    :ztitle="'菜单配置'"
  >
    <template #footer_>
      <a-spin tip="正在保存配置..." :spinning="isRunSaveMenuInfo">
        <a-button type="primary" @click="saveMenu">保存</a-button>
        <a-button style="margin-left: 8px" @click="cancelMenuFrom">关闭</a-button>
      </a-spin>
    </template>
  </menuConfig>
</template>
<script setup>
  import { message, Modal } from 'ant-design-vue';
  import menuConfig from './src/menuConfig.vue';
  import menuApi from '@/api/menu';
  import { useDesign } from '@/hooks/web/useDesign';
  import { ref, reactive, createVNode, nextTick, onMounted, watch, onUpdated } from 'vue';
  import { ExclamationCircleOutlined } from '@ant-design/icons-vue';
  import { useUserStore } from '@/store/modules/user';
  import { mode } from 'crypto-js';
  //vue3使用defineProps接收传过来的参数
  const props = defineProps({
    //抽屉标题
    ztitle: {
      type: String,
      default() {
        return '保存配置';
      },
    },
    //是否可以编辑
    isEdit: {
      type: Boolean,
      default() {
        return true;
      },
    },
    width: {
      type: Number,
      require: true,
      default() {
        return 500;
      },
    },
    //是否是抽屉状态
    isDrawer: {
      type: Boolean,
      default() {
        return true;
      },
    },
    //抽屉是否显示
    isShow: {
      type: Boolean,
      require: true,
      default() {
        return false;
      },
    },
    //抽屉关闭事件
    cancel: {
      type: Function,
      default() {
        return function () {};
      },
    },
    //默认选中
    checkedIds: {
      type: Array,
      default() {
        return [];
      },
    },
    //菜单类型
    menuType: {
      type: Number,
      default() {
        return null;
      },
    },
    //1(最小宽高，1350&750)、2(最大化)、3(自定义)
    openSizeType: {
      type: Number,
      default() {
        return 1;
      },
    },
    //是否是编辑保存（表单、报表、组态）
    isPageEditing: {
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
    footerStyle: {
      type: Object,
      default() {
        return { textAlign: 'right' };
      },
    },
  });
  const userStore = useUserStore();
  const userData = ref(_.cloneDeep(userStore.getUserInfo));
  const id = myCommon.uniqueId();
  const { prefixCls } = useDesign('menuTree-');
  const treeHeight = ref(500);
  const emits = defineEmits(['check']);
  const isGetTree = ref(true);
  const isGetMenuInfo = ref(false);
  //备份展开节点，清除回复展开
  let backExpandedKeys = [];
  let isBack = false;
  //展开的节点
  const expandedKeys = ref(props.expandedKeys);
  //选中的节点
  const checkedKeys = ref(props.checkedKeys);
  //树数据
  const treeData = ref([]);
  //搜索值
  const searchContent = ref('');
  const isShowMenuFrom = ref(false);
  const menuFromDef = {
    menuName: '',
    menuIcon: 'icon-baseui-biaodan',
    parentId: null,
    orderIndex: null,
    isDesktop: true,
    isMobile: false,
    menuType: props.menuType,
    openSizeType: props.openSizeType,
    openWidth: 1365,
    openHeight: 750,
    isValid: true,
  };
  const menuFromData = ref(_.cloneDeep(menuFromDef));
  const isRunSaveMenuInfo = ref(false);
  const saveType = ref('');

  //关闭菜单树
  function myCancel() {
    isShowMenuFrom.value = false;
  }

  //关闭表单配置
  function cancelMenuFrom() {
    isShowMenuFrom.value = false;
  }

  //显示菜单配置
  function showMenuForm(type, node) {
    menuFromData.value = _.cloneDeep(menuFromDef);
    saveType.value = type;
    if (saveType.value == 'edit') {
      getMenuInfo(node);
    } else if (node) {
      menuFromData.value.parentId = node.key;
    }
    isShowMenuFrom.value = true;
  }

  //获取指定类型菜单
  function getMenuInfo(node) {
    isGetMenuInfo.value = true;
    menuApi
      .GetMenu(node.key)
      .then((data) => {
        isGetMenuInfo.value = false;
        data.parentId = data.parentId == 0 ? null : data.parentId;
        menuFromData.value = data;
      })
      .catch(() => {
        isGetMenuInfo.value = false;
      });
  }

  //保存菜单
  function saveMenu() {
    isRunSaveMenuInfo.value = true;
    menuFromData.value['execompleteBefore'] = () => {
      isRunSaveMenuInfo.value = false;
      isShowMenuFrom.value = false;
    };
    const d = _.cloneDeep(menuFromData.value);
    d.parentId = d.parentId == null ? 0 : d.parentId;
    if (menuFromData.value.menuId != undefined) {
      menuApi.UpdateMenu(d).then((data) => {
        // const node = myCommon.arrayFindOb(treeData.value, data.menuId, 'key', 'children');
        // node.title = data.menuName;
        getTreeData();
      });
    } else {
      menuApi
        .AddMenu(d)
        .then((data) => {
          getTreeData();
          // const newMode = Object.assign(data, {
          //   key: data.menuId,
          //   parentId: d.parentId,
          //   title: data.menuName,
          //   powerType: data.powerType,
          //   children: [],
          // });
          // dataList.push(newMode);
          // debugger;
          // if (data.parentId == 0) {
          //   treeData.value.push(newMode);
          // } else {
          //   const parent = myCommon.arrayFindOb(treeData.value, data.parentId, 'key', 'children');
          //   parent.children.push(newMode);
          // }
          // if (checkedKeys.value.length == 0) {
          //   checkedKeys.value.push(data.menuId);
          // }
        })
        .catch(() => {
          isRunSaveMenuInfo.value = false;
        });
    }
  }

  //删除菜单
  function removeMenu(node) {
    Modal.confirm({
      maskClosable: true,
      title: '是否删除该菜单?',
      icon: createVNode(ExclamationCircleOutlined),
      content: '',
      onOk() {
        menuApi.DeleteMenu(node.key).then((data) => {
          debugger;
          message.success('删除菜单成功');
          if (node.parentId == 0 || node.parentId == null) {
            treeData.value = treeData.value.filter((m) => m.key != node.key);
          } else {
            const parent = myCommon.arrayFindOb(treeData.value, node.parentId, 'key', 'children');
            parent.children = parent.children.filter((m) => m.key != node.key);
          }
        });
      },
      onCancel() {},
    });
  }

  //获取树节点
  function getTreeData() {
    isGetTree.value = true;
    menuApi
      .GetMenuTree({
        MenuType: [props.menuType],
        execompleteBefore: () => {
          isGetTree.value = false;
        },
      })
      .then((data) => {
        treeData.value = data;
        // generateList(treeData.value);
      })
      .catch(() => {
        treeData.value = [];
        dataList = [];
      });
  }

  //显示树操作按钮
  function treeTitleMousemove(event) {
    treeTitleMouseout(event);
    if ($(event.target).hasClass(`${prefixCls}custom`)) {
      $(event.target).find(`.${prefixCls}option`).show();
    } else {
      $(event.target).parents(`.${prefixCls}custom`).find(`.${prefixCls}option`).show();
    }
    $(event.target).parents(`.ant-tree-treenode`).addClass('ant-tree-padding');
  }
  //隐藏树操作按钮
  function treeTitleMouseout(event) {
    $(`.${prefixCls}option`).hide();
    $(event.target).parents(`.ant-tree-treenode`).removeClass('ant-tree-padding');
  }

  //单击节点文字选中和折叠展开实现
  function treeTitleClick(node) {
    if (node.children.length > 0) {
      if (node.expanded) {
        //折叠
        expandedKeys.value = expandedKeys.value.filter((m) => m != node.key);
      } else {
        //我也不知道为啥expandedKeys.value.push(node.key);在抽屉里不行
        const v = expandedKeys.value.filter((m) => m != node.key);
        v.push(node.key);
        expandedKeys.value = v;
      }
    } else {
      chenck(node);
    }
  }

  //点击选框单选实现。注意tree的checkedKeys不要加v-model
  function treeCheck(checkeds, node_) {
    chenck(node_.node);
  }

  //选种和取消
  function chenck(node) {
    if (!node.checked) {
      //选中
      if (
        props.isPageEditing &&
        !userData.value.isAdmin &&
        node.powerType.indexOf('1') == -1 &&
        node.powerType.indexOf('2') == -1
      ) {
        message.warning('您没有编辑该菜单的权限');
      } else {
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
    emits('check', checkedKeys.value, node);
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
  let dataList = [];
  let expandeds = [];
  //转换为普通表数据
  const generateList = (data) => {
    for (let i = 0; i < data.length; i++) {
      const node = data[i];
      const key = node.key;
      const title = node.title;
      const parentId = node.parentId;
      dataList.push({ key, title, parentId });
      if (node.children) {
        generateList(node.children);
      }
    }
  };
  //获取所有父级主键
  function getParentKey(node) {
    expandeds.push(node.key);
    if (node.parentId != '0') {
      const parent = dataList.find((m) => m.key == node.parentId);
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
      dataList.map((item) => {
        if (item.title.indexOf(value) > -1) {
          getParentKey(item);
        }
      });
      expandeds = expandeds.filter((item, i, self) => item && self.indexOf(item) === i);
    }
    expandedKeys.value = expandeds;
  });
  //搜索

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
    () => props.isShow,
    () => {
      if (props.isShow) {
        getTreeData();
      }
    },
    { immediate: true },
  );

  watch(isShowMenuFrom, () => {
    if (!isShowMenuFrom.value) {
      menuFromData.value = menuFromDef;
    }
  });

  function size() {
    //因为ant-tree不支持100%的高度的虚拟滚动。解决方式增加监听赋予父级高度
    let height = $(`#${id}`).height() - 55;
    if (props.isDrawer) {
      height = height - 48;
    }
    if (props.isShowSearch) {
      height = height - 32;
    }
    if (height > 0 && treeHeight.value != height) {
      treeHeight.value = height;
    }
  }

  onMounted(() => {
    size();
    window.onresize = () => {
      size();
    };
  });

  onUpdated(() => {
    //调用者的样式调整
    size();
  });

  defineExpose({
    //获取选中
    getChecks: () => {
      return checkedKeys.value;
    },
    //获取选中的nodes
    getCheckNodes: () => {
      return dataList.filter((m) => checkedKeys.value.includes(m.key));
    },
    //根据key获取node
    getKeyNode: (key) => {
      return dataList.find((m) => m.key == key);
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
</script>
<style lang="less" scoped>
  @prefix-cls: ~'@{namespace}-menuTree-';

  .@{prefix-cls} {
    width: 100%;
    height: 100%;
  }

  :deep(.ant-tree) {
    width: 100%;
    height: 100%;
  }

  .danXuan {
    :deep(.ant-tree-checkbox-inner) {
      //单选样式
      border-radius: 10px;
    }
  }

  .@{prefix-cls}option > i {
    margin-left: 5px;
    font-size: 10px;
  }
</style>
