<template>
  <div class="select-wrap">
    <span class="select-label">Поиск</span>
    <div class="select-group">
      <input
        class="custom-select"
        v-model="searchString"
        v-on:keydown="$emit('search-input', searchString)"
      >
    </div>
  </div>
</template>

<script>
export default {
  data: () => ({
    searchString: '',
  }),
};
</script>
