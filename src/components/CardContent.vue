<script setup>
import markdownit from 'markdown-it'
const props = defineProps(['cardData'])
const md = new markdownit()
let defaultRender = md.renderer.rules.link_open || function (tokens, idx, options, env, self) {
  return self.renderToken(tokens, idx, options)
}
md.renderer.rules.link_open = function (tokens, idx, options, env, self) {
  if (tokens[idx].attrs[0][1][0] != '#') {
    tokens[idx].attrPush(['target', '_blank'])
    tokens[idx].attrs[1][1] = '_blank'
  }
  return defaultRender(tokens, idx, options, env, self)
}
</script>
<template>
  <div
    class="rounded-sm p-2 border-transparent border-2 flex items-center transition hover:(!border-black/20)"
    :class="`
    ${cardData.onChoose ? '!border-black/20' : ''} 
    ${cardData.class}`"
  >
    <div class="card-content space-y-2" v-html="md.render(cardData.content)"></div>
  </div>
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
  h2
    color: $c2
.card-content
  animation: appear 0.2s ease-out
  font-family: "LXGW WenKai Screen", sans-serif !important
  color: #888
  a
    color: #888
    text-decoration: none
    border-bottom: 1px dashed
  img
    max-width: 100%
    display: block
  h1
    display: inline-block
    position: absolute
    left: -0.5em
    top: 0.5em
    margin: 0
    padding: 0.3em 1em 0.3em 1.1em
    color: #fff
    border-radius: 0.1em
    padding: 0.3em 1em 0.3em 1.1em
    font-size: 1.25em
    line-height: 1
    letter-spacing: 0.1em !important
    font-weight: normal
  h2
    font-weight: normal
  h1+p
    padding-top: 2em
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

.photo
  background: none
  h1
    position: absolute
    bottom: 1em
    left: -0.5em
    top: inherit
  img
    position: absolute
    top: 0
    left: 0
    width: 100%
    height: 100%
    object-fit: cover
    border-radius: 0.4em
    z-index: -1
</style>