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

    <div>
      <NFTCard
          v-for="nft in nfts"
          :key="nft.mint"
          :nft="nft"
      />
    </div>

  </div>
</template>

<script lang="ts">
import {defineComponent, ref} from "vue";
import {NFTHandler} from "@/common";
import useCluster from "@/composables/cluster";
import NFTCard from "@/components/NFTCard.vue";
import {INFTData} from "@/common/types";

export default defineComponent({
  components: {NFTCard},
  setup() {
    const address = ref<string>("5u1vB9UeQSCzzwEhmKPhmQH1veWP9KZyZ8xFxFrmj8CK")
    const nfts = ref<INFTData[]>([]);

    const {getConnection} = useCluster();

    const analyze = async () => {
      nfts.value = []
      const nftHandler = new NFTHandler(getConnection('confirmed'))
      nfts.value = await nftHandler.analyzeAddress(address.value)
    }

    return {
      nfts,
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
