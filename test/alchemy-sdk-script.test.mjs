import { getFloorPrice, getContractMetadata, summarizeNFTAttributes, getCountWithNFTAttribute, getOwnersForContract, getLogsForContractAddress, getAssetTransfersForAddress, getNFTSalesForAddress } from '../src/modules/alchemy-sdk-script.mjs';
import { config } from "../src/config.cjs";

test('Floor price of TNL Boxers NFT should be a number', async () => {
  expect.assertions(3);
  const data = await getFloorPrice(config.contractAddress);
  expect(data.openSea.floorPrice).toBeGreaterThanOrEqual(0);
  expect(data.openSea.priceCurrency).toBe('ETH');
  expect(data.openSea.collectionUrl).toBe('https://opensea.io/collection/muhammad-ali-thenextlegends-boxers');
});

test('Contract metadata of TNL Boxers NFT should show 5661 NFTs', async () => {
  expect.assertions(3);
  const data = await getContractMetadata(config.contractAddress);
  expect(data.symbol).toBe("TNLC");
  expect(data.totalSupply).toBe("5661");
  expect(data.tokenType).toBe("ERC721");
});

test('Attributes/traits metadata of TNL Boxers NFT should show 10 or more traits', async () => {
  expect.assertions(1);
  const data = await summarizeNFTAttributes(config.contractAddress);
  const count = Object.keys(data['summary']).length;
  expect(count).toBeGreaterThanOrEqual(10);
});

test('Attributes/traits of TNL Boxers NFT should show a few hundred with red gloves', async () => {
  expect.assertions(1);
  const data = await getCountWithNFTAttribute(config.contractAddress, "summary.Gloves.Red");
  expect(data).toBeGreaterThanOrEqual(100);
});

test('Attributes/traits of TNL Boxers NFT should show a few with gemstone green eyes', async () => {
  expect.assertions(1);
  const data = await getCountWithNFTAttribute(config.contractAddress, "summary.Eye Color.Gemstone Green");
  expect(data).toBeGreaterThanOrEqual(50);
});

test('For the TNL Boxers NFT collection there should be more than 1,000 owners', async () => {
  expect.assertions(1);
  const data = await getOwnersForContract(config.contractAddress);
  expect(data['owners'].length).toBeGreaterThanOrEqual(1000);
});

/**
 * Getting Ethereum transaction logs requires some explanation. This test aims to 
 * return a single transaction - the transfer of an NFT from one holder to another.
 * 
 * The log entry on Etherscan looks like this:
 * Address: 0x6bca6de2dbdc4e0d41f7273011785ea16ba47182 - the smart contract address
 * 
 * Name Transfer (index_topic_1 address from, index_topic_2 address to, index_topic_3 uint256 tokenId)
 * 
 * Topics
 * 
 * 0  0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef - represents a Transfer event
 * 1  0xA922DbB6b4ac245317d2077271865A94BAd4293B - transfer from address. We must pass this in Hex
 * 2  0xd3397C56C0E9C34AE749A3944025fB82A3e3E0C6 - transfer to address. We must pass this in Hex
 */
test('There should be transaction logs for an address', async () => {
  expect.assertions(2);
  const fromBlock = "0xeeaef9";
  const toBlock = "latest";
  let topics = [];
  topics.push(config.transferTopic);
  topics.push(config.walletAddressNFTTransferredFromHex);
  topics.push(config.walletAddressNFTTransferredToHex);
  // This test should return a single transfer event
  let data = await getLogsForContractAddress(config.contractAddress, fromBlock, toBlock, topics);
  expect(data.length).toBeGreaterThanOrEqual(0);

  topics = [];
  topics.push(config.transferTopic);
  topics.push(config.walletAddressNFTTransferredFromHex);
  // This test should return all transfer events from this wallet on this contract (since the fromBlock)
  data = await getLogsForContractAddress(config.contractAddress, fromBlock, toBlock, topics);
  expect(data.length).toBeGreaterThanOrEqual(1);

});

/**
 * Retrieve the same transfer logs as the test above, but this time by querying the wallet transfer events
 */
test('There should be transfer events for a wallet address', async () => {
  expect.assertions(1);
  const fromBlock = "0xeeaef9";
  const toBlock = "latest";
  const category = ["external", "internal", "erc20", "erc721", "erc1155"];
  // This test should return a single transfer event
  let data = await getAssetTransfersForAddress(config.walletAddressNFTTransferredFrom, config.walletAddressNFTTransferredTo, fromBlock, category);
  expect(data.transfers.length).toBeGreaterThanOrEqual(0);
});

/**
 * Retrieve the same transfer logs as the test above, but this time by querying the wallet transfer events
 */
 test('The transaction hash of the tx returned from the contract and the tx from the wallet should be identical', async () => {
  expect.assertions(1);
  const fromBlock = "0xeeaef9";
  const toBlock = "latest";
  const category = ["external", "internal", "erc20", "erc721", "erc1155"];
  // This test should return a single transfer event based on the wallet address
  const transferData = await getAssetTransfersForAddress(config.walletAddressNFTTransferredFrom, config.walletAddressNFTTransferredTo, fromBlock, category);

  let topics = [];
  topics.push(config.transferTopic);
  topics.push(config.walletAddressNFTTransferredFromHex);
  topics.push(config.walletAddressNFTTransferredToHex);
  // This test should return a single transfer event based on the contract address
  const txLogs = await getLogsForContractAddress(config.contractAddress, fromBlock, toBlock, topics);
  expect(transferData.transfers[0].hash).toMatch(txLogs[0].transactionHash);
});

test('There could be NFT Sales related to the NFT transfers for a wallet address', async () => {
  expect.assertions(1);
  const data = await getNFTSalesForAddress(config.walletAddressNFTTransferredTo, config.contractAddress);
  expect(data.nftSales.length).toBeGreaterThanOrEqual(0);
});

test('The NFT Sale and the Asset Transfer should reflect the same details in terms of buyer, seller, tx hash, etc.', async () => {
  expect.assertions(4);
  const fromBlock = "0xeeaef9";
  const toBlock = "latest";
  let category = ["external", "internal", "erc20", "erc721", "erc1155"];
  // This should return a single transfer event based on the wallet address
  const transferData = await getAssetTransfersForAddress(config.walletAddressNFTTransferredFrom, config.walletAddressNFTTransferredTo, fromBlock, category);

  // This should return a single sales event based on the wallet and contract address
  const salesData = await getNFTSalesForAddress(config.walletAddressNFTTransferredTo, config.contractAddress);
  expect(transferData.transfers[0].hash).toMatch(salesData.nftSales[0].transactionHash);
  expect(transferData.transfers[0].to).toMatch(salesData.nftSales[0].buyerAddress);
  expect(transferData.transfers[0].from).toMatch(salesData.nftSales[0].sellerAddress);
  expect(parseInt(transferData.transfers[0].tokenId, 16)).toBe(parseInt(salesData.nftSales[0].tokenId));
});