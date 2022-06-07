<template>

  <div >
    <div id="app-table-main" class="tables-show">
      <div class="baseTableLimit__select" @click.stop>
        <selectCount @select-count="changeSelectCount" />
      </div>
      <table id="mainTable">
        <thead @click="sortBases">
          <tr>
            <th>
              <input
                type="checkbox"
                v-model="selected"
                @change="$emit('select-all', $event, selectAll($event))"
              />
            </th>
            <th>№</th>
            <th>Наименование</th>
            <th class="region" data-sort="region">
              Регион
              <img
                class="arrow-icon"
                src="/templates/wizardsoft2/images/down-arrow.svg"
                alt=""
                width="9px"
                height="9px"
                :style="[sortRegion ? {transform: 'rotate(180deg)'} : {transform: 'rotate(0deg)'}]"
              />
            </th>
            <th class="dateTh" data-sort="updatedat">
              Дата обновления
              <!-- src="../assets/img/down-arrow.svg" -->
              <!-- src="/templates/wizardsoft2/images/down-arrow.svg" -->
              <img
                class="arrow-icon"
                width="9px"
                height="9px"
                src="/templates/wizardsoft2/images/down-arrow.svg"
                alt=""
                :style="[sortUpdatedAt ? {transform: 'rotate(180deg)'} : {transform: 'rotate(0deg)'}]"
              />
            </th>
            <th class="dateTh" data-sort="updatedate">
              Дата выгрузки
              <img
                width="9px"
                height="9px"
                class="arrow-icon"
                src="/templates/wizardsoft2/images/down-arrow.svg"
                alt=""
                :style="[sortUpdateDate ? {transform: 'rotate(180deg)'} : {transform: 'rotate(0deg)'}]"
              />
            </th>
            <th>Размер</th>
          </tr>
        </thead>
        <tr v-if="loading">
          <td class="preloader-wrapper" colspan="7">
            <preloader />
          </td>
        </tr>
        <tbody v-else>
          <tr v-for="(data, index) in pages[offset]" :key="data.id">
            <td>
              <input
                type="checkbox"
                @change="$emit('select-checkbox', $event)"
                :checked="checkboxIds.includes(data.id)"
                :data-id="
                  offset === 0 ? index + 1 : limit * offset + (index + 1)
                "
                :value="data.id"
                ref="checkbox"
              />
            </td>
            <td>
              {{ offset === 0 ? index + 1 : limit * offset + (index + 1) }}
            </td>
            <td>{{ data.basename }}</td>
            <td>
              {{ data.region }}
            </td>
            <td>{{ data.updated_at | date("datetime") }}</td>
            <td>{{ data.updatedate | date("datetime") }}</td>
            <td>{{ data.size }}</td>
          </tr>
        </tbody>
      </table>

      <div class="but__wrapper">
        <div class="but-download__info">
          <button
            class="but_download"
            @click="$emit('create-task')"
            :disabled="
              (archive.progress < 100 ? true : false) ||
              getLinks.length >= 5 ||
              emptyTasks
            "
          >
            Скачать выделенное
          </button>
          <span
            class="but-download__message"
            v-if="archive.progress < 100 ? true : false"
          >
            Вы сможете повторить операцию, после загрузки текущего пакета
          </span>
          <span class="but-download__message" v-else-if="getLinks.length >= 5">
            {{ errorTextLimit }}
          </span>
          <span class="but-download__message" v-if="emptyTasks">
            {{ emptyError }}
          </span>
        </div>

        <div class="but__controlls">
          <button
            @click="prev"
            :disabled="!canPrev"
            class="but_default_bg"
            style="margin-right: 20px"
          >
            Предыдущая
          </button>
          <button @click="next" :disabled="!canNext" class="but_default_bg">
            Следующая
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapActions, mapGetters, mapState } from "vuex";
import preloader from "@/components/preloader";
import selectCount from "@/components/select-count";
import utils from "@/utils/utils";

export default {
  data() {
    return {
      offset: 0,
      basesIds: [],
      pages: [],
      bases: [],
      checkboxSelected: [],
      totalPages: 0,
      limit: 10, // 10
      selected: false,
      optionSelected: true,
      disabledDownloadButton: false,
      counts: [10, 25, 50, 100],
      progressVisible: false,
      loading: true,
      linkDeleteText: "",
      timeout: 2000,
      snackbar: false,

      errorFetchBases: false,

      sortUpdatedAt: false,
      sortUpdateDate: false,
      sortRegion: false,

      sortingKey: null,
      sortingDirection: 'ASC',
    };
  },
  props: [
    "checkboxIds",
    "taskCreated",
    "archive",
    "errorTextLimit",
    "getLinks",
    "errorsObj",
    "emptyError",
    "emptyTasks",
    "checkboxAllEl",
  ],
  components: {
    preloader,
    selectCount,
  },
  filters: {
    numberLimit: (value) => +value,
  },
  methods: {
  //  ...mapActions(["fetchDataBases"]),

    sortedPages(sortFn) {
      return this.pages[this.offset]
        .map((item) => ({
          ...item,
          updatedate: new Date(item.updatedate).getTime(),
        }))
        .sort(sortFn)
        .map((item) => ({
          ...item,
          updatedate: new Date(item.updatedate).toJSON(),
        }));
    },
    performSorting(flag) {
        this.sortingDirection = flag ? 'ASC' : 'DESC';
        this.clearPages();
        this.splitPages();
    },
    sortBases: function (e) {
      let sortedPage = null

      this.sortingKey = e.target.dataset.sort;

      switch (e.target.dataset.sort) {
        case 'updatedate':
          this.sortUpdateDate = !this.sortUpdateDate;
          this.sortRegion = false
          this.sortUpdatedAt = false
          this.performSorting(this.sortUpdateDate);
          break
        case 'updatedat':
          this.sortUpdatedAt = !this.sortUpdatedAt;
          this.sortRegion = false
          this.sortUpdateDate = false
          this.performSorting(this.sortUpdatedAt);
          break
        case 'region':
          this.sortRegion = !this.sortRegion;
          this.sortUpdatedAt = false
          this.sortUpdateDate = false
          this.performSorting(this.sortRegion);
          break
      }
    },
    changeSelectCount(stateSelect) {
      this.$emit("select-count", stateSelect);
      this.limit = stateSelect.limit;
      this.offset = 0;
      this.clearPages();
      this.splitPages();
      if (this.checkboxAllEl) {
        this.checkboxAllEl.checked = false;
      }
    },
    next() {
      if (this.canNext) {
        if (this.selected) {
          this.selected = false;
        }
        this.offset++;
      }
    },
    prev() {
      if (this.canPrev) {
        if (this.selected) {
          this.selected = false;
        }
        this.offset--;
      }
    },
    clearPages() {
      this.pages = [];
      this.offset = 0;
    },
    splitPages() {
      this.totalPages = Math.ceil(this.dataBases.length / this.limit)

      const sorted = [...this.getDataBases];

      switch (this.sortingKey) {
          case 'updatedate':
            if (this.sortingDirection === 'ASC') {
                sorted.sort((a, b) => new Date(a.updatedate).getTime() - new Date(b.updatedate).getTime())
            } else {
                sorted.sort((a, b) => new Date(b.updatedate).getTime() - new Date(a.updatedate).getTime())
            }
          break;
          case 'updatedat':
              if (this.sortingDirection === 'ASC') {
                  sorted.sort((a, b) => new Date(a.updated_at).getTime() - new Date(b.updated_at).getTime())
              } else {
                  sorted.sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())
              }
              break;
          case 'region':
              if (this.sortingDirection === 'ASC') {
                  sorted.sort((a, b) => a.region.localeCompare(b.region))
              } else {
                  sorted.sort((a, b) => b.region.localeCompare(a.region))
              }
              break;
          default:
              break;
      }
     // console.log(Math.ceil(this.dataBases.length / this.limit))
      for (let i = 0; i < this.totalPages; i++) {
        const start = i * this.limit;
        const end = start + this.limit;
       // console.log(this.getDataBases.slice(start, end))
        this.pages.push(sorted.slice(start, end));
      }
    },
    selectAll(e) {
      return this.$refs.checkbox.map((checkbox) => {
        checkbox.checked = e.target.checked;
        return checkbox;
      });
    },
    selectCheckbox() {
      this.checkboxSelected = this.$refs.checkbox.filter(
        (checkbox) => checkbox.checked
      );
    },
  },
  watch: {
    getDataBases(value) {
     // console.log(value)
     this.clearPages()
     this.splitPages();
    }
  },
  mounted() {
    this.$store.dispatch("fetchDataBases").then(() => {
      this.splitPages();
    }).catch(error => {
      console.log(error);
      console.log(this.errorFetchBases);
      this.$store.commit('setErrorGlobal', true)

    }).finally(()=>{
      this.loading = false;
    })
    // await this.fetchDataBases();
    //await this.splitPages();

    this.pages = this.pages.map((page) => {
      return page
        .map((item) => {
          return {
            ...item,
            updatedate: new Date(item.updatedate).getTime(),
          };
        })
        .sort((a, b) => b.updatedate - a.updatedate)
        .map((item) => ({
          ...item,
          updatedate: new Date(item.updatedate).toJSON(),
        }));
    });

    // this.loading = false;
  },
  computed: {
    ...mapGetters(["getTotalPages", "getDataBases"]),
    ...mapState({dataBases: (state) => state.appTable.base
    }),
    canNext() {
      return this.offset + 1 < this.totalPages;
    },
    canPrev() {
      return this.offset > 0;
    },
  },
};
</script>
