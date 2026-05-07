 
import mongoose, { Model } from 'mongoose';

interface CounterDoc { _id: string; seq: number; }

const CounterSchema = new mongoose.Schema<CounterDoc>({
  _id: { type: String, required: true },
  seq: { type: Number, default: 0 },
});

export const Counter: Model<CounterDoc> =
  mongoose.models.Counter ||
  mongoose.model<CounterDoc>('Counter', CounterSchema);
