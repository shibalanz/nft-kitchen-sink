/**
 * This script uses the Alchemy SDK & API to access metadata on NFT collections
 * 
 * There are two ways to use Alchemy:
 *    1) Using the SDK
 *    2) Using the API directly using 'fetch'
 * 
 * Both ways are used here as the SDK provides only a subset of the full API. This
 * limitation stems from Opensea, where the OS SDK only supports a subset of the full API.
 */

import { Network, Alchemy } from "alchemy-sdk";
import fetch from "node-fetch";
import { config } from "../config.cjs";

const settings = {
  apiKey: config.apiKey,
  network: Network.ETH_MAINNET
};

// Setup request options for fetch
const requestOptions = {
  method: 'GET',
  redirect: 'follow',
  headers: { accept: 'application/json' },
};

const baseURL = `https://eth-mainnet.alchemyapi.io/nft/v2/${config.apiKey}/`;
const baseBetaURL = `https://eth-mainnet.g.alchemy.com/nft/v2/${config.apiKey}/`

const alchemy = new Alchemy(settings);

// Return the NFT floor price for a contract
async function getFloorPrice(contract) {
  console.log("=== getFloorPrice ===");
  console.log("getFloorPrice for contract ", contract);
  try {
    const response = await alchemy.nft.getFloorPrice(contract);
    console.log("getFloorPrice for contract is: ", response);
    return response;
  }
  catch (error) {
    console.log(`getFloorPrice threw error ${error}`);
  }
}

// Return the contract metadata for a contract
async function getContractMetadata(contract) {
  console.log("=== getContractMetadata ===");
  console.log("getContractMetadata for contract ", contract);
  try {
    const response = await alchemy.nft.getContractMetadata(contract);
    console.log("getContractMetadata for contract is: ", response);
    return response;
  }
  catch (error) {
    console.log(`getContractMetadata threw error ${error}`);
  }
}

// Return the metadata summary for a contract
async function summarizeNFTAttributes(contract) {
  const fetchURL = `${baseURL}summarizeNFTAttributes?contractAddress=${contract}`;

  console.log("=== summarizeNFTAttributes ===");
  console.log("summarizeNFTAttributes for contract ", contract);
  try {
    const response = await fetch(fetchURL, requestOptions);
    const data = await response.json();
    return data;
  }
  catch (error) {
    console.log(`summarizeNFTAttributes threw error ${error}`);
  }
}

// Return the value of a specific metadata attribute, if it exists
async function getCountWithNFTAttribute(contract, attribute) {
  const fetchURL = `${baseURL}summarizeNFTAttributes?contractAddress=${contract}`;

  console.log("=== getCountWithNFTAttribute ===");
  console.log("getCountWithNFTAttribute for contract ", contract);
  console.log("getCountWithNFTAttribute fetch data from url ", fetchURL);
  const response = await fetch(fetchURL, requestOptions);
  const data = await response.json();
  console.log("attribute: ", attribute);
  //the JSON path could be nested, as in object1.object2.object3
  var attributes = attribute.split('.');
  let value = attributes.reduce((obj, key) => obj[key], data);
  console.log("attribute has a value of: ", value);
  return value;
}

// Return the list of NFT owners for a contract
async function getOwnersForContract(contract) {
  console.log("=== getOwnersForContract ===");
  console.log("getOwnersForContract for contract ", contract);
  const response = await alchemy.nft.getOwnersForContract(contract);
  console.log("number of owners: ", response['owners'].length);
  return response;
}

/**
 * Return the transaction logs for a smart contract. Since there are limitations on
 * the amount of data that can be returned, you filter the logs using topics, as 
 * explained below.
 * 
 * An example of a log entry on Etherscan looks like this:
 * Address: 0x6bca6de2dbdc4e0d41f7273011785ea16ba47182 - the smart contract address
 * 
 * Name Transfer (index_topic_1 address from, index_topic_2 address to, index_topic_3 uint256 tokenId)
 * 
 * Topics (topics are used to filter the logs. In this example we filter down to a specific Transfer event)
 * 
 * 0  0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef - represents a Transfer event
 * 1  0xA922DbB6b4ac245317d2077271865A94BAd4293B - transfer from address. We must pass this in Hex, but it shows in decimal on Etherscan (with the option to show the Hex version)
 * 2  0xd3397C56C0E9C34AE749A3944025fB82A3e3E0C6 - transfer to address. We must pass this in Hex, but it shows in decimal on Etherscan (with the option to show the Hex version)
 *
 * @param {*} address - contract address
 * @param {*} fromBlock 
 * @param {*} toBlock 
 * @param {*} topics - topics, as discussed above
 * @returns - the transaction logs
 */
async function getLogsForContractAddress(address, fromBlock, toBlock, topics) {
  console.log("=== getLogsForContractAddress ===");
  console.log("getLogsForContractAddress for address ", address);
  console.log("getLogsForContractAddress for topics ", topics);
  const response = await alchemy.core.getLogs({
    address: address,
    fromBlock: fromBlock,
    toBlock: toBlock,
    topics: topics,
  });
  console.log("getLogsForContractAddress: ", response);
  return response;
}

/**
 * Get transfers for a wallet address
 * 
 * @param {*} category - ["external", "internal", "erc20", "erc721", "erc1155"],
 */
async function getAssetTransfersForAddress(addressFrom, addressTo, fromBlock, category) {

  console.log("=== getAssetTransfersForAddress ===");
  console.log("getAssetTransfersForAddress for address ", addressFrom);
  console.log("getAssetTransfersForAddress for category ", category);

  const response = await alchemy.core.getAssetTransfers({
    fromBlock: fromBlock,
    fromAddress: addressFrom,
    toAddress: addressTo,
    category: category,
  });
  console.log("getAssetTransfersForAddress: ", response);
  return response;
}

/**
 * Get transfers for a contract
 * 
 * @param {*} category - ["external", "internal", "erc20", "erc721", "erc1155"],
 */
 async function getAssetTransfersForContract(contractAddress, fromBlock, category, pageKey) {

  console.log("=== getAssetTransfersForContract ===");
  console.log("getAssetTransfersForContract for address ", contractAddress);
  console.log("getAssetTransfersForContract for category ", category);

  const response = await alchemy.core.getAssetTransfers({
    fromBlock: fromBlock,
    contractAddresses: contractAddress,
    category: category,
    pageKey: pageKey,
  });
  //console.log("getAssetTransfersForContract: ", response);
  return response;
}

/**
 * Get NFT sales for a wallet address for a specific NFT contract
 */
 async function getNFTSalesForAddress(buyerAddress, contractAddress, tokenId) {
  let fetchURL = `${baseBetaURL}getNFTSales?buyerAddress=${buyerAddress}&contractAddress=${contractAddress}`;
  if (tokenId)
    fetchURL += `&tokenId=${tokenId}`;

  console.log("=== getNFTSalesForAddress ===");
  console.log("getNFTSalesForAddress for buyerAddress ", buyerAddress);
  console.log("getNFTSalesForAddress for contractAddress ", contractAddress);

  try {
    const response = await fetch(fetchURL, requestOptions);
    const data = await response.json();
    console.log("getNFTSalesForAddress: ", data);
    return data;
  }
  catch (error) {
    console.log(`getNFTSalesForAddress threw error ${error}`);
  }
}

export {
  getFloorPrice,
  getContractMetadata,
  summarizeNFTAttributes,
  getCountWithNFTAttribute,
  getOwnersForContract,
  getLogsForContractAddress,
  getAssetTransfersForAddress,
  getAssetTransfersForContract,
  getNFTSalesForAddress,
};


