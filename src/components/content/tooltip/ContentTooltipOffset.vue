<template>
  <div>
    <p>When calculating the amount you've paperhanded, we can take one of 2 approaches.</p>
    <p class="mt-5">Option 1: we sum up the total difference between current prices and your sales prices, no matter which of the two is higher.</p>
    <p class="mt-5">This number includes both successful sales (above current price) and actual "paper" sales (below current price).</p>
    <p class="mt-5">Option 2: we only compute the difference for sales that are true "paper" sales, ie where you sold below the current price.</p>
    <p class="mt-5">This will give us a slightly skewed view (since it excludes some of the sales), but arguably a more useful one when we're talking about "paperhanding". This is currently the default option.</p>
    <p class="mt-5">Set "treat negatives" to "use as offset" for Option 1, and to "ignore" for Option 2.</p>
  </div>
</template>
