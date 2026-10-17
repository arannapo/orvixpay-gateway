const mongoose = require('mongoose');
const { ethers } = require('ethers');
const fs = require('fs');
const path = require('path');

// Load environment variables safely
const envPath = path.resolve(__dirname, '../.env.local');
const envFile = fs.readFileSync(envPath, 'utf-8');
const env = {};
envFile.split(/\r?\n/).forEach(line => {
  const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
  if (match) {
    let value = (match[2] || '').trim();
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }
    env[match[1]] = value;
  }
});

const MULTICALL3_ADDRESS = '0xcA11bde05977b3631167028862bE2a173976CA11';
const MULTICALL3_ABI = [
  'function aggregate3(tuple(address target, bool allowFailure, bytes callData)[] calls) payable returns (tuple(bool success, bytes returnData)[] returnData)',
  'function getEthBalance(address addr) view returns (uint256 balance)'
];

const ERC20_INTERFACE = new ethers.Interface([
  'function balanceOf(address owner) view returns (uint256)'
]);
const MULTICALL3_INTERFACE = new ethers.Interface(MULTICALL3_ABI);

const NETWORKS = [
  {
    name: 'Binance Smart Chain (BSC)',
    chainId: 56,
    nativeSymbol: 'BNB',
    rpcs: [
      'https://bsc-rpc.publicnode.com',
      'https://binance.llamarpc.com',
      'https://1rpc.io/bnb',
      'https://bsc-dataseed.binance.org'
    ],
    tokens: [
      { symbol: 'USDT', address: '0x55d398326f99059ff775485246999027b3197955', decimals: 18 },
      { symbol: 'USDC', address: '0x8ac76a51cc950d9822d68b83fe1ad97b32cd580d', decimals: 18 },
      { symbol: 'BUSD', address: '0xe9e7cea3dedca5984780bafc599bd69add087d56', decimals: 18 },
      { symbol: 'FDUSD', address: '0xc5f0f7b66764f6ec8c8dff7ba683102295e16409', decimals: 18 },
      { symbol: 'DAI', address: '0x1af3f329e8be154074d8769d1ffa4ee058b1dbc3', decimals: 18 },
      { symbol: 'WBNB', address: '0xbb4cdb9cbd36b01bd1cbaebf2de08d9173bc095c', decimals: 18 },
      { symbol: 'ETH', address: '0x2170ed0880ac9a755fd29b2688956bd959f933f8', decimals: 18 },
      { symbol: 'BTCB', address: '0x7130d2a12b9bcbfae4f2634d864a1ee1ce3ead9c', decimals: 18 },
      { symbol: 'CAKE', address: '0x0e09fabb73bd3ade0a17ecc321fd13a19e81ce82', decimals: 18 },
    ]
  },
  {
    name: 'Ethereum Mainnet',
    chainId: 1,
    nativeSymbol: 'ETH',
    rpcs: [
      'https://eth.llamarpc.com',
      'https://ethereum-rpc.publicnode.com',
      'https://1rpc.io/eth',
      'https://cloudflare-eth.com'
    ],
    tokens: [
      { symbol: 'USDT', address: '0xdac17f958d2ee523a2206206994597c13d831ec7', decimals: 6 },
      { symbol: 'USDC', address: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48', decimals: 6 },
      { symbol: 'DAI', address: '0x6b175474e89094c44da98b954eedeac495271d0f', decimals: 18 },
      { symbol: 'WBTC', address: '0x2260fac5e5542a773aa44fbcfedf7c193bc2c599', decimals: 8 }
    ]
  },
  {
    name: 'Polygon (POS)',
    chainId: 137,
    nativeSymbol: 'POL',
    rpcs: [
      'https://polygon.llamarpc.com',
      'https://polygon-bor-rpc.publicnode.com',
      'https://1rpc.io/matic'
    ],
    tokens: [
      { symbol: 'USDT', address: '0xc2132d05d31c914a87c6611c10748aeb04b58e8f', decimals: 6 },
      { symbol: 'USDC', address: '0x3c499c542cef5e3811e1192ce70d8cc03d5c3359', decimals: 6 },
      { symbol: 'USDC.e', address: '0x2791bca1f2de4661ed88a30c99a7a9449aa84174', decimals: 6 },
      { symbol: 'DAI', address: '0x8f3cf7ad23cd3cadbd9735aff958023239c6a063', decimals: 18 }
    ]
  },
  {
    name: 'Arbitrum One',
    chainId: 42161,
    nativeSymbol: 'ETH',
    rpcs: [
      'https://arbitrum.llamarpc.com',
      'https://arbitrum-one-rpc.publicnode.com',
      'https://1rpc.io/arb'
    ],
    tokens: [
      { symbol: 'USDT', address: '0xfd086bc7cd5c481dcc9c85ebe478a1c0b69fcbb9', decimals: 6 },
      { symbol: 'USDC', address: '0xaf88d065e77c8cc2239327c5edb3a432268e5831', decimals: 6 },
      { symbol: 'USDC.e', address: '0xff970a61a04b1ca14834a43f5de4533ebddb5cc8', decimals: 6 },
      { symbol: 'ARB', address: '0x912ce59144191c1204e64559fe8253a0e49e6548', decimals: 18 }
    ]
  },
  {
    name: 'Base',
    chainId: 8453,
    nativeSymbol: 'ETH',
    rpcs: [
      'https://mainnet.base.org',
      'https://base.llamarpc.com',
      'https://base-rpc.publicnode.com'
    ],
    tokens: [
      { symbol: 'USDC', address: '0x833589fcd6edb6e08f4c7c32d4f71b54bda02913', decimals: 6 },
      { symbol: 'USDbC', address: '0xd9aaec86b65d86f6a7b5b1b0c42ffa531710b6ca', decimals: 6 }
    ]
  },
  {
    name: 'Optimism (OP Mainnet)',
    chainId: 10,
    nativeSymbol: 'ETH',
    rpcs: [
      'https://mainnet.optimism.io',
      'https://optimism.llamarpc.com',
      'https://optimism-rpc.publicnode.com'
    ],
    tokens: [
      { symbol: 'USDT', address: '0x94b008aa00579c1307b0ef2c499ad98a8ce58e58', decimals: 6 },
      { symbol: 'USDC', address: '0x0b2c639c533813f4aa9d7837caf62653d097ff85', decimals: 6 },
      { symbol: 'OP', address: '0x4200000000000000000000000000000000000042', decimals: 18 }
    ]
  },
  {
    name: 'Avalanche C-Chain',
    chainId: 43114,
    nativeSymbol: 'AVAX',
    rpcs: [
      'https://api.avax.network/ext/bc/C/rpc',
      'https://avalanche.public-rpc.com',
      'https://1rpc.io/avax/c'
    ],
    tokens: [
      { symbol: 'USDT', address: '0x9702230a8ea53601f5cd2dc00fdbc13d4df4a8c7', decimals: 6 },
      { symbol: 'USDC', address: '0xb97ef9ef8734c71904d8002f8b6bc66dd9c48a6e', decimals: 6 }
    ]
  }
];

const UserSchema = new mongoose.Schema({
  email: { type: String, required: true },
  businessName: { type: String },
  merchantWallet: { type: String },
  systemWalletAddress: { type: String }
}, { strict: false });

const InvoiceSchema = new mongoose.Schema({
  merchantId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  orderId: { type: String },
  customerName: { type: String },
  customerEmail: { type: String },
  description: { type: String },
  amount: { type: Number },
  currency: { type: String },
  usdtAmount: { type: Number },
  receivedAmount: { type: Number, default: 0 },
  walletAddress: { type: String },
  walletPrivateKey: { type: String },
  network: { type: String, default: 'BEP20' },
  coin: { type: String, default: 'USDT' },
  status: { type: String },
  webhookUrl: { type: String },
  webhookStatus: { type: String },
  overpaidDetails: { type: mongoose.Schema.Types.Mixed },
  expiresAt: { type: Date },
  createdAt: { type: Date },
  paidAt: { type: Date },
  transactionHash: { type: String },
  metadata: { type: mongoose.Schema.Types.Mixed },
}, { strict: false });

const User = mongoose.models.User || mongoose.model('User', UserSchema);
const Invoice = mongoose.models.Invoice || mongoose.model('Invoice', InvoiceSchema);

async function scanNetwork(network, addresses) {
  console.log(`\n----------------------------------------------------`);
  console.log(`📡 Scanning ${network.name}...`);
  console.log(`----------------------------------------------------`);

  let provider;
  for (const rpc of network.rpcs) {
    try {
      const p = new ethers.JsonRpcProvider(rpc, network.chainId, { staticNetwork: true });
      await p.getBlockNumber();
      provider = p;
      console.log(`  Connected via RPC: ${rpc}`);
      break;
    } catch (e) {
      // try next RPC
    }
  }

  if (!provider) {
    console.error(`  ❌ Failed to connect to any RPC for ${network.name}`);
    return [];
  }

  const multicallContract = new ethers.Contract(MULTICALL3_ADDRESS, MULTICALL3_ABI, provider);

  const calls = [];
  const callMeta = [];

  for (const addr of addresses) {
    // 1. Native balance
    calls.push({
      target: MULTICALL3_ADDRESS,
      allowFailure: true,
      callData: MULTICALL3_INTERFACE.encodeFunctionData('getEthBalance', [addr])
    });
    callMeta.push({ address: addr, symbol: network.nativeSymbol, decimals: 18, isNative: true });

    // 2. Token balances
    for (const t of network.tokens) {
      calls.push({
        target: t.address,
        allowFailure: true,
        callData: ERC20_INTERFACE.encodeFunctionData('balanceOf', [addr])
      });
      callMeta.push({ address: addr, symbol: t.symbol, decimals: t.decimals, isNative: false });
    }
  }

  const CHUNK_SIZE = 400;
  const rawResults = [];
  for (let i = 0; i < calls.length; i += CHUNK_SIZE) {
    const chunk = calls.slice(i, i + CHUNK_SIZE);
    try {
      const res = await multicallContract.aggregate3.staticCall(chunk);
      rawResults.push(...res);
    } catch (err) {
      console.error(`  Error querying chunk ${i}-${i + CHUNK_SIZE}: ${err.message}`);
      for (let j = 0; j < chunk.length; j++) {
        rawResults.push({ success: false, returnData: '0x' });
      }
    }
  }

  const positiveHoldings = [];
  for (let i = 0; i < rawResults.length; i++) {
    const res = rawResults[i];
    const meta = callMeta[i];
    if (res.success && res.returnData && res.returnData !== '0x') {
      try {
        let valWei;
        if (meta.isNative) {
          valWei = MULTICALL3_INTERFACE.decodeFunctionResult('getEthBalance', res.returnData)[0];
        } else {
          valWei = ERC20_INTERFACE.decodeFunctionResult('balanceOf', res.returnData)[0];
        }
        if (valWei > 0n) {
          const formatted = ethers.formatUnits(valWei, meta.decimals);
          positiveHoldings.push({
            address: meta.address,
            network: network.name,
            symbol: meta.symbol,
            rawBalance: valWei.toString(),
            balance: formatted,
            decimals: meta.decimals
          });
        }
      } catch (e) {
        // ignore decode errors
      }
    }
  }

  console.log(`  Found ${positiveHoldings.length} positive balances on ${network.name}.`);
  return positiveHoldings;
}

async function main() {
  console.log('Connecting to MongoDB...');
  await mongoose.connect(env.MONGODB_URI, { serverSelectionTimeoutMS: 10000 });
  console.log('✅ Connected to MongoDB successfully.');

  const invoices = await Invoice.find({}).populate('merchantId', 'businessName email merchantWallet').lean();
  console.log(`📊 Total Invoices in DB: ${invoices.length}`);

  const addressMap = new Map(); // lowercase addr -> array of invoices
  const invalidOrOtherAddrs = [];

  invoices.forEach(inv => {
    const rawAddr = (inv.walletAddress || '').trim();
    if (ethers.isAddress(rawAddr)) {
      const normalized = rawAddr.toLowerCase();
      if (!addressMap.has(normalized)) {
        addressMap.set(normalized, []);
      }
      addressMap.get(normalized).push(inv);
    } else if (rawAddr) {
      invalidOrOtherAddrs.push({ address: rawAddr, invoice: inv });
    }
  });

  const uniqueEVMAddresses = Array.from(addressMap.keys());
  console.log(`🔑 Unique Valid EVM Wallet Addresses: ${uniqueEVMAddresses.length}`);
  if (invalidOrOtherAddrs.length > 0) {
    console.log(`⚠️ Non-EVM or Malformed Addresses Found: ${invalidOrOtherAddrs.length}`);
  }

  // Scan across all defined networks
  const allPositiveHoldings = [];

  for (const net of NETWORKS) {
    const holdings = await scanNetwork(net, uniqueEVMAddresses);
    allPositiveHoldings.push(...holdings);
  }

  // Aggregate results per address and per invoice
  const addressHoldingsMap = {};
  allPositiveHoldings.forEach(h => {
    const a = h.address.toLowerCase();
    if (!addressHoldingsMap[a]) addressHoldingsMap[a] = [];
    addressHoldingsMap[a].push(h);
  });

  const matchedInvoicesWithFunds = [];
  invoices.forEach(inv => {
    const a = (inv.walletAddress || '').toLowerCase();
    const holdings = addressHoldingsMap[a];
    if (holdings && holdings.length > 0) {
      matchedInvoicesWithFunds.push({
        invoiceId: inv._id.toString(),
        orderId: inv.orderId,
        walletAddress: inv.walletAddress,
        status: inv.status,
        coin: inv.coin,
        network: inv.network,
        amount: inv.amount,
        usdtAmount: inv.usdtAmount,
        receivedAmount: inv.receivedAmount,
        merchant: inv.merchantId?.businessName || inv.merchantId?.email,
        merchantWallet: inv.merchantId?.merchantWallet,
        createdAt: inv.createdAt,
        holdings: holdings
      });
    }
  });

  console.log('\n======================================================');
  console.log(`🏁 MULTI-CHAIN SCAN SUMMARY`);
  console.log('======================================================');
  console.log(`Total Invoices Checked: ${invoices.length}`);
  console.log(`Total Unique EVM Addresses: ${uniqueEVMAddresses.length}`);
  console.log(`Blockchains Scanned: ${NETWORKS.map(n => n.name).join(', ')}`);
  console.log(`Positive Balance Holdings Detected: ${allPositiveHoldings.length}`);
  console.log(`Invoices with Balance > 0: ${matchedInvoicesWithFunds.length}`);

  if (matchedInvoicesWithFunds.length > 0) {
    console.log('\n🚨🚨 WALLETS / INVOICES WITH POSITIVE BALANCE (> 0): 🚨🚨');
    matchedInvoicesWithFunds.forEach(item => {
      console.log(`\n• Order ID: ${item.orderId} (Invoice: ${item.invoiceId})`);
      console.log(`  Status: ${item.status} | Coin/Network: ${item.coin} (${item.network})`);
      console.log(`  Wallet: ${item.walletAddress}`);
      console.log(`  Merchant: ${item.merchant} -> Payout: ${item.merchantWallet}`);
      console.log(`  💰 Holdings:`);
      item.holdings.forEach(h => {
        console.log(`     - [${h.network}] ${h.balance} ${h.symbol}`);
      });
    });
  } else {
    console.log('\n✅ NO POSITIVE BALANCE FOUND (> 0) ON ANY OF THE 7 SCANNED BLOCKCHAINS AND ALL MONITORED TOKENS.');
  }

  // Save report
  const summaryReport = {
    scanTimestamp: new Date().toISOString(),
    totalInvoices: invoices.length,
    uniqueAddressesChecked: uniqueEVMAddresses.length,
    scannedNetworks: NETWORKS.map(n => n.name),
    positiveBalanceCount: allPositiveHoldings.length,
    invoicesWithFunds: matchedInvoicesWithFunds,
    allInvoicesSummary: invoices.map(inv => ({
      id: inv._id.toString(),
      orderId: inv.orderId,
      status: inv.status,
      coin: inv.coin,
      network: inv.network,
      amount: inv.amount,
      walletAddress: inv.walletAddress,
      createdAt: inv.createdAt,
      paidAt: inv.paidAt,
      hasOnChainFunds: (addressHoldingsMap[(inv.walletAddress || '').toLowerCase()] || []).length > 0
    }))
  };

  const outPath = path.resolve(__dirname, 'multi_chain_balance_report.json');
  fs.writeFileSync(outPath, JSON.stringify(summaryReport, null, 2));
  console.log(`\n💾 Saved detailed multi-chain report to: ${outPath}`);

  await mongoose.disconnect();
}

main().catch(err => {
  console.error('Fatal Error:', err);
  process.exit(1);
});
