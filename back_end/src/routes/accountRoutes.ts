//src/routes/accountRoutes
import { Request, Response, Router, RequestHandler } from 'express';
import { createAccount, loginAccount, logoutAccount } from "../controller/accountController";
import passport, { use } from "passport";
import { findOrCreateUser, User } from "../utils/authHelpers";
import { OAuth2Client } from 'google-auth-library';
import dotenv from 'dotenv';
import { pgPool } from '..';

dotenv.config();

const router = Router();

// User Authentication Routes
router.post("/create", createAccount as RequestHandler); 
router.post("/checkLogin", loginAccount as RequestHandler); 
router.post("/logout", logoutAccount as RequestHandler);

router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

// Handle the Google OAuth callback
router.get('/google/callback', passport.authenticate('google', { failureRedirect: '/login' }),
  (req, res) => {
    if (!req.user) {
      return res.redirect('/login');
    }
    res.redirect(`http://localhost:3000/home?email=${req.session.user?.email}`);
  }
);


// In accountRoutes.ts

const client = new OAuth2Client(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
'postmessage'
);
router.post('/google/auth', (async (req: Request, res: Response) => {
  try {
    const { code } = req.body;
    
    if (!code) {
      return res.status(401).json({ error: "No authorization code provided" });
    }

    // Token exchange and validation
    const { tokens } = await client.getToken(code);
    const ticket = await client.verifyIdToken({
      idToken: tokens.id_token!,
      audience: process.env.GOOGLE_CLIENT_ID!,
    });
    const payload = ticket.getPayload();

    if (!payload?.email) {
      return res.status(400).json({ error: "Invalid Google payload" });
    }

    // User creation
    const user = await findOrCreateUser({
      email: payload.email,
      name: payload.given_name || '',
      last: payload.family_name || ''
    });
    const checkEmail = await pgPool.query(
      "SELECT EXISTS(SELECT 1 FROM teams WHERE teamleaderemail = $1)", 
      [payload.email]
    );
    
    if (!checkEmail.rows[0].exists) { // Email does not exist
      const client1 = await pgPool.connect();
      
      try {
        await client1.query('BEGIN');
        
        // Insert into teams and get teamid
        const teamResult = await client1.query(
          'INSERT INTO teams (teamleaderemail, teamname) VALUES ($1, $2) RETURNING teamid',
          [user.email, "My Tasks"]
        );
    
        // Insert into team_members using returned teamid
        await client1.query(
          'INSERT INTO team_members (teamid, memberemail) VALUES ($1, $2)',
          [teamResult.rows[0].teamid, user.email]
        );
    
        await client1.query('COMMIT');
      } catch (error) {
        await client1.query('ROLLBACK'); // Rollback on error
        console.error("Transaction failed:", error);
      } finally {
        client1.release(); // Release client back to pool
      }
    }
    
    // Session handling
    req.login(user, (err) => {
      if (err) {
        console.error('Login error:', err);
        return res.status(500).json({ error: "Login failed" });
      }
      
      // Type-safe session assignment
      req.session.user = {
        id: user.id,
        email: user.email,
        name: user.name,
        last: user.last
      };
      
      // Explicit session save
      req.session.save((err) => {
        if (err) {
          console.error('Session save error:', err);
          return res.status(500).json({ error: "Session persistence failed" });
        }
        res.status(200).json({ success: true });
      });
    });
  } catch (err) {
    console.error('Google auth error:', err);
    res.status(500).json({ error: "Authentication failed" });
  }
}) as RequestHandler);

router.get('/session-check', (req, res) => {
  console.log('Session:', req.session.user);
  res.json(req.session);
});


export default router;
