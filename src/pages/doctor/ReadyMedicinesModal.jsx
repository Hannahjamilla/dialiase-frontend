import React, { useState, useEffect } from 'react';
import styled, { keyframes } from 'styled-components';
import { 
  FaTimes, 
  FaPlus, 
  FaSearch, 
  FaPills, 
  FaClock, 
  FaCalendarAlt, 
  FaStickyNote,
  FaEdit,
  FaCheck,
  FaCheckSquare,
  FaSquare
} from 'react-icons/fa';
import { GiMedicinePills } from 'react-icons/gi';
import api from '../../api/axios';
import { toast } from 'react-toastify';
import Spinner from '../../components/Spinner';

const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(-20px); }
  to { opacity: 1; transform: translateY(0); }
`;

const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10000;
  padding: 1rem;
`;

const ModalContainer = styled.div`
  background: #ffffff;
  border-radius: 8px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.15);
  width: 90%;
  max-width: 1200px;
  max-height: 90vh;
  overflow: hidden;
  animation: ${fadeIn} 0.3s ease-out;
  display: flex;
  flex-direction: column;
  border: 1px solid #e0e0e0;
`;

const ModalHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1.5rem 2rem;
  background: #fafafa;
  border-bottom: 1px solid #e0e0e0;
`;

const ModalTitle = styled.h2`
  margin: 0;
  font-size: 1.25rem;
  font-weight: 600;
  color: #333;
  display: flex;
  align-items: center;
  gap: 0.75rem;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  border-radius: 4px;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #666;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 1rem;
  
  &:hover {
    background: #f0f0f0;
    color: #333;
  }
`;

const ModalBody = styled.div`
  flex: 1;
  overflow: auto;
  padding: 0;
`;

const SearchSection = styled.div`
  padding: 1.5rem 2rem;
  background: #fff;
  border-bottom: 1px solid #e0e0e0;
  position: sticky;
  top: 0;
  z-index: 10;
`;

const SearchContainer = styled.div`
  position: relative;
  max-width: 500px;
  margin-bottom: 1rem;
`;

const SearchInput = styled.input`
  width: 100%;
  padding: 0.875rem 1rem 0.875rem 2.5rem;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 0.9rem;
  transition: all 0.2s ease;
  background: #fff;
  
  &:focus {
    outline: none;
    border-color: #007acc;
    box-shadow: 0 0 0 2px rgba(0, 122, 204, 0.1);
  }
  
  &::placeholder {
    color: #999;
  }
`;

const SearchIcon = styled(FaSearch)`
  position: absolute;
  left: 1rem;
  top: 50%;
  transform: translateY(-50%);
  color: #999;
  font-size: 1rem;
`;

const SelectionControls = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  flex-wrap: wrap;
`;

const SelectAllButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background: #fff;
  color: #333;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 0.8rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background: #f8f8f8;
    border-color: #ccc;
  }
  
  ${props => props.$selected && `
    background: #007acc;
    color: white;
    border-color: #007acc;
    
    &:hover {
      background: #0066b3;
      border-color: #0066b3;
    }
  `}
`;

const SelectionInfo = styled.div`
  font-size: 0.8rem;
  color: #666;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const MedicinesGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 1rem;
  padding: 1.5rem;
`;

const MedicineCard = styled.div`
  background: white;
  border: 1px solid #e0e0e0;
  border-radius: 6px;
  padding: 1.25rem;
  transition: all 0.2s ease;
  cursor: pointer;
  position: relative;
  
  &:hover {
    border-color: #007acc;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  }
  
  ${props => props.$selected && `
    border-color: #007acc;
    background: #f8fbff;
    box-shadow: 0 2px 8px rgba(0, 122, 204, 0.1);
  `}
`;

const MedicineHeader = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: 1rem;
`;

const MedicineName = styled.h3`
  margin: 0;
  font-size: 1rem;
  font-weight: 600;
  color: #333;
  line-height: 1.4;
  flex: 1;
  padding-right: 1rem;
`;

const CardActions = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const EditButton = styled.button`
  background: #fff;
  color: #666;
  border: 1px solid #ddd;
  border-radius: 4px;
  padding: 0.4rem;
  font-size: 0.7rem;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  
  &:hover {
    background: #f8f8f8;
    border-color: #ccc;
    color: #333;
  }
`;

const AddButton = styled.button`
  background: #fff;
  color: #333;
  border: 1px solid #ddd;
  border-radius: 4px;
  padding: 0.5rem 0.75rem;
  font-size: 0.75rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 0.4rem;
  white-space: nowrap;
  
  &:hover {
    background: #f8f8f8;
    border-color: #ccc;
  }
  
  ${props => props.$selected && `
    background: #007acc;
    color: white;
    border-color: #007acc;
    
    &:hover {
      background: #0066b3;
      border-color: #0066b3;
    }
  `}
`;

const MedicineDetails = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
`;

const DetailRow = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  padding: 0.5rem 0;
  border-bottom: 1px solid #f5f5f5;
  
  &:last-child {
    border-bottom: none;
  }
`;

const DetailIcon = styled.div`
  color: #666;
  font-size: 0.8rem;
  flex-shrink: 0;
  margin-top: 0.1rem;
  width: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const DetailContent = styled.div`
  flex: 1;
  min-width: 0;
`;

const DetailLabel = styled.div`
  font-size: 0.7rem;
  color: #888;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.3px;
  margin-bottom: 0.2rem;
`;

const DetailValue = styled.div`
  font-size: 0.85rem;
  color: #333;
  font-weight: 400;
  line-height: 1.4;
  word-wrap: break-word;
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 3rem 2rem;
  color: #666;
  grid-column: 1 / -1;
`;

const EmptyIcon = styled(GiMedicinePills)`
  font-size: 2.5rem;
  margin-bottom: 1rem;
  opacity: 0.3;
`;

const LoadingContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 3rem;
  grid-column: 1 / -1;
`;

const ModalFooter = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.25rem 2rem;
  background: #fafafa;
  border-top: 1px solid #e0e0e0;
  gap: 1rem;
  flex-wrap: wrap;
`;

const SelectedCount = styled.div`
  font-size: 0.85rem;
  color: #666;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const FooterButtons = styled.div`
  display: flex;
  gap: 0.75rem;
  flex-wrap: wrap;
`;

const ActionButton = styled.button`
  padding: 0.625rem 1.25rem;
  border-radius: 4px;
  font-weight: 500;
  font-size: 0.85rem;
  cursor: pointer;
  transition: all 0.2s ease;
  border: 1px solid;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  
  ${({ $variant }) => {
    switch ($variant) {
      case 'primary':
        return `
          background: #007acc;
          color: white;
          border-color: #007acc;
          &:hover {
            background: #0066b3;
            border-color: #0066b3;
          }
          &:disabled {
            background: #ccc;
            border-color: #ccc;
            cursor: not-allowed;
          }
        `;
      case 'secondary':
        return `
          background: #fff;
          color: #666;
          border-color: #ddd;
          &:hover {
            background: #f8f8f8;
            border-color: #ccc;
          }
        `;
      default:
        return `
          background: #fff;
          color: #666;
          border-color: #ddd;
          &:hover {
            background: #f8f8f8;
          }
        `;
    }
  }}
`;

const EditModal = styled.div`
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: white;
  border-radius: 6px;
  padding: 1.5rem;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.15);
  z-index: 10001;
  width: 90%;
  max-width: 450px;
  max-height: 90vh;
  overflow-y: auto;
  border: 1px solid #e0e0e0;
`;

const EditForm = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const FormLabel = styled.label`
  font-weight: 500;
  color: #333;
  font-size: 0.85rem;
`;

const FormInput = styled.input`
  padding: 0.625rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 0.85rem;
  transition: all 0.2s ease;
  
  &:focus {
    outline: none;
    border-color: #007acc;
    box-shadow: 0 0 0 2px rgba(0, 122, 204, 0.1);
  }
`;

const FormTextarea = styled.textarea`
  padding: 0.625rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 0.85rem;
  min-height: 70px;
  resize: vertical;
  transition: all 0.2s ease;
  font-family: inherit;
  
  &:focus {
    outline: none;
    border-color: #007acc;
    box-shadow: 0 0 0 2px rgba(0, 122, 204, 0.1);
  }
`;

const FormActions = styled.div`
  display: flex;
  gap: 0.75rem;
  justify-content: flex-end;
  margin-top: 0.5rem;
`;

const ReadyMedicinesModal = ({ isOpen, onClose, onAddMedicines }) => {
  const [readyMedicines, setReadyMedicines] = useState([]);
  const [filteredMedicines, setFilteredMedicines] = useState([]);
  const [selectedMedicines, setSelectedMedicines] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [adding, setAdding] = useState(false);
  const [editingMedicine, setEditingMedicine] = useState(null);
  const [editForm, setEditForm] = useState({
    medicine_name: '',
    dosage: '',
    frequency: '',
    duration: '',
    instructions: ''
  });

  useEffect(() => {
    if (isOpen) {
      fetchReadyMedicines();
    }
  }, [isOpen]);

  useEffect(() => {
    if (searchTerm) {
      const filtered = readyMedicines.filter(medicine =>
        medicine.medicine_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        medicine.dosage.toLowerCase().includes(searchTerm.toLowerCase()) ||
        medicine.frequency.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredMedicines(filtered);
    } else {
      setFilteredMedicines(readyMedicines);
    }
  }, [searchTerm, readyMedicines]);

  const fetchReadyMedicines = async () => {
    try {
      setLoading(true);
      const response = await api.get('/ready-medicines');
      
      if (response.data.success) {
        setReadyMedicines(response.data.data);
        setFilteredMedicines(response.data.data);
      } else {
        throw new Error(response.data.message);
      }
    } catch (err) {
      console.error('Error fetching ready medicines:', err);
      toast.error('Failed to load ready medicines');
    } finally {
      setLoading(false);
    }
  };

  const toggleMedicineSelection = (medicine) => {
    setSelectedMedicines(prev => {
      const isSelected = prev.some(m => m.id === medicine.id);
      if (isSelected) {
        return prev.filter(m => m.id !== medicine.id);
      } else {
        return [...prev, medicine];
      }
    });
  };

  const toggleSelectAll = () => {
    if (selectedMedicines.length === filteredMedicines.length) {
      setSelectedMedicines([]);
    } else {
      setSelectedMedicines([...filteredMedicines]);
    }
  };

  const handleEditMedicine = (medicine) => {
    setEditingMedicine(medicine);
    setEditForm({
      medicine_name: medicine.medicine_name,
      dosage: medicine.dosage,
      frequency: medicine.frequency,
      duration: medicine.duration,
      instructions: medicine.instructions || ''
    });
  };

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    try {
      const response = await api.put(`/ready-medicines/${editingMedicine.id}`, editForm);
      
      if (response.data.success) {
        setReadyMedicines(prev => 
          prev.map(med => med.id === editingMedicine.id ? response.data.data : med)
        );
        setEditingMedicine(null);
        toast.success('Medicine updated successfully');
      }
    } catch (err) {
      console.error('Error updating medicine:', err);
      toast.error('Failed to update medicine');
    }
  };

  const handleAddSelectedMedicines = async () => {
    if (selectedMedicines.length === 0) {
      toast.error('Please select at least one medicine');
      return;
    }

    try {
      setAdding(true);
      
      const medicinesToAdd = selectedMedicines.map(medicine => ({
        name: medicine.medicine_name,
        dosage: medicine.dosage,
        frequency: medicine.frequency,
        duration: medicine.duration,
        instructions: medicine.instructions,
        is_ready_medicine: true,
        ready_medicine_id: medicine.id
      }));

      onAddMedicines(medicinesToAdd);
      
      toast.success(`${selectedMedicines.length} medicine(s) added to prescription`);
      handleClose();
      
    } catch (err) {
      console.error('Error adding ready medicines:', err);
      toast.error('Failed to add medicines to prescription');
    } finally {
      setAdding(false);
    }
  };

  const handleClose = () => {
    setSelectedMedicines([]);
    setSearchTerm('');
    setEditingMedicine(null);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <>
      <ModalOverlay onClick={handleClose}>
        <ModalContainer onClick={(e) => e.stopPropagation()}>
          <ModalHeader>
            <ModalTitle>
              <GiMedicinePills size="1.1em" />
              Ready-Made Medicines
            </ModalTitle>
            <CloseButton onClick={handleClose}>
              <FaTimes />
            </CloseButton>
          </ModalHeader>

          <ModalBody>
            <SearchSection>
              <SearchContainer>
                <SearchIcon />
                <SearchInput
                  type="text"
                  placeholder="Search medicines by name, dosage, or frequency..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </SearchContainer>
              
              <SelectionControls>
                <SelectAllButton 
                  $selected={selectedMedicines.length === filteredMedicines.length && filteredMedicines.length > 0}
                  onClick={toggleSelectAll}
                >
                  {selectedMedicines.length === filteredMedicines.length && filteredMedicines.length > 0 ? (
                    <FaCheckSquare />
                  ) : (
                    <FaSquare />
                  )}
                  {selectedMedicines.length === filteredMedicines.length && filteredMedicines.length > 0 
                    ? 'Deselect All' 
                    : 'Select All'
                  }
                </SelectAllButton>
                
                <SelectionInfo>
                  <FaCheck style={{ color: '#007acc' }} />
                  {selectedMedicines.length} of {filteredMedicines.length} selected
                </SelectionInfo>
              </SelectionControls>
            </SearchSection>

            {loading ? (
              <LoadingContainer>
                <Spinner size="large" />
              </LoadingContainer>
            ) : filteredMedicines.length > 0 ? (
              <MedicinesGrid>
                {filteredMedicines.map((medicine) => {
                  const isSelected = selectedMedicines.some(m => m.id === medicine.id);
                  
                  return (
                    <MedicineCard 
                      key={medicine.id} 
                      $selected={isSelected}
                      onClick={() => toggleMedicineSelection(medicine)}
                    >
                      <MedicineHeader>
                        <MedicineName>{medicine.medicine_name}</MedicineName>
                        <CardActions>
                          <EditButton 
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEditMedicine(medicine);
                            }}
                            title="Edit Medicine"
                          >
                            <FaEdit size="0.7em" />
                          </EditButton>
                          <AddButton $selected={isSelected}>
                            <FaPlus size="0.7em" />
                            {isSelected ? 'Selected' : 'Select'}
                          </AddButton>
                        </CardActions>
                      </MedicineHeader>
                      
                      <MedicineDetails>
                        <DetailRow>
                          <DetailIcon>
                            <FaPills />
                          </DetailIcon>
                          <DetailContent>
                            <DetailLabel>Dosage</DetailLabel>
                            <DetailValue>{medicine.dosage}</DetailValue>
                          </DetailContent>
                        </DetailRow>
                        
                        <DetailRow>
                          <DetailIcon>
                            <FaClock />
                          </DetailIcon>
                          <DetailContent>
                            <DetailLabel>Frequency</DetailLabel>
                            <DetailValue>{medicine.frequency}</DetailValue>
                          </DetailContent>
                        </DetailRow>
                        
                        <DetailRow>
                          <DetailIcon>
                            <FaCalendarAlt />
                          </DetailIcon>
                          <DetailContent>
                            <DetailLabel>Duration</DetailLabel>
                            <DetailValue>{medicine.duration}</DetailValue>
                          </DetailContent>
                        </DetailRow>
                        
                        {medicine.instructions && (
                          <DetailRow>
                            <DetailIcon>
                              <FaStickyNote />
                            </DetailIcon>
                            <DetailContent>
                              <DetailLabel>Instructions</DetailLabel>
                              <DetailValue>{medicine.instructions}</DetailValue>
                            </DetailContent>
                          </DetailRow>
                        )}
                      </MedicineDetails>
                    </MedicineCard>
                  );
                })}
              </MedicinesGrid>
            ) : (
              <EmptyState>
                <EmptyIcon />
                <h3>No Ready Medicines Found</h3>
                <p>No ready medicines match your search criteria.</p>
              </EmptyState>
            )}
          </ModalBody>

          <ModalFooter>
            <SelectedCount>
              <FaPills />
              {selectedMedicines.length} medicine(s) selected
            </SelectedCount>
            
            <FooterButtons>
              <ActionButton $variant="secondary" onClick={handleClose}>
                <FaTimes />
                Cancel
              </ActionButton>
              
              <ActionButton 
                $variant="primary" 
                onClick={handleAddSelectedMedicines}
                disabled={selectedMedicines.length === 0 || adding}
              >
                {adding ? <Spinner size="small" /> : <FaPlus />}
                {adding ? 'Adding...' : `Add Selected (${selectedMedicines.length})`}
              </ActionButton>
            </FooterButtons>
          </ModalFooter>
        </ModalContainer>
      </ModalOverlay>

      {/* Edit Medicine Modal */}
      {editingMedicine && (
        <ModalOverlay onClick={() => setEditingMedicine(null)}>
          <EditModal onClick={(e) => e.stopPropagation()}>
            <h3 style={{ margin: '0 0 1.25rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.1rem', color: '#333' }}>
              <FaEdit />
              Edit Medicine
            </h3>
            
            <EditForm onSubmit={handleSaveEdit}>
              <FormGroup>
                <FormLabel>Medicine Name</FormLabel>
                <FormInput
                  type="text"
                  value={editForm.medicine_name}
                  onChange={(e) => setEditForm(prev => ({ ...prev, medicine_name: e.target.value }))}
                  required
                />
              </FormGroup>
              
              <FormGroup>
                <FormLabel>Dosage</FormLabel>
                <FormInput
                  type="text"
                  value={editForm.dosage}
                  onChange={(e) => setEditForm(prev => ({ ...prev, dosage: e.target.value }))}
                  required
                />
              </FormGroup>
              
              <FormGroup>
                <FormLabel>Frequency</FormLabel>
                <FormInput
                  type="text"
                  value={editForm.frequency}
                  onChange={(e) => setEditForm(prev => ({ ...prev, frequency: e.target.value }))}
                  required
                />
              </FormGroup>
              
              <FormGroup>
                <FormLabel>Duration</FormLabel>
                <FormInput
                  type="text"
                  value={editForm.duration}
                  onChange={(e) => setEditForm(prev => ({ ...prev, duration: e.target.value }))}
                  required
                />
              </FormGroup>
              
              <FormGroup>
                <FormLabel>Instructions</FormLabel>
                <FormTextarea
                  value={editForm.instructions}
                  onChange={(e) => setEditForm(prev => ({ ...prev, instructions: e.target.value }))}
                  placeholder="Additional instructions for the patient..."
                />
              </FormGroup>
              
              <FormActions>
                <ActionButton 
                  $variant="secondary" 
                  type="button"
                  onClick={() => setEditingMedicine(null)}
                >
                  <FaTimes />
                  Cancel
                </ActionButton>
                
                <ActionButton $variant="primary" type="submit">
                  <FaCheck />
                  Save Changes
                </ActionButton>
              </FormActions>
            </EditForm>
          </EditModal>
        </ModalOverlay>
      )}
    </>
  );
};

export default ReadyMedicinesModal;