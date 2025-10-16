import React from "react";
import {
  FaShieldAlt,
  FaChartLine,
  FaUserMd,
  FaMobileAlt,
} from "react-icons/fa";

const features = [
  {
    icon: <FaShieldAlt className="feature-icon" aria-hidden="true" />,
    title: "Secure Data Tracking",
    description:
      "Your health data is encrypted and protected with enterprise-grade security measures.",
  },
  {
    icon: <FaChartLine className="feature-icon" aria-hidden="true" />,
    title: "Real-time Records",
    description: "Monitor your treatment progress with up-to-date records and visualizations.",
  },
  {
    icon: <FaUserMd className="feature-icon" aria-hidden="true" />,
    title: "Doctor Connect",
    description:
      "Share your reports directly with your healthcare provider for remote monitoring.",
  },
  {
    icon: <FaMobileAlt className="feature-icon" aria-hidden="true" />,
    title: "Mobile Friendly",
    description:
      "Access all features on your smartphone with our intuitive mobile interface.",
  },
];

const Features = () => {
  return (
    <section id="features" className="features-section">
      <div className="features-header">
        <h2 className="features-title">
          Powerful Features for <span className="highlight">Your Care</span>
        </h2>
        <p className="features-subtitle">
          DialiEase provides comprehensive tools to manage your CAPD treatment
          with confidence.
        </p>
      </div>

      <div className="features-wrapper">
        <div className="features-grid">
          {features.map((feature, index) => (
            <div className="feature-card" key={index}>
              <div className="feature-icon-container">{feature.icon}</div>
              <h3 className="feature-name">{feature.title}</h3>
              <p className="feature-description">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;