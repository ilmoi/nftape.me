import { INFTData, IStats, PriceMethod } from '@/common/types';

// todo currentlty if someone bought / sold their NFT multiple times, only the LAST purchase/sale will be accounted for
export function calcPaperDiamondHands(
  nft: INFTData
): [IStats | undefined, IStats | undefined, number | undefined] {
  let paper: IStats | undefined;
  let diamond: IStats | undefined;
  let profit: number | undefined;

  if (nft.currentPrices) {
    // calculate paperhands amount
    if (nft.soldAt) {
      paper = {
        floor: nft.currentPrices!.floor - nft.soldAt,
        mean: nft.currentPrices!.mean - nft.soldAt,
        median: nft.currentPrices!.median - nft.soldAt,
      };
    }

    // calculate diamondhands amount
    if (nft.boughtAt && !nft.soldAt) {
      diamond = {
        floor: nft.currentPrices!.floor,
        mean: nft.currentPrices!.mean,
        median: nft.currentPrices!.median,
      };
    }
  }

  // calculate profit
  if (nft.boughtAt && nft.soldAt) {
    profit = nft.soldAt - nft.boughtAt;
  }

  return [paper, diamond, profit];
}
