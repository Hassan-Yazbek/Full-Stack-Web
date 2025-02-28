"use client"; // Add this directive for client-side hooks

import React from 'react';
import { Box, Flex, Heading, Link, Button } from '@chakra-ui/react';
import { useAuth } from '../AuthContext'; // Import useAuth

interface HeaderProps {
  page: 'login' | 'home'; // Add this prop to specify the page
}


const Header: React.FC<HeaderProps> = ({ page }) => {
  const { isLoggedIn, logout } = useAuth(); // Use the hook

  return (
    <Box
      as="header"
      position="fixed"
      top="0"
      left="0"
      right="0"
      bg="yellow.600"
      color="white"
      py={4}
      px={6}
      boxShadow="md"
      fontFamily="serif"
    >
      <Flex justify="space-between" align="center">
        <Heading as="h1" size="lg">
          Task Manager
        </Heading>
        <nav>
          <Flex as="ul" listStyleType="none" >
            {page === 'login' ? ( // If it's the login page, show only "About"
              <li>
                <Link href="/about" _hover={{ textDecoration: "underline" }} mx={2}>
                  About
                </Link>
              </li>
            ) : ( // If it's the home page, show "Request", "About", and "Logout"
              <>
                <li>
                  <Link href="/request" _hover={{ textDecoration: "underline" }} mx={2}>
                    Request
                  </Link>
                </li>
                <li>
                  <Link href="/about" _hover={{ textDecoration: "underline" }} mx={2}>
                    About
                  </Link>
                </li>
                <li>
                  <Link href='/' onClick={logout} _hover={{ textDecoration: "underline" }} mx={2}>
                    Logout
                  </Link>
                </li>
              </>
            )}
          </Flex>
        </nav>
      </Flex>
    </Box>
  );
};

export default Header;