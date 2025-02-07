'use client';

import React, { useState } from 'react';
import styles from './Login.module.css';
import { useGoogleLogin } from '@react-oauth/google';
import { useRouter } from 'next/navigation';
import CreateAccount from './CreateAccount';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [section, setSection] = useState<'Login' | 'CreateAccount'>('Login');
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch("http://localhost:5000/api/accounts/checkLogin", {
        method: "POST",
        credentials: 'include',
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      if (response.ok) {
        router.push("/home");
      } else {
        console.error('Authentication failed:', await response.json());
      }
    } catch (error) {
      console.error('Login error:', error);
    }
  };
  

  const handleGoogleLogin = useGoogleLogin({
    onSuccess: async (response) => {
      try {
        // Send token to your backend for verification
        const res = await fetch("http://localhost:5000/api/accounts/google/auth", {
          method: "POST",
          credentials: 'include',
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${response.access_token}`
          }
        });
        
        
        if (res.ok) {
          router.push("/home");
        }
      } catch (error) {
        console.error('Google login failed:', error);
      }
    },
    onError: (error) => console.error("Google Login Error:", error),
    scope: "openid email profile",
  });
  


  const animatedText = (text: string) =>
    text.split('').map((char, index) => (
      <span
        key={index}
        className="inline-block"
        style={{
          animation: `alternateColorSize 5s infinite`,
          animationDelay: `${index * 0.1}s`,
        }}
      >
        {char}
      </span>
    ));


  return (
    <div className={styles.loginContainer}>
      <h1 className="text-4xl font-serif mb-6 mt-3">
        {animatedText('Change Your Life')}
      </h1>

      {section === 'Login' && (
        <form
          onSubmit={handleSubmit}
          className="bg-white p-6 rounded-md shadow-md w-80 max-w-md"
        >
          <h1 className="mb-10 text-3xl text-center text-yellow-600 border-yellow-600 rounded font-serif font-bold">
            Login
          </h1>
          <label className="text-white flex justify-center bg-yellow-600 w-full border-yellow-600 rounded font-serif">
            Email
          </label>
          <input
            className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-gray-300 bg-white"
            type="text"
            placeholder="Email"
            onChange={(event) => setEmail(event.target.value)}
            value={email}
          />
          <label className="text-white flex justify-center bg-yellow-600 w-full border-yellow-600 rounded font-serif">
            Password
          </label>
          <input
            className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-gray-300 bg-white"
            type="password"
            placeholder="Password"
            onChange={(event) => setPassword(event.target.value)}
            value={password}
          />
          <button
            type="submit"
            className="w-32 text-sm mx-auto mt-6 text-center justify-center flex bg-yellow-600 text-white py-2 rounded hover:bg-yellow-700 transition-colors"
          >
            Login
          </button>
          <button
            type="button"
            className="w-32 text-sm mx-auto mt-2 text-center justify-center flex bg-yellow-600 text-white py-2 rounded hover:bg-yellow-700 transition-colors"
            onClick={() => setSection('CreateAccount')}
          >
            Create Account?
          </button>
        </form>
      )}

      {section === 'CreateAccount' && <CreateAccount />}

      {section === 'Login' && (
          <div className="mt-6 flex flex-col items-center w-80">
          <button
          onClick={() => handleGoogleLogin()}
          className="w-44 py-3 mb-4 text-white bg-yellow-700 rounded hover:bg-gray-700 transition-colors"
          >
           Sign in with Google
        </button>

        </div>
      )}
    </div>
  );
};

export default Login;
