import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  businessName: { type: String },
  logo: { type: String },
  website: { type: String },
  supportEmail: { type: String },
  defaultCurrency: { type: String, default: 'USD' },
  timezone: { type: String, default: 'UTC' },
  webhookUrl: { type: String },
  webhookHeaders: [{
    key: { type: String },
    value: { type: String }
  }],
  secretKey: { type: String },
  merchantWallet: { type: String }, // Target wallet for receiving funds
  systemWalletAddress: { type: String }, // Auto-generated wallet for paying blockchain gas fees
  systemWalletPrivateKey: { type: String },
  successUrl: { type: String },
  cancelUrl: { type: String },
  role: { type: String, enum: ['merchant', 'admin'], default: 'merchant' },
  twoFactorEnabled: { type: Boolean, default: false },
  twoFactorSecret: { type: String },
  emailOtp: { type: String },
  emailOtpExpires: { type: Date },
  resetPasswordToken: { type: String },
  resetPasswordExpires: { type: Date },
  isEmailVerified: { type: Boolean, default: false },
  isBlocked: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

if (mongoose.models.User) {
  delete mongoose.models.User;
}

export default mongoose.model('User', UserSchema);
