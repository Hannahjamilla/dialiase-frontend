import React, { useState, useEffect } from 'react';
import { 
  FaStar, 
  FaUser, 
  FaBox, 
  FaCheck, 
  FaTimes, 
  FaTrash,
  FaSearch,
  FaFilter,
  FaEye,
  FaComment
} from 'react-icons/fa';
import api from '../../../api/axios';

const ReviewsManagement = () => {
  const [reviews, setReviews] = useState([]);
  const [filteredReviews, setFilteredReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedReview, setSelectedReview] = useState(null);

  const colors = {
    primary: '#395886',
    secondary: '#638ECB',
    success: '#10b981',
    warning: '#f59e0b',
    danger: '#ef4444',
    white: '#FFFFFF',
    lightGray: '#f8fafc',
    darkGray: '#64748b',
    textDark: '#1e293b'
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  useEffect(() => {
    filterReviews();
  }, [searchTerm, statusFilter, reviews]);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const response = await api.get('/supplies/reviews/all');
      
      if (response.data.success) {
        setReviews(response.data.reviews);
      } else {
        throw new Error('Failed to fetch reviews');
      }
    } catch (error) {
      console.error('Error fetching reviews:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterReviews = () => {
    let filtered = reviews;

    if (statusFilter !== 'all') {
      filtered = filtered.filter(review => review.status === statusFilter);
    }

    if (searchTerm) {
      filtered = filtered.filter(review =>
        review.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        review.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        review.comment.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredReviews(filtered);
  };

  const updateReviewStatus = async (reviewID, status) => {
    try {
      const response = await api.put(`/supplies/reviews/${reviewID}/status`, { status });
      
      if (response.data.success) {
        setReviews(prev => prev.map(review => 
          review.reviewID === reviewID ? { ...review, status } : review
        ));
      }
    } catch (error) {
      console.error('Error updating review status:', error);
    }
  };

  const deleteReview = async (reviewID) => {
    if (window.confirm('Are you sure you want to delete this review?')) {
      try {
        const response = await api.delete(`/supplies/reviews/${reviewID}`);
        
        if (response.data.success) {
          setReviews(prev => prev.filter(review => review.reviewID !== reviewID));
        }
      } catch (error) {
        console.error('Error deleting review:', error);
      }
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'approved': return colors.success;
      case 'pending': return colors.warning;
      case 'rejected': return colors.danger;
      default: return colors.darkGray;
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'approved': return <FaCheck />;
      case 'pending': return <FaEye />;
      case 'rejected': return <FaTimes />;
      default: return null;
    }
  };

  const renderStars = (rating) => {
    return Array.from({ length: 5 }, (_, i) => (
      <FaStar
        key={i}
        color={i < rating ? '#fbbf24' : '#d1d5db'}
        style={{ marginRight: '2px' }}
      />
    ));
  };

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '400px',
        backgroundColor: colors.white,
        borderRadius: '12px'
      }}>
        <div style={{
          width: '40px',
          height: '40px',
          border: `4px solid ${colors.secondary}20`,
          borderTop: `4px solid ${colors.primary}`,
          borderRadius: '50%',
          animation: 'spin 1s linear infinite'
        }}></div>
      </div>
    );
  }

  return (
    <div style={{ padding: '24px', backgroundColor: colors.lightGray, minHeight: '100vh' }}>
      {/* Header */}
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{
          fontSize: '28px',
          fontWeight: '700',
          color: colors.textDark,
          margin: '0 0 8px 0',
          display: 'flex',
          alignItems: 'center',
          gap: '12px'
        }}>
          <FaComment color={colors.primary} />
          Product Reviews Management
        </h1>
        <p style={{
          margin: 0,
          color: colors.darkGray,
          fontSize: '16px'
        }}>
          Manage and moderate customer reviews for medical supplies
        </p>
      </div>

      {/* Filters */}
      <div style={{
        backgroundColor: colors.white,
        padding: '24px',
        borderRadius: '12px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
        marginBottom: '24px'
      }}>
        <div style={{
          display: 'flex',
          gap: '16px',
          alignItems: 'center',
          flexWrap: 'wrap'
        }}>
          <div style={{ position: 'relative', flex: '1 1 300px', minWidth: '250px' }}>
            <FaSearch style={{
              position: 'absolute',
              left: '12px',
              top: '50%',
              transform: 'translateY(-50%)',
              color: colors.darkGray
            }} />
            <input
              type="text"
              placeholder="Search reviews by user, product, or comment..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                width: '100%',
                padding: '12px 12px 12px 40px',
                border: `1px solid #d1d5db`,
                borderRadius: '8px',
                fontSize: '14px',
                outline: 'none',
                transition: 'all 0.3s ease',
                backgroundColor: colors.lightGray
              }}
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            style={{
              padding: '12px 16px',
              border: `1px solid #d1d5db`,
              borderRadius: '8px',
              fontSize: '14px',
              outline: 'none',
              backgroundColor: colors.lightGray,
              cursor: 'pointer',
              minWidth: '150px'
            }}
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
      </div>

      {/* Reviews Grid */}
      <div style={{
        display: 'grid',
        gap: '20px'
      }}>
        {filteredReviews.length === 0 ? (
          <div style={{
            backgroundColor: colors.white,
            padding: '60px 20px',
            borderRadius: '12px',
            textAlign: 'center',
            boxShadow: '0 4px 12px rgba(0,0,0,0.08)'
          }}>
            <FaComment size={48} style={{ marginBottom: '16px', opacity: 0.5, color: colors.darkGray }} />
            <p style={{ fontSize: '16px', color: colors.darkGray, margin: 0 }}>
              No reviews found matching your criteria.
            </p>
          </div>
        ) : (
          filteredReviews.map(review => (
            <div
              key={review.reviewID}
              style={{
                backgroundColor: colors.white,
                padding: '24px',
                borderRadius: '12px',
                boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                borderLeft: `4px solid ${getStatusColor(review.status)}`,
                transition: 'all 0.3s ease',
                cursor: 'pointer'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 6px 16px rgba(0,0,0,0.12)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.08)';
              }}
            >
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                marginBottom: '16px',
                flexWrap: 'wrap',
                gap: '16px'
              }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                    <div style={{
                      backgroundColor: `${colors.primary}15`,
                      padding: '8px',
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      <FaUser color={colors.primary} size={16} />
                    </div>
                    <h3 style={{ 
                      margin: 0, 
                      fontSize: '16px', 
                      fontWeight: '600',
                      color: colors.textDark
                    }}>
                      {review.userName}
                    </h3>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}>
                      {renderStars(review.rating)}
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                    <FaBox color={colors.darkGray} size={14} />
                    <span style={{ color: colors.darkGray, fontSize: '14px' }}>
                      {review.productName}
                    </span>
                  </div>

                  <p style={{ 
                    margin: 0, 
                    color: colors.textDark,
                    lineHeight: '1.5',
                    fontSize: '14px'
                  }}>
                    {review.comment}
                  </p>
                </div>

                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px',
                  alignItems: 'flex-end'
                }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '6px 12px',
                    backgroundColor: `${getStatusColor(review.status)}15`,
                    color: getStatusColor(review.status),
                    borderRadius: '20px',
                    fontSize: '12px',
                    fontWeight: '500'
                  }}>
                    {getStatusIcon(review.status)}
                    {review.status.charAt(0).toUpperCase() + review.status.slice(1)}
                  </div>

                  <div style={{ display: 'flex', gap: '8px' }}>
                    {review.status === 'pending' && (
                      <>
                        <button
                          onClick={() => updateReviewStatus(review.reviewID, 'approved')}
                          style={{
                            padding: '8px 12px',
                            border: 'none',
                            backgroundColor: `${colors.success}15`,
                            color: colors.success,
                            borderRadius: '6px',
                            cursor: 'pointer',
                            fontSize: '12px',
                            fontWeight: '500',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px',
                            transition: 'all 0.3s ease'
                          }}
                          onMouseEnter={(e) => {
                            e.target.style.backgroundColor = colors.success;
                            e.target.style.color = colors.white;
                          }}
                          onMouseLeave={(e) => {
                            e.target.style.backgroundColor = `${colors.success}15`;
                            e.target.style.color = colors.success;
                          }}
                        >
                          <FaCheck /> Approve
                        </button>
                        <button
                          onClick={() => updateReviewStatus(review.reviewID, 'rejected')}
                          style={{
                            padding: '8px 12px',
                            border: 'none',
                            backgroundColor: `${colors.danger}15`,
                            color: colors.danger,
                            borderRadius: '6px',
                            cursor: 'pointer',
                            fontSize: '12px',
                            fontWeight: '500',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px',
                            transition: 'all 0.3s ease'
                          }}
                          onMouseEnter={(e) => {
                            e.target.style.backgroundColor = colors.danger;
                            e.target.style.color = colors.white;
                          }}
                          onMouseLeave={(e) => {
                            e.target.style.backgroundColor = `${colors.danger}15`;
                            e.target.style.color = colors.danger;
                          }}
                        >
                          <FaTimes /> Reject
                        </button>
                      </>
                    )}
                    <button
                      onClick={() => deleteReview(review.reviewID)}
                      style={{
                        padding: '8px 12px',
                        border: 'none',
                        backgroundColor: `${colors.danger}15`,
                        color: colors.danger,
                        borderRadius: '6px',
                        cursor: 'pointer',
                        fontSize: '12px',
                        fontWeight: '500',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                        transition: 'all 0.3s ease'
                      }}
                      onMouseEnter={(e) => {
                        e.target.style.backgroundColor = colors.danger;
                        e.target.style.color = colors.white;
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.backgroundColor = `${colors.danger}15`;
                        e.target.style.color = colors.danger;
                      }}
                    >
                      <FaTrash /> Delete
                    </button>
                  </div>
                </div>
              </div>

              {review.video_path && (
                <div style={{ marginTop: '16px' }}>
                  <video
                    controls
                    style={{
                      width: '100%',
                      maxWidth: '400px',
                      borderRadius: '8px',
                      backgroundColor: colors.lightGray
                    }}
                  >
                    <source src={review.video_path} type="video/mp4" />
                    Your browser does not support the video tag.
                  </video>
                </div>
              )}

              <div style={{
                marginTop: '16px',
                paddingTop: '16px',
                borderTop: `1px solid ${colors.lightGray}`,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                fontSize: '12px',
                color: colors.darkGray
              }}>
                <span>Review ID: {review.reviewID}</span>
                <span>Posted: {new Date(review.created_at).toLocaleDateString()}</span>
              </div>
            </div>
          ))
        )}
      </div>

      <style>
        {`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}
      </style>
    </div>
  );
};

export default ReviewsManagement;