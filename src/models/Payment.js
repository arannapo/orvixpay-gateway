import mongoose from 'mongoose';

const PaymentSchema = new mongoose.Schema({
  invoiceId: { type: mongoose.Schema.Types.ObjectId, ref: 'Invoice', required: true },
  txHash: { type: String, required: true, unique: true },
  walletAddress: { type: String, required: true },
  network: { type: String, default: 'BEP20' },
  coin: { type: String, default: 'USDT' },
  amount: { type: Number, required: true },
  blockNumber: { type: Number },
  confirmations: { type: Number, default: 0 },
  senderAddress: { type: String },
  gasFee: { type: String },
  status: { type: String, enum: ['Pending', 'Confirmed', 'Failed'], default: 'Pending' },
  detectedAt: { type: Date, default: Date.now },
  confirmedAt: { type: Date }
});

export default mongoose.models.Payment || mongoose.model('Payment', PaymentSchema);
