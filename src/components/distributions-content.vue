<template>
  <div>
    <div
        v-if="hasLicenses"
        class="download_distribution distribution-text"
        @click="downloadLicences"
    >Загрузить лицензии</div>
    <div v-if="!product.distribution" class="no-distribution">
      Нет доступных дистрибутивов
    </div>
    <div v-for="(el, index) in product.distribution" :key="index" class="download_distribution" @click="download(el.id)">
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
  data() {
    return {
      product: {
        id: this.item.id,
        modules_licenses: [],
        links: {
          product_versions: this.item.links.product_versions
        }
      },
      hasLicenses: true,
    }
  },
  methods: {
    download(distributionId) {
      this.$emit('change-distribution', distributionId);

      if (this.hasLicenses) {
        this.$emit('checkbox-all', this.product.modules_licenses.map(el => el.id));
      }
      this.$emit('create-license-archive');
    },
    downloadLicences() {
      if (!this.hasLicenses) return;
      this.$emit('checkbox-all', this.product.modules_licenses.map(el => el.id));
      this.download('not download');
    }
  },
  mounted() {
    fetch(`https://update.wizardsoft.ru${this.product.links.product_versions}`)
      .then((response) => response.json())
      .then((data) => {
         this.hasLicenses = Boolean(data.length && data[0].modules_licenses.length);
         if (data[0]) {
             this.product = data[0];
         }
      })
      .catch((err) => console.log(err))
  }
};
</script>
