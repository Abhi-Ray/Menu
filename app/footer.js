import React from 'react';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <div className="w-full p-2 text-center mt-4" style={{ backgroundColor: "#f0eae5" }}>
   <p>
  &copy; {currentYear} <a href="https://www.zerogroup.in/" target="_blank" rel="noopener noreferrer">ZeroGroup</a>. 
  All rights reserved.
</p>


    </div>
  );
}

export default Footer;
