import { Connection, PublicKey } from '@solana/web3.js';
import { TOKEN_PROGRAM_ID } from '@solana/spl-token';

export async function getNFTsByOwner(owner: PublicKey, conn: Connection): Promise<string[]> {
  const tokens = await conn.getParsedTokenAccountsByOwner(owner, { programId: TOKEN_PROGRAM_ID });

  // initial filter - only tokens with 0 decimals & of which 1 is present in the wallet
  return tokens.value
    .filter((t) => {
      const amount = t.account.data.parsed.info.tokenAmount;
      return amount.decimals === 0 && amount.uiAmount === 1;
    })
    .map((t) => t.account.data.parsed.info.mint);
}
