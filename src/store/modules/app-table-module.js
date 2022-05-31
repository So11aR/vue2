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
      return fetch(`https://update.wizardsoft.ru/api/serial/${rootState.code}/products`)
        .then(response => response.status === 200 ? response.json() : Promise.reject())
        .then((licenses) => {
          const promises = licenses
              .map(url => fetch(`https://update.wizardsoft.ru${url.links.product_versions}`).then(r => r.json()));

          Promise.all(promises).then((data) => {
            const notEmpty = data.filter(el => Boolean(el.length)).flat();
            return commit("setLicense", notEmpty)
          });
        })
        .catch(reason => commit("setErrorGlobal", reason || true, {root: true}))
    },
  },
  getters: {
    getDataLicenses(state) {
      return state.dataLicenses
    },
  }
}

