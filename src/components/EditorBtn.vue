<script setup>
const props = defineProps(['icon'])
</script>
<template>
  <div class="bg-gray-100 rounded border-2 p-2 w-8 h-8 flex items-center justify-center">
    <i class="iconfont text-dark-50" :class="props.icon"></i>
  </div>
</template>