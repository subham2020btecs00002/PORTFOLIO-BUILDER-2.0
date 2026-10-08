import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

@Schema({ collection: 'ai_usages', timestamps: true })
export class AiUsage extends Document {
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', required: true, index: true })
  userId: MongooseSchema.Types.ObjectId | string;

  @Prop({ required: true, index: true })
  date: string; // YYYY-MM-DD in UTC

  @Prop({ default: 0 })
  count: number;
}

export const AiUsageSchema = SchemaFactory.createForClass(AiUsage);
AiUsageSchema.index({ userId: 1, date: 1 }, { unique: true });
