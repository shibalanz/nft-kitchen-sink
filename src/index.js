import { getFloorPrice, getContractMetadata, summarizeNFTAttributes, getCountWithNFTAttribute, getOwnersForContract } from './modules/alchemy-sdk-script.mjs';

const TNLBoxersContract = "0x6bCa6de2dbDc4E0d41f7273011785ea16Ba47182";

// Call various NFT APIs and display the responses
const floorPrice = await getFloorPrice(TNLBoxersContract);
const contractMetadata = await getContractMetadata(TNLBoxersContract);
const attributes = await summarizeNFTAttributes(TNLBoxersContract);
const gloves = await getCountWithNFTAttribute(TNLBoxersContract, "summary.Gloves.Red");
const eyecolor = await getCountWithNFTAttribute(TNLBoxersContract, "summary.Eye Color.Gemstone Green");
const owners = await getOwnersForContract(TNLBoxersContract);

// Print useful information
console.log(`=== Useful Information ===`);
console.log(`collection URL on opensea: ${floorPrice.openSea.collectionUrl}`);
console.log(`collection URL on looks rare: ${floorPrice.looksRare.collectionUrl}`);
console.log(`floor price on opensea: ${floorPrice.openSea.floorPrice}`);
console.log(`floor price on looks rare: ${floorPrice.looksRare.floorPrice}`);
console.log(`number of owners: ${owners['owners'].length}`);
console.log(`total number of NFTs in collection: ${contractMetadata['totalSupply']}`);
console.log(`percentage of unique owners: ${(owners['owners'].length / contractMetadata['totalSupply'] * 100).toFixed(2)}%`);
console.log(`summarizeNFTAttributes completed ${attributes}`);
