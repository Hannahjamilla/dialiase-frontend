import React from "react";

const About = () => {
  return (
    <section id="about" className="about-section">
      <div className="about-container">
        <h2 className="about-title">
          About <span className="highlight">Us</span>
        </h2>

        <p className="about-description">
          DialiEase is a smart companion for individuals undergoing Continuous
          Ambulatory Peritoneal Dialysis (CAPD). Our mission is to simplify the
          dialysis journey by connecting patients to tools that help them track,
          monitor, and stay informed about their health—all in one place.
        </p>

        <div className="about-cards">
          <div className="about-card">
            <h3 className="card-title">Our Vision</h3>
            <p className="card-text">
              To empower every dialysis patient with technology that enables
              self-management and a better quality of life.
            </p>
          </div>

          <div className="about-card">
            <h3 className="card-title">Our Mission</h3>
            <p className="card-text">
              To provide reliable tools, accessible support, and seamless
              integration between home-based care and healthcare providers.
            </p>
          </div>

          <div className="about-card">
            <h3 className="card-title">Why DialiEase?</h3>
            <p className="card-text">
              Because we believe that managing dialysis shouldn't be
              complicated. With DialiEase, you're in control.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default About;