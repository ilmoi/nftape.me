import { INFTData, IStats, PriceMethod } from '@/common/types';

// todo if someone bought / sold the same nft multiple times, that'd be a problem

export function calcPaperDiamondHands(
  nft: INFTData
): [IStats | undefined, IStats | undefined, number | undefined] {
  let paper: IStats | undefined;
  let diamond: IStats | undefined;
  let profit: number | undefined;

  // calculate paperhands amount
  if (nft.soldAt) {
    paper = {
      floor: nft.soldAt - nft.currentPrices!.floor,
      mean: nft.soldAt - nft.currentPrices!.mean,
      median: nft.soldAt - nft.currentPrices!.median,
    };
  }

  // calculate diamondhands amount
  if (nft.boughtAt && !nft.soldAt) {
    diamond = {
      floor: nft.currentPrices!.floor - nft.boughtAt!,
      mean: nft.currentPrices!.mean - nft.boughtAt!,
      median: nft.currentPrices!.median - nft.boughtAt!,
    };
  }

  // calculate profit
  if (nft.boughtAt && nft.soldAt) {
    profit = nft.soldAt - nft.boughtAt;
  }

  return [paper, diamond, profit];
}
