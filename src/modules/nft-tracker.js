/**
 * This script tracks the history, including mint, sales and transfers, of a specific NFT. 
 * We are interested in the following events:
 * 
 *  Mint
 *  Transfer
 *  Sale
 * 
 * TODO: populate the db.json from the latest block onwards, rather than starting from scratch or not updating it
 */

import { config } from "../config.cjs";
import { readDB, writeDB } from './db.js';
import { getLogsForContractAddress, getAssetTransfersForAddress, getAssetTransfersForContract, getNFTSalesForAddress } from './alchemy-sdk-script.mjs';
import Web3 from "web3";

async function getNFTHistory(contractAddress, tokenId) {
    const fromBlock = "0x0";
    const toBlock = "latest";
    let topics = [];
    const category = ["erc721", "erc1155"];
    let tokenTransfers = [];
    let payloadType = 'NFTAssetTransfers';

    if (!tokenId.startsWith('0x'))
        tokenId = Web3.utils.padLeft(Number(tokenId), 64);
    console.log(`In getNFTHistory, looking for tokenId ${tokenId}`);
    try {
        let response;
        let pageKey;
        response = await readDB(payloadType);
        console.log(`In getNFTHistory, reading cache from database`);
        if (response && response.NFTAssetTransfers.length > 0) {
            console.log(`In getNFTHistory, cache from database contains ${response.NFTAssetTransfers.length} entries`);
            let transferCount = response.NFTAssetTransfers.length;
            for (let index = 0; index < transferCount; index++) {
                if (response.NFTAssetTransfers[index].tokenId == tokenId)
                    tokenTransfers.push(response.NFTAssetTransfers[index]);
            }
        }
        else {
            console.log(`In getNFTHistory, no cache available, retrieving via API. This may take awhile`);
            do {
                response = await getAssetTransfersForContract(contractAddress, fromBlock, category, pageKey);
                pageKey = response.pageKey;
                console.log(`getNFTHistory, pageKey is ${pageKey}`);
                if (response.transfers)
                    writeDB(response.transfers, payloadType);
                let transferCount = response.transfers.length;
                for (let index = 0; index < transferCount; index++) {
                    if (response.transfers[index].tokenId == tokenId)
                        tokenTransfers.push(response.transfers[index]);
                }
            } while (pageKey);
        }

        return tokenTransfers;
    }
    catch (error) {
        console.error(`getNFTHistory threw error ${error}`);
    }
}

async function main() {
    const NFTHistory = await getNFTHistory([config.contractAddress], config.tokenId);
    console.log(NFTHistory);
    for (let index = 0; index < NFTHistory.length; index++) {
        if (NFTHistory[index].from == '0x0000000000000000000000000000000000000000') {
            // Mint event
            console.log(`Token number ${Web3.utils.hexToNumberString(NFTHistory[index].tokenId)} of type ${NFTHistory[index].category} minted by address ${NFTHistory[index].to} at transaction ${NFTHistory[index].hash}`)
        }
        else {
            // Transfer event
            console.log(`Token number ${Web3.utils.hexToNumberString(NFTHistory[index].tokenId)} of type ${NFTHistory[index].category} transferred from address ${NFTHistory[index].from} to address ${NFTHistory[index].to} at transaction ${NFTHistory[index].hash}`)
            // Look for associated sale
            let NFTSales = await getNFTSalesForAddress(NFTHistory[index].to, config.contractAddress, config.tokenId);
            for (let j = 0; j < NFTSales.nftSales.length; j++) {
                console.log(`Token number ${NFTSales.nftSales[j].tokenId} sold by seller address ${NFTSales.nftSales[j].sellerAddress} to buyer address ${NFTSales.nftSales[j].buyerAddress} at transaction ${NFTSales.nftSales[j].transactionHash} on NFT marketplace ${NFTSales.nftSales[j].marketplace}`)
            }
            console.log(NFTSales);
        }
    }
}

await main();
