import React, { useState, useEffect } from 'react';
import { FiInfo, FiHelpCircle, FiDownload, FiUpload, FiCheckCircle, FiAlertCircle } from 'react-icons/fi';
import { saveAs } from 'file-saver';
import { ResizableBox } from 'react-resizable';
import 'react-resizable/css/styles.css';

const CSVPreviewPanel = ({ csvUploaded, previewData, csvData, registeredEmployees, currentEmployeeMatch }) => {
  const [panelHeight, setPanelHeight] = useState(400);
  const [columnWidths, setColumnWidths] = useState({});

  useEffect(() => {
    if (previewData[0]) {
      const headers = getOrderedHeaders();
      const initialWidths = {};
      headers.forEach(h => {
        initialWidths[h] = h === 'suffix' ? 70 : 150;
      });
      initialWidths['status'] = 150;
      setColumnWidths(initialWidths);
    }
  }, [previewData]);

  const isEmployeeRegistered = (firstName, lastName, position) => {
    return registeredEmployees.some(emp =>
      emp.first_name.toLowerCase() === firstName.toLowerCase() &&
      emp.last_name.toLowerCase() === lastName.toLowerCase() &&
      emp.userLevel.toLowerCase() === position.toLowerCase()
    );
  };

  const isCurrentEmployee = (row) => {
    if (!currentEmployeeMatch) return false;
    return (
      row.first_name?.toString().toLowerCase() === currentEmployeeMatch.first_name?.toString().toLowerCase() &&
      row.last_name?.toString().toLowerCase() === currentEmployeeMatch.last_name?.toString().toLowerCase()
    );
  };

  const getOrderedHeaders = () => {
    if (!previewData[0]) return [];
    const headers = Object.keys(previewData[0]);
    const desiredOrder = ['first_name', 'middle_name', 'last_name', 'suffix', 'email', 'userLevel'];
    const remainingHeaders = headers.filter(h => !desiredOrder.includes(h));
    return [...desiredOrder, ...remainingHeaders];
  };

  const orderedHeaders = getOrderedHeaders();

  const handleColumnResize = (header, data) => {
    setColumnWidths(prev => ({
      ...prev,
      [header]: data.size.width
    }));
  };

  return (
    <div style={{
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      maxWidth: '100%',
      margin: '0 auto',
      padding: '0.5rem'
    }}>
      <div style={{
        backgroundColor: '#ffffff',
        border: '1px solid #e2e8f0',
        borderRadius: '8px',
        padding: '1rem',
        height: '100%',
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
        display: 'flex',
        flexDirection: 'column'
      }}>
        <h3 style={{
          fontSize: '1rem',
          fontWeight: '600',
          color: '#1e293b',
          marginBottom: '0.5rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.4rem'
        }}>
          <FiInfo style={{ color: '#3b82f6' }} />
          {csvUploaded ? 'CSV Preview' : 'Uploaded File Preview'}
        </h3>

        {csvUploaded ? (
          <>
            <ResizableBox
              width={Infinity}
              height={panelHeight}
              minConstraints={[100, 200]}
              maxConstraints={[Infinity, 800]}
              axis="y"
              resizeHandles={['s']}
              onResize={(e, data) => setPanelHeight(data.size.height)}
              style={{
                backgroundColor: 'white',
                border: '1px solid #e2e8f0',
                borderRadius: '6px',
                overflow: 'hidden',
                marginBottom: '0.75rem',
                boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)',
                display: 'flex',
                flexDirection: 'column'
              }}
            >
              {/* Table Header */}
              <div style={{
                display: 'flex',
                backgroundColor: '#f1f5f9',
                borderBottom: '1px solid #e2e8f0',
                padding: '0.5rem',
                fontWeight: '500',
                fontSize: '0.8rem',
                color: '#475569',
                position: 'sticky',
                top: 0,
                zIndex: 1
              }}>
                {orderedHeaders.map((header, index) => (
                  <ResizableBox
                    key={index}
                    width={columnWidths[header] || 150}
                    height={30}
                    axis="x"
                    resizeHandles={['e']}
                    minConstraints={[70, 30]}
                    maxConstraints={[400, 30]}
                    onResize={(e, data) => handleColumnResize(header, data)}
                    handle={
                      <span style={{ cursor: 'col-resize', padding: '0 4px', userSelect: 'none' }}>⋮</span>
                    }
                  >
                    <div style={{
                      padding: '0 0.4rem',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      textTransform: 'capitalize'
                    }}>
                      {header.replace(/_/g, ' ')}
                    </div>
                  </ResizableBox>
                ))}
                <ResizableBox
                  width={columnWidths['status'] || 150}
                  height={30}
                  axis="x"
                  resizeHandles={['e']}
                  minConstraints={[100, 30]}
                  maxConstraints={[400, 30]}
                  onResize={(e, data) => handleColumnResize('status', data)}
                  handle={
                    <span style={{ cursor: 'col-resize', padding: '0 4px', userSelect: 'none' }}>⋮</span>
                  }
                >
                  <div>Status</div>
                </ResizableBox>
              </div>

              {/* Table Rows */}
              <div style={{ flex: 1, overflowY: 'auto' }}>
                {previewData.map((row, rowIndex) => {
                  const isRegistered = isEmployeeRegistered(row.first_name || '', row.last_name || '', row.userLevel || '');
                  const isCurrent = isCurrentEmployee(row);

                  return (
                    <div
                      key={rowIndex}
                      style={{
                        display: 'flex',
                        borderBottom: '1px solid #e2e8f0',
                        padding: '0.5rem',
                        fontSize: '0.8rem',
                        color: '#475569',
                        backgroundColor: isCurrent ? '#eff6ff' : isRegistered ? '#f0fdf4' : 'white',
                        borderLeft: isCurrent ? '3px solid #3b82f6' : 'none'
                      }}
                    >
                      {orderedHeaders.map((key, colIndex) => (
                        <div
                          key={colIndex}
                          style={{
                            width: columnWidths[key] || 150,
                            padding: '0 0.4rem',
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            fontWeight: isCurrent ? '500' : 'normal'
                          }}
                        >
                          {row[key] || '-'}
                        </div>
                      ))}
                      <div style={{
                        width: columnWidths['status'] || 150,
                        padding: '0 0.4rem',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.25rem',
                        color: isRegistered ? '#15803d' : isCurrent ? '#1d4ed8' : '#64748b',
                        fontWeight: isCurrent ? '500' : 'normal'
                      }}>
                        {isRegistered ? (
                          <>
                            <FiCheckCircle size={14} /> Registered
                          </>
                        ) : isCurrent ? (
                          <>
                            <FiInfo size={14} color="#1d4ed8" /> Current selection
                          </>
                        ) : 'Not registered'}
                      </div>
                    </div>
                  );
                })}
              </div>
            </ResizableBox>

            {/* Info Section */}
            <div style={{
              backgroundColor: '#f8fafc',
              border: '1px solid #e2e8f0',
              borderRadius: '6px',
              padding: '0.6rem',
              marginBottom: '0.75rem',
              fontSize: '0.75rem'
            }}>
              <p style={{
                color: '#64748b',
                margin: 0,
                display: 'flex',
                alignItems: 'flex-start',
                gap: '0.4rem',
                lineHeight: '1.4'
              }}>
                <FiHelpCircle style={{
                  color: '#64748b',
                  marginTop: '0.1rem',
                  flexShrink: 0
                }} />
                <span>Showing {previewData.length} of {csvData.length} rows. {currentEmployeeMatch && 'Current selection highlighted in blue.'}</span>
              </p>
            </div>

            {/* Download Button */}
            <button
              onClick={() => {
                const csvContent = [
                  orderedHeaders,
                  ...csvData.map(row => orderedHeaders.map(h => row[h] || ''))
                ].map(e => e.join(",")).join("\n");

                const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
                saveAs(blob, `employee_list_${new Date().toISOString().slice(0, 10)}.csv`);
              }}
              style={{
                padding: '0.5rem 1rem',
                borderRadius: '6px',
                color: '#1e40af',
                backgroundColor: '#dbeafe',
                fontSize: '0.8rem',
                fontWeight: '500',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
                border: 'none',
                transition: 'all 0.2s',
                boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)'
              }}
            >
              <FiDownload style={{ fontSize: '0.85rem' }} /> Download Full CSV
            </button>
          </>
        ) : (
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            height: '100%',
            minHeight: '300px',
            border: '2px dashed #cbd5e1',
            borderRadius: '6px',
            backgroundColor: '#f8fafc',
            color: '#64748b',
            textAlign: 'center',
            padding: '1.5rem',
            flex: 1
          }}>
            <FiUpload style={{
              fontSize: '2rem',
              marginBottom: '1rem',
              color: '#94a3b8',
              opacity: 0.7
            }} />
            <p style={{
              fontSize: '0.9rem',
              marginBottom: '0.5rem',
              fontWeight: '500',
              color: '#475569'
            }}>
              No file uploaded yet
            </p>
            <p style={{
              fontSize: '0.75rem',
              lineHeight: '1.4',
              maxWidth: '260px'
            }}>
              Upload a CSV file to preview its contents here and validate employee data
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CSVPreviewPanel;