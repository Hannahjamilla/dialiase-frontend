import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import LoginRegister from "./components/Login";
import ValidateEmployee from "./components/ValidateEmployee";
// import EmployeeRegister from "./components/EmployeeRegister";
import AdminDashboard from "./pages/admin/AdminDashboard";
import PatientList from "./pages/admin/PatientList";
import HCproviderList from "./pages/admin/HCproviderList";
import AuditLogList from "./pages/admin/AuditLogList";
import StaffDashboard from "./pages/staff/StaffDashboard";
import OutpatientList from "./pages/staff/OutpatientList";
import StaffOutpatientEmailVerification from "./pages/staff/StaffOutpatientEmailVerification";
import StaffOutpatientDetailsForm from "./pages/staff/StaffOutpatientDetailsForm";  
import StaffPDTreatment from "./pages/staff/StaffPDTreatment";
import PatientScheduleList from "./pages/staff/PatientScheduleList";

import AdminHCList from "./pages/staff/staff_HCList";
import StaffPreRegister from "./pages/staff/StaffPreRegister";
import View_ScheduleList from "./pages/staff/View_ScheduleList";
// import StaffSidebar from "./pages/staff/StaffSidebar";
import PatientDashboard from "./pages/patient/PatientDashboard";
import PatientSidebar from "./pages/patient/PatientSidebar";
import TreatmentEnd from "./pages/patient/TreatmentEnd";
import TreatmentStart from "./pages/patient/TreatmentStart";
import TrackPatientRecords from "./pages/doctor/TrackPatientRecords";
import DoctorDashboard from "./pages/doctor/DoctorDashboard";
import DoctorCheckup from "./pages/doctor/DoctorCheckup";
import DoctorSidebar from "./pages/doctor/DoctorSidebar";
import ProfilePage from "./components/ProfilePage";
import HCPRegister from "./components/HCPRegister";
import Validation_EmailVerif from "./components/Validation_EmailVerif";
import ListPrescriptions from "./pages/doctor/ListPrescriptions";

import TodayCAPDEmpStat from "./pages/admin/TodayCAPDEmpStat";

import StaffDoctorsStatus from "./pages/staff/StaffDoctorsStatus";

import PatientTreatmentHistory from "./pages/patient/PatientTreatmentHistory";
import ForgotPassword from "./components/ForgotPassword";
// import ResetPassword from "./components/ResetPassword";
import PrescriptionPage from "./pages/doctor/PrescriptionPage"; // Updated import for PrescriptionPage

// import EmployeeRegister from "./components/EmployeeRegister";
// import LandingPage from "./pages/LandingPage/LandingPage";

import Home from "./components/Home.jsx";
import Navbar from "./components/Navbar.jsx";
import Features from "./components/Features";
import About from "./components/About";
import Work from "./components/Works";
import OurTeam from "./components/OurTeam";
import Contact from "./components/ContactUs";
import StaffProfile from "./pages/staff/StaffProfile";


//e-commerce part
import ManageEcom from "./pages/staff/Staff_ecommerce/ManageEcom";
import MedsProd from "./pages/patient/MedsProd";
import PatientOrders from "./pages/staff/Staff_ecommerce/PatientOrders"; // Add this import

// Import the new Doctor Prescriptions View
import DoctorPrescriptionsView from "./pages/doctor/DoctorPrescriptionsView";

import "./index.css";
import "./css/App.css";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/navbar" element={<Navbar />} />
        <Route path="/features" element={<Features />} />
        <Route path="/about" element={<About />} />
        <Route path="/how-it-works" element={<Work />} />
        <Route path="/team" element={<OurTeam />} />
        <Route path="/contact" element={<Contact />} />

        <Route path="/login" element={<LoginRegister />} />
        {/* <Route path="/LandingPage" element={<LandingPage />} /> */}
        <Route path="/ValidateEmployee" element={<ValidateEmployee />} />
        {/* <Route path="/employee-register" element={<EmployeeRegister />} /> */}

        <Route path="/admin/AdminDashboard" element={<AdminDashboard />} />
        <Route path="/admin/PatientList" element={<PatientList />} />
        <Route path="/admin/HCproviderList" element={<HCproviderList />} />
        <Route path="/admin/AuditLogList" element={<AuditLogList />} />

        <Route path="/staff/StaffDashboard" element={<StaffDashboard />} />
        <Route path="/staff/OutpatientList" element={<OutpatientList />} />
        <Route
          path="/staff/StaffOutpatientEmailVerification"
          element={<StaffOutpatientEmailVerification />}
        />
        <Route
          path="/staff/StaffOutpatientDetailsForm"
          element={<StaffOutpatientDetailsForm />}
        />
        <Route path="/staff/staff_HCList" element={<AdminHCList />} />
        <Route path="/staff/StaffPreRegister" element={<StaffPreRegister />} />
        <Route path="/staff/View_ScheduleList" element={<View_ScheduleList />} />
        {/* <Route path="/staff/StaffSidebar" element={<StaffSidebar />} /> */}
        <Route
          path="/staff/PatientScheduleList"
          element={<PatientScheduleList />}
        />
        <Route path="/staff/StaffProfile" element={<StaffProfile />} />
        <Route path="/staff/StaffPDTreatment" element={<StaffPDTreatment />} />
        <Route path="/staff/StaffDoctorsStatus" element={<StaffDoctorsStatus />} />

        {/* E-commerce Routes */}
        <Route path="/staff/Staff_ecommerce/ManageEcom" element={<ManageEcom />} />
        <Route path="/staff/patient-orders" element={<PatientOrders />} /> {/* Add this route */}
        <Route path="/medical-products" element={<MedsProd />} />

        <Route path="/patient/PatientDashboard" element={<PatientDashboard />} />
        <Route path="/patient/PatientSidebar" element={<PatientSidebar />} />
        <Route path="/patient/TreatmentEnd" element={<TreatmentEnd />} />
        <Route path="/patient/TreatmentStart" element={<TreatmentStart />} />
        <Route
          path="/patient/PatientTreatmentHistory"
          element={<PatientTreatmentHistory />}
        />

        <Route
          path="/doctor/TrackPatientRecords"
          element={<TrackPatientRecords />}
        />
        <Route path="/doctor/DoctorDashboard" element={<DoctorDashboard />} />
        <Route path="/doctor/DoctorSidebar" element={<DoctorSidebar />} />
        <Route path="/doctor/DoctorCheckup" element={<DoctorCheckup />} />
        <Route path="/doctor/ListPrescriptions" element={<ListPrescriptions />} />
        <Route path="/prescription/:patientId" element={<PrescriptionPage />} />
        
        {/* Add the new Doctor Prescriptions View route */}
        <Route path="/doctor/prescriptions" element={<DoctorPrescriptionsView />} />

        <Route path="/components/ProfilePage" element={<ProfilePage />} />
        <Route path="/HCPRegister" element={<HCPRegister />} />
        <Route
          path="/Validation_EmailVerif"
          element={<Validation_EmailVerif />}
        />

        <Route path="/ForgotPassword" element={<ForgotPassword />} />

        <Route path="/admin/TodayCAPDEmpStat" element={<TodayCAPDEmpStat />} />
        {/* <Route path="/components/EmployeeRegister" element={<EmployeeRegister />} /> */}
      </Routes>
    </Router>
  );
}

export default App;