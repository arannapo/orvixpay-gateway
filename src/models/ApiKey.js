import mongoose from 'mongoose';

const ApiKeySchema = new mongoose.Schema({
  merchantId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true },
  secretKey: { type: String, required: true, unique: true },
  status: { type: String, enum: ['active', 'disabled'], default: 'active' },
  lastUsed: { type: Date },
  createdAt: { type: Date, default: Date.now }
});

if (mongoose.models.ApiKey) {
  delete mongoose.models.ApiKey;
}

const ApiKey = mongoose.model('ApiKey', ApiKeySchema);

// Programmatically drop the old unique index for publicKey if it exists
if (mongoose.connection) {
  mongoose.connection.once('open', () => {
    ApiKey.collection.dropIndex('publicKey_1').catch(() => {
      // Ignore if index doesn't exist
    });
  });
}

export default ApiKey;
