import { tryOnUnmounted } from '@vueuse/core';

//避免页面销毁，定时器还在执行--弃用
export function useTimeFn(id, page, key) {
  if (window[page] == undefined) {
    window[page] = {};
  }
  window[page][key] = id;
  tryOnUnmounted(() => {
    for (const key in window[page]) {
      clearTimeout(window[page][key]);
      clearInterval(window[page][key]);
    }
  });
  return id;
}
