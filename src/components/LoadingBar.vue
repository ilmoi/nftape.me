<template>
  <div>
    <div class="flex flex-col justify-center text-center">
      <progress
        v-if="progress > 66"
        class="nes-progress is-success"
        :value="progress"
        max="100"
      ></progress>
      <progress
        v-else-if="progress > 33"
        class="nes-progress is-warning"
        :value="progress"
        max="100"
      ></progress>
      <progress v-else class="nes-progress is-error" :value="progress" max="100"></progress>
      <!--<LoadingIcon>-->
      <p class="mt-2 w-full text-center">{{ text ?? 'Loading...' }}</p>
      <!--</LoadingIcon>-->
    </div>
  </div>
</template>

<script lang="ts">
import {defineComponent} from 'vue';

export default defineComponent({
  props: {
    progress: Number,
    text: String,
  },
  setup() {
    return {};
  },
});
</script>

<style scoped></style>
