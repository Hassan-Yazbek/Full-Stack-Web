'use client';
import React, { useState } from 'react';
import Header from "../componant/Header";
import Footer from "../componant/Footer";
import { GrAddCircle } from "react-icons/gr";
import { IoChatboxOutline } from "react-icons/io5";
import { FaTasks } from "react-icons/fa";
import { RiTeamLine } from "react-icons/ri";
import { BsCalendar2Date } from "react-icons/bs";
import AddTask from './AddTask';
import Inbox from './Inbox';
import Team from './TeamMembers';
import Tasks from './Tasks';
import TodaysWork from './TodaysWorks';
import { 
  Box, 
  Flex, 
  List, 
  ListItem, 
  Icon, 
  Text, 
} from '@chakra-ui/react';

const Home = () => {
  const [activeSection, setActiveSection] = useState<string>("Welcome");
  const handleSectionChange = (section: string) => {
    setActiveSection(section);
  };

  return (
    <Flex direction="column" minH="100vh" bg={"white"}>
      <Header page="home" />

      <Flex flex={1} mt={16}> {/* mt=16 to account for fixed header height */}
        {/* Sidebar */}
        <Box
          position="fixed"
          left={0}
          w="320px"
          h="full"
          color={"yellow.600"}
          bg={"gray.100"}
          p={5}
        >
        <Box>
          <List.Root>
            {[
              { section: "Add Task", icon: GrAddCircle },
              { section: "Inbox", icon: IoChatboxOutline },
              { section: "Tasks", icon: FaTasks },
              { section: "Team Members", icon: RiTeamLine },
              { section: "Today's Work", icon: BsCalendar2Date }
            ].map(({ section, icon }) => (
              <ListItem
                key={section}
                display="flex"
                alignItems="center"
                gap={3}
                color={"yellow.600"}
                cursor="pointer"
                mb={5}
                p={2}
                _hover={{ bg: "yellow.200", borderRadius: "md" }}
                onClick={() => handleSectionChange(section)}
              >
                <Icon as={icon} boxSize={5} />
                <Text fontSize="lg">{section}</Text>
              </ListItem>
            ))}
          </List.Root>
        </Box>

        </Box>

        {/* Main Content */}
        <Box
          ml="320px" // Match sidebar width
          flex={1}
          bg="white"
          minH="calc(100vh - 64px)" // Adjust for header height
        >
          {activeSection === "Welcome" && (
            <Text fontSize="3xl" color="yellow.600" fontWeight="bold">
              Welcome!
            </Text>
          )}
          {activeSection === "Add Task" && <AddTask />}
          {activeSection === "Inbox" && <Inbox />}
          {activeSection === "Tasks" && <Tasks />}
          {activeSection === "Team Members" && <Team />}
          {activeSection === "Today's Work" && <TodaysWork />}
        </Box>
      </Flex>

      <Footer />
    </Flex>
  );
};

export default Home;
