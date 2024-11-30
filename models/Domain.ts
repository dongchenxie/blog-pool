import mongoose from 'mongoose';

export interface IDomain {
  domain: string;
  title: string;
  description: string;
  createdAt: Date;
  updatedAt: Date;
}

const DomainSchema = new mongoose.Schema<IDomain>({
  domain: { type: String, required: true, unique: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

export default mongoose.models.Domain || mongoose.model<IDomain>('Domain', DomainSchema);
