import Vue from 'vue'
import Vuex from 'vuex'
import appTable from '@/store/modules/app-table'
import appTableModule from '@/store/modules/app-table-module'
import tabControls from '@/store/modules/tab-controls'


Vue.use(Vuex)

export const DEFAULT_CODE = 222

export default new Vuex.Store({
  state: {
    archive: {},
    archiveTasks: {},
    archives: [],
    link: '#',
    links: [],
    messageError: '',
    errorGlobal: false,
    code: undefined
  },
  mutations: {
    setCode(state, payLoad) {
      state.code = String(payLoad)
    },
    setErrorGlobal(state, errorflag) {
      state.errorGlobal = errorflag
    },
    setArchiveTasks(state, data) {
      state.archiveTasks = data
    },
    setArchive(state, archive) {
      state.archive = archive
    },
    setArchives(state, archives) {
      state.archives = archives
    },
    createLinks(state, links) {
      if (Array.isArray(links)) {
        state.links = links.map(link => `https://update.wizardsoft.ru/api/serial/${link.code}/archives/${link.id}/download/`)
      }
      else {
        const link = `https://update.wizardsoft.ru/api/serial/${links.code}/archives/${links.id}/download/`
        !state.links.includes(link) && state.links.push(link)
      }
    },
    setMessageError(state, error) {
      state.messageError = error
    }
  },
  actions: {
    applicationInit(context, { code = undefined }) {
      context.commit("setCode", code)

      //const code = encodeURIComponent(document.querySelector('#snb_update_options').dataset.code)
    },
    // Отправка задач на архивирование #26660
    async fetchArchiveTasks({ commit, getters, dispatch, state }, data) {
      try {
        // const code = encodeURIComponent(document.querySelector('#snb_update_options').dataset.code)
        // const code = 100;
        const response = await fetch(`https://update.wizardsoft.ru/api/serial/${state.code}/archives/`, {
          method: 'POST',
          mode: 'cors',
          headers: {
            'Content-Type': 'application/json;charset=utf-8'
          },
          body: JSON.stringify(data)
        });

        const responseData = await response.json()

        if (!response.ok) {
          throw (responseData)
        }

        await dispatch("fetchArchive", responseData.id)
        let clearTimer = setInterval(async () => {
          await dispatch("fetchArchive", responseData.id)
          await dispatch("fetchArchives")

          if (getters.archive.progress === 100) {
            ;
            clearInterval(clearTimer)
          }
        }, 1000)

      } catch (error) {
        console.log(error)
        //commit("setMessageError", error.error[0])
      }
    },

    // архивированный файл
    async fetchArchive({ commit, state }, id = '') {
      console.log(state.code)
      try {
        const response = await fetch(`https://update.wizardsoft.ru/api/serial/${state.code}/archives/${id}/`);
        const archive = await response.json();

        const dataLink = {
          code: state.code,
          id: archive.id
        }

        commit("setArchive", archive);
        commit("createLinks", dataLink);

      } catch (error) {
        throw new Error(error)
      }
    },

    // Получение всех текущих архивов с сервера
    fetchArchives({ commit, state }, id = '') {
      fetch(`https://update.wizardsoft.ru/api/serial/${state.code}/archives/`)
        .then(response => response.status == 200 ? response.json() : [])
        .then(archives => {
          commit("createLinks", archives.map(archive => ({code: state.code, id: archive.id})));
          commit("setArchives", archives);
        }).catch(reason => console.info(reason))
    },
    async deleteArchive({ commit, state }, id) {
      try {
        const response = await fetch(`https://update.wizardsoft.ru/api/serial/${state.code}/archives/${id}/`, {
          method: 'DELETE',
          mode: 'cors',
        });
      } catch (error) {
        throw new Error(error)
      }
    }
  },
  getters: {
    getArchiveTasks(state) {
      return state.archiveTasks
    },
    archive(state) {
      return state.archive
    },
    waitingTask(state) {
      return state.waitingTask
    },
    getLink(state) {
      return state.link
    },
    getArchives(state) {
      return state.archives
    },
    getLinks(state) {
      return state.links
    },
    getMessageError(state) {
      return state.messageError
    }
  },
  modules: {
    appTable,
    appTableModule,
    tabControls
  }
})
