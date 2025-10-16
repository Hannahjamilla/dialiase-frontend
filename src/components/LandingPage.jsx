import React from "react";
import Navbar from "./Navbar";
import Home from "./Home";
import Features from "./Features";
import About from "./About";
import Work from "./Works";
import OurTeam from "./OurTeam";
import Contact from "./ContactUs";

const LandingPage = () => {
  return (
    <div className="landing-page">
      <Navbar />
      <Home />
      <Features />
      <About />
      <Work />
      <OurTeam />
      <Contact />
    </div>  
  );
};

export default LandingPage;