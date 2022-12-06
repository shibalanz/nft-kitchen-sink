import { getTokensInWallet, getWalletBalance, getWalletBalanceAlchemy, isExternalOwnedAccount, isExternalOwnedAccountAlchemy, getWalletTransactionCount } from '../src/modules/wallet.mjs';
import { config } from "../src/config.cjs";

test('Balance of wallet address should be greater than 0. Balance should be identical when retrieved from Alchemy or Web3', async () => {
  expect.assertions(4);
  const data = await getWalletBalance(config.walletAddress);
  const dataENS = await getWalletBalance(config.walletAddressENS);
  const dataAlchemy = await getWalletBalanceAlchemy(config.walletAddress);
  expect(data).toBeGreaterThanOrEqual(0);
  expect(dataENS).toBeGreaterThanOrEqual(0);
  expect(dataAlchemy).toBeGreaterThanOrEqual(0);
  expect(dataAlchemy).toEqual(data);
});

test('Wallet address should be an external owned account', async () => {
  expect.assertions(2);
  const data = await isExternalOwnedAccount(config.walletAddress);
  const dataAlchemy = await isExternalOwnedAccountAlchemy(config.walletAddress);
  expect(data).toBeTruthy();
  expect(dataAlchemy).toBeTruthy();
});

test('Contract address should not be an external owned account', async () => {
  expect.assertions(2);
  const data = await isExternalOwnedAccount(config.contractAddress);
  const dataAlchemy = await isExternalOwnedAccountAlchemy(config.contractAddress);
  expect(data).toBeFalsy();
  expect(dataAlchemy).toBeFalsy();
});

test('Wallet address should have executed more than 0 transactions', async () => {
  expect.assertions(1);
  const data = await getWalletTransactionCount(config.walletAddress);
  expect(data).toBeGreaterThanOrEqual(0);
});

test('Wallet address ENS should have executed more than 0 transactions', async () => {
  expect.assertions(1);
  const data = await getWalletTransactionCount(config.walletAddressENS);
  expect(data).toBeGreaterThanOrEqual(0);
});