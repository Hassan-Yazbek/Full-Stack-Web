import passport from 'passport';
import { Strategy as LocalStrategy } from 'passport-local';
import { pgPool } from '../index';
import bcrypt from 'bcryptjs';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import dotenv from 'dotenv';
import { User } from '../utils/authHelpers';

dotenv.config();

// Log the environment variables for debugging
console.log("GOOGLE_CLIENT_ID:", process.env.GOOGLE_CLIENT_ID);
console.log("GOOGLE_CLIENT_SECRET:", process.env.GOOGLE_CLIENT_SECRET);

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
passport.use(new LocalStrategy(
  {
    usernameField: 'email',
    passwordField: 'password',
  },
  async (email, password, done) => {
    try {
      const result = await pgPool.query('SELECT * FROM accounts WHERE email = $1', [email]);
      
      if (result.rows.length === 0) {
        return done(null, false, { message: 'Invalid credentials' });
      }

      const user = result.rows[0];
      const isValid = await bcrypt.compare(password, user.password);
      
      if (!isValid) {
        return done(null, false, { message: 'Invalid credentials' });
      }

      return done(null, {
        id: user.id,
        email: user.email,
        name: user.name,
        last: user.last,
      });
    } catch (err) {
      return done(err);
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
    if (!profile.emails?.[0]?.value) {
      return done(new Error("No email found in Google profile"));
    }
    
    const email = profile.emails[0].value;
    const name = profile.name?.givenName || '';
    const last = profile.name?.familyName || '';

    const result = await pgPool.query(
      `INSERT INTO accounts (email, name, last)
       VALUES ($1, $2, $3)
       ON CONFLICT (email) DO UPDATE
       SET name = EXCLUDED.name, last = EXCLUDED.last
       RETURNING id, email, name, last`,
      [email, name, last]
    );

    return done(null, result.rows[0]);
  } catch (err) {
    return done(err);
  }
}));

export default passport;
