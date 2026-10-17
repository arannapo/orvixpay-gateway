const mongoose = require('mongoose');
const { ethers } = require('ethers');
const fs = require('fs');
const path = require('path');

// Parse .env.local manually
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

const BEP20_USDT = '0x55d398326f99059ff775485246999027b3197955';
const BEP20_USDC = '0x8ac76a51cc950d9822d68b83fe1ad97b32cd580d';
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

async function main() {
  console.log('Connecting to MongoDB...');
  await mongoose.connect(env.MONGODB_URI);
  console.log('Connected to MongoDB successfully.');

  const invoices = await Invoice.find({}).populate('merchantId', 'businessName email merchantWallet systemWalletAddress').lean();
  console.log(`Found ${invoices.length} total invoices in database.`);

  const provider = new ethers.JsonRpcProvider('https://bsc-dataseed.binance.org/');
  const usdtContract = new ethers.Contract(BEP20_USDT, minABI, provider);
  const usdcContract = new ethers.Contract(BEP20_USDC, minABI, provider);

  const statusCount = {};
  const coinCount = {};
  const invoicesWithBalance = [];
  const allResults = [];

  // Concurrency helper
  const CONCURRENCY = 10;
  let index = 0;

  async function processInvoice(inv, idx) {
    statusCount[inv.status] = (statusCount[inv.status] || 0) + 1;
    coinCount[inv.coin] = (coinCount[inv.coin] || 0) + 1;

    let bnbBalance = 0;
    let usdtBalance = 0;
    let usdcBalance = 0;
    let error = null;

    if (inv.walletAddress) {
      try {
        const addr = inv.walletAddress.toLowerCase();
        const [bnbWei, usdtWei, usdcWei] = await Promise.all([
          provider.getBalance(addr),
          usdtContract.balanceOf(addr),
          usdcContract.balanceOf(addr)
        ]);

        bnbBalance = parseFloat(ethers.formatEther(bnbWei));
        usdtBalance = parseFloat(ethers.formatUnits(usdtWei, 18));
        usdcBalance = parseFloat(ethers.formatUnits(usdcWei, 18));
      } catch (err) {
        error = err.message;
      }
    }

    const item = {
      index: idx + 1,
      _id: inv._id.toString(),
      orderId: inv.orderId || 'N/A',
      customerEmail: inv.customerEmail || 'N/A',
      merchant: inv.merchantId?.businessName || inv.merchantId?.email || 'N/A',
      merchantWallet: inv.merchantId?.merchantWallet || 'N/A',
      status: inv.status,
      coin: inv.coin,
      amount: inv.amount,
      currency: inv.currency,
      usdtAmount: inv.usdtAmount,
      dbReceivedAmount: inv.receivedAmount || 0,
      walletAddress: inv.walletAddress || 'N/A',
      onChain: {
        bnb: bnbBalance,
        usdt: usdtBalance,
        usdc: usdcBalance,
      },
      hasBalance: (bnbBalance > 0 || usdtBalance > 0 || usdcBalance > 0),
      createdAt: inv.createdAt,
      expiresAt: inv.expiresAt,
      paidAt: inv.paidAt,
      txHash: inv.transactionHash,
      error
    };

    allResults.push(item);
    if (item.hasBalance) {
      invoicesWithBalance.push(item);
      console.log(`\n🚨 FOUND BALANCE > 0 on Invoice #${idx + 1} (${inv.orderId}) [Status: ${inv.status}]: BNB=${bnbBalance}, USDT=${usdtBalance}, USDC=${usdcBalance}`);
    }
  }

  console.log(`Starting scan of ${invoices.length} invoices on BSC...`);
  
  // Process in batches
  for (let i = 0; i < invoices.length; i += CONCURRENCY) {
    const chunk = invoices.slice(i, i + CONCURRENCY);
    await Promise.all(chunk.map((inv, idx) => processInvoice(inv, i + idx)));
    process.stdout.write(`Processed ${Math.min(i + CONCURRENCY, invoices.length)} / ${invoices.length} invoices...\r`);
  }
  console.log(`\nScan completed.`);

  // Sort all results by index
  allResults.sort((a, b) => a.index - b.index);

  console.log('\n========================================');
  console.log('📊 STATUS BREAKDOWN:');
  console.log('========================================');
  console.table(statusCount);

  console.log('\n========================================');
  console.log('🪙 COIN BREAKDOWN:');
  console.log('========================================');
  console.table(coinCount);

  console.log('\n========================================');
  console.log(`🚨 INVOICES WITH ON-CHAIN BALANCE > 0: Total ${invoicesWithBalance.length}`);
  console.log('========================================');
  if (invoicesWithBalance.length === 0) {
    console.log('✅ NONE. All invoice addresses currently have 0.00 BNB, 0.00 USDT, and 0.00 USDC.');
  } else {
    invoicesWithBalance.forEach(inv => {
      console.log(`- Order: ${inv.orderId} | Status: ${inv.status} | Address: ${inv.walletAddress}`);
      console.log(`  BNB: ${inv.onChain.bnb} | USDT: ${inv.onChain.usdt} | USDC: ${inv.onChain.usdc}`);
      console.log(`  DB Expected: ${inv.usdtAmount} ${inv.coin} | DB Received: ${inv.dbReceivedAmount} ${inv.coin}`);
      console.log(`  Merchant: ${inv.merchant} | Created: ${inv.createdAt}`);
    });
  }

  console.log('\n========================================');
  console.log('📋 COMPLETE INVOICES LIST & ON-CHAIN BALANCES:');
  console.log('========================================');
  console.table(allResults.map(r => ({
    '#': r.index,
    'Order ID': r.orderId,
    'Status': r.status,
    'Coin': r.coin,
    'Expected': r.usdtAmount,
    'DB Received': r.dbReceivedAmount,
    'OnChain BNB': r.onChain.bnb > 0 ? r.onChain.bnb.toFixed(6) : '0',
    'OnChain USDT': r.onChain.usdt > 0 ? r.onChain.usdt.toFixed(4) : '0',
    'OnChain USDC': r.onChain.usdc > 0 ? r.onChain.usdc.toFixed(4) : '0',
    'Address': r.walletAddress ? (r.walletAddress.substring(0, 6) + '...' + r.walletAddress.substring(38)) : 'None',
    'Date': r.createdAt ? new Date(r.createdAt).toISOString().split('T')[0] : 'N/A'
  })));

  // Write full detailed json report to file
  const reportPath = path.resolve(__dirname, 'invoice_balance_report.json');
  fs.writeFileSync(reportPath, JSON.stringify({
    timestamp: new Date().toISOString(),
    totalInvoices: invoices.length,
    statusBreakdown: statusCount,
    coinBreakdown: coinCount,
    invoicesWithBalanceCount: invoicesWithBalance.length,
    invoicesWithBalance,
    allInvoices: allResults
  }, null, 2));
  console.log(`\nFull detailed report saved to: ${reportPath}`);

  await mongoose.disconnect();
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
