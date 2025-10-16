import React, { useRef, useEffect } from 'react';
import { FaSearch, FaTimes, FaMicrophone, FaMicrophoneSlash, FaPlus, FaHistory, FaStar, FaArrowRight } from 'react-icons/fa';
import { FaPills, FaCapsules, FaPrescriptionBottleAlt } from 'react-icons/fa';
import styled, { keyframes, css } from 'styled-components';
import api from '../../api/axios';
import { toast } from 'react-toastify';
import Spinner from '../../components/Spinner';

const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
`;

const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  margin-bottom: 2rem;
  min-height: 500px;
`;

const HeaderSection = styled.div`
  background: #ffffff;
  border-radius: 12px;
  padding: 2rem;
  border: 1px solid #e0e0e0;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
`;

const HeaderTitle = styled.h1`
  font-size: 1.8rem;
  font-weight: 600;
  color: #1a1a1a;
  margin: 0 0 0.5rem 0;
  display: flex;
  align-items: center;
  gap: 1rem;
`;

const HeaderSubtitle = styled.p`
  font-size: 1rem;
  color: #666;
  margin: 0;
  line-height: 1.5;
`;

const SearchRow = styled.div`
  display: grid;
  grid-template-columns: 1fr auto;
  gap: 1.5rem;
  align-items: start;
`;

const SearchSection = styled.div`
  background: #ffffff;
  border-radius: 12px;
  padding: 1.5rem;
  border: 1px solid #e0e0e0;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
  animation: ${fadeIn} 0.4s ease-out;
`;

const StatsSection = styled.div`
  background: #ffffff;
  border-radius: 12px;
  padding: 1.5rem;
  border: 1px solid #e0e0e0;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
  min-width: 200px;
`;

const SearchHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1.5rem;
`;

const SearchIcon = styled.div`
  width: 48px;
  height: 48px;
  background: #f8f9fa;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #495057;
  font-size: 1.2rem;
  border: 1px solid #e9ecef;
`;

const SearchTitle = styled.div`
  flex: 1;
`;

const SearchMainTitle = styled.h3`
  font-size: 1.3rem;
  font-weight: 600;
  margin: 0 0 0.3rem 0;
  color: #1a1a1a;
`;

const SearchSubtitle = styled.p`
  margin: 0;
  color: #666;
  font-size: 0.9rem;
`;

const InputContainer = styled.div`
  position: relative;
  margin-bottom: 1rem;
`;

const SearchInput = styled.input`
  width: 100%;
  padding: 1.2rem 4rem 1.2rem 3rem;
  border: 1px solid #d0d0d0;
  border-radius: 8px;
  font-size: 1rem;
  transition: all 0.2s ease;
  background: #fafafa;

  &:focus {
    outline: none;
    border-color: #007bff;
    background: #ffffff;
    box-shadow: 0 0 0 2px rgba(0, 123, 255, 0.1);
  }

  &::placeholder {
    color: #999;
  }
`;

const InputIcon = styled(FaSearch)`
  position: absolute;
  left: 1rem;
  top: 50%;
  transform: translateY(-50%);
  color: #666;
  font-size: 1.1rem;
`;

const VoiceButton = styled.button`
  position: absolute;
  right: 3.5rem;
  top: 50%;
  transform: translateY(-50%);
  width: 36px;
  height: 36px;
  border: none;
  border-radius: 6px;
  background: ${props => props.$listening ? '#dc3545' : '#28a745'};
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 1rem;

  &:hover {
    opacity: 0.9;
  }
`;

const ClearButton = styled.button`
  position: absolute;
  right: 1rem;
  top: 50%;
  transform: translateY(-50%);
  width: 32px;
  height: 32px;
  border: none;
  border-radius: 6px;
  background: #f8f9fa;
  color: #666;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: #e9ecef;
    color: #333;
  }
`;

const QuickActions = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 0.8rem;
  margin-top: 1rem;
`;

const ActionButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.8rem;
  border: 1px solid #e0e0e0;
  border-radius: 6px;
  background: #ffffff;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 0.9rem;
  font-weight: 500;
  color: #495057;

  &:hover {
    border-color: #007bff;
    color: #007bff;
    background: #f8f9fa;
  }

  svg {
    font-size: 1rem;
  }
`;

const ResultsSection = styled.div`
  background: #ffffff;
  border-radius: 12px;
  border: 1px solid #e0e0e0;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
  animation: ${fadeIn} 0.4s ease-out;
`;

const ResultsHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1.5rem;
  border-bottom: 1px solid #f0f0f0;
  background: #fafafa;
`;

const ResultsTitle = styled.h4`
  font-size: 1.1rem;
  font-weight: 600;
  margin: 0;
  color: #1a1a1a;
  display: flex;
  align-items: center;
  gap: 0.8rem;
`;

const ResultsCount = styled.span`
  background: #6c757d;
  color: white;
  padding: 0.3rem 0.6rem;
  border-radius: 4px;
  font-size: 0.8rem;
  font-weight: 500;
`;

const MedicineList = styled.div`
  display: flex;
  flex-direction: column;
  max-height: 400px;
  overflow-y: auto;
`;

const MedicineItem = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1.2rem 1.5rem;
  border-bottom: 1px solid #f5f5f5;
  cursor: pointer;
  transition: all 0.2s ease;
  background: #ffffff;

  &:hover {
    background: #f8f9fa;
  }

  &:last-child {
    border-bottom: none;
  }
`;

const MedicineIcon = styled.div`
  width: 40px;
  height: 40px;
  background: #f8f9fa;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #495057;
  font-size: 1.1rem;
  border: 1px solid #e9ecef;
  flex-shrink: 0;
`;

const MedicineInfo = styled.div`
  flex: 1;
  min-width: 0;
`;

const MedicineName = styled.div`
  font-size: 1rem;
  font-weight: 600;
  color: #1a1a1a;
  margin-bottom: 0.2rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const MedicineGeneric = styled.div`
  font-size: 0.9rem;
  color: #666;
  margin-bottom: 0.3rem;
`;

const MedicineMeta = styled.div`
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
`;

const MetaTag = styled.span`
  padding: 0.2rem 0.5rem;
  border-radius: 4px;
  font-size: 0.8rem;
  font-weight: 500;
  background: #f8f9fa;
  color: #495057;
  border: 1px solid #e9ecef;
`;

const SelectButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.6rem 1rem;
  background: #007bff;
  color: white;
  border: none;
  border-radius: 4px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 0.9rem;
  flex-shrink: 0;

  &:hover {
    background: #0056b3;
  }
`;

const StatsTitle = styled.h3`
  font-size: 1.1rem;
  font-weight: 600;
  margin: 0 0 1.5rem 0;
  color: #1a1a1a;
  display: flex;
  align-items: center;
  gap: 0.8rem;
`;

const StatsGrid = styled.div`
  display: grid;
  gap: 1rem;
`;

const StatItem = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
`;

const StatIcon = styled.div`
  width: 40px;
  height: 40px;
  background: #f8f9fa;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #495057;
  font-size: 1rem;
  border: 1px solid #e9ecef;
`;

const StatContent = styled.div`
  flex: 1;
`;

const StatValue = styled.div`
  font-size: 1.3rem;
  font-weight: 600;
  color: #1a1a1a;
  line-height: 1;
  margin-bottom: 0.2rem;
`;

const StatLabel = styled.div`
  font-size: 0.8rem;
  color: #666;
  font-weight: 500;
`;

const LoadingContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  padding: 3rem;
  color: #666;
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 3rem 2rem;
  color: #666;
`;

const EmptyTitle = styled.div`
  font-size: 1rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
  color: #495057;
`;

const EmptyText = styled.div`
  font-size: 0.9rem;
  line-height: 1.5;
`;

const GenericBadge = styled.span`
  background: #28a745;
  color: white;
  padding: 0.2rem 0.5rem;
  border-radius: 4px;
  font-size: 0.7rem;
  font-weight: 600;
`;

const PrescriptionMedicationFinder = ({
  searchTerm,
  setSearchTerm,
  suggestions,
  setSuggestions,
  loading,
  setLoading,
  showSuggestions,
  setShowSuggestions,
  openMedicineModal,
  isListening,
  setIsListening,
  voiceStatus,
  setVoiceStatus,
  recognition,
  setRecognition
}) => {
  const searchInputRef = useRef(null);

  useEffect(() => {
    if (searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, []);

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    
    if (SpeechRecognition && !recognition) {
      const recognitionInstance = new SpeechRecognition();
      recognitionInstance.continuous = false;
      recognitionInstance.interimResults = true;
      recognitionInstance.lang = 'en-US';
      recognitionInstance.maxAlternatives = 1;

      recognitionInstance.onstart = () => {
        setIsListening(true);
        setVoiceStatus('Listening... Speak medication name');
      };

      recognitionInstance.onresult = (event) => {
        let transcript = event.results[0][0].transcript;
        transcript = transcript.replace(/[.,;!?]+$/, '').trim();
        setSearchTerm(transcript);
        setVoiceStatus(`Detected: "${transcript}"`);
        
        setTimeout(() => {
          if (isListening) {
            recognitionInstance.stop();
          }
        }, 1000);
      };

      recognitionInstance.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        setVoiceStatus('Error: Please try again');
        setIsListening(false);
      };

      recognitionInstance.onend = () => {
        setIsListening(false);
        setVoiceStatus('Ready for voice input');
      };

      setRecognition(recognitionInstance);
      setVoiceStatus('Ready for voice input');
    }
  }, [recognition, isListening, setRecognition, setIsListening, setSearchTerm, setVoiceStatus]);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (searchTerm.length > 2) {
        searchMedicines();
      } else {
        setSuggestions([]);
        setShowSuggestions(false);
      }
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm]);

  const searchMedicines = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/prescriptions/medicines/search?q=${encodeURIComponent(searchTerm)}`);
      setSuggestions(response.data);
      setShowSuggestions(true);
      setLoading(false); 
    } catch (err) {
      console.error('Search error:', err);
      toast.error('Failed to search medicines');
      setLoading(false);
    }
  };

  const toggleVoiceRecognition = () => {
    if (!recognition) {
      toast.error('Voice input not supported');
      return;
    }

    if (isListening) {
      recognition.stop();
    } else {
      setSearchTerm('');
      setTimeout(() => {
        recognition.start();
      }, 100);
    }
  };

  const clearSearch = () => {
    setSearchTerm('');
    setSuggestions([]);
    setShowSuggestions(false);
  };

  return (
    <Container>
      <HeaderSection>
        <HeaderTitle>
          <FaPrescriptionBottleAlt />
          Medication Management
        </HeaderTitle>
        <HeaderSubtitle>
          Search and manage medications efficiently with our professional healthcare interface
        </HeaderSubtitle>
      </HeaderSection>

      <SearchRow>
        <SearchSection>
          <SearchHeader>
            <SearchIcon>
              <FaSearch />
            </SearchIcon>
            <SearchTitle>
              <SearchMainTitle>Find Medications</SearchMainTitle>
              <SearchSubtitle>Search by name, generic name, or use voice input</SearchSubtitle>
            </SearchTitle>
          </SearchHeader>

          <InputContainer>
            <InputIcon />
            <SearchInput
              ref={searchInputRef}
              type="text"
              placeholder="Enter medication name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            
            <VoiceButton 
              onClick={toggleVoiceRecognition} 
              $listening={isListening}
            >
              {isListening ? <FaMicrophoneSlash /> : <FaMicrophone />}
            </VoiceButton>
            
            {searchTerm && (
              <ClearButton onClick={clearSearch}>
                <FaTimes />
              </ClearButton>
            )}
          </InputContainer>
        </SearchSection>

        <StatsSection>
          <StatsTitle>
            <FaPills />
            Statistics
          </StatsTitle>
          <StatsGrid>
            <StatItem>
              <StatIcon>
                <FaCapsules />
              </StatIcon>
              <StatContent>
                <StatValue>{suggestions.length}</StatValue>
                <StatLabel>Medications Found</StatLabel>
              </StatContent>
            </StatItem>
          </StatsGrid>
        </StatsSection>
      </SearchRow>

      {showSuggestions && (
        <ResultsSection>
          <ResultsHeader>
            <ResultsTitle>
              Search Results
              <ResultsCount>{suggestions.length}</ResultsCount>
            </ResultsTitle>
          </ResultsHeader>

          <MedicineList>
            {loading ? (
              <LoadingContainer>
                <Spinner size="medium" />
                <div>Searching medications...</div>
              </LoadingContainer>
            ) : suggestions.length > 0 ? (
              suggestions.map(medicine => (
                <MedicineItem key={medicine.id} onClick={() => openMedicineModal(medicine)}>
                  <MedicineIcon>
                    <FaCapsules />
                  </MedicineIcon>
                  <MedicineInfo>
                    <MedicineName>
                      {medicine.name}
                      {medicine.is_generic && <GenericBadge>Generic</GenericBadge>}
                    </MedicineName>
                    <MedicineGeneric>{medicine.generic_name}</MedicineGeneric>
                    <MedicineMeta>
                      {medicine.common_dosage && (
                        <MetaTag>Dosage: {medicine.common_dosage}</MetaTag>
                      )}
                      {medicine.form && <MetaTag>Form: {medicine.form}</MetaTag>}
                      {medicine.strength && <MetaTag>Strength: {medicine.strength}</MetaTag>}
                    </MedicineMeta>
                  </MedicineInfo>
                  <SelectButton>
                    Select <FaArrowRight />
                  </SelectButton>
                </MedicineItem>
              ))
            ) : (
              <EmptyState>
                <EmptyTitle>No medications found</EmptyTitle>
                <EmptyText>
                  Try adjusting your search terms or use voice input for better results.
                </EmptyText>
              </EmptyState>
            )}
          </MedicineList>
        </ResultsSection>
      )}
    </Container>
  );
};

export default PrescriptionMedicationFinder;