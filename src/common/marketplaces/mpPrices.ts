import axios from 'axios';
import { LAMPORTS_PER_SOL } from '@solana/web3.js';
import { okToFailAsync } from '@/common/util';
import { collections, initPricesFromCache, updateCache } from '@/common/marketplaces/mpCollections';
import { IStats } from '@/common/types';

// --------------------------------------- mp-specific fetchers

async function fetchSolanartPrices(collection: string) {
  const collectionName = (collections as any)[collection].SA;
  if (!collectionName) return;
  const apiLink = 'https://qzlsklfacc.medianetwork.cloud';
  const link = `${apiLink}/nft_for_sale?collection=${collectionName}`;
  const { data } = await axios.get(link);
  // console.log(data)
  return data.map((d: any) => d.price);
}

async function fetchDigitalEyezPrices(collection: string) {
  const collectionName = (collections as any)[collection].DE;
  if (!collectionName) return;
  const apiLink = 'https://us-central1-digitaleyes-prod.cloudfunctions.net';
  const link = `${apiLink}/offers-retriever?collection=${collectionName}`;
  const { data } = await axios.get(link);
  // console.log(data)
  return data.offers.map((d: any) => d.price / LAMPORTS_PER_SOL);
}

async function fetchMagicEdenPrices(collection: string) {
  const collectionName = (collections as any)[collection].ME;
  if (!collectionName) return;
  const apiLink = 'https://api-mainnet.magiceden.io/rpc';
  const link = `${apiLink}/getListedNFTsByQuery?q=%7B%22$match%22:%7B%22collectionSymbol%22:%22${collectionName}%22%7D,%22$sort%22:%7B%22takerAmount%22:1,%22createdAt%22:-1%7D,%22$skip%22:0,%22$limit%22:20%7D`;
  const { data } = await axios.get(link);
  // console.log(data)
  return data.results.map((d: any) => d.price);
}

// --------------------------------------- calc

function calcMedian(values: number[]) {
  if (values.length === 0) throw new Error('No inputs');
  values.sort((a, b) => a - b);
  const half = Math.floor(values.length / 2);
  if (values.length % 2) return values[half];
  return (values[half - 1] + values[half]) / 2.0;
}

function calcStats(prices: number[]): IStats {
  let floor: number | null = null;
  let total = 0;
  const count = prices.length;

  prices.forEach((p) => {
    // update floor
    if (floor === null) {
      floor = p;
    } else if (p < floor) {
      floor = p;
    }
    // update total
    total += p;
  });
  const mean = total / count;
  const median = calcMedian(prices);
  return { floor: floor!, mean, median };
}

// --------------------------------------- interface

export async function fetchAndCalcStats(creator: string): Promise<IStats | undefined> {
  const prices: number[] = initPricesFromCache(creator);

  if (!prices.length) {
    const responses = await Promise.all([
      okToFailAsync(fetchSolanartPrices, [creator]),
      okToFailAsync(fetchDigitalEyezPrices, [creator]),
      okToFailAsync(fetchMagicEdenPrices, [creator]),
    ]);
    responses.forEach((r) => {
      if (r) {
        prices.push(...r);
      }
    });
    // console.log(`fetched prices for ${creator} creator are:`, prices);
    updateCache(creator, prices);
  }

  // if we failed to get prices from cache AND failed to get from mps - quit
  if (!prices.length) {
    return;
  }
  return calcStats(prices);
}
