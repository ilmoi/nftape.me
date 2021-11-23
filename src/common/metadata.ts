import { Connection } from '@solana/web3.js';
import axios from 'axios';
import { programs } from '@metaplex/js';

const {
  metadata: { Metadata },
} = programs;

export async function fetchNFTMetadata(mint: string, conn: Connection) {
  // console.log('Pulling metadata for:', mint);
  const metadataPDA = await Metadata.getPDA(mint);
  const onchainMetadata = (await Metadata.load(conn, metadataPDA)).data;
  let externalMetadata;
  if (onchainMetadata) {
    externalMetadata = (await axios.get(onchainMetadata.data.uri)).data;
  }
  return {
    onchainMetadata,
    externalMetadata,
  };
}
