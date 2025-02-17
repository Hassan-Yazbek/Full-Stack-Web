import passport from 'passport';
import { Strategy as LocalStrategy } from 'passport-local';
import { pgPool } from '../index';
import bcrypt from 'bcryptjs';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import dotenv from 'dotenv';
import { findOrCreateUser, User } from '../utils/authHelpers';
import { request } from 'express';

dotenv.config();

// Declare custom user type
declare global {
  namespace Express {
    interface User {
      id: string;
      email: string;
      name: string;
      last: string;
    }
  }
}

passport.serializeUser((user: User, done) => {
  done(null, user.email); 
});

passport.deserializeUser(async (email: string, done) => {
  try {
    const result = await pgPool.query(
      'SELECT id, email, name, last FROM accounts WHERE email = $1',
      [email]
    );

    if (result.rows.length === 0) {
      return done(null, false);
    }

    done(null, result.rows[0]); // Make sure this returns a valid user object
  } catch (err) {
    done(err);
  }
});

// Local Strategy
// config/passportConfig.ts (Local Strategy)
passport.use(new LocalStrategy(
  { usernameField: 'email' },
  async (email, password, done) => {
    try {
      const result = await pgPool.query(
        'SELECT * FROM accounts WHERE email = $1', 
        [email]
      );

      // Check if user exists and has a password
      if (result.rows.length === 0 || !result.rows[0].password) {
        return done(null, false, { message: 'Invalid credentials' });
      }

      const isValid = await bcrypt.compare(password, result.rows[0].password);
      if (!isValid) return done(null, false, { message: 'Invalid credentials' });

      done(null, result.rows[0]);
    } catch (err) {
      done(err);
    }
  }
));

// Google Strategy
passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID!,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
  callbackURL: "http://localhost:5000/api/accounts/google/callback",
  scope: ['profile', 'email']
}, async (accessToken, refreshToken, profile, done) => {
  try {
    const email = profile.emails?.[0]?.value;
    if (!email) return done(new Error("No email found"));

    // Create user without password
    const user = await findOrCreateUser({
      email,
      name: profile.name?.givenName || '',
      last: profile.name?.familyName || ''
    });

    done(null, user);
  } catch (err) {
    done(err);
  }
}));

export default passport;
