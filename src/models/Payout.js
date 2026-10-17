import mongoose from 'mongoose';

const RecipientSchema = new mongoose.Schema({
  address: { type: String, required: true },
  amount: { type: Number, required: true },
  memo: { type: String, default: '' },
  status: { type: String, enum: ['Completed', 'Pending', 'Failed'], default: 'Completed' },
  txHash: { type: String }
});

const PayoutSchema = new mongoose.Schema({
  merchantId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  batchId: { type: String, required: true, unique: true },
  senderWallet: { type: String },
  coin: { type: String, default: 'USDT' },
  network: { type: String, default: 'BEP20' },
  totalAmount: { type: Number, required: true },
  recipientsCount: { type: Number, required: true },
  recipients: [RecipientSchema],
  status: { type: String, enum: ['Completed', 'Processing', 'Pending', 'Failed'], default: 'Completed' },
  txHash: { type: String },
  gasFee: { type: String, default: '0.0012 BNB' },
  createdAt: { type: Date, default: Date.now }
});

if (mongoose.models.Payout) {
  delete mongoose.models.Payout;
}

export default mongoose.model('Payout', PayoutSchema);
