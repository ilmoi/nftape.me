/* eslint-disable no-use-before-define */

import { PublicKey } from '@solana/web3.js';
import BN from 'bn.js';
import bs58 from 'bs58';
import { INFTData } from '@/common/types';

export async function okToFailAsync(callback: any, args: any[], wantObject = false) {
  try {
    // mandatory await here, can't just pass down (coz we need to catch error in this scope)
    return await callback(...args);
  } catch (e) {
    console.log(`Oh no! ${callback.name} called with ${args} blew up!`);
    console.log('Full error:', e);
    return wantObject ? {} : undefined;
  }
}

export function okToFailSync(callback: any, args: any[], wantObject = false) {
  try {
    return callback(...args);
  } catch (e) {
    console.log(`Oh no! ${callback.name} called with ${args} blew up!`);
    console.log('Full error:', e);
    return wantObject ? {} : undefined;
  }
}

export function stringifyPubkeysAndBNsInObject(o: any): any {
  const newO = { ...o };
  for (const [k, v] of Object.entries(newO)) {
    if (v instanceof PublicKey) {
      newO[k] = v.toBase58();
    } else if (v instanceof BN) {
      newO[k] = v.toString();
    } else if (parseType(v) === 'array') {
      newO[k] = stringifyPubkeysAndBNInArray(v as any);
    } else if (parseType(v) === 'dict') {
      newO[k] = stringifyPubkeysAndBNsInObject(v);
    } else {
      newO[k] = v;
    }
  }
  return newO;
}

export function stringifyPubkeysAndBNInArray(a: any[]): any[] {
  const newA = [];
  for (const i of a) {
    if (i instanceof PublicKey) {
      newA.push(i.toBase58());
    } else if (i instanceof BN) {
      newA.push(i.toString());
    } else if (parseType(i) === 'array') {
      newA.push(stringifyPubkeysAndBNInArray(i));
    } else if (parseType(i) === 'dict') {
      newA.push(stringifyPubkeysAndBNsInObject(i));
    } else {
      newA.push(i);
    }
  }
  return newA;
}

export function parseType<T>(v: T): string {
  if (v === null || v === undefined) {
    return 'null';
  }
  if (typeof v === 'object') {
    if (v instanceof Array) {
      return 'array';
    }
    if (v instanceof Date) {
      return 'date';
    }
    return 'dict';
  }
  return typeof v;
}

export async function pause(ms: number) {
  // weird semantics - but needed to work inside jest
  // taken from https://stackoverflow.com/questions/46077176/jest-settimeout-not-pausing-test
  await new Promise((response) =>
    setTimeout(() => {
      console.log(`pausing for ${ms / 1000}s`);
      response(0);
    }, ms)
  );
}

export function bs58toHex(bString: string): string {
  const bytes = bs58.decode(bString);
  return bytes.toString('hex');
}

export function findSigner(accKeys: any[]) {
  for (const [i, el] of accKeys.entries()) {
    if (el.signer) {
      return [i, el.pubkey];
    }
  }
}

export function removeItemOnce(arr: any[], value: number) {
  const index = arr.indexOf(value);
  if (index > -1) {
    arr.splice(index, 1);
  }
  return arr;
}
