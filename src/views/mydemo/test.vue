<template>
  <div :class="`${prefixCls}bottom-center`">
    <view2d
      v-for="(item, index) in canvasCotainers.filter((m) => m.canvasType == '2d')"
      :key="index"
      ref="containerObArray"
      :changeSelectOb="changeSelectOb"
      :assemblyConfig="assemblyConfig"
      :canvasId="item.containerId"
      :canvasConfig="canvasConfig[item.containerId].canvas2dConfig"
      :domConfig="canvasConfig[item.containerId].domConfig"
      :getvideoData="getvideoData"
      :getSelectob="getSelectob"
      :updateSelectContainerValue="updateSelectContainerValue"
      :showSaveComponent="showSaveComponent"
      :refreshassemblyTreeData="refreshassemblyTreeData"
      viewType="edit"
    />
  </div>
</template>
