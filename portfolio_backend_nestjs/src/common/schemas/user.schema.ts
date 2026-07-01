import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

/**
 * Read-only copy of the User schema for the Portfolio monolith.
 *
 * The auth-service OWNS this collection and is the only service that writes
 * to it. The monolith registers this schema solely to:
 *  1. Resolve .populate('user', 'name username') on public portfolio queries
 *  2. Allow getPublicByUsername() to look up a userId from a username slug
 *
 * DO NOT write to this model from the monolith — use auth-service for that.
 */
@Schema({ collection: 'users', timestamps: true })
export class User extends Document {
  @Prop()
  name: string;

  @Prop()
  email: string;

  @Prop({ sparse: true })
  username?: string;
}

export const UserSchema = SchemaFactory.createForClass(User);
