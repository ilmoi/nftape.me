export interface IStats {
  floor: number;
  mean: number;
  median: number;
}

export enum PriceMethod {
  floor = 'floor',
  mean = 'mean',
  median = 'median',
}

export interface INFTData {
  mint: string;
  boughtAt?: number;
  soldAt?: number;
  onchainMetadata?: any;
  externalMetadata?: any;
  currentPrices?: IStats;
  paperhanded?: IStats;
  diamondhanded?: IStats;
  profit?: number;
}
