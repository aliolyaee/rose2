import { randomInt } from 'crypto';

export function createSlug(str: string) {
  return `${str.replace(/[،ًًًٌٍُِ\.\+\-_)(*&^%$#@!~'";:?><«»`ء]+/g, '').replace(/[\s]+/g, '-')}`;
}
export const randomId = () => Math.random().toString(36).substring(2);

export function generateTrackingCode(length = 8): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Exclude O, 0, I, 1
  let code = '';
  for (let i = 0; i < length; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}
