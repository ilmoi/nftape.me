<template>
  <div class="my-5">
    <div class="nes-container is-dark with-title">
      <p class="title">{{ nft.externalMetadata.name }}</p>

      <div class="flex flex-row">
        <img :alt="nft.mint" :src="nft.externalMetadata.image">

        <div class="ml-5 text">
          <div class="flex flex-row">
            <div v-if="nft.soldAt" class="p-1 mb-2 bg-gray-600 width">Sold</div>
            <div v-else class="p-1 mb-2 text-black bg-rb-blue width">HODLing</div>
            <a class="ml-5" :href="`https://explorer.solana.com/address/${nft.mint}`" target="_blank">🔗</a>
          </div>

          <p v-if="nft.boughtAt" class="text">Bought for: <span class="text-rb-blue">◎{{ nft.boughtAt.toFixed(2) }}</span></p>
          <p v-if="nft.soldAt" class="text">Sold for: <span class="text-rb-blue">◎{{nft.soldAt.toFixed(2)}}</span></p>
          <p v-if="nft.currentPrices" class="text">Current {{priceMethod}}: <span class="text-rb-blue">◎{{nft.currentPrices[priceMethod].toFixed(2)}}</span></p>
          <p v-if="nft.profit" class="text">{{neg(nft.profit) ? 'Loss' : 'Profit'}} from sale: <span :class="neg(nft.profit) ? 'text-rb-pink' : 'text-rb-green'">◎{{ nft.profit.toFixed(2) }}</span></p>
          <p v-if="nft.paperhanded" class="text">Paperhanded worth: <span :class="neg(nft.paperhanded[priceMethod]) ? 'text-rb-green' : 'text-rb-pink'">◎{{ nft.paperhanded[priceMethod].toFixed(2) }}</span></p>
          <p v-if="nft.diamondhanded" class="text">Diamondhanding worth: <span :class="neg(nft.diamondhanded[priceMethod]) ? 'text-rb-pink' : 'text-rb-green'">◎{{ nft.diamondhanded[priceMethod].toFixed(2) }}</span></p>
          <p v-if="!nft.currentPrices" class="text text-gray-400">This NFT collection is missing prices :( Fix by
            <a href="https://github.com/ilmoi/nftape.me" target="_blank">sending a PR</a> (~2min)</p>
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
    priceMethod: String,
  },
  setup() {
    const neg = (amount: number) => amount < 0
    return {neg}
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
.width {
  width: 200px;
}
</style>
