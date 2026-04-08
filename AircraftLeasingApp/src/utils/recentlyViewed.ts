/**
 * Simple in-memory recently viewed cases tracker.
 * Persists within the app session.
 */
import type { Case } from '../types';

const MAX_RECENT = 5;
let recent: Case[] = [];
let listeners: (() => void)[] = [];

export function addRecentCase(c: Case) {
  recent = [c, ...recent.filter(r => r.case_id !== c.case_id)].slice(0, MAX_RECENT);
  listeners.forEach(fn => fn());
}

export function getRecentCases(): Case[] {
  return recent;
}

export function onRecentChange(fn: () => void) {
  listeners.push(fn);
  return () => { listeners = listeners.filter(l => l !== fn); };
}
