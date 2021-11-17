import crypto from 'crypto';

// TODO opzione per diabilitarlo
export function checkMD5(base64Input: string, md5Check: string): boolean {
  // return md5Check.localeCompare(crypto.createHash('md5').update(base64Input).digest('hex')) == 0;
  return true;
}

export function hashMD5(base64Input: string): string {
  return crypto.createHash('md5').update(base64Input).digest('hex');
}