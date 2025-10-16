import React, { useState } from 'react';
import { 
  FiHelpCircle, 
  FiSearch, 
  FiChevronDown, 
  FiChevronUp, 
  FiX, 
  FiMessageCircle, 
  FiBook, 
  FiShoppingBag,
  FiTruck,
  FiPackage,
  FiCreditCard,
  FiShield,
  FiStar,
  FiSend,
  FiUser,
  FiClock,
  FiMapPin
} from 'react-icons/fi';

const FAQsModal = ({ isOpen, onClose, colors }) => {
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedItems, setExpandedItems] = useState(new Set());
  const [feedback, setFeedback] = useState({});
  const [chatOpen, setChatOpen] = useState(false);
  const [chatMessage, setChatMessage] = useState('');
  const [chatMessages, setChatMessages] = useState([
    {
      id: 1,
      text: "Hello! I'm your MedSupply assistant. How can I help you with medical supplies today?",
      isBot: true,
      timestamp: new Date()
    }
  ]);

  const categories = [
    { id: 'all', name: 'All Questions', icon: FiBook, count: 0 },
    { id: 'ordering', name: 'Ordering & Payment', icon: FiShoppingBag, count: 0 },
    { id: 'pickup', name: 'Store Pickup', icon: FiMapPin, count: 0 },
    { id: 'products', name: 'Product Information', icon: FiPackage, count: 0 },
    { id: 'policy', name: 'Store Policies', icon: FiShield, count: 0 }
  ];

  const faqs = [
    {
      id: 1,
      question: "How do I place an order for medical supplies?",
      answer: "To place an order, browse our medical supplies catalog, add items to your cart, and proceed to checkout. You'll need to create an account or log in to complete your purchase. We accept major credit cards, PayPal, GCash, and Maya for secure payments.",
      category: 'ordering',
      popularity: 95,
      tags: ['ordering', 'payment', 'account']
    },
    {
      id: 2,
      question: "What are your pickup hours and location?",
      answer: "All orders are available for pickup at our main store located at 123 Medical Center Drive, Manila. Pickup hours are Monday to Friday, 8:00 AM to 6:00 PM, and Saturdays from 9:00 AM to 2:00 PM. Please bring your order confirmation and valid ID when picking up your items.",
      category: 'pickup',
      popularity: 88,
      tags: ['pickup', 'location', 'hours']
    },
    {
      id: 3,
      question: "Are your medical supplies certified and safe to use?",
      answer: "Yes, all our medical supplies are certified by the FDA and other relevant health authorities. We maintain strict quality control standards and source products only from reputable manufacturers. Each product includes detailed certification information and usage guidelines.",
      category: 'products',
      popularity: 92,
      tags: ['quality', 'certification', 'safety']
    },
    {
      id: 4,
      question: "What is your store policy regarding refunds?",
      answer: "Please note that we do not offer refunds on medical supplies due to hygiene and safety regulations. However, we do accept exchanges for defective products within 7 days of purchase. All items must be unopened and in original packaging for exchange consideration.",
      category: 'policy',
      popularity: 85,
      tags: ['policy', 'exchange', 'defective']
    },
    {
      id: 5,
      question: "How will I know when my order is ready for pickup?",
      answer: "You'll receive an SMS and email notification once your order is processed and ready for pickup. Most orders are ready within 2-4 hours during business hours. You can also check your order status in real-time through your account dashboard.",
      category: 'pickup',
      popularity: 78,
      tags: ['notification', 'status', 'pickup']
    },
    {
      id: 6,
      question: "Do you offer bulk pricing for medical facilities?",
      answer: "Yes, we provide special pricing for hospitals, clinics, and healthcare facilities. Contact our corporate sales team for customized quotes. Volume discounts are available for orders over ₱10,000, along with dedicated account management services.",
      category: 'ordering',
      popularity: 82,
      tags: ['bulk', 'pricing', 'facilities']
    },
    {
      id: 7,
      question: "What payment methods do you accept?",
      answer: "We accept all major credit cards (Visa, MasterCard, American Express), PayPal, GCash, Maya, and bank transfers. All payment processing is secured with SSL encryption to ensure your financial information remains protected.",
      category: 'ordering',
      popularity: 90,
      tags: ['payment', 'security', 'methods']
    },
    {
      id: 8,
      question: "How do I check product availability before ordering?",
      answer: "Real-time stock levels are displayed on each product page. Items marked 'In Stock' are available for immediate pickup. For high-demand items, we recommend calling ahead to confirm availability before placing your order.",
      category: 'products',
      popularity: 75,
      tags: ['availability', 'stock', 'inventory']
    },
    {
      id: 9,
      question: "Can I modify my order after placing it?",
      answer: "Order modifications are possible within 30 minutes of placement through your account dashboard. After this window, please contact customer service immediately. Once an order enters the preparation process, modifications may not be possible.",
      category: 'ordering',
      popularity: 80,
      tags: ['modification', 'changes', 'timeline']
    },
    {
      id: 10,
      question: "Do you provide product usage instructions and support?",
      answer: "Yes, all medical supplies include comprehensive usage instructions. For complex devices, we provide video tutorials and access to product specialists. Our team is available to answer any usage questions during pickup hours.",
      category: 'products',
      popularity: 72,
      tags: ['instructions', 'support', 'tutorials']
    }
  ];

  // Calculate category counts
  categories.forEach(cat => {
    cat.count = faqs.filter(faq => 
      cat.id === 'all' || faq.category === cat.id
    ).length;
  });

  const toggleFAQ = (id) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedItems(newExpanded);
  };

  const handleFeedback = (faqId, isHelpful) => {
    setFeedback(prev => ({
      ...prev,
      [faqId]: isHelpful
    }));
  };

  const sendChatMessage = () => {
    if (!chatMessage.trim()) return;

    const userMessage = {
      id: chatMessages.length + 1,
      text: chatMessage,
      isBot: false,
      timestamp: new Date()
    };

    setChatMessages(prev => [...prev, userMessage]);
    setChatMessage('');

    // Simulate bot response
    setTimeout(() => {
      const botResponse = {
        id: chatMessages.length + 2,
        text: "Thank you for your message. Our support team will respond shortly. For immediate assistance, you can call us at (02) 1234-5678.",
        isBot: true,
        timestamp: new Date()
      };
      setChatMessages(prev => [...prev, botResponse]);
    }, 1000);
  };

  const filteredFAQs = faqs.filter(faq => {
    const matchesCategory = activeCategory === 'all' || faq.category === activeCategory;
    const matchesSearch = searchTerm === '' || 
      faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchTerm.toLowerCase()) ||
      faq.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesCategory && matchesSearch;
  }).sort((a, b) => b.popularity - a.popularity);

  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.6)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 10000,
      padding: '1rem',
      backdropFilter: 'blur(10px)'
    }}>
      {/* Main Modal */}
      <div style={{
        backgroundColor: colors.white,
        borderRadius: '16px',
        width: '95%',
        maxWidth: '1400px',
        height: '90vh',
        display: 'flex',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        overflow: 'hidden',
        border: `1px solid ${colors.border}`
      }}>
        
        {/* Left Sidebar - Categories */}
        <div style={{
          width: '300px',
          padding: '2rem',
          borderRight: `1px solid ${colors.border}`,
          backgroundColor: '#fafbfc',
          display: 'flex',
          flexDirection: 'column',
          gap: '2rem'
        }}>
          {/* Header */}
          <div>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              marginBottom: '0.5rem'
            }}>
              <FiHelpCircle size={24} color={colors.primary} />
              <h2 style={{ 
                margin: 0, 
                fontSize: '1.5rem', 
                fontWeight: '600',
                color: colors.primary
              }}>
                Customer Support
              </h2>
            </div>
            <p style={{ 
              margin: 0, 
              color: colors.textMuted,
              fontSize: '0.9rem',
              lineHeight: '1.4'
            }}>
              Find answers to common questions about medical supplies and pickup
            </p>
          </div>

          {/* Categories */}
          <div>
            <h3 style={{ 
              fontSize: '0.85rem',
              fontWeight: '600',
              color: colors.textMuted,
              marginBottom: '1rem',
              textTransform: 'uppercase',
              letterSpacing: '0.5px'
            }}>
              Categories
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {categories.map(category => {
                const IconComponent = category.icon;
                return (
                  <button
                    key={category.id}
                    onClick={() => setActiveCategory(category.id)}
                    style={{
                      width: '100%',
                      padding: '1rem 1.25rem',
                      background: activeCategory === category.id ? colors.primary : 'transparent',
                      border: `1px solid ${activeCategory === category.id ? colors.primary : colors.border}`,
                      borderRadius: '10px',
                      color: activeCategory === category.id ? colors.white : colors.textMuted,
                      cursor: 'pointer',
                      fontSize: '0.9rem',
                      fontWeight: '500',
                      transition: 'all 0.2s ease',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      textAlign: 'left'
                    }}
                    onMouseEnter={(e) => {
                      if (activeCategory !== category.id) {
                        e.target.style.background = `${colors.primary}08`;
                        e.target.style.borderColor = colors.primary;
                        e.target.style.color = colors.primary;
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (activeCategory !== category.id) {
                        e.target.style.background = 'transparent';
                        e.target.style.borderColor = colors.border;
                        e.target.style.color = colors.textMuted;
                      }
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <IconComponent size={16} />
                      {category.name}
                    </div>
                    <span style={{
                      background: activeCategory === category.id ? 'rgba(255,255,255,0.2)' : `${colors.primary}15`,
                      color: activeCategory === category.id ? colors.white : colors.primary,
                      padding: '0.25rem 0.5rem',
                      borderRadius: '12px',
                      fontSize: '0.75rem',
                      fontWeight: '600',
                      minWidth: '28px'
                    }}>
                      {category.count}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Quick Info */}
          <div style={{
            padding: '1.5rem',
            background: `${colors.primary}05`,
            border: `1px solid ${colors.border}`,
            borderRadius: '10px'
          }}>
            <h4 style={{ 
              fontSize: '0.9rem',
              fontWeight: '600',
              color: colors.primary,
              marginBottom: '0.75rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}>
              <FiClock size={14} />
              Pickup Information
            </h4>
            <div style={{ fontSize: '0.8rem', color: colors.textMuted, lineHeight: '1.5' }}>
              <div><strong>Location:</strong> 123 Medical Center Drive</div>
              <div><strong>Hours:</strong> Mon-Fri 8AM-6PM</div>
              <div><strong>Phone:</strong> (02) 1234-5678</div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden'
        }}>
          {/* Top Bar */}
          <div style={{
            padding: '1.5rem 2rem',
            borderBottom: `1px solid ${colors.border}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: colors.white
          }}>
            <div>
              <h3 style={{ 
                margin: 0, 
                color: colors.primary,
                fontSize: '1.25rem',
                fontWeight: '600'
              }}>
                {categories.find(cat => cat.id === activeCategory)?.name}
              </h3>
              <p style={{ 
                margin: '0.25rem 0 0 0', 
                color: colors.textMuted,
                fontSize: '0.9rem'
              }}>
                {filteredFAQs.length} {filteredFAQs.length === 1 ? 'question' : 'questions'} found
                {searchTerm && ` for "${searchTerm}"`}
              </p>
            </div>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              {/* Search */}
              <div style={{ position: 'relative', width: '300px' }}>
                <FiSearch style={{
                  position: 'absolute',
                  left: '1rem',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: colors.textMuted,
                  fontSize: '1rem'
                }} />
                <input
                  type="text"
                  placeholder="Search questions..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.875rem 1rem 0.875rem 2.5rem',
                    border: `1px solid ${colors.border}`,
                    borderRadius: '8px',
                    fontSize: '0.9rem',
                    outline: 'none',
                    backgroundColor: colors.white,
                    color: colors.primary,
                    transition: 'all 0.2s ease'
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = colors.primary;
                    e.target.style.boxShadow = `0 0 0 3px ${colors.primary}15`;
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = colors.border;
                    e.target.style.boxShadow = 'none';
                  }}
                />
              </div>

              <button
                onClick={onClose}
                style={{
                  background: 'none',
                  border: `1px solid ${colors.border}`,
                  color: colors.textMuted,
                  padding: '0.875rem',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '1rem',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  e.target.style.background = `${colors.primary}08`;
                  e.target.style.borderColor = colors.primary;
                  e.target.style.color = colors.primary;
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = 'none';
                  e.target.style.borderColor = colors.border;
                  e.target.style.color = colors.textMuted;
                }}
              >
                <FiX />
              </button>
            </div>
          </div>

          {/* FAQ List */}
          <div style={{
            flex: 1,
            padding: '2rem',
            overflowY: 'auto',
            backgroundColor: colors.white
          }}>
            {filteredFAQs.length === 0 ? (
              <div style={{
                textAlign: 'center',
                padding: '4rem 2rem',
                color: colors.textMuted
              }}>
                <FiHelpCircle size={48} style={{ opacity: 0.3, marginBottom: '1rem' }} />
                <h4 style={{ 
                  color: colors.primary, 
                  marginBottom: '0.5rem',
                  fontWeight: '600'
                }}>
                  No questions found
                </h4>
                <p>Try adjusting your search terms or browse different categories.</p>
              </div>
            ) : (
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '1rem',
                maxWidth: '800px',
                margin: '0 auto'
              }}>
                {filteredFAQs.map(faq => (
                  <div
                    key={faq.id}
                    style={{
                      border: `1px solid ${colors.border}`,
                      borderRadius: '12px',
                      overflow: 'hidden',
                      transition: 'all 0.2s ease',
                      background: colors.white
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = colors.primary;
                      e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.05)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = colors.border;
                      e.currentTarget.style.boxShadow = 'none';
                    }}
                  >
                    <button
                      onClick={() => toggleFAQ(faq.id)}
                      style={{
                        width: '100%',
                        padding: '1.5rem',
                        background: 'none',
                        border: 'none',
                        textAlign: 'left',
                        cursor: 'pointer',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'flex-start',
                        gap: '1rem',
                        color: colors.primary,
                        fontWeight: '500',
                        fontSize: '0.95rem',
                        lineHeight: '1.4'
                      }}
                    >
                      <span style={{ flex: 1 }}>{faq.question}</span>
                      {expandedItems.has(faq.id) ? 
                        <FiChevronUp size={20} style={{ flexShrink: 0, color: colors.textMuted }} /> : 
                        <FiChevronDown size={20} style={{ flexShrink: 0, color: colors.textMuted }} />
                      }
                    </button>
                    
                    {expandedItems.has(faq.id) && (
                      <div style={{
                        padding: '0 1.5rem 1.5rem 1.5rem',
                        borderTop: `1px solid ${colors.border}`
                      }}>
                        <p style={{
                          margin: '0 0 1.5rem 0',
                          color: colors.textMuted,
                          lineHeight: '1.6',
                          fontSize: '0.9rem'
                        }}>
                          {faq.answer}
                        </p>
                        
                        {/* Tags */}
                        <div style={{
                          display: 'flex',
                          flexWrap: 'wrap',
                          gap: '0.5rem',
                          marginBottom: '1.5rem'
                        }}>
                          {faq.tags.map(tag => (
                            <span
                              key={tag}
                              style={{
                                background: `${colors.primary}08`,
                                color: colors.primary,
                                padding: '0.375rem 0.75rem',
                                borderRadius: '6px',
                                fontSize: '0.75rem',
                                fontWeight: '500'
                              }}
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                        
                        {/* Feedback */}
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '1rem',
                          paddingTop: '1rem',
                          borderTop: `1px solid ${colors.border}`
                        }}>
                          <span style={{
                            fontSize: '0.85rem',
                            color: colors.textMuted,
                            fontWeight: '500'
                          }}>
                            Was this helpful?
                          </span>
                          <button
                            onClick={() => handleFeedback(faq.id, true)}
                            style={{
                              padding: '0.5rem 1rem',
                              background: feedback[faq.id] === true ? colors.primary : 'transparent',
                              border: `1px solid ${feedback[faq.id] === true ? colors.primary : colors.border}`,
                              borderRadius: '6px',
                              color: feedback[faq.id] === true ? colors.white : colors.textMuted,
                              cursor: 'pointer',
                              fontSize: '0.8rem',
                              fontWeight: '500',
                              transition: 'all 0.2s ease'
                            }}
                          >
                            Yes
                          </button>
                          <button
                            onClick={() => handleFeedback(faq.id, false)}
                            style={{
                              padding: '0.5rem 1rem',
                              background: feedback[faq.id] === false ? colors.alert : 'transparent',
                              border: `1px solid ${feedback[faq.id] === false ? colors.alert : colors.border}`,
                              borderRadius: '6px',
                              color: feedback[faq.id] === false ? colors.white : colors.textMuted,
                              cursor: 'pointer',
                              fontSize: '0.8rem',
                              fontWeight: '500',
                              transition: 'all 0.2s ease'
                            }}
                          >
                            No
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Support Section */}
            <div style={{
              marginTop: '3rem',
              padding: '2rem',
              background: '#fafbfc',
              borderRadius: '12px',
              border: `1px solid ${colors.border}`,
              textAlign: 'center',
              maxWidth: '800px',
              margin: '3rem auto 0 auto'
            }}>
              <FiMessageCircle size={32} color={colors.primary} style={{ marginBottom: '1rem' }} />
              <h4 style={{ 
                color: colors.primary, 
                marginBottom: '0.5rem',
                fontWeight: '600'
              }}>
                Need more help?
              </h4>
              <p style={{ 
                color: colors.textMuted, 
                marginBottom: '1.5rem',
                fontSize: '0.9rem'
              }}>
                Our support team is here to assist you with medical supply questions.
              </p>
              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
                <button
                  onClick={() => setChatOpen(true)}
                  style={{
                    padding: '0.875rem 2rem',
                    background: colors.primary,
                    color: colors.white,
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontSize: '0.9rem',
                    fontWeight: '500',
                    transition: 'all 0.2s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.background = '#3730a3';
                    e.target.style.transform = 'translateY(-1px)';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.background = colors.primary;
                    e.target.style.transform = 'translateY(0)';
                  }}
                >
                  Start Chat
                </button>
                <button
                  style={{
                    padding: '0.875rem 2rem',
                    background: 'transparent',
                    color: colors.primary,
                    border: `1px solid ${colors.primary}`,
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontSize: '0.9rem',
                    fontWeight: '500',
                    transition: 'all 0.2s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.background = `${colors.primary}08`;
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.background = 'transparent';
                  }}
                >
                  Call Support
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Chat Bot */}
      {chatOpen && (
        <div style={{
          position: 'fixed',
          bottom: '2rem',
          right: '2rem',
          width: '400px',
          height: '600px',
          background: colors.white,
          borderRadius: '12px',
          boxShadow: '0 20px 40px rgba(0, 0, 0, 0.15)',
          border: `1px solid ${colors.border}`,
          display: 'flex',
          flexDirection: 'column',
          zIndex: 10001,
          overflow: 'hidden'
        }}>
          {/* Chat Header */}
          <div style={{
            padding: '1.25rem',
            background: colors.primary,
            color: colors.white,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div style={{
                width: '36px',
                height: '36px',
                background: 'rgba(255,255,255,0.2)',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <FiUser size={18} />
              </div>
              <div>
                <div style={{ fontWeight: '600', fontSize: '1rem' }}>MedSupply Support</div>
                <div style={{ fontSize: '0.8rem', opacity: 0.9 }}>Typically replies instantly</div>
              </div>
            </div>
            <button
              onClick={() => setChatOpen(false)}
              style={{
                background: 'rgba(255,255,255,0.2)',
                border: 'none',
                color: colors.white,
                padding: '0.5rem',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '1rem'
              }}
            >
              <FiX />
            </button>
          </div>

          {/* Chat Messages */}
          <div style={{
            flex: 1,
            padding: '1.25rem',
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem',
            background: '#fafbfc'
          }}>
            {chatMessages.map(message => (
              <div
                key={message.id}
                style={{
                  alignSelf: message.isBot ? 'flex-start' : 'flex-end',
                  maxWidth: '85%'
                }}
              >
                <div style={{
                  background: message.isBot ? colors.white : colors.primary,
                  color: message.isBot ? colors.primary : colors.white,
                  padding: '0.875rem 1rem',
                  borderRadius: message.isBot ? '12px 12px 12px 4px' : '12px 12px 4px 12px',
                  fontSize: '0.875rem',
                  lineHeight: '1.4',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
                }}>
                  {message.text}
                </div>
              </div>
            ))}
          </div>

          {/* Chat Input */}
          <div style={{
            padding: '1.25rem',
            borderTop: `1px solid ${colors.border}`,
            background: colors.white
          }}>
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <input
                type="text"
                placeholder="Type your message..."
                value={chatMessage}
                onChange={(e) => setChatMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && sendChatMessage()}
                style={{
                  flex: 1,
                  padding: '0.875rem 1rem',
                  border: `1px solid ${colors.border}`,
                  borderRadius: '8px',
                  fontSize: '0.875rem',
                  outline: 'none',
                  background: '#fafbfc'
                }}
              />
              <button
                onClick={sendChatMessage}
                disabled={!chatMessage.trim()}
                style={{
                  padding: '0.875rem 1rem',
                  background: colors.primary,
                  color: colors.white,
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '1rem',
                  opacity: chatMessage.trim() ? 1 : 0.5,
                  transition: 'all 0.2s ease'
                }}
              >
                <FiSend />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FAQsModal;