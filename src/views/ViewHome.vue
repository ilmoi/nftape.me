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
      <h1 class="mt-20 text-xl">You've spent a total of
        <span class="text-rb-blue">◎{{ totalSpend.toFixed(2) }}</span> on NFTs.</h1>
      <h1 class="my-10 text-xl">You've earned a total of
        <span class="text-rb-blue">◎{{ totalEarnings.toFixed(2) }}</span> from NFTs.</h1>
      <h1 class="my-10 text-xl">Your total {{ neg(totalProfit) ? 'loss' : 'profit' }} is
        <span :class="neg(totalProfit) ? 'text-rb-pink' : 'text-rb-green'">◎{{ totalProfit.toFixed(2) }}</span>.
      </h1>
      <h1 class="my-10 text-xl">You've paperhanded a total of
        <span :class="neg(totalPaperhanded) ? 'text-rb-green' : 'text-rb-pink'">◎{{ totalPaperhanded.toFixed(2) }}</span>.
      </h1>
      <h1 class="mb-20 text-xl">You're diamondhanding a total of
        <span :class="neg(totalDiamondhanded) ? 'text-rb-pink' : 'text-rb-green'">◎{{ totalDiamondhanded.toFixed(2) }}</span>.
      </h1>

      <div class="mb-5 flex flex-row justify-center">
        <button class="nes-btn is-warning mx-5" @click="showOptions = !showOptions">Configure Options</button>
        <button class="nes-btn is-warning mx-5" @click="showNFTs = !showNFTs">Show Your NFTs</button>
      </div>

      <div v-if="showOptions" class="mb-5">
        <div class="nes-container is-dark with-title">
          <p class="title">Options</p>
          <ConfigPane
              :price-method="priceMethod"
              :sort-by="sortBy"
              :sort-order="sortOrder"
              :offset="offset"
              @priceMethod="handleNewMethod"
              @sortBy="handleNewSortBy"
              @sortOrder="handleNewSortOrder"
              @offset="handleNewOffset"
          />
        </div>
      </div>

      <div v-if="showNFTs">
        <NFTCard
            v-for="nft in nfts"
            :key="nft.mint"
            :nft="nft"
            :price-method="priceMethod"
        />
      </div>

    </div>
  </div>
</template>

<script lang="ts">
import {computed, defineComponent, ref, watch} from "vue";
import {NFTHandler} from "@/common";
import useCluster from "@/composables/cluster";
import NFTCard from "@/components/NFTCard.vue";
import {INFTData, PriceMethod} from "@/common/types";
import ConfigPane from "@/components/ConfigPane.vue";

export default defineComponent({
  components: {ConfigPane, NFTCard},
  setup() {
    const address = ref<string>("5u1vB9UeQSCzzwEhmKPhmQH1veWP9KZyZ8xFxFrmj8CK")
    const nfts = ref<INFTData[]>([]);

    // config params
    const priceMethod = ref<PriceMethod>(PriceMethod.floor);
    const sortBy = ref<string>("paperhanded")
    const sortOrder = ref<string>("desc")
    const offset = ref<boolean>(false)

    const updateOrder = (sortBy: string, sortOrder: string) => nfts.value.sort((first, second) => {
        // @ts-ignore
        if (!first[sortBy]) {
          return 1
        }
        // @ts-ignore
        if (!second[sortBy]) {
          return -1
        }
        if (sortOrder === 'asc') {
          if (sortBy === 'paperhanded' || sortBy === 'diamondhanded') {
            // @ts-ignore
            return first[sortBy][priceMethod.value] - second[sortBy][priceMethod.value]
          }
          // @ts-ignore
          return first[sortBy] - second[sortBy]
        }
        if (sortBy === 'paperhanded' || sortBy === 'diamondhanded') {
          // @ts-ignore
          return second[sortBy][priceMethod.value] - first[sortBy][priceMethod.value]
        }
        // @ts-ignore
        return second[sortBy] - first[sortBy]
      })
    watch(nfts, () => {
      updateOrder(sortBy.value, sortOrder.value)
    })
    watch(priceMethod, () => {
      updateOrder(sortBy.value, sortOrder.value)
    })
    watch(sortBy, (newSortBy: string) => {
      updateOrder(newSortBy, sortOrder.value)
    })
    watch(sortOrder, (newSortOrder: string) => {
      updateOrder(sortBy.value, newSortOrder)
    })

    // display params
    const showOptions = ref<boolean>(false);
    const showNFTs = ref<boolean>(false);

    // --------------------------------------- calcs
    const adder = (prev: number, next: number) => prev + next;
    const totalSpend = computed((): number => {
      const validNFTs = nfts.value.filter(n => !!n.boughtAt).map(n => n.boughtAt!)
      return validNFTs.length ? validNFTs.reduce(adder) : 0
    })
    const totalEarnings = computed((): number => {
      const validNFTs = nfts.value.filter(n => !!n.soldAt).map(n => n.soldAt!)
      return validNFTs.length ? validNFTs.reduce(adder) : 0
    })
    const totalPaperhandedOffset = computed((): number => {
      const validNFTs = nfts.value.filter(n => !!n.paperhanded).map(n => n.paperhanded![priceMethod.value])
      return validNFTs.length ? validNFTs.reduce(adder) : 0
    })
    // if offset is turned off, then we're only looking at positive paperhands events
    const totalPaperhandedNoOffset = computed((): number => {
      const validNFTs = nfts.value.filter(n => !!n.paperhanded).map(n => n.paperhanded![priceMethod.value]).filter(p => p > 0)
      return validNFTs.length ? validNFTs.reduce(adder) : 0
    })
    const totalPaperhanded = computed((): number => offset.value ? totalPaperhandedOffset.value : totalPaperhandedNoOffset.value)
    const totalDiamondhanded = computed((): number => {
      const validNFTs = nfts.value.filter(n => !!n.diamondhanded).map(n => n.diamondhanded![priceMethod.value])
      return validNFTs.length ? validNFTs.reduce(adder) : 0
    })
    const totalProfit = computed((): number => totalEarnings.value - totalSpend.value || 0)

    // --------------------------------------- calcs
    const {getConnection} = useCluster();

    const analyze = async () => {
      nfts.value = []
      const nftHandler = new NFTHandler(getConnection('confirmed'))
      nfts.value = await nftHandler.analyzeAddress(address.value)
    }

    const handleNewMethod = (newMethod: PriceMethod) => {
      priceMethod.value = newMethod;
    }
    const handleNewSortBy = (newSortBy: string) => {
      sortBy.value = newSortBy;
    }
    const handleNewSortOrder = (newSortOrder: string) => {
      sortOrder.value = newSortOrder;
    }
    const handleNewOffset = (newOffset: string) => {
      offset.value = (newOffset === 'true');
    }

    const neg = (amount: number) => amount < 0

    return {
      address,
      nfts,
      // config params
      priceMethod,
      sortBy,
      sortOrder,
      offset,
      // display params
      showOptions,
      showNFTs,
      // calcs
      totalSpend,
      totalEarnings,
      totalPaperhanded,
      totalDiamondhanded,
      totalProfit,
      // methods
      analyze,
      handleNewMethod,
      handleNewSortBy,
      handleNewSortOrder,
      handleNewOffset,
      neg,
    }
  }
})
</script>

<style scoped>
.width {
  width: 900px;
}
</style>
