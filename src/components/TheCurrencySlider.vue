<template>
  <div class="flex justify-center">
    <p class="m-1 mx-3 text-rb-blue text-xl">SOL</p>
    <label class="switch">
      <input type="checkbox" v-model="checked">
      <span class="slider round"></span>
    </label>
    <p class="m-1 mx-3 text-rb-yellow text-xl">USD</p>
  </div>
</template>

<script lang="ts">
import {defineComponent, ref, watch} from "vue";

export default defineComponent( {
  props: {
    currency: String,
  },
  emits: ['currency'],
  setup(props, ctx) {
    const checked = ref(false)

    watch(checked, (newVal:any) => {
      const currency = newVal ? 'usd' : 'sol'
      ctx.emit('currency', currency)
    })

    return {
      checked,
    }
  }
})
</script>

<style scoped>
/* The switch - the box around the slider */
.switch {
  position: relative;
  display: inline-block;
  width: 60px;
  height: 34px;
}

/* Hide default HTML checkbox */
.switch input {
  opacity: 0;
  width: 0;
  height: 0;
}

/* The slider */
.slider {
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgb(0,255,255);
  -webkit-transition: .4s;
  transition: .4s;
}

.slider:before {
  position: absolute;
  content: "";
  height: 26px;
  width: 26px;
  left: 4px;
  bottom: 4px;
  background-color: #21252A;
  -webkit-transition: .4s;
  transition: .4s;
}

input:checked + .slider {
  background-color: rgb(242,196,10);
}

input:focus + .slider {
  box-shadow: 0 0 1px rgb(242,196,10);
}

input:checked + .slider:before {
  -webkit-transform: translateX(26px);
  -ms-transform: translateX(26px);
  transform: translateX(26px);
}

/* Rounded sliders */
.slider.round {
  border-radius: 34px;
}

.slider.round:before {
  border-radius: 50%;
}
</style>
