// "use client";

import React from "react";
import HeroSection from "./HeroSection";
// import SearchSection from "./Searchsection";
import DynamicContentSection from "./DynamiccontentSection";
import SearchSection from "./Searchsection";
// import HeroSection from "./sections/HeroSection";
// import SearchSection from "./sections/SearchSection";
// import DynamicContentSection from "./sections/DynamicContentSection";

export default function HomePage() {
  return (
    <div className="relative overflow-hidden">
      {/* Part 1: Static Hero Section */}
      <HeroSection />

      Part 2: Dynamic Search & Categories Section
      {/* <SearchSection /> */}

      {/* Part 3: Dynamic Featured Content & Features Section */}
      {/* <DynamicContentSection /> */}
    </div>
  );
}