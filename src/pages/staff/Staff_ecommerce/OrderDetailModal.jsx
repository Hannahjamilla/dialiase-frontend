// components/OrderDetailModal.js
import React, { useState } from 'react';
import { 
  FaTimes, 
  FaUser, 
  FaCalendar, 
  FaDollarSign, 
  FaShoppingCart,
  FaCheckCircle,
  FaClock,
  FaBox,
  FaReceipt,
  FaHospital,
  FaPhone,
  FaMapMarkerAlt
} from 'react-icons/fa';

const OrderDetailModal = ({ isOpen, onClose, order, onStatusUpdate, colors }) => {
  const [updatingStatus, setUpdatingStatus] = useState(false);

  if (!isOpen || !order) return null;

  const statusOptions = [
    { value: 'pending', label: 'Pending', color: colors.warning },
    { value: 'confirmed', label: 'Confirmed', color: colors.info },
    { value: 'ready_for_pickup', label: 'Ready for Pickup', color: colors.secondary },
    { value: 'completed', label: 'Completed', color: colors.success },
    { value: 'cancelled', label: 'Cancelled', color: colors.error }
  ];

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'PHP',
      minimumFractionDigits: 2
    }).format(amount || 0);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleStatusChange = async (newStatus) => {
    setUpdatingStatus(true);
    try {
      await onStatusUpdate(order.id, newStatus);
    } finally {
      setUpdatingStatus(false);
    }
  };

  const currentStatus = statusOptions.find(opt => opt.value === order.order_status);

  return (
    <div className="order-modal-overlay">
      <div className="order-modal">
        {/* Header */}
        <div className="modal-header">
          <div className="header-content">
            <FaReceipt className="header-icon" />
            <div>
              <h2 className="modal-title">Order Details</h2>
              <p className="order-reference">{order.order_reference}</p>
            </div>
          </div>
          <button className="close-button" onClick={onClose}>
            <FaTimes />
          </button>
        </div>

        <div className="modal-content">
          {/* Order Status Section */}
          <div className="status-section">
            <div className="current-status">
              <div 
                className="status-badge"
                style={{ 
                  backgroundColor: `${currentStatus?.color}15`,
                  color: currentStatus?.color,
                  border: `1px solid ${currentStatus?.color}30`
                }}
              >
                {currentStatus?.label}
              </div>
              <span className="status-label">Current Status</span>
            </div>
            
            <div className="status-actions">
              <label>Update Status:</label>
              <div className="status-buttons">
                {statusOptions.map(option => (
                  <button
                    key={option.value}
                    onClick={() => handleStatusChange(option.value)}
                    disabled={updatingStatus || order.order_status === option.value}
                    className={`status-button ${order.order_status === option.value ? 'active' : ''}`}
                    style={{
                      '--status-color': option.color
                    }}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Two Column Layout */}
          <div className="details-grid">
            {/* Patient Information */}
            <div className="detail-section">
              <h3 className="section-title">
                <FaUser className="section-icon" />
                Patient Information
              </h3>
              <div className="patient-info">
                <div className="info-item">
                  <strong>Name:</strong>
                  <span>{order.patient?.name || 'N/A'}</span>
                </div>
                <div className="info-item">
                  <strong>Hospital Number:</strong>
                  <span>{order.patient?.hospital_number || 'N/A'}</span>
                </div>
                <div className="info-item">
                  <strong>Contact:</strong>
                  <span>{order.patient?.phone || 'N/A'}</span>
                </div>
                <div className="info-item">
                  <strong>Address:</strong>
                  <span>{order.patient?.address || 'N/A'}</span>
                </div>
              </div>
            </div>

            {/* Order Information */}
            <div className="detail-section">
              <h3 className="section-title">
                <FaShoppingCart className="section-icon" />
                Order Information
              </h3>
              <div className="order-info">
                <div className="info-item">
                  <strong>Order Date:</strong>
                  <span>{formatDate(order.order_date)}</span>
                </div>
                <div className="info-item">
                  <strong>Scheduled Pickup:</strong>
                  <span>{order.scheduled_pickup_date ? formatDate(order.scheduled_pickup_date) : 'Not scheduled'}</span>
                </div>
                <div className="info-item">
                  <strong>Payment Method:</strong>
                  <span>{order.payment_method || 'N/A'}</span>
                </div>
                <div className="info-item">
                  <strong>Payment Status:</strong>
                  <span className={`payment-status ${order.payment_status}`}>
                    {order.payment_status || 'Unknown'}
                  </span>
                </div>
              </div>
            </div>

            {/* Order Items */}
            <div className="detail-section full-width">
              <h3 className="section-title">
                <FaBox className="section-icon" />
                Order Items ({order.items_count})
              </h3>
              <div className="order-items">
                {order.items && order.items.length > 0 ? (
                  <div className="items-list">
                    {order.items.map((item, index) => (
                      <div key={index} className="item-row">
                        <div className="item-name">{item.name}</div>
                        <div className="item-quantity">Qty: {item.quantity}</div>
                        <div className="item-price">{formatCurrency(item.price)}</div>
                        <div className="item-total">{formatCurrency(item.total)}</div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="no-items">No items found for this order.</p>
                )}
              </div>
            </div>

            {/* Order Summary */}
            <div className="detail-section full-width">
              <h3 className="section-title">
                <FaDollarSign className="section-icon" />
                Order Summary
              </h3>
              <div className="order-summary">
                <div className="summary-row">
                  <span>Subtotal:</span>
                  <span>{formatCurrency(order.subtotal)}</span>
                </div>
                <div className="summary-row">
                  <span>Tax:</span>
                  <span>{formatCurrency(order.tax_amount)}</span>
                </div>
                <div className="summary-row">
                  <span>Shipping:</span>
                  <span>{formatCurrency(order.shipping_amount)}</span>
                </div>
                <div className="summary-row total">
                  <span>Total Amount:</span>
                  <span>{formatCurrency(order.total_amount)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="modal-footer">
          <button className="secondary-button" onClick={onClose}>
            Close
          </button>
          <button 
            className="primary-button"
            onClick={() => window.print()}
          >
            Print Order
          </button>
        </div>

        <style jsx>{`
          .order-modal-overlay {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0, 0, 0, 0.6);
            backdrop-filter: blur(8px);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 10000;
            padding: 2rem;
          }

          .order-modal {
            background: ${colors.white};
            border-radius: 16px;
            width: 90%;
            max-width: 800px;
            max-height: 90vh;
            display: flex;
            flex-direction: column;
            box-shadow: 0 25px 50px rgba(0, 0, 0, 0.25);
            animation: modalSlideIn 0.3s ease;
          }

          @keyframes modalSlideIn {
            from {
              opacity: 0;
              transform: scale(0.9) translateY(20px);
            }
            to {
              opacity: 1;
              transform: scale(1) translateY(0);
            }
          }

          .modal-header {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            padding: 2rem 2rem 1rem;
            border-bottom: 1px solid ${colors.border};
          }

          .header-content {
            display: flex;
            align-items: center;
            gap: 1rem;
          }

          .header-icon {
            font-size: 2rem;
            color: ${colors.primary};
          }

          .modal-title {
            margin: 0 0 0.25rem 0;
            font-size: 1.5rem;
            font-weight: 700;
            color: ${colors.textDark};
          }

          .order-reference {
            margin: 0;
            color: ${colors.darkGray};
            font-size: 0.875rem;
            font-family: 'Courier New', monospace;
          }

          .close-button {
            background: none;
            border: none;
            font-size: 1.25rem;
            color: ${colors.darkGray};
            cursor: pointer;
            padding: 0.5rem;
            border-radius: 8px;
            transition: all 0.3s ease;
          }

          .close-button:hover {
            background: ${colors.lightGray};
            color: ${colors.textDark};
          }

          .modal-content {
            flex: 1;
            padding: 1.5rem 2rem;
            overflow-y: auto;
          }

          .status-section {
            background: ${colors.lightGray};
            border-radius: 12px;
            padding: 1.5rem;
            margin-bottom: 2rem;
            display: flex;
            justify-content: space-between;
            align-items: center;
            gap: 2rem;
          }

          .current-status {
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 0.5rem;
          }

          .status-badge {
            padding: 0.75rem 1.5rem;
            border-radius: 25px;
            font-weight: 600;
            font-size: 0.875rem;
            text-transform: uppercase;
            letter-spacing: 0.5px;
          }

          .status-label {
            font-size: 0.75rem;
            color: ${colors.darkGray};
            font-weight: 500;
          }

          .status-actions {
            flex: 1;
          }

          .status-actions label {
            display: block;
            font-size: 0.875rem;
            font-weight: 600;
            color: ${colors.textDark};
            margin-bottom: 0.75rem;
          }

          .status-buttons {
            display: flex;
            gap: 0.5rem;
            flex-wrap: wrap;
          }

          .status-button {
            padding: 0.5rem 1rem;
            background: ${colors.white};
            border: 1px solid ${colors.border};
            border-radius: 6px;
            color: ${colors.textLight};
            cursor: pointer;
            font-size: 0.75rem;
            font-weight: 500;
            transition: all 0.3s ease;
          }

          .status-button:hover:not(:disabled) {
            border-color: var(--status-color);
            color: var(--status-color);
            transform: translateY(-1px);
          }

          .status-button.active {
            background: var(--status-color);
            color: ${colors.white};
            border-color: var(--status-color);
          }

          .status-button:disabled {
            opacity: 0.5;
            cursor: not-allowed;
          }

          .details-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 1.5rem;
          }

          .detail-section {
            background: ${colors.white};
            border: 1px solid ${colors.border};
            border-radius: 12px;
            padding: 1.5rem;
          }

          .detail-section.full-width {
            grid-column: 1 / -1;
          }

          .section-title {
            display: flex;
            align-items: center;
            gap: 0.5rem;
            font-size: 1.125rem;
            font-weight: 600;
            color: ${colors.textDark};
            margin: 0 0 1rem 0;
          }

          .section-icon {
            color: ${colors.primary};
          }

          .patient-info,
          .order-info {
            display: flex;
            flex-direction: column;
            gap: 0.75rem;
          }

          .info-item {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            gap: 1rem;
          }

          .info-item strong {
            color: ${colors.textDark};
            font-weight: 600;
            min-width: 120px;
          }

          .info-item span {
            color: ${colors.textLight};
            text-align: right;
            flex: 1;
          }

          .payment-status {
            padding: 0.25rem 0.5rem;
            border-radius: 4px;
            font-size: 0.75rem;
            font-weight: 600;
            text-transform: capitalize;
          }

          .payment-status.paid {
            background: ${colors.success}15;
            color: ${colors.success};
          }

          .payment-status.pending {
            background: ${colors.warning}15;
            color: ${colors.warning};
          }

          .order-items {
            margin-top: 1rem;
          }

          .items-list {
            display: flex;
            flex-direction: column;
            gap: 0.75rem;
          }

          .item-row {
            display: grid;
            grid-template-columns: 2fr 1fr 1fr 1fr;
            gap: 1rem;
            padding: 1rem;
            background: ${colors.lightGray};
            border-radius: 8px;
            align-items: center;
          }

          .item-name {
            font-weight: 500;
            color: ${colors.textDark};
          }

          .item-quantity,
          .item-price,
          .item-total {
            color: ${colors.textLight};
            font-size: 0.875rem;
          }

          .item-total {
            font-weight: 600;
            color: ${colors.textDark};
          }

          .no-items {
            text-align: center;
            color: ${colors.darkGray};
            font-style: italic;
            padding: 2rem;
          }

          .order-summary {
            display: flex;
            flex-direction: column;
            gap: 0.75rem;
            margin-top: 1rem;
          }

          .summary-row {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 0.5rem 0;
          }

          .summary-row.total {
            border-top: 2px solid ${colors.border};
            padding-top: 1rem;
            font-weight: 700;
            font-size: 1.125rem;
            color: ${colors.textDark};
          }

          .modal-footer {
            padding: 1.5rem 2rem;
            border-top: 1px solid ${colors.border};
            display: flex;
            gap: 1rem;
            justify-content: flex-end;
          }

          .primary-button,
          .secondary-button {
            padding: 0.875rem 2rem;
            border: none;
            border-radius: 8px;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.3s ease;
            font-size: 0.875rem;
          }

          .primary-button {
            background: ${colors.primary};
            color: white;
          }

          .primary-button:hover {
            background: ${colors.primaryDark};
            transform: translateY(-1px);
          }

          .secondary-button {
            background: ${colors.white};
            color: ${colors.textLight};
            border: 1px solid ${colors.border};
          }

          .secondary-button:hover {
            border-color: ${colors.primary};
            color: ${colors.primary};
          }

          @media (max-width: 768px) {
            .order-modal-overlay {
              padding: 1rem;
            }

            .order-modal {
              width: 95%;
              max-height: 95vh;
            }

            .modal-header {
              padding: 1.5rem 1rem 1rem;
            }

            .modal-content {
              padding: 1rem;
            }

            .status-section {
              flex-direction: column;
              align-items: stretch;
              gap: 1rem;
            }

            .details-grid {
              grid-template-columns: 1fr;
            }

            .item-row {
              grid-template-columns: 1fr;
              gap: 0.5rem;
              text-align: center;
            }

            .modal-footer {
              padding: 1rem;
              flex-direction: column;
            }

            .primary-button,
            .secondary-button {
              width: 100%;
            }
          }
        `}</style>
      </div>
    </div>
  );
};

export default OrderDetailModal;