<script setup>
defineProps(['icon'])
</script>
<template>
  <p
    class="bg-white/90 border-black/50 border-2 rounded-sm w-10 h-10 flex justify-center items-center"
  >
    <i class="iconfont text-xl" :class="icon"></i>
  </p>
</template>