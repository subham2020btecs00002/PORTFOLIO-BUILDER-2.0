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
  @Prop({ unique: true, sparse: true })
  username?: string;

  @Prop({ default: 'user' })
  role?: string;

  @Prop({ default: null })
  resetPasswordToken?: string;

  @Prop({ default: null })
  resetPasswordExpires?: Date;
}

export const UserSchema = SchemaFactory.createForClass(User);
