<template>
  <MyContent :class="prefixCls">
    <a-spin :spinning="loadingEquipment">
      <div style="width: 100%; padding: 6px; background-color: #fff">
        <AuthDom auth="performance_query">
          <label>{{ t('view.deviceName') }}：</label>
          <a-select
            style="width: calc(100% - 200px)"
            mode="multiple"
            allow-clear
            show-search
            :maxTagCount="8"
            :filter-option="AntVueCommon.filterOption"
            v-model:value="subscribeEquipment"
            :options="equipmentData"
          />
        </AuthDom>
      </div>
      <div
        style="
          display: flex;
          flex-flow: row wrap;
          flex-grow: 1;
          align-content: flex-start;
          padding: 6px;
        "
      >
        <div
          v-for="(value, index) in userStore.getUserMqTopic?.filter((m) => m.subscribeType == 1)"
          :key="index"
          style="
            display: flex;
            width: calc(50% - 10px);
            height: 374px;
            margin: 5px;
            background-color: #fff;
          "
        >
          <content
            v-if="mqttStore.userTopicPerformanceNewValue.hasOwnProperty(`${value.topic}`)"
            :newDataInfo="mqttStore.userTopicPerformanceNewValue[`${value.topic}`]"
            :name="equipmentData.find((m) => m.serviceCode == value.keyId)?.label"
          ></content>
          <content
            v-else
            :newDataInfo="null"
            :name="equipmentData.find((m) => m.serviceCode == value.keyId)?.label"
          ></content>
        </div>
      </div>
    </a-spin>
  </MyContent>
</template>
<script setup lang="ts">
  import content from './content.vue';
  import AntVueCommon from '@/utils/MyCommon/AntVueCommon';
  import { useDesign } from '@/hooks/web/useDesign';
  import { ref, watch } from 'vue';
  import performanceApi from '@/api/performance';
  import equipmentApi from '@/api/equipment';
  import { useMqttStoreWithOut } from '@/store/modules/mqtt';
  import { useUserStore } from '@/store/modules/user';
  import { useI18n } from '@/hooks/web/useI18n';
  import { useLocaleStore } from '@/store/modules/locale';

  const { t } = useI18n();
  const localeStore = useLocaleStore();
  const locale = localeStore.getLocale;
  defineOptions({ name: 'Performance' });
  const { prefixCls } = useDesign('performance-');

  const userStore = useUserStore();
  const mqttStore = useMqttStoreWithOut();
  const loadingEquipment = ref(true);
  //订阅设备选项
  const equipmentData = ref([]);
  //中订阅的设备id
  const subscribeEquipment = ref([]);

  getEquipments();

  //获取设备
  function getEquipments() {
    equipmentApi
      .GetPerformanceEquipmentSimple({
        execompleteBefore: () => {
          loadingEquipment.value = false;
        },
      })
      .then((data) => {
        equipmentData.value = data.filter((m) => m.serviceCode != null);
        getUserSubscribes();
      })
      .catch(() => {
        equipmentData.value = [];
        userStore.userInfo.userMqTopic = userStore.userInfo.userMqTopic.filter(
          (m) => m.subscribeType != 1,
        );
      });
  }

  //获取订阅的设备
  function getUserSubscribes() {
    performanceApi
      .GetUserSubscribes({ subscribeType: 1 })
      .then((data) => {
        subscribeEquipment.value = data.map((m) => m.equipmentId);
        if (subscribeEquipment.value.length == 0) {
          userStore.userInfo.userMqTopic = userStore.userInfo.userMqTopic.filter(
            (m) => m.subscribeType != 1,
          );
        } else {
          const keyIds = data.map((m) => m.keyId);
          userStore.userInfo.userMqTopic = userStore.userInfo.userMqTopic.filter(
            (m) => m.subscribeType == 1 && keyIds.indexOf(m.keyId) != -1,
          );
        }
      })
      .catch(() => {
        subscribeEquipment.value = [];
        userStore.userInfo.userMqTopic = userStore.userInfo.userMqTopic.filter(
          (m) => m.subscribeType != 1,
        );
      });
  }

  //监控订阅设备
  watch(
    () => subscribeEquipment.value,
    (n, o) => {
      const data = [];
      if (n.length > o.length) {
        n.forEach((id) => {
          if (!o.includes(id)) {
            const t = `${mqttStore.mqttConfig.UpPerformance}/${equipmentData.value.find((m) => m.key == id).serviceCode}`;
            const newData = {
              subscribeType: 1,
              keyId: equipmentData.value.find((m) => m.key == id).serviceCode,
              topic: t,
            };
            data.push(newData);
            if (!userStore.userInfo?.userMqTopic.find((m) => m.topic == t)) {
              userStore.userInfo?.userMqTopic.push(newData);
            }
            try {
              mqttStore.subscribe(t, (e) => {});
            } catch (error) {}
          }
        });
        performanceApi.UserSubscribeTopic(data);
      } else if (n.length < o.length) {
        o.forEach((id) => {
          if (!n.includes(id)) {
            const t = `${mqttStore.mqttConfig.UpPerformance}/${equipmentData.value.find((m) => m.key == id).serviceCode}`;
            data.push(t);
            userStore.userInfo.userMqTopic = userStore.userInfo.userMqTopic.filter(function (m) {
              return m.topic !== t;
            });
            try {
              mqttStore.unSubScribe(t, (e) => {});
            } catch (error) {}
          }
        });
        performanceApi.CancelUserSubscribeTopic({ topic: data });
      }
    },
  );
</script>
<style lang="less" scoped>
  @prefixCls: ~'@{namespace}-performance-';

  .@{prefixCls} {
    :deep(.ant-spin-container) {
      display: flex;
      flex-direction: column;
    }
  }
</style>
