"use client";

import React from 'react';
import { Box, Heading, Text, VStack, Link } from '@chakra-ui/react';
import Header from '../componant/Header';

const About = () => {
  return (
    <Box p={8} maxW="800px" mx="auto">
      <VStack align="start">
        <Heading as="h1" size="2xl" color="yellow.600">
          About Task Manager
        </Heading>
        <Text fontSize="lg" lineHeight="tall">
          Welcome to <strong>Task Manager</strong>, your go-to app for managing tasks, collaborating with your team, and staying organized. Whether you're working on personal projects or coordinating with a team, Task Manager helps you stay on top of your tasks and deadlines.
        </Text>
        <Text fontSize="lg" lineHeight="tall">
          With features like task creation, team collaboration, and daily work tracking, Task Manager is designed to simplify your workflow and boost productivity. You can easily add tasks, assign them to team members, and track progress in real-time.
        </Text>
        <Text fontSize="lg" lineHeight="tall">
          Our mission is to help you <strong>change your life</strong> by making task management effortless and enjoyable. Start using Task Manager today and take control of your tasks!
        </Text>
        <Text fontSize="lg" lineHeight="tall">
          For any questions or feedback, feel free to <Link href="/contact" color="yellow.600" textDecoration="underline">contact us</Link>.
        </Text>
      </VStack>
    </Box>
  );
};

export default About;