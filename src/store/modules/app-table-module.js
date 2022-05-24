export default {
  state: {
    dataLicenses: [],
  },
  mutations: {
    setLicense(state, licenses) {
      state.dataLicenses = licenses
    },
  },
  actions: {
    async fetchLicenses({ commit, rootState }) {
      return fetch(` https://update.wizardsoft.ru/api/serial/${rootState.code}/product/1/product_versions/`)
        .then(response => response.status === 200 ? response.json() : Promise.reject())
        .then(licenses => commit("setLicense", licenses))
        .catch(reason => commit("setErrorGlobal", reason || true, {root: true}))
    },
  },
  getters: {
    getDataLicenses(state) {
      return state.dataLicenses
    },
  }
}

