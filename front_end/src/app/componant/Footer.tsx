import React from "react";

const Footer: React.FC = () => {
  return (
    <footer className="z-10 bg-yellow-800 text-white py-4 px-6 text-center font-serif">
      <p className="text-sm">
        &copy; {new Date().getFullYear()} Task Manager. All rights reserved.
      </p>
    </footer>
  );
};

export default Footer;
