import { Request, Response } from 'express';
import { redis } from '../db/connection.js';
import { sqlf } from '../utils/db.utils.js';

export function getTasks(req: Request, res: Response) {}

export function createTask(req: Request, res: Response) {}

export function updateTask(req: Request, res: Response) {}

export function deleteTask(req: Request, res: Response) {}
