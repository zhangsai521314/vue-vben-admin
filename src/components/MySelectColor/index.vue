<template>
  <div class="divColor" :id="domid" :style="backgroundColor" @click="showSelectColor"></div>
  <div class="selectColorModel" ref="selectColorModelRef">
    <sketchs v-model="sketchsColor" @click="selectedColor" />
    <div class="divSelectColor">
      <a-button @click="saveColor" type="primary" style="float: right">关闭</a-button>
      <a-button @click="clearColor" style="height: 33px; margin-right: 2px; float: right"
        >清空</a-button
      >
    </div>
  </div>
</template>
<script setup>
  import { Sketch as sketchs } from '@ckpack/vue-color';
  import { ref, watch, onMounted } from 'vue';

  const emits = defineEmits(['change']);
  const props = defineProps({
    //默认颜色
    color: {
      type: String,
      default() {
        return '';
      },
    },
    //禁止选择
    disabled: {
      type: Boolean,
      default() {
        return false;
      },
    },
  });
  const backgroundColor = ref({
    backgroundColor: props.color,
  });
  const domid = myCommon.uniqueId();
  const sketchsColor = ref('');
  let isShowSelectColor = false;
  const selectColorModelRef = ref({});

  //显示颜色选择器
  function showSelectColor() {
    $('.selectColor').remove();
    if (!props.disabled) {
      isShowSelectColor =
        domid != localStorage.getItem('clickSelectColorId') ? true : !isShowSelectColor;
      localStorage.setItem('clickSelectColorId', domid);
      if (isShowSelectColor) {
        const oldColor = myCommon.rgbToHex($('#' + domid).css('background-color'));
        const $c = $(selectColorModelRef.value);
        $c.addClass('selectColor');
        $c.removeClass('selectColorModel');
        if (event.x + 221 > window.innerWidth) {
          //避免left到页面外
          $c.css({ left: event.x - 221 });
        } else {
          $c.css({ left: event.x });
        }
        if (event.y + 340 > window.innerHeight) {
          //避免top到页面外
          $c.css({ top: event.y - 340 });
        } else {
          $c.css({ top: event.y + 3 });
        }
        $('body').append($c);
        sketchsColor.value = oldColor;
      }
    }
  }

  //颜色选择
  function selectedColor() {
    emits('change', sketchsColor.value.hex8);
  }

  //关闭颜色
  function saveColor() {
    $('.selectColor').remove();
  }

  //清空颜色
  function clearColor() {
    sketchsColor.value = {};
    backgroundColor.value.backgroundColor = '';
    $('.selectColor').remove();
    emits('change', '');
  }

  onMounted(() => {
    $('body').click(function () {
      if (
        !$(event.target).hasClass('divColor') &&
        !$(event.target).hasClass('selectColor') &&
        $(event.target).parents('.selectColor').length == 0
      ) {
        $('.selectColor').remove();
      }
    });
  });

  watch(
    () => props.color,
    () => {
      backgroundColor.value.backgroundColor = props.color;
    },
  );

  watch(
    () => props.disabled,
    () => {
      $('.selectColor').remove();
    },
  );
</script>
<style scoped>
  .divColor {
    width: 25px;
    height: 25px;
    border: 1px solid #e6e6e6;
    cursor: pointer;
  }

  .divSelectColor {
    position: absolute;
    top: 296px;
    left: -1px;
    width: 221px;
    height: 38px;
    padding-right: 10px;
    border: 1px solid #bec0c2;
    border-top: none;
    border-right: 0.8px;
    border-radius: 0 0 4px 4px;
    background-color: #fff;
  }

  .selectColorModel {
    display: none;
    position: absolute;
  }
</style>
<style>
  .selectColor {
    position: absolute;
    z-index: 99999999999;
  }
</style>
