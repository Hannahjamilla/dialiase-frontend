import React, { useState, useEffect } from 'react';
import { 
  FiX, 
  FiCreditCard, 
  FiPackage, 
  FiCheck,
  FiAlertCircle,
  FiCalendar,
  FiShoppingBag,
  FiAward,
  FiInfo,
  FiLoader,
  FiClock,
  FiShield,
  FiLock,
  FiArrowLeft,
  FiArrowRight,
  FiDollarSign
} from 'react-icons/fi';
import CAPDQuizGame from './CAPDQuizGame';
import OrderSuccessReceipt from './OrderSuccessReceipt';
import PaymentProcessingModal from './PaymentProcessingModal';
import AreYouSureModal from './AreYouSureModal';

const CheckoutModal = ({ 
  isOpen, 
  onClose, 
  cart, 
  updateQuantity, 
  removeFromCart, 
  getTotalPrice, 
  getTotalCartItems, 
  getProductImage,
  colors,
  fetchCart
}) => {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [orderDetails, setOrderDetails] = useState(null);
  const [paymentProcessing, setPaymentProcessing] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('reserve_only');
  const [availablePickupDates, setAvailablePickupDates] = useState([]);
  const [selectedPickupDate, setSelectedPickupDate] = useState('');
  const [errors, setErrors] = useState({});
  const [earnedDiscount, setEarnedDiscount] = useState(0);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState('idle');
  const [showQuiz, setShowQuiz] = useState(false);
  const [showReserveConfirmation, setShowReserveConfirmation] = useState(false);
  const [cardDetails, setCardDetails] = useState({
    number: '',
    expiry: '',
    cvv: '',
    name: ''
  });

  // API Base URL
  const API_BASE = 'http://localhost:8000/api';

  // Enhanced API request helper
  const apiRequest = async (url, options = {}) => {
    const token = localStorage.getItem('auth_token') || 
                  localStorage.getItem('token') ||
                  sessionStorage.getItem('auth_token') ||
                  sessionStorage.getItem('token');

    if (!token) {
      throw new Error('No authentication token found. Please log in again.');
    }

    const config = {
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': `Bearer ${token}`,
        ...options.headers,
      },
      credentials: 'include',
      ...options,
    };

    try {
      const response = await fetch(`${API_BASE}${url}`, config);
      
      if (response.status === 401) {
        localStorage.removeItem('auth_token');
        localStorage.removeItem('token');
        sessionStorage.removeItem('auth_token');
        sessionStorage.removeItem('token');
        throw new Error('Authentication failed. Please log in again.');
      }

      if (response.status === 419) {
        throw new Error('Session expired. Please refresh the page and try again.');
      }

      if (!response.ok) {
        const errorText = await response.text();
        try {
          const errorData = JSON.parse(errorText);
          throw new Error(errorData.message || `HTTP ${response.status}: ${errorText}`);
        } catch (e) {
          throw new Error(`HTTP ${response.status}: ${errorText}`);
        }
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  };

  // Check authentication status
  const checkAuthentication = () => {
    const token = localStorage.getItem('auth_token') || 
                  localStorage.getItem('token') ||
                  sessionStorage.getItem('auth_token') ||
                  sessionStorage.getItem('token');
    
    if (!token) {
      setErrors({ 
        auth: 'Please log in to complete your order.' 
      });
      return false;
    }
    
    return true;
  };

  // Fetch available pickup dates from user's schedule
  const fetchAvailablePickupDates = async () => {
    try {
      const response = await apiRequest('/checkout/available-pickup-dates');
      if (response.success && response.dates.length > 0) {
        setAvailablePickupDates(response.dates);
        setSelectedPickupDate(response.dates[0].date);
      } else {
        // Use default dates if no schedules found
        setAvailablePickupDates(getDefaultPickupDates());
        if (getDefaultPickupDates().length > 0) {
          setSelectedPickupDate(getDefaultPickupDates()[0].date);
        }
      }
    } catch (error) {
      console.error('Error fetching pickup dates:', error);
      // Use default dates as fallback
      setAvailablePickupDates(getDefaultPickupDates());
      if (getDefaultPickupDates().length > 0) {
        setSelectedPickupDate(getDefaultPickupDates()[0].date);
      }
    }
  };

  useEffect(() => {
    if (isOpen) {
      if (!checkAuthentication()) {
        return;
      }
      
      loadDiscount();
      setStep(1);
      setOrderSuccess(false);
      setOrderDetails(null);
      setPaymentProcessing(false);
      setPaymentMethod('reserve_only');
      setSelectedPickupDate('');
      setErrors({});
      setShowPaymentModal(false);
      setPaymentStatus('idle');
      setShowReserveConfirmation(false);
      
      // Auto-fill with test card details
      fillTestCard();
      
      // Fetch available pickup dates from user's schedule
      fetchAvailablePickupDates();
    }
  }, [isOpen]);

  const loadDiscount = () => {
    try {
      const discountData = localStorage.getItem('capd_quiz_discount');
      if (discountData) {
        const discount = JSON.parse(discountData);
        const validUntil = new Date(discount.validUntil);
        if (validUntil > new Date()) {
          setEarnedDiscount(discount.discount);
        } else {
          localStorage.removeItem('capd_quiz_discount');
          setEarnedDiscount(0);
        }
      }
    } catch (error) {
      console.error('Error loading discount:', error);
      setEarnedDiscount(0);
    }
  };

  const getDefaultPickupDates = () => {
    const dates = [];
    const today = new Date();
    
    for (let i = 1; i <= 3; i++) {
      const date = new Date(today);
      date.setMonth(today.getMonth() + i);
      date.setDate(15);
      
      if (date.getDay() === 0) date.setDate(16);
      if (date.getDay() === 6) date.setDate(17);
      
      dates.push({
        date: date.toISOString().split('T')[0],
        display: date.toLocaleDateString('en-US', { 
          month: 'long',
          day: 'numeric',
          year: 'numeric'
        }),
        type: 'regular_checkup'
      });
    }
    
    return dates;
  };

  const calculateDiscountedTotal = () => {
    const subtotal = getTotalPrice();
    const discountAmount = (subtotal * earnedDiscount) / 100;
    return {
      subtotal,
      discountAmount,
      total: Math.max(0, subtotal - discountAmount)
    };
  };

  const { subtotal, discountAmount, total } = calculateDiscountedTotal();

  const validateStep2 = () => {
    const newErrors = {};
    if (!selectedPickupDate) {
      newErrors.pickupDate = 'Please select a pickup date';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Fixed card validation and formatting
  const formatCardNumber = (value) => {
    // Remove all non-digit characters
    const cleaned = value.replace(/\D/g, '');
    // Limit to 16 digits and format with spaces
    const limited = cleaned.substring(0, 16);
    const formatted = limited.replace(/(\d{4})(?=\d)/g, '$1 ');
    return formatted;
  };

  const formatExpiry = (value) => {
    const cleaned = value.replace(/\D/g, '');
    if (cleaned.length >= 2) {
      return cleaned.substring(0, 2) + (cleaned.length > 2 ? '/' + cleaned.substring(2, 4) : '');
    }
    return cleaned;
  };

  const validateCardDetails = () => {
    const newErrors = {};
    
    const cleanCardNumber = cardDetails.number.replace(/\s/g, '');
    
    // Card number validation
    if (!cleanCardNumber) {
      newErrors.cardNumber = 'Card number is required';
    } else if (cleanCardNumber.length !== 16) {
      newErrors.cardNumber = 'Card number must be 16 digits';
    } else if (!/^\d+$/.test(cleanCardNumber)) {
      newErrors.cardNumber = 'Card number must contain only numbers';
    }
    
    // Expiry date validation
    if (!cardDetails.expiry) {
      newErrors.cardExpiry = 'Expiry date is required';
    } else if (!cardDetails.expiry.includes('/')) {
      newErrors.cardExpiry = 'Please use format MM/YY';
    } else {
      const [month, year] = cardDetails.expiry.split('/');
      const currentYear = new Date().getFullYear() % 100;
      const currentMonth = new Date().getMonth() + 1;
      
      if (!month || !year || month.length !== 2 || year.length !== 2) {
        newErrors.cardExpiry = 'Please use format MM/YY';
      } else if (parseInt(month) < 1 || parseInt(month) > 12) {
        newErrors.cardExpiry = 'Month must be between 01 and 12';
      } else if (parseInt(year) < currentYear || (parseInt(year) === currentYear && parseInt(month) < currentMonth)) {
        newErrors.cardExpiry = 'Card has expired';
      }
    }
    
    // CVV validation
    if (!cardDetails.cvv) {
      newErrors.cardCvv = 'CVV is required';
    } else if (cardDetails.cvv.length !== 3) {
      newErrors.cardCvv = 'CVV must be 3 digits';
    } else if (!/^\d+$/.test(cardDetails.cvv)) {
      newErrors.cardCvv = 'CVV must contain only numbers';
    }
    
    // Name validation
    if (!cardDetails.name || cardDetails.name.trim().length < 2) {
      newErrors.cardName = 'Cardholder name is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNextStep = () => {
    if (step === 1) {
      setStep(2);
    } else if (step === 2 && validateStep2()) {
      setStep(3);
    }
  };

  const handlePreviousStep = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const fillTestCard = () => {
    setCardDetails({
      number: "4343 4343 4343 4345",
      expiry: "12/28",
      cvv: "123",
      name: "Hannah Peralta"
    });
    setErrors({});
  };

  // Create payment method via backend
  const createPaymentMethodViaBackend = async () => {
    try {
      // Clean card details
      const cardNumber = cardDetails.number.replace(/\s/g, '');
      const [expMonth, expYear] = cardDetails.expiry.split('/');
      
      console.log('Creating payment method via backend with:', {
        cardNumber: cardNumber,
        expMonth: parseInt(expMonth),
        expYear: parseInt(expYear),
        cvv: cardDetails.cvv,
        name: cardDetails.name
      });

      const paymentMethodData = {
        type: 'card',
        card: {
          number: cardNumber,
          exp_month: parseInt(expMonth),
          exp_year: parseInt(expYear),
          cvc: cardDetails.cvv
        },
        billing: {
          name: cardDetails.name,
          email: 'test@example.com',
          phone: '+639123456789'
        }
      };

      const response = await apiRequest('/checkout/create-payment-method', {
        method: 'POST',
        body: JSON.stringify(paymentMethodData)
      });

      if (!response.success) {
        throw new Error(response.message || 'Failed to create payment method via backend');
      }

      console.log('Payment method created via backend:', response.payment_method_id);
      return response.payment_method_id;
    } catch (error) {
      console.error('Error creating payment method via backend:', error);
      throw new Error(`Payment processing failed: ${error.message}`);
    }
  };

  const processPayMongoPayment = async (orderId) => {
    try {
      console.log('Processing payment for order:', orderId);

      // Step 1: Create payment intent
      console.log('Step 1: Creating payment intent');
      const paymentIntentResult = await apiRequest(`/checkout/orders/${orderId}/create-payment-intent`, {
        method: 'POST'
      });

      if (!paymentIntentResult.success) {
        throw new Error(paymentIntentResult.message || 'Failed to create payment intent');
      }

      const { payment_intent_id, client_key } = paymentIntentResult;
      console.log('Payment intent created:', payment_intent_id);

      // Step 2: Create payment method via BACKEND
      console.log('Step 2: Creating payment method via backend');
      const paymentMethodId = await createPaymentMethodViaBackend();
      console.log('Payment method created:', paymentMethodId);

      // Step 3: Process payment
      console.log('Step 3: Processing payment');
      const paymentResult = await apiRequest(`/checkout/orders/${orderId}/process-payment-with-method`, {
        method: 'POST',
        body: JSON.stringify({
          payment_method_id: paymentMethodId,
          payment_intent_id: payment_intent_id
        })
      });

      if (!paymentResult.success) {
        throw new Error(paymentResult.message || 'Failed to process payment');
      }

      console.log('Payment processed successfully:', paymentResult);
      return paymentResult;

    } catch (error) {
      console.error('PayMongo payment error:', error);
      throw new Error(`Payment failed: ${error.message || 'Please try again.'}`);
    }
  };

  const processOrder = async () => {
    setPaymentProcessing(true);
    setErrors({});
    
    try {
      if (!checkAuthentication()) {
        setPaymentProcessing(false);
        return;
      }

      // Validate card details for card payments
      if (paymentMethod === 'card') {
        if (!validateCardDetails()) {
          setPaymentProcessing(false);
          return;
        }
      }

      const paymentStatus = paymentMethod === 'reserve_only' ? 'reserved' : 'pending';
      const orderStatus = paymentMethod === 'reserve_only' ? 'reserved' : 'confirmed';

      const orderData = {
        items: cart.map(item => ({
          supplyID: item.supplyID,
          quantity: item.quantity,
          unit_price: item.price,
          name: item.name
        })),
        pickup_date: selectedPickupDate,
        discount_percentage: earnedDiscount,
        total_amount: total,
        subtotal: subtotal,
        discount_amount: discountAmount,
        payment_method: paymentMethod,
        payment_status: paymentStatus,
        payment_reference: null
      };

      console.log('Creating order with data:', orderData);

      const orderResult = await apiRequest('/checkout/orders/create', {
        method: 'POST',
        body: JSON.stringify(orderData)
      });

      if (!orderResult.success) {
        throw new Error(orderResult.message || 'Failed to create order');
      }

      const orderId = orderResult.order_id || orderResult.order?.orderID;
      const orderReference = orderResult.order_reference || orderId;

      if (!orderId) {
        throw new Error('Order ID not received from server');
      }

      // Process payment for card method
      if (paymentMethod === 'card') {
        setShowPaymentModal(true);
        setPaymentStatus('processing');
        
        try {
          const paymentResult = await processPayMongoPayment(orderId);
          
          if (paymentResult.success) {
            setPaymentStatus('success');
            setOrderDetails({
              orderId: orderId,
              orderReference: orderReference,
              total: total,
              paymentMethod: paymentMethod,
              paymentStatus: 'paid',
              orderStatus: 'ready_for_pickup',
              pickupDate: selectedPickupDate,
              discountApplied: earnedDiscount,
              paymentReference: paymentResult.payment_reference,
              savedToDatabase: true,
              items: cart.map(item => ({
                name: item.name,
                quantity: item.quantity,
                price: item.price
              }))
            });
            
            setTimeout(() => {
              setOrderSuccess(true);
              setShowPaymentModal(false);
            }, 2000);
          } else {
            setPaymentStatus('failed');
            setErrors({ payment: paymentResult.message });
          }
          
        } catch (paymentError) {
          console.error('Payment processing error:', paymentError);
          setPaymentStatus('failed');
          setErrors({ payment: paymentError.message });
        } finally {
          setPaymentProcessing(false);
        }
        return;
      }

      // For reserve only orders - stock is already reduced in the backend
      setOrderDetails({
        orderId: orderId,
        orderReference: orderReference,
        total: total,
        paymentMethod: paymentMethod,
        paymentStatus: 'reserved',
        orderStatus: 'reserved',
        pickupDate: selectedPickupDate,
        discountApplied: earnedDiscount,
        paymentReference: null,
        savedToDatabase: true,
        items: cart.map(item => ({
          name: item.name,
          quantity: item.quantity,
          price: item.price
        }))
      });
      
      setOrderSuccess(true);
      setPaymentProcessing(false);
      
      if (fetchCart) {
        fetchCart();
      }
      localStorage.removeItem('capd_quiz_discount');

    } catch (error) {
      console.error('Order processing error:', error);
      
      let errorMessage = 'Order processing failed. Please try again.';
      
      if (error.message.includes('Authentication failed') || error.message.includes('No authentication token')) {
        errorMessage = 'Please log in to complete your order.';
      } else if (error.message.includes('Patient profile not found')) {
        errorMessage = 'Patient profile not found. Please complete your profile.';
      } else if (error.message.includes('Insufficient stock')) {
        errorMessage = 'Insufficient stock for some items. Please update your cart.';
      } else if (error.message.includes('Validation failed')) {
        errorMessage = 'Please check your order information and try again.';
      } else if (error.message.includes('Selected pickup date is not in your appointment schedule')) {
        errorMessage = 'Selected pickup date is not in your appointment schedule. Please select a valid appointment date.';
      } else {
        errorMessage = error.message;
      }
      
      setErrors({ payment: errorMessage });
      setPaymentStatus('failed');
      setPaymentProcessing(false);
    }
  };

  const handleConfirmReservation = () => {
    setShowReserveConfirmation(false);
    processOrder();
  };

  const handleProcessOrder = () => {
    if (paymentMethod === 'reserve_only') {
      // Show confirmation modal for reserve-only orders
      setShowReserveConfirmation(true);
    } else {
      // Process card payment directly
      processOrder();
    }
  };

  const handleDiscountEarned = (discount) => {
    setEarnedDiscount(discount);
    setShowQuiz(false);
  };

  const handleClosePaymentModal = () => {
    setShowPaymentModal(false);
    setPaymentStatus('idle');
    setPaymentProcessing(false);
  };

  if (!isOpen) return null;

  return (
    <>
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
        
        <div style={{
          backgroundColor: colors.white,
          borderRadius: '12px',
          width: '98%',
          maxWidth: '1200px',
          maxHeight: '95vh',
          overflow: 'auto',
          boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
          display: 'flex',
          flexDirection: 'column'
        }} onClick={(e) => e.stopPropagation()}>

          {/* Header */}
          <div style={{
            padding: '2rem 2.5rem 1.5rem 2.5rem',
            borderBottom: `1px solid ${colors.border}`,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            backgroundColor: colors.white,
            position: 'sticky',
            top: 0,
            zIndex: 10
          }}>
            <div>
              <h2 style={{ 
                margin: 0, 
                fontSize: '1.75rem',
                fontWeight: '700',
                color: colors.text,
                display: 'flex',
                alignItems: 'center',
                gap: '1rem'
              }}>
                <FiShoppingBag size={24} />
                Order Process
              </h2>
              <p style={{ 
                margin: '0.5rem 0 0 0',
                color: colors.textMuted,
                fontSize: '1rem',
                fontWeight: '500'
              }}>
                Step {step} of 3 • {getTotalCartItems()} items in cart
              </p>
            </div>
            
            <button
              onClick={onClose}
              style={{
                width: '44px',
                height: '44px',
                borderRadius: '8px',
                border: `1px solid ${colors.border}`,
                backgroundColor: colors.white,
                color: colors.textMuted,
                fontSize: '1.2rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => {
                e.target.style.borderColor = colors.alert;
                e.target.style.color = colors.alert;
              }}
              onMouseLeave={(e) => {
                e.target.style.borderColor = colors.border;
                e.target.style.color = colors.textMuted;
              }}
            >
              <FiX />
            </button>
          </div>

          {/* Authentication Error Banner */}
          {errors.auth && (
            <div style={{
              backgroundColor: `${colors.alert}08`,
              border: `1px solid ${colors.alert}20`,
              borderRadius: '8px',
              padding: '1.25rem',
              margin: '1.5rem 2.5rem',
              display: 'flex',
              alignItems: 'center',
              gap: '1rem'
            }}>
              <FiAlertCircle color={colors.alert} size={20} />
              <div>
                <div style={{ color: colors.alert, fontWeight: '600', fontSize: '1rem' }}>
                  Authentication Required
                </div>
                <div style={{ color: colors.alert, fontSize: '0.9rem', opacity: 0.9 }}>
                  {errors.auth}
                </div>
              </div>
            </div>
          )}

          {/* Progress Steps */}
          <div style={{
            padding: '1.5rem 2.5rem',
            borderBottom: `1px solid ${colors.border}`,
            backgroundColor: colors.subtle
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              position: 'relative',
              maxWidth: '500px',
              margin: '0 auto'
            }}>
              {[1, 2, 3].map((stepNumber) => (
                <div key={stepNumber} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', zIndex: 2, flex: 1 }}>
                  <div style={{
                    width: '44px',
                    height: '44px',
                    borderRadius: '50%',
                    backgroundColor: step >= stepNumber ? colors.primary : colors.border,
                    color: step >= stepNumber ? colors.white : colors.textMuted,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: '600',
                    fontSize: '1rem',
                    transition: 'all 0.3s ease',
                    marginBottom: '0.75rem'
                  }}>
                    {step > stepNumber ? <FiCheck size={18} /> : stepNumber}
                  </div>
                  <div style={{
                    fontSize: '0.9rem',
                    fontWeight: '600',
                    color: step >= stepNumber ? colors.primary : colors.textMuted,
                    textAlign: 'center'
                  }}>
                    {stepNumber === 1 && 'Order Review'}
                    {stepNumber === 2 && 'Pickup Schedule'}
                    {stepNumber === 3 && 'Payment Method'}
                  </div>
                </div>
              ))}
              <div style={{
                position: 'absolute',
                top: '22px',
                left: '22px',
                right: '22px',
                height: '2px',
                backgroundColor: colors.border,
                zIndex: 1
              }}>
                <div style={{
                  height: '100%',
                  backgroundColor: colors.primary,
                  width: step === 1 ? '0%' : step === 2 ? '50%' : '100%',
                  transition: 'width 0.3s ease'
                }} />
              </div>
            </div>
          </div>

          {/* Content */}
          <div style={{ flex: 1, overflow: 'auto', padding: '2.5rem' }}>
            {errors.auth ? (
              <div style={{
                textAlign: 'center',
                padding: '4rem 2rem',
                color: colors.textMuted
              }}>
                <div style={{
                  width: '80px',
                  height: '80px',
                  borderRadius: '50%',
                  backgroundColor: `${colors.alert}08`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 2rem auto',
                  color: colors.alert,
                  fontSize: '2rem'
                }}>
                  <FiAlertCircle />
                </div>
                <h3 style={{ color: colors.alert, marginBottom: '1rem', fontSize: '1.5rem' }}>
                  Authentication Required
                </h3>
                <p style={{ marginBottom: '2.5rem', fontSize: '1.1rem' }}>
                  Please log in to complete your order.
                </p>
                <button
                  onClick={() => window.location.href = '/login'}
                  style={{
                    padding: '1rem 2.5rem',
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
                  Go to Login
                </button>
              </div>
            ) : (
              <div style={{ display: 'flex', gap: '3rem', minHeight: '500px' }}>
                
                {/* Main Content - Wider */}
                <div style={{ flex: 3, minWidth: 0 }}>
                  {step === 1 && (
                    <div>
                      <h3 style={{ 
                        color: colors.text, 
                        marginBottom: '2rem',
                        fontSize: '1.5rem',
                        fontWeight: '600',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '1rem'
                      }}>
                        <FiPackage size={22} />
                        Order Information
                      </h3>
                      
                      {/* Database Status */}
                      <div style={{
                        backgroundColor: `${colors.success}08`,
                        border: `1px solid ${colors.success}20`,
                        borderRadius: '8px',
                        padding: '1.5rem',
                        marginBottom: '2rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '1rem'
                      }}>
                        <FiCheck color={colors.success} size={20} />
                        <div>
                          <div style={{ color: colors.success, fontWeight: '600', fontSize: '1rem', marginBottom: '0.25rem' }}>
                            Order Data Security
                          </div>
                          <div style={{ color: colors.textMuted, fontSize: '0.9rem' }}>
                            All order information including items, payments, and inventory updates will be securely stored in our database
                          </div>
                        </div>
                      </div>

                      {/* Discount Section */}
                      <div style={{
                        backgroundColor: colors.subtle,
                        padding: '2rem',
                        borderRadius: '8px',
                        marginBottom: '2.5rem',
                        border: `1px solid ${earnedDiscount > 0 ? colors.success : colors.border}`
                      }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
                          <div style={{ flex: 1 }}>
                            <h4 style={{ 
                              color: colors.text, 
                              margin: '0 0 0.75rem 0',
                              fontSize: '1.2rem',
                              fontWeight: '600'
                            }}>
                              Educational Discount Opportunity
                            </h4>
                            <p style={{ 
                              margin: 0,
                              color: colors.textMuted,
                              fontSize: '1rem',
                              lineHeight: '1.5'
                            }}>
                              Complete the CAPD care assessment to qualify for a 5% educational discount on your order.
                            </p>
                          </div>
                          <button
                            onClick={() => setShowQuiz(true)}
                            style={{
                              padding: '1rem 2rem',
                              backgroundColor: earnedDiscount > 0 ? colors.success : colors.primary,
                              color: colors.white,
                              border: 'none',
                              borderRadius: '8px',
                              cursor: 'pointer',
                              fontWeight: '600',
                              fontSize: '1rem',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '0.75rem',
                              transition: 'all 0.3s ease',
                              whiteSpace: 'nowrap',
                              marginLeft: '2rem'
                            }}
                            onMouseEnter={(e) => {
                              e.target.style.transform = 'translateY(-2px)';
                            }}
                            onMouseLeave={(e) => {
                              e.target.style.transform = 'translateY(0)';
                            }}
                          >
                            <FiAward size={18} />
                            {earnedDiscount > 0 ? 'Discount Applied' : 'Take Assessment'}
                          </button>
                        </div>
                        
                        {earnedDiscount > 0 && (
                          <div style={{
                            backgroundColor: `${colors.success}08`,
                            padding: '1.25rem',
                            borderRadius: '6px',
                            textAlign: 'center'
                          }}>
                            <div style={{ 
                              color: colors.success, 
                              fontWeight: '600',
                              fontSize: '1.1rem',
                              marginBottom: '0.25rem'
                            }}>
                              Educational Discount Applied: {earnedDiscount}% Off
                            </div>
                            <div style={{ 
                              color: colors.textMuted,
                              fontSize: '0.9rem'
                            }}>
                              Your discount has been automatically applied to the order total
                            </div>
                          </div>
                        )}
                      </div>

                      <div style={{
                        backgroundColor: `${colors.primary}05`,
                        border: `1px solid ${colors.primary}15`,
                        borderRadius: '8px',
                        padding: '1.5rem',
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: '1rem'
                      }}>
                        <FiInfo color={colors.primary} size={20} />
                        <div>
                          <div style={{ color: colors.primary, fontWeight: '600', marginBottom: '0.5rem', fontSize: '1.1rem' }}>
                            Pickup Instructions
                          </div>
                          <div style={{ color: colors.textMuted, fontSize: '1rem', lineHeight: '1.5' }}>
                            Medical supplies will be available for collection during your scheduled appointment dates at the CAPD Dept. 
                            Please bring valid patient identification for verification.
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {step === 2 && (
                    <div>
                      <h3 style={{ 
                        color: colors.text, 
                        marginBottom: '2rem',
                        fontSize: '1.5rem',
                        fontWeight: '600',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '1rem'
                      }}>
                        <FiCalendar size={22} />
                        Schedule Pickup Date
                      </h3>
                      
                      <div style={{ marginBottom: '2rem' }}>
                        <label style={{ 
                          display: 'block', 
                          marginBottom: '1.5rem', 
                          color: colors.text,
                          fontWeight: '600',
                          fontSize: '1.1rem'
                        }}>
                          Select Your CAPD Appointment Date for Supply Pickup *
                        </label>
                        <div style={{ 
                          display: 'grid', 
                          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', 
                          gap: '1.5rem',
                          marginBottom: '1.5rem'
                        }}>
                          {availablePickupDates.map((dateObj, index) => (
                            <button
                              key={dateObj.date}
                              type="button"
                              onClick={() => {
                                setSelectedPickupDate(dateObj.date);
                                setErrors(prev => ({ ...prev, pickupDate: '' }));
                              }}
                              style={{
                                padding: '1.75rem 1rem',
                                border: `2px solid ${selectedPickupDate === dateObj.date ? colors.primary : colors.border}`,
                                borderRadius: '8px',
                                backgroundColor: selectedPickupDate === dateObj.date ? `${colors.primary}08` : colors.white,
                                color: selectedPickupDate === dateObj.date ? colors.primary : colors.text,
                                cursor: 'pointer',
                                fontWeight: '600',
                                fontSize: '1rem',
                                transition: 'all 0.3s ease',
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                textAlign: 'center',
                                position: 'relative'
                              }}
                              onMouseEnter={(e) => {
                                if (selectedPickupDate !== dateObj.date) {
                                  e.target.style.borderColor = colors.primary;
                                  e.target.style.backgroundColor = `${colors.primary}05`;
                                }
                              }}
                              onMouseLeave={(e) => {
                                if (selectedPickupDate !== dateObj.date) {
                                  e.target.style.borderColor = colors.border;
                                  e.target.style.backgroundColor = colors.white;
                                }
                              }}
                            >
                              <FiCalendar style={{ marginBottom: '1rem', fontSize: '1.75rem' }} />
                              <div style={{ fontWeight: '600', marginBottom: '0.5rem', fontSize: '1.1rem' }}>
                                {dateObj.display}
                              </div>
                              <div style={{ 
                                fontSize: '0.85rem', 
                                color: colors.textMuted,
                                backgroundColor: `${colors.primary}08`,
                                padding: '0.5rem 0.75rem',
                                borderRadius: '4px',
                                fontWeight: '500'
                              }}>
                                {dateObj.type === 'scheduled_appointment' ? 'Scheduled Appointment' : 'Regular Checkup'}
                              </div>
                              {index === 0 && (
                                <div style={{
                                  position: 'absolute',
                                  top: '-6px',
                                  right: '-6px',
                                  backgroundColor: colors.accent,
                                  color: colors.white,
                                  fontSize: '0.75rem',
                                  fontWeight: '600',
                                  padding: '0.35rem 0.75rem',
                                  borderRadius: '12px'
                                }}>
                                  RECOMMENDED
                                </div>
                              )}
                            </button>
                          ))}
                        </div>
                        {errors.pickupDate && (
                          <div style={{ color: colors.alert, fontSize: '0.9rem', marginTop: '0.75rem' }}>
                            {errors.pickupDate}
                          </div>
                        )}
                      </div>

                      <div style={{
                        backgroundColor: `${colors.primary}05`,
                        border: `1px solid ${colors.primary}15`,
                        borderRadius: '8px',
                        padding: '1.5rem',
                        marginTop: '2rem'
                      }}>
                        <div style={{ 
                          color: colors.primary, 
                          fontWeight: '600', 
                          marginBottom: '0.75rem',
                          fontSize: '1.1rem'
                        }}>
                          📅 Important Note
                        </div>
                        <div style={{ 
                          color: colors.textMuted, 
                          fontSize: '0.95rem',
                          lineHeight: '1.5'
                        }}>
                          Your medical supplies will be prepared and available for pickup during your scheduled CAPD appointment. 
                          Please ensure you attend your appointment to collect your supplies.
                        </div>
                      </div>
                    </div>
                  )}

                  {step === 3 && (
                    <div>
                      <h3 style={{ 
                        color: colors.text, 
                        marginBottom: '2rem',
                        fontSize: '1.5rem',
                        fontWeight: '600',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '1rem'
                      }}>
                        <FiCreditCard size={22} />
                        Payment Option
                      </h3>
                      
                      <div style={{ marginBottom: '2rem' }}>
                        <label style={{ 
                          display: 'block', 
                          marginBottom: '1.5rem', 
                          color: colors.text,
                          fontWeight: '600',
                          fontSize: '1.1rem'
                        }}>
                          Select Payment Method
                        </label>
                        <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap', marginBottom: '2.5rem' }}>
                          {[
                            { 
                              id: 'reserve_only', 
                              label: 'Pay at CAPD Dept', 
                              description: 'Pay upon collection during appointment',
                              icon: <FiClock size={20} />,
                              color: colors.text
                            },
                            { 
                              id: 'card', 
                              label: 'Pay with Card', 
                              description: 'Secure online payment via PayMongo',
                              icon: <FiCreditCard size={20} />,
                              color: colors.primary
                            }
                          ].map(method => (
                            <button
                              key={method.id}
                              type="button"
                              onClick={() => setPaymentMethod(method.id)}
                              style={{
                                flex: 1,
                                minWidth: '160px',
                                padding: '2rem 1rem',
                                border: `2px solid ${paymentMethod === method.id ? method.color : colors.border}`,
                                borderRadius: '8px',
                                backgroundColor: paymentMethod === method.id ? `${method.color}08` : colors.white,
                                color: paymentMethod === method.id ? method.color : colors.text,
                                cursor: 'pointer',
                                fontWeight: '600',
                                fontSize: '1rem',
                                transition: 'all 0.3s ease',
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                gap: '1rem'
                              }}
                              onMouseEnter={(e) => {
                                if (paymentMethod !== method.id) {
                                  e.target.style.borderColor = method.color;
                                  e.target.style.backgroundColor = `${method.color}05`;
                                }
                              }}
                              onMouseLeave={(e) => {
                                if (paymentMethod !== method.id) {
                                  e.target.style.borderColor = colors.border;
                                  e.target.style.backgroundColor = colors.white;
                                }
                              }}
                            >
                              <div style={{ color: paymentMethod === method.id ? method.color : colors.textMuted }}>
                                {method.icon}
                              </div>
                              <div>
                                <div style={{ fontWeight: '600', fontSize: '1.1rem' }}>{method.label}</div>
                                <div style={{ 
                                  fontSize: '0.9rem', 
                                  color: colors.textMuted,
                                  marginTop: '0.5rem'
                                }}>
                                  {method.description}
                                </div>
                              </div>
                            </button>
                          ))}
                        </div>

                        {/* Payment Method Info */}
                        {paymentMethod === 'reserve_only' && (
                          <div style={{
                            backgroundColor: `${colors.warning}05`,
                            border: `1px solid ${colors.warning}20`,
                            borderRadius: '8px',
                            padding: '2rem',
                            textAlign: 'center'
                          }}>
                            <div style={{ 
                              color: colors.warning,
                              fontSize: '2.5rem',
                              marginBottom: '1rem'
                            }}>
                              <FiClock size={40} />
                            </div>
                            <h4 style={{ 
                              color: colors.warning,
                              marginBottom: '1rem',
                              fontWeight: '600',
                              fontSize: '1.3rem'
                            }}>
                              CAPD Dept Reservation
                            </h4>
                            <p style={{ 
                              color: colors.textMuted, 
                              fontSize: '1rem',
                              lineHeight: '1.6',
                              maxWidth: '400px',
                              margin: '0 auto'
                            }}>
                              Your medical supplies will be reserved. Payment will be collected when you pickup your items during your scheduled CAPD appointment.
                            </p>
                          </div>
                        )}

                        {paymentMethod === 'card' && (
                          <div>
                            <div style={{
                              backgroundColor: `${colors.primary}05`,
                              border: `1px solid ${colors.primary}20`,
                              borderRadius: '8px',
                              padding: '2rem',
                              textAlign: 'center',
                              marginBottom: '2rem'
                            }}>
                              <div style={{ 
                                color: colors.primary,
                                fontSize: '2.5rem',
                                marginBottom: '1rem'
                              }}>
                                <FiDollarSign size={40} />
                              </div>
                              <h4 style={{ 
                                color: colors.primary,
                                marginBottom: '1rem',
                                fontWeight: '600',
                                fontSize: '1.3rem'
                              }}>
                                Secure Online Payment
                              </h4>
                              <p style={{ 
                                color: colors.textMuted, 
                                fontSize: '1rem',
                                lineHeight: '1.6',
                                maxWidth: '400px',
                                margin: '0 auto'
                              }}>
                                You will be redirected to PayMongo's secure payment gateway to complete your transaction. Your order will be marked as ready for pickup once payment is confirmed.
                              </p>
                              <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '0.75rem',
                                marginTop: '1.5rem',
                                padding: '1rem',
                                backgroundColor: `${colors.primary}08`,
                                borderRadius: '6px'
                              }}>
                                <FiShield color={colors.primary} />
                                <div style={{ 
                                  color: colors.textMuted, 
                                  fontSize: '0.9rem',
                                  fontWeight: '500'
                                }}>
                                  PCI DSS compliant secure payment processing
                                </div>
                              </div>
                            </div>

                            {/* Card Details Form */}
                            <div style={{
                              backgroundColor: colors.subtle,
                              borderRadius: '8px',
                              padding: '2rem',
                              border: `1px solid ${colors.border}`
                            }}>
                              <h4 style={{ 
                                color: colors.text,
                                marginBottom: '1.5rem',
                                fontWeight: '600',
                                fontSize: '1.2rem'
                              }}>
                                Card Details
                              </h4>
                              
                              <div style={{ display: 'grid', gap: '1.5rem' }}>
                                {/* Card Number */}
                                <div>
                                  <label style={{ 
                                    display: 'block', 
                                    marginBottom: '0.5rem', 
                                    color: colors.text,
                                    fontWeight: '500'
                                  }}>
                                    Card Number *
                                  </label>
                                  <input
                                    type="text"
                                    placeholder="4343 4343 4343 4345"
                                    value={cardDetails.number}
                                    onChange={(e) => {
                                      const formatted = formatCardNumber(e.target.value);
                                      setCardDetails(prev => ({
                                        ...prev,
                                        number: formatted
                                      }));
                                      if (errors.cardNumber) {
                                        setErrors(prev => ({ ...prev, cardNumber: '' }));
                                      }
                                    }}
                                    style={{
                                      width: '100%',
                                      padding: '1rem',
                                      border: `1px solid ${errors.cardNumber ? colors.alert : colors.border}`,
                                      borderRadius: '6px',
                                      fontSize: '1rem',
                                      backgroundColor: colors.white,
                                      fontFamily: 'monospace',
                                      letterSpacing: '1px'
                                    }}
                                  />
                                  {errors.cardNumber && (
                                    <div style={{ color: colors.alert, fontSize: '0.9rem', marginTop: '0.5rem' }}>
                                      {errors.cardNumber}
                                    </div>
                                  )}
                                </div>

                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                  {/* Expiry Date */}
                                  <div>
                                    <label style={{ 
                                      display: 'block', 
                                      marginBottom: '0.5rem', 
                                      color: colors.text,
                                      fontWeight: '500'
                                    }}>
                                      Expiry Date *
                                    </label>
                                    <input
                                      type="text"
                                      placeholder="MM/YY"
                                      value={cardDetails.expiry}
                                      onChange={(e) => {
                                        const formatted = formatExpiry(e.target.value);
                                        setCardDetails(prev => ({
                                          ...prev,
                                          expiry: formatted
                                        }));
                                        if (errors.cardExpiry) {
                                          setErrors(prev => ({ ...prev, cardExpiry: '' }));
                                        }
                                      }}
                                      maxLength={5}
                                      style={{
                                        width: '100%',
                                        padding: '1rem',
                                        border: `1px solid ${errors.cardExpiry ? colors.alert : colors.border}`,
                                        borderRadius: '6px',
                                        fontSize: '1rem',
                                        backgroundColor: colors.white,
                                        fontFamily: 'monospace'
                                      }}
                                    />
                                    {errors.cardExpiry && (
                                      <div style={{ color: colors.alert, fontSize: '0.9rem', marginTop: '0.5rem' }}>
                                        {errors.cardExpiry}
                                      </div>
                                    )}
                                  </div>

                                  {/* CVV */}
                                  <div>
                                    <label style={{ 
                                      display: 'block', 
                                      marginBottom: '0.5rem', 
                                      color: colors.text,
                                      fontWeight: '500'
                                    }}>
                                      CVV *
                                    </label>
                                    <input
                                      type="text"
                                      placeholder="123"
                                      value={cardDetails.cvv}
                                      onChange={(e) => {
                                        const cleaned = e.target.value.replace(/\D/g, '').substring(0, 3);
                                        setCardDetails(prev => ({
                                          ...prev,
                                          cvv: cleaned
                                        }));
                                        if (errors.cardCvv) {
                                          setErrors(prev => ({ ...prev, cardCvv: '' }));
                                        }
                                      }}
                                      maxLength={3}
                                      style={{
                                        width: '100%',
                                        padding: '1rem',
                                        border: `1px solid ${errors.cardCvv ? colors.alert : colors.border}`,
                                        borderRadius: '6px',
                                        fontSize: '1rem',
                                        backgroundColor: colors.white,
                                        fontFamily: 'monospace'
                                      }}
                                    />
                                    {errors.cardCvv && (
                                      <div style={{ color: colors.alert, fontSize: '0.9rem', marginTop: '0.5rem' }}>
                                        {errors.cardCvv}
                                      </div>
                                    )}
                                  </div>
                                </div>

                                {/* Cardholder Name */}
                                <div>
                                  <label style={{ 
                                    display: 'block', 
                                    marginBottom: '0.5rem', 
                                    color: colors.text,
                                    fontWeight: '500'
                                  }}>
                                    Cardholder Name *
                                  </label>
                                  <input
                                    type="text"
                                    placeholder="Hannah Peralta"
                                    value={cardDetails.name}
                                    onChange={(e) => {
                                      setCardDetails(prev => ({
                                        ...prev,
                                        name: e.target.value
                                      }));
                                      if (errors.cardName) {
                                        setErrors(prev => ({ ...prev, cardName: '' }));
                                      }
                                    }}
                                    style={{
                                      width: '100%',
                                      padding: '1rem',
                                      border: `1px solid ${errors.cardName ? colors.alert : colors.border}`,
                                      borderRadius: '6px',
                                      fontSize: '1rem',
                                      backgroundColor: colors.white
                                    }}
                                  />
                                  {errors.cardName && (
                                    <div style={{ color: colors.alert, fontSize: '0.9rem', marginTop: '0.5rem' }}>
                                      {errors.cardName}
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>

                      {errors.payment && (
                        <div style={{
                          backgroundColor: `${colors.alert}08`,
                          border: `1px solid ${colors.alert}20`,
                          borderRadius: '8px',
                          padding: '1.25rem',
                          marginBottom: '1.5rem',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '1rem'
                        }}>
                          <FiAlertCircle color={colors.alert} size={20} />
                          <span style={{ color: colors.alert, fontSize: '1rem', fontWeight: '500' }}>
                            {errors.payment}
                          </span>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Order Summary Sidebar */}
                <div style={{ flex: 1.2, minWidth: '320px' }}>
                  <div style={{
                    backgroundColor: colors.subtle,
                    borderRadius: '8px',
                    padding: '2rem',
                    border: `1px solid ${colors.border}`,
                    position: 'sticky',
                    top: '1rem'
                  }}>
                    <h4 style={{ 
                      color: colors.text, 
                      marginBottom: '1.5rem',
                      fontSize: '1.3rem',
                      fontWeight: '600',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '1rem'
                    }}>
                      <FiPackage size={20} />
                      Order Summary
                    </h4>

                    {/* Cart Items */}
                    <div style={{ marginBottom: '2rem', maxHeight: '250px', overflowY: 'auto' }}>
                      {cart.map(item => (
                        <div key={item.cartID} style={{
                          display: 'flex',
                          gap: '1rem',
                          padding: '1rem 0',
                          borderBottom: `1px solid ${colors.border}`
                        }}>
                          <img 
                            src={getProductImage(item)} 
                            alt={item.name}
                            style={{
                              width: '60px',
                              height: '60px',
                              borderRadius: '6px',
                              objectFit: 'cover',
                              backgroundColor: colors.lightBg
                            }}
                          />
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ 
                              fontSize: '0.95rem',
                              fontWeight: '600',
                              color: colors.text,
                              marginBottom: '0.5rem',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap'
                            }}>
                              {item.name}
                            </div>
                            <div style={{ 
                              fontSize: '0.9rem',
                              color: colors.textMuted,
                              marginBottom: '0.5rem'
                            }}>
                              Quantity: {item.quantity}
                            </div>
                            <div style={{ 
                              fontSize: '1rem',
                              fontWeight: '700',
                              color: colors.accent
                            }}>
                              ₱{(item.price * item.quantity).toLocaleString()}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Price Breakdown */}
                    <div style={{ borderTop: `1px solid ${colors.border}`, paddingTop: '1.5rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                        <span style={{ color: colors.textMuted, fontSize: '1rem', fontWeight: '500' }}>Subtotal:</span>
                        <span style={{ color: colors.text, fontSize: '1rem', fontWeight: '600' }}>
                          ₱{subtotal.toLocaleString()}
                        </span>
                      </div>
                      
                      {earnedDiscount > 0 && (
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                          <span style={{ 
                            color: colors.success, 
                            fontSize: '1rem', 
                            fontWeight: '600',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem'
                          }}>
                            <FiAward size={16} />
                            CAPD Discount ({earnedDiscount}%):
                          </span>
                          <span style={{ color: colors.success, fontSize: '1rem', fontWeight: '600' }}>
                            -₱{discountAmount.toLocaleString()}
                          </span>
                        </div>
                      )}
                      
                      <div style={{ 
                        display: 'flex', 
                        justifyContent: 'space-between', 
                        marginTop: '1.5rem',
                        paddingTop: '1.5rem',
                        borderTop: `2px solid ${colors.border}`
                      }}>
                        <span style={{ color: colors.text, fontSize: '1.2rem', fontWeight: '700' }}>Total Amount:</span>
                        <span style={{ color: colors.accent, fontSize: '1.2rem', fontWeight: '700' }}>
                          ₱{total.toLocaleString()}
                        </span>
                      </div>

                      {paymentMethod === 'reserve_only' && (
                        <div style={{
                          backgroundColor: `${colors.warning}08`,
                          border: `1px solid ${colors.warning}20`,
                          borderRadius: '6px',
                          padding: '1.25rem',
                          marginTop: '1.5rem',
                          textAlign: 'center'
                        }}>
                          <div style={{ 
                            color: colors.warning, 
                            fontSize: '0.9rem',
                            fontWeight: '600',
                            marginBottom: '0.5rem',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '0.5rem'
                          }}>
                            <FiClock size={16} />
                            PAY AT CAPD DEPT
                          </div>
                          <div style={{ 
                            color: colors.textMuted, 
                            fontSize: '0.85rem'
                          }}>
                            No payment required now
                          </div>
                        </div>
                      )}

                      {paymentMethod === 'card' && (
                        <div style={{
                          backgroundColor: `${colors.primary}08`,
                          border: `1px solid ${colors.primary}20`,
                          borderRadius: '6px',
                          padding: '1.25rem',
                          marginTop: '1.5rem',
                          textAlign: 'center'
                        }}>
                          <div style={{ 
                            color: colors.primary, 
                            fontSize: '0.9rem',
                            fontWeight: '600',
                            marginBottom: '0.5rem',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '0.5rem'
                          }}>
                            <FiDollarSign size={16} />
                            PAY ONLINE NOW
                          </div>
                          <div style={{ 
                            color: colors.textMuted, 
                            fontSize: '0.85rem'
                          }}>
                            Secure payment via PayMongo
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          {!errors.auth && (
            <div style={{
              padding: '2rem 2.5rem',
              borderTop: `1px solid ${colors.border}`,
              backgroundColor: colors.white,
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <div>
                {step > 1 && (
                  <button
                    onClick={handlePreviousStep}
                    style={{
                      padding: '1rem 2rem',
                      border: `1px solid ${colors.border}`,
                      backgroundColor: 'transparent',
                      color: colors.textMuted,
                      borderRadius: '8px',
                      cursor: 'pointer',
                      fontWeight: '600',
                      fontSize: '1rem',
                      transition: 'all 0.3s ease',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.75rem'
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.borderColor = colors.primary;
                      e.target.style.color = colors.primary;
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.borderColor = colors.border;
                      e.target.style.color = colors.textMuted;
                    }}
                  >
                    <FiArrowLeft size={18} />
                    Previous Step
                  </button>
                )}
              </div>
              
              <div>
                {step < 3 ? (
                  <button
                    onClick={handleNextStep}
                    style={{
                      padding: '1rem 2.5rem',
                      backgroundColor: colors.primary,
                      color: colors.white,
                      border: 'none',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      fontWeight: '600',
                      fontSize: '1rem',
                      transition: 'all 0.3s ease',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.75rem'
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.backgroundColor = colors.accent;
                      e.target.style.transform = 'translateY(-1px)';
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.backgroundColor = colors.primary;
                      e.target.style.transform = 'translateY(0)';
                    }}
                  >
                    Continue
                    <FiArrowRight size={18} />
                  </button>
                ) : (
                  <button
                    onClick={handleProcessOrder}
                    disabled={paymentProcessing}
                    style={{
                      padding: '1rem 2.5rem',
                      backgroundColor: paymentProcessing ? colors.border : 
                                     paymentMethod === 'reserve_only' ? colors.warning : colors.primary,
                      color: colors.white,
                      border: 'none',
                      borderRadius: '8px',
                      cursor: paymentProcessing ? 'not-allowed' : 'pointer',
                      fontWeight: '600',
                      fontSize: '1rem',
                      transition: 'all 0.3s ease',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.75rem',
                      opacity: paymentProcessing ? 0.7 : 1
                    }}
                    onMouseEnter={(e) => {
                      if (!paymentProcessing) {
                        e.target.style.transform = 'translateY(-1px)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!paymentProcessing) {
                        e.target.style.transform = 'translateY(0)';
                      }
                    }}
                  >
                    {paymentProcessing ? (
                      <>
                        <div style={{
                          width: '18px',
                          height: '18px',
                          border: '2px solid transparent',
                          borderTop: '2px solid currentColor',
                          borderRadius: '50%',
                          animation: 'spin 1s linear infinite'
                        }} />
                        Processing Order...
                      </>
                    ) : (
                      <>
                        {paymentMethod === 'reserve_only' ? <FiClock size={18} /> : <FiDollarSign size={18} />}
                        {paymentMethod === 'reserve_only' 
                          ? `Confirm Reservation` 
                          : `Pay ₱${total.toLocaleString()}`}
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Order Success Receipt */}
      {orderSuccess && (
        <OrderSuccessReceipt 
          orderDetails={orderDetails}
          colors={colors}
          onClose={onClose}
        />
      )}

      {/* Payment Processing Modal */}
      <PaymentProcessingModal 
        showPaymentModal={showPaymentModal}
        paymentStatus={paymentStatus}
        errors={errors}
        colors={colors}
        onClose={handleClosePaymentModal}
      />

      {/* CAPD Quiz Game Modal */}
      {showQuiz && (
        <CAPDQuizGame
          isOpen={showQuiz}
          onClose={() => setShowQuiz(false)}
          colors={colors}
          onDiscountEarned={handleDiscountEarned}
        />
      )}

      {/* Reserve Confirmation Modal */}
      <AreYouSureModal
        isOpen={showReserveConfirmation}
        onClose={() => setShowReserveConfirmation(false)}
        onConfirm={handleConfirmReservation}
        colors={colors}
        orderDetails={{
          items: cart,
          total: total,
          pickupDate: selectedPickupDate
        }}
      />

      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </>
  );
};

export default CheckoutModal;