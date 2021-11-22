<template>
  <div class="width">
    <form @submit.prevent="analyze">
      <div class="nes-field ">
        <label for="wallet">Wallet address:</label>
        <input type="text" id="wallet" class="nes-input is-dark mt-5 w-full" v-model="address">
      </div>
      <button class="nes-btn is-warning mt-5 w-40" type="submit">
        LFG
      </button>
    </form>
  </div>
</template>

<script lang="ts">
import {defineComponent, ref} from "vue";
import {NFTHandler} from "@/common";
import useCluster from "@/composables/cluster";

export default defineComponent({
  setup() {
    const address = ref<string>("5u1vB9UeQSCzzwEhmKPhmQH1veWP9KZyZ8xFxFrmj8CK")

    const {getConnection} = useCluster();

    const nftHandler = new NFTHandler(getConnection('confirmed'))

    const analyze = () => {
      nftHandler.analyzeAddress(address.value)
    }

    return {
      address,
      analyze,
    }
  }
})
</script>

<style scoped>
.width {
  width: 900px;
}
</style>
