import React from "react";
import Navbar from "../../components/Navbar/Navbar";
import Hero from "../../components/Hero/Hero";
import Features from "../../components/Features/Features";
import AboutUs from "../../components/AboutUs/AboutUs";
import OurTeam from "../../components/OurTeam/OurTeam";
import ContactUs from "../../components/ContactUs/ContactUs";
import HowItWorks from "../../components/HowItWorks/HowItWorks";



export default function LandingPage() {
  return (
    <div className="flex flex-col">
      <Navbar />
      <Hero />
      <Features />
      <HowItWorks />
      <AboutUs />
      <OurTeam />
      <ContactUs />
      {/* Add more sections here as needed */}
      <div className="h-screen">
        {" "}
        {/* Ensures enough content to scroll */}
        {/* Your other content */}
      </div>
    </div>
  );
}
