<template>
  <MyContent
    id="windowsContent"
    :class="`${prefixCls}content`"
    @contextmenu="rightClick()"
    @click="contentClick"
  >
    <a-spin tip="正在获取菜单..." :spinning="isGetMenuTree || isRunGetRightMenu">
      <div
        @contextmenu="rightClick('desktop')"
        class="desktop"
        id="desktopContent"
        :class="{
          taskShow: true,
          taskHide: taskHide,
        }"
      >
        <!-- 桌面菜单图标 -->
        <div
          :title="menu.title"
          @contextmenu="rightClick('desktop_menu', menu)"
          @dblclick="rightClick_menu('open', menu)"
          :class="`${prefixCls}desktop-menu`"
          v-for="(menu, index) in desktopMenu"
          :key="index"
          :style="menu.style"
        >
          <div :title="menu.title">
            <IconFontClass :title="menu.title" :name="menu.menuicon" />
          </div>
          <p>{{ menu.title }}</p>
        </div>
        <!-- 页面打开 -->
        <draggableResizeable
          v-show="isShowPageView && !page.style.isClose && !page.style.isMinSuccess"
          v-for="(page, index) in pageViewConfig"
          :id="`zs${page.key}`"
          :key="index"
          :style="{ zIndex: page.style.zIndex }"
          :parent="true"
          v-model:x="page.style.x"
          v-model:y="page.style.y"
          v-model:w="page.style.w"
          v-model:h="page.style.h"
          v-model:active="page.resize.active"
          :draggable="true"
          :minW="page.resize.minWidth"
          :minH="page.resize.minHeight"
          :resizable="page.resize.isResize"
          @activated="desktopDraggableResizable('activated', page)"
          @deactivated="desktopDraggableResizable('deactivated', page)"
          @drag-start="desktopDraggableResizable('drag-start', page, `zs${page.key}`)"
          @resize-start="desktopDraggableResizable('resize-start', page, `zs${page.key}`)"
          @dragging="desktopDraggableResizable('dragging', page)"
          @resizing="desktopDraggableResizable('resizing', page)"
          @drag-end="desktopDraggableResizable('drag-end', page)"
          @resize-end="desktopDraggableResizable('resize-end', page)"
        >
          <div :class="`${prefixCls}view`">
            <div class="title" :class="`${prefixCls}view-title`">
              <template v-if="page.menutype == 'folder'">
                <div :class="`${prefixCls}view-title-folder`">
                  <IconFontClass name="icon-baseui-folder" />
                  <span
                    @click="folderBackClick(page)"
                    v-show="page.folder.levels.length > 1"
                    :class="`${prefixCls}view-title-folder-level`"
                    >>返回上一级</span
                  >
                  <span
                    :class="`${prefixCls}view-title-folder-level`"
                    v-for="(l, i) in page.folder.levels"
                    :key="i"
                    :title="l.title"
                    @click="rightClick_menu('open', page, l)"
                    >>{{ l.title }}</span
                  >
                </div>
              </template>
              <template v-else>
                <label class="view-title-label" :class="`${prefixCls}view-title-label`">{{
                  page.title
                }}</label>
              </template>
              <div :class="`${prefixCls}view-title-btns`">
                <IconFontClass
                  name="icon-baseui-refresh"
                  v-if="page.menutype != 'folder'"
                  @click="desktopBtnClick('refresh', page)"
                  title="刷新"
                />
                <IconFontClass
                  name="icon-baseui-zhixian"
                  @click="desktopBtnClick('min', page)"
                  title="最小化"
                />
                <template v-if="page.style.isMax">
                  <IconFontClass
                    name="icon-baseui-zuidahua"
                    @click="desktopBtnClick('huanYuan', page)"
                    title="向下还原"
                    v-if="page.style.isMaxSuccess"
                  />
                  <IconFontClass
                    name="icon-baseui-maximize"
                    @click="desktopBtnClick('max', page)"
                    title="最大化"
                    v-else
                  />
                </template>
                <IconFontClass
                  name="icon-baseui-guanbicuowu"
                  @click="desktopBtnClick('close', page)"
                  title="关闭"
                />
              </div>
            </div>
            <div :class="`${prefixCls}view-page`">
              <template v-if="page.menutype == 'folder'">
                <div :style="{ padding: '10px' }">
                  <div
                    :title="l.title"
                    @contextmenu="rightClick('folder_menu', l, page)"
                    @dblclick="rightClick_menu('open', page, l)"
                    :class="`${prefixCls}folder-menu`"
                    v-for="(l, i) in page.folder.levels[page.folder.levels.length - 1].children"
                    :key="i"
                  >
                    <div>
                      <IconFontClass
                        :name="l.children.length > 0 ? 'icon-baseui-folder' : l.menuicon"
                      />
                    </div>
                    <p>{{ l.title }}</p>
                  </div>
                </div>
              </template>
              <template v-else>
                <userInfo :backgroundColor="backgroundColor" v-if="page.menutype == 'userInfo'" />
                <theme
                  v-else-if="page.menutype == 'theme'"
                  :changeUserConfig="changeUserConfig"
                  :userConfig="userConfig"
                />
                <iframe v-else-if="page.menuurl != ''" :src="page.menuurl"></iframe>
                <div v-else>菜单地址为空！</div>
              </template>
            </div>
          </div>
        </draggableResizeable>
      </div>
      <!-- 任务栏 -->
      <div
        id="windowsTaskContent"
        @mousemove="taskbarMousemove"
        @mouseout="taskbarMouseout"
        :class="`${prefixCls}taskbar`"
        v-show="!taskHide"
      >
        <div @click="windowsClick" :class="`${prefixCls}windows`">
          <IconFontClass name="icon-baseui-windows" />
        </div>
        <!-- 搜索框 -->
        <div @click="serachClick" v-if="userConfig.isShowTaskSerach" :class="`${prefixCls}search`">
          <a-input
            :class="`${prefixCls}search-input`"
            v-model:value="searchContent"
            placeholder="输入搜索菜单"
          >
            <template #prefix>
              <IconFontClass name="icon-baseui-sousuo" :style="{ transform: 'rotateY(180deg)' }" />
            </template>
          </a-input>
        </div>
        <!-- 页面打开 -->
        <div
          @contextmenu="rightClick('task')"
          :class="{
            taskShowFrame: true,
            'taskShowFrame-max': !userConfig.isShowTaskSerach,
          }"
        >
          <div
            v-show="!page.style.isClose"
            @contextmenu="rightClick('taskMenu', page)"
            @click="taskMenuClick(page)"
            :style="{ border: page.resize.active ? '1px solid #fff' : 'none' }"
            :class="{
              'task-item': true,
              'task-item-min': page.style.isMinSuccess,
              'task-item-active': page.resize.active,
            }"
            v-for="(page, index) in pageViewConfig"
            :key="index"
          >
            {{ page.title }}
          </div>
        </div>
        <!-- 时间 -->
        <div :class="`${prefixCls}time`">
          <p>{{ new_time.time }}</p>
          <p>{{ new_time.date }}</p>
        </div>
        <!-- 信息 -->
        <div
          :title="msgData.length > 0 ? `有${msgData.length}条通知` : '没有新通知'"
          @click="msgClick"
          :class="`${prefixCls}msg`"
          id="myWindowsMsg"
        >
          <IconFontClass name="icon-baseui-message_fang" />
          <div v-show="msgData.length > 0" :class="{ msg_div: msgData.length > 0 }">{{
            msgData.length > 99 ? '99+' : msgData.length
          }}</div>
        </div>
        <!-- 显示桌面 -->
        <div title="显示桌面" @click="closeClick" :class="`${prefixCls}close`"> </div>
      </div>
      <!-- 任务栏隐藏后的替代品 -->
      <div @mousemove="taskbarShow" :class="`${prefixCls}taskbar-hide`" v-show="taskHide"> </div>
      <!-- windows按钮内容 -->
      <div
        @mousemove="WindowContentMousemove"
        v-show="isShowWindowContent"
        :class="`${prefixCls}windows-content`"
      >
        <div :class="`${prefixCls}sheZhi`">
          <div>
            <IconFontClass name="icon-baseui-geren" @click="userInfoClick" title="个人中心" />
            <IconFontClass name="icon-baseui-shezhi" @click="themeClick" title="个性设置" />
            <IconFontClass name="icon-baseui-suoping" @click="suoPinClick" title="锁屏" />
            <!-- <IconFontClass
              name="icon-baseui-qiehuan"
              @click="qieHuanFengGeClick"
              title="切换系统风格" /> -->
            <IconFontClass name="icon-baseui-guanji" @click="signoutClick" title="退出" />
          </div>
        </div>
        <div :class="`${prefixCls}menu`">
          <a-menu
            @open-change="windowMenuOpenChange"
            theme="dark"
            :style="{ height: '100%', overflow: 'auto' }"
            mode="inline"
          >
            <!-- 菜单遍历的开始 -->
            <template v-for="item in windowMenus">
              <a-menu-item
                @click="rightClick_menu('open', item)"
                @contextmenu="rightClick('windows_menu', item)"
                v-if="!item.children"
                :key="item.key"
              >
                <IconFontClass :name="item.menuicon" :style="{ flontSize: '14px' }" />
                <span :title="item.title" :style="{ marginLeft: '5px' }">{{ item.title }}</span>
              </a-menu-item>
              <sub-menu
                v-else
                :rightClickMenu="rightClick_menu"
                :rightClick="rightClick"
                :key="item.key"
                :menu-info="item"
              />
            </template>
          </a-menu>
        </div>
        <div :class="`${prefixCls}menuLately`">
          <div>最近浏览</div>
        </div>
      </div>
      <!-- 搜素框内容 -->
      <div v-show="isShowSerachContent" :class="`${prefixCls}search-content`">
        <div
          @contextmenu="rightClick('serach_menu', item)"
          @click="rightClick_menu('open', item)"
          v-for="(item, index) in serachMenu"
          :key="index"
        >
          <IconFontClass :name="item.menuicon" />
          <span :title="item.title">{{ item.title }}</span>
        </div>
      </div>
    </a-spin>
    <!-- 信息页面 -->
    <a-drawer
      :mask="false"
      :bodyStyle="{ padding: '0', backgroundColor: backgroundColor }"
      :headerStyle="{ height: '0' }"
      :style="{ height: 'calc(100vh - 40px)', bottom: '40px' }"
      :closable="false"
      width="397px"
      :visible="isShowMsg"
      @close="msgClose"
    >
      <div :class="`${prefixCls}msg-content`">
        <div @click="removMsgClick"> 全部清除 </div>
        <div>
          <div v-for="(item, index) in msgData" :key="index" @click="msgItemClick(item)">
            <div>
              <span>
                {{ item.messagetitle }}
              </span>
              <span>
                {{ item.addtime }}
              </span>
            </div>
            <div>
              {{ item.messagecontent }}
            </div>
          </div>
        </div>
      </div>
    </a-drawer>
    <!-- <lock :isShow="isShowSuoPin" pDomId="windowsContent" :jieSuoClick="jieSuoClick" :backgroundImg="backgroundImg" />
    <empower pDomId="windowsContent" /> -->
  </MyContent>
</template>
<script setup>
  import lock from '@/components/MyLockEmpower/lock.vue';
  import empower from '@/components/MyLockEmpower/empower.vue';
  import { ref, onMounted, watch, createVNode, onBeforeMount, nextTick } from 'vue';
  import { useDesign } from '@/hooks/web/useDesign';
  import dayjs from 'dayjs';
  import ContextMenu from '@imengyu/vue3-context-menu';
  import draggableResizeable from 'vue3-draggable-resizable';
  import subMenu from './components/subMenu.vue';
  import userInfo from './components/user.vue';
  import theme from './components/theme.vue';
  import { useAppStore } from '@/store/modules/app';
  import { useUserStore } from '@/store/modules/user';
  import userApi from '@/api/user';
  import menuApi from '@/api/menu';
  import { message, Modal } from 'ant-design-vue';
  import { ExclamationCircleOutlined } from '@ant-design/icons-vue';
  import { createLocalStorage } from '@/utils/cache';
  import { useGo } from '@/hooks/web/usePage';
  import { usePermission } from '@/hooks/web/usePermission';
  import { setAuthCache } from '@/utils/auth';
  import { POWER_MENU_KEY } from '@/enums/cacheEnum';
  //定时器
  import { useTimeFn } from '@/hooks/core/useTime_';

  const go = useGo();
  const ls = createLocalStorage();
  const userStore = useUserStore();
  const userData = ref(_.cloneDeep(userStore.getUserInfo));
  const appStore = useAppStore();
  const projectSetting = appStore.getProjectConfig;
  const { prefixCls } = useDesign('windows-');
  //用户桌面个性化配置
  const userConfig = ref(
    Object.assign(
      {
        //主题色
        themeColor: '#196AA8',
        //背景图
        backgroundImg: 'url(/resource/img/windows/windows_backImg1.png)',
        //自己上传的背景图列表
        backgroundImgUps: [],
        //是否显示任务栏搜素框
        isShowTaskSerach: true,
        //系统风格
        systemStyle: 'windows',
        //是否自动隐藏任务栏
        isAutoHideTask: false,
        //桌面图标大小
        desktopIconSize: 'max',
      },
      JSON.parse(userStore.getUserInfo.systemcustom),
    ),
  );
  ls.set('feiFaGaiBian', 0);
  //主题背景色
  const backgroundColor = ref(userConfig.value.themeColor);
  //背景图
  const backgroundImg = ref(userConfig.value.backgroundImg);
  //当前时间
  const new_time = ref({
    time: dayjs().format('HH:mm'),
    date: dayjs().format('YYYY/MM/DD'),
  });
  //计时器关键字
  const timeKey = `windows_${myCommon.uniqueId()}`;
  //最高菜单层级，桌面菜单层级从100开始
  let maxZindex = 101;
  //是否显示wiodows按钮里的内容
  const isShowWindowContent = ref(false);
  //是否显示搜索内容
  const isShowSerachContent = ref(false);
  //是否显示页面
  const isShowPageView = ref(true);
  //搜索菜单的内容
  const searchContent = ref('');
  //是否展示信息title
  const isShowMsg = ref(false);
  //是否锁屏
  const isShowSuoPin = ref(false);
  //任务栏隐藏
  const taskHide = ref(userConfig.value.isAutoHideTask);
  //多功能右键菜单文字配置
  const rightMenuLabel = ref({
    task: userConfig.value.isAutoHideTask ? '取消自动隐藏任务栏' : '自动隐藏任务栏',
    search: userConfig.value.isShowTaskSerach ? '隐藏搜索' : '显示搜索',
  });

  //桌面菜单配置
  const desktopMenu = ref([]);
  //要显示的页面数据
  const pageViewConfig = ref([]);
  //搜索到的菜单
  const serachMenu = ref([]);
  //提示信息
  const msgData = ref([]);
  //windows按钮里的菜单数据
  const windowMenus = ref([]);
  //数据库菜单树
  const menuTreeData = ref([]);
  //数据库菜单list
  let meuDataList = [];
  //数据库右键菜单配置
  let rightMenus = [];
  //是否正在获取右键菜单配置
  const isRunGetRightMenu = ref(true);
  //是否正在获取菜单
  const isGetMenuTree = ref(true);
  //图标大小控制
  const desktopIconSize = {
    min: {
      width: '70px',
      height: '65px',
      divLineHeight: '45px',
      divHeight: '40px',
      divPaddingTop: '0x',
      iFontSize: '30px',
      pHeight: '16px',
      pFontSize: '12px',
    },
    center: {
      width: '95px',
      height: '95px',
      divLineHeight: '40px',
      divHeight: '47px',
      divPaddingTop: '22px',
      iFontSize: '35px',
      pHeight: '19px',
      pFontSize: '15px',
    },
    max: {
      width: '90px',
      height: '85px',
      divLineHeight: '53px',
      divHeight: '53px',
      divPaddingTop: '0x',
      iFontSize: '45px',
      pHeight: '20px',
      pFontSize: '17px',
    },
  };
  const desktopIconwidth = ref(desktopIconSize[userConfig.value.desktopIconSize].width);
  const desktopIconheight = ref(desktopIconSize[userConfig.value.desktopIconSize].height);
  const desktopIcondivLineHeight = ref(
    desktopIconSize[userConfig.value.desktopIconSize].divLineHeight,
  );
  const desktopIcondivHeight = ref(desktopIconSize[userConfig.value.desktopIconSize].divLineHeight);
  const desktopIcondivPaddingTop = ref(
    desktopIconSize[userConfig.value.desktopIconSize].divPaddingTop,
  );
  const desktopIconiFontSize = ref(desktopIconSize[userConfig.value.desktopIconSize].iFontSize);
  const desktopIconpHeight = ref(desktopIconSize[userConfig.value.desktopIconSize].pHeight);
  const desktopIconpFontSize = ref(desktopIconSize[userConfig.value.desktopIconSize].pFontSize);

  let viewTitleLabelDomId;
  let viewRelease = false;

  timeRefresh();
  getMsg();
  getMenus();
  getRightMenus();

  //已打开桌面菜单一些拖拽更改大小执行事件
  function desktopDraggableResizable(type_, data, domId) {
    switch (type_) {
      case 'drag-start':
      case 'resize-start':
        viewTitleLabelDomId = `#${domId} .view-title-label`;
        viewRelease = true;
        break;
      case 'activated':
        maxZindex += 1;
        data.style.zIndex = maxZindex;
        break;
      case 'resize-end':
        data.style.isMaxSuccess = false;
        break;
      case 'drag-end':
        break;
    }
  }

  //已打开桌面菜单右上角按钮点击
  function desktopBtnClick(type_, data) {
    switch (type_) {
      case 'refresh':
        if (_.isNumber(data.menutype)) {
          const url = _.cloneDeep(data.menuurl);
          data.menuurl = '';
          setTimeout(() => {
            data.menuurl = url;
          }, 100);
        } else {
          const menutype = _.cloneDeep(data.menutype);
          data.menutype = '';
          setTimeout(() => {
            data.menutype = menutype;
          }, 100);
        }
        break;
      case 'min':
        data.style.isMinSuccess = true;
        data.resize.active = false;
        if (['报表设计', '表单设计', '视图建模'].includes(data.title)) {
          getMenus();
        }
        break;
      case 'huanYuan':
        data.style = _.cloneDeep(data.oldStyle);
        setTimeout(() => {
          data.style.x = data.style.x + 0.00000001;
          data.style.y = data.style.y + 0.00000001;
        }, 0);
        break;
      case 'max':
        data.oldStyle = _.cloneDeep(data.style);
        data.style = Object.assign(data.style, {
          w: $('#desktopContent').width(),
          h: $('#desktopContent').height(),
          x: 0,
          y: 0,
          isMaxSuccess: true,
        });
        break;
      case 'close':
        for (let i = pageViewConfig.value.length - 1; i >= 0; i--) {
          if (pageViewConfig.value[i].key == data.key) {
            pageViewConfig.value.splice(i, 1); ////删除引起的长度变化会导致小于该索引的页面重新加载
            // pageViewConfig.value[i].style.isClose = true;////20230819.wq指示先这样
            break;
          }
        }
        if (['报表设计', '表单设计', '视图建模'].includes(data.title)) {
          getMenus();
        }
        break;
    }
    //取消冒泡
    event.stopPropagation();
  }

  //window按钮点击
  function windowsClick() {
    isShowWindowContent.value = !isShowWindowContent.value;
    isShowSerachContent.value = false;
    //取消冒泡
    event.stopPropagation();
  }

  //搜索框点击
  function serachClick() {
    isShowSerachContent.value = true;
    isShowWindowContent.value = false;
    if (serachMenu.value.length == 0 && !myCommon.isnull(searchContent.value)) {
      //刷新菜单，但是搜索框已经有结果
      serachMenu.value = meuDataList.filter(
        (m) => m.title.indexOf(searchContent.value) != -1 && m.children.length == 0,
      );
    }
    //取消冒泡
    event.stopPropagation();
  }

  //显示桌面
  function closeClick() {
    isShowPageView.value = false;
    isShowWindowContent.value = false;
    isShowSerachContent.value = false;
    isShowMsg.value = false;
    //取消冒泡
    event.stopPropagation();
  }

  //总页面点击
  function contentClick() {
    isShowWindowContent.value = false;
    isShowSerachContent.value = false;
    isShowMsg.value = false;
    if (userConfig.value.isAutoHideTask) {
      taskHide.value = true;
    }
  }

  //windows菜单打开改变
  function windowMenuOpenChange() {
    //取消冒泡
    event.stopPropagation();
  }

  //信息点击
  function msgClick() {
    isShowMsg.value = !isShowMsg.value;
    event.stopPropagation();
  }

  //单个信息点击
  function msgItemClick(msg) {}

  //信息框关闭
  function msgClose() {
    isShowMsg.value = false;
    //取消冒泡
    event.stopPropagation();
  }

  //用户中心点击
  function userInfoClick() {
    let up = pageViewConfig.value.find((m) => m.key == 'userInfo');
    pageViewConfig.value.forEach((m) => {
      m.resize.active = false;
    });
    if (up == undefined) {
      up = {
        key: 'userInfo',
        //userInfo为用户中心
        menutype: 'userInfo',
        title: '个人中心',
        resize: {
          //是否活动状态
          active: true,
          //是否能修改大小
          isResize: true,
          //最小宽度
          minWidth: 900,
          //最小高度
          minHeight: 720,
        },
        style: {
          isMax: true,
          //是否显示
          isShow: true,
          //是否已经最大化
          isMaxSuccess: false,
          //是否已经最小化
          isMinSuccess: false,
          //是否已经关闭。因为如果用删除的办法关闭，导致pageViewConfig数组大小更改，小于关闭页面索引的页面会重新加载
          isClose: false,
          x: ($('#desktopContent').width() - 900) / 2,
          //top
          y: ($('#desktopContent').height() - 720) / 2,
          //宽度
          w: 900,
          //高度
          h: 720,
          zIndex: maxZindex + 1,
        },
      };
      pageViewConfig.value.push(up);
    } else {
      up.style.isClose = false;
      up.style.isMinSuccess = false;
      up.resize.active = true;
      up.zIndex = maxZindex + 1;
    }
    isShowWindowContent.value = false;
    event.stopPropagation();
  }

  //主题设置点击
  function themeClick() {
    let up = pageViewConfig.value.find((m) => m.key == 'theme');
    pageViewConfig.value.forEach((m) => {
      m.resize.active = false;
    });
    if (up == undefined) {
      up = {
        key: 'theme',
        menutype: 'theme',
        title: '主题',
        resize: {
          //是否活动状态
          active: true,
          //是否能修改大小
          isResize: true,
          //最小宽度
          minWidth: 900,
          //最小高度
          minHeight: 720,
        },
        style: {
          //是否能最大化
          isMax: true,
          //是否显示
          isShow: true,
          //是否已经最大化
          isMaxSuccess: false,
          //是否已经最小化
          isMinSuccess: false,
          //是否已经关闭。因为如果用删除的办法关闭，导致pageViewConfig数组大小更改，小于关闭页面索引的页面会重新加载
          isClose: false,
          x: ($('#desktopContent').width() - 900) / 2,
          //top
          y: ($('#desktopContent').height() - 720) / 2,
          w: 900,
          h: 720,
          zIndex: maxZindex + 1,
        },
      };
      pageViewConfig.value.push(up);
    } else {
      up.style.isClose = false;
      up.style.isMinSuccess = false;
      up.resize.active = true;
      up.zIndex = maxZindex + 1;
    }
    isShowWindowContent.value = false;
    event.stopPropagation();
  }

  //锁屏点击
  function suoPinClick() {
    isShowSuoPin.value = true;
    isShowWindowContent.value = false;
    event.stopPropagation();
  }

  //切换风格
  function qieHuanFengGeClick() {
    //切换成菜单风格
    appStore.setProjectConfig({
      menuSetting: {
        show: true,
      },
      headerSetting: {
        show: true,
      },
    });
    const { refreshMenu } = usePermission();
    refreshMenu();
    setTimeout(() => {
      go('/userInfo/index');
    }, 200);
  }

  //解锁
  function jieSuoClick() {
    isShowSuoPin.value = false;
  }

  //退出登录点击
  function signoutClick() {
    userStore.confirmLoginOut();
    event.stopPropagation();
  }

  //右键点击事件
  function rightClick(type_, data, page) {
    //阻止系统右键事件
    event.preventDefault();
    let items = [];
    let mf;
    switch (type_) {
      //桌面右键
      case 'desktop':
        items = [
          {
            label: '刷新',
            icon: 'icon-baseui-refresh',
            onClick: () => {
              getMenus();
            },
          },
          {
            label: '图标大小',
            icon: 'icon-baseui-chicundaxiao',
            children: [
              {
                label: '大图标',
                onClick: () => {
                  userConfig.value.desktopIconSize = 'max';
                },
              },
              {
                label: '中等图标',
                onClick: () => {
                  userConfig.value.desktopIconSize = 'center';
                },
              },
              {
                label: '小图标',
                onClick: () => {
                  userConfig.value.desktopIconSize = 'min';
                },
              },
            ],
          },
        ];
        const sys_menu1 = meuDataList.find((m) => m.issystem == true && m.title == '视图建模');
        if (sys_menu1) {
          items.push({
            label: '视图建模',
            icon: 'icon-baseui-pintu',
            onClick: () => {
              rightClick_menu('open', sys_menu1);
            },
          });
        }
        const sys_menu2 = meuDataList.find((m) => m.issystem == true && m.title == '表单设计');
        if (sys_menu2) {
          items.push({
            label: '表单设计',
            icon: 'icon-baseui-biaodan',
            onClick: () => {
              rightClick_menu('open', sys_menu2);
            },
          });
        }
        const sys_menu3 = meuDataList.find((m) => m.issystem == true && m.title == '报表设计');
        if (sys_menu3) {
          items.push({
            label: '报表设计',
            icon: 'icon-baseui-baobiaofenxi',
            onClick: () => {
              rightClick_menu('open', sys_menu3);
            },
          });
        }
        items.push({
          label: '个性化',
          icon: 'icon-baseui-shezhi',
          onClick: () => {
            themeClick();
          },
        });
        items.push({
          label: '个人中心',
          icon: 'icon-baseui-geren',
          onClick: () => {
            userInfoClick();
          },
        });
        break;
      case 'desktop_menu':
      case 'serach_menu':
        //桌面菜单右键&windows图标里菜单右键&搜索菜单右键
        if (data.issystem || data.children.length > 0) {
          items = [
            {
              label: '打开',
              icon: 'icon-baseui-yanjing',
              onClick: () => {
                rightClick_menu('open', data);
              },
            },
          ];
        } else {
          rightOptions(mf, rightMenus, data, items);
        }
        break;
      case 'windows_menu':
        if (data.children == undefined) {
          if (data.issystem) {
            items = [
              {
                label: '打开',
                icon: 'icon-baseui-yanjing',
                onClick: () => {
                  rightClick_menu('open', data);
                },
              },
            ];
          } else {
            rightOptions(mf, rightMenus, data, items);
          }
        }
        break;
      case 'folder_menu':
        if (data.issystem || data.children.length > 0) {
          items = [
            {
              label: '打开',
              icon: 'icon-baseui-yanjing',
              onClick: () => {
                rightClick_menu('open', page, data);
              },
            },
          ];
        } else {
          rightOptions(mf, rightMenus, data, items);
        }
        break;
      case 'taskMenu':
        //任务栏菜单右键
        items = [
          {
            label: '关闭全部',
            onClick: () => {
              pageViewConfig.value.length = 0;
            },
          },
          {
            label: '关闭其他',
            onClick: () => {
              for (let i = pageViewConfig.value.length - 1; i >= 0; i--) {
                if (pageViewConfig.value[i].key != data.key) {
                  pageViewConfig.value.splice(i, 1); //删除引起的长度变化会导致小于该索引的页面重新加载
                  //pageViewConfig.value[i].style.isClose = true;////20230819.wq指示先这样
                }
              }
            },
          },
          {
            label: '关闭窗口',
            icon: 'icon-baseui-guanbicuowu',
            onClick: () => {
              for (let i = pageViewConfig.value.length - 1; i >= 0; i--) {
                if (pageViewConfig.value[i].key == data.key) {
                  pageViewConfig.value.splice(i, 1); ////删除引起的长度变化会导致小于该索引的页面重新加载
                  //pageViewConfig.value[i].style.isClose = true;////20230819.wq指示先这样
                  break;
                }
              }
            },
          },
        ];
        break;
      case 'task':
        //任务栏右键
        items = [
          {
            label: rightMenuLabel.value.search,
            onClick: () => {
              userConfig.value.isShowTaskSerach = !userConfig.value.isShowTaskSerach;
              isShowSerachContent.value = userConfig.value.isShowTaskSerach;
              rightMenuLabel.value.search = userConfig.value.isShowTaskSerach
                ? '隐藏搜索'
                : '显示搜索';
            },
          },
          {
            label: rightMenuLabel.value.task,
            onClick: () => {
              userConfig.value.isAutoHideTask = !userConfig.value.isAutoHideTask;
              rightMenuLabel.value.task = userConfig.value.isAutoHideTask
                ? '取消自动隐藏任务栏'
                : '自动隐藏任务栏';
              taskHide.value = userConfig.value.isAutoHideTask;
              if (userConfig.value.isAutoHideTask) {
                isShowSerachContent.value = false;
              }
            },
          },
        ];
        break;
    }
    if (items.length > 0) {
      ContextMenu.showContextMenu({
        x: event.x,
        y: event.y,
        items,
      });
    }
    //取消冒泡
    event.stopPropagation();
  }
  //右键菜单选项
  function rightOptions(mf, rightMenus, data, items) {
    mf = rightMenus.filter((m) => m.menutype == data.menutype);
    mf = _.sortBy(mf, (m) => m.orderindex);
    mf.forEach((m) => {
      items.push({
        label: m.name,
        icon: m.icon,
        disabled: userData.value.isAdmin
          ? false
          : m.action == 'delete'
            ? data.powertype.indexOf('1') != -1 || data.powertype.indexOf('4') != -1
              ? false
              : true
            : m.action == 'edit'
              ? data.powertype.indexOf('1') != -1 || data.powertype.indexOf('2') != -1
                ? false
                : true
              : false,
        onClick: () => {
          rightClick_menu(m.action, data);
        },
      });
    });
  }
  //右键点击菜单上再次点击
  function rightClick_menu(type_, data, folder, url) {
    switch (type_) {
      case 'open':
        let up = pageViewConfig.value.find((m) => m.key == data.key);
        pageViewConfig.value.forEach((m) => {
          m.resize.active = false;
        });
        if (up == undefined) {
          if (
            ((data.children == undefined || data.children.length == 0) &&
              !myCommon.isnull(data.menuurl)) ||
            (data.children && data.children.length > 0)
          ) {
            const w =
              data.opensizetype == 1
                ? data.openminwidth
                : data.opensizetype == 2
                  ? $('#desktopContent').width()
                  : data.openwidth;
            let h =
              data.opensizetype == 1
                ? data.openminheight
                : data.opensizetype == 2
                  ? $('#desktopContent').height()
                  : data.openheight;
            const x = data.opensizetype == 2 ? 0 : ($('#desktopContent').width() - w) / 2;
            const y = data.opensizetype == 2 ? 0 : ($('#desktopContent').height() - h) / 2;
            up = {
              key: data.key,
              title: data.title,
              menutype: data.menutype,
              resize: {
                //是否活动状态
                active: true,
                //是否能修改大小
                isResize: true,
                //最小宽度
                minWidth: data.openminwidth,
                //最小高度
                minHeight: data.openminheight,
              },
              style: {
                isMax: true,
                //是否显示
                isShow: true,
                //是否已经最大化
                isMaxSuccess: data.opensizetype == 2,
                //是否已经最小化
                isMinSuccess: false,
                //是否已经关闭。因为如果用删除的办法关闭，导致pageViewConfig数组大小更改，小于关闭页面索引的页面会重新加载
                isClose: false,
                //left
                x: x,
                //top
                y: y,
                //宽度
                w: w,
                //高度
                h: h,
                zIndex: maxZindex + 1,
              },
              oldStyle: {
                isMax: true,
                //是否显示
                isShow: true,
                //是否已经最大化
                isMaxSuccess: data.opensizetype == 2,
                //是否已经最小化
                isMinSuccess: false,
                //left
                x: x,
                //top
                y: y,
                //宽度
                w: w,
                //高度
                h: h,
                zIndex: maxZindex + 1,
              },
            };
            if (
              (data.children == undefined || data.children.length == 0) &&
              (!myCommon.isnull(data.menuurl) || !myCommon.isnull(url))
            ) {
              if (!myCommon.isnull(url)) {
                up.menuurl = url;
              } else {
                if (
                  data.menuurl.length >= 5 &&
                  (data.menuurl.substring(0, 4).toLowerCase() == 'http' ||
                    data.menuurl.substring(0, 5).toLowerCase() == 'https')
                ) {
                  up.menuurl = data.menuurl;
                } else {
                  up.menuurl = `#${data.menuurl}`;
                }
              }
            } else if (data.children && data.children.length > 0) {
              //打开文件夹
              up.menutype = 'folder';
              //文件夹信息
              up.folder = {
                //总子集
                children: data.children,
                //已经选择显示的层级
                levels: [
                  {
                    menuicon: data.menuicon,
                    title: data.title,
                    key: data.key,
                    children: data.children,
                  },
                ],
              };
            }
            //本来这一句就够了。新建项目反复测试结果：是vue3-draggable-resizable组件问题，新增加的宽和高会变成minW和minH
            //已提交问题：https://github.com/a7650/vue3-draggable-resizable/issues/83
            pageViewConfig.value.push(up);
            setTimeout(() => {
              const ddd = _.cloneDeep(up.style);
              ddd.x = x + 0.00000001;
              ddd.y = y + 0.00000001;
              ddd.w = w + 0.00000001;
              ddd.h = h + 0.00000001;
              pageViewConfig.value[pageViewConfig.value.length - 1].style = ddd;
            }, 0);
          } else if (myCommon.isnull(data.menuurl)) {
            message.warning('未配置菜单地址');
          }
        } else {
          if (folder) {
            if (folder.children == undefined || folder.children.length == 0) {
              //打开文件夹中的具体页
              rightClick_menu('open', folder);
            } else {
              //打开文件夹中的文件夹
              let i;
              for (let index = 0; index < up.folder.levels.length; index++) {
                if (up.folder.levels[index].key == folder.key) {
                  i = index;
                  break;
                }
              }
              if (i != undefined) {
                //已经有过，删除后面的
                i++;
                up.folder.levels.splice(i);
              } else {
                //没有打开过，新增
                up.folder.levels.push({
                  menuicon: folder.menuicon,
                  title: folder.title,
                  key: folder.key,
                  children: folder.children,
                });
              }
            }
          } else {
            //更改menuurl是为了本来打开的是编辑页面，切换到打开页面
            if (!myCommon.isnull(url)) {
              up.menuurl = url;
            } else {
              if (
                data.menuurl.length >= 5 &&
                (data.menuurl.substring(0, 4).toLowerCase() == 'http' ||
                  data.menuurl.substring(0, 5).toLowerCase() == 'https')
              ) {
                up.menuurl = data.menuurl;
              } else {
                up.menuurl = `#${data.menuurl}`;
              }
            }
            up.style.isClose = false;
            up.style.isMinSuccess = false;
            up.resize.active = true;
            up.zIndex = maxZindex + 1;
          }
        }
        //因为右键点击不会触发底层冒泡，所以加了contentClick
        contentClick();
        break;
      case 'delete':
        Modal.confirm({
          maskClosable: true,
          title: '是否删除该菜单?',
          icon: createVNode(ExclamationCircleOutlined),
          content: '',
          onOk() {
            menuApi
              .DeleteMenu({
                menuid: data.key,
              })
              .then(() => {
                if (data.parentid == 0) {
                  menuTreeData.value = menuTreeData.value.filter((m) => m.key != data.key);
                } else {
                  const parent = myCommon.arrayFindOb(
                    menuTreeData.value,
                    data.parentid,
                    'key',
                    'children',
                  );
                  parent.children = parent.children.filter((m) => m.key != data.key);
                }
                meuDataList = meuDataList.filter((m) => m.key != data.key);
                serachMenu.value = serachMenu.value.filter((m) => m.key != data.key);
                removePageViewConfig(data.key, pageViewConfig.value);
              });
          },
          onCancel() {},
        });
        break;
      case 'edit':
        const rig = rightMenus.find((m) => m.menutype == data.menutype && m.action == 'edit');
        if (rig && !myCommon.isnull(rig.url)) {
          //判断是否已经打开该菜单
          const pg = pageViewConfig.value.find((m) => m.key == data.key);
          let url = rig.url;
          if (
            url.length >= 5 &&
            (url.substring(0, 4).toLowerCase() == 'http' ||
              url.substring(0, 5).toLowerCase() == 'https')
          ) {
            url = url;
          } else {
            url = `#${url}/${data.key}`;
          }
          if (pg) {
            pg.menuurl = url;
            pg.style.isClose = false;
          } else {
            rightClick_menu('open', data, false, url);
          }
        }
        break;
      case 'export':
        break;
      case 'import':
        break;
    }
  }

  //删除打开页面配置
  function removePageViewConfig(key, datas) {
    //目前刷新菜单没有刷新打开页面的具体内容20221117
    for (let i = datas.length - 1; i >= 0; i--) {
      if (datas[i].key == key) {
        datas.splice(i, 1);
      } else if (
        (datas[i].folder && datas[i].folder.children.length > 0) ||
        (datas[i].children && datas[i].children.length > 0)
      ) {
        if (datas[i].folder && datas[i].folder.children.length > 0) {
          removePageViewConfig(key, datas[i].folder.children);
        } else {
          removePageViewConfig(key, datas[i].children);
        }
      }
    }
  }

  //返回上一级
  function folderBackClick(page) {
    page.folder.levels.splice(page.folder.levels.length - 1);
  }

  //任务栏菜单点击
  function taskMenuClick(data) {
    data.style.isMinSuccess = !data.style.isMinSuccess;
    if (!data.style.isMinSuccess) {
      data.resize.active = true;
      maxZindex += 1;
      data.style.zIndex = maxZindex;
    }
    contentClick();
    //取消冒泡
    event.stopPropagation();
  }

  //时间刷新
  function timeRefresh() {
    useTimeFn(
      setTimeout(() => {
        new_time.value = {
          time: dayjs().format('HH:mm'),
          date: dayjs().format('YYYY/MM/DD'),
        };
        timeRefresh();
      }, 1000),
      timeKey,
      'timeRefresh',
    );
  }

  //修正桌面菜单位置
  function desktopCorrection() {
    const height = $('#desktopContent').height();
    let m_top = 0;
    let m_left = 0;
    const desktopMenu_ = _.cloneDeep(desktopMenu.value);
    const desktopSize = desktopIconSize[userConfig.value.desktopIconSize];
    desktopMenu_.forEach((menu) => {
      if (m_top + parseFloat(desktopSize.height) >= height) {
        m_top = 0;
        m_left += parseFloat(desktopSize.width);
      }
      menu.style = {
        top: `${m_top}px`,
        left: `${m_left}px`,
      };
      m_top += parseFloat(desktopSize.height);
    });
    desktopMenu.value = desktopMenu_;
  }

  //修改用户自定义配置
  function changeUserConfig(type_, value) {
    userConfig.value[type_] = value;
    if (type_ == 'themeColor') {
      backgroundColor.value = value;
    } else if (type_ == 'backgroundImg') {
      backgroundImg.value = value;
    }
  }

  //获取菜单
  function getMenus() {
    isGetMenuTree.value = true;
    meuDataList = [];
    menuApi
      .GetMenuTree({
        execompleteBefore: () => {
          isGetMenuTree.value = false;
        },
        IsGetSYS: true,
      })
      .then((data) => {
        menuTreeData.value = data;
        generateList(menuTreeData.value);
        setAuthCache(POWER_MENU_KEY, meuDataList);
      })
      .catch((ex) => {
        menuTreeData.value = [];
      });
  }
  const generateList = (data) => {
    for (let i = 0; i < data.length; i++) {
      meuDataList.push(data[i]);
      if (data[i].children.length > 0) {
        generateList(data[i].children);
      }
    }
  };

  //获取右键配置
  function getRightMenus() {
    isRunGetRightMenu.value = true;
    menuApi
      .GetRightMenus({
        execompleteBefore: () => {
          isRunGetRightMenu.value = false;
        },
      })
      .then((data) => {
        rightMenus = data;
      })
      .catch(() => {
        rightMenus = [];
      });
  }

  //获取信息
  function getMsg() {
    userApi
      .GetUserMsg({
        isFirsh: msgData.value.length == 0,
        StartTime:
          msgData.value.length == 0
            ? dayjs().format('YYYY-MM-DD HH:mm:ss:SSS')
            : msgData.value[0].addtime,
      })
      .then((data) => {
        if (msgData.value.length > 2000) {
          msgData.value.splice(1000, 1000);
        }
        msgData.value = [...data, ...msgData.value];
        setTimeout(() => {
          getMsg();
        }, 3000);
      });
  }

  //阅读消息
  function removMsgClick() {
    if (msgData.value.length > 0) {
      userApi
        .ReadMsg({
          StartTime: msgData.value[msgData.value.length - 1].addtime,
          EndTime: msgData.value[0].addtime,
        })
        .then((data) => {
          msgData.value = [];
        });
    }
  }

  //任务栏滑过隐藏
  function taskbarMouseout(event) {
    if (
      !isShowSerachContent.value &&
      !isShowWindowContent.value &&
      userConfig.value.isAutoHideTask
    ) {
      taskHide.value = true;
    } else {
      taskHide.value = false;
    }
  }
  //任务栏上显示
  function taskbarMousemove() {
    taskHide.value = false;
  }
  //window图标内滑动
  function WindowContentMousemove() {
    taskHide.value = false;
  }

  //显示任务栏
  function taskbarShow() {
    taskHide.value = false;
  }

  //windows图标里的菜单children.length=0时消除children
  function removeKongChildren(data) {
    data.forEach((m) => {
      if (m.children.length == 0) {
        delete m.children;
      } else {
        removeKongChildren(m.children);
      }
    });
  }

  watch(
    () => menuTreeData.value,
    () => {
      const desktopMenu_ = [];
      const windowMenus_ = [];
      if (menuTreeData.value.length > 0) {
        menuTreeData.value.forEach((menu) => {
          if (menu.children.length > 0) {
            menu.menuicon = 'icon-baseui-folder';
          }
          windowMenus_.push(_.cloneDeep(menu));
          if (menu.isdesktop) {
            desktopMenu_.push(_.cloneDeep(menu));
          }
        });
      }
      desktopMenu.value = desktopMenu_;
      removeKongChildren(windowMenus_);
      windowMenus.value = windowMenus_;
      nextTick(() => {
        desktopCorrection();
      });
    },
  );

  watch(
    () => userConfig.value,
    () => {
      //更新用户自定义配置
      try {
        userApi.UpdateUseSystemCustomr({
          SystemCustom: JSON.stringify(userConfig.value),
        });
      } catch (error) {
        console.error(`更新用户自定义配置错误：${error}`);
      }
    },
    //deep深度监听
    { deep: true },
  );

  watch(
    () => searchContent.value,
    () => {
      if (myCommon.isnull(searchContent.value)) {
        serachMenu.value = [];
      } else {
        serachMenu.value = meuDataList.filter(
          (m) => m.title.indexOf(searchContent.value) != -1 && m.children.length == 0,
        );
      }
    },
  );

  watch(
    () => taskHide.value,
    () => {
      setTimeout(() => {
        desktopCorrection();
      }, 100);
    },
  );

  watch(
    () => userConfig.value.desktopIconSize,
    () => {
      setTimeout(() => {
        desktopCorrection();
        desktopIconwidth.value = desktopIconSize[userConfig.value.desktopIconSize].width;
        desktopIconheight.value = desktopIconSize[userConfig.value.desktopIconSize].height;
        desktopIcondivLineHeight.value =
          desktopIconSize[userConfig.value.desktopIconSize].divLineHeight;
        desktopIcondivHeight.value = desktopIconSize[userConfig.value.desktopIconSize].divHeight;
        desktopIcondivPaddingTop.value =
          desktopIconSize[userConfig.value.desktopIconSize].divPaddingTop;
        desktopIconiFontSize.value = desktopIconSize[userConfig.value.desktopIconSize].iFontSize;
        desktopIconpHeight.value = desktopIconSize[userConfig.value.desktopIconSize].pHeight;
        desktopIconpFontSize.value = desktopIconSize[userConfig.value.desktopIconSize].pFontSize;
      }, 100);
    },
  );

  //修正已经打开页面的大小
  function xiuZhengpageViewConfigStyle() {
    //存在本来不是全屏，打开页面在更改全屏，不刷新高度问题。应该是拖拽组件的bug。2022 11 18 13:00
    //已提交问题：https://github.com/a7650/vue3-draggable-resizable/issues/83
    //复现步骤
    //1：浏览器正常加载
    //2：f11全屏
    //3：点击“放大按钮”
    //4：查看打印发现延迟后的结果和立即打印结果不一致
    //上述问题在全屏下加载页面后点击“放大”按钮消失

    setTimeout(() => {
      //任务栏的隐藏和显示会影响已经打卡页面的高度
      const pp = _.cloneDeep(pageViewConfig.value);
      pp.forEach((m) => {
        if (m.style.isMaxSuccess) {
          const menu = meuDataList.find((j) => j.key == m.key);
          if (menu) {
            m.style.h = $('#desktopContent').height();
          }
        }
      });
      pageViewConfig.value = pp;
    }, 500);
  }

  watch(
    () => userConfig.value.isAutoHideTask,
    () => {
      xiuZhengpageViewConfigStyle();
    },
  );

  onBeforeMount(() => {
    //加载页面之前，判断锁屏状态
    const suo = ls.get('suoPin');
    if (suo == 1) {
      isShowSuoPin.value = true;
    }
  });

  onMounted(() => {
    document.onmouseup = (e) => {
      if (viewRelease) {
        viewRelease = false;
        $(viewTitleLabelDomId).click();
        return false;
      }
    };

    //切换成菜单风格
    appStore.setProjectConfig({
      menuSetting: {
        show: false,
      },
      headerSetting: {
        show: false,
      },
    });

    window.onresize = () => {
      desktopCorrection();
      xiuZhengpageViewConfigStyle();
    };

    //信息闪烁
    watch(
      () => msgData.value,
      () => {
        if (msgData.value.length > 0 && !$('#myWindowsMsg').hasClass('msg-twinkle')) {
          $('#myWindowsMsg').addClass('msg-twinkle');
        } else {
          $('#myWindowsMsg').removeClass('msg-twinkle');
        }
      },
      //immediate第一次也执行
      { immediate: true },
    );
  });
</script>
<style lang="less" scoped>
  @prefixCls: ~'@{namespace}-windows-';

  //闪烁
  @keyframes twinkle {
    0% {
      opacity: 1;
    }

    50% {
      opacity: 0.4;
    }

    100% {
      opacity: 1;
    }
  }

  .@{prefixCls}content {
    position: fixed;
    top: 0;
    left: 0;
    min-width: 800px;
    min-height: 600px;
    overflow: hidden;
    background: v-bind(backgroundimg);
    background-repeat: no-repeat;
    background-size: 100% 100%;
    user-select: none;

    .desktop {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      overflow: hidden;
      background-repeat: no-repeat;
      background-size: 100% 100%;

      .@{prefixCls}desktop-menu {
        position: absolute;
        box-sizing: border-box;
        width: v-bind(desktopiconwidth);
        height: v-bind(desktopiconheight);
        padding-top: v-bind(desktopicondivpaddingtop);
        overflow: hidden;
        border: 1px solid rgb(255 255 255 / 0%);
        color: #fff;
        cursor: pointer;

        > div {
          height: v-bind(desktopicondivheight);
          line-height: v-bind(desktopicondivlineheight);
          text-align: center;

          > i {
            font-size: v-bind(desktopiconifontsize);
          }
        }

        > p {
          width: 100%;
          height: v-bind(desktopiconpheight);
          margin: 0 auto;
          overflow: hidden;
          font-size: v-bind(desktopiconpfontsize);
          line-height: 16px;
          text-align: center;
          word-wrap: break-word;
        }
      }

      .@{prefixCls}desktop-menu:hover {
        border: 0.5px solid rgb(255 255 255 / 45.9%);
      }
    }

    .@{prefixCls}view {
      position: absolute;
      width: 100%;
      height: 100%;
      overflow: hidden;
      background-color: #fff;

      .@{prefixCls}view-title {
        width: 100%;
        height: 35px;
        background-color: v-bind(backgroundcolor);
        color: #fff;

        .@{prefixCls}view-title-folder {
          width: calc(100% - 110px);
          float: left;
          overflow: hidden;

          > * {
            line-height: 35px;
          }

          .@{prefixCls}view-title-folder-level {
            cursor: pointer;
          }

          .@{prefixCls}view-title-folder-level:hover {
            opacity: 0.6;
          }
        }

        .@{prefixCls}view-title-label {
          width: calc(100% - 115px);
          height: 100%;
          margin-left: 5px;
          float: left;
          overflow: hidden;
          border-bottom: none;
          border-radius: 0;
          color: #fff;
          font-size: 12px;
          line-height: 34px;
          cursor: default !important;
        }

        .@{prefixCls}view-title-btns {
          height: 35px;
          float: right;

          > i {
            display: inline-block;
            width: 27px;
            height: 35px;
            padding: 0 5px;
            font-size: 17px;
            line-height: 34px;
            cursor: default;
          }

          > i:first-child {
            font-size: 20px;
          }

          > i:hover {
            background-color: #8e8a89;
          }

          > i:last-child:hover {
            opacity: 0.6;
          }
        }
      }
    }

    .@{prefixCls}view-page {
      width: 100%;
      height: calc(100% - 35px);

      > * {
        width: 100%;
        height: 100%;
      }

      .@{prefixCls}folder-menu {
        box-sizing: border-box;
        width: 70px;
        height: 70px;
        float: left;
        overflow: hidden;
        border: 1px solid rgb(255 255 255 / 0%);
        text-align: center;
        cursor: pointer;

        i {
          font-size: 30px;
        }

        p {
          width: 100%;
          height: 16px;
          margin: 0 auto;
          overflow: hidden;
          line-height: 16px;
          text-align: center;
          word-wrap: break-word;
        }
      }

      .@{prefixCls}folder-menu:hover {
        border: 1px dashed #dfdfdf;
      }
    }

    .@{prefixCls}taskbar {
      position: fixed;
      bottom: 0;
      width: 100%;
      height: 40px;
      // 样式使用变量
      background-color: v-bind(backgroundcolor);

      > div {
        float: left;
      }

      .@{prefixCls}windows {
        width: 48px;
        height: 100%;
        cursor: pointer;

        > i {
          margin-left: 13px;
          color: #fff;
          font-size: 23px;
          line-height: 42px;
        }
      }

      .@{prefixCls}windows:hover {
        opacity: 0.6;

        i {
          color: #429ce3;
        }
      }

      .@{prefixCls}search {
        position: relative;
        width: 344px;
        height: 100%;

        :deep(.ant-input-affix-wrapper) {
          width: 100%;
          height: 100%;
          border: none;
          border-radius: 0;
        }

        input:focus {
          border: none;
          outline: none;
        }
      }

      .taskShowFrame {
        width: calc(100% - 48px - 344px - 70px - 35px - 5px);
        height: 100%;
        overflow: hidden auto;

        .task-item {
          width: 160px;
          height: 100%;
          margin: 0 2px;
          padding: 0 5px;
          float: left;
          overflow: hidden;
          border-bottom: 1px solid #9c9b9b;
          color: #fff;
          font-family: 'Helvetica Neue', Helvetica, 'PingFang SC', Tahoma, Arial, sans-serif;
          font-size: 12px;
          line-height: 40px;
          text-align: center;
        }

        .task-item:hover {
          opacity: 0.6;
        }

        .task-item-active {
          border: 1px solid #fff;
        }

        .task-item-min {
          border: none;
          border-bottom: 2px solid #a6a5a5;
        }
      }

      .taskShowFrame-max {
        width: calc(100% - 48px - 70px - 35px - 5px);
      }

      .@{prefixCls}time {
        width: 70px;
        color: #fff;
        text-align: center;

        > p {
          margin-bottom: 0;
          font-size: 12px;
          line-height: 18px;
        }
      }

      .@{prefixCls}msg {
        position: relative;
        width: 35px;
        text-align: center;
        cursor: pointer;

        > i {
          color: #fff;
          font-size: 25px;
          line-height: 45px;
        }

        > div {
          position: absolute;
          bottom: 18px;
          left: 7px;
          width: 21px;
          height: 13px;
          color: #fff;
          font-size: 12px;
          line-height: 13px;
          text-align: center;
        }
      }

      .msg_div {
        background-color: red;
      }

      .msg-twinkle {
        animation: twinkle 600ms infinite;
        animation: twinkle 600ms infinite;
        color: #fff;
      }

      .@{prefixCls}msg:hover {
        opacity: 0.6;
      }

      .@{prefixCls}close {
        width: 5px;
        height: 100%;
        border-left: 1px solid #778083;
        cursor: pointer;
      }

      .@{prefixCls}close:hover {
        opacity: 0.6;
      }
    }

    .@{prefixCls}taskbar-hide {
      // 样式使用变量
      position: fixed;
      bottom: 0;
      width: 100%;
      height: 2px;
      opacity: 0;
    }

    .taskShow {
      height: calc(100% - 40px) !important;
    }

    .taskHide {
      height: calc(100% - 2px) !important;
    }

    .@{prefixCls}windows-content {
      position: absolute;
      bottom: 40px;
      left: 0;
      height: 60vh;
      background-color: v-bind(backgroundcolor);

      > div {
        height: 100%;
        float: left;
      }

      .@{prefixCls}sheZhi {
        position: relative;
        width: 48px;

        > div {
          position: absolute;
          bottom: 0;
          left: 0;
          width: 100%;
          text-align: center;

          > i {
            display: inline-block;
            width: 100%;
            color: #fff;
            font-size: 23px;
          }

          > i:hover {
            opacity: 0.6;
          }
        }
      }

      .@{prefixCls}menu {
        width: 260px;
      }

      .@{prefixCls}menuLately {
        width: 200px;

        > div:first-child {
          height: 25px;
          color: #fff;
          font-family: 'Helvetica Neue', Helvetica, 'PingFang SC', Tahoma, Arial, sans-serif;
          font-size: 12px;
          line-height: 25px;
        }
      }
    }

    .@{prefixCls}search-content {
      position: absolute;
      bottom: 40px;
      left: 48px;
      width: 344px;
      height: 60vh;
      overflow: hidden auto;
      background-color: v-bind(backgroundcolor);

      > div {
        width: calc(100% - 10px);
        height: 30px;
        padding: 0 5px;
        color: #fff;
        font-family: 'Helvetica Neue', Helvetica, 'PingFang SC', Tahoma, Arial, sans-serif;
        font-size: 14px;
        line-height: 30px;
        cursor: pointer;

        > i {
          position: relative;
          top: -9px;
          font-size: 19px;
        }

        > span {
          display: inline-block;
          width: calc(100% - 20px);
          height: 30px;
          padding: 0 4px;
          overflow: hidden;
        }
      }

      > div:hover {
        opacity: 0.6;
      }
    }

    //拖拽组件边框颜色
    :deep(.vdr-container.active) {
      border-color: v-bind(backgroundcolor);
    }

    // 菜单导航样式更改
    :deep(.ant-menu),
    :deep(.ant-menu-sub.ant-menu-inline) {
      background-color: v-bind(backgroundcolor);
      color: #fff;
    }

    :deep(.ant-menu-submenu-selected),
    :deep(.ant-menu-dark .ant-menu-item),
    :deep(.ant-menu-dark .ant-menu-item-group-title),
    :deep(.ant-menu-dark .ant-menu-item > a),
    :deep(.ant-menu-dark .ant-menu-item > span > a) {
      color: #fff;
    }

    :deep(.ant-menu:not(.ant-menu-horizontal) .ant-menu-item-selected) {
      background-color: initial;
      color: #fff;
    }

    // 菜单导航样式更改
  }

  .@{prefixCls}msg-content {
    width: 100%;
    height: 100%;
    overflow-x: hidden;
    color: #fff;
    font-family: 'Helvetica Neue', Helvetica, 'PingFang SC', Tahoma, Arial, sans-serif;

    > div:first-child {
      width: 70px;
      height: 35px;
      margin-left: 320px;
      padding: 0 5px;
      font-size: 14px;
      line-height: 35px;
      text-align: right;
      cursor: pointer;
    }

    > div:last-child {
      width: 100%;
      height: calc(100% - 35px);
      overflow-y: auto;

      > div {
        margin-bottom: 10px;
        padding: 0 5px;
        background-color: rgb(255 255 255 / 10%);
      }

      > div > div:first-child {
        > span:first-child {
          display: inline-block;
          width: calc(100% - 115px);
          overflow: hidden;
          color: #fff;
          font-size: 15px;
          font-weight: 600;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        > span:last-child {
          display: inline-block;
          position: relative;
          // top: -7px;
          left: 3px;
          width: 112px;
          font-size: 12px;
        }
      }

      > div > div:last-child {
        width: 100%;
        color: #f3f2f2;
        //首行缩进
        text-indent: 20px;
      }
    }
  }
</style>
