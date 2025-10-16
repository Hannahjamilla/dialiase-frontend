import React from 'react';
import TabbedPrescriptionLayout from './TabbedPrescriptionLayout';

const PrescriptionDetails = ({ 
  selectedMedicines, 
  onUpdateMedicine,
  prescriptionDetails,
  setPrescriptionDetails
}) => {
  const handleRemoveMedicine = (medicine_id) => {
    onUpdateMedicine(medicine_id, 'remove', true);
  };

  return (
    <TabbedPrescriptionLayout
      selectedMedicines={selectedMedicines}
      onUpdateMedicine={onUpdateMedicine}
      prescriptionDetails={prescriptionDetails}
      setPrescriptionDetails={setPrescriptionDetails}
      onRemoveMedicine={handleRemoveMedicine}
    />
  );
};

export default PrescriptionDetails;