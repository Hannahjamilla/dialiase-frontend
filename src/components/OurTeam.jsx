import React from "react";
import team1 from "../assets/images/rhizza.jpg";
import team2 from "../assets/images/alliah.jpg";
import team3 from "../assets/images/hannah.jpg";

const OurTeam = () => {
  return (
    <section id="team" className="team-section">
      <div className="team-container">
        <h2 className="team-title">
          Our <span className="highlight">Team</span>
        </h2>

        <p className="team-intro">
          Meet the passionate individuals behind DialiEase—committed to making
          the dialysis experience smoother, smarter, and more supportive for
          patients everywhere.
        </p>

        <div className="team-grid">
          <div className="team-card">
            <img 
              src={team1} 
              alt="Rhizza Mae Discaya" 
              className="team-image" 
              loading="lazy" 
            />
            <h3 className="team-name">Rhizza Mae Discaya</h3>
            <p className="team-role">UI/UX Designer</p>
            <p className="team-desc">
              Designs seamless and accessible user interfaces focused on
              healthcare usability. Ensures DialiEase remains intuitive and
              patient-friendly.
            </p>
          </div>

          <div className="team-card">
            <img 
              src={team2} 
              alt="Alliah Tolentino" 
              className="team-image" 
              loading="lazy" 
            />
            <h3 className="team-name">Alliah Tolentino</h3>
            <p className="team-role">Mobile Backend Developer</p>
            <p className="team-desc">
              Responsible for building the mobile infrastructure that powers
              data processing and secure communication between patients and the
              server.
            </p>
          </div>

          <div className="team-card">
            <img
              src={team3}
              alt="Hannah Jamilla Peralta"
              className="team-image"
              loading="lazy"
            />
            <h3 className="team-name">Hannah Jamilla Peralta</h3>
            <p className="team-role">Web Backend Developer</p>
            <p className="team-desc">
              Develops and maintains the backend systems that store and manage
              patient logs, doctor access, and analytics across the web
              platform.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default OurTeam;