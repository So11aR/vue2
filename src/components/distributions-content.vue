<template>
  <div>
    <div
        v-if="item.modules_licenses.length > 0"
        class="download_distribution distribution-text"
        @click="downloadLicences"
    >Загрузить лицензии</div>
    <div v-for="(el, index) in item.distribution" :key="index" class="download_distribution" @click="download(el.id)">
      <span class="distribution-text">Загрузить дистрибутив {{ el.architecture }}</span>
      <span class="distribution-size">{{ el.size }}</span>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    item: {
      type: Object,
      required: true,
    },
  },
  methods: {
    download(distributionId) {
      this.$emit('change-distribution', distributionId);
      this.$emit('checkbox-all', this.item.modules_licenses.map(el => el.id));
      this.$emit('create-license-archive');
    },
    downloadLicences() {
      this.$emit('checkbox-all', this.item.modules_licenses.map(el => el.id));
      this.download('not download');
    }
  },
};
</script>
