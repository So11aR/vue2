export default {
  state: {
    base: []
  },
  mutations: {
    setBase(state, bases) {
      state.base = bases
    }
  },
  actions: {
    fetchDataBases(context, url) {
      const code = context.rootState.code;
      const baseUrl = `https://update.wizardsoft.ru/api/serial/${code}/product/1/bases/`

      // return fetch(`https://update.wizardsoft.ru/api/serial/${code}/bases/`)
      return fetch(url ? `https://update.wizardsoft.ru${url}` : baseUrl)
        .then(response => response.status === 200 ? response.json() : Promise.reject())
        .then(response => {
          context.commit("setBase", response);
          //basesBridge.newBasesExists = true;
          return response;
        })
        .catch(reason => {
          //basesBridge.newBasesExists = false;
          context.commit("setErrorGlobal", reason || true)
        });
    },
  },

  getters: {
    getDataBases(state) {
      return state.base
    },
  }
}