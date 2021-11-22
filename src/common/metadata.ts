import { Connection } from '@solana/web3.js';
import axios from 'axios';
import { programs } from '@metaplex/js';

const {
  metaplex: { Store, AuctionManager },
  metadata: { Metadata },
  auction: { Auction },
  vault: { Vault },
} = programs;

export async function fetchNFTMetadata(mint: string, conn: Connection) {
  console.log('Pulling metadata for:', mint);
  const metadataPDA = await Metadata.getPDA(mint);
  let onchainMetadata: any;
  try {
    onchainMetadata = (await Metadata.load(conn, metadataPDA)).data;
  } catch {
    // no metadata = isn't an actual NFT!
    return;
  }
  const { data: externalMetadata } = await axios.get(onchainMetadata!.data.uri);
  // console.log('onchain', onchainMetadata)
  // console.log('external', externalMetadata)
  return {
    onchainMetadata,
    externalMetadata,
  };
}
