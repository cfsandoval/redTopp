"use client";

import { MadeWithDyad } from "@/components/made-with-dyad";
import NetworkGraph from "@/components/NetworkGraph"; // Import the new component

const Index = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 dark:bg-gray-900 p-4">
      <NetworkGraph /> {/* Render the NetworkGraph component */}
      <MadeWithDyad />
    </div>
  );
};

export default Index;