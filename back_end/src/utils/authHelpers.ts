//src/utils/authHelpers.ts
import { pgPool } from '../index';
import { OAuth2Client } from 'google-auth-library';

// Initialize Google Auth Client
export const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// User interface
export interface User {
  id: string;
  email: string;
  name: string;
  last: string;
}

// Find or create user function
export const findOrCreateUser = async (userData: {
  email: string;
  name: string;
  last: string;
}): Promise<User> => {
  const { email, name, last } = userData;
  
  const result = await pgPool.query(
    `INSERT INTO accounts (email, name, last)
     VALUES ($1, $2, $3)
     ON CONFLICT (email) DO UPDATE
     SET name = EXCLUDED.name, last = EXCLUDED.last
     RETURNING id, email, name, last`, // Removed trailing comma
    [email, name, last]
  );

  return result.rows[0];
};