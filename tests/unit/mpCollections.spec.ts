import { fetchAndCalcStats } from '@/common/marketplaces/mpPrices';
import { collections } from '@/common/marketplaces/mpCollections';

// there are no assert statements here - we're simply checking if this executes within the defined timewindow
// if it does - this means there are no typos in collections
// this is also the UX a user would get - we want them to not have to wait
describe('collections', () => {
  it('fetches all collections without haning', async () => {
    const promises: any[] = [];

    const allCollections = Object.keys(collections);

    allCollections.forEach((c) => promises.push(fetchAndCalcStats(c)));
    const responses = await Promise.all(promises);
    console.log('All calls were successful!');
  });
});
