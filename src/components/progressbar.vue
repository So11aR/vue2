<template>
  <div
    class="progress-wrapper"
    v-if="
      archive.progress < 100
        ? (progressVisible = true)
        : (progressVisible = false)
    "
  >
    <v-app class="progress-line">
      <v-progress-linear
        :class="{ showProgress: archive.progress < 100 ? true : false }"
        class="hiddenProgress progress-bar"
        color="blue darken-1"
        height="25"
        :value="archive.progress"
      >
        <strong class="white--text">{{ archive.progress || 0 }}%</strong>
      </v-progress-linear>
    </v-app>

    <v-alert
      :class="{ showProgress: archive.progress < 100 ? true : false }"
      class="hiddenProgress progress-alert ma-0"
      >{{ loadingStatus[archive.status] }}</v-alert
    >
  </div>
</template>

<script>

export default {
  data() {
    return {
      typeTask: ''
    }
  },
  props: {
    archive: {
      type: Object,
      required: true,
    }
  },
  computed: {
    loadingStatus() {
      return {
        WAITING: "Пакет добавлен в очередь на загрузку",
        IN_PROCESS: this.typeTask === "bases" ? "Загрузка пакета баз данных" : "Загрузка пакета программных продуктов",
        SUCCESS: "Загрузка завершена",
        FAILURE: "Ошибка создания архива",
      }
    }
  },
  watch: {
    archive() {
      this.typeTask = this.archive.type_task
    }
  }
};
</script>