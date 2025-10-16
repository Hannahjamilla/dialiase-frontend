import React from "react";
import { IoMdCheckmarkCircleOutline } from "react-icons/io";

const steps = [
  {
    title: "Download the App",
    description:
      "Get DialiEase from the App Store or Google Play and install it on your mobile device.",
  },
  {
    title: "Create an Account",
    description:
      "Sign up with your email address or mobile number and set a secure password.",
  },
  {
    title: "Set Up Your Dialysis Profile",
    description:
      "Enter your CAPD schedule, fluid volumes, and other personalized health data.",
  },
  {
    title: "Track & Log Sessions",
    description:
      "Easily log each dialysis session, monitor your vitals, and track fluid balance in real time.",
  },
  {
    title: "Receive Reminders & Alerts",
    description:
      "Get automatic notifications for your next dialysis session, supply checks, and hydration tips.",
  },
  {
    title: "Connect with Your Healthcare Team",
    description:
      "Share reports with your doctors or caregivers for better monitoring and coordination.",
  },
];

const Work = () => {
  return (
    <section id="how-it-works" className="how-section">
      <div className="how-container">
        <h2 className="how-title">
          How <span className="highlight">It Works</span>
        </h2>

        <p className="how-description">
          Follow these simple steps to get started with DialiEase and manage
          your dialysis journey more efficiently.
        </p>

        <div className="how-steps">
          {steps.map((step, index) => (
            <div className="how-step" key={index} aria-label={`Step ${index + 1}: ${step.title}`}>
              <div className="step-icon">
                <IoMdCheckmarkCircleOutline aria-hidden="true" />
              </div>
              <div>
                <h3 className="step-title">
                  Step {index + 1}: {step.title}
                </h3>
                <p className="step-text">{step.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Work;