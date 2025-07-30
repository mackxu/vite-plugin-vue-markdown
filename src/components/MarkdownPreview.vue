<template>
  <markdown :src="src"></markdown>
</template>

<script setup lang="ts">
const { src } = defineProps<{
  src: string;
}>();
</script>

<style></style>
