import mongoose from 'mongoose';

const habitSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true },
  description: { type: String },
  frequency: { type: String, required: true, default: 'daily' }, // 'daily', 'weekly'
  target: { type: Number, default: 1 },
  icon: { type: String },
  color: { type: String },
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

habitSchema.virtual('id').get(function() {
  return this._id.toHexString();
});

export const Habit = mongoose.model('Habit', habitSchema);
