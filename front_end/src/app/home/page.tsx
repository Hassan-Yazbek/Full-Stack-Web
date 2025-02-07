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

const Home = () => {
  const [activeSection, setActiveSection] = useState<string>("Welcome");

  // Handler to switch between sections
  const handleSectionChange = (section: string) => {
    setActiveSection(section);
  };

  return (
    <div>
      <main className="relative flex flex-col min-h-screen">
        {/* Header */}
        <Header />

        <div className=" flex-grow flex">
          {/* Sidebar */}
          <div className="mt-16 fixed bg-gray-200 w-80 h-full float-left">
            <ul className="pl-5">
              <li
                className="flex  gap-2 text-yellow-600 hover:text-yellow-800 cursor-pointer p-5"
                onClick={() => handleSectionChange("Add Task")}
              >
                <GrAddCircle size={20} />
                <span>Add Task</span>
              </li>
              <li
                className="flex  gap-2 text-yellow-600 hover:text-yellow-800 cursor-pointer p-5"
                onClick={() => handleSectionChange("Inbox")}
              >
                <IoChatboxOutline size={20} />
                <span>Inbox</span>
              </li>
              <li
                className="flex  gap-2 text-yellow-600 hover:text-yellow-800 cursor-pointer p-5"
                onClick={() => handleSectionChange("Tasks")}
              >
                <FaTasks size={20} />
                <span>Tasks</span>
              </li>
              <li
                className="flex  gap-2 text-yellow-600 hover:text-yellow-800 cursor-pointer p-5"
                onClick={() => handleSectionChange("Team Members")}
              >
                <RiTeamLine size={20} />
                <span>Team Members</span>
              </li>
              <li
                className="flex  gap-2 text-yellow-600 hover:text-yellow-800 cursor-pointer p-5"
                onClick={() => handleSectionChange("Today's Work")}
              >
                <BsCalendar2Date size={20} />
                <span>Today's Work</span>
              </li>
            </ul>
          </div>

          <div className="mt-16  ml-80 bg-yellow-500 flex flex-grow">
            {activeSection === "Welcome" && (
              <h1 className="text-yellow-600 text-3xl">Welcome!</h1>
            )}
            {activeSection === "Add Task" && <AddTask />}
            {activeSection === "Inbox" && <Inbox />}
            {activeSection === "Tasks" && <Tasks />} 
            {activeSection === "Team Members" && <Team />}
            {activeSection === "Today's Work" && (
              <h1 className="text-yellow-600 text-3xl">Today's Work</h1>
            )}
          </div>
        </div>

        {/* Footer */}
        <Footer  />
      </main>
    </div>
  );
};

export default Home;
