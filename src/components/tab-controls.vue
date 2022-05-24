<template>
  <div class="smetaWizard__controlls">
    <button
      v-for="product in products"
      @click="tabChange(product)"
      :data-type="product.id"
      :key="product.id"
      :class="{ tableActive: product.isActive }"
      class="tableDatabase"
    >
      Базы данных {{ product.name }}
    </button>

    <button
      @click="activeLicense"
      data-type="lc"
      :class="{ tableActive: isActive }"
      class="tableLicense"
    >
      Обновления ПП и лицензии к модулям
    </button>
  </div>
</template>

<script>
import { mapActions, mapGetters, mapState } from "vuex";

export default {
  data: () => ({
    isActive: false,
    products: [],
  }),
  methods: {
    ...mapActions(["fetchDataProducts"]),
    activeLicense(event) {
      // this.isActive = !this.isActive
      this.isActive = true;
      if (this.isActive) {
        this.products = this.products.map((product) => {
          product.isActive = false;
          return product;
        });
      }
      this.$emit("tab-active", event, this.isActive);
    },
    tabChange(product) {
      const tabIndex = this.products.findIndex(
        (tab) => Number(tab.id) === Number(product.id)
      );

      this.products.forEach(i => i.isActive = false)
      this.products[tabIndex].isActive = true
      this.isActive = false
      
      this.$emit("tab-change", product);
    },
  },
  computed: {
    ...mapState({ typeProduct: (state) => state.tabControls.typeProducts }),
    ...mapGetters(["getDataProducts"]),
  },
  mounted() {
    this.fetchDataProducts().then((products) => {
      products.map((product, index) => {
        this.products.push({ ...product, isActive: !index });
      });
      if(products.length >= 2) {
        this.tabChange(this.products[1])
      } else {
        this.tabChange(this.products[0])
      }
    });
  },
};
</script>