<script setup>
import markdownit from 'markdown-it'
const props = defineProps(['cardData'])
const md = new markdownit()
</script>
<template>
  <div
    v-html="md.render(cardData.content)"
    class="card-content rounded-sm p-2 border-transparent border-2 space-y-2 w-max transition hover:(!border-black/20)"
    :class="`
    ${cardData.onChoose ? '!border-black/20' : ''} 
    ${cardData.class}`"
  ></div>
</template>

<style lang="sass">

@keyframes appear
  from
    opacity: 0
  to
    opacity: 1
@mixin colors($c1, $c2)
  background: rgb(255 255 255 / 80%)
  border-color: $c1 !important
  h1
    background: $c2
.card-content
  animation: appear 0.2s ease-out
  font-family: "LXGW WenKai Screen", sans-serif !important
  color: #888
  a
    color: #888
  img
    max-width: 100%
  h1
    display: inline-block
    position: relative
    left: -1em
    margin: 0
    padding: 0.3em 1em 0.3em 1.1em
    color: #fff
    border-radius: 0.1em
    padding: 0.3em 1em 0.3em 1.1em
    font-size: 1.25em
    line-height: 1
    letter-spacing: 0.1em !important
.purple
  @include colors(#A39EBC, #857988)
.blue
  @include colors(#89D7F0, #2EBAF5)
.pink
  @include colors(#FFBACD, #FF8EA3)
.yellow
  @include colors(#FFD08B, #FFAC5E)
.green
  @include colors(#9EDA92, #7FBF4F)
.red
  @include colors(#B48081, #A66869)
</style>