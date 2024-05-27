import type { ColumnType } from "kysely";

export type Generated<T> = T extends ColumnType<infer S, infer I, infer U>
  ? ColumnType<S, I | undefined, U>
  : ColumnType<T, T | undefined, T>;

export type Int8 = ColumnType<string, bigint | number | string, bigint | number | string>;

export type Timestamp = ColumnType<Date, Date | string, Date | string>;

export interface Contact {
  email: string;
  id: Generated<number>;
  userId: number;
}

export interface GooseDbVersion {
  id: Generated<number>;
  isApplied: boolean;
  tstamp: Generated<Timestamp | null>;
  versionId: Int8;
}

export interface Task {
  completedTimestamp: Timestamp | null;
  createdAt: Generated<Timestamp>;
  description: string | null;
  failedMessage: string | null;
  failedRecipientEmail: string | null;
  finishTimestamp: Timestamp;
  id: Generated<number>;
  title: string;
  userId: number;
}

export interface User {
  accessToken: string;
  googleId: string;
  id: Generated<number>;
  refreshToken: string;
}

export interface DB {
  contact: Contact;
  gooseDbVersion: GooseDbVersion;
  task: Task;
  user: User;
}
