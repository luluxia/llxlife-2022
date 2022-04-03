<script setup>
defineProps(['modelValue', 'onJump'])
defineEmits(['update:modelValue'])
</script>
<template>
  <div
    class="fixed bottom-16 right-4 bg-white/90 border-black/50 border-2 rounded-sm p-2 text-dark-50 text-sm transition opacity-0 pointer-events-none z-9999"
    :class="onJump ? 'opacity-100 pointer-events-auto' : ''"
  >
    <p>系统初始化已完成……</p>
    <p>燃料确认充足……</p>
    <p>跃迁引擎已启动……</p>
    <p>请指定跳跃坐标……</p>
    <input
      :value="modelValue.x"
      @input="$emit('update:modelValue', { ...modelValue, x: $event.target.value })"
      class="bg-gray-100 p-1 w-22 rounded-sm border-black/20 border-2 mr-2 mt-1"
      placeholder="x"
      type="text"
    />
    <input
      :value="modelValue.y"
      @input="$emit('update:modelValue', { ...modelValue, y: $event.target.value })"
      class="bg-gray-100 p-1 w-22 rounded-sm border-black/20 border-2 mr-2"
      placeholder="y"
      type="text"
    />
    <p class="btn-jump text-cyan-600 inline-block">启动跃迁引擎</p>
  </div>
</template>