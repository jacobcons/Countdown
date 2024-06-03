// @generated
// This file is automatically generated by Kanel. Do not modify manually.

import { type UserId } from './User';
import { type ColumnType, type Selectable, type Insertable, type Updateable } from 'kysely';

/** Identifier type for public.contact */
export type ContactId = number & { __brand: 'ContactId' };

/** Represents the table public.contact */
export default interface ContactTable {
  id: ColumnType<ContactId, ContactId | undefined, ContactId>;

  userId: ColumnType<UserId, UserId, UserId>;

  email: ColumnType<string, string, string>;
}

export type Contact = Selectable<ContactTable>;

export type NewContact = Insertable<ContactTable>;

export type ContactUpdate = Updateable<ContactTable>;
