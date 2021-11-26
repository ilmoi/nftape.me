import { fetchAndCalcStats } from '@/common/marketplaces/mpPrices';
import { collections } from '@/common/marketplaces/mpCollections';

jest.setTimeout(99999);

async function timeMe(fn: any, collection: string) {
  const start = performance.now();
  const r = await fn(collection);
  const end = performance.now();
  console.log(`Collection ${collection} took ${end - start} to fetch.`);
  if (end - start > 10000) {
    throw new Error(`Collection ${collection} is taking too long - consider removing it`);
  }
  return r;
}

// there are no assert statements here - we're simply checking if this executes within the defined timewindow
// if it does - this means there are no typos in collections
// this is also the UX a user would get - we want them to not have to wait
describe('collections', () => {
  it('fetches all collections without hanging', async () => {
    const promises: any[] = [];
    const allCollections = Object.keys(collections);

    allCollections.forEach((c) => promises.push(timeMe(fetchAndCalcStats, c)));
    const responses = await Promise.all(promises);
    console.log('All calls were successful!');
  });
});
