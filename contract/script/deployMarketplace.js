const { ethers } = require("hardhat");
const { run } = require("hardhat");
const {
  VerifywithArgs, Verify } = require("../verifyfunc");

async function main() {
  const [deployer] = await ethers.getSigners();

  const Contract = await ethers.getContractFactory("NFTMarketplace");

  const contract = await Contract.deploy();

  await contract.deployed();

  console.log("ContactVault Contract address:", contract.address);
  //  await run("verify:verify",  { address: contract.address });
  // console.log("All Contract verified successfully")
  await Verify(contract.address);


}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });