<template>
  <div class="width">
    <div class="mb-10 text-3xl">Get your NFT stats, 1 click</div>

    <form @submit.prevent="lfg">
      <div class="nes-field ">
        <div class="flex justify-center">
          <TheSolanaLogo/>
          <label class="ml-5" for="wallet">Wallet Address:</label>
        </div>
        <input type="text" id="wallet" class="nes-input is-dark mt-4 w-full" v-model="address" placeholder="AEahaRpDFzg74t7NtWoruabo2fPJQjKFM9kQJNjH7obK">
      </div>
      <button class="nes-btn is-warning mt-5 w-40" type="submit" :class="{ 'is-disabled': isLoading || !address }" :disabled="isLoading  || !address">
        LFG
      </button>
    </form>

    <div v-if="err" class="mt-5">
      <NotifyError>{{ err }}</NotifyError>
    </div>

    <LoadingBar v-else-if="isLoading" class="mt-5" :text="text" :progress="progress"></LoadingBar>

    <!--<div>-->
    <div v-else-if="nfts.length">
      <TheCurrencySlider class="mt-20" :currency="currency" @currency="handleNewCurrency"/>

      <div class="w500:text-xl">
        <h1 class="mt-10">You've spent a total of
          <span class="text-rb-blue">{{ isSol ? '◎' : '$' }}{{ f(totalSpend) }}</span> on NFTs.
        </h1>
        <h1 class="my-10">You've earned a total of
          <span class="text-rb-blue">{{ isSol ? '◎' : '$' }}{{ f(totalEarnings) }}</span> from NFTs.
        </h1>
        <h1 class="my-10">Your total {{ neg(totalProfit) ? 'loss' : 'profit' }} is
          <span :class="neg(totalProfit) ? 'text-rb-pink' : 'text-rb-green'">{{ isSol ? '◎' : '$' }}{{ f(totalProfit) }}</span>.
        </h1>
        <h1 class="my-10 ">You've paperhanded a total of
          <span :class="neg(totalPaperhanded) ? 'text-rb-green' : 'text-rb-pink'">{{ isSol ? '◎' : '$' }}{{ f(totalPaperhanded) }}</span>.
        </h1>
        <!--<h1 class="mb-10">(via {{paperSales}} sales)</h1>-->
        <h1 class="mb-20">You're diamondhanding a total of
          <span :class="neg(totalDiamondhanded) ? 'text-rb-pink' : 'text-rb-green'">{{ isSol ? '◎' : '$' }}{{ f(totalDiamondhanded) }}</span>.
        </h1>
        <!--<h1 class="mb-20">(via {{diamondNFTs}} NFTs)</h1>-->
      </div>

      <div class="mb-5 flex flex-col w700:flex-row justify-center">
        <button class="nes-btn is-warning mx-5" @click="showNFTs = !showNFTs">View by NFT</button>
        <button class="nes-btn is-warning mx-5" @click="showOptions = !showOptions">Advanced</button>
        <!--<button class="nes-btn is-warning mx-5" :class="{'is-disabled': copyInProgress}" :disabled="copyInProgress" @click="copyShareLink">{{ copyText }}</button>-->
            <a
        class="nes-btn is-primary twitter-button mx-5"
        :href="`https://twitter.com/intent/tweet?${shareText}`"
        target="_blank"
    >Tweet it!</a>
      </div>

      <div v-if="showOptions" class="mb-5">
        <div class="nes-container is-dark with-title">
          <p class="title">Advanced Options</p>
          <TheAdvancedOptions
              :price-method="priceMethod"
              :offset="offset"
              @priceMethod="handleNewMethod"
              @offset="handleNewOffset"
          />
        </div>
      </div>

      <div v-if="showNFTs">
        <TheViewOptions
            class="mt-5"
            :sort-by="sortBy"
            :sort-order="sortOrder"
            :hideSold="hideSold"
            @sortBy="handleNewSortBy"
            @sortOrder="handleNewSortOrder"
            @hideSold="handleHideSold"
        />
        <NFTCard
            v-for="nft in nfts"
            :key="nft.mint"
            :nft="nft"
            :price-method="priceMethod"
            :is-sol="isSol"
            :hidden="hideSold && nft.soldAt !== undefined"
        />
      </div>
    </div>

    <div v-else class="mt-5">
      <p>or <a href="https://github.com/ilmoi/nftape.me#intro" target="_blank">read how it works</a></p>
    </div>
  </div>
</template>

<script lang="ts">
import {computed, defineComponent, onMounted, ref, watch} from "vue";
import {useRoute} from "vue-router";
import {NFTHandler} from "@/common";
import useCluster from "@/composables/cluster";
import NFTCard from "@/components/NFTCard.vue";
import {INFTData, PriceMethod} from "@/common/types";
import NotifyError from "@/components/notifications/NotifyError.vue";
import useLoading from "@/composables/loading";
import LoadingBar from "@/components/LoadingBar.vue";
import {EE} from "@/globals";
import TheCurrencySlider from "@/components/TheCurrencySlider.vue";
import TheViewOptions from "@/components/TheViewOptions.vue";
import TheAdvancedOptions from "@/components/TheAdvancedOptions.vue";
import TheSolanaLogo from "@/components/TheSolanaLogo.vue";
import {f} from '@/common/util';

export default defineComponent({
  components: {
    TheSolanaLogo,
    TheAdvancedOptions,
    TheViewOptions, TheCurrencySlider, LoadingBar, NotifyError, NFTCard
  },
  setup() {
    const address = ref<string>()
    const nfts = ref<INFTData[]>([]);

    // display params
    const showOptions = ref<boolean>(false);
    const showNFTs = ref<boolean>(false);

    // --------------------------------------- config params & their watchers
    const priceMethod = ref<PriceMethod>(PriceMethod.floor);
    const sortBy = ref<string>("paperhanded")
    const sortOrder = ref<string>("desc")
    const offset = ref<boolean>(false)
    const hideSold = ref<boolean>(false)
    const currency = ref<string>("sol")

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

    // --------------------------------------- sol <--> usd
    let solPrice: number | undefined;
    const isSol = computed(() => currency.value === 'sol')

    const mult = (a: number, b: number) => a * b
    const div = (a: number, b: number) => a / b

    /* eslint-disable no-param-reassign */
    const updatePrices = (cb: any) => {
      nfts.value = nfts.value.map(nft => {
        nft.soldAt = nft.soldAt ? cb(nft.soldAt, solPrice!) : undefined;
        nft.boughtAt = nft.boughtAt ? cb(nft.boughtAt, solPrice!) : undefined;
        nft.currentPrices = nft.currentPrices ? {
          floor: cb(nft.currentPrices.floor, solPrice!),
          mean: cb(nft.currentPrices.mean, solPrice!),
          median: cb(nft.currentPrices.median, solPrice!),
        } : undefined;
        nft.paperhanded = nft.paperhanded ? {
          floor: cb(nft.paperhanded.floor, solPrice!),
          mean: cb(nft.paperhanded.mean, solPrice!),
          median: cb(nft.paperhanded.median, solPrice!),
        } : undefined;
        nft.diamondhanded = nft.diamondhanded ? {
          floor: cb(nft.diamondhanded.floor, solPrice!),
          mean: cb(nft.diamondhanded.mean, solPrice!),
          median: cb(nft.diamondhanded.median, solPrice!),
        } : undefined;
        nft.profit = nft.profit ? cb(nft.profit, solPrice!) : undefined;
        return nft
      })
    }
    watch(currency, (newCur: string) => {
      if (newCur === 'usd') {
        updatePrices(mult)
      } else {
        updatePrices(div)
      }
    })

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

    // paper
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
    const paperSales = computed(() => (nfts.value.filter(n => n.soldAt)).length);

    // diamonds
    const totalDiamondhanded = computed((): number => {
      const validNFTs = nfts.value.filter(n => !!n.diamondhanded).map(n => n.diamondhanded![priceMethod.value])
      return validNFTs.length ? validNFTs.reduce(adder) : 0
    })
    const diamondNFTs = computed(() => (nfts.value.filter(n => !n.soldAt)).length);

    // profit
    const totalProfit = computed((): number => totalEarnings.value - totalSpend.value || 0)

    // --------------------------------------- handlers
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
    const handleHideSold = () => {
      hideSold.value = !hideSold.value;
    }
    const handleNewCurrency = (newCurrency: string) => {
      currency.value = newCurrency;
    }
    const neg = (amount: number) => amount < 0

    // --------------------------------------- lfg
    const {getConnection} = useCluster();
    const err = ref<string | undefined>()

    const {
      progress,
      text,
      isLoading,
      updateLoading,
      updateLoadingStdErr,
      updateLoadingStdWin,
    } = useLoading();

    const lfg = async () => {
      nfts.value = []
      err.value = undefined
      const nftHandler = new NFTHandler(getConnection('confirmed'))
      try {
        EE.removeAllListeners();
        EE.on('loading', updateLoading);
        nfts.value = await nftHandler.analyzeAddress(address.value!)
        solPrice = nftHandler.solPrice;
        updateLoadingStdWin()
      } catch (e) {
        console.log('stack', e.stack)
        err.value = e;
        updateLoadingStdErr(e)
      }
    }

    // --------------------------------------- sharing
    // const {copyText, copyInProgress, setCopyText, doCopy} = useCopy();
    // setCopyText('Share a Link');
    // const copyShareLink = async () => {
    //   const host = window.location.origin;
    //   await doCopy(`${host}/addr/${address.value!}`);
    // };

    const shareText = computed(() => {
      const host = window.location.origin;
      const text = encodeURI(`I aped🍌 into ${isSol.value ? '◎' : '$'}${f(totalSpend.value)} worth of NFTs, paperhanded🧻 ${isSol.value ? '◎' : '$'}${f(totalPaperhanded.value)}, and am diamondhanding💎 ${isSol.value ? '◎' : '$'}${f(totalDiamondhanded.value)}.`)
      const url = encodeURI(`${host}/addr/${address.value!}`)
      const hashtags = encodeURI('NFTs,Solana')
      return `text=${text}&url=${url}&hashtags=${hashtags}`
    })

    onMounted(async () => {
      const route = useRoute();
      const {addr} = route.params;
      if (addr) {
        address.value = addr as any;
        await lfg()
      }
    })

    return {
      address,
      nfts,
      showOptions,
      showNFTs,
      // config params
      priceMethod,
      sortBy,
      sortOrder,
      offset,
      hideSold,
      currency,
      isSol,
      // calcs
      totalSpend,
      totalEarnings,
      totalPaperhanded,
      paperSales,
      totalDiamondhanded,
      diamondNFTs,
      totalProfit,
      // handlers
      handleNewMethod,
      handleNewSortBy,
      handleNewSortOrder,
      handleNewOffset,
      handleHideSold,
      handleNewCurrency,
      neg,
      // lfg
      err,
      lfg,
      isLoading,
      text,
      progress,
      // sharing
      shareText,
      f,
    }
  }
})
</script>

<style scoped>
.width {
  width: 900px;
}

.twitter-button {
  @apply text-white hover:text-white !important;
}
</style>
