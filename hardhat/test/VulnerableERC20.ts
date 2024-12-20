import { expect } from 'chai';

describe('Token contract', function () {
  let Token;
  let token;
  let owner;
  let addr1;
  let addr2;

  beforeEach(async function () {
    Token = await ethers.getContractFactory('VulnerableERC20');
    [owner, addr1, addr2] = await ethers.getSigners();
    token = await Token.deploy();
    await token.waitForDeployment();
  });



  it('should not allow transfers', async function () {

    await expect(token.connect(owner).mint(addr1.address, 100)).to.be.fulfilled;
    await expect(token.connect(owner).transfer(addr2.address, 100)).to.be.revertedWith('Transfers are disabled');
  });

  it('should not mint to the zero address', async function () {
    await expect(token.connect(owner).mint('0x0000000000000000000000000000000000000000', 100)).to.be.revertedWith('Mint to the zero address');
  });
});