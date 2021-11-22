import { INFTData, PriceMethod } from '@/common/types';

// todo if someone bought / sold the same nft multiple times, that'd be a problem

export function calcPaperDiamondHands(
  nft: INFTData,
  method: PriceMethod
): [number | undefined, number | undefined] {
  let paper: number | undefined;
  let diamond: number | undefined;
  if (nft.soldAt) {
    paper = nft.soldAt - (nft.currentPrices as any)[method];
  } else {
    diamond = (nft.currentPrices as any)[method] - nft.boughtAt!;
  }
  return [paper, diamond];
}
