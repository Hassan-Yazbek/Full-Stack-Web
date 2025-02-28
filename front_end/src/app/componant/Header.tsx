import React from "react";

const Header: React.FC = () => {
  return (
    <header className="fixed inset-0 h-fit bg-yellow-600 text-white py-4 px-6 flex justify-between items-center shadow-md font-serif">
      <h1 className="text-2xl font-bold">Task Manager</h1>
      <nav>
        <ul className="flex space-x-4">
          <li>
            <a href="/" className="hover:underline">
              Home
            </a>
          </li>
          <li>
            <a href="./Tasks" className="hover:underline">
              Tasks
            </a>
          </li>
          <li>
            <a href="/about" className="hover:underline">
              About
            </a>
          </li>
        </ul>
      </nav>
    </header>
  );
};

export default Header;
