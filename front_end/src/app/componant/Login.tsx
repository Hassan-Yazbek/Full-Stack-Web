'use client';

import React, { useState } from 'react';
import { useGoogleLogin } from '@react-oauth/google';
import { useRouter } from 'next/navigation';
import CreateAccount from './CreateAccount';
import { FormControl,FormLabel } from '@chakra-ui/form-control';
import {
  Box,
  Button,
  Center,
  Flex,
  Heading,
  Input,
  Text,
  VStack,
} from '@chakra-ui/react';
import { color } from 'framer-motion';

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
      const res = await fetch("http://localhost:5000/api/accounts/google/auth", {
        method: "POST",
        credentials: 'include',
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ code: response.code }),
      });
      if (res.ok) {
        router.push("/home");
      }
    },
    onError: (error) => console.error("Google Login Error:", error),
    flow: 'auth-code',
    scope: "openid email profile",
  });

  const animatedText = (text: string) =>
    text.split('').map((char, index) => (
      <Text
        as="span"
        key={index}
        display="inline-block"
        animation="alternateColorSize 5s infinite"
        animationDelay={`${index * 0.1}s`}
        color="white"
      >
        {char}
      </Text>
    ));

  return (
    <Flex
      direction="column"
      align="center"
      justify="center"
      minH="100vh"
      bgImage="url('/back.png')"
      bgSize="cover"
      bgRepeat="no-repeat"
      p={4}
    >
      <Heading as="h1" fontSize={"4xl"} size="4xl" mb={6} fontFamily="serif">
        {animatedText('Change Your Life')}
      </Heading>

      <Center w="full">
        {section === 'Login' ? (
          <Box
            as="form"
            onSubmit={handleSubmit}
            bg="white"
            p={6}
            color={"black"}
            rounded="lg"
            shadow="lg"
            w="1/5"
          >
            <VStack>
              <Heading size="xl" fontSize={"2xl"} textAlign="center" color="yellow.600">
                Login
              </Heading>

              <FormControl>
                <FormLabel>Email</FormLabel>
                <Input
                  type="email"
                  color="black"
                  placeholder="Email"
                  _placeholder={{ color: "white" }}
                  bg={"gray.300"}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </FormControl>

              <FormControl>
                <FormLabel>Password</FormLabel>
                <Input
                  color={"black"}
                  type="password"
                  bg={"gray.300"}
                  placeholder="Password"
                  _placeholder={{ color: "white" }}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </FormControl>

              <Button
                mt={"10%"}
                type="submit"
                color={"white"}
                bg="yellow.600"
                width="full"
              >
                Login
              </Button>

              <Button
                variant="outline"
                color={"white"}
                bg="yellow.600"
                width="full"
                onClick={() => setSection('CreateAccount')}
              >
                Create Account?
              </Button>
            </VStack>
          </Box>
        ) : (
          <CreateAccount setSection={setSection} />
        )}
      </Center>

      {section === 'Login' && (
        <Center mt={6} w="full">
          <Button
            onClick={() => handleGoogleLogin()}
            bg="yellow.600"
            w="1/5"
          >
            Sign in with Google
          </Button>
        </Center>
      )}
    </Flex>
  );
};

export default Login;