<template>
  <div class="fixed inset-0 opacity-75 bg-black z400" @click="emitHide"></div>
  <div class="modal w-full" @keydown.esc="emitHide" tabindex="0" id="modal">
    <div class="nes-container is-dark relative bg-dark">
      <p class="text-lg underline">{{ title }}</p>
      <p class="absolute top-1 right-1" @click="emitHide">X</p>
      <div class="mt-5 w500:text-sm text-xs">
        <slot />
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, onMounted, ref } from 'vue';

export default defineComponent({
  emits: ['hide-modal'],
  props: {
    title: String,
  },
  setup(props, context) {
    // needed to be able to cancel the modal using ESC
    onMounted(() => {
      (document.getElementById('modal') as any).focus();
    });

    const emitHide = () => {
      context.emit('hide-modal');
    };
    return {
      emitHide,
    };
  },
});
</script>

<style scoped>
.modal {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  max-width: 600px;
  overflow: auto;
  max-height: calc(100vh - 50px);
  z-index: 500;
  outline: none;
}

.z400 {
  z-index: 400;
}

.bg-dark {
  background-color: #21252A;
}
</style>
