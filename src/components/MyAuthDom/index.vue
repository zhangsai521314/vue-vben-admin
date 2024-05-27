<script lang="ts">
  import { defineComponent } from 'vue';
  import { getSlot } from '@/utils/helper/tsxHelper';
  import { usePermissionStoreWithOut } from '@/store/modules/permission';
  import { useUserStore } from '@/store/modules/user';

  export default defineComponent({
    name: 'AuthDom',
    props: {
      //权限类型。命名规则：页面名称.{组件名称.}功能名称
      auth: {
        type: String,
        default: '',
      },
    },
    setup(props, { slots }) {
      const permissionStore = usePermissionStoreWithOut();
      const userStore = useUserStore();
      const power = () => {
        if (!userStore.userInfo?.isAdmin) {
          const { auth } = props;
          if (auth) {
            try {
              const mySlots = getSlot(slots);
              mySlots[0].props['auth'] = auth;
              if (mySlots[0].props.hasOwnProperty('class')) {
                mySlots[0].props['class'] = `${mySlots[0].props['class']} auth`;
              } else {
                mySlots[0].props['class'] = 'auth';
              }
              const domAuth = permissionStore.getDomAuthList?.find((m) => m.authName == auth);
              if (domAuth && domAuth.powerType != '') {
                //判断权限
                if (
                  domAuth.powerType.split(',').indexOf('1') == -1 &&
                  domAuth.powerType.split(',').indexOf('9') == -1
                ) {
                  //只读
                  mySlots[0].props['class'] = `${mySlots[0].props['class']} not-click`;
                  console.log('只读', mySlots[0].props['class']);
                }
                return mySlots;
              } else {
                return null;
              }
            } catch (error) {
              console.error(`按钮权限解析错误：${error}`);
            }
          } else {
            return getSlot(slots);
          }
        }
        return getSlot(slots);
      };
      return () => {
        return power();
      };
    },
  });
</script>
