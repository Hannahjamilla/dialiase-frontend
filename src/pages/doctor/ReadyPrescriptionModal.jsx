import React, { useState, useEffect } from 'react';
import { FaTimes, FaEdit, FaTrash, FaPlus, FaCheck, FaPills, FaSearch } from 'react-icons/fa';
import styled from 'styled-components';
import Spinner from '../../components/Spinner';
import { toast } from 'react-toastify';

const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
`;

const ModalContent = styled.div`
  background: white;
  border-radius: 8px;
  width: 95%;
  max-width: 1200px;
  max-height: 90vh;
  overflow: hidden;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
`;

const ModalHeader = styled.div`
  background: #395886;
  color: white;
  padding: 1.25rem 1.5rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const ModalTitle = styled.h2`
  margin: 0;
  font-size: 1.25rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const CloseButton = styled.button`
  background: rgba(255, 255, 255, 0.2);
  border: none;
  color: white;
  padding: 0.5rem;
  border-radius: 4px;
  cursor: pointer;
  display: flex;
  align-items: center;
  
  &:hover {
    background: rgba(255, 255, 255, 0.3);
  }
`;

const ModalBody = styled.div`
  padding: 1.5rem;
`;

const SearchBar = styled.div`
  display: flex;
  gap: 1rem;
  margin-bottom: 1.5rem;
  align-items: center;
`;

const SearchBox = styled.div`
  position: relative;
  flex: 1;
`;

const SearchInput = styled.input`
  width: 100%;
  padding: 0.75rem 1rem 0.75rem 2.5rem;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 0.9rem;
  
  &:focus {
    outline: none;
    border-color: #395886;
  }
`;

const SearchIcon = styled.div`
  position: absolute;
  left: 0.75rem;
  top: 50%;
  transform: translateY(-50%);
  color: #666;
`;

const AddButton = styled.button`
  background: #477977;
  color: white;
  border: none;
  border-radius: 6px;
  padding: 0.75rem 1rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.9rem;
  
  &:hover {
    background: #395886;
  }
`;

const Table = styled.div`
  background: white;
  border: 1px solid #e0e0e0;
  border-radius: 6px;
  overflow: hidden;
`;

const TableHeader = styled.div`
  display: grid;
  grid-template-columns: 2fr 1.5fr 1fr 1fr 1fr 80px;
  background: #f8f9fa;
  padding: 1rem;
  font-weight: 600;
  color: #333;
  font-size: 0.85rem;
  border-bottom: 1px solid #e0e0e0;
`;

const TableRow = styled.div`
  display: grid;
  grid-template-columns: 2fr 1.5fr 1fr 1fr 1fr 80px;
  padding: 1rem;
  border-bottom: 1px solid #f0f0f0;
  align-items: center;
  
  &:hover {
    background: #f8f9fa;
  }
  
  &:last-child {
    border-bottom: none;
  }
`;

const TableCell = styled.div`
  color: ${props => props.$primary ? '#333' : '#666'};
  font-size: 0.9rem;
  line-height: 1.4;
`;

const MedicineName = styled(TableCell)`
  font-weight: 600;
  color: #333;
`;

const ActionCell = styled.div`
  display: flex;
  gap: 0.25rem;
  justify-content: flex-end;
`;

const IconButton = styled.button`
  background: ${props => props.$edit ? '#477977' : '#f8f9fa'};
  border: none;
  color: ${props => props.$edit ? 'white' : '#dc3545'};
  padding: 0.4rem;
  border-radius: 4px;
  cursor: pointer;
  display: flex;
  align-items: center;
  font-size: 0.8rem;
  
  &:hover {
    background: ${props => props.$edit ? '#395886' : '#ffe6e6'};
  }
`;

const ModalFooter = styled.div`
  padding: 1rem 1.5rem;
  background: #f8f9fa;
  border-top: 1px solid #e0e0e0;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const CancelButton = styled.button`
  background: #6c757d;
  color: white;
  border: none;
  border-radius: 6px;
  padding: 0.75rem 1.5rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  
  &:hover {
    background: #5a6268;
  }
`;

const ApplyButton = styled.button`
  background: #395886;
  color: white;
  border: none;
  border-radius: 6px;
  padding: 0.75rem 1.5rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  
  &:hover:not(:disabled) {
    background: #2d4466;
  }
  
  &:disabled {
    background: #ccc;
    cursor: not-allowed;
  }
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 3rem 2rem;
  color: #666;
`;

const EmptyIcon = styled.div`
  font-size: 2.5rem;
  color: #ccc;
  margin-bottom: 1rem;
`;

const EmptyTitle = styled.h3`
  margin: 0 0 0.5rem 0;
  color: #333;
  font-size: 1.1rem;
`;

const EmptyText = styled.p`
  margin: 0;
  font-size: 0.9rem;
`;

// Edit Modal Styles
const EditModalOverlay = styled(ModalOverlay)`
  z-index: 1001;
`;

const EditModalContent = styled(ModalContent)`
  max-width: 500px;
`;

const EditModalHeader = styled(ModalHeader)`
  background: #477977;
`;

// Add Modal Styles
const AddModalOverlay = styled(ModalOverlay)`
  z-index: 1001;
`;

const AddModalContent = styled(ModalContent)`
  max-width: 600px;
`;

const AddModalHeader = styled(ModalHeader)`
  background: #477977;
`;

const Form = styled.div`
  padding: 1.5rem;
`;

const FormGroup = styled.div`
  margin-bottom: 1rem;
`;

const Label = styled.label`
  display: block;
  margin-bottom: 0.5rem;
  color: #333;
  font-weight: 500;
`;

const Input = styled.input`
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 0.9rem;
  
  &:focus {
    outline: none;
    border-color: #395886;
  }
`;

const Select = styled.select`
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 0.9rem;
  background: white;
  
  &:focus {
    outline: none;
    border-color: #395886;
  }
`;

const TextArea = styled.textarea`
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 0.9rem;
  min-height: 80px;
  resize: vertical;
  
  &:focus {
    outline: none;
    border-color: #395886;
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 0.5rem;
  justify-content: flex-end;
  margin-top: 1.5rem;
`;

const ErrorMessage = styled.div`
  background: #fee;
  border: 1px solid #f5c6cb;
  color: #721c24;
  padding: 0.75rem;
  border-radius: 4px;
  margin-bottom: 1rem;
  font-size: 0.9rem;
`;

const ReadyPrescriptionModalComponent = ({ 
  isOpen, 
  onClose, 
  readyMedicines, 
  loadingReady, 
  onApplyReadyPrescription,
  api,
  onRefreshReadyPrescriptions,
  availableMedicines = [] // Add this prop to get available medicines for dropdown
}) => {
  const [showEditModal, setShowEditModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingMedicine, setEditingMedicine] = useState(null);
  const [editForm, setEditForm] = useState({
    generic_name: '',
    dose_unit_freq: '',
    dispense_no: ''
  });
  const [addForm, setAddForm] = useState({
    medicine_id: '',
    generic_name: '',
    dose_unit_freq: '',
    dispense_no: ''
  });
  const [saving, setSaving] = useState(false);
  const [adding, setAdding] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (showEditModal || showAddModal) {
      setError('');
    }
  }, [showEditModal, showAddModal]);

  const handleApplyReadyPrescription = async () => {
    try {
      const response = await api.get('/prescriptions/ready-prescriptions/apply');
      
      if (response.data.success && response.data.medicines) {
        onApplyReadyPrescription(response.data.medicines);
        onClose();
        toast.success(`Added ${response.data.medicines.length} medicines to prescription`);
      }
    } catch (err) {
      console.error('Apply error:', err);
      toast.error('Failed to apply ready prescription');
    }
  };

  const handleEdit = (medicine) => {
    if (!medicine?.id) {
      toast.error('Cannot edit: Invalid medicine ID');
      return;
    }
    
    setEditingMedicine(medicine);
    setEditForm({
      generic_name: medicine.generic_name || '',
      dose_unit_freq: medicine.common_dosage || '',
      dispense_no: medicine.common_duration ? medicine.common_duration.replace(' days', '') : ''
    });
    setShowEditModal(true);
    setError('');
  };

  const handleSaveEdit = async () => {
    if (!editingMedicine?.id) {
      toast.error('Invalid medicine selection');
      return;
    }

    try {
      setSaving(true);
      setError('');
      
      const updateData = {
        generic_name: editForm.generic_name,
        dose_unit_freq: editForm.dose_unit_freq,
        dispense_no: editForm.dispense_no ? parseInt(editForm.dispense_no) : null
      };

      console.log('Updating medicine with ID:', editingMedicine.id);
      console.log('Update data:', updateData);
      
      const response = await api.put(`/prescriptions/ready-prescriptions/${editingMedicine.id}`, updateData, {
        headers: {
          'Content-Type': 'application/json',
        }
      });

      console.log('Update response:', response.data);

      if (response.data.success) {
        toast.success('Prescription updated successfully');
        setShowEditModal(false);
        setEditingMedicine(null);
        
        if (onRefreshReadyPrescriptions) {
          await onRefreshReadyPrescriptions();
        }
      } else {
        throw new Error(response.data.error || 'Failed to update');
      }
    } catch (err) {
      console.error('Update error details:', err);
      console.error('Error response:', err.response);
      
      let errorMessage = 'Failed to update prescription';
      
      if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err.response?.data?.error) {
        errorMessage = err.response.data.error;
      } else if (err.message) {
        errorMessage = err.message;
      }

      if (err.response?.data?.errors) {
        const validationErrors = Object.values(err.response.data.errors).flat();
        errorMessage = validationErrors.join(', ');
      }
      
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setSaving(false);
    }
  };

  const handleAddNew = () => {
    setAddForm({
      medicine_id: '',
      generic_name: '',
      dose_unit_freq: '',
      dispense_no: ''
    });
    setShowAddModal(true);
    setError('');
  };

  const handleSaveNew = async () => {
    if (!addForm.medicine_id) {
      setError('Please select a medicine');
      return;
    }

    if (!addForm.dose_unit_freq.trim()) {
      setError('Dosage and frequency is required');
      return;
    }

    try {
      setAdding(true);
      setError('');
      
      const newData = {
        medicine_id: parseInt(addForm.medicine_id),
        generic_name: addForm.generic_name,
        dose_unit_freq: addForm.dose_unit_freq,
        dispense_no: addForm.dispense_no ? parseInt(addForm.dispense_no) : null
      };

      console.log('Adding new ready medicine:', newData);
      
      const response = await api.post('/prescriptions/ready-prescriptions', newData, {
        headers: {
          'Content-Type': 'application/json',
        }
      });

      console.log('Add response:', response.data);

      if (response.data.success) {
        toast.success('Ready prescription added successfully');
        setShowAddModal(false);
        setAddForm({
          medicine_id: '',
          generic_name: '',
          dose_unit_freq: '',
          dispense_no: ''
        });
        
        if (onRefreshReadyPrescriptions) {
          await onRefreshReadyPrescriptions();
        }
      } else {
        throw new Error(response.data.error || 'Failed to add');
      }
    } catch (err) {
      console.error('Add error details:', err);
      console.error('Error response:', err.response);
      
      let errorMessage = 'Failed to add ready prescription';
      
      if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err.response?.data?.error) {
        errorMessage = err.response.data.error;
      } else if (err.message) {
        errorMessage = err.message;
      }

      if (err.response?.data?.errors) {
        const validationErrors = Object.values(err.response.data.errors).flat();
        errorMessage = validationErrors.join(', ');
      }
      
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setAdding(false);
    }
  };

  const handleDelete = async (medicine) => {
    if (!medicine?.id) {
      toast.error('Cannot delete: Invalid medicine ID');
      return;
    }

    if (!window.confirm(`Are you sure you want to delete "${medicine.name}" from ready prescriptions?`)) return;

    try {
      console.log('Deleting medicine with ID:', medicine.id);
      const response = await api.delete(`/prescriptions/ready-prescriptions/${medicine.id}`);
      
      if (response.data.success) {
        toast.success('Prescription deleted successfully');
        
        if (onRefreshReadyPrescriptions) {
          await onRefreshReadyPrescriptions();
        }
      } else {
        throw new Error(response.data.error || 'Failed to delete');
      }
    } catch (err) {
      console.error('Delete error:', err);
      console.error('Error response:', err.response);
      
      let errorMessage = 'Failed to delete prescription';
      
      if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      toast.error(errorMessage);
    }
  };

  const filteredMedicines = readyMedicines.filter(medicine => 
    medicine?.id && (
      medicine.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      medicine.generic_name?.toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  // Filter available medicines to exclude those already in ready prescriptions
  const availableMedicinesFiltered = availableMedicines.filter(med => 
    !readyMedicines.some(readyMed => readyMed.medicine_id === med.id)
  );

  if (!isOpen) return null;

  return (
    <>
      <ModalOverlay>
        <ModalContent>
          <ModalHeader>
            <ModalTitle>
              <FaPills />
              Ready Prescriptions
              <span style={{ 
                fontSize: '0.7rem', 
                marginLeft: '10px', 
                opacity: 0.8,
                background: 'rgba(255,255,255,0.2)',
                padding: '2px 6px',
                borderRadius: '4px'
              }}>
                {filteredMedicines.length} shown
              </span>
            </ModalTitle>
            <CloseButton onClick={onClose}>
              <FaTimes />
            </CloseButton>
          </ModalHeader>

          <ModalBody>
            <SearchBar>
              <SearchBox>
                <SearchInput
                  type="text"
                  placeholder="Search prescriptions..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <SearchIcon>
                  <FaSearch />
                </SearchIcon>
              </SearchBox>
              
              <AddButton onClick={handleAddNew}>
                <FaPlus />
                Add New
              </AddButton>
            </SearchBar>

            {loadingReady ? (
              <div style={{ textAlign: 'center', padding: '3rem' }}>
                <Spinner size="large" />
                <div style={{ marginTop: '1rem', color: '#666' }}>
                  Loading prescriptions...
                </div>
              </div>
            ) : filteredMedicines.length > 0 ? (
              <Table>
                <TableHeader>
                  <div>Medicine Name</div>
                  <div>Generic Name</div>
                  <div>Dosage</div>
                  <div>Frequency</div>
                  <div>Duration</div>
                  <div style={{ textAlign: 'center' }}>Actions</div>
                </TableHeader>
                
                <div style={{ maxHeight: '400px', overflow: 'auto' }}>
                  {filteredMedicines.map(medicine => (
                    <TableRow key={medicine.id}>
                      <MedicineName>{medicine.name}</MedicineName>
                      <TableCell>{medicine.generic_name || '-'}</TableCell>
                      <TableCell>{medicine.common_dosage || '-'}</TableCell>
                      <TableCell>{medicine.common_frequency || '-'}</TableCell>
                      <TableCell>{medicine.common_duration || '-'}</TableCell>
                      <ActionCell>
                        <IconButton 
                          $edit 
                          onClick={() => handleEdit(medicine)}
                          title="Edit"
                        >
                          <FaEdit />
                        </IconButton>
                        <IconButton 
                          onClick={() => handleDelete(medicine)}
                          title="Delete"
                        >
                          <FaTrash />
                        </IconButton>
                      </ActionCell>
                    </TableRow>
                  ))}
                </div>
              </Table>
            ) : (
              <EmptyState>
                <EmptyIcon>
                  <FaPills />
                </EmptyIcon>
                <EmptyTitle>
                  {readyMedicines.length === 0 ? 'No Prescriptions Loaded' : 'No Matching Prescriptions'}
                </EmptyTitle>
                <EmptyText>
                  {searchTerm 
                    ? 'No prescriptions match your search.'
                    : 'No ready prescriptions available. Click "Add New" to create one.'
                  }
                </EmptyText>
              </EmptyState>
            )}
          </ModalBody>

          <ModalFooter>
            <CancelButton onClick={onClose}>
              <FaTimes />
              Cancel
            </CancelButton>
            <ApplyButton 
              onClick={handleApplyReadyPrescription} 
              disabled={loadingReady || filteredMedicines.length === 0}
            >
              <FaCheck />
              Apply All ({filteredMedicines.length})
            </ApplyButton>
          </ModalFooter>
        </ModalContent>
      </ModalOverlay>

      {/* Edit Modal */}
      {showEditModal && (
        <EditModalOverlay>
          <EditModalContent>
            <EditModalHeader>
              <ModalTitle>
                <FaEdit />
                Edit Prescription - {editingMedicine?.name}
              </ModalTitle>
              <CloseButton onClick={() => {
                setShowEditModal(false);
                setEditingMedicine(null);
                setError('');
              }}>
                <FaTimes />
              </CloseButton>
            </EditModalHeader>

            <Form>
              {error && (
                <ErrorMessage>
                  <strong>Error:</strong> {error}
                </ErrorMessage>
              )}

              <FormGroup>
                <Label>Generic Name</Label>
                <Input
                  type="text"
                  value={editForm.generic_name}
                  onChange={(e) => setEditForm(prev => ({ ...prev, generic_name: e.target.value }))}
                  placeholder="Enter generic name"
                />
              </FormGroup>

              <FormGroup>
                <Label>Dosage and Frequency *</Label>
                <TextArea
                  value={editForm.dose_unit_freq}
                  onChange={(e) => setEditForm(prev => ({ ...prev, dose_unit_freq: e.target.value }))}
                  placeholder="e.g., 1 TABLET THREE TIMES A DAY WITH MEALS"
                  required
                />
              </FormGroup>

              <FormGroup>
                <Label>Duration (days)</Label>
                <Input
                  type="number"
                  value={editForm.dispense_no}
                  onChange={(e) => setEditForm(prev => ({ ...prev, dispense_no: e.target.value }))}
                  placeholder="e.g., 30"
                  min="1"
                />
              </FormGroup>

              <ButtonGroup>
                <CancelButton 
                  onClick={() => {
                    setShowEditModal(false);
                    setEditingMedicine(null);
                    setError('');
                  }}
                  disabled={saving}
                >
                  <FaTimes />
                  Cancel
                </CancelButton>
                <ApplyButton onClick={handleSaveEdit} disabled={saving}>
                  {saving ? <Spinner size="small" /> : (
                    <>
                      <FaCheck />
                      Save Changes
                    </>
                  )}
                </ApplyButton>
              </ButtonGroup>
            </Form>
          </EditModalContent>
        </EditModalOverlay>
      )}

      {/* Add New Modal */}
      {showAddModal && (
        <AddModalOverlay>
          <AddModalContent>
            <AddModalHeader>
              <ModalTitle>
                <FaPlus />
                Add New Ready Prescription
              </ModalTitle>
              <CloseButton onClick={() => {
                setShowAddModal(false);
                setAddForm({
                  medicine_id: '',
                  generic_name: '',
                  dose_unit_freq: '',
                  dispense_no: ''
                });
                setError('');
              }}>
                <FaTimes />
              </CloseButton>
            </AddModalHeader>

            <Form>
              {error && (
                <ErrorMessage>
                  <strong>Error:</strong> {error}
                </ErrorMessage>
              )}

              <FormGroup>
                <Label>Select Medicine *</Label>
                <Select
                  value={addForm.medicine_id}
                  onChange={(e) => {
                    const selectedId = e.target.value;
                    const selectedMedicine = availableMedicines.find(med => med.id == selectedId);
                    setAddForm(prev => ({ 
                      ...prev, 
                      medicine_id: selectedId,
                      generic_name: selectedMedicine?.generic_name || ''
                    }));
                  }}
                  required
                >
                  <option value="">Select a medicine</option>
                  {availableMedicinesFiltered.map(medicine => (
                    <option key={medicine.id} value={medicine.id}>
                      {medicine.name} {medicine.strength ? `(${medicine.strength})` : ''}
                    </option>
                  ))}
                </Select>
              </FormGroup>

              <FormGroup>
                <Label>Generic Name</Label>
                <Input
                  type="text"
                  value={addForm.generic_name}
                  onChange={(e) => setAddForm(prev => ({ ...prev, generic_name: e.target.value }))}
                  placeholder="Enter generic name"
                />
              </FormGroup>

              <FormGroup>
                <Label>Dosage and Frequency *</Label>
                <TextArea
                  value={addForm.dose_unit_freq}
                  onChange={(e) => setAddForm(prev => ({ ...prev, dose_unit_freq: e.target.value }))}
                  placeholder="e.g., 1 TABLET THREE TIMES A DAY WITH MEALS"
                  required
                />
              </FormGroup>

              <FormGroup>
                <Label>Duration (days)</Label>
                <Input
                  type="number"
                  value={addForm.dispense_no}
                  onChange={(e) => setAddForm(prev => ({ ...prev, dispense_no: e.target.value }))}
                  placeholder="e.g., 30"
                  min="1"
                />
              </FormGroup>

              <ButtonGroup>
                <CancelButton 
                  onClick={() => {
                    setShowAddModal(false);
                    setAddForm({
                      medicine_id: '',
                      generic_name: '',
                      dose_unit_freq: '',
                      dispense_no: ''
                    });
                    setError('');
                  }}
                  disabled={adding}
                >
                  <FaTimes />
                  Cancel
                </CancelButton>
                <ApplyButton onClick={handleSaveNew} disabled={adding}>
                  {adding ? <Spinner size="small" /> : (
                    <>
                      <FaPlus />
                      Add Prescription
                    </>
                  )}
                </ApplyButton>
              </ButtonGroup>
            </Form>
          </AddModalContent>
        </AddModalOverlay>
      )}
    </>
  );
};

export default ReadyPrescriptionModalComponent;