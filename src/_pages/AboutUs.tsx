import React from 'react';
import Navbar from '@/components/layout/Navbar';

const AboutUs = () => {
  return (
    <div>
      <Navbar />
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-4">About Us</h1>
        <p>
          Welcome to our app! We provide an efficient and reliable ride-hailing service.
          Our mission is to connect passengers with drivers seamlessly and securely.
        </p>
      </div>
    </div>
  );
};

export default AboutUs;
