/**
 * This script checks the floor price of an NFT and triggers an alert
 * if the floor price has moved by X%
 */

import { setTimeout } from "timers/promises";
import { getFloorPrice } from './alchemy-sdk-script.mjs';
import { sendMail } from './mailer.js';
import { readDB, writeDB } from './db.js';
import { config } from "../config.cjs";

async function fetchLatestFloorPrice() {
    let previousFloorPrice;
    let previousOSPrice = 0;
    let previousLRPrice = 0;
    let payloadType = "floorPrice";

    console.log(`In fetchLatestFloorPrice`);
    try {
        const floorPrice = await getFloorPrice(config.contractAddress);
        let currentOSPrice = floorPrice.openSea.floorPrice;
        let currentLRPrice = floorPrice.looksRare.floorPrice;
        console.log(`currentOSPrice: ${currentOSPrice}`);
        console.log(`currentLRPrice: ${currentLRPrice}`);
        let historicalFloorPrice = await readDB(payloadType);
        let len = historicalFloorPrice.floorPrice.length;
        if (len > 0) {
            previousFloorPrice = historicalFloorPrice.floorPrice[len - 1];
            previousOSPrice = previousFloorPrice.openSea.floorPrice;
            previousLRPrice = previousFloorPrice.looksRare.floorPrice;
            console.log(`previousOSPrice: ${previousOSPrice}`);
            console.log(`previousLRPrice: ${previousLRPrice}`);
        }

        // Check if the price has changed by more than the configured percentage
        let priceDifferenceOS = 100 - (currentOSPrice / previousOSPrice * 100);
        let priceDifferenceLR = 100 - (currentLRPrice / previousLRPrice * 100);
        console.log(`priceDifferenceOS: ${priceDifferenceOS}`);
        console.log(`priceDifferenceLR: ${priceDifferenceLR}`);
        if (priceDifferenceOS >= config.priceDifference || priceDifferenceLR >= config.priceDifference) {
            // Raise alert on price difference
            console.log(`raising alert that price has changed by: opensea - ${priceDifferenceOS}%, looksrare - ${priceDifferenceLR}%`);
            sendMail(
                subject = "Price change on " + config.contractAddress, 
                text = "priceDifferenceOS: " + priceDifferenceOS + "priceDifferenceLR: " + priceDifferenceLR
            );
        }
        // Add latest floor price
        if (!(currentOSPrice == previousOSPrice && currentLRPrice == previousLRPrice))
            writeDB(floorPrice, payloadType);
    } 
    catch (error) {
        console.log(`fetchLatestFloorPrice threw error ${error}`);
    }
}

async function timeoutLoop() {
    while (true) {
        fetchLatestFloorPrice();
        await setTimeout(config.timeout);
    }
}

timeoutLoop();
