import { Connection, LAMPORTS_PER_SOL, PublicKey } from '@solana/web3.js';
import { programs } from '@metaplex/js';
import { findSigner, removeItemOnce } from './util';
import { INFTData, PriceMethod } from '@/common/types';
import { calcPaperDiamondHands } from '@/common/paperhands';
import { triageTxByExchange } from '@/common/marketplaces/mpTransactions';
import { fetchAndCalcStats } from '@/common/marketplaces/mpPrices';
import { fetchNFTMetadata } from '@/common/metadata';

const {
  metaplex: { Store, AuctionManager },
  metadata: { Metadata },
  auction: { Auction },
  vault: { Vault },
} = programs;

export class NFTHandler {
  conn: Connection;

  allNFTs: INFTData[] = [];

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
    // todo for some reason this works a lot fast with solana's own node
    const conn = new Connection('https://api.mainnet-beta.solana.com');

    let txInfos = await conn.getSignaturesForAddress(new PublicKey(address));
    console.log(`got ${txInfos.length} txs to process`);

    // todo temp for debugging
    txInfos = txInfos.splice(0, 200);

    // reverse the array, we want to start with historic transactions not other way around
    txInfos = txInfos.reverse();

    const sigs = txInfos.map((i) => i.signature);

    let i = 1;
    while (true) {
      const sigsToProcess = sigs.splice(0, 220);
      if (!sigsToProcess.length) {
        console.log('no more sigs to process!');
        break;
      }

      console.log(`processing another ${sigsToProcess.length} sigs`);
      const txs = await conn.getParsedConfirmedTransactions(sigsToProcess);
      console.log('got txs');
      // console.log(txs)
      // writeTxsToDisk('txs', txs)
      txs.forEach((tx) => {
        try {
          console.log(`triaging ${i} of ${txInfos.length}`);
          // console.log('selected tx', t)
          const exchange = triageTxByExchange(tx);
          if (exchange) {
            this.parseTx(tx, address, exchange);
          }
        } catch (e) {
          console.log('uh oh', e);
        } finally {
          i += 1;
        }
      });
    }
    console.log('Tx history pulled!');
  }

  // --------------------------------------- fetch prices

  async populateNFTsWithPriceStats() {
    const promises: any[] = [];
    this.allNFTs.forEach((nft) =>
      promises.push(fetchAndCalcStats(nft.onchainMetadata.data.creators[0].address))
    );
    const responses = await Promise.all(promises);
    responses.forEach((r, i) => {
      this.allNFTs[i].currentPrices = r;
    });
    console.log('Price Stats populated!');
  }

  // --------------------------------------- get NFT metadata

  async populateNFTsWithMetadata() {
    const promises: any[] = [];
    this.allNFTs.forEach((nft) => promises.push(fetchNFTMetadata(nft.mint, this.conn)));
    const responses = await Promise.all(promises);
    responses.forEach((r, i) => {
      this.allNFTs[i].onchainMetadata = r.onchainMetadata;
      this.allNFTs[i].externalMetadata = r.externalMetadata;
    });
    console.log('Metadata populated!');
  }

  // --------------------------------------- calc paperhands

  populateNFTsWithPapersAndDiamonds() {
    for (const nft of this.allNFTs) {
      const [paper, diamond, profit] = calcPaperDiamondHands(nft);
      nft.paperhanded = paper;
      nft.diamondhanded = diamond;
      nft.profit = profit;
    }
    console.log('Papers / diamons / profit calculated!');
  }

  // --------------------------------------- play

  async analyzeAddress(address: string) {
    await this.getTxHistory(address);
    await this.populateNFTsWithMetadata();
    await this.populateNFTsWithPriceStats();
    this.populateNFTsWithPapersAndDiamonds();
    console.log(this.allNFTs);
    return this.allNFTs;
  }
}

// play();
