'use client';

import React, { useState } from 'react';
import { useGoogleLogin } from '@react-oauth/google';
import { useRouter } from 'next/navigation';
import CreateAccount from './CreateAccount';
import { FormControl } from '@chakra-ui/form-control';
import {Center, Flex} from '@chakra-ui/react';
import {FormLabel} from '@chakra-ui/form-control'
import {useColorModeValue} from '@chakra-ui/color-mode'
import {
  Box,
  Button,
  Heading,
  Input,
  Text,
  VStack,
} from '@chakra-ui/react';
import { url } from 'inspector';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [section, setSection] = useState<'Login' | 'CreateAccount'>('Login');
  const router = useRouter();
  const [bgColor, setBgColor] = useState("yellow.600");

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
      >
        {char}
      </Text>
    ));

    const handleHover = () => {
      setBgColor("yellow.500");
    };

    const handleLeave= ()=>{
      setBgColor("yellow.600")
    }




  return (
      // <Box

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

      
      <Heading as="h1" size="4xl" fontSize={"4xl"} mb={6} fontFamily="serif">
        {animatedText('Change Your Life')}
      </Heading>

      {section === 'Login' && (
        <Box
          as="form"
          onSubmit={handleSubmit}
          p="4"
          rounded="md"
          shadow="md"
          w="1/4"

        >
          <Heading as="h2" size="3xl" mb={6} textAlign="center" color="white" fontSize={"4xl"} fontFamily="serif">
            Login
          </Heading>
          <VStack w={"full"} >
            <FormControl w={"inherit"}>
              <Heading  bg={"yellow.600"} fontSize={"2xl"} fontFamily="serif">Email</Heading>
              <Input
                color={"black"}
                type="email"
                placeholder="Email"
                w={"full"}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </FormControl>
            <FormControl w={"inherit"}>
              <Heading bg={"yellow.600"} fontSize={"2xl"} fontFamily="serif">Password</Heading>
              <Input
                color={"black"}
                type="password"
                placeholder="Password"
                bg={bgColor}
                value={password}
                w={"full"}
                onChange={(e) => setPassword(e.target.value)}
                _placeholder={{ color: "inherit" }}
              />
            </FormControl>
            <Button
              type="submit"
              colorScheme="yellow"
              bg="yellow.600"
              w="36"
              mt={6}
              _hover={{ bg: "yellow.500" }}
            >
              Login
            </Button>
            <Button
              type="button"
              variant="outline"
              bg="yellow.600"
              w="36"
              onClick={() => setSection('CreateAccount')}
              _hover={{ bg: "yellow.500" }}
            >
              Create Account?
            </Button>
          </VStack>
        </Box>
      )}

      {section === 'CreateAccount' && <CreateAccount />}

      {section === 'Login' && (
        <Flex mt={6} w="full" maxW="md" justify="center">
          <Button
            onClick={() => handleGoogleLogin()}
            bg="yellow.600"
            w="44"
            mb={4}
            _hover={{ bg: "yellow.500" }}
          >
            Sign in with Google
          </Button>
        </Flex>
      )}
    </Flex>

  );
};

export default Login;