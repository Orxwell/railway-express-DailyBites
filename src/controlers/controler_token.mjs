import { randomBytes } from 'crypto';

import db from './controler_db.mjs';
// -----------------------------------------------------

export function generateSpecsToken() {
  const token      = randomBytes(32).toString('base64url');
  const expiration = new Date(
    Date.now() + process.env.TOKEN_EXPIRATION_SECONDS * 1000
  )

  return { token: token, expiration: expiration }
}

export function scheduleTokenExpiration(specs_token) {
  const expireInMs = specs_token.expiration - Date.now();

  if (expireInMs > 0) {
    setTimeout(async () => {
      try {
        const foundToken = await db.readRecords('tokens',
          { token: specs_token.token }
        );

        if (foundToken && foundToken.length > 0) {
          await db.deleteRecord('tokens',
            { token: specs_token.token }
          );
        }
      } catch (err) {
        console.error(
          '\n  ~An error occurred while expiring a token~' +
          `\n    -> ${err}`
        );
        process.exit(1);
      }
    }, expireInMs);
  }
}
