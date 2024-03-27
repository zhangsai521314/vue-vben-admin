<!-- 主题 -->
<!-- 用户信息 -->
<template>
    <div :class="`${prefixCls}content`">
        <div :class="`${prefixCls}left`">
            <ul>
                <li v-for="(item, index) in liData" :key="index" @click="liClick($event, item)" :class="{ 'li-selected': index == 0 }">
                    <IconFontClass
                        :name="item.icon" />
                    <span> {{ item.name }}</span>
                </li>
            </ul>
        </div>
        <div :class="`${prefixCls}right`">
            <div :class="`${prefixCls}tenant`" v-if="liSelectedName == '系统信息'">
                <a-span tip="正在获取系统信息..." :spinning="isRunGetTenantInfo">
                    <div>
                        <span>企业名称：</span>
                        <span>{{ tenantInfo.name }}</span>
                    </div>
                    <div>
                        <span>系统名称：</span>
                        <span>{{ tenantInfo.titlename }}</span>
                    </div>
                    <div>
                        <span>系统版本：</span>
                        <span>{{ tenantInfo.version }}</span>
                    </div>
                    <div>
                        <span>系统主管：</span>
                        <span>{{ tenantInfo.contacts }}</span>
                    </div>
                    <div>
                        <span>主管电话：</span>
                        <span>{{ tenantInfo.mobile }}</span>
                    </div>
                    <div>
                        <span>主管邮箱：</span>
                        <span>{{ tenantInfo.email }}</span>
                    </div>
                    <div>
                        <span>授权状态：</span>
                        <span :style="{ color: tenantInfo.empower ? 'green' : 'red' }">{{ tenantInfo.empower ? '已授权' : '未授权' }}</span>
                    </div>
                    <div>
                        <span>机器码：</span>
                        <span>{{ userData.machinecode }}</span>
                    </div>
                    <div :class="`${prefixCls}userLogo`">
                        <img :src="tenantInfo.logo" />
                    </div>
                </a-span>
            </div>
            <div :class="`${prefixCls}background`" v-else-if="liSelectedName == '桌面背景'">
                <h1>背景</h1>
                <div :class="`${prefixCls}backgroundImgView`">
                    <div></div>
                    <ul>
                        <li></li>
                        <li></li>
                        <li></li>
                        <li></li>
                        <li></li>
                        <li></li>
                        <li></li>
                    </ul>
                    <div></div>
                </div>
                <h2>选择图片</h2>
                <div :class="`${prefixCls}backgroundImgs`">
                    <div
                        @click="backImgClick"
                        v-for="(item, index) in backImgs" :key="index" :imgUrl="item" :style="{ background: item, backgroundRepeat: 'no-repeat', backgroundSize: '100% 100%' }">

                    </div>
                </div>
                <div
                    @click="upClick"
                    :style="{
                        backgroundColor: 'rgb(204, 204, 204)',
                        padding: '0px 15px',
                        height: '26px',
                        lineHeight: '26px',
                        width: '85px',
                        textAlign: 'center',
                        margin: '5px 0 7px 0'
                    }">浏览</div>
                <h2>选择你的背景色</h2>
                <div :class="`${prefixCls}backgroundColors`">
                    <div @click="colorClick" v-for="(color, index) in colors" :key="index" :style="{ backgroundColor: color }">

                    </div>
                </div>
            </div>
        </div>
    </div>
</template>
<script setup>
import { useUserStore } from '@/store/modules/user';
import { UserOutlined } from '@ant-design/icons-vue';
import { useDesign } from '@/hooks/web/useDesign';
import { ref, onMounted, reactive, unref, h, watch } from 'vue';
import userApi from '@/api/user';
import { message } from 'ant-design-vue';
const props = defineProps({
    backgroundColor: {
        type: String,
        default() {
            return '#196AA8'
        }
    },
    backgroundImg: {
        type: String,
        default() {
            return 'url(/resource/img/windows/windows_backImg1.png)'
        }
    },
    changeUserConfig: Function,
    userConfig: Object
});
const userStore = useUserStore();
const userData = ref(_.cloneDeep(userStore.getUserInfo));
const isRunGetTenantInfo = ref(true);
const { prefixCls } = useDesign('windows-theme-');
const backgroundColor = ref(props.backgroundColor);
const backgroundImg = ref(props.backgroundImg);
//选项数据
const liData = [
    {
        name: "桌面背景",
        icon: 'icon-baseui-tupian',
    },
    {
        name: "系统信息",
        icon: 'icon-baseui-system-info',
    }
]
//选中的选项
const liSelectedName = ref(liData[0].name);
//租户信息
const tenantInfo = ref({
    name: '企业名称',
    titlename: '系统名称',
    version: '系统版本',
    contacts: '系统主管',
    mobile: '主管电话',
    email: '主管邮箱',
    empower: userData.value.empower,
    machinecode: '',
    logo: ''
});
//颜色卡
const colors = ['#FFB900', '#FF8C00', '#F7630C', '#CA5010', '#DA3B01', '#EF6950', '#D13438', '#D13438', '#E74856', '#E81123', '#EA005E', '#C30052'
    , '#E3008C', '#BF0077', '#C239B3', '#9A0089', '#0078D7', '#0063B1', '#8E8CD8', '#6B69D6', '#8764B8', '#744DA9', '#B146C2', '#881798', '#0099BC', '#2D7D9A', '#00B7C3'
    , '#038387', '#00B294', '#018574', '#00CC6A', '#00CC6A', '#7A7574', '#5D5A58', '#68768A', '#515C6B', '#567C73', '#486860', '#498205', '#107C10'];
//背景图数据
const backImgs = ref([
    'url(/resource/img/windows/windows_backImg1.png)',
    'url(/resource/img/windows/windows_backImg2.png)',
    'url(/resource/img/windows/windows_backImg3.png)',
    'url(/resource/img/windows/windows_backImg4.png)',
    'url(/resource/img/windows/windows_backImg5.png)'
]);

user_img();
getTenant();

//图片上传
function upClick() {
    message.success("开发中！");
}

//自己上传的图片替换系统图片
function user_img() {
    props.userConfig.backgroundImgUps.forEach((img, i) => {
        backImgs[i] = img;
    });
}

//选项切换
function liClick(event, data) {
    $('.li-selected').removeClass('li-selected');
    if ($(event.target).parent("ul").length > 0) {
        $(event.target).addClass('li-selected');
    } else {
        $(event.target).parent().addClass('li-selected');
    }
    liSelectedName.value = data.name;
    event.stopPropagation();
}

//更改颜色
function colorClick(e) {
    backgroundColor.value = $(e.target).css('backgroundColor');
    props.changeUserConfig('themeColor', backgroundColor.value)
}

//更背景图
function backImgClick(e) {
    backgroundImg.value = $(e.target).attr('imgUrl');
    props.changeUserConfig('backgroundImg', backgroundImg.value);
}


//获取租户信息
function getTenant() {
    userApi
        .GetTenant({
            execompleteBefore: () => {
                isRunGetTenantInfo.value = false;
            },
        })
        .then((data) => {
            tenantInfo.value = data;
            tenantInfo.value.empower = userData.value.empower;
        });
}

watch(
    () => props.backgroundColor,
    () => {
        backgroundColor.value = props.backgroundColor;
    }
);

watch(
    () => props.backgroundImg,
    () => {
        backgroundImg.value = props.backgroundImg;
    }
);

</script>
<style lang="less" scoped>
@prefixCls: ~'@{namespace}-windows-theme-';

.@{prefixCls}content {
    width: 100%;
    height: 100%;
    background-color: #fff;

    >div {
        float: left;
    }

    .@{prefixCls}left {
        width: 280px;
        height: 100%;
        background-color: rgba(204, 204, 204, 0.5);
        overflow: hidden;

        >ul {
            height: 100%;
            width: 100%;
            padding-top: 2px;
        }

        >ul>li {
            height: 50px;
            list-style: none;
            line-height: 50px;
            padding: 0 15px;
            cursor: default;
            font-size: 15px;
            font-family: "Helvetica Neue", Helvetica, "PingFang SC", Tahoma, Arial, sans-serif;

            >span {
                font-weight: 600;
                margin-left: 3px;
            }
        }

        >ul>li:hover {
            opacity: 0.6;
        }

        .li-selected {
            border: 1px solid;
            border-left: 5px solid;
            border-color: v-bind(backgroundColor);
            padding-left: 10px;
        }
    }

    .@{prefixCls}right {
        // background-color: v-bind(backgroundColor);
        width: calc(100% - 280px);
        height: 100%;
        font-family: "Helvetica Neue", Helvetica, "PingFang SC", Tahoma, Arial, sans-serif;
        overflow-x: hidden;
        overflow-y: auto;

        >div {
            width: 100%;
            height: calc(100% - 5px);
            padding: 10px;
        }

        h1 {
            font-size: 25px;
            font-weight: 500;
        }

        h2 {
            font-size: 15px;
            font-weight: 500;
        }

        .@{prefixCls}tenant {
            font-family: "Helvetica Neue", Helvetica, "PingFang SC", Tahoma, Arial, sans-serif;
            font-size: 15px;
            font-weight: 500;

            >div {
                >span:first-child {
                    font-weight: 600;
                }
            }

            .@{prefixCls}userLogo {
                width: 322px;
                height: 159px;
                border-radius: 2px;
                background-color: red;
                text-align: center;
                margin: 0 auto;
                margin-top: 20px;
                padding: 20px;
                background-color: v-bind(backgroundColor);
            }
        }

        .@{prefixCls}background {
            width: 420px;

            .@{prefixCls}backgroundImgView {
                width: 328px;
                height: 185px;
                background: v-bind(backgroundImg);
                background-repeat: no-repeat;
                background-size: 100% 100%;
                margin-bottom: 3px;
                position: relative;

                >ul {
                    width: 30px;
                    height: 54px;
                    position: absolute;
                    z-index: 2;
                    top: 80px;
                    left: 14px;

                    li {
                        list-style: none;
                        height: 3px;
                        width: 100%;
                        background: #fff;
                        margin: 5px 0;
                    }
                }

                >div:first-child {
                    height: 110px;
                    width: 60px;
                    background-color: var(--477a77b6-backgroundColor);
                    position: absolute;
                    bottom: 15px;
                    z-index: 1;
                }

                >div:last-child {
                    height: 15px;
                    width: 100%;
                    background-color: var(--477a77b6-backgroundColor);
                    position: absolute;
                    bottom: 0;
                }
            }

            .@{prefixCls}backgroundImgs {
                width: 420px;
                height: 80px;

                >div {
                    height: 78px;
                    width: 78px;
                    margin-right: 2px;
                    float: left;
                    margin-bottom: 3px;
                }
            }

            .@{prefixCls}backgroundColors {
                >div {
                    float: left;
                    margin-right: 2px;
                    margin-bottom: 3px;
                    width: 46px;
                    height: 46px;
                    -moz-box-sizing: border-box;
                    -webkit-box-sizing: border-box;
                    box-sizing: border-box;
                }
            }
        }
    }
}
</style>