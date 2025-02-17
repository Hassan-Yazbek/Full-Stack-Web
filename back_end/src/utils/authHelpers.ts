//src/utils/authHelpers.ts
import { pgPool } from '../index';
import { OAuth2Client } from 'google-auth-library';
import bcrypt from "bcrypt"

// Initialize Google Auth Client
export const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// User interface
export interface User {
  id: string;
  email: string;
  name: string;
  last: string;
}

// utils/authHelpers.ts
export const findOrCreateUser = async (userData: {
  email: string;
  name: string;
  last: string;
  password?: string; // Make password optional
}) => {
  // For Google OAuth users (no password)
  if (!userData.password) {
    const result = await pgPool.query(
      `INSERT INTO accounts (email, name, last, password)
       VALUES ($1, $2, $3, NULL)
       ON CONFLICT (email) DO UPDATE
       SET name = EXCLUDED.name, last = EXCLUDED.last
       RETURNING id, email, name, last`,
      [userData.email, userData.name, userData.last]
    );
    return result.rows[0];
  }

  // For regular email/password users
  const hashedPassword = await bcrypt.hash(userData.password, 10);
  const result = await pgPool.query(
    `INSERT INTO accounts (email, name, last, password)
     VALUES ($1, $2, $3, $4)
     ON CONFLICT (email) DO UPDATE
     SET name = EXCLUDED.name, last = EXCLUDED.last
     RETURNING id, email, name, last`,
    [userData.email, userData.name, userData.last, hashedPassword]
  );

  return result.rows[0];
};