<template>
  <div class="my-5">
    <div class="nes-container is-dark with-title">
      <p class="title">{{ nft.externalMetadata.name }}</p>

      <div class="flex flex-row">
        <img :alt="nft.mint" :src="nft.externalMetadata.image">
        <div class="ml-5 text">
          <p class="text">Paperhanded 🧻👐 {{ nft.paperhanded }}</p>
          <p class="text">Diamondhanded 💎👐 {{ nft.diamondhanded }}</p>
          <p class="text">Profit/Loss 📈📉 {{ nft.profit }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import {defineComponent} from "vue";

export default defineComponent({
  props: {
    nft: Object,
  },
  setup() {
    return {}
  }
})
</script>

<style scoped>
img {
  max-width: 150px;
  max-height: 150px;
}
.text {
  text-align: left !important;
}
</style>
