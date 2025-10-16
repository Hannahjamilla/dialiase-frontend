import React from "react";

const ContactUs = () => {
  return (
    <section id="contact" className="contact-section">
      <div className="contact-container">
        <h2 className="contact-title">
          Contact <span className="highlight">Us</span>
        </h2>

        <p className="contact-intro">
          Got questions, feedback, or just want to say hello? We'd love to hear
          from you! Fill out the form below or reach us directly through our
          contact details.
        </p>

        <form className="contact-form">
          <div className="form-row">
            <input type="text" placeholder="Your Name" required />
            <input type="email" placeholder="Your Email" required />
          </div>
          <input type="text" placeholder="Subject" required />
          <textarea rows="5" placeholder="Your Message" required></textarea>
          <div className="form-submit">
            <button type="submit">Send Message</button>
          </div>
        </form>

        <div className="contact-footer">
          You can also reach us at:{" "}
          <a href="mailto:support@dialiease.com">support@dialiease.com</a>
        </div>
      </div>
    </section>
  );
};

export default ContactUs;
