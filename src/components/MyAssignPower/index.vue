<template>
  <a-drawer
    v-if="powerType != ''"
    :headerStyle="{ height: '49px', borderBottom: '2px solid #eee' }"
    :width="620"
    :open="visible"
    :title="props.isRead ? t('view.viewAction') : t('view.configuration')"
    :body-style="{ padding: '0' }"
    :footer-style="{ textAlign: 'right' }"
    @close="formClose"
  >
    <div style="display: none; width: 100px; height: 100px" id="dadadaddaad"></div>
    <a-spin :tip="lodingTile" :spinning="isGetTree">
      <a-tabs
        tab-position="left"
        :activeKey="tabsActiveKey"
        @change="tablChange"
        :tabBarStyle="{ height: '100%' }"
        :class="`${prefixCls}content-bar`"
        :id="id"
      >
        <a-tab-pane key="menu" :tab="t('view.menuPage')">
          <div :style="{ width: '100%', height: '100%' }">
            <a-row>
              <a-col :flex="auto" style="padding: 0 2px 0 0">
                <a-radio-group
                  v-model:value="treeAllSelectValue"
                  button-style="solid"
                  v-show="!props.isRead"
                >
                  <a-radio-button @click="treeAllClick(1)" :value="1">{{
                    t('view.selectAll')
                  }}</a-radio-button>
                  <a-radio-button @click="treeAllClick(0)" :value="0">{{
                    t('view.cancel')
                  }}</a-radio-button>
                </a-radio-group>
              </a-col>
              <a-col :flex="10" style="padding: 0">
                <a-input-search v-model:value="menuSearchContent" :placeholder="t('view.search')" />
              </a-col>
            </a-row>
            <a-tree
              :checkedKeys="menuTreeChecnk"
              :checkStrictly="true"
              :disabled="props.isRead"
              :height="treeHeight"
              :checkable="true"
              :tree-data="menuTreeData"
              v-model:expandedKeys="menuExpandedKeys"
              @check="(checkedKeys, e) => treeCheck(checkedKeys, e)"
            >
              <template #title="node">
                <!-- 节点插槽 -->
                <div :class="`${prefixCls}custom`">
                  <span
                    v-if="node?.title?.indexOf(menuSearchContent) > -1"
                    @click="treeTitleClick(node)"
                  >
                    {{ node.title.substr(0, node.title.indexOf(menuSearchContent)) }}
                    <span style="color: #f50">{{ menuSearchContent }}</span>
                    {{
                      node.title.substr(
                        node.title.indexOf(menuSearchContent) + menuSearchContent.length,
                      )
                    }}
                  </span>
                  <span v-else @click="treeTitleClick(node)">{{ node.title }}</span>
                  <span :class="`${prefixCls}option`">
                    <!-- 节点后的操作按钮 -->
                    <span :class="{ 'option-read': props.isRead }">
                      <a-checkbox-group :value="node.powerType.split(',')" name="checkboxgroup">
                        <a-checkbox
                          :disabled="props.isRead"
                          @dblclick="changeChildren(item.value, node)"
                          @click="operationChange(item.value, node)"
                          v-for="(item, i) in menuOptions[
                            node.menuType == 7 ? 'btn' : node.isSystem ? 'sys' : 'nosys'
                          ]"
                          :key="i"
                          :value="item.value"
                          ><span
                            @dblclick="changeChildren(item.value, node)"
                            @click="operationChange(item.value, node)"
                            >{{ item.label }}</span
                          ></a-checkbox
                        >
                      </a-checkbox-group>
                    </span>
                  </span>
                </div>
              </template>
            </a-tree>
          </div>
        </a-tab-pane>
      </a-tabs>
    </a-spin>
    <template #footer>
      <div style="position: relative; height: 50px">
        <span
          v-show="!props.isRead"
          style="position: absolute; top: 35px; left: 25px; color: red"
          >{{ t('view.noteAllPermissionsIncludeDisplayPermission') }}</span
        >
        <a-space>
          <a-spin :spinning="isGetTree">
            <a-button
              v-show="!props.isRead"
              type="primary"
              style="margin-left: 8px"
              @click="savePower(false)"
              >{{ t('view.savePagePermissions') }}</a-button
            >
          </a-spin>
          <a-button style="margin-left: 8px" @click="formClose">{{ t('view.close') }}</a-button>
        </a-space>
      </div>
    </template>
  </a-drawer>
</template>
<script setup>
  import { ref, reactive, createVNode, nextTick, watch, onMounted, onUpdated } from 'vue';
  import { useDesign } from '@/hooks/web/useDesign';
  import roleApi from '@/api/role';
  import userApi from '@/api/user';
  import { message, Modal } from 'ant-design-vue';
  import { ExclamationCircleOutlined } from '@ant-design/icons-vue';
  import { useI18n } from '@/hooks/web/useI18n';
  import { useLocaleStore } from '@/store/modules/locale';

  const { t } = useI18n();
  const localeStore = useLocaleStore();
  const locale = localeStore.getLocale;
  const props = defineProps({
    isShow: {
      type: Boolean,
      default() {
        return false;
      },
    },
    userId: {
      type: String,
      default() {
        return null;
      },
    },
    roleId: {
      type: String,
      default() {
        return null;
      },
    },
    //是否只读，用户权限使用
    isRead: {
      type: Boolean,
      default() {
        return false;
      },
    },
  });
  const powerType = props.userId ? 'user' : props.roleId ? 'role' : '';
  if (powerType == '') {
    message.warning(t('view.parametersNotSatisfied'));
  }
  const { prefixCls } = useDesign('AssignPower-');
  const treeHeight = ref(10);
  const id = myCommon.uniqueId();
  const tabsActiveKey = ref('menu');
  const visible = ref(false);
  const treeAllSelectValue = ref(null);

  const menuTreeData = ref([]);
  const menuExpandedKeys = ref([]);
  const menuOptions = {
    sys: [
      // { label: t('view.all'), value: '1' },
      { label: t('view.menuDisplay'), value: '5' },
      // { label: t('view.edit'), value: '2' },
      // { label: t('view.delete'), value: '4' },
      // { label: t('view.addSubset'), value: '3' },
    ],
    nosys: [
      // { label: t('view.all'), value: '1' },
      { label: t('view.menuDisplay'), value: '5' },
      // { label: t('view.edit'), value: '2' },
      // { label: t('view.delete'), value: '4' },
      // { label: t('view.addSubset'), value: '3' },
    ],
    btn: [
      // { label: t('view.all'), value: '1' },
      { label: t('view.btnDisplay'), value: '5' },
      { label: t('view.clickAction'), value: '9' },
    ],
  };
  const menuSearchContent = ref('');
  const menuTreeChecnk = ref([]);

  const deviceTagTreeData = ref([]);
  const deviceTagExpandedKeys = ref([]);
  const deviceTagOptions = {
    device: [
      { label: t('view.all'), value: '1' },
      { label: t('view.display'), value: '5' },
      { label: t('view.edit'), value: '2' },
      { label: t('view.delete'), value: '4' },
    ],
    tag: [
      { label: t('view.all'), value: '1' },
      { label: t('view.display'), value: '5' },
      { label: t('view.edit'), value: '2' },
      { label: t('view.delete'), value: '4' },
      { label: '指令', value: '6' },
    ],
  };
  const deviceTagSearchContent = ref('');

  const flowcontrolTreeData = ref([]);
  const flowcontrolExpandedKeys = ref([]);
  const flowcontrolOptions = [
    { label: t('view.all'), value: '1' },
    { label: t('view.display'), value: '5' },
    { label: t('view.edit'), value: '2' },
    { label: t('view.delete'), value: '4' },
    { label: '启动', value: '7' },
    { label: '停止', value: '8' },
  ];
  const flowcontrolSearchContent = ref('');

  const parameterTreeData = ref([]);
  const parameterOptions = [
    { label: t('view.all'), value: '1' },
    { label: t('view.display'), value: '5' },
    { label: t('view.edit'), value: '2' },
    { label: t('view.delete'), value: '4' },
    { label: '添加子参数', value: '3' },
  ];
  const parameterExpandedKeys = ref([]);
  const parameterSearchContent = ref('');

  const businessTreeData = ref([]);
  const businessOptions = [
    { label: t('view.all'), value: '1' },
    { label: t('view.display'), value: '5' },
    { label: t('view.edit'), value: '2' },
    { label: t('view.delete'), value: '4' },
    { label: '添加子模型', value: '3' },
  ];
  const businessExpandedKeys = ref([]);
  const businessSearchContent = ref('');

  const isGetTree = ref(true);
  const tttt = t('view.getting');
  const lodingTile = ref(tttt);
  //单击节点文字选中和折叠展开实现
  function treeTitleClick(node) {
    if (node.children.length > 0 || (node.isLeaf != undefined && !node.isLeaf)) {
      switch (tabsActiveKey.value) {
        case 'menu':
          if (node.expanded) {
            menuExpandedKeys.value.splice(menuExpandedKeys.value.indexOf(node.key), 1);
          } else {
            menuExpandedKeys.value.push(node.key);
          }
          break;
        case 'deviceTag':
          if (node.expanded) {
            deviceTagExpandedKeys.value.splice(deviceTagExpandedKeys.value.indexOf(node.key), 1);
          } else {
            deviceTagExpandedKeys.value.push(node.key);
          }
          break;
        case 'flowcontrol':
          if (node.expanded) {
            flowcontrolExpandedKeys.value.splice(
              flowcontrolExpandedKeys.value.indexOf(node.key),
              1,
            );
          } else {
            flowcontrolExpandedKeys.value.push(node.key);
          }
          break;
        case 'parameter':
          if (node.expanded) {
            parameterExpandedKeys.value.splice(parameterExpandedKeys.value.indexOf(node.key), 1);
          } else {
            parameterExpandedKeys.value.push(node.key);
          }
          break;
        case 'business':
          if (node.expanded) {
            businessExpandedKeys.value.splice(businessExpandedKeys.value.indexOf(node.key), 1);
          } else {
            businessExpandedKeys.value.push(node.key);
          }
          break;
      }
    }
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

  //操作按钮点击
  let clickTime = -9999; //解决click和dbclick
  function operationChange(value, node) {
    clearTimeout(clickTime);
    if (!props.isRead) {
      clickTime = setTimeout(() => {
        //因为change在树中触发不了，只能用cliclk代替
        let node_;
        //直接更改node.powerType触发不了更新
        switch (tabsActiveKey.value) {
          case 'menu':
            node_ = myCommon.arrayFindOb(menuTreeData.value, node.key, 'key', 'children');
            break;
          case 'deviceTag':
            node_ = myCommon.arrayFindOb(deviceTagTreeData.value, node.key, 'key', 'children');
            break;
          case 'flowcontrol':
            node_ = myCommon.arrayFindOb(flowcontrolTreeData.value, node.key, 'key', 'children');
            break;
          case 'parameter':
            node_ = myCommon.arrayFindOb(parameterTreeData.value, node.key, 'key', 'children');
            break;
          case 'business':
            node_ = myCommon.arrayFindOb(businessTreeData.value, node.key, 'key', 'children');
            break;
        }
        const index = node_.powerType.split(',').indexOf(value);
        if (index == -1) {
          //选中
          if (node_.powerType == '') {
            node_.powerType = `${value}`;
          } else {
            node_.powerType = `${node_.powerType},${value}`;
          }
          if (menuTreeChecnk.value.indexOf(node_.key) == -1) {
            menuTreeChecnk.value.push(node_.key);
          }
        } else {
          //取消选中
          const ps = node_.powerType.split(',');
          ps.splice(index, 1);
          node_.powerType = ps.join(',');
          if (node_.powerType == '') {
            const ii = menuTreeChecnk.value.indexOf(node_.key);
            if (ii != -1) {
              menuTreeChecnk.value.splice(ii, 1);
            }
          }
        }
      }, 300);
    }
  }

  //双击权限项，更改node的全部子集对应的权限项
  function changeChildren(value, node) {
    clearTimeout(clickTime);
    const index = node.powerType.split(',').indexOf(value);
    treeCheckChange(index == -1, value, node.key, true);
  }

  //树的全选和取消
  function treeAllClick(value) {
    // menuTreeChecnk.value = [];
    treeCheckChange(value == 1, 1, 'all');
  }

  //点击树的复选框
  function treeCheck(checkedKeys, e) {
    treeCheckChange(e.checked, 1, e.node.key);
  }

  //操作节点的check
  function treeCheckChange(isChecked, value, key, isPowerDbClick = false) {
    if (!props.isRead) {
      switch (tabsActiveKey.value) {
        case 'menu':
          if (key == 'all') {
            treeCheckChange_(isChecked, value, menuTreeData.value, isPowerDbClick);
          } else {
            treeCheckChange_(
              isChecked,
              value,
              [myCommon.arrayFindOb(menuTreeData.value, key, 'key', 'children')],
              isPowerDbClick,
            );
          }
          break;
        case 'deviceTag':
          break;
        case 'flowcontrol':
          break;
        case 'parameter':
          break;
        case 'business':
          break;
      }
    }
  }
  function treeCheckChange_(isChecked, value, nodes, isPowerDbClick = false) {
    switch (tabsActiveKey.value) {
      case 'menu':
        if (isChecked) {
          nodes.forEach((item) => {
            if (isPowerDbClick) {
              const pt = item.powerType == '' ? [] : item.powerType.split(',');
              if (pt.indexOf(value) == -1) {
                pt.push(value);
                item.powerType = pt.join(',');
              }
            } else {
              if (item.menuType == 7) {
                item.powerType = '1,5,9';
              } else {
                item.powerType = '1,2,3,4,5';
              }
            }
            if (menuTreeChecnk.value.indexOf(item.key) == -1) {
              menuTreeChecnk.value.push(item.key);
            }
            if (item.children.length > 0) {
              treeCheckChange_(isChecked, value, item.children, isPowerDbClick);
            }
          });
        } else {
          nodes.forEach((item) => {
            if (isPowerDbClick) {
              const pt = item.powerType.split(',');
              if (pt.indexOf(value) != -1) {
                pt.splice(pt.indexOf(value), 1);
                item.powerType = pt.join(',');
              }
            } else {
              item.powerType = '';
            }
            if (item.powerType == '') {
              menuTreeChecnk.value = menuTreeChecnk.value.filter((m) => m != item.key);
            }
            if (item.children.length > 0) {
              treeCheckChange_(isChecked, value, item.children, isPowerDbClick);
            }
          });
        }
        break;
      case 'deviceTag':
        break;
      case 'flowcontrol':
        break;
      case 'parameter':
        break;
      case 'business':
        break;
    }
  }

  //获取权限数据
  function getTreeData() {
    if (
      (tabsActiveKey.value == 'menu' && menuTreeData.value.length == 0) ||
      (tabsActiveKey.value == 'deviceTag' && deviceTagTreeData.value.length == 0) ||
      (tabsActiveKey.value == 'flowcontrol' && flowcontrolTreeData.value.length == 0) ||
      (tabsActiveKey.value == 'parameter' && parameterTreeData.value.length == 0) ||
      (tabsActiveKey.value == 'business' && businessTreeData.value.length == 0)
    ) {
      if (props.userId != null) {
        lodingTile.value = tttt;
        isGetTree.value = true;
        if (props.isRead) {
          getUserAllPower();
        } else {
          userApi
            .GetUserAssignPower({
              PowerType: tabsActiveKey.value,
              UserId: props.userId,
              execompleteBefore: () => {
                isGetTree.value = false;
              },
            })
            .then((data) => {
              switch (tabsActiveKey.value) {
                case 'menu':
                  menuTreeData.value = data;
                  break;
                case 'deviceTag':
                  deviceTagTreeData.value = data;
                  break;
                case 'flowcontrol':
                  flowcontrolTreeData.value = data;
                  break;
                case 'parameter':
                  parameterTreeData.value = data;
                  break;
                case 'business':
                  businessTreeData.value = data;
                  break;
              }
              generateList(data);
            })
            .catch(() => {
              switch (tabsActiveKey.value) {
                case 'menu':
                  menuTreeData.value = [];
                  menu_dataList = [];
                  break;
                case 'deviceTag':
                  deviceTagTreeData.value = [];
                  deviceTag_dataList = [];
                  break;
                case 'flowcontrol':
                  flowcontrolTreeData.value = [];
                  flowcontrol_dataList = [];
                  break;
                case 'parameter':
                  parameterTreeData.value = [];
                  parameter_dataList = [];
                  break;
                case 'business':
                  businessTreeData.value = [];
                  business_dataList = [];
                  break;
              }
            });
        }
      } else if (props.roleId != null) {
        lodingTile.value = tttt;
        isGetTree.value = true;
        roleApi
          .GetRoleAssignPower({
            PowerType: tabsActiveKey.value,
            RoleId: props.roleId,
            execompleteBefore: () => {
              isGetTree.value = false;
            },
          })
          .then((data) => {
            switch (tabsActiveKey.value) {
              case 'menu':
                menuTreeData.value = data;
                break;
              case 'deviceTag':
                deviceTagTreeData.value = data;
                break;
              case 'flowcontrol':
                flowcontrolTreeData.value = data;
                break;
              case 'parameter':
                parameterTreeData.value = data;
                break;
              case 'business':
                businessTreeData.value = data;
                break;
            }
            generateList(data);
          })
          .catch(() => {
            switch (tabsActiveKey.value) {
              case 'menu':
                menuTreeData.value = [];
                menu_dataList = [];
                break;
              case 'deviceTag':
                deviceTagTreeData.value = [];
                deviceTag_dataList = [];
                break;
              case 'flowcontrol':
                flowcontrolTreeData.value = [];
                flowcontrol_dataList = [];
                break;
              case 'parameter':
                parameterTreeData.value = [];
                parameter_dataList = [];
                break;
              case 'business':
                businessTreeData.value = [];
                business_dataList = [];
                break;
            }
          });
      } else {
        message.warning(t('view.parametersNotSatisfied'));
      }
    }
  }

  //搜索
  let menu_dataList = [];
  let menu_expandeds = [];
  //备份展开节点，清除回复展开
  let menu_backExpandedKeys = [];
  let menu_isBack = false;
  let deviceTag_dataList = [];
  let deviceTag_expandeds = [];
  let deviceTag_backExpandedKeys = [];
  let deviceTag_isBack = false;
  let flowcontrol_dataList = [];
  let flowcontrol_expandeds = [];
  let flowcontrol_backExpandedKeys = [];
  let flowcontrol_isBack = false;
  let parameter_dataList = [];
  let parameter_expandeds = [];
  let parameter_backExpandedKeys = [];
  let parameter_isBack = false;
  let business_dataList = [];
  let business_expandeds = [];
  let business_backExpandedKeys = [];
  let business_isBack = false;

  //转换为普通表数据
  const generateList = (data) => {
    for (let i = 0; i < data.length; i++) {
      const node = data[i];
      const key = node.key;
      const title = node.title;
      const parentId = node.parentId;
      const powerType = node.powerType;
      switch (tabsActiveKey.value) {
        case 'menu':
          menu_dataList.push({ key, title, parentId, powerType });
          //增加节点的选中框数据
          if (powerType != '') {
            menuTreeChecnk.value.push(key);
          }
          break;
        case 'deviceTag':
          deviceTag_dataList.push({ key, title, parentId, powerType });
          break;
        case 'flowcontrol':
          flowcontrol_dataList.push({ key, title, parentId, powerType });
          break;
        case 'parameter':
          parameter_dataList.push({ key, title, parentId, powerType });
          break;
        case 'business':
          business_dataList.push({ key, title, parentId, powerType });
          break;
      }
      if (node.children) {
        generateList(node.children);
      }
    }
  };
  //获取所有父级主键
  function getParentKey(node) {
    switch (tabsActiveKey.value) {
      case 'menu':
        menu_expandeds.push(node.key);
        break;
      case 'deviceTag':
        deviceTag_expandeds.push(node.key);
        break;
      case 'flowcontrol':
        flowcontrol_expandeds.push(node.key);
        break;
      case 'parameter':
        parameter_expandeds.push(node.key);
        break;
      case 'business':
        business_expandeds.push(node.key);
        break;
    }
    if (node.parentId != '0') {
      let parent;
      switch (tabsActiveKey.value) {
        case 'menu':
          parent = menu_dataList.find((m) => m.key == node.parentId);
          break;
        case 'deviceTag':
          parent = deviceTag_dataList.find((m) => m.key == node.parentId);
          break;
        case 'flowcontrol':
          parent = flowcontrol_dataList.find((m) => m.key == node.parentId);
          break;
        case 'parameter':
          parent = parameter_dataList.find((m) => m.key == node.parentId);
          break;
        case 'business':
          parent = business_dataList.find((m) => m.key == node.parentId);
          break;
      }
      getParentKey(parent);
    }
  }
  watch(menuSearchContent, (value) => {
    menu_expandeds = [];
    if (!menu_isBack) {
      menu_isBack = true;
      menu_backExpandedKeys = menuExpandedKeys.value;
    }
    if (value != '') {
      menu_dataList.map((item) => {
        if (item.title.indexOf(value) > -1) {
          getParentKey(item);
        }
      });
      menu_expandeds = menu_expandeds.filter((item, i, self) => item && self.indexOf(item) === i);
    }
    menuExpandedKeys.value = menu_expandeds;
  });
  watch(deviceTagSearchContent, (value) => {
    deviceTag_expandeds = [];
    if (!deviceTag_isBack) {
      deviceTag_isBack = true;
      deviceTag_expandeds = deviceTagExpandedKeys.value;
    }
    if (value != '') {
      deviceTag_dataList.map((item) => {
        if (item.title.indexOf(value) > -1) {
          getParentKey(item);
        }
      });
      deviceTag_expandeds = deviceTag_expandeds.filter(
        (item, i, self) => item && self.indexOf(item) === i,
      );
    }
    deviceTagExpandedKeys.value = deviceTag_expandeds;
  });
  watch(flowcontrolSearchContent, (value) => {
    flowcontrol_expandeds = [];
    if (!flowcontrol_isBack) {
      flowcontrol_isBack = true;
      flowcontrol_backExpandedKeys = flowcontrolExpandedKeys.value;
    }
    if (value != '') {
      flowcontrol_dataList.map((item) => {
        if (item.title.indexOf(value) > -1) {
          getParentKey(item);
        }
      });
      flowcontrol_expandeds = flowcontrol_expandeds.filter(
        (item, i, self) => item && self.indexOf(item) === i,
      );
    }
    flowcontrolExpandedKeys.value = flowcontrol_expandeds;
  });
  watch(parameterSearchContent, (value) => {
    parameter_expandeds = [];
    if (!parameter_isBack) {
      parameter_isBack = true;
      parameter_backExpandedKeys = parameterExpandedKeys.value;
    }
    if (value != '') {
      parameter_dataList.map((item) => {
        if (item.title.indexOf(value) > -1) {
          getParentKey(item);
        }
      });
      parameter_expandeds = parameter_expandeds.filter(
        (item, i, self) => item && self.indexOf(item) === i,
      );
    }
    parameterExpandedKeys.value = parameter_expandeds;
  });
  watch(businessSearchContent, (value) => {
    business_expandeds = [];
    if (!business_isBack) {
      business_isBack = true;
      business_backExpandedKeys = businessExpandedKeys.value;
    }
    if (value != '') {
      business_dataList.map((item) => {
        if (item.title.indexOf(value) > -1) {
          getParentKey(item);
        }
      });
      business_expandeds = business_expandeds.filter(
        (item, i, self) => item && self.indexOf(item) === i,
      );
    }
    businessExpandedKeys.value = business_expandeds;
  });
  //还原搜索之前的展开
  watch(
    () => menuExpandedKeys.value,
    () => {
      if (menuSearchContent.value == '' && menu_isBack) {
        menu_isBack = false;
        menuExpandedKeys.value = menu_backExpandedKeys;
        menu_backExpandedKeys = [];
      }
    },
  );
  watch(
    () => deviceTagExpandedKeys.value,
    () => {
      if (deviceTagSearchContent.value == '' && deviceTag_isBack) {
        deviceTag_isBack = false;
        deviceTagExpandedKeys.value = deviceTag_backExpandedKeys;
        deviceTag_backExpandedKeys = [];
      }
    },
  );
  watch(
    () => flowcontrolExpandedKeys.value,
    () => {
      if (flowcontrolSearchContent.value == '' && flowcontrol_isBack) {
        flowcontrol_isBack = false;
        flowcontrolExpandedKeys.value = flowcontrol_backExpandedKeys;
        flowcontrol_backExpandedKeys = [];
      }
    },
  );
  watch(
    () => parameterExpandedKeys.value,
    () => {
      if (parameterSearchContent.value == '' && parameter_isBack) {
        parameter_isBack = false;
        parameterExpandedKeys.value = parameter_backExpandedKeys;
        parameter_backExpandedKeys = [];
      }
    },
  );
  watch(
    () => businessExpandedKeys.value,
    () => {
      if (businessSearchContent.value == '' && business_isBack) {
        business_isBack = false;
        businessExpandedKeys.value = business_backExpandedKeys;
        business_backExpandedKeys = [];
      }
    },
  );
  //搜索

  //关闭权限分配窗口
  function formClose() {
    visible.value = false;
  }

  //标签切换
  function tablChange(key) {
    if (checkIsChanges()) {
      Modal.confirm({
        maskClosable: true,
        title: t('view.youHaveUnsavedPermissionsWhetherToSwitch'),
        icon: createVNode(ExclamationCircleOutlined),
        content: '',
        onOk() {
          savePower(true, key);
        },
        onCancel() {
          tabsActiveKey.value = key;
        },
      });
    } else {
      tabsActiveKey.value = key;
    }
  }

  let isChange = false;
  //检查权限是否发生变化
  function checkIsChanges() {
    isChange = false;
    switch (tabsActiveKey.value) {
      case 'menu':
        checksChanges_(menuTreeData.value, menu_dataList);
        break;
      case 'deviceTag':
        checksChanges_(deviceTagTreeData.value, deviceTag_dataList);
        break;
      case 'flowcontrol':
        checksChanges_(flowcontrolTreeData.value, flowcontrol_dataList);
        break;
      case 'parameter':
        checksChanges_(parameterTreeData.value, parameter_dataList);
        break;
      case 'business':
        checksChanges_(businessTreeData.value, business_dataList);
        break;
    }
    return isChange;
  }
  function checksChanges_(treeData, oldData) {
    if (!isChange) {
      for (let i = 0; i < treeData.length; i++) {
        const oldNode = oldData.find((m) => m.key == treeData[i].key);
        if (oldNode && oldNode.powerType != treeData[i].powerType) {
          isChange = true;
          break;
        }
        if (treeData[i].children.length > 0) {
          checksChanges_(treeData[i].children, oldData);
        }
      }
    }
  }

  let saveDataList = [];
  const generatePower = (data) => {
    for (let i = 0; i < data.length; i++) {
      const node = data[i];
      let tableName;
      switch (tabsActiveKey.value) {
        case 'menu':
          tableName = 'bas_menu';
          break;
        case 'deviceTag':
          if (node.isLeaf) {
            tableName = 'iot_tag_config';
          } else {
            tableName = 'iot_device_config';
          }
          break;
        case 'flowcontrol':
          tableName = 'ser_flowcontrol';
          break;
        case 'parameter':
          tableName = 'bus_parameter';
          break;
        case 'business':
          tableName = 'bus_business_tag';
          break;
      }
      if (node.powerType != '') {
        saveDataList.push({
          powerid: node.key,
          powerType: node.powerType,
          RoleId: props.roleId,
          tableName,
          userId: props.userId,
        });
      }
      if (node.children) {
        generatePower(node.children);
      }
    }
  };

  //保存权限
  function savePower(checked, key) {
    lodingTile.value = t('view.savingNow');
    isGetTree.value = true;
    let isChange = false;
    if (!checked) {
      isChange = checkIsChanges();
    } else {
      isChange = true;
    }
    if (isChange) {
      saveDataList = [];
      generatePower(
        tabsActiveKey.value == 'menu'
          ? menuTreeData.value
          : tabsActiveKey.value == 'deviceTag'
            ? deviceTagTreeData.value
            : tabsActiveKey.value == 'flowcontrol'
              ? flowcontrolTreeData.value
              : tabsActiveKey.value == 'parameter'
                ? parameterTreeData.value
                : tabsActiveKey.value == 'business'
                  ? businessTreeData.value
                  : [],
      );
      if (powerType == 'user') {
        userApi
          .AssignPower({
            userId: props.userId,
            PowerType: tabsActiveKey.value,
            PowerInfos: saveDataList,
          })
          .then((data) => {
            isGetTree.value = false;
            message.success(t('view.saveSuccessful'));
            saveDataList = [];
            switch (tabsActiveKey.value) {
              case 'menu':
                menu_dataList = [];
                generateList(menuTreeData.value);
                break;
              case 'deviceTag':
                deviceTag_dataList = [];
                generateList(deviceTagTreeData.value);
                break;
              case 'flowcontrol':
                flowcontrol_dataList = [];
                generateList(flowcontrolTreeData.value);
                break;
              case 'parameter':
                parameter_dataList = [];
                generateList(parameterTreeData.value);
                break;
              case 'business':
                business_dataList = [];
                generateList(businessTreeData.value);
                break;
            }
            if (key) {
              tabsActiveKey.value = key;
            }
          })
          .catch(() => {
            isGetTree.value = false;
          });
      } else {
        roleApi
          .AssignPower({
            RoleId: props.roleId,
            PowerType: tabsActiveKey.value,
            PowerInfos: saveDataList,
          })
          .then((data) => {
            isGetTree.value = false;
            message.success(t('view.saveSuccessful'));
            saveDataList = [];
            switch (tabsActiveKey.value) {
              case 'menu':
                menu_dataList = [];
                generateList(menuTreeData.value);
                break;
              case 'deviceTag':
                deviceTag_dataList = [];
                generateList(deviceTagTreeData.value);
                break;
              case 'flowcontrol':
                flowcontrol_dataList = [];
                generateList(flowcontrolTreeData.value);
                break;
              case 'parameter':
                parameter_dataList = [];
                generateList(parameterTreeData.value);
                break;
              case 'business':
                business_dataList = [];
                generateList(businessTreeData.value);
                break;
            }
            if (key) {
              tabsActiveKey.value = key;
            }
          })
          .catch(() => {
            isGetTree.value = false;
          });
      }
    } else {
      message.info(t('view.permissionNotChanged'));
      isGetTree.value = false;
    }
  }

  //获取用户只读权限
  function getUserAllPower() {
    lodingTile.value = tttt;
    isGetTree.value = true;
    userApi
      .GetUserAllPower({
        PowerType: tabsActiveKey.value,
        UserId: props.userId,
        execompleteBefore: () => {
          isGetTree.value = false;
        },
      })
      .then((data) => {
        switch (tabsActiveKey.value) {
          case 'menu':
            menuTreeData.value = data;
            break;
          case 'deviceTag':
            deviceTagTreeData.value = data;
            break;
          case 'flowcontrol':
            flowcontrolTreeData.value = data;
            break;
          case 'parameter':
            parameterTreeData.value = data;
            break;
          case 'business':
            businessTreeData.value = data;
            break;
        }
        generateList(data);
      })
      .catch(() => {
        switch (tabsActiveKey.value) {
          case 'menu':
            menuTreeData.value = [];
            menu_dataList = [];
            break;
          case 'deviceTag':
            deviceTagTreeData.value = [];
            deviceTag_dataList = [];
            break;
          case 'flowcontrol':
            flowcontrolTreeData.value = [];
            flowcontrol_dataList = [];
            break;
          case 'parameter':
            parameterTreeData.value = [];
            parameter_dataList = [];
            break;
          case 'business':
            businessTreeData.value = [];
            business_dataList = [];
            break;
        }
      });
  }

  //动态解决tree100%
  function size() {
    let height = $(`#${id}`).height() - 32;
    if (treeHeight.value != height) {
      treeHeight.value = height;
    }
  }

  watch(
    () => props.isShow,
    () => {
      visible.value = props.isShow;
    },
    { immediate: true },
  );

  watch(
    () => visible.value,
    () => {
      if (visible.value) {
        getTreeData();
      }
    },
    { immediate: true },
  );

  watch(
    () => tabsActiveKey.value,
    () => {
      getTreeData();
    },
  );

  onMounted(() => {
    //因为ant-tree不支持100%的高度的虚拟滚动。解决方式增加监听赋予父级高度
    setTimeout(() => {
      size();
    }, 100);
    window.onresize = () => {
      size();
    };
  });

  onUpdated(() => {
    size();
  });
</script>
<style lang="less" scoped>
  @prefixCls: ~'@{namespace}-AssignPower-';

  .option-read {
    :deep(.ant-checkbox-group-item) {
      color: #bfbfbf;
      cursor: not-allowed;
    }

    :deep(.ant-checkbox-input) {
      cursor: not-allowed;
    }
  }

  :deep(.ant-checkbox-wrapper) {
    font-size: 10px;
  }

  :deep(.ant-checkbox-inner) {
    width: 12px;
    height: 12px;
  }

  :deep(.ant-checkbox-group-item) {
    margin-left: 0;

    span:first-child {
      font-size: 12px;
    }

    span:last-child {
      font-size: 12px;
      font-variant: tabular-nums;
      line-height: 1.5715;
    }
  }

  :deep(.ant-checkbox-group) {
    padding-left: 8px;
    background-color: #f7f7f7;

    span:last-child {
      font-size: 12px;
      font-variant: tabular-nums;
      line-height: 1.5715;
    }
  }

  :deep(.ant-tabs-content-holder) {
    height: 100% !important;
    overflow: hidden;
  }

  :deep(.ant-tabs-content-holder) {
    padding: 5px;
  }

  // :deep(.ant-tree-padding) {
  //     padding: 0;
  // }

  // :deep(.ant-tree .ant-tree-treenode) {
  //     padding: 0;
  // }
</style>
