/**
 * This script provides useful information on a wallet address, such as:
 * 
 *    1) Tokens it holds
 *    2) Approvals it has allowed
 *    3) Transactions it has performed
 * 
 * It supports ENS. According to the web3js docs, it should support ENS natively, i.e.,
 * either you pass an address or an ENS to web3js. I checked the source code and this isn't the
 * case - it still checks that an address starts with 0x.
 * 
 * 
 */

import { Network, Alchemy } from "alchemy-sdk";
import { config } from "../config.cjs";
import Web3 from "web3";

const settings = {
  apiKey: config.apiKey,
  network: Network.ETH_MAINNET
};

const alchemy = new Alchemy(settings);

const baseURLAlchemy = `https://eth-mainnet.alchemyapi.io/v2/${config.apiKey}/`;

const web3 = new Web3(baseURLAlchemy);
const ens = web3.eth.ens;

// Return the balance of a wallet address using the Alchemy SDK
async function getWalletBalanceAlchemy(walletAddress) {
  console.log("getWalletBalanceAlchemy for wallet address ", walletAddress);
  try {
    const response = await alchemy.core.getBalance(await resolveAddress(walletAddress), "latest");
    console.log("getWalletBalanceAlchemy response is ", response);
    const balance = BigInt(response._hex);
    console.log("getWalletBalanceAlchemy balance is ", balance);
    const ethBalance = Number(web3.utils.fromWei(balance.toString(), "ether"));
    console.log("getWalletBalanceAlchemy balance in ETH is ", ethBalance.toString());
    return ethBalance;
  }
  catch (error) {
    console.log(`getWalletBalanceAlchemy threw error ${error}`);
  }
}

// Return the balance of a wallet address
async function getWalletBalance(walletAddress) {
  console.log("getWalletBalance for wallet address ", walletAddress);
  try {
    const response = await web3.eth.getBalance(await resolveAddress(walletAddress));
    console.log("getWalletBalance balance is ", response);
    const ethBalance = Number(web3.utils.fromWei(response, "ether"));
    console.log("getWalletBalance balance in ETH is ", ethBalance);
    return ethBalance;
  }
  catch (error) {
    console.log(`getWalletBalance threw error ${error}`);
  }
}

// Return whether the account address is a contract address or externally owned account (wallet address) using the Alchemy SDK
async function isExternalOwnedAccountAlchemy(address) {
  console.log("isExternalOwnedAccountAlchemy for address ", address);
  try {
    const response = await alchemy.core.getCode(address);
    console.log("isExternalOwnedAccountAlchemy response to getCode is ", response.slice(0,10));
    let eoa = false;
    if (response === '0x')
      eoa = true;
    console.log("isExternalOwnedAccountAlchemy, account is external owned account ", eoa);
    return eoa;
  }
  catch (error) {
    console.log(`isExternalOwnedAccountAlchemy threw error ${error}`);
  }
}

// Return whether the account address is a contract address or externally owned account (wallet address)
async function isExternalOwnedAccount(address) {
  console.log("isExternalOwnedAccount for address ", address);
  try {
    const response = await web3.eth.getCode(address);
    console.log("isExternalOwnedAccount response to getCode is ", response.slice(0,10));
    let eoa = false;
    if (response === '0x')
      eoa = true;
    console.log("isExternalOwnedAccount, account is external owned account ", eoa);
    return eoa;
  }
  catch (error) {
    console.log(`isExternalOwnedAccount threw error ${error}`);
  }
}

// Return the transaction count for a wallet address
async function getWalletTransactionCount(walletAddress) {
  console.log("getWalletTransactionCount for wallet address ", walletAddress);
  try {

    const response = await web3.eth.getTransactionCount(await resolveAddress(walletAddress));
    console.log("getWalletTransactionCount balance is ", response);
    return response;
  }
  catch (error) {
    console.log(`getWalletTransactionCount threw error ${error}`);
  }
}

// Return the tokens held by a wallet address
async function getTokensInWallet(walletAddress) {
  console.log("getTokensInWallet for wallet address ", walletAddress);
  try {
    const response = await alchemy.core.getBalance(await resolveAddress(walletAddress), "latest");
    console.log("getTokensInWallet response is ", response);
    return response.hex;
  }
  catch (error) {
    console.log(`getTokensInWallet threw error ${error}`);
  }
}

async function resolveAddress(walletAddress) {
  if (walletAddress.startsWith('0x'))
    return walletAddress;
  else
    return ens.getAddress(walletAddress);
}

export {
  getTokensInWallet,
  getWalletBalance,
  getWalletBalanceAlchemy,
  isExternalOwnedAccount,
  isExternalOwnedAccountAlchemy,
  getWalletTransactionCount,
};


