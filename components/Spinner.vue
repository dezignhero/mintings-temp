<template>
  <div class="spinner mx-auto" :class="{ 'spinner-white': alt }">
    <div class="bounce1"></div>
    <div class="bounce2"></div>
    <div class="bounce3"></div>
  </div>
</template>

<script>
export default {
  props: ['alt']
}
</script>
