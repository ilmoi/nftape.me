<template>
  <div class="flex flex-col">
    <!--price method-->
    <div class="flex-1 flex mt-5">
      <label for="priceMethod" class="text-left">Compare prices to:</label>
      <a class="ml-1 mt-3" @click="showModal('tooltipPrices')">(?)</a>
      <div class="nes-select is-dark ml-5">
        <select required id="priceMethod" @input="emitEvent">
          <option :value="PriceMethod.floor">floor</option>
          <option :value="PriceMethod.median">median</option>
          <option :value="PriceMethod.mean">mean</option>
        </select>
      </div>
    </div>

    <!--offsetting-->
    <div class="flex-1 flex mt-5">
      <label for="offset" class="text-left">Treat negatives:</label>
      <a class="ml-1 mt-3" @click="showModal('tooltipOffset')">(?)</a>
      <div class="nes-select is-dark ml-5">
        <select required id="offset" @input="emitEvent">
          <option :value="false">ignore</option>
          <option :value="true">use as offset</option>
        </select>
      </div>
    </div>

    <!--modals-->
    <ModalWindow
        v-if="isModalVisible('tooltipPrices')"
        title="What does this mean?"
        @hide-modal="hideModal('tooltipPrices')"
    >
      <ContentTooltipPrices/>
    </ModalWindow>
    <ModalWindow
        v-if="isModalVisible('tooltipOffset')"
        title="What does this mean?"
        @hide-modal="hideModal('tooltipOffset')"
    >
      <ContentTooltipOffset/>
    </ModalWindow>
  </div>
</template>

<script lang="ts">
import {defineComponent} from "vue";
import {PriceMethod} from "@/common/types";
import ModalWindow from "@/components/ModalWindow.vue";
import useModal from "@/composables/modal";
import ContentTooltipPrices from "@/components/content/tooltip/ContentTooltipPrices.vue";
import ContentTooltipOffset from "@/components/content/tooltip/ContentTooltipOffset.vue";

export default defineComponent({
  components: {ContentTooltipOffset, ContentTooltipPrices, ModalWindow},
  props: {
    priceMethod: String,
    offset: Boolean,
  },
  emits: ['priceMethod', 'offset'],
  setup(props, ctx) {
    const emitEvent = (event: any) => {
      ctx.emit(event.srcElement.id, event.target.value)
    }

    // --------------------------------------- modals
    const {registerModal, isModalVisible, showModal, hideModal} = useModal();
    registerModal('tooltipPrices');
    registerModal('tooltipOffset');

    return {
      PriceMethod,
      emitEvent,
      isModalVisible,
      showModal,
      hideModal,
    }
  }
})
</script>

<style scoped>

</style>
