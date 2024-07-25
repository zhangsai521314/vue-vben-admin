<template>
  <div :class="`${prefixCls}top-logo`">
    <img src="../../../assets/images/logo.png" style="width: 65px; height: 65px" />
  </div>
  <div :class="`${prefixCls}top-menu`">
    <a-dropdown :class="`${prefixCls}menu-item`">
      <a class="ant-dropdown-link" @click.prevent> 文件 </a>
      <template #overlay>
        <a-menu style="width: 100px">
          <a-spin tip="正在导入..." :spinning="isRunload">
            <a-menu-item>
              <a-upload
                v-model:fileList="fileList"
                maxCount="1"
                :multiple="false"
                accept=".ineuview"
                :before-upload="(file) => beforeUpload(file)"
              >
                导入
              </a-upload>
            </a-menu-item>
          </a-spin>
          <a-spin tip="正在导出..." :spinning="props.isRunexport">
            <a-menu-item @click="props.exportConfig">导出</a-menu-item>
          </a-spin>
        </a-menu>
      </template>
    </a-dropdown>
    <a-dropdown :class="`${prefixCls}menu-item`">
      <a class="ant-dropdown-link" @click.prevent> 编辑 </a>
      <template #overlay>
        <!-- <a-menu>
                    <a-menu-item>后退 &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; ctrl+z</a-menu-item>
                    <a-menu-item>前进 &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; ctrl+y</a-menu-item>
                    <a-menu-divider />
                    <a-menu-item>复制 &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; ctrl+c</a-menu-item>
                    <a-menu-item>删除 &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; ctrl+d</a-menu-item>
                    <a-menu-item>组合 &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; ctrl+g</a-menu-item>
                    <a-menu-item>拆分 &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; ctrl+shift+g</a-menu-item>
                </a-menu> -->
      </template>
    </a-dropdown>
    <a-dropdown :class="`${prefixCls}menu-item`">
      <a class="ant-dropdown-link" @click.prevent> 选择 </a>
      <template #overlay>
        <!-- <a-menu>
                    <a-menu-item>全选&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; ctrl+a</a-menu-item>
                    <a-menu-divider />
                    <a-menu-item>全选图片 &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; ctrl+a+t</a-menu-item>
                    <a-menu-item>全选形状 &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; ctrl+a+s</a-menu-item>
                    <a-menu-divider />
                    <a-menu-item>全选图表 &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; ctrl+a+c</a-menu-item>
                    <a-menu-item>全选视频 &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; ctrl+a+v</a-menu-item>
                    <a-menu-item>全选iframe &nbsp;&nbsp;&nbsp; ctrl+a+i</a-menu-item>
                </a-menu> -->
      </template>
    </a-dropdown>
    <a-dropdown :class="`${prefixCls}menu-item`">
      <a class="ant-dropdown-link" @click.prevent> 视图 </a>
      <template #overlay>
        <!-- <a-menu>
                    <a-menu-item>放大 &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; ctrl +</a-menu-item>
                    <a-menu-item>缩小 &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; ctrl -</a-menu-item>
                    <a-sub-menu key="sub1" title="网格">
                        <a-menu-item style="width: 80px;">显示网格</a-menu-item>
                        <a-menu-item style="width: 80px;">网格吸附</a-menu-item>
                    </a-sub-menu>
                </a-menu> -->
      </template>
    </a-dropdown>
    <a-dropdown :class="`${prefixCls}menu-item`">
      <a class="ant-dropdown-link" @click.prevent> 帮助 </a>
      <template #overlay>
        <!-- <a-menu>
                    <a-menu-item>&nbsp;&nbsp;&nbsp;产品手册 &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</a-menu-item>
                    <a-menu-item>&nbsp;&nbsp;&nbsp;热键说明 &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</a-menu-item>
                    <a-menu-item>&nbsp;&nbsp;&nbsp;问题反馈 &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</a-menu-item>
                    <a-menu-item>&nbsp;&nbsp;&nbsp;更多帮助 &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</a-menu-item>
                </a-menu> -->
      </template>
    </a-dropdown>
  </div>
  <div :class="`${prefixCls}top-panel`">
    <!-- <div :class="`${prefixCls}panel-item`">
            演示
        </div> -->
    <!-- <div :class="`${prefixCls}panel-item`">
            分享
        </div> -->
  </div>
</template>
<script setup>
  import { useDesign } from '/@/hooks/web/useDesign';
  import { ref } from 'vue';

  const props = defineProps({
    //拓扑对象
    graphObRef: {
      type: Object,
      default() {
        return null;
      },
    },
    //canvas对象
    containerObArray: {
      type: Array,
      default() {
        return null;
      },
    },
    //总的容器配置
    canvasCotainers: {
      type: Array,
      default() {
        return [
          // {
          //   canvasType: "2d",
          //   containerId: `ineuos${myCommon.uniqueId()}`,
          //   //容器的配置
          //   containerConfig: {
          //     //是否自动扩展
          //     infinite: true,
          //     //是否显示网格
          //     gridShow:true ,
          //     //容器大小类型
          //     size: "custom",
          //     //宽度
          //     sizeWidth: "",
          //     //高度
          //     sizeHeight: "",
          //     //背景色
          //     backgroundColor: "",
          //     //背景图
          //     backgroundImg: "",
          //     //自定义接口是否启用
          //     requestUse: false,
          //     //接口刷新频率
          //     requstRefresh: 1000,
          //     //运行方式
          //     runType: [],
          //   },
        ];
      },
    },
    //导出
    exportConfig: {
      type: Function,
      default() {
        return () => {};
      },
    },
    //导入
    importConfig: {
      type: Function,
      default() {
        return () => {};
      },
    },
    //获取能保存的配置
    getAllConfig: {
      type: Function,
      default() {
        return () => {};
      },
    },
    //菜单选中
    menuCheckedIds: {
      type: Array,
      default() {
        return [];
      },
    },
    //
    viewConfigLoad: {
      type: Function,
      default() {
        return (data) => {};
      },
    },
    isRunexport: {
      type: Boolean,
      default() {
        return false;
      },
    },
  });
  //上传的文件信息
  const fileList = ref([]);
  const isRunload = ref(false);
  function beforeUpload(file) {
    isRunload.value = true;
    let formData = new FormData();
    formData.append('files', file);
    formData.append('menuId', props.menuCheckedIds.length > 0 ? props.menuCheckedIds[0] : 0);
    formData.append('isAdd', false);
    modelingApi
      .ImportViewConfig(formData)
      .then((data) => {
        isRunload.value = false;
        fileList.value.length = 0;
        props.viewConfigLoad(data);
      })
      .catch((error) => {
        isRunload.value = false;
        fileList.value.length = 0;
        console.error(error);
      });
    return false;
  }

  const { prefixCls } = useDesign('GplotManage-');
</script>
<style lang="less" scoped>
  @prefixCls: ~'@{namespace}-GplotManage-';

  :deep(.ant-upload-list) {
    display: none;
  }

  .@{prefixCls}top-logo {
    display: flex;
    flex-direction: row;
    padding-right: 20px;
    cursor: default;

    > img {
      width: 220px;
      height: 30px;
      margin: 0 5px;
      margin-top: 3px;
    }

    > span {
      line-height: 31px;
    }
  }

  .@{prefixCls}top-menu {
    display: flex;
    //在父级的弹性布局中撑满剩余的宽度
    flex: 1 0 auto;
    flex-direction: row;
    margin-left: -10px;
    line-height: 26px;

    .@{prefixCls}menu-item {
      padding: 0 10px;
      color: #000;
      line-height: 31px;
      cursor: pointer;
    }
  }

  .@{prefixCls}top-panel {
    display: flex;
    flex-direction: row;

    .@{prefixCls}panel-item {
      padding: 0 10px;
      line-height: 31px;
      cursor: pointer;
    }
  }
</style>
