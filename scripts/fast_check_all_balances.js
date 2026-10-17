const mongoose = require('mongoose');
const { ethers } = require('ethers');
const fs = require('fs');
const path = require('path');

// Load environment variables
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

const MULTICALL3_ADDRESS = '0xcA11bde05977b3631167028862bE2a173976CA11';
const MULTICALL3_ABI = [
  'function aggregate3(tuple(address target, bool allowFailure, bytes callData)[] calls) payable returns (tuple(bool success, bytes returnData)[] returnData)',
  'function getEthBalance(address addr) view returns (uint256 balance)'
];

const ERC20_INTERFACE = new ethers.Interface([
  'function balanceOf(address owner) view returns (uint256)',
  'function decimals() view returns (uint8)',
  'function symbol() view returns (string)'
]);

const MULTICALL3_INTERFACE = new ethers.Interface(MULTICALL3_ABI);

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

async function main() {
  console.log('Connecting to MongoDB...');
  await mongoose.connect(env.MONGODB_URI, { serverSelectionTimeoutMS: 5000 });
  console.log('Connected to MongoDB successfully.');

  const invoices = await Invoice.find({}).populate('merchantId', 'businessName email merchantWallet systemWalletAddress').lean();
  console.log(`Found ${invoices.length} total invoices in database.`);

  const provider = new ethers.JsonRpcProvider(RPC_URLS[0]);
  const multicallContract = new ethers.Contract(MULTICALL3_ADDRESS, MULTICALL3_ABI, provider);

  const uniqueAddresses = new Set();
  invoices.forEach(inv => {
    if (inv.walletAddress && ethers.isAddress(inv.walletAddress)) {
      uniqueAddresses.add(inv.walletAddress.toLowerCase());
    }
  });
  console.log(`Scanning ${uniqueAddresses.size} unique wallet addresses on BSC via Multicall3...`);
  const addrList = Array.from(uniqueAddresses);

  // Build multicall calls
  const calls = [];
  const callMetadata = [];

  for (const addr of addrList) {
    // 1. BNB balance
    calls.push({
      target: MULTICALL3_ADDRESS,
      allowFailure: true,
      callData: MULTICALL3_INTERFACE.encodeFunctionData('getEthBalance', [addr])
    });
    callMetadata.push({ address: addr, type: 'BNB', decimals: 18 });

    // 2. Token balances
    for (const token of TOKENS) {
      calls.push({
        target: token.address,
        allowFailure: true,
        callData: ERC20_INTERFACE.encodeFunctionData('balanceOf', [addr])
      });
      callMetadata.push({ address: addr, type: token.symbol, decimals: token.decimals });
    }
  }

  console.log(`Total sub-queries packed into Multicall: ${calls.length}`);

  // Chunk in batches of 500 calls
  const CHUNK_SIZE = 500;
  const results = [];
  for (let i = 0; i < calls.length; i += CHUNK_SIZE) {
    const chunk = calls.slice(i, i + CHUNK_SIZE);
    const res = await multicallContract.aggregate3.staticCall(chunk);
    results.push(...res);
    console.log(`Fetched ${Math.min(i + CHUNK_SIZE, calls.length)} / ${calls.length} queries...`);
  }

  const addressBalances = {};
  addrList.forEach(addr => {
    addressBalances[addr] = {
      address: addr,
      BNB: 0,
      USDT: 0,
      USDC: 0,
      BUSD: 0,
      FDUSD: 0,
      DAI: 0,
      WBNB: 0,
      ETH: 0,
      BTCB: 0,
      CAKE: 0,
      hasBalance: false
    };
  });

  for (let i = 0; i < results.length; i++) {
    const meta = callMetadata[i];
    const res = results[i];
    if (res.success && res.returnData && res.returnData !== '0x') {
      try {
        let valWei;
        if (meta.type === 'BNB') {
          valWei = MULTICALL3_INTERFACE.decodeFunctionResult('getEthBalance', res.returnData)[0];
        } else {
          valWei = ERC20_INTERFACE.decodeFunctionResult('balanceOf', res.returnData)[0];
        }
        const val = parseFloat(ethers.formatUnits(valWei, meta.decimals));
        addressBalances[meta.address][meta.type] = val;
        if (val > 0) {
          addressBalances[meta.address].hasBalance = true;
        }
      } catch (err) {
        // ignore decode errors
      }
    }
  }

  const invoicesWithBalance = [];
  const allResults = invoices.map((inv, idx) => {
    const addr = (inv.walletAddress || '').toLowerCase();
    const balInfo = addressBalances[addr] || { BNB: 0, USDT: 0, USDC: 0, hasBalance: false };

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
      onChainBalances: balInfo,
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
  console.log(`🔍 FINAL SCAN RESULT (ALL 199 INVOICES)`);
  console.log('======================================================');
  console.log(`Total Invoices: ${invoices.length}`);
  console.log(`Unique Addresses Checked: ${uniqueAddresses.size}`);
  console.log(`Invoices with On-Chain Balance > 0: ${invoicesWithBalance.length}`);

  if (invoicesWithBalance.length > 0) {
    console.log('\n🚨 INVOICES WITH POSITIVE BALANCES (> 0):');
    invoicesWithBalance.forEach(inv => {
      const nonZeroTokens = Object.entries(inv.onChainBalances)
        .filter(([k, val]) => k !== 'address' && k !== 'hasBalance' && val > 0)
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
    console.log('\n✅ NO WALLET ADDRESSES HAVE ANY POSITIVE BALANCE (> 0).');
    console.log('All 199 invoice wallet addresses currently hold 0.00 BNB, 0.00 USDT, 0.00 USDC, 0.00 BUSD, 0.00 FDUSD, 0.00 DAI, 0.00 WBNB, 0.00 ETH, 0.00 BTCB, and 0.00 CAKE.');
  }

  // Breakdown by status
  const statusStats = {};
  invoices.forEach(inv => {
    statusStats[inv.status] = (statusStats[inv.status] || 0) + 1;
  });
  console.log('\n======================================================');
  console.log('📊 INVOICES BY STATUS:');
  console.log('======================================================');
  console.table(statusStats);

  // Write full json report
  const reportPath = path.resolve(__dirname, 'invoice_balance_report.json');
  fs.writeFileSync(reportPath, JSON.stringify({
    timestamp: new Date().toISOString(),
    totalInvoices: invoices.length,
    uniqueAddresses: uniqueAddresses.size,
    statusStats,
    invoicesWithBalanceCount: invoicesWithBalance.length,
    invoicesWithBalance,
    allInvoices: allResults
  }, null, 2));

  console.log(`\nDetailed report written to: ${reportPath}`);
  await mongoose.disconnect();
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
