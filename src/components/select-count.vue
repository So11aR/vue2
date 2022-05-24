<template>
  <div class="select-wrap" @click.stop>
    <span class="select-label">Показывать записей</span>
    <div class="select-group">
      <!-- <label v-if="labelView">{{ limit }}</label> -->
      <select
        class="custom-select"
        v-model="limit"
        @change="$emit('select-count', changeSelect())"
      >
        <option :value="count" v-for="count in counts" :key="count">
          {{ count }}
        </option>
      </select>
    </div>
  </div>
</template>

<script>
export default {
  data: () => ({
    limit: 10,
    counts: [10, 25, 50, 100],
    labelView: true,
    selectedValue: false,
  }),
  methods: {
    changeSelect() {
      this.labelView = false;
      this.selectedValue = true;
      return {
        limit: this.limit,
        labelView: this.labelView,
        selectedValue: this.selectedValue,
      };
    },
  },
};
</script>