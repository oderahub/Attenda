import { expect } from "chai";
import { ethers } from "hardhat";
import { ContractFactory } from "ethers";
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";

describe("AttendaToken", function () {
  let AttendaToken: ContractFactory;
  let attendaToken: any;
  let owner: HardhatEthersSigner;
  let user1: HardhatEthersSigner;
  let user2: HardhatEthersSigner;

  const INITIAL_SUPPLY = ethers.parseEther("1000000"); // 1 million tokens
  const TOKEN_NAME = "Attenda Token";
  const TOKEN_SYMBOL = "ATT";

  beforeEach(async function () {
    // Get signers
    [owner, user1, user2] = await ethers.getSigners();

    // Deploy contract
    AttendaToken = await ethers.getContractFactory("AttendaToken");
    attendaToken = await AttendaToken.deploy();
    await attendaToken.waitForDeployment();
  });

  describe("Deployment", function () {
    it("Should set the correct name and symbol", async function () {
      expect(await attendaToken.name()).to.equal(TOKEN_NAME);
      expect(await attendaToken.symbol()).to.equal(TOKEN_SYMBOL);
    });

    it("Should set the correct initial supply", async function () {
      expect(await attendaToken.totalSupply()).to.equal(INITIAL_SUPPLY);
    });

    it("Should assign the initial supply to the owner", async function () {
      expect(await attendaToken.balanceOf(owner.address)).to.equal(INITIAL_SUPPLY);
    });

    it("Should set the correct owner", async function () {
      expect(await attendaToken.owner()).to.equal(owner.address);
    });

    it("Should have 18 decimals", async function () {
      expect(await attendaToken.decimals()).to.equal(18);
    });
  });

  describe("Token Transfer", function () {
    const transferAmount = ethers.parseEther("1000");

    it("Should transfer tokens between accounts", async function () {
      // Transfer from owner to user1
      await attendaToken.connect(owner).transfer(user1.address, transferAmount);

      expect(await attendaToken.balanceOf(user1.address)).to.equal(transferAmount);
      expect(await attendaToken.balanceOf(owner.address)).to.equal(INITIAL_SUPPLY - transferAmount);
    });

    it("Should emit Transfer event on successful transfer", async function () {
      await expect(attendaToken.connect(owner).transfer(user1.address, transferAmount))
        .to.emit(attendaToken, "Transfer")
        .withArgs(owner.address, user1.address, transferAmount);
    });

    it("Should update balances correctly after multiple transfers", async function () {
      const amount1 = ethers.parseEther("500");
      const amount2 = ethers.parseEther("300");

      // Transfer to user1
      await attendaToken.connect(owner).transfer(user1.address, amount1);

      // Transfer to user2
      await attendaToken.connect(owner).transfer(user2.address, amount2);

      expect(await attendaToken.balanceOf(user1.address)).to.equal(amount1);
      expect(await attendaToken.balanceOf(user2.address)).to.equal(amount2);
      expect(await attendaToken.balanceOf(owner.address)).to.equal(INITIAL_SUPPLY - amount1 - amount2);
    });

    it("Should allow users to transfer tokens they own", async function () {
      // First transfer tokens to user1
      await attendaToken.connect(owner).transfer(user1.address, transferAmount);

      // Then user1 transfers to user2
      const user1TransferAmount = ethers.parseEther("100");
      await attendaToken.connect(user1).transfer(user2.address, user1TransferAmount);

      expect(await attendaToken.balanceOf(user2.address)).to.equal(user1TransferAmount);
      expect(await attendaToken.balanceOf(user1.address)).to.equal(transferAmount - user1TransferAmount);
    });
  });

  describe("Approval and Allowance", function () {
    const approveAmount = ethers.parseEther("1000");
    const transferAmount = ethers.parseEther("500");

    it("Should approve spending allowance", async function () {
      await attendaToken.connect(owner).approve(user1.address, approveAmount);

      expect(await attendaToken.allowance(owner.address, user1.address)).to.equal(approveAmount);
    });

    it("Should emit Approval event on successful approval", async function () {
      await expect(attendaToken.connect(owner).approve(user1.address, approveAmount))
        .to.emit(attendaToken, "Approval")
        .withArgs(owner.address, user1.address, approveAmount);
    });

    it("Should allow transferFrom with sufficient allowance", async function () {
      // Owner approves user1 to spend tokens
      await attendaToken.connect(owner).approve(user1.address, approveAmount);

      // User1 transfers tokens from owner to user2
      await attendaToken.connect(user1).transferFrom(owner.address, user2.address, transferAmount);

      expect(await attendaToken.balanceOf(user2.address)).to.equal(transferAmount);
      expect(await attendaToken.balanceOf(owner.address)).to.equal(INITIAL_SUPPLY - transferAmount);
      expect(await attendaToken.allowance(owner.address, user1.address)).to.equal(approveAmount - transferAmount);
    });

    it("Should emit Transfer event on successful transferFrom", async function () {
      await attendaToken.connect(owner).approve(user1.address, approveAmount);

      await expect(attendaToken.connect(user1).transferFrom(owner.address, user2.address, transferAmount))
        .to.emit(attendaToken, "Transfer")
        .withArgs(owner.address, user2.address, transferAmount);
    });

    it("Should update allowance correctly after transferFrom", async function () {
      await attendaToken.connect(owner).approve(user1.address, approveAmount);

      await attendaToken.connect(user1).transferFrom(owner.address, user2.address, transferAmount);

      expect(await attendaToken.allowance(owner.address, user1.address)).to.equal(approveAmount - transferAmount);
    });

    it("Should allow multiple approvals to the same spender", async function () {
      const firstAmount = ethers.parseEther("100");
      const secondAmount = ethers.parseEther("200");

      await attendaToken.connect(owner).approve(user1.address, firstAmount);
      await attendaToken.connect(owner).approve(user1.address, secondAmount);

      expect(await attendaToken.allowance(owner.address, user1.address)).to.equal(secondAmount);
    });
  });

  describe("Revert Conditions", function () {
    it("Should revert transfer when balance is insufficient", async function () {
      const excessiveAmount = INITIAL_SUPPLY + ethers.parseEther("1");

      await expect(attendaToken.connect(user1).transfer(user2.address, excessiveAmount)).to.be.revertedWith(
        "ERC20: transfer amount exceeds balance",
      );
    });

    it("Should revert transferFrom when allowance is insufficient", async function () {
      const approveAmount = ethers.parseEther("100");
      const transferAmount = ethers.parseEther("200");

      await attendaToken.connect(owner).approve(user1.address, approveAmount);

      await expect(
        attendaToken.connect(user1).transferFrom(owner.address, user2.address, transferAmount),
      ).to.be.revertedWith("ERC20: insufficient allowance");
    });

    it("Should revert transferFrom when balance is insufficient", async function () {
      const approveAmount = ethers.parseEther("1000");
      const transferAmount = INITIAL_SUPPLY + ethers.parseEther("1");

      await attendaToken.connect(owner).approve(user1.address, approveAmount);

      await expect(
        attendaToken.connect(user1).transferFrom(owner.address, user2.address, transferAmount),
      ).to.be.revertedWith("ERC20: insufficient allowance");
    });

    it("Should revert transfer to zero address", async function () {
      const transferAmount = ethers.parseEther("100");

      await expect(attendaToken.connect(owner).transfer(ethers.ZeroAddress, transferAmount)).to.be.revertedWith(
        "ERC20: transfer to the zero address",
      );
    });

    it("Should revert transferFrom to zero address", async function () {
      const approveAmount = ethers.parseEther("100");
      const transferAmount = ethers.parseEther("50");

      await attendaToken.connect(owner).approve(user1.address, approveAmount);

      await expect(
        attendaToken.connect(user1).transferFrom(owner.address, ethers.ZeroAddress, transferAmount),
      ).to.be.revertedWith("ERC20: transfer to the zero address");
    });
  });

  describe("Minting and Burning", function () {
    const mintAmount = ethers.parseEther("1000");
    const burnAmount = ethers.parseEther("500");

    it("Should allow owner to mint new tokens", async function () {
      const initialTotalSupply = await attendaToken.totalSupply();

      await attendaToken.connect(owner).mint(user1.address, mintAmount);

      expect(await attendaToken.totalSupply()).to.equal(initialTotalSupply + mintAmount);
      expect(await attendaToken.balanceOf(user1.address)).to.equal(mintAmount);
    });

    it("Should revert minting when called by non-owner", async function () {
      await expect(attendaToken.connect(user1).mint(user2.address, mintAmount)).to.be.revertedWith(
        "Ownable: caller is not the owner",
      );
    });

    it("Should allow users to burn their own tokens", async function () {
      // First transfer tokens to user1
      await attendaToken.connect(owner).transfer(user1.address, burnAmount);

      const initialBalance = await attendaToken.balanceOf(user1.address);
      const initialTotalSupply = await attendaToken.totalSupply();

      await attendaToken.connect(user1).burn(burnAmount);

      expect(await attendaToken.balanceOf(user1.address)).to.equal(initialBalance - burnAmount);
      expect(await attendaToken.totalSupply()).to.equal(initialTotalSupply - burnAmount);
    });

    it("Should allow owner to burn tokens from any address", async function () {
      // First transfer tokens to user1
      await attendaToken.connect(owner).transfer(user1.address, burnAmount);

      const initialBalance = await attendaToken.balanceOf(user1.address);
      const initialTotalSupply = await attendaToken.totalSupply();

      await attendaToken.connect(owner).burnFrom(user1.address, burnAmount);

      expect(await attendaToken.balanceOf(user1.address)).to.equal(initialBalance - burnAmount);
      expect(await attendaToken.totalSupply()).to.equal(initialTotalSupply - burnAmount);
    });

    it("Should revert burnFrom when called by non-owner", async function () {
      await attendaToken.connect(owner).transfer(user1.address, burnAmount);

      await expect(attendaToken.connect(user2).burnFrom(user1.address, burnAmount)).to.be.revertedWith(
        "Ownable: caller is not the owner",
      );
    });

    it("Should revert burning when balance is insufficient", async function () {
      const excessiveAmount = ethers.parseEther("1000");

      await expect(attendaToken.connect(user1).burn(excessiveAmount)).to.be.revertedWith(
        "ERC20: burn amount exceeds balance",
      );
    });
  });

  describe("Edge Cases", function () {
    it("Should handle zero amount transfers", async function () {
      const initialBalance = await attendaToken.balanceOf(owner.address);

      await attendaToken.connect(owner).transfer(user1.address, 0);

      expect(await attendaToken.balanceOf(owner.address)).to.equal(initialBalance);
      expect(await attendaToken.balanceOf(user1.address)).to.equal(0);
    });

    it("Should handle zero amount approvals", async function () {
      await attendaToken.connect(owner).approve(user1.address, 0);

      expect(await attendaToken.allowance(owner.address, user1.address)).to.equal(0);
    });

    it("Should handle zero amount minting", async function () {
      const initialTotalSupply = await attendaToken.totalSupply();

      await attendaToken.connect(owner).mint(user1.address, 0);

      expect(await attendaToken.totalSupply()).to.equal(initialTotalSupply);
      expect(await attendaToken.balanceOf(user1.address)).to.equal(0);
    });

    it("Should handle zero amount burning", async function () {
      const initialBalance = await attendaToken.balanceOf(owner.address);
      const initialTotalSupply = await attendaToken.totalSupply();

      await attendaToken.connect(owner).burn(0);

      expect(await attendaToken.balanceOf(owner.address)).to.equal(initialBalance);
      expect(await attendaToken.totalSupply()).to.equal(initialTotalSupply);
    });
  });
});
