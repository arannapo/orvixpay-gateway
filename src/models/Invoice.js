import mongoose from 'mongoose';

const InvoiceSchema = new mongoose.Schema({
  merchantId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  orderId: { type: String, required: true },
  customerName: { type: String },
  customerEmail: { type: String },
  description: { type: String },
  amount: { type: Number, required: true },
  currency: { type: String, required: true },
  usdtAmount: { type: Number, required: true },
  receivedAmount: { type: Number, default: 0 },
  walletAddress: { type: String, required: true, unique: true },
  walletPrivateKey: { type: String, required: true },
  network: { type: String, default: 'BEP20' },
  coin: { type: String, default: 'USDT' },
  status: {
    type: String,
    enum: ['Pending', 'Processing', 'Partially Paid', 'Overpaid', 'Gas Funding', 'Paid', 'Expired', 'Cancelled', 'Failed', 'Refunded'],
    default: 'Pending'
  },
  webhookUrl: { type: String },
  webhookStatus: { type: String, enum: ['None', 'Sent', 'Failed'], default: 'None' },
  overpaidDetails: { type: mongoose.Schema.Types.Mixed, default: {} },
  successUrl: { type: String },
  cancelUrl: { type: String },
  expiresAt: { type: Date, required: true },
  createdAt: { type: Date, default: Date.now },
  paidAt: { type: Date },
  transactionHash: { type: String },
  metadata: { type: mongoose.Schema.Types.Mixed, default: {} },
});

delete mongoose.models.Invoice;
export default mongoose.model('Invoice', InvoiceSchema);

