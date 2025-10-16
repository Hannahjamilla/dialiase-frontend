// HCproviderAddModalStyle.js
const styles = {
  modalOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    zIndex: 1000,
  },

  modalContainer: {
    position: 'fixed',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    backgroundColor: 'white',
    borderRadius: '12px',
    boxShadow: '0 10px 25px rgba(0, 0, 0, 0.2)',
    maxHeight: '95vh',
    overflow: 'hidden',
    zIndex: 1001,
    display: 'flex',
    flexDirection: 'column',
  },

  // Mode Toggle Styles
  modeToggleContainer: {
    padding: '20px 30px 0',
    borderBottom: '1px solid #e2e8f0',
  },
  modeToggle: {
    display: 'flex',
    backgroundColor: '#f1f5f9',
    borderRadius: '8px',
    padding: '4px',
    marginBottom: '20px',
  },
  modeButton: {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '12px 16px',
    border: 'none',
    borderRadius: '6px',
    fontSize: '14px',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'all 0.2s',
    gap: '8px',
    minHeight: '44px',
  },
  modeIcon: {
    fontSize: '16px',
  },

  // Direct Registration Styles
  directRegistrationContainer: {
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
    padding: '30px',
    overflow: 'hidden',
  },
  directForm: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '40px',
    flex: 1,
    overflowY: 'auto',
    paddingRight: '10px',
    marginBottom: '20px',
  },
  directFormSection: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
  },

  // Validation Container
  validationContainer: {
    minHeight: '24px',
    marginTop: '4px',
  },

  // Suggestion Styles
  suggestionContainer: {
    position: 'relative',
    width: '100%',
  },
  suggestionDropdown: {
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    backgroundColor: 'white',
    border: '1px solid #e2e8f0',
    borderRadius: '0 0 6px 6px',
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    zIndex: 10,
    maxHeight: '200px',
    overflowY: 'auto',
  },
  suggestionItem: {
    padding: '10px 12px',
    cursor: 'pointer',
    fontSize: '14px',
    borderBottom: '1px solid #f1f5f9',
    transition: 'background-color 0.2s',
  },
  suggestionItemHover: {
    backgroundColor: '#f8fafc',
  },

  modalHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '20px 30px',
    borderBottom: '1px solid #e2e8f0',
    backgroundColor: '#395886',
    color: '#FFFF',
    flexShrink: 0,
  },
  modalTitle: {
    fontSize: '22px',
    fontWeight: '600',
    display: 'flex',
    alignItems: 'center',
    margin: 0,
    color: '#FFFF',
  },
  userIcon: {
    marginRight: '12px',
    color: '#FFFF',
    fontSize: '24px',
  },
  closeButton: {
    background: 'none',
    border: 'none',
    fontSize: '24px',
    cursor: 'pointer',
    color: '#FFFF',
    padding: '8px',
    borderRadius: '6px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all 0.2s',
    flexShrink: 0,
  },
  closeButtonHover: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  modalContent: {
    display: 'flex',
    flex: 1,
    overflow: 'hidden',
    minHeight: '400px',
  },
  leftPanel: {
    flex: '0 0 50%',
    padding: '30px',
    overflowY: 'auto',
    display: 'flex',
    flexDirection: 'column',
    gap: '24px',
  },
  rightPanel: {
    flex: '0 0 50%',
    borderLeft: '1px solid #e2e8f0',
    overflowY: 'auto',
    backgroundColor: '#fafafa',
  },
  validationPanel: {
    backgroundColor: '#f8fafc',
    padding: '20px',
    borderRadius: '8px',
    border: '1px solid #e2e8f0',
  },
  panelTitle: {
    fontSize: '18px',
    fontWeight: '600',
    color: '#395886',
    display: 'flex',
    alignItems: 'center',
    margin: '0 0 10px 0',
  },
  infoIcon: {
    marginRight: '10px',
    color: '#395886',
    fontSize: '18px',
  },
  panelDescription: {
    fontSize: '14px',
    color: '#64748b',
    margin: '0 0 18px 0',
    lineHeight: '1.5',
  },
  uploadButtons: {
    display: 'flex',
    gap: '15px',
    flexWrap: 'wrap',
  },
  uploadButton: {
    display: 'flex',
    alignItems: 'center',
    padding: '12px 20px',
    backgroundColor: '#395886',
    color: 'white',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'all 0.2s',
    border: 'none',
    flex: '1',
    minWidth: '200px',
    justifyContent: 'center',
    minHeight: '44px',
  },
  uploadButtonHover: {
    backgroundColor: '#2a4269',
    transform: 'translateY(-2px)',
  },
  bulkUploadButton: {
    display: 'flex',
    alignItems: 'center',
    padding: '12px 20px',
    backgroundColor: '#477977',
    color: 'white',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'all 0.2s',
    border: 'none',
    flex: '1',
    minWidth: '200px',
    justifyContent: 'center',
    minHeight: '44px',
  },
  bulkUploadButtonHover: {
    backgroundColor: '#366462',
    transform: 'translateY(-2px)',
  },
  uploadIcon: {
    marginRight: '10px',
    fontSize: '16px',
  },
  fileInput: {
    display: 'none',
  },
  loadingPanel: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '40px 30px',
    backgroundColor: '#f8fafc',
    borderRadius: '8px',
  },
  spinnerContainer: {
    marginBottom: '20px',
  },
  spinner: {
    width: '40px',
    height: '40px',
    border: '4px solid #e2e8f0',
    borderTop: '4px solid #395886',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
  },
  loadingText: {
    fontSize: '16px',
    color: '#64748b',
    margin: 0,
  },
  errorPanel: {
    display: 'flex',
    padding: '16px',
    backgroundColor: '#fef2f2',
    borderRadius: '8px',
    border: '1px solid #fecaca',
    alignItems: 'flex-start',
  },
  errorIconContainer: {
    marginRight: '12px',
    color: '#dc2626',
    display: 'flex',
    alignItems: 'flex-start',
    fontSize: '18px',
    marginTop: '2px',
  },
  errorTitle: {
    fontSize: '16px',
    fontWeight: '600',
    color: '#dc2626',
    margin: '0 0 6px 0',
  },
  errorMessage: {
    fontSize: '14px',
    color: '#b91c1c',
    margin: 0,
    lineHeight: '1.5',
  },
  successPanel: {
    display: 'flex',
    padding: '16px',
    backgroundColor: '#ecfdf5',
    borderRadius: '8px',
    border: '1px solid #a7f3d0',
    alignItems: 'flex-start',
  },
  successIconContainer: {
    marginRight: '12px',
    color: '#059669',
    display: 'flex',
    alignItems: 'flex-start',
    fontSize: '18px',
    marginTop: '2px',
  },
  successTitle: {
    fontSize: '16px',
    fontWeight: '600',
    color: '#065f46',
    margin: '0 0 6px 0',
  },
  successMessageText: {
    fontSize: '14px',
    color: '#065f46',
    margin: 0,
    lineHeight: '1.5',
  },
  personalInfoPanel: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
  },
  systemInfoPanel: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
  },
  nameFields: {
    display: 'flex',
    gap: '20px',
  },
  systemFields: {
    display: 'flex',
    gap: '20px',
  },
  inputGroup: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  inputLabel: {
    display: 'flex',
    alignItems: 'center',
    fontSize: '14px',
    fontWeight: '500',
    color: '#395886',
    margin: 0,
  },
  inputIcon: {
    marginRight: '8px',
    color: '#395886',
    fontSize: '16px',
  },
  inputField: {
    width: '100%',
    padding: '12px 14px',
    border: '1px solid #d1d5db',
    borderRadius: '8px',
    fontSize: '14px',
    transition: 'all 0.2s',
    boxSizing: 'border-box',
    minHeight: '44px',
  },
  inputFieldFocus: {
    outline: 'none',
    borderColor: '#395886',
    boxShadow: '0 0 0 3px rgba(57, 88, 134, 0.15)',
  },
  readOnlyField: {
    width: '100%',
    padding: '12px 14px',
    border: '1px solid #e5e7eb',
    borderRadius: '8px',
    fontSize: '14px',
    backgroundColor: '#f9fafb',
    color: '#6b7280',
    boxSizing: 'border-box',
    minHeight: '44px',
  },
  selectField: {
    width: '100%',
    padding: '12px 14px',
    border: '1px solid #d1d5db',
    borderRadius: '8px',
    fontSize: '14px',
    backgroundColor: 'white',
    transition: 'all 0.2s',
    boxSizing: 'border-box',
    minHeight: '44px',
  },
  selectFieldFocus: {
    outline: 'none',
    borderColor: '#395886',
    boxShadow: '0 0 0 3px rgba(57, 88, 134, 0.15)',
  },
  validationMessage: {
    fontSize: '12px',
    margin: 0,
    display: 'flex',
    alignItems: 'center',
    lineHeight: '1.4',
    minHeight: '18px',
  },
  validationIcon: {
    marginRight: '6px',
    fontSize: '12px',
    flexShrink: 0,
  },
  errorIconSmall: {
    marginRight: '6px',
    color: '#dc2626',
    fontSize: '12px',
    flexShrink: 0,
  },
  validationStatus: {
    padding: '12px 16px',
    borderRadius: '8px',
    fontSize: '14px',
    display: 'flex',
    alignItems: 'center',
    marginTop: '8px',
    minHeight: '44px',
  },
  validationStatusIconValid: {
    marginRight: '10px',
    color: '#477977',
    display: 'flex',
    alignItems: 'center',
    fontSize: '16px',
  },
  validationStatusIconInvalid: {
    marginRight: '10px',
    color: '#dc2626',
    display: 'flex',
    alignItems: 'center',
    fontSize: '16px',
  },
  csvErrorPanel: {
    display: 'flex',
    padding: '12px 16px',
    backgroundColor: '#fef2f2',
    borderRadius: '8px',
    border: '1px solid #fecaca',
    alignItems: 'center',
    marginTop: '8px',
  },
  csvErrorIcon: {
    marginRight: '10px',
    color: '#dc2626',
    fontSize: '16px',
    flexShrink: 0,
  },
  csvErrorMessage: {
    fontSize: '14px',
    color: '#b91c1c',
    margin: 0,
    lineHeight: '1.4',
  },
  actionButtons: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '15px',
    paddingTop: '20px',
    borderTop: '1px solid #e5e7eb',
    flexShrink: 0,
  },
  cancelButton: {
    display: 'flex',
    alignItems: 'center',
    padding: '12px 24px',
    backgroundColor: '#f1f5f9',
    color: '#475569',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'all 0.2s',
    border: '1px solid #e2e8f0',
    minHeight: '44px',
    justifyContent: 'center',
  },
  cancelButtonHover: {
    backgroundColor: '#e2e8f0',
    transform: 'translateY(-2px)',
  },
  submitButton: {
    display: 'flex',
    alignItems: 'center',
    padding: '12px 24px',
    backgroundColor: '#395886',
    color: 'white',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'all 0.2s',
    border: 'none',
    minHeight: '44px',
    justifyContent: 'center',
  },
  submitButtonHover: {
    backgroundColor: '#2a4269',
    transform: 'translateY(-2px)',
  },
  buttonIcon: {
    marginRight: '8px',
    fontSize: '16px',
  },
  spinnerCircle: {
    opacity: 0.25,
  },
  spinnerPath: {
    opacity: 0.75,
  },
};

// Add hover effects using CSS-in-JS object merging
Object.assign(styles.uploadButton, {
  ':hover': styles.uploadButtonHover
});

Object.assign(styles.bulkUploadButton, {
  ':hover': styles.bulkUploadButtonHover
});

Object.assign(styles.cancelButton, {
  ':hover': styles.cancelButtonHover
});

Object.assign(styles.submitButton, {
  ':hover': styles.submitButtonHover
});

Object.assign(styles.closeButton, {
  ':hover': styles.closeButtonHover
});

Object.assign(styles.inputField, {
  ':focus': styles.inputFieldFocus
});

Object.assign(styles.selectField, {
  ':focus': styles.selectFieldFocus
});

Object.assign(styles.suggestionItem, {
  ':hover': styles.suggestionItemHover
});

export default styles;