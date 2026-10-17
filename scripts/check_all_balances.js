const mongoose = require('mongoose');
const { ethers } = require('ethers');
const fs = require('fs');
const path = require('path');

// Load environment variables from .env.local
const envFile = fs.readFileSync(path.resolve(__dirname, '../.env.local'), 'utf-8');
const env = {};
envFile.split('\n').forEach(line => {
  const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
  if (match) {
    let value = match[2] || '';
    if (value.startsWith('"') && value.endsWith('"')) value = value.slice(1, -1);
    else if (value.startsWith("'") && value.endsWith("'")) value = value.slice(1, -1);
    env[match[1]] = value;
  }
});

const TOKENS = [
  { symbol: 'USDT', address: '0x55d398326f99059ff775485246999027b3197955', decimals: 18 },
  { symbol: 'USDC', address: '0x8ac76a51cc950d9822d68b83fe1ad97b32cd580d', decimals: 18 },
  { symbol: 'BUSD', address: '0xe9e7cea3dedca5984780bafc599bd69add087d56', decimals: 18 },
  { symbol: 'FDUSD', address: '0xc5f0f7b66764f6ec8c8dff7ba683102295e16409', decimals: 18 },
  { symbol: 'DAI', address: '0x1af3f329e8be154074d8769d1ffa4ee058b1dbc3', decimals: 18 },
  { symbol: 'WBNB', address: '0xbb4cdb9cbd36b01bd1cbaebf2de08d9173bc095c', decimals: 18 },
  { symbol: 'ETH', address: '0x2170ed0880ac9a755fd29b2688956bd959f933f8', decimals: 18 },
  { symbol: 'BTCB', address: '0x7130d2a12b9bcbfae4f2634d864a1ee1ce3ead9c', decimals: 18 },
  { symbol: 'CAKE', address: '0x0e09fabb73bd3ade0a17ecc321fd13a19e81ce82', decimals: 18 },
];

const minABI = [
  'function balanceOf(address owner) view returns (uint256)',
  'function decimals() view returns (uint8)',
  'function symbol() view returns (string)'
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

const RPC_URLS = [
  'https://bsc-rpc.publicnode.com',
  'https://binance.llamarpc.com',
  'https://1rpc.io/bnb',
  'https://bsc-dataseed1.binance.org'
];

async function getWorkingProvider() {
  for (const url of RPC_URLS) {
    try {
      const p = new ethers.JsonRpcProvider(url, undefined, { staticNetwork: true });
      const block = await Promise.race([
        p.getBlockNumber(),
        new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), 4000))
      ]);
      console.log(`Connected to BSC RPC: ${url} (Block #${block})`);
      return p;
    } catch (e) {
      console.warn(`RPC ${url} failed: ${e.message}, trying next...`);
    }
  }
  throw new Error('All RPCs failed');
}

async function main() {
  console.log('Connecting to MongoDB...');
  await mongoose.connect(env.MONGODB_URI, { serverSelectionTimeoutMS: 5000 });
  console.log('Connected to MongoDB successfully.');

  const invoices = await Invoice.find({}).populate('merchantId', 'businessName email merchantWallet systemWalletAddress').lean();
  console.log(`Found ${invoices.length} total invoices in database.`);

  const provider = await getWorkingProvider();
  const tokenContracts = TOKENS.map(t => ({
    ...t,
    contract: new ethers.Contract(t.address, minABI, provider)
  }));

  // Find unique addresses
  const uniqueAddresses = new Set();
  invoices.forEach(inv => {
    if (inv.walletAddress && ethers.isAddress(inv.walletAddress)) {
      uniqueAddresses.add(inv.walletAddress.toLowerCase());
    }
  });
  console.log(`Scanning ${uniqueAddresses.size} unique wallet addresses on BSC...`);

  const addressBalances = {};
  const addrList = Array.from(uniqueAddresses);

  // Batch query with concurrency
  const CONCURRENCY = 5;
  for (let i = 0; i < addrList.length; i += CONCURRENCY) {
    const chunk = addrList.slice(i, i + CONCURRENCY);
    await Promise.all(chunk.map(async (addr) => {
      try {
        const bnbWei = await provider.getBalance(addr);
        const bnb = parseFloat(ethers.formatEther(bnbWei));

        const tokenBalances = {};
        let hasAnyNonZero = bnb > 0;

        for (const tc of tokenContracts) {
          try {
            const balWei = await tc.contract.balanceOf(addr);
            const bal = parseFloat(ethers.formatUnits(balWei, tc.decimals));
            tokenBalances[tc.symbol] = bal;
            if (bal > 0) hasAnyNonZero = true;
          } catch (err) {
            tokenBalances[tc.symbol] = 0;
          }
        }

        addressBalances[addr] = {
          address: addr,
          bnb,
          ...tokenBalances,
          hasBalance: hasAnyNonZero
        };
      } catch (err) {
        addressBalances[addr] = {
          address: addr,
          bnb: 0,
          error: err.message,
          hasBalance: false
        };
      }
    }));
    console.log(`Checked ${Math.min(i + CONCURRENCY, addrList.length)} / ${addrList.length} addresses...`);
  }

  // Merge results with invoices
  const invoicesWithBalance = [];
  const allResults = invoices.map((inv, idx) => {
    const addr = (inv.walletAddress || '').toLowerCase();
    const balInfo = addressBalances[addr] || { bnb: 0, USDT: 0, USDC: 0, hasBalance: false };

    const item = {
      index: idx + 1,
      invoiceId: inv._id.toString(),
      orderId: inv.orderId || 'N/A',
      customerEmail: inv.customerEmail || 'N/A',
      merchant: inv.merchantId?.businessName || inv.merchantId?.email || 'N/A',
      merchantWallet: inv.merchantId?.merchantWallet || 'N/A',
      status: inv.status,
      coin: inv.coin || 'USDT',
      network: inv.network || 'BEP20',
      expectedAmount: inv.usdtAmount || inv.amount,
      receivedAmount: inv.receivedAmount || 0,
      walletAddress: inv.walletAddress || 'N/A',
      onChainBalances: {
        BNB: balInfo.bnb || 0,
        USDT: balInfo.USDT || 0,
        USDC: balInfo.USDC || 0,
        BUSD: balInfo.BUSD || 0,
        FDUSD: balInfo.FDUSD || 0,
        DAI: balInfo.DAI || 0,
        WBNB: balInfo.WBNB || 0,
        ETH: balInfo.ETH || 0,
        BTCB: balInfo.BTCB || 0,
        CAKE: balInfo.CAKE || 0,
      },
      hasPositiveBalance: balInfo.hasBalance || false,
      createdAt: inv.createdAt,
      paidAt: inv.paidAt,
      txHash: inv.transactionHash
    };

    if (item.hasPositiveBalance) {
      invoicesWithBalance.push(item);
    }
    return item;
  });

  console.log('\n======================================================');
  console.log(`🔍 SUMMARY OF RESULTS`);
  console.log('======================================================');
  console.log(`Total Invoices: ${invoices.length}`);
  console.log(`Unique Addresses Checked: ${uniqueAddresses.size}`);
  console.log(`Invoices with On-Chain Balance > 0: ${invoicesWithBalance.length}`);

  if (invoicesWithBalance.length > 0) {
    console.log('\n🚨 INVOICES WITH POSITIVE BALANCES (> 0):');
    invoicesWithBalance.forEach(inv => {
      const nonZeroTokens = Object.entries(inv.onChainBalances)
        .filter(([_, val]) => val > 0)
        .map(([sym, val]) => `${val} ${sym}`)
        .join(', ');
      console.log(`\n• Order ID: ${inv.orderId} (Invoice ID: ${inv.invoiceId})`);
      console.log(`  Status: ${inv.status} | Network: ${inv.network} | Coin: ${inv.coin}`);
      console.log(`  Address: ${inv.walletAddress}`);
      console.log(`  💰 Balances: ${nonZeroTokens}`);
      console.log(`  Expected: ${inv.expectedAmount} | DB Received: ${inv.receivedAmount}`);
      console.log(`  Merchant: ${inv.merchant} (Payout Wallet: ${inv.merchantWallet})`);
    });
  } else {
    console.log('\n✅ No wallet addresses have any BNB, USDT, USDC, or other BEP-20 token balance > 0 (all are 0.00).');
  }

  // Print summary table of all invoices
  console.log('\n======================================================');
  console.log('📋 ALL INVOICES OVERVIEW');
  console.log('======================================================');
  console.table(allResults.map(r => ({
    '#': r.index,
    'Order ID': r.orderId,
    'Status': r.status,
    'Expected': `${r.expectedAmount} ${r.coin}`,
    'BNB': r.onChainBalances.BNB > 0 ? r.onChainBalances.BNB.toFixed(5) : '0',
    'USDT': r.onChainBalances.USDT > 0 ? r.onChainBalances.USDT.toFixed(4) : '0',
    'USDC': r.onChainBalances.USDC > 0 ? r.onChainBalances.USDC.toFixed(4) : '0',
    'Other': Object.entries(r.onChainBalances)
      .filter(([k, v]) => !['BNB', 'USDT', 'USDC'].includes(k) && v > 0)
      .map(([k, v]) => `${v} ${k}`).join(', ') || '0',
    'Address': r.walletAddress !== 'N/A' ? `${r.walletAddress.slice(0, 6)}...${r.walletAddress.slice(-4)}` : 'N/A',
  })));

  // Write JSON result to file
  const reportPath = path.resolve(__dirname, 'invoice_balance_report.json');
  fs.writeFileSync(reportPath, JSON.stringify({
    timestamp: new Date().toISOString(),
    totalInvoices: invoices.length,
    uniqueAddresses: uniqueAddresses.size,
    invoicesWithBalanceCount: invoicesWithBalance.length,
    invoicesWithBalance,
    allInvoices: allResults
  }, null, 2));

  console.log(`\nDetailed report saved to: ${reportPath}`);
  await mongoose.disconnect();
}

main().catch(err => {
  console.error('Execution failed:', err);
  process.exit(1);
});
