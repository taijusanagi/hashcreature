import { ethers } from "hardhat";
import * as chai from "chai";
import { solidity } from "ethereum-waffle";

import * as ipfsHash from "ipfs-only-hash";

// const createClient = require("ipfs-http-client");

//this endpoint is too slow
// export const ipfs = createClient({
//   host: "ipfs.infura.io",
//   port: 5001,
//   protocol: "https",
// });

chai.use(solidity);
const { expect } = chai;

describe("HashCreature_v1", function () {
  let hashCreature;
  const contractName = "HashCreature";
  const contractSymbol = "HC";
  const description =
    "HashCreatures are generate by hash in the minting transaction. Image svg data and token metadata is generated in solidity itself, just onchain. Image will be deteriorated when you transfer creature.";
  const supplyLimit = 5;
  let signer, creator;

  this.beforeEach("initialization.", async function () {
    [signer, creator] = await ethers.getSigners();
    const HashCreature = await ethers.getContractFactory("HashCreature_v1");
    hashCreature = await HashCreature.deploy(
      contractName,
      contractSymbol,
      supplyLimit,
      creator.address
    );
  });

  it("case: deploy is ok / check: name, symbol, supplyLimit, creator", async function () {
    expect(await hashCreature.name()).to.equal(contractName);
    expect(await hashCreature.symbol()).to.equal(contractSymbol);
    expect(await hashCreature.supplyLimit()).to.equal(supplyLimit);
    expect(await hashCreature.creator()).to.equal(creator.address);
  });

  it("case: mint is ok / check: tokenURI", async function () {
    const tokenId = "1";
    const baseIpfsUrl = "ipfs://";
    const value = await hashCreature.getPriceToMint(0);
    await hashCreature.mint({ value: value });
    const hash = await hashCreature.hashMemory(tokenId);
    const image_data = await hashCreature.getImageData(hash, 0);

    const metadata = JSON.stringify({
      image_data: image_data.split("\\").join(""),
      name: `${contractName}#${tokenId}`,
      description,
    });
    expect(await hashCreature.getMetaData(tokenId)).to.equal(metadata);
    const metadataBuffer = Buffer.from(metadata);
    const cid = await ipfsHash.of(metadataBuffer);
    expect(await hashCreature.getCidFromString(metadata)).to.equal(cid);
    expect(await hashCreature.tokenURI(tokenId)).to.equal(
      `${baseIpfsUrl}${cid}`
    );
  });

  it("case: mint is ok / check: tokenURI", async function () {
    const tokenId = "1";
    const value = await hashCreature.getPriceToMint(0);
    await hashCreature.mint({ value: value });
    const hash = await hashCreature.hashMemory(tokenId);
    const image_data1 = await hashCreature.getImageData(hash, 7);
    console.log(image_data1);
  });

  it("case: check price is ok", async function () {
    const mintPrices = [
      "1000000000000000",
      "2000000000000000",
      "3000000000000000",
    ];
    const burnPrices = ["0", "900000000000000", "1800000000000000"];
    for (let i = 0; i < mintPrices.length; i++) {
      expect(await hashCreature.getPriceToMint(i)).to.equal(mintPrices[i]);
      expect(await hashCreature.getPriceToBurn(i)).to.equal(burnPrices[i]);
    }
  });

  it("case: check max supply is ok", async function () {
    for (let i = 0; i <= supplyLimit; i++) {
      const priceToMint = await hashCreature.getPriceToMint(i);
      if (i < supplyLimit) {
        await hashCreature.mint({ value: priceToMint });
        expect(await hashCreature.ownerOf(i + 1)).to.equal(signer.address);
      } else {
        await expect(
          hashCreature.mint({ value: priceToMint })
        ).to.be.revertedWith("total supply must be less than max supply");
      }
    }

    const balance = await hashCreature.balanceOf(signer.address);
    expect(balance).to.equal(supplyLimit);

    for (let i = supplyLimit; i >= 0; i--) {
      if (i != 0) {
        await hashCreature.burn(i);
      } else {
        await expect(hashCreature.burn(i)).to.be.revertedWith(
          "ERC721: owner query for nonexistent token"
        );
      }
    }
  });
});
