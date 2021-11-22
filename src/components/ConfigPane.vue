<template>
  <div class="flex flex-col">

    <!--price method-->
    <div class="flex-1 flex">
      <label for="priceMethod" class="text-left">Compare prices to:</label>
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
      <div class="nes-select is-dark ml-5">
        <select required id="offset" @input="emitEvent">
          <option :value="false">ignore</option>
          <option :value="true">use as offset</option>
        </select>
      </div>
    </div>

    <!--sort by-->
    <div class="flex-1 flex mt-5">
      <label for="sortBy" class="text-left">Sort by:</label>
      <div class="nes-select is-dark ml-5">
        <select required id="sortBy" @input="emitEvent">
          <option value="paperhanded">amount paperhanded</option>
          <option value="diamondhanded">amount diamondhanded</option>
          <option value="profit">profit/loss</option>
          <option value="boughtAt">purchase price</option>
          <option value="soldAt">sale price</option>
        </select>
      </div>
    </div>

    <!--sort order-->
    <div class="flex-1 flex mt-5">
      <label for="sortOrder" class="text-left">Sort order:</label>
      <div class="nes-select is-dark ml-5">
        <select required id="sortOrder" @input="emitEvent">
          <option value="desc">descending</option>
          <option value="asc">ascending</option>
        </select>
      </div>
    </div>

    <!--hide sold-->
    <div class="flex-1 flex mt-5">
      <label>
        <input type="checkbox" id="hideSold" class="nes-checkbox is-dark" :checked="hideSold" @input="emitEvent"/>
        <span>Hide sold NFTs</span>
      </label>
    </div>
  </div>
</template>

<script lang="ts">
import {defineComponent, ref, watch} from "vue";
import {PriceMethod} from "@/common/types";

export default defineComponent({
  props: {
    priceMethod: String,
    sortBy: String,
    sortOrder: String,
    offset: Boolean,
    hideSold: Boolean,
  },
  emits: ['priceMethod', 'sortBy', 'sortOrder', 'offset', 'hideSold'],
  setup(props, ctx) {
    const emitEvent = (event: any) => {
      ctx.emit(event.srcElement.id, event.target.value)
    }

    return {
      PriceMethod,
      emitEvent,
    }
  }
})
</script>

<style scoped>

</style>
