import NotFoundException from "./exceptions/NotFoundException";

export default {
  state: {
    typeProducts: []
  },
  mutations: {
    setProduct(state, products) {
      state.typeProducts = products
    }
  },
  actions: {
    fetchDataProducts(context) {
      const code = context.rootState.code;
      return fetch(`https://update.wizardsoft.ru/api/serial/${code}/products/`)

        .then(response => {
          //basesBridge.newBasesExists = response.status === 200;
          if (response.status === 200) {
            return response.json()
          }
          throw new NotFoundException("Bad response from server");
        })
        .then(response => {
          context.commit("setProduct", response);
          return response;
        })
        .catch(reason => {
          if (reason instanceof NotFoundException) {
            return []
          } else {
            return Promise.reject(reason)
          }
        });
    },
  },
  getters: {
    getDataProducts(state) {
      return state.typeProducts
    },
  }
}