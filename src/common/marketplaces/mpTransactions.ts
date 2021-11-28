import { bs58toHex } from '@/common/util';

// --------------------------------------- helpers

function extractIxData(tx: any): string {
  return bs58toHex(tx.transaction.message.instructions.at(-1).data);
}

// --------------------------------------- mp identifiers

function isSMBV2PurchaseTx(tx: any) {
  const ixData = extractIxData(tx);
  // check is calling the buy instruction
  const ixNr = parseInt(ixData.substr(0, 2), 10);
  console.log(ixNr);
  return ixNr === 95;
}

function isSolSeaPurchaseTx(tx: any) {
  const ixData = extractIxData(tx);
  // check is calling the buy instruction
  const ixNr = parseInt(ixData.substr(0, 2), 10);
  return ixNr === 2;
}

function isExchangeArtPurchaseTx(tx: any) {
  const ixData = extractIxData(tx);
  // check is calling the buy instruction
  const ixNr = parseInt(ixData.substr(0, 2), 10);
  return ixNr === 1;
}

function isAlphaArtPurchaseTx(tx: any) {
  const ixData = extractIxData(tx);
  // check is calling the buy instruction
  const ixNr = parseInt(ixData.substr(0, 2), 10);
  return ixNr === 2;
}

function isDigitalEyezPurchaseTx(tx: any) {
  const ixData = extractIxData(tx);
  // check is calling the buy instruction
  const ixNr = parseInt(ixData.substr(0, 2), 10);
  const isPurchase = ixNr === 1;
  // check is not using the buy instruction to cancel
  // todo not great to rely on logs (especially with a typo) but I can't think of a better way
  // both their purchase and cancel txs have the exact same data signatures
  const isNotCancellation = tx.meta.logMessages.indexOf('Program log: Transfering sales tax') > -1;
  return isPurchase && isNotCancellation;
}

function isMagicEdenPurchaseTx(tx: any) {
  const ixData = extractIxData(tx);
  // check is calling the buy instruction
  const ixNr = parseInt(ixData.substr(0, 3), 10);
  return ixNr === 438;
}

function isSolanartPurchaseTx(tx: any) {
  const ixData = extractIxData(tx);
  // check is calling the buy instruction
  const ixNr = parseInt(ixData.substr(0, 2), 10);
  const isPurchase = ixNr === 5; // the right way
  // check is not using the buy instruction to cancel
  const ixStruct = ixData.substr(2, ixData.length);
  const isNotCancellation = ixStruct !== '0000000000000000';
  return isPurchase && isNotCancellation;
}

// --------------------------------------- triage

export function triageTxByExchange(tx: any) {
  const progId = tx.transaction.message.instructions.at(-1).programId.toBase58();
  const sig = tx.transaction.signatures[0];
  let exchange;

  switch (progId) {
    case 'CJsLwbP1iu5DuUikHEJnLfANgKy6stB2uFgvBBHoyxwz':
      exchange = 'Solanart';
      console.log(`tx ${sig} is ${exchange}`);
      if (isSolanartPurchaseTx(tx)) {
        return exchange;
      }
      break;
    case 'MEisE1HzehtrDpAAT8PnLHjpSSkRYakotTuJRPjTpo8':
      exchange = 'MagicEden';
      console.log(`tx ${sig} is ${exchange}`);
      if (isMagicEdenPurchaseTx(tx)) {
        return exchange;
      }
      break;
    case 'A7p8451ktDCHq5yYaHczeLMYsjRsAkzc3hCXcSrwYHU7':
      exchange = 'DigitalEyez';
      console.log(`tx ${sig} is ${exchange}`);
      if (isDigitalEyezPurchaseTx(tx)) {
        return exchange;
      }
      break;
    case 'HZaWndaNWHFDd9Dhk5pqUUtsmoBCqzb1MLu3NAh1VX6B':
      exchange = 'AlphaArt';
      console.log(`tx ${sig} is ${exchange}`);
      if (isAlphaArtPurchaseTx(tx)) {
        return exchange;
      }
      break;
    case 'AmK5g2XcyptVLCFESBCJqoSfwV3znGoVYQnqEnaAZKWn':
      exchange = 'ExchangeArt';
      console.log(`tx ${sig} is ${exchange}`);
      if (isExchangeArtPurchaseTx(tx)) {
        return exchange;
      }
      break;
    case '617jbWo616ggkDxvW1Le8pV38XLbVSyWY8ae6QUmGBAU':
      exchange = 'SolSea';
      console.log(`tx ${sig} is ${exchange}`);
      if (isSolSeaPurchaseTx(tx)) {
        return exchange;
      }
      break;
    case 'GvQVaDNLV7zAPNx35FqWmgwuxa4B2h5tuuL73heqSf1C': // SMB v1 (pre offers)
      exchange = 'SMB marketplace';
      console.log(`tx ${sig} is ${exchange}`);
      // NOTE: this is NOT a mistake. The SMB market uses the same codebase as DE!
      if (isDigitalEyezPurchaseTx(tx)) {
        return exchange;
      }
      break;
    case 'J7RagMKwSD5zJSbRQZU56ypHUtux8LRDkUpAPSKH4WPp': // SMB v2 (post offers)
      exchange = 'SMB v2 marketplace';
      console.log(`tx ${sig} is ${exchange}`);
      // NOTE: this is NOT a mistake. The SMB market uses the same codebase as DE!
      if (isSMBV2PurchaseTx(tx)) {
        return exchange;
      }
      break;
  }
}
