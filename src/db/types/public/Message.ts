// @generated
// This file is automatically generated by Kanel. Do not modify manually.

import { type UserId } from './User';
import { type ColumnType, type Selectable, type Insertable, type Updateable } from 'kysely';

/** Identifier type for public.message */
export type MessageId = number & { __brand: 'MessageId' };

/** Represents the table public.message */
export default interface MessageTable {
  id: ColumnType<MessageId, MessageId | undefined, MessageId>;

  userId: ColumnType<UserId, UserId, UserId>;

  content: ColumnType<string, string, string>;
}

export type Message = Selectable<MessageTable>;

export type NewMessage = Insertable<MessageTable>;

export type MessageUpdate = Updateable<MessageTable>;