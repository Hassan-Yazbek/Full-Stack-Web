//src/routes/accountRoutes
import express from "express"; 
import { createAccount, loginAccount, logoutAccount } from "../controller/accountController";
import passport from "passport";
import { client, findOrCreateUser, User } from "../utils/authHelpers";
import {RequestHandler } from "express";
import dotenv from 'dotenv';

dotenv.config();

const router = express.Router();

// User Authentication Routes
router.post("/create", createAccount as RequestHandler); 
router.post("/checkLogin", loginAccount as RequestHandler); 
router.post("/logout", logoutAccount as RequestHandler);

// Google OAuth Routes
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

router.get('/google/callback', passport.authenticate('google', { failureRedirect: '/login' }),
  (req, res) => {
    if (!req.user) {
      return res.redirect('/login');
    }
    res.redirect(`http://localhost:3000/home?email=${(req.user as User).email}`);
  }
);


// In accountRoutes.ts
router.post('/google/auth', async (req, res) => {
  try {
    // Verify Google token
    const ticket = await client.verifyIdToken({
      idToken: req.headers.authorization?.split(' ')[1] || '',
      audience: process.env.GOOGLE_CLIENT_ID
    });

    const payload = ticket.getPayload();
    
    // Handle user creation/login
    const user = await findOrCreateUser({
      email: payload?.email!,
      name: payload?.given_name!,
      last: payload?.family_name!
    });

    // Set session
    req.login(user, (err) => {
      if (err) throw err;
      res.status(200).json({ success: true });
    });
    
  } catch (err) {
    res.status(401).json({ error: "Invalid token" });
  }
});

router.get('/session-check', (req, res) => {
  console.log('Session:', req.session);
  res.json(req.session);
});


export default router;
