import React from 'react';
import { FiCheck, FiClock, FiPackage, FiCalendar, FiCreditCard, FiMapPin, FiPrinter, FiDownload } from 'react-icons/fi';

const OrderSuccessReceipt = ({ orderDetails, colors, onClose }) => {
  const isPaid = orderDetails.paymentStatus === 'paid';
  
  const handlePrint = () => {
    window.print();
  };

  const generatePDF = () => {
    // Create a printable version of the receipt
    const printWindow = window.open('', '_blank');
    const receiptContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Receipt - Order #${orderDetails.orderId}</title>
        <style>
          body { 
            font-family: 'Arial', sans-serif; 
            margin: 0; 
            padding: 2rem; 
            color: #333;
            background: white;
          }
          .receipt-container {
            max-width: 800px;
            margin: 0 auto;
            border: 2px solid #000;
            padding: 2rem;
          }
          .header {
            text-align: center;
            border-bottom: 2px solid #000;
            padding-bottom: 1.5rem;
            margin-bottom: 2rem;
          }
          .clinic-name {
            font-size: 1.8rem;
            font-weight: bold;
            margin-bottom: 0.5rem;
          }
          .clinic-address {
            font-size: 1rem;
            color: #666;
            margin-bottom: 1rem;
          }
          .receipt-title {
            font-size: 1.4rem;
            font-weight: bold;
            margin: 1rem 0;
          }
          .order-info {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 2rem;
            margin-bottom: 2rem;
          }
          .section {
            margin-bottom: 1.5rem;
          }
          .section-title {
            font-weight: bold;
            font-size: 1.1rem;
            margin-bottom: 1rem;
            border-bottom: 1px solid #ccc;
            padding-bottom: 0.5rem;
            color: #000;
          }
          .info-row {
            display: flex;
            justify-content: space-between;
            margin-bottom: 0.5rem;
          }
          .items-table {
            width: 100%;
            border-collapse: collapse;
            margin: 1rem 0;
          }
          .items-table th {
            background: #f5f5f5;
            padding: 0.75rem;
            text-align: left;
            border-bottom: 2px solid #000;
            font-weight: bold;
          }
          .items-table td {
            padding: 0.75rem;
            border-bottom: 1px solid #ddd;
          }
          .total-row {
            font-weight: bold;
            border-top: 2px solid #000;
          }
          .status-badge {
            background: ${isPaid ? '#d4edda' : '#fff3cd'};
            color: ${isPaid ? '#155724' : '#856404'};
            padding: 0.25rem 0.75rem;
            border-radius: 4px;
            font-weight: bold;
            font-size: 0.9rem;
          }
          .footer {
            text-align: center;
            margin-top: 2rem;
            padding-top: 1rem;
            border-top: 1px solid #ccc;
            color: #666;
            font-size: 0.9rem;
          }
          @media print {
            body { margin: 0; padding: 0; }
            .receipt-container { border: none; padding: 0; }
          }
        </style>
      </head>
      <body>
        <div class="receipt-container">
          <div class="header">
            <div class="clinic-name">CAPD MEDICAL CLINIC</div>
            <div class="clinic-address">Main Building, Ground Floor • (02) 8123-4567</div>
            <div class="receipt-title">${isPaid ? 'PAYMENT RECEIPT' : 'RESERVATION CONFIRMATION'}</div>
          </div>

          <div class="order-info">
            <div class="section">
              <div class="section-title">ORDER DETAILS</div>
              <div class="info-row">
                <span>Order Reference:</span>
                <span><strong>#${orderDetails.orderId}</strong></span>
              </div>
              <div class="info-row">
                <span>Date Issued:</span>
                <span>${new Date().toLocaleDateString('en-US', { 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}</span>
              </div>
              <div class="info-row">
                <span>Payment Method:</span>
                <span>${orderDetails.paymentMethod === 'card' ? 'Credit/Debit Card' : 
                       orderDetails.paymentMethod === 'gcash' ? 'GCash' : 
                       'Pay at Clinic'}</span>
              </div>
              <div class="info-row">
                <span>Status:</span>
                <span class="status-badge">${orderDetails.paymentStatus === 'paid' ? 'PAID' : 'PENDING PAYMENT'}</span>
              </div>
            </div>

            <div class="section">
              <div class="section-title">PICKUP INFORMATION</div>
              <div class="info-row">
                <span>Scheduled Date:</span>
                <span><strong>${new Date(orderDetails.pickupDate).toLocaleDateString('en-US', { 
                  weekday: 'long',
                  month: 'long',
                  day: 'numeric',
                  year: 'numeric'
                })}</strong></span>
              </div>
              <div class="info-row">
                <span>Location:</span>
                <span>CAPD Clinic Main Building</span>
              </div>
              <div style="margin-top: 1rem; padding: 0.75rem; background: #f8f9fa; border-radius: 4px;">
                <strong>Please bring:</strong> Valid ID and this receipt for verification
              </div>
            </div>
          </div>

          <div class="section">
            <div class="section-title">ORDER ITEMS</div>
            <table class="items-table">
              <thead>
                <tr>
                  <th>Item Description</th>
                  <th>Quantity</th>
                  <th>Unit Price</th>
                  <th>Amount</th>
                </tr>
              </thead>
              <tbody>
                ${orderDetails.items.map(item => `
                  <tr>
                    <td>${item.name}</td>
                    <td>${item.quantity}</td>
                    <td>₱${item.price.toLocaleString()}</td>
                    <td>₱${(item.quantity * item.price).toLocaleString()}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>

          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 2rem; margin-top: 2rem;">
            <div>
              ${orderDetails.discountApplied > 0 ? `
                <div class="info-row">
                  <span>Subtotal:</span>
                  <span>₱${(orderDetails.total / (1 - orderDetails.discountApplied / 100)).toLocaleString()}</span>
                </div>
                <div class="info-row">
                  <span>Discount (${orderDetails.discountApplied}%):</span>
                  <span>-₱${((orderDetails.total / (1 - orderDetails.discountApplied / 100)) - orderDetails.total).toLocaleString()}</span>
                </div>
              ` : ''}
            </div>
            <div style="border-left: 2px solid #000; padding-left: 2rem;">
              <div class="info-row" style="font-size: 1.2rem; font-weight: bold;">
                <span>TOTAL AMOUNT:</span>
                <span>₱${orderDetails.total.toLocaleString()}</span>
              </div>
            </div>
          </div>

          <div class="footer">
            <div>Thank you for choosing CAPD Medical Clinic</div>
            <div>For inquiries: (02) 8123-4567 • info@capdclinic.com</div>
            <div style="margin-top: 1rem; font-size: 0.8rem;">
              Receipt ID: ${orderDetails.orderId} • Generated on: ${new Date().toLocaleString()}
            </div>
          </div>
        </div>
      </body>
      </html>
    `;

    printWindow.document.write(receiptContent);
    printWindow.document.close();
    
    // Wait for content to load then trigger print
    setTimeout(() => {
      printWindow.print();
      // Optional: Close window after print
      // printWindow.close();
    }, 500);
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100vw',
      height: '100vh',
      backgroundColor: 'rgba(0,0,0,0.6)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 2000
    }} onClick={onClose}>
      <div id="order-receipt" style={{
        backgroundColor: colors.white,
        borderRadius: '12px',
        padding: '3rem',
        maxWidth: '800px',
        width: '95%',
        maxHeight: '90vh',
        overflow: 'auto',
        boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
        display: 'flex',
        flexDirection: 'column'
      }} onClick={(e) => e.stopPropagation()}>
        
        {/* Header */}
        <div style={{
          textAlign: 'center',
          marginBottom: '2.5rem',
          paddingBottom: '2rem',
          borderBottom: `2px solid ${colors.border}`
        }}>
          <div style={{
            width: '70px',
            height: '70px',
            borderRadius: '50%',
            backgroundColor: isPaid ? `${colors.success}08` : `${colors.warning}08`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 1.5rem auto',
            color: isPaid ? colors.success : colors.warning,
            fontSize: '1.8rem',
            border: `2px solid ${isPaid ? colors.success : colors.warning}`
          }}>
            {isPaid ? <FiCheck /> : <FiClock />}
          </div>
          
          <h2 style={{ 
            color: colors.text, 
            marginBottom: '0.75rem',
            fontSize: '1.8rem',
            fontWeight: '600'
          }}>
            {isPaid ? 'Payment Confirmed' : 'Reservation Confirmed'}
          </h2>
          
          <p style={{ 
            color: colors.textMuted, 
            marginBottom: '0',
            lineHeight: '1.6',
            fontSize: '1.1rem'
          }}>
            {isPaid 
              ? 'Your order has been successfully processed and payment has been received.'
              : 'Your items have been reserved for pickup. Payment will be collected at the clinic.'
            }
          </p>
        </div>

        {/* Main Content - Horizontal Layout */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '2.5rem',
          marginBottom: '2.5rem'
        }}>
          
          {/* Left Column - Order Summary */}
          <div>
            <h3 style={{ 
              color: colors.text,
              marginBottom: '1.5rem',
              fontSize: '1.3rem',
              fontWeight: '600',
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem'
            }}>
              <FiPackage />
              Order Summary
            </h3>
            
            <div style={{
              backgroundColor: colors.subtle,
              padding: '1.5rem',
              borderRadius: '8px',
              border: `1px solid ${colors.border}`
            }}>
              <div style={{ display: 'grid', gap: '1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ color: colors.textMuted, fontWeight: '500', fontSize: '0.95rem' }}>Order Reference:</span>
                  <span style={{ color: colors.text, fontWeight: '600', fontSize: '0.95rem' }}>
                    #{orderDetails.orderId}
                  </span>
                </div>
                
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ color: colors.textMuted, fontWeight: '500', fontSize: '0.95rem' }}>Total Amount:</span>
                  <span style={{ color: colors.text, fontWeight: '700', fontSize: '1.1rem' }}>
                    ₱{orderDetails.total.toLocaleString()}
                  </span>
                </div>
                
                {orderDetails.discountApplied > 0 && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ color: colors.success, fontWeight: '500', fontSize: '0.95rem' }}>Discount Applied:</span>
                    <span style={{ color: colors.success, fontWeight: '600', fontSize: '0.95rem' }}>
                      {orderDetails.discountApplied}%
                    </span>
                  </div>
                )}
                
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ color: colors.textMuted, fontWeight: '500', fontSize: '0.95rem' }}>Payment Method:</span>
                  <span style={{ color: colors.text, fontWeight: '600', fontSize: '0.95rem' }}>
                    {orderDetails.paymentMethod === 'card' ? 'Credit/Debit Card' : 
                     orderDetails.paymentMethod === 'gcash' ? 'GCash' : 
                     'Pay at Clinic'}
                  </span>
                </div>
                
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ color: colors.textMuted, fontWeight: '500', fontSize: '0.95rem' }}>Status:</span>
                  <span style={{ 
                    color: orderDetails.paymentStatus === 'paid' ? colors.success : colors.warning, 
                    fontWeight: '600',
                    backgroundColor: orderDetails.paymentStatus === 'paid' ? `${colors.success}08` : `${colors.warning}08`,
                    padding: '0.4rem 1rem',
                    borderRadius: '6px',
                    fontSize: '0.85rem',
                    border: `1px solid ${orderDetails.paymentStatus === 'paid' ? colors.success : colors.warning}20`
                  }}>
                    {orderDetails.paymentStatus === 'paid' ? 'PAID' : 'PENDING'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Pickup Information */}
          <div>
            <h3 style={{ 
              color: colors.text,
              marginBottom: '1.5rem',
              fontSize: '1.3rem',
              fontWeight: '600',
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem'
            }}>
              <FiCalendar />
              Pickup Details
            </h3>
            
            <div style={{
              backgroundColor: colors.subtle,
              padding: '1.5rem',
              borderRadius: '8px',
              border: `1px solid ${colors.border}`
            }}>
              <div style={{ display: 'grid', gap: '1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ color: colors.textMuted, fontWeight: '500', fontSize: '0.95rem' }}>Scheduled Date:</span>
                  <span style={{ color: colors.text, fontWeight: '600', fontSize: '0.95rem' }}>
                    {new Date(orderDetails.pickupDate).toLocaleDateString('en-US', { 
                      weekday: 'long',
                      month: 'long',
                      day: 'numeric',
                      year: 'numeric'
                    })}
                  </span>
                </div>
                
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'flex-start', 
                  gap: '0.75rem',
                  padding: '1rem',
                  backgroundColor: `${colors.primary}05`,
                  borderRadius: '6px',
                  border: `1px solid ${colors.primary}15`
                }}>
                  <FiMapPin color={colors.primary} style={{ marginTop: '0.1rem', flexShrink: 0 }} />
                  <div>
                    <div style={{ color: colors.primary, fontWeight: '600', fontSize: '0.95rem', marginBottom: '0.25rem' }}>
                      CAPD Clinic - Main Building
                    </div>
                    <div style={{ color: colors.textMuted, fontSize: '0.85rem', lineHeight: '1.4' }}>
                      Ground Floor Reception<br />
                      Please present valid identification
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Order Items Section */}
        {orderDetails.items && (
          <div style={{
            marginBottom: '2.5rem'
          }}>
            <h3 style={{ 
              color: colors.text,
              marginBottom: '1.5rem',
              fontSize: '1.3rem',
              fontWeight: '600'
            }}>
              Order Items
            </h3>
            
            <div style={{
              backgroundColor: colors.subtle,
              borderRadius: '8px',
              border: `1px solid ${colors.border}`,
              overflow: 'hidden'
            }}>
              {orderDetails.items.map((item, index) => (
                <div key={index} style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '1.25rem 1.5rem',
                  backgroundColor: index % 2 === 0 ? colors.white : colors.subtle,
                  borderBottom: index < orderDetails.items.length - 1 ? `1px solid ${colors.border}` : 'none'
                }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ color: colors.text, fontWeight: '600', fontSize: '1rem', marginBottom: '0.25rem' }}>
                      {item.name}
                    </div>
                    <div style={{ color: colors.textMuted, fontSize: '0.9rem' }}>
                      Quantity: {item.quantity} × ₱{item.price.toLocaleString()}
                    </div>
                  </div>
                  <div style={{ 
                    color: colors.text, 
                    fontWeight: '700', 
                    fontSize: '1.1rem',
                    minWidth: '100px',
                    textAlign: 'right'
                  }}>
                    ₱{(item.quantity * item.price).toLocaleString()}
                  </div>
                </div>
              ))}
              
              {/* Total Row */}
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '1.5rem',
                backgroundColor: colors.white,
                borderTop: `2px solid ${colors.border}`
              }}>
                <div style={{ color: colors.text, fontWeight: '600', fontSize: '1.1rem' }}>
                  Total Amount
                </div>
                <div style={{ color: colors.text, fontWeight: '700', fontSize: '1.3rem' }}>
                  ₱{orderDetails.total.toLocaleString()}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Footer Actions */}
        <div style={{
          display: 'flex',
          gap: '1rem',
          marginTop: 'auto'
        }}>
          <button
            onClick={generatePDF}
            style={{
              flex: 1,
              padding: '1rem 1.5rem',
              backgroundColor: 'transparent',
              color: colors.text,
              border: `1px solid ${colors.border}`,
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: '600',
              fontSize: '1rem',
              transition: 'all 0.3s ease',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.75rem'
            }}
            onMouseEnter={(e) => {
              e.target.style.backgroundColor = colors.subtle;
              e.target.style.borderColor = colors.primary;
            }}
            onMouseLeave={(e) => {
              e.target.style.backgroundColor = 'transparent';
              e.target.style.borderColor = colors.border;
            }}
          >
            <FiDownload size={18} />
            Download PDF Receipt
          </button>

          <button
            onClick={handlePrint}
            style={{
              flex: 1,
              padding: '1rem 1.5rem',
              backgroundColor: 'transparent',
              color: colors.text,
              border: `1px solid ${colors.border}`,
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: '600',
              fontSize: '1rem',
              transition: 'all 0.3s ease',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.75rem'
            }}
            onMouseEnter={(e) => {
              e.target.style.backgroundColor = colors.subtle;
              e.target.style.borderColor = colors.primary;
            }}
            onMouseLeave={(e) => {
              e.target.style.backgroundColor = 'transparent';
              e.target.style.borderColor = colors.border;
            }}
          >
            <FiPrinter size={18} />
            Print Receipt
          </button>

          <button
            onClick={onClose}
            style={{
              flex: 1,
              padding: '1rem 1.5rem',
              backgroundColor: colors.primary,
              color: colors.white,
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: '600',
              fontSize: '1rem',
              transition: 'all 0.3s ease'
            }}
            onMouseEnter={(e) => {
              e.target.style.backgroundColor = colors.accent;
            }}
            onMouseLeave={(e) => {
              e.target.style.backgroundColor = colors.primary;
            }}
          >
            Continue
          </button>
        </div>

        {/* Database Status */}
        {orderDetails.savedToDatabase && (
          <div style={{
            backgroundColor: `${colors.success}08`,
            border: `1px solid ${colors.success}20`,
            borderRadius: '6px',
            padding: '1rem',
            marginTop: '1.5rem',
            textAlign: 'center'
          }}>
            <div style={{ color: colors.success, fontWeight: '500', fontSize: '0.9rem' }}>
              Order record has been saved to the database
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default OrderSuccessReceipt;