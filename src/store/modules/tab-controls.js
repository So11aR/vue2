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
          const bases = response
              .map(url => fetch(`https://update.wizardsoft.ru${url.links.bases}`).then(r => r.json()));

          return Promise.all(bases).then((data) => {
            const notEmpty = response.filter((el, index) => data[index].length > 0);
            context.commit("setProduct", notEmpty);
            return notEmpty;
          });
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
