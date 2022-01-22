import { Connection, LAMPORTS_PER_SOL, PublicKey, ConfirmedSignatureInfo } from '@solana/web3.js';
import axios from 'axios';
import { findSigner, okToFailAsync } from './util';
import { INFTData } from '@/common/types';
import { calcPaperDiamondHands } from '@/common/paperhands';
import { triageTxByExchange } from '@/common/marketplaces/mpTransactions';
import { fetchAndCalcStats } from '@/common/marketplaces/mpPrices';
import { fetchNFTMetadata } from '@/common/metadata';
import { EE } from '@/globals';
import { IUpdateLoadingParams, LoadStatus } from '@/composables/loading';
import { getNFTsByOwner } from '@/common/nftsByOwner';

export class NFTHandler {
  conn: Connection;

  allNFTs: INFTData[] = [];

  solPrice?: number;

  constructor(conn: Connection) {
    this.conn = conn;
  }

  // --------------------------------------- helpers

  findOrCreateNFTEntry(mint: string, props: any) {
    for (const nft of this.allNFTs) {
      if (nft.mint === mint) {
        for (const [key, value] of Object.entries(props)) {
          (nft as any)[key] = value;
        }
        return;
      }
    }
    this.allNFTs.push({
      mint,
      ...props,
    });
  }

  // --------------------------------------- get tx history

  parseTx(tx: any, owner: string, exchange: string) {
    // identify the token through postTokenBalances
    const tokenMint = tx.meta.preTokenBalances[0].mint;
    // there's only one signer = the buyer, that's the acc we need
    const [buyerIdx, buyerAcc] = findSigner(tx.transaction.message.accountKeys)!;
    const { preBalances } = tx.meta;
    const { postBalances } = tx.meta;
    const buyerSpent = (preBalances[buyerIdx] - postBalances[buyerIdx]) / LAMPORTS_PER_SOL;
    if (buyerAcc.toBase58() === owner) {
      console.log(`Bought ${tokenMint} for ${buyerSpent} SOL on ${exchange}`);
      this.findOrCreateNFTEntry(tokenMint, { boughtAt: buyerSpent });
    } else {
      console.log(`Sold ${tokenMint} for ${buyerSpent} SOL on ${exchange}`);
      this.findOrCreateNFTEntry(tokenMint, { soldAt: buyerSpent });
    }
  }

  async getTxHistory(address: string) {
    // (!) for some reason this works a lot fast with solana's own node
    // const conn = new Connection('https://api.mainnet-beta.solana.com');

    let beforeSignature;

    let sigs: string[] = [];

    while (true) {
      const signatures: ConfirmedSignatureInfo[] = await this.conn.getSignaturesForAddress(
        new PublicKey(address),
        { before: beforeSignature }
      );

      console.log(`got ${signatures.length} signatures to process`);

      if (signatures.length === 0) {
        break;
      }

      sigs = sigs.concat(signatures.map((s) => s.signature));

      beforeSignature = signatures[signatures.length - 1].signature;
    }

    // reverse the array, we want to start with historic transactions not other way around
    sigs = sigs.reverse();

    let i = 1;
    while (true) {
      const sigsToProcess = sigs.splice(0, 200);
      if (!sigsToProcess.length) {
        console.log('no more sigs to process!');
        break;
      }

      // intentionally not parallelizing this - we're using the public node and this would lead to 429s
      const txs = await this.conn.getParsedConfirmedTransactions(sigsToProcess);
      console.log(`processing another ${sigsToProcess.length} sigs`);
      txs.forEach((tx) => {
        try {
          // console.log(`triaging ${i} of ${txInfos.length}`);
          const exchange = triageTxByExchange(tx);
          if (exchange) {
            this.parseTx(tx, address, exchange);
          }
        } catch (e) {
          // console.log('uh oh', e);
        } finally {
          i += 1;
        }
      });
    }
    console.log(`Analyzed a total of ${sigs.length} signatures.`);
  }

  // --------------------------------------- get NFTs by owner

  async getNFTsByOwner(address: string) {
    const newNFTs = await getNFTsByOwner(new PublicKey(address), this.conn);
    newNFTs.forEach((nft) => {
      this.findOrCreateNFTEntry(nft, {});
    });
    console.log(`Fetched a total of ${newNFTs.length} potential NFT mints`);
  }

  // --------------------------------------- get NFT metadata

  async populateNFTsWithMetadata() {
    const promises: any[] = [];
    this.allNFTs.forEach((nft) =>
      promises.push(okToFailAsync(fetchNFTMetadata, [nft.mint, this.conn]))
    );
    const responses = await Promise.all(promises);
    responses.forEach((r, i) => {
      if (r) {
        this.allNFTs[i].onchainMetadata = r.onchainMetadata;
        this.allNFTs[i].externalMetadata = r.externalMetadata;
      }
    });
    console.log(`Populated metadata for a total of ${this.allNFTs.length} NFTs`);
  }

  removeTokensWithoutMetadata() {
    this.allNFTs = this.allNFTs.filter(
      (nft) =>
        nft.onchainMetadata &&
        nft.externalMetadata &&
        nft.onchainMetadata.data.creators &&
        nft.onchainMetadata.data.creators.length
    );
    console.log(`Actual NFTs remaining, after metadata clean: ${this.allNFTs.length}`);
  }

  // --------------------------------------- fetch prices

  async populateNFTsWithPriceStats() {
    const promises: any[] = [];
    const creators = this.allNFTs.map((nft) => nft.onchainMetadata.data.creators[0].address);
    const dedupedCreators = [...new Set(creators)];

    dedupedCreators.forEach((c) => promises.push(okToFailAsync(fetchAndCalcStats, [c])));
    const responses = await Promise.all(promises);
    responses.forEach((r) => {
      if (r) {
        this.allNFTs.forEach((nft) => {
          if (nft.onchainMetadata.data.creators[0].address === r.creator) {
            nft.currentPrices = r;
          }
        });
      }
    });
    console.log(`Populated price stats for a total of ${this.allNFTs.length} NFTs`);
  }

  // --------------------------------------- calc paperhands

  populateWithProfitPapersDiamonds() {
    for (const nft of this.allNFTs) {
      const { paperhanded, diamondhanded, profit } = calcPaperDiamondHands(nft);
      nft.paperhanded = paperhanded;
      nft.diamondhanded = diamondhanded;
      nft.profit = profit;
    }
    console.log(`Calculated profit/paper/diamondhands for a total of ${this.allNFTs.length} NFTs`);
  }

  // --------------------------------------- get sol price

  async fetchSolPrice() {
    const headers = {
      Accepts: 'application/json',
    };
    const { data } = await axios.get(
      `https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=solana`,
      { headers: headers as any }
    );
    this.solPrice = data[0].current_price;
    console.log('Fetched current SOL price:', data[0].current_price);
  }

  // --------------------------------------- analyze

  async analyzeAddress(address: string) {
    // ---------- STEP 1: find relevant tokens in 2 ways:
    EE.emit('loading', {
      newStatus: LoadStatus.Loading,
      newProgress: 0,
      maxProgress: 50,
      newText: 'Fetching transaction history...',
    });
    // 1) from tx history (captures sold ones)
    await this.getTxHistory(address);
    // 2) from currently held tokens (captures NFTs that weren't bought, but rather received/minted)
    await this.getNFTsByOwner(address);

    // ---------- STEP 2: fetch metadata + filter out non-NFTs
    EE.emit('loading', {
      newStatus: LoadStatus.Loading,
      newProgress: 50,
      maxProgress: 70,
      newText: `Preparing NFT metadata...`,
    } as IUpdateLoadingParams);
    await this.populateNFTsWithMetadata();
    // no metadata = not a real NFT, remove
    this.removeTokensWithoutMetadata();

    // ---------- STEP 3: fetch prices from marketplaces and sol PRice
    EE.emit('loading', {
      newStatus: LoadStatus.Loading,
      newProgress: 70,
      maxProgress: 100,
      newText: `Fetching prices from marketplaces...`,
    } as IUpdateLoadingParams);
    await this.populateNFTsWithPriceStats();
    await this.fetchSolPrice();

    // ---------- STEP 4: calc paper/diamond hands
    this.populateWithProfitPapersDiamonds();

    console.log(this.allNFTs);
    return this.allNFTs;
  }
}
