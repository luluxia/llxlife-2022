<script setup>
import { reactive } from 'vue'
defineProps(['openEdit', 'editCheck'])
let editKey = reactive('')
</script>
<template>
  <div
    class="fixed bottom-16 left-4 p-2 bg-white/90 rounded-sm border-2 border-black/50 text-dark-50 text-sm z-9999 transition opacity-0 pointer-events-none"
    :class="openEdit ? 'opacity-100 pointer-events-auto' : ''"
  >
    <template v-if="editCheck">
      <p>当前正处于创造模式中</p>
      <p @click="$emit('closeEdit')" class="text-blue-dark inline-block text-cyan-600">关闭创造模式</p>
    </template>
    <template v-else>
      <p>正在启动创造模式……</p>
      <p>验证用户身份中……</p>
      <p>请输入您的超级密钥……</p>
      <input
        class="bg-gray-100 mt-1 p-1 w-22 rounded-sm border-black/20 border-2 mr-2"
        type="password"
        v-model="editKey"
      />
      <p @click="$emit('checkEdit', editKey)" class="inline-block text-cyan-600">确认密钥</p>
    </template>
  </div>
</template>