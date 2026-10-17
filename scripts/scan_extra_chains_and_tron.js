const crypto = require('crypto');
const https = require('https');
const mongoose = require('mongoose');
const { ethers } = require('ethers');
const fs = require('fs');
const path = require('path');

// Base58 Encode function
const ALPHABET = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';
function encodeBase58(buffer) {
  let num = BigInt('0x' + buffer.toString('hex'));
  let str = '';
  while (num > 0n) {
    const rem = num % 58n;
    str = ALPHABET[Number(rem)] + str;
    num = num / 58n;
  }
  for (let i = 0; i < buffer.length && buffer[i] === 0; i++) {
    str = '1' + str;
  }
  return str;
}

function ethToTron(ethAddress) {
  const clean = ethAddress.toLowerCase().replace(/^0x/, '');
  const hex = '41' + clean;
  const bytes = Buffer.from(hex, 'hex');
  const hash1 = crypto.createHash('sha256').update(bytes).digest();
  const hash2 = crypto.createHash('sha256').update(hash1).digest();
  const checksum = hash2.slice(0, 4);
  const full = Buffer.concat([bytes, checksum]);
  return encodeBase58(full);
}

// Load env
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

const InvoiceSchema = new mongoose.Schema({
  orderId: { type: String },
  walletAddress: { type: String },
  walletPrivateKey: { type: String },
  status: { type: String },
  amount: { type: Number },
  coin: { type: String },
  network: { type: String },
}, { strict: false });

const Invoice = mongoose.models.Invoice || mongoose.model('Invoice', InvoiceSchema);

// Helper for http get
function fetchJson(url) {
  return new Promise((resolve, reject) => {
    https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' } }, (res) => {
      let data = '';
      res.on('data', chunk => { data += chunk; });
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          resolve(null);
        }
      });
    }).on('error', err => resolve(null));
  });
}

// Additional EVM chains to check
const EXTRA_CHAINS = [
  {
    name: 'opBNB Mainnet',
    chainId: 204,
    nativeSymbol: 'BNB',
    rpcs: ['https://opbnb-mainnet-rpc.bnbchain.org', 'https://opbnb.publicnode.com'],
    tokens: [
      { symbol: 'USDT', address: '0x9e5aac1ba1a2e6aed6b32689dfcf62a509ca96f3', decimals: 18 }
    ]
  },
  {
    name: 'Linea Mainnet',
    chainId: 59144,
    nativeSymbol: 'ETH',
    rpcs: ['https://rpc.linea.build', 'https://linea.blockpi.network/v1/rpc/public'],
    tokens: [
      { symbol: 'USDT', address: '0xa219439258ca9da29e9cc4ce5596924745e12b93', decimals: 6 },
      { symbol: 'USDC', address: '0x176211869cA2b568f2A7D4EE941E073a821EE1ff', decimals: 6 }
    ]
  },
  {
    name: 'Mantle Mainnet',
    chainId: 5000,
    nativeSymbol: 'MNT',
    rpcs: ['https://rpc.mantle.xyz'],
    tokens: [
      { symbol: 'USDT', address: '0x201EBa5CC46D216Ce6DC03F6a759e80766910294', decimals: 6 },
      { symbol: 'USDC', address: '0x09Bc4E0D864854c6aFB6eB9A9cdF58aC190D0dF9', decimals: 6 }
    ]
  },
  {
    name: 'Scroll Mainnet',
    chainId: 534352,
    nativeSymbol: 'ETH',
    rpcs: ['https://rpc.scroll.io'],
    tokens: [
      { symbol: 'USDT', address: '0xf55BEC9cafDbE8730f096Aa55dad6D22d44099Df', decimals: 6 },
      { symbol: 'USDC', address: '0x06eFdBF55d380408eeed4A1fEC15B80CbbA01449', decimals: 6 }
    ]
  }
];

const MULTICALL3_ADDRESS = '0xcA11bde05977b3631167028862bE2a173976CA11';
const MULTICALL3_ABI = [
  'function aggregate3(tuple(address target, bool allowFailure, bytes callData)[] calls) payable returns (tuple(bool success, bytes returnData)[] returnData)',
  'function getEthBalance(address addr) view returns (uint256 balance)'
];
const ERC20_INTERFACE = new ethers.Interface(['function balanceOf(address owner) view returns (uint256)']);
const MULTICALL3_INTERFACE = new ethers.Interface(MULTICALL3_ABI);

async function checkExtraChains(uniqueAddresses) {
  console.log('\nScanning extra EVM chains (opBNB, Linea, Mantle, Scroll)...');
  const findings = [];

  for (const net of EXTRA_CHAINS) {
    let provider;
    for (const rpc of net.rpcs) {
      try {
        const p = new ethers.JsonRpcProvider(rpc, net.chainId, { staticNetwork: true });
        await p.getBlockNumber();
        provider = p;
        break;
      } catch (e) {}
    }
    if (!provider) continue;

    const multicall = new ethers.Contract(MULTICALL3_ADDRESS, MULTICALL3_ABI, provider);
    const calls = [];
    const meta = [];

    for (const addr of uniqueAddresses) {
      calls.push({
        target: MULTICALL3_ADDRESS,
        allowFailure: true,
        callData: MULTICALL3_INTERFACE.encodeFunctionData('getEthBalance', [addr])
      });
      meta.push({ address: addr, symbol: net.nativeSymbol, decimals: 18, isNative: true });

      for (const t of net.tokens) {
        calls.push({
          target: t.address,
          allowFailure: true,
          callData: ERC20_INTERFACE.encodeFunctionData('balanceOf', [addr])
        });
        meta.push({ address: addr, symbol: t.symbol, decimals: t.decimals, isNative: false });
      }
    }

    try {
      const res = await multicall.aggregate3.staticCall(calls);
      for (let i = 0; i < res.length; i++) {
        if (res[i].success && res[i].returnData && res[i].returnData !== '0x') {
          let valWei;
          if (meta[i].isNative) {
            valWei = MULTICALL3_INTERFACE.decodeFunctionResult('getEthBalance', res[i].returnData)[0];
          } else {
            valWei = ERC20_INTERFACE.decodeFunctionResult('balanceOf', res[i].returnData)[0];
          }
          if (valWei > 0n) {
            findings.push({
              network: net.name,
              address: meta[i].address,
              symbol: meta[i].symbol,
              balance: ethers.formatUnits(valWei, meta[i].decimals)
            });
          }
        }
      }
      console.log(`  ✓ Checked ${net.name}: found ${findings.filter(f => f.network === net.name).length} balances`);
    } catch (err) {
      console.log(`  Skipping ${net.name} multicall (not supported or RPC limit)`);
    }
  }

  return findings;
}

// Tron check: TRX, USDT (TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t), USDC (TEkxiTehnzSmSe2XqrBj4w32RUN966rdz8)
const USDT_TRC20 = 'TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t';
const USDC_TRC20 = 'TEkxiTehnzSmSe2XqrBj4w32RUN966rdz8';

async function checkTronGrid(uniqueAddresses) {
  console.log('\nChecking TRON network for TRX / USDT (TRC20) / USDC (TRC20)...');
  const tronFindings = [];

  // Check in batches of 10
  for (let i = 0; i < uniqueAddresses.length; i += 10) {
    const chunk = uniqueAddresses.slice(i, i + 10);
    await Promise.all(chunk.map(async (ethAddr) => {
      const tronAddr = ethToTron(ethAddr);
      const url = `https://api.trongrid.io/v1/accounts/${tronAddr}`;
      const data = await fetchJson(url);
      if (data && data.data && data.data.length > 0) {
        const acc = data.data[0];
        const trxBal = (acc.balance || 0) / 1e6;
        if (trxBal > 0) {
          tronFindings.push({ network: 'TRON (TRC20)', address: tronAddr, ethAddress: ethAddr, symbol: 'TRX', balance: trxBal });
        }
        if (acc.trc20 && acc.trc20.length > 0) {
          acc.trc20.forEach(t => {
            if (t[USDT_TRC20]) {
              const usdt = parseFloat(t[USDT_TRC20]) / 1e6;
              if (usdt > 0) tronFindings.push({ network: 'TRON (TRC20)', address: tronAddr, ethAddress: ethAddr, symbol: 'USDT (TRC20)', balance: usdt });
            }
            if (t[USDC_TRC20]) {
              const usdc = parseFloat(t[USDC_TRC20]) / 1e6;
              if (usdc > 0) tronFindings.push({ network: 'TRON (TRC20)', address: tronAddr, ethAddress: ethAddr, symbol: 'USDC (TRC20)', balance: usdc });
            }
          });
        }
      }
    }));
    if ((i + 10) % 50 === 0 || i + 10 >= uniqueAddresses.length) {
      console.log(`  TRON scanned ${Math.min(i + 10, uniqueAddresses.length)} / ${uniqueAddresses.length} addresses...`);
    }
  }

  return tronFindings;
}

async function run() {
  await mongoose.connect(env.MONGODB_URI);
  const invoices = await Invoice.find({}).lean();
  console.log(`Found ${invoices.length} invoices in DB.`);

  const addressSet = new Set();
  invoices.forEach(inv => {
    if (inv.walletAddress && ethers.isAddress(inv.walletAddress.trim())) {
      addressSet.add(inv.walletAddress.trim().toLowerCase());
    }
  });
  const addrs = Array.from(addressSet);

  const extraFindings = await checkExtraChains(addrs);
  const tronFindings = await checkTronGrid(addrs);

  console.log('\n=============================================');
  console.log('EXTRA CHAINS & TRON SCAN RESULTS:');
  console.log('=============================================');
  console.log(`Extra EVM Findings: ${extraFindings.length}`);
  console.log(`TRON Findings: ${tronFindings.length}`);

  if (extraFindings.length > 0) {
    console.log('Extra EVM Details:', extraFindings);
  }
  if (tronFindings.length > 0) {
    console.log('Tron Details:', tronFindings);
  }

  await mongoose.disconnect();
}

run().catch(console.error);
