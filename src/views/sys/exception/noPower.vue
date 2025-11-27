<template>
  <div style="padding: 10px; color: red; font-size: 18px; font-weight: 800">
    {{ t('view.noPower') }}
  </div>
</template>
<script setup>
  import { useI18n } from '@/hooks/web/useI18n';

  const { t } = useI18n();
</script>
