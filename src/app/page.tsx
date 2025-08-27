import React from "react";
import Image from "next/image";
import "@/styles/brand.css";

const Home = () => {
  return (
    <div className="min-h-screen brand-bg-primary flex items-center justify-center">
      <div className="text-center">
        <Image
          src="/clickclick_logo.png"
          alt="Click Click Photobooth Cafe"
          width={400}
          height={160}
          className="brand-logo mx-auto"
          priority
        />
      </div>
    </div>
  );
};

export default Home;
