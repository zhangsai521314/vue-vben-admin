<template>
  <MyContent>
    <div class="title">虚拟滚动记账本</div>
    <div class="account-list-outer" ref="outContainer">
      <div class="account-list-inner">
        <div class="account-box" v-for="(item, index) in viewData" :key="index">
          <p
            class="date"
            :style="{
              backgroundColor: item.state ? '#f2ddde' : '#dff1d8',
              color: item.state ? '#ae8286' : '#8ea189',
            }"
            >{{ item.date }}</p
          >
          <div class="info">
            <p class="detail">{{ item.detail }}</p>
            <p class="state"><span v-if="item.state">支出</span><span v-else>收入</span></p>
            <p class="money">{{ item.money }}元</p>
          </div>
        </div>
      </div>
    </div>
  </MyContent>
</template>
<script lang="ts" setup>
  import { ref, reactive, onMounted } from 'vue';

  interface AccountDataItem {
    date: string; //日期
    state: number; //收支状态 0为收入 1为支出
    detail: string; //详情
    money: number; //花费或收入
  }
  //原始数据
  const accountData: AccountDataItem[] = [];
  // 最终展示数据
  const viewData: AccountDataItem[] = reactive([]);
  // 外部容器dom元素
  const outContainer = ref();
  // 内部容器padding-top
  const paddingTop = ref('0px');
  // 内部容器padding-bottom
  const paddingBottom = ref('0px');
  //单行高度 可少不可多
  const itemHeight = 70;

  //获取原始数据
  const getData = () => {
    //两万条数据 测试直接渲染卡顿大概1s左右
    for (let i = 0; i < 10000; i++) {
      accountData.push(
        {
          date: `2023-03-28`,
          state: 0,
          detail: `2月份工资`,
          money: 1800,
        },
        {
          date: `2023-03-29`,
          state: 1,
          detail: '抽烟 喝酒 烫头',
          money: 2000,
        },
      );
    }
  };
  //创建虚拟列表
  const createVirtualList = () => {
    //外部容器高度
    const outContainerHeight = outContainer.value.clientHeight;
    //滚动轴滚动长度
    const scrollTop = outContainer.value.scrollTop;
    const startIndex = Math.floor(scrollTop / itemHeight);
    const endIndex = startIndex + Math.floor(outContainerHeight / itemHeight);
    paddingTop.value = (startIndex * itemHeight).toString() + 'px';
    // accountData.length---总数据的长度
    paddingBottom.value = ((accountData.length - endIndex) * itemHeight).toString() + 'px';
    // 清空viewData数据
    viewData.splice(0, viewData.length);
    // 添加可视片段上的数据
    viewData.push(...accountData.slice(startIndex, endIndex + 1));
  };
  // 需要获取dom元素 所以要在onMounted钩子中进行
  onMounted(async () => {
    // 获取原始数据(总数据)
    await getData();
    // 初始化创建虚拟列表
    createVirtualList();
    // 添加事件监听
    outContainer.value.addEventListener('scroll', createVirtualList);
  });
</script>
<style scoped lang="less">
  p {
    margin: 0;
    padding: 0;
  }

  #main-bg {
    width: 60%;
    margin: 0 auto;
    padding: 20px 10px 0;
  }

  .title {
    width: 100%;
    padding-bottom: 10px;
    border-bottom: 1px #eee solid;
    font-family: cursive;
    font-size: 24px;
    font-weight: 800;
    text-align: left;
  }

  .account-list-outer {
    height: calc(100% - 58px);
    overflow-y: scroll;

    .account-list-inner {
      padding-top: v-bind('paddingTop');
      padding-bottom: v-bind('paddingBottom');

      .account-box {
        margin: 10px 0;
        border: 1px #eee solid;
        border-radius: 8px;

        .date {
          padding: 10px;
          font-size: 14px;
          line-height: 14px;
          text-align: left;
        }

        .info {
          display: flex;
          padding: 10px 15px;
          font-size: 15px;
          line-height: 15px;
          text-align: left;

          .detail {
            width: 60%;
          }

          .state {
            width: 10%;
          }

          .monry {
            width: 30%;
          }
        }
      }
    }
  }
</style>
