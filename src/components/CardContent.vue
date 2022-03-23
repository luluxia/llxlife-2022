<script setup>
import markdownit from 'markdown-it'
const props = defineProps(['cardData'])
const md = new markdownit()
</script>
<template>
  <div
    v-html="md.render(cardData.content)"
    class="card-content rounded-sm p-2 border-transparent border-2 space-y-4 w-max transition group-hover:(!border-black/20)"
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
.theme-purple
  h1
    background: #A39EBC
.theme-blue
  h1
    background: #89D7F0
.theme-pink
  h1
    background: #FFBACD
.theme-yellow
  h1
    background: #FFD08B
.theme-green
  h1
    background: #9EDA92
.theme-red
  h1
    background: #B48081
.card-content
  animation: appear 0.2s ease-out
  p
    letter-spacing: 1px !important
    line-height: 1.7 !important
    min-height: 1em !important
    box-sizing: border-box !important
    word-wrap: break-word !important
    text-align: justify
    // margin: 20px 0 !important
  blockquote
    border-left: 4px solid #42b983
    padding: 0 15px !important
    margin: 0px
  strong
    font-weight: bold
  body
    font-size: 15px
  pre
    background-color: #f8f8f8
    border-radius: 3px
    word-wrap: break-word
    padding: 12px 13px
    font-size: 13px
  h1,h2,h3,h4,h5,h6
    word-break: break-all !important
    line-height: 1.2
    text-align: left
    font-weight: normal
    position: relative
  h1
    color: #fff
    text-align: center
    padding: 0.5em
    border-radius: 2px
  a
    color: #42b983 !important
    text-decoration: none !important
  ul, ol
    padding-left: 30px
  li
    line-height: 24px
  hr
    border-bottom: 2px dashed #ddd
  pre
    background: #f2f2f2 !important
    padding: 12px 13px
  code
    margin: 0 2px
    padding: 3px 5px
    color: #e96900
    border-radius: 2px
    white-space: inherit
    background-color: #f8f8f8
</style>