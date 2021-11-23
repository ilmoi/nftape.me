<template>
  <div class="flex flex-col w700:flex-row justify-between">
    <!--sort by-->
    <div class="w700:mx-2 my-2 w700:my-0 text-left flex-grow">
      <label for="sortBy" class="text-left">Sort by:</label>
      <div class="nes-select is-dark">
        <select required id="sortBy" @input="emitEvent">
          <option value="paperhanded">amount paperhanded</option>
          <option value="diamondhanded">amount diamondhanding</option>
          <option value="profit">profit/loss</option>
          <option value="boughtAt">purchase price</option>
          <option value="soldAt">sale price</option>
        </select>
      </div>
    </div>

    <!--sort order-->
    <div class="w700:mx-2 my-2 w700:my-0 text-left flex-grow">
      <label for="sortOrder" class="text-left">Sort order:</label>
      <div class="nes-select is-dark">
        <select required id="sortOrder" @input="emitEvent">
          <option value="desc">descending</option>
          <option value="asc">ascending</option>
        </select>
      </div>
    </div>

    <!--hide sold-->
    <div class="w700:mx-2 my-2 w700:my-0 w700:mt-10 w700:w-40 flex-shrink">
      <label>
        <input type="checkbox" id="hideSold" class="nes-checkbox is-dark" :checked="hideSold" @input="emitEvent"/>
        <span>Hide sold NFTs</span>
      </label>
    </div>
  </div>
</template>

<script lang="ts">
import {defineComponent} from "vue";

export default defineComponent({
  props: {
    sortBy: String,
    sortOrder: String,
    hideSold: Boolean,
  },
  emits: ['sortBy', 'sortOrder', 'hideSold'],
  setup(props, ctx) {
    const emitEvent = (event: any) => {
      ctx.emit(event.srcElement.id, event.target.value)
    }

    return {
      emitEvent,
    }
  }
})
</script>

<style scoped>

</style>
