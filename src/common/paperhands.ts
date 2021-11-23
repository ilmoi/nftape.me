import { INFTData, IStats } from '@/common/types';

// todo currentlty if someone bought / sold their NFT multiple times, only the LAST purchase/sale will be accounted for
export function calcPaperDiamondHands(nft: INFTData) {
  let paperhanded: IStats | undefined;
  let diamondhanded: IStats | undefined;
  let profit: number | undefined;

  if (nft.currentPrices) {
    if (nft.soldAt) {
      paperhanded = {
        floor: nft.currentPrices!.floor - nft.soldAt,
        mean: nft.currentPrices!.mean - nft.soldAt,
        median: nft.currentPrices!.median - nft.soldAt,
      };
    }
    if (!nft.soldAt) {
      diamondhanded = {
        floor: nft.currentPrices!.floor,
        mean: nft.currentPrices!.mean,
        median: nft.currentPrices!.median,
      };
    }
  }

  if (nft.boughtAt && nft.soldAt) {
    profit = nft.soldAt - nft.boughtAt;
  }

  return { paperhanded, diamondhanded, profit };
}
