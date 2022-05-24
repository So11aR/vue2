<!--

<div v-if="errorGlobal">
      <span>Для указанного серийного номера отсутствуют данные SmetaWIZARD 5</span>
    </div>

    <div v-else>
      <Progressbar :archive="archive" />
    <Links
      :taskCreated="taskCreated"
      :archive="archive"
      :getLinks="getLinks"
      :getArchives="getArchives"
    />

-->

<!--

<div>
      <Progressbar :archive="archive" />
    <Links
      :taskCreated="taskCreated"
      :archive="archive"
      :getLinks="getLinks"
      :getArchives="getArchives"
    />

-->

<template>
  <div id="app" v-if="ready">
  

    <div v-if="errorGlobal">
      <span>Для указанного серийного номера отсутствуют данные SmetaWIZARD 5</span>
    </div>

    <div v-else>
      <Progressbar :archive="archive" />
    <Links
      :taskCreated="taskCreated"
      :archive="archive"
      :getLinks="getLinks"
      :getArchives="getArchives"
    />

    


    <tabControls @tab-active="tabActive" @tab-change="tabChange" />



    <appTable
      v-if="tabBaseIsActive"
      ref="appTable"
      @select-all="checkboxSelectAll"
      @select-all-licenses="selectAllLicences"
      @select-checkbox="checkboxCheck"
      @create-task="createTasks"
      @select-count="changeSelectCount"
      :checkboxIds="checkboxIds"
      :taskCreated="taskCreated"
      :archive="archive"
      :errorTextLimit="errorTextLimit"
      :getLinks="getLinks"
      :emptyError="emptyError"
      :emptyTasks="emptyTasks"
      :checkboxAllEl="checkboxAllEl"
    />
    <appTableModule
      v-else
      @change-distribution="setDistributionId"
      @select-checkbox="checkboxCheck"
      @create-license-archive="createLicenseTask"
      @select-all="checkboxSelectAll"
      @select-all-licenses="selectAllLicences"
      @select-count="changeSelectCount"
      @change-panel="changePanel"
      :archive="archive"
      :distributionId="distributionId"
      :errorTextLimit="errorTextLimit"
      :getLinks="getLinks"
      :emptyError="emptyError"
      :emptyTasks="emptyTasks"
      :panel="panel"
      :taskCreated="taskCreated"
    />
    </div>

    


    

    
  </div>
</template>

<script>
import appTableModule from "@/components/app-table-module";
import appTable from "@/components/app-table";
import { mapActions, mapGetters } from "vuex";
import utils from "@/utils/utils";
import tabControls from "@/components/tab-controls";
import SelectCount from "@/components/select-count";
import Progressbar from "@/components/progressbar";
import Links from "@/components/links";
import { mapState } from "vuex"
import {DEFAULT_CODE} from "@/store/index"


export default {
  name: "App",
  data: () => ({
    tabBaseIsActive: false,
    tabLicenseIsActive: false,
    checkboxIds: [],
    selectedCheckbox: [],
    checkboxAllEl: "",
    taskCreated: false,
    distributionId: null,
    emptyError: "",
    emptyTasks: false,
    errorTextLimit:
      "Вы не можете хранить больше 5 ссылок одновременно. Для загрузки удалите ссылку",
    licenseTaskData: {},
    panel: {},
    licModIds: [],
    panelId: null,
    panels: [],
    ready: false
  }),
  components: {
    appTableModule,
    tabControls,
    appTable,
    SelectCount,
    Progressbar,
    Links,
  },
  methods: {
    ...mapActions(["fetchDataBases", "fetchArchives", "fetchArchiveTasks", "fetchDataProducts", "applicationInit"]),
    tabChange(product) {
      // console.log(url)
      console.log(product)
      this.tabBaseIsActive = product.isActive
      this.tabLicenseIsActive = false
      
      this.fetchDataBases(product.links.bases).then(()=>{
        // this.$refs.appTable.clearPages()
        // this.$refs.appTable.splitPages()
      })
      
      //console.log(this.$refs.appTable)
      //this.$refs.appTable.clearPages()
      console.log("меняю таб")
    },
    changePanel(e, panels, licModIds) {
      this.panelId = +e.target.parentElement.dataset.id;
      this.panels = panels;
      panels.forEach((panel) => {
        if (this.panelId === panel.id) {
          panel.status = !panel.status;
          panel.current = true;
          this.panel = panel;
          this.checkboxIds = licModIds
        } else {
          panel.current = false;
          if (!panel.current) {
            panel.status = false;
            this.emptyTasks = false
            if(panel.distSelected) {
              this.distributionId = null
              panel.distSelected = false
            }
            if (panel.checkboxes.length) {
              utils.resetCheckbox(panel.checkboxes);
              utils.resetCheckboxAll(this.checkboxAllEl);
              this.checkboxIds.splice()
            }
          }
        }
      });
    },
    changeSelectCount(stateSelect) {
      if (stateSelect.selectedValue) {
        this.selectedCheckbox.forEach((checkbox, index) => {
          if (+checkbox.value === this.checkboxIds[index]) {
            if (checkbox.checked) {
              checkbox.checked = false;
            }
          }
        });
        this.checkboxIds = [];
        this.selectedCheckbox = [];
      }
    },
    selectAllLicences(checkboxes) {
      this.checkboxIds = checkboxes;
    },
    checkboxSelectAll(event, checkboxes) {
      this.checkboxAllEl = event.target;
      if (this.checkboxAllEl.checked) {
        this.selectedCheckbox = checkboxes.filter(
          (checkbox) => checkbox.checked
        );

        if (this.selectedCheckbox.length) {
          this.checkboxIds = this.selectedCheckbox.map(
            (checkbox) => +checkbox.value
          );
        }

        this.emptyTasks = false;
      } else {
        utils.resetCheckbox(this.selectedCheckbox);
        this.checkboxIds.splice(0);
      }
    },
    checkboxCheck(e) {
      const target = e.target;
      if (!this.checkboxIds.includes(+target.value) && target.checked) {
        this.checkboxIds.push(+target.value);
        this.selectedCheckbox.push(target);
        if(this.panelId) {
          this.panel.checkboxes = this.selectedCheckbox
        }
        this.emptyTasks = false;
      } else {
        const index = this.checkboxIds.findIndex(
          (item) => item === +target.value
        );
        const checkboxIndex = this.selectedCheckbox.findIndex(
          (item) => +item.value === +target.value
        );
        this.checkboxIds.splice(index, 1);
        this.selectedCheckbox.splice(checkboxIndex, 1);
      }
    },
    tabActive(e, isActive) {
      console.log(isActive)
      this.tabBaseIsActive = false
      this.tabLicenseIsActive = true
      this.resetData()
    },
    resetData() {
      this.checkboxIds = []
      utils.resetCheckboxAll(this.checkboxAllEl)
      this.selectedCheckbox = []
      this.panel.checkboxes = []
      this.distributionId = null
      this.panel.distSelected = false
      this.panel.status = false
      this.panel.current = false
      this.emptyTasks = false
    },
    setDistributionId(distributionId) {
      this.distributionId = distributionId;
    },
    downloadFile(link, archiveName) {
      const linkEl = document.createElement("a");
      linkEl.href = link;
      linkEl.setAttribute("download", archiveName);
      linkEl.setAttribute("target", "_blank");
      linkEl.dataset.link = "";
      linkEl.style.display = "none";
      linkEl.click();
      return false;
      
    },
    async createTasks() {
      const archiveTasks = {
        type_task: "bases",
        data: {
          bases_ids: this.checkboxIds,
        },
      };
      if (this.getArchives.length !== 5) {
        if (!this.checkboxIds.length) {
          this.emptyError = "Для скачивания, выберите хотя бы один элемент";
          this.emptyTasks = true;
          return;
        }
        await this.saveBaseTask(archiveTasks);
        const clearTimer = setInterval(() => {
          if (this.archive.progress === 100) {
            const lastLinkArchive = this.getLinks[this.getLinks.length - 1];
            this.downloadFile(lastLinkArchive, this.archive.archive_name);
            clearTimeout(clearTimer);
          }
        }, 1000);
      } else {
        this.errorTextLimit =
          "Нельзя создать больше пяти задач от серийного номера.";
        utils.resetCheckbox(this.selectedCheckbox);
        utils.resetCheckboxAll(this.checkboxAllEl);
      }
    },
    async saveBaseTask(task) {
      await this.fetchArchiveTasks(task);
      await utils.resetCheckbox(this.selectedCheckbox);
      utils.resetCheckboxAll(this.checkboxAllEl);
      this.taskCreated = true;
      this.checkboxIds = [];
    },
    async saveLicense(license) {
      await this.fetchArchiveTasks(license);
      await utils.resetCheckbox(this.selectedCheckbox);
      utils.resetCheckboxAll(this.checkboxAllEl);
      utils.resetCheckbox(this.panel.checkboxes)
      this.taskCreated = true;
      this.panel.distSelected = false
      this.checkboxIds = [];
      this.selectedCheckbox = []
      
    },
    async createLicenseTask() {
      let licenseTask = {
        type_task: "product",
        data: {
          distribution: this.distributionId,
          modules_licenses: this.checkboxIds
        },
      };

      if (this.getArchives.length !== 5) {

        if (
          typeof this.distributionId === "number" &&
          licenseTask.data.modules_licenses.length
        ) {
          await this.saveLicense(licenseTask);        
          const clearTimer = setInterval(() => {
            if (this.archive.progress === 100) {
              const lastLinkArchive = this.getLinks[this.getLinks.length - 1];
              this.downloadFile(lastLinkArchive, this.archive.archive_name);
              this.distributionId = null
              this.taskCreated = false
              
              clearTimeout(clearTimer);
            }
          }, 1000);
          licenseTask = {}
        } else if (
          typeof this.distributionId === "number" &&
          !licenseTask.data.modules_licenses.length
        ) {
          licenseTask.data.distribution = this.distributionId;
          await this.fetchArchiveTasks(licenseTask);
          await this.fetchArchives();
          this.taskCreated = true;
          this.panel.distSelected = false
          licenseTask = {}
          const clearTimer = setInterval(() => {
            if (this.archive.progress === 100) {
              const lastLinkArchive = this.getLinks[this.getLinks.length - 1];
              this.downloadFile(lastLinkArchive, this.archive.archive_name);
              this.distributionId = null
              this.taskCreated = false
              
              clearTimeout(clearTimer);
            }
          }, 1000);
         
        } else {
          if ((isNaN(this.distributionId) || !this.distributionId) && this.checkboxIds.length) {
            const modules = {
              modules_licenses: this.checkboxIds,
            };
            licenseTask.data = modules;
            delete licenseTask.distribution;
            await this.saveLicense(licenseTask);       
      
            const clearTimer = setInterval(() => {
              if (this.archive.progress === 100) {
                const lastLinkArchive = this.getLinks[this.getLinks.length - 1];
                this.downloadFile(lastLinkArchive, this.archive.archive_name);
                console.log("я скачал хуйню");
                this.distributionId = null
                this.taskCreated = false
                this.selectedCheckbox = []
                this.panel.checkboxes = []
                clearTimeout(clearTimer);
              }
            }, 1000);
            this.emptyTasks = false;
            
            licenseTask = {}
          } else {
            this.emptyTasks = true
            this.emptyError = "Выберите хотя бы один элемент"
          }
        }
      } else {
        this.errorTextLimit =
          "Нельзя создать больше пяти задач от серийного номера.";
        utils.resetCheckbox(this.selectedCheckbox);
        utils.resetCheckboxAll(this.checkboxAllEl);
      }
    },
  },
  mounted() {
    
    this.applicationInit({
      code: encodeURIComponent(document.querySelector('#snb_update_options')?.dataset?.code || DEFAULT_CODE)
    }).then(()=> this.fetchArchives())
      .then(()=> this.ready = true)
  },
  computed: {
    ...mapState([
      "errorGlobal"
    ]),
    ...mapGetters([
      "archive",
      "getLinks",
      "getArchives",
      "getMessageError",
    ]),
  }
};
</script>

<style lang="scss">
//@import "~bootstrap/dist/css/bootstrap.min.css";
@import url("./assets/css/style.css");
</style>
