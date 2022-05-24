<template>
  <div>
    <div id="app-table-module">
      <div class="baseTableLimit__select" @click.stop>
        <selectCount @select-count="changeSelectCount" />
      </div>
      <v-expansion-panels>
        <v-expansion-panel
          v-for="(item) in pages[offset]"
          :key="item.id"
          :data-id="item.id"
          @click="changePanel"
          ref="expPanel"
        >
          <v-expansion-panel-header>
            <span class="panel-header-title">{{ item.name }}</span>
            </v-expansion-panel-header
          >
          <v-expansion-panel-content>
            <distributions-content
                @checkbox-all="selectLicences"
                @change-distribution="changeDistributionSelect"
                @create-license-archive="createLicenceArchieve"
                :item="item"
            />
          </v-expansion-panel-content>
        </v-expansion-panel>
      </v-expansion-panels>

      <div class="but__wrapper">
        <div class="but-download__info">
          
          <span
            class="but-download__message"
            v-if="archive.progress < 100 ? true : false"
          >
            Вы сможете повторить операцию, после загрузки текущего пакета
          </span>
          <span class="but-download__message" v-else-if="getLinks.length >= 5">
            {{ errorTextLimit }}
          </span>
          <span
            class="but-download__message"
            v-else-if="emptyTasks"
          >
            {{ emptyError }}
          </span>
        </div>

      </div>
    </div>
  </div>
</template>

<script>
import { mapActions, mapGetters } from "vuex";
import preloader from "@/components/preloader";
import tableLicenses from "@/components/table-licenses";
import utils from "@/utils/utils";
import selectCount from "@/components/select-count";
import selectDistribution from "@/components/select-distribution";
import distributionsContent from "@/components/distributions-content";

export default {
  name: "app-table-module",
  data: () => ({
    offset: 0,
    optionSelected: true,
    pages: [],
    basesIds: [],
    totalPages: 0,
    limit: 10, // 10
    selected: false,
    loading: true,
    linkReadyBases: true,
    progressVisible: false,
    errorsObj: {
      WAITING: "Пакет добавлен в очередь на загрузку",
      IN_PROCESS: "Загрузка пакета программных продуктов",
      SUCCESS: "Загрузка завершена",
      FAILURE: "Ошибка создания архива",
    },
    disabledDownloadButton: false,
    panels: [],
    panelId: null,
    licenseModulesIds: [],
    
  }),
  components: {
    preloader,
    selectDistribution,
    tableLicenses,
    selectCount,
    distributionsContent
  },
  props: {
    archive: {
      type: Object,
      required: true,
    },
    distributionId: {
      required: true,
    },
    errorTextLimit: {
      type: String,
      required: true,
    },
    getLinks: {
      required: true,
    },
    taskCreated: {
      required: true,
    },
    panel: {
      required: true,
    },
    emptyTasks: {
      required: true,
    },
    emptyError: {
      required: true,
    }
  },
  computed: {
    ...mapGetters(["getDataLicenses"]),
    canNext() {
      return this.offset + 1 < this.totalPages;
    },
    canPrev() {
      return this.offset > 0;
    },
  },
  watch: {
    limit(value) {
      if (this.selected) {
        this.selected = false;
      }
      this.clearPages();
      this.splitPages();
      this.offset = 0;
    },
  },
  methods: {
    ...mapActions(["fetchLicenses"]),
    changeSelectCount(stateSelect) {
      this.$emit("select-count", stateSelect);
      this.limit = stateSelect.limit;
      this.offset = 0;
      this.clearPages();
      this.splitPages();
    },
    changePanel(e) {
      
      
      this.$emit("change-panel", e, this.panels, this.licenseModulesIds);
      this.panelId = +e.target.parentElement.dataset.id;

      this.licenseModulesIds = []
    },
    selectCheckbox(e) {
      this.$emit("select-checkbox", e);
    },
    changeDistributionSelect(distId) {
      const panelIndex = this.panels.findIndex(
        (panel) => panel.id === this.panelId
      );
      this.panels[panelIndex].distSelected = true;
      this.$emit(
        "change-distribution",
        distId,
        this.panels[panelIndex].distSelected
      );
    },
    splitPages() {
      this.totalPages = Math.ceil(this.getDataLicenses.length / this.limit);
      for (let i = 0; i < this.totalPages; i++) {
        const start = i * this.limit;
        const end = start + this.limit;
        this.pages.push(this.getDataLicenses.slice(start, end));
      }
    },
    clearPages() {
      this.pages = [];
    },
    next() {
      if (this.canNext) {
        this.offset++;
      }
    },
    prev() {
      if (this.canPrev) {
        this.offset--;
      }
    },
    selectAll(e, checkboxes) {
      checkboxes = checkboxes.map((checkbox) => {
        checkbox.checked = e.target.checked;
        return checkbox;
      });
      const panelIndex = this.panels.findIndex(
        (panel) => panel.id === this.panelId
      );
      if (e.target.checked) {
        this.panels[panelIndex].checkboxes = checkboxes;
        this.panels[panelIndex].checkboxes.forEach((checkbox) => {
          this.licenseModulesIds.push(+checkbox.value);
        });
      } else {
        utils.resetCheckbox(this.panels[panelIndex].checkboxes);
        this.licenseModulesIds = [];
      }
      this.$emit("select-all", e, checkboxes);
    },
     selectLicences(checkboxes) {
      this.$emit("select-all-licenses", checkboxes);
    },
    createLicenceArchieve() {
      this.$emit("create-license-archive");
    }
  },
  async mounted() {
    await this.fetchLicenses();
    await this.splitPages();

    this.$refs.expPanel?.forEach((element) => {
      this.panels.push({
        id: element.$attrs["data-id"],
        checkboxes: [],
        status: false,
        distSelected: false,
      });
    });

    this.loading = false;
  },
};
</script>