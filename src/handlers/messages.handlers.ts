import { Request, Response } from 'express';
import { redis } from '../db/connection.js';
import { dbQuery } from '../utils/db.utils.js';

export function getMessages(req: Request, res: Response) {}

export function createMessage(req: Request, res: Response) {}

export function updateMessage(req: Request, res: Response) {}

export function deleteMessage(req: Request, res: Response) {}
