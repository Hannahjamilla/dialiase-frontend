import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { FaEnvelope, FaShieldAlt, FaUser } from "react-icons/fa";
import { FiAlertCircle } from "react-icons/fi";
import axios from "axios";

const styles = {
  container: {
    maxWidth: "600px",
    margin: "30px auto",
    padding: "30px",
    backgroundColor: "#fff",
    borderRadius: "10px",
    boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
    fontFamily: "Arial, sans-serif",
  },
  infoBox: {
    backgroundColor: "#ebf4ff",
    borderLeft: "5px solid #2b6cb0",
    padding: "20px",
    borderRadius: "8px",
    marginBottom: "24px",
  },
  sectionTitle: {
    fontSize: "18px",
    fontWeight: "600",
    color: "#2b6cb0",
    display: "flex",
    alignItems: "center",
    gap: "8px",
    marginBottom: "12px",
  },
  label: {
    fontWeight: "500",
    fontSize: "14px",
    color: "#4a5568",
    marginBottom: "6px",
  },
  inputWrapper: {
    position: "relative",
    marginBottom: "18px",
  },
  input: (hasError) => ({
    width: "100%",
    padding: "10px 12px 10px 36px",
    fontSize: "14px",
    border: `1px solid ${hasError ? "#e53e3e" : "#cbd5e0"}`,
    borderRadius: "6px",
    outline: "none",
    boxShadow: `0 0 0 2px ${hasError ? "#fed7d7" : "transparent"}`,
  }),
  icon: {
    position: "absolute",
    left: "10px",
    top: "50%",
    transform: "translateY(-50%)",
    color: "#a0aec0",
  },
  errorText: {
    color: "#e53e3e",
    fontSize: "12px",
    marginTop: "4px",
  },
  alertBox: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    backgroundColor: "#fff5f5",
    color: "#c53030",
    border: "1px solid #fed7d7",
    padding: "12px",
    borderRadius: "6px",
    marginBottom: "16px",
    fontSize: "14px",
  },
  stepTitle: {
    display: "flex",
    alignItems: "center",
    fontSize: "20px",
    fontWeight: "600",
    color: "#2d3748",
    marginBottom: "20px",
    gap: "12px",
  },
  stepBadge: {
    width: "30px",
    height: "30px",
    backgroundColor: "#ebf8ff",
    color: "#2b6cb0",
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "14px",
    fontWeight: "bold",
  },
  paragraph: {
    fontSize: "14px",
    color: "#4a5568",
    marginTop: "6px",
  },
  button: (color) => ({
    backgroundColor: color,
    color: "#fff",
    fontWeight: "500",
    fontSize: "14px",
    padding: "10px 20px",
    borderRadius: "6px",
    border: "none",
    cursor: "pointer",
    transition: "background-color 0.3s",
    marginTop: "10px",
    boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
  }),
  grid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "16px",
    fontSize: "14px",
  },
  gridItem: {
    color: "#2d3748",
  },
};

function Validation_EmailVerif({
  formData,
  setFormData,
  setStep,
  setOtpSent,
  setOtpVerified,
  errors,
  setErrors,
  isLoading,
  setIsLoading,
  apiError,
  setApiError,
  otpSent,
}) {
  const location = useLocation();
  const navigate = useNavigate();
  const [userData, setUserData] = useState(null);
  const [currentEmail, setCurrentEmail] = useState("");

  useEffect(() => {
    if (location.state?.userData) {
      setUserData(location.state.userData);
      setCurrentEmail(location.state.userData.current_email || "");
    } else {
      navigate("/validate-employee");
    }
  }, [location.state, navigate]);

  const validateEmailStep = () => {
    const newErrors = {};
    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Invalid email format";
    } else if (formData.email === currentEmail) {
      newErrors.email = "This is already your current email";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateOTPStep = () => {
    const newErrors = {};
    if (!formData.otp.trim()) {
      newErrors.otp = "OTP is required";
    } else if (!/^[0-9]{6}$/.test(formData.otp)) {
      newErrors.otp = "OTP must be 6 digits";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSendOTP = async () => {
    if (!validateEmailStep()) return;
    setIsLoading(true);
    setApiError("");
    try {
      const response = await axios.post("/send-otp", {
        email: formData.email,
        employeeNumber: userData.employeeNumber,
      });

      if (response.data.success) {
        setOtpSent(true);
      } else {
        throw new Error(response.data.message || "Failed to send OTP");
      }
    } catch (error) {
      setApiError(error.response?.data?.message || "Failed to send OTP.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOTP = async () => {
    if (!validateOTPStep()) return;
    setIsLoading(true);
    setApiError("");
    try {
      const response = await axios.post("/verify-otp", {
        email: formData.email,
        employeeNumber: userData.employeeNumber,
        otp: formData.otp,
      });

      if (response.data.success) {
        setOtpVerified(true);
        setStep(2);
        setCurrentEmail(formData.email);
      } else {
        throw new Error(response.data.message || "OTP verification failed");
      }
    } catch (error) {
      let errorMessage = "OTP verification failed.";
      if (error.response?.status === 422) {
        const errors = error.response.data.errors;
        errorMessage = Object.values(errors).flat().join(" ");
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }
      setApiError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  if (!userData) return null;

  const getFullName = () => {
    const firstName = userData.first_name || userData.firstName || "";
    const lastName = userData.last_name || userData.lastName || "";
    return `${firstName} ${lastName}`.trim() || "Not available";
  };

  return (
    <div style={styles.container}>
      <div style={styles.infoBox}>
        <div style={styles.sectionTitle}>
          <FaUser /> Employee Information
        </div>
        {currentEmail && (
          <p style={styles.paragraph}>
            <strong>Current Email:</strong> {currentEmail}
          </p>
        )}
        <div style={styles.grid}>
          <div style={styles.gridItem}>
            <p style={styles.label}>Employee Name</p>
            <p>{getFullName()}</p>
          </div>
          <div style={styles.gridItem}>
            <p style={styles.label}>Employee Number</p>
            <p>{userData.employeeNumber || "Not available"}</p>
          </div>
        </div>
        <p style={styles.paragraph}>
          {otpSent
            ? "Enter the 6-digit verification code we sent to your new email."
            : "Provide your new email address for verification and updates."}
        </p>
      </div>

      <div style={styles.stepTitle}>
        <div style={styles.stepBadge}>1</div>
        {otpSent ? "Verify New Email" : "Update Email Address"}
      </div>

      {apiError && (
        <div style={styles.alertBox}>
          <FiAlertCircle /> <span>{apiError}</span>
        </div>
      )}

      <div style={styles.inputWrapper}>
        <label style={styles.label}>
          New Email Address <span style={{ color: "red" }}>*</span>
        </label>
        <div style={{ position: "relative" }}>
          <FaEnvelope style={styles.icon} />
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="your@new-email.com"
            disabled={otpSent || isLoading}
            style={styles.input(errors.email)}
          />
        </div>
        {errors.email && <p style={styles.errorText}>{errors.email}</p>}
      </div>

      {otpSent && (
        <div style={styles.inputWrapper}>
          <label style={styles.label}>
            Verification Code <span style={{ color: "red" }}>*</span>
          </label>
          <div style={{ position: "relative" }}>
            <FaShieldAlt style={styles.icon} />
            <input
              type="text"
              name="otp"
              placeholder="Enter 6-digit code"
              value={formData.otp}
              onChange={handleChange}
              disabled={isLoading}
              style={styles.input(errors.otp)}
            />
          </div>
          {errors.otp && <p style={styles.errorText}>{errors.otp}</p>}
          <p style={styles.paragraph}>
            We've sent a 6-digit code to <strong>{formData.email}</strong>.
            Please check your inbox or spam folder.
          </p>
        </div>
      )}

      <div style={{ textAlign: "right" }}>
        {!otpSent ? (
          <motion.button
            onClick={handleSendOTP}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            disabled={isLoading}
            style={styles.button("#2b6cb0")}
          >
            {isLoading ? "Sending..." : "Send Verification Code"}
          </motion.button>
        ) : (
          <motion.button
            onClick={handleVerifyOTP}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            disabled={isLoading}
            style={styles.button("#38a169")}
          >
            {isLoading ? "Verifying..." : "Verify Code"}
          </motion.button>
        )}
      </div>
    </div>
  );
}

export default Validation_EmailVerif;
