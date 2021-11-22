export const collections = {
  // creator's address goes here
  '9BKWqDHfHZh9j39xakYVMdr6hXmCLHH5VfCpeq2idU9L': {
    SA: 'degenape',
    DE: 'Degenerate%20Ape%20Academy',
    ME: 'degenerate_ape_academy',
  },
  '9uBX3ASjxWvNBAD1xjbVaKA74mWGZys3RGSF7DdeDD3F': {
    DE: 'Solana%20Monkey%20Business',
    ME: 'solana_monkey_business',
  },
  DRGNjvBvnXNiQz9dTppGk1tAsVxtJsvhEmojEfBU3ezf: {
    ME: 'boryoku_dragonz',
  },
  BHVPUojZvH2mWo5T6ZCJQnyqMTe4McHsXGSJutezTPGE: {
    SA: 'saibagang',
    ME: 'saiba_gang',
  },
  F5FKqzjucNDYymjHLxMR2uBT43QmaqBAMJwjwkvRRw4A: {
    SA: 'solpunks',
    ME: 'solpunks',
  },
  AvkbtawpmMSy571f71WsWEn41ATHg5iHw27LoYJdk8QA: {
    SA: 'thugbirdz',
    DE: 'Thugbirdz',
    ME: 'thugbirdz',
  },
  Bhr9iWx7vAZ4JDD5DVSdHxQLqG9RvCLCSXvu6yC4TF6c: {
    SA: 'skeletoncrew',
    DE: 'Skeleton%20Crew%20SKULLS',
    ME: 'skeleton_crew_skulls',
  },
};

export const collectionCache = {};

export function initPricesFromCache(creator: string) {
  const existingCache = (collectionCache as any)[creator];
  if (existingCache) {
    console.log('hitting existing cache for creator', creator);
  }
  return existingCache ?? [];
}

export function updateCache(creator: string, prices: number[]) {
  (collectionCache as any)[creator] = prices;
}
