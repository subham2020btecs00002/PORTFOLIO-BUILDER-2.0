import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class User extends Document {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ required: true })
  password?: string;

  @Prop({ default: null })
  refreshTokenHash?: string;

  /** Custom public URL slug — e.g. "john-doe" → /p/john-doe */
  @Prop({ unique: true, sparse: true, default: null })
  username?: string;
}

export const UserSchema = SchemaFactory.createForClass(User);
