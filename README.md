# Attenda - Decentralized Attention Economy Platform

<div align="center">
  <h3>Rewarding Genuine Attention with Blockchain Technology</h3>
  <p>Built on Celo Blockchain</p>
</div>

<br />

## Overview

Attenda is a revolutionary decentralized application (dApp) that creates a transparent attention economy marketplace. It rewards users with cryptocurrency (ATT tokens) for genuinely paying attention to advertising content, verified through blockchain technology and IPFS storage.

### How It Works

- **Advertisers** create campaigns and deposit ATT token rewards
- **Users** view content while their attention metrics are tracked in real-time
- **Validators** verify proof of attention to prevent fraud
- **Smart Contracts** handle transparent reward distribution

⚙️ Built using NextJS, RainbowKit, Hardhat, Wagmi, Viem, and TypeScript.

### Key Features

- ✅ **Real-Time Attention Tracking**: Track user engagement with time spent, scroll depth, interactions, and focus time
- 🎯 **Campaign Management**: Create, manage, and monitor advertising campaigns on-chain
- 🪙 **ATT Token Rewards**: ERC20 token system with dynamic rewards based on attention quality
- 🔐 **Proof of Attention**: Multi-validator system with IPFS-stored proofs
- 📊 **User Dashboard**: View campaigns, track earnings, and monitor attention scores
- 💰 **Token Faucet**: Test token distribution for development
- 🔥 **Burner Wallet**: Quick testing with local wallet
- 🌐 **IPFS Storage**: Decentralized storage for content and attention proofs

## Requirements

Before you begin, you need to install the following tools:

- [Node (>= v18.17)](https://nodejs.org/en/download/)
- Yarn ([v1](https://classic.yarnpkg.com/en/docs/install/) or [v2+](https://yarnpkg.com/getting-started/install))
- [Git](https://git-scm.com/downloads)

## Quickstart

To get started with Attenda, follow the steps below:

1. Clone this repo & install dependencies

```bash
git clone https://github.com/yourusername/attenda.git
cd Attenda
yarn install
```

2. Run a local network in the first terminal:

```bash
yarn chain
```

This command starts a local Ethereum network using Hardhat. The network runs on your local machine and can be used for testing and development. You can customize the network configuration in `packages/hardhat/hardhat.config.ts`.

3. On a second terminal, deploy the contracts:

```bash
yarn deploy
```

This command deploys the Attenda smart contracts to the local network:
- **AttendaToken.sol** - ERC20 reward token
- **CampaignManager.sol** - Campaign lifecycle management
- **ProofOfAttention.sol** - Attention verification system

The contracts are located in `packages/hardhat/contracts`. The deploy scripts are in `packages/hardhat/deploy`.

4. On the same terminal, start your NextJS app:

```bash
yarn start
```

Visit your app on: `http://localhost:3000`

You can interact with your smart contracts using the `Debug Contracts` page. You can tweak the app config in `packages/nextjs/scaffold.config.ts`.

Run smart contract tests with:
```bash
yarn hardhat:test
```

## Project Structure

```
Attenda/
├── packages/
│   ├── hardhat/              # Smart contract development
│   │   ├── contracts/        # Solidity contracts
│   │   ├── deploy/          # Deployment scripts
│   │   ├── scripts/         # Utility scripts
│   │   └── test/            # Contract tests
│   │
│   └── nextjs/              # Frontend application
│       ├── app/             # Next.js App Router
│       │   ├── attenda/     # Main dApp pages
│       │   │   ├── create/  # Campaign creation
│       │   │   ├── campaign/[id]/ # Campaign viewer
│       │   │   └── profile/ # User profile
│       │   └── blockexplorer/ # Blockchain explorer
│       ├── components/      # React components
│       ├── hooks/          # Custom React hooks
│       ├── lib/            # Utilities and services
│       └── services/       # API services
```

## Deploy to Celo Sepolia Testnet

To deploy contracts to Celo Sepolia testnet, follow these steps:

### 1. Get Celo Sepolia Testnet Tokens

Get free CELO testnet tokens from the [Celo Faucet](https://faucet.celo.org/alfajores).

### 2. Configure Environment Variables

Inside the `packages/hardhat` directory, copy `.env.example` to `.env`:

```bash
cd packages/hardhat && cp .env.example .env
```

### 3. Set Your Private Key

Edit your `.env` file and add your deployer private key:

```bash
DEPLOYER_PRIVATE_KEY="your_private_key_with_celo_sepolia_tokens"
```

⚠️ **Security Warning**: Never commit your `.env` file or share your private key. Make sure the address associated with this private key has enough Celo Sepolia testnet tokens.

### 4. Deploy to Celo Sepolia

From the root directory, run:

```bash
yarn deploy --network celoTestnet
```

This will deploy all smart contracts to Celo Sepolia testnet. If successful, you'll see the deployment transaction hashes and contract addresses.

### 5. Verify Contracts (Optional)

To verify your contracts on Celo Explorer:

```bash
yarn verify --network celoTestnet
```

## Celo Network Configuration

Attenda is configured to work with Celo networks:

- **Celo Mainnet** - Production deployment
- **Celo Alfajores (Testnet)** - Testing and development
- **Celo Baklava (Testnet)** - Staging environment

Network configuration can be found in `packages/hardhat/hardhat.config.ts`.

### Celo Sepolia Testnet Details

- **Chain ID**: 44787
- **RPC URL**: https://alfajores-forno.celo-testnet.org
- **Block Explorer**: https://alfajores.celoscan.io
- **Faucet**: https://faucet.celo.org/alfajores

## Smart Contracts

### AttendaToken.sol
ERC20 token used for rewards in the attention economy.
- Initial supply: 1,000,000 ATT
- Mintable by owner for campaign rewards
- Test minting available (max 1000 ATT per wallet)
- Burnable for token economics

### CampaignManager.sol
Manages the complete lifecycle of advertising campaigns.
- Campaign creation with token escrow
- User proof submission
- Advertiser verification
- Automatic reward distribution (95% to users, 5% platform fee)
- Campaign completion and refunds

### ProofOfAttention.sol
Multi-validator system for verifying genuine user attention.
- IPFS-based proof storage
- Configurable validation criteria
- Dynamic rewards based on engagement quality
- Fraud prevention mechanisms

## Development

### Running Tests

```bash
# Run all tests
yarn hardhat:test

# Run specific test file
yarn hardhat:test test/AttendaToken.ts

# Run with gas reporting
REPORT_GAS=true yarn hardhat:test
```

### Local Development

1. Start local blockchain: `yarn chain`
2. Deploy contracts: `yarn deploy`
3. Start frontend: `yarn start`
4. Open http://localhost:3000

### Code Formatting

```bash
# Format code
yarn format

# Lint code
yarn lint
```

## Features

### For Advertisers
- Create campaigns with custom rewards
- Upload content to IPFS
- Set participant limits and duration
- Verify user attention proofs
- Distribute rewards transparently
- Get unused tokens refunded

### For Users
- Browse available campaigns
- Earn ATT tokens for genuine attention
- Track attention metrics in real-time
- View earnings and statistics
- Claim rewards automatically
- Build attention score reputation

### Attention Tracking Metrics
- **Time Spent**: Total duration viewing content
- **Scroll Depth**: Percentage of content scrolled
- **Interactions**: Mouse movements, clicks, keyboard input
- **Focus Time**: Time with content in active focus
- **Attention Score**: 0-100 score based on engagement quality

## Technology Stack

- **Blockchain**: Celo (EVM-compatible)
- **Smart Contracts**: Solidity 0.8.17 + OpenZeppelin
- **Development**: Hardhat, TypeChain, Ethers.js v6
- **Frontend**: Next.js 15, React 19, TypeScript 5
- **Styling**: Tailwind CSS 3.4, DaisyUI 5.0
- **Web3**: Wagmi v2, Viem v2, RainbowKit v2
- **State**: Zustand 5.0, TanStack Query v5
- **Storage**: IPFS (Pinata)
- **UI Components**: Radix UI, Shadcn/ui
- **Icons**: Lucide React
- **Charts**: Recharts

## Contributing

We welcome contributions to Attenda! Please follow these steps:

1. Fork the repository
2. Create a new branch for your feature
3. Make your changes
4. Write or update tests as needed
5. Submit a pull request

## Security

- All smart contracts use OpenZeppelin's audited libraries
- ReentrancyGuard on all external calls
- Access control with Ownable pattern
- Input validation on all functions
- Comprehensive test coverage

## License

This project is licensed under the MIT License.

## Support

For questions and support:
- Open an issue on GitHub
- Check existing documentation
- Review smart contract comments

## Roadmap

- [ ] Mainnet deployment on Celo
- [ ] Mobile application
- [ ] Advanced analytics dashboard
- [ ] Multiple token support
- [ ] Governance system
- [ ] Staking mechanisms
- [ ] Cross-chain integration

---

Built with ❤️ for the decentralized web and deployed on Celo blockchain.
