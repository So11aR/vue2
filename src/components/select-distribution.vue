<template>
  <div>
    <select
      :data-id="item.id"
      id="selectDistribution"
      v-model="distributionId"
      @change="$emit('change-distribution', distributionId)"
      ref="select-distribution"
    >
      <option :value="!selected ? null : null" disabled>Выберите дистрибутив</option>
      <option value="not download">Не скачивать дистрибутив</option>
      <option
        v-for="itemDistribution in item.distribution"
        :key="itemDistribution.id"
        :value="itemDistribution.id"
      >
        {{ itemDistribution.architecture }}
        {{ itemDistribution.size }}
      </option>
    </select>
  </div>
    
</template>

<script>
export default {
  data: () => ({
    distributionId: null,
    isReset: false
  }),
  props: ["item", "taskCreated", "panels", "selected", "panelId"],
  watch: {
    taskCreated(value) {
      if(value) {
        this.distributionId = null
        this.isReset = true
      } else {
        this.isReset = false
      }
    },
    panelId() {
      this.panels.forEach( panel => {
        if(!panel.distSelected) {
          this.distributionId = null
        } 
      });
    }
  }
};
</script>