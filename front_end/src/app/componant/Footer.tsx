import React, { useEffect, useState } from "react";

const Footer: React.FC = () => {
  const [year, setYear] = useState<number | null>(null);

  useEffect(() => {
    setYear(new Date().getFullYear());
  }, []);

  return (
    <footer className="z-10 bg-yellow-800 text-white py-4 px-6 text-center font-serif">
      <p className="text-sm">
        &copy; {year ?? "2024"} Task Manager. All rights reserved.
      </p>
    </footer>
  );
};

export default Footer;
