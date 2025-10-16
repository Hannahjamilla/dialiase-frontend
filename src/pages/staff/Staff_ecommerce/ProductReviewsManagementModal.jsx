import React, { useState, useEffect, useCallback } from 'react';
import { 
  FaTimes, 
  FaSearch, 
  FaStar, 
  FaUser, 
  FaBox, 
  FaCalendarAlt,
  FaChartBar,
  FaSync,
  FaThumbsUp,
  FaComment,
  FaChartPie,
  FaFilter,
  FaSort,
  FaChevronLeft,
  FaChevronRight,
  FaExclamationTriangle,
  FaCheckCircle
} from 'react-icons/fa';
import Notification from '../../../components/Notification';
import api from '../../../api/axios';

const ProductReviewsManagementModal = ({ isOpen, onClose, userId }) => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [notification, setNotification] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    rating: '',
    // status: '',
    sort_by: 'created_at',
    sort_order: 'desc'
  });
  const [pagination, setPagination] = useState({
    current_page: 1,
    total_pages: 1,
    total_items: 0,
    per_page: 8
  });
  const [analytics, setAnalytics] = useState(null);
  const [selectedReview, setSelectedReview] = useState(null);

  // Color variables with improved contrast
  const colors = {
    primary: '#2C5282',
    secondary: '#4A90E2',
    accent: '#3182CE',
    white: '#FFFFFF',
    green: '#2D7D6F',
    lightGray: '#F7FAFC',
    mediumGray: '#E2E8F0',
    darkGray: '#4A5568',
    textDark: '#1A202C',
    textLight: '#718096',
    success: '#38A169',
    warning: '#D69E2E',
    error: '#E53E3E',
    info: '#3182CE'
  };

  // Memoized fetch functions
  const fetchReviews = useCallback(async () => {
    try {
      setLoading(true);
      
      const params = {
        page: pagination.current_page,
        per_page: pagination.per_page,
        search: searchTerm,
        ...filters
      };

      // Remove empty filters
      Object.keys(params).forEach(key => {
        if (params[key] === '' || params[key] === null) {
          delete params[key];
        }
      });

      const response = await api.get('/user-product-reviews', { params });

      if (response.data.success) {
        setReviews(response.data.reviews || []);
        setPagination(prev => ({
          ...prev,
          ...response.data.pagination
        }));
      } else {
        throw new Error(response.data.message || 'Failed to fetch reviews');
      }
    } catch (error) {
      console.error('Error fetching reviews:', error);
      setNotification({
        message: error.response?.data?.message || "Failed to fetch product reviews. Please try again.",
        type: 'error'
      });
      setReviews([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [pagination.current_page, pagination.per_page, searchTerm, filters]);

  const fetchAnalytics = useCallback(async () => {
    try {
      const response = await api.get('/user-product-reviews/statistics');
      
      if (response.data.success) {
        const stats = response.data.statistics;
        
        const totalRatings = stats.rating_distribution.reduce((sum, item) => sum + item.count, 0);
        const averageRating = totalRatings > 0 
          ? stats.rating_distribution.reduce((sum, item) => sum + (item.rating * item.count), 0) / totalRatings
          : 0;
        
        setAnalytics({
          totalReviews: stats.total_reviews,
          averageRating: averageRating.toFixed(1),
          ratingDistribution: stats.rating_distribution,
          totalRatings: totalRatings,
          recentReviews: stats.recent_reviews || 0
        });
      }
    } catch (error) {
      console.error('Error fetching analytics:', error);
    }
  }, []);

  useEffect(() => {
    if (isOpen) {
      fetchReviews();
      fetchAnalytics();
    }
  }, [isOpen, fetchReviews, fetchAnalytics]);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (isOpen) {
        setPagination(prev => ({ ...prev, current_page: 1 }));
        fetchReviews();
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [searchTerm, isOpen, fetchReviews]);

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
    setPagination(prev => ({ ...prev, current_page: 1 }));
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const handlePageChange = (page) => {
    setPagination(prev => ({ ...prev, current_page: page }));
    // Scroll to top when page changes
    const mainContent = document.querySelector('.reviews-main-content');
    if (mainContent) {
      mainContent.scrollTop = 0;
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await Promise.all([fetchReviews(), fetchAnalytics()]);
  };

  const renderStars = (rating, size = 14) => {
    return Array.from({ length: 5 }, (_, index) => (
      <FaStar
        key={index}
        color={index < rating ? '#F6AD55' : '#CBD5E0'}
        size={size}
        style={{ transition: 'color 0.2s ease' }}
      />
    ));
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Unknown date';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      return 'Invalid date';
    }
  };

  const handleCloseNotification = () => {
    setNotification(null);
  };

  const getStatusBadge = (review) => {
    const statusConfig = {
      approved: { color: colors.success, icon: FaCheckCircle, label: 'Approved' },
      pending: { color: colors.warning, icon: FaExclamationTriangle, label: 'Pending' },
      rejected: { color: colors.error, icon: FaTimes, label: 'Rejected' }
    };
    
    const status = review.status || 'approved';
    const config = statusConfig[status] || statusConfig.approved;
    const IconComponent = config.icon;

    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '4px',
        padding: '4px 8px',
        backgroundColor: `${config.color}15`,
        color: config.color,
        borderRadius: '6px',
        fontSize: '11px',
        fontWeight: '600',
        textTransform: 'capitalize'
      }}>
        <IconComponent size={8} />
        {config.label}
      </div>
    );
  };

  // Enhanced Analytics Sidebar
  const renderAnalyticsSidebar = () => {
    if (!analytics) {
      return (
        <div style={{
          width: '320px',
          backgroundColor: colors.lightGray,
          borderRight: `1px solid ${colors.mediumGray}`,
          padding: '24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <div style={{ textAlign: 'center', color: colors.textLight }}>
            <div style={{
              width: '40px',
              height: '40px',
              border: `3px solid ${colors.mediumGray}`,
              borderTop: `3px solid ${colors.primary}`,
              borderRadius: '50%',
              animation: 'spin 1s linear infinite',
              margin: '0 auto 12px'
            }}></div>
            Loading analytics...
          </div>
        </div>
      );
    }

    return (
      <div style={{
        width: '320px',
        backgroundColor: colors.lightGray,
        borderRight: `1px solid ${colors.mediumGray}`,
        padding: '24px',
        overflow: 'auto',
        display: 'flex',
        flexDirection: 'column',
        gap: '20px'
      }}>
        {/* Summary Cards */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '12px'
        }}>
          <div style={{
            backgroundColor: colors.white,
            padding: '16px',
            borderRadius: '10px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
            border: `1px solid ${colors.mediumGray}`
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{
                backgroundColor: `${colors.primary}15`,
                padding: '10px',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <FaComment color={colors.primary} size={18} />
              </div>
              <div>
                <div style={{ fontSize: '20px', fontWeight: '700', color: colors.textDark }}>
                  {analytics.totalReviews}
                </div>
                <div style={{ fontSize: '12px', color: colors.textLight, fontWeight: '500' }}>Total Reviews</div>
              </div>
            </div>
          </div>

          <div style={{
            backgroundColor: colors.white,
            padding: '16px',
            borderRadius: '10px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
            border: `1px solid ${colors.mediumGray}`
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{
                backgroundColor: `${colors.green}15`,
                padding: '10px',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <FaStar color={colors.green} size={18} />
              </div>
              <div>
                <div style={{ fontSize: '20px', fontWeight: '700', color: colors.textDark }}>
                  {analytics.averageRating}/5
                </div>
                <div style={{ fontSize: '12px', color: colors.textLight, fontWeight: '500' }}>Average Rating</div>
              </div>
            </div>
          </div>
        </div>

        {/* Rating Distribution */}
        <div style={{
          backgroundColor: colors.white,
          padding: '20px',
          borderRadius: '10px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          border: `1px solid ${colors.mediumGray}`,
          flex: 1
        }}>
          <h4 style={{ 
            margin: '0 0 16px 0', 
            fontSize: '16px', 
            fontWeight: '600',
            color: colors.textDark,
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <FaChartPie size={14} /> Rating Distribution
          </h4>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {[5, 4, 3, 2, 1].map((rating) => {
              const distribution = analytics.ratingDistribution.find(item => item.rating === rating);
              const count = distribution?.count || 0;
              const percentage = analytics.totalRatings > 0 ? (count / analytics.totalRatings) * 100 : 0;
              
              return (
                <div key={rating} style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  <div style={{ display: 'flex', gap: '2px', width: '70px' }}>
                    {renderStars(rating, 12)}
                  </div>
                  <div style={{
                    flex: 1,
                    height: '8px',
                    backgroundColor: colors.mediumGray,
                    borderRadius: '4px',
                    overflow: 'hidden',
                    position: 'relative'
                  }}>
                    <div style={{
                      width: `${percentage}%`,
                      height: '100%',
                      backgroundColor: rating >= 4 ? colors.success : rating >= 3 ? colors.warning : colors.error,
                      borderRadius: '4px',
                      transition: 'width 0.5s ease'
                    }} />
                  </div>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    minWidth: '45px'
                  }}>
                    <span style={{
                      fontSize: '12px',
                      color: colors.textDark,
                      fontWeight: '600'
                    }}>
                      {count}
                    </span>
                    <span style={{
                      fontSize: '11px',
                      color: colors.textLight
                    }}>
                      ({percentage.toFixed(0)}%)
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  };

  // Enhanced Review Cards
  const renderReviewCards = () => {
    if (loading && reviews.length === 0) {
      return (
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          padding: '80px 20px',
          color: colors.textLight,
          flexDirection: 'column',
          gap: '16px'
        }}>
          <div style={{
            width: '48px',
            height: '48px',
            border: `4px solid ${colors.mediumGray}`,
            borderTop: `4px solid ${colors.primary}`,
            borderRadius: '50%',
            animation: 'spin 1s linear infinite'
          }}></div>
          <span style={{ fontSize: '16px', fontWeight: '500' }}>Loading reviews...</span>
        </div>
      );
    }

    if (reviews.length === 0) {
      return (
        <div style={{
          textAlign: 'center',
          padding: '80px 20px',
          color: colors.textLight
        }}>
          <div style={{
            width: '80px',
            height: '80px',
            backgroundColor: colors.lightGray,
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 20px',
            border: `2px dashed ${colors.mediumGray}`
          }}>
            <FaSearch size={32} color={colors.mediumGray} />
          </div>
          <h3 style={{ 
            margin: '0 0 8px 0', 
            color: colors.textDark,
            fontSize: '20px',
            fontWeight: '600'
          }}>
            No Reviews Found
          </h3>
          <p style={{ 
            fontSize: '15px', 
            margin: '0 0 24px 0',
            lineHeight: '1.5'
          }}>
            {searchTerm || filters.rating || filters.status
              ? 'Try adjusting your search criteria or filters.' 
              : 'No product reviews available at the moment.'}
          </p>
          <button 
            onClick={handleRefresh}
            disabled={refreshing}
            style={{
              backgroundColor: colors.primary,
              color: colors.white,
              border: 'none',
              padding: '10px 20px',
              borderRadius: '8px',
              cursor: refreshing ? 'not-allowed' : 'pointer',
              fontWeight: '500',
              transition: 'all 0.2s ease',
              opacity: refreshing ? 0.7 : 1,
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              margin: '0 auto'
            }}
            onMouseEnter={(e) => {
              if (!refreshing) {
                e.target.style.backgroundColor = colors.secondary;
                e.target.style.transform = 'translateY(-1px)';
              }
            }}
            onMouseLeave={(e) => {
              if (!refreshing) {
                e.target.style.backgroundColor = colors.primary;
                e.target.style.transform = 'translateY(0)';
              }
            }}
          >
            <FaSync className={refreshing ? 'spinning' : ''} />
            {refreshing ? 'Refreshing...' : 'Refresh Data'}
          </button>
        </div>
      );
    }

    return (
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(380px, 1fr))',
        gap: '20px',
        padding: '24px',
        alignContent: 'flex-start'
      }}>
        {reviews.map((review) => (
          <div
            key={review.reviewID}
            style={{
              backgroundColor: colors.white,
              borderRadius: '12px',
              padding: '20px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
              border: `1px solid ${colors.mediumGray}`,
              transition: 'all 0.3s ease',
              display: 'flex',
              flexDirection: 'column',
              gap: '14px',
              cursor: 'pointer',
              position: 'relative'
            }}
            onClick={() => setSelectedReview(review)}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-4px)';
              e.currentTarget.style.boxShadow = '0 8px 25px rgba(0,0,0,0.15)';
              e.currentTarget.style.borderColor = colors.accent;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.08)';
              e.currentTarget.style.borderColor = colors.mediumGray;
            }}
          >
            {/* Header */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
              gap: '12px'
            }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  marginBottom: '6px'
                }}>
                  <div style={{
                    width: '32px',
                    height: '32px',
                    backgroundColor: colors.primary,
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0
                  }}>
                    <FaUser color={colors.white} size={14} />
                  </div>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ 
                      fontSize: '14px', 
                      fontWeight: '600',
                      color: colors.textDark,
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis'
                    }}>
                      {review.is_anonymous ? 'Anonymous User' : (review.user?.name || 'Unknown User')}
                    </div>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      marginTop: '2px'
                    }}>
                      <FaBox color={colors.textLight} size={10} />
                      <span style={{ 
                        fontSize: '12px', 
                        color: colors.textLight,
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis'
                      }}>
                        {review.supply?.name || 'Unknown Product'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'flex-end',
                gap: '6px'
              }}>
                <div style={{ display: 'flex', gap: '2px' }}>
                  {renderStars(review.rating, 14)}
                </div>
                {getStatusBadge(review)}
              </div>
            </div>

            {/* Review Comment */}
            <div style={{
              color: colors.textDark,
              lineHeight: '1.5',
              fontSize: '14px',
              flex: 1,
              display: '-webkit-box',
              WebkitLineClamp: 4,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
              minHeight: '60px'
            }}>
              {review.comment || (
                <span style={{ color: colors.textLight, fontStyle: 'italic' }}>
                  No comment provided
                </span>
              )}
            </div>

            {/* Footer */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              paddingTop: '12px',
              borderTop: `1px solid ${colors.mediumGray}`
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                color: colors.textLight,
                fontSize: '12px'
              }}>
                <FaCalendarAlt size={10} />
                <span>{formatDate(review.created_at)}</span>
              </div>
              
              <div style={{
                fontSize: '11px',
                color: colors.textLight,
                fontWeight: '500',
                backgroundColor: colors.lightGray,
                padding: '2px 6px',
                borderRadius: '4px'
              }}>
                ID: {review.reviewID}
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  // Review Detail Modal
  const renderReviewDetail = () => {
    if (!selectedReview) return null;

    return (
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 2000,
        padding: '20px',
        backdropFilter: 'blur(8px)'
      }}>
        <div style={{
          backgroundColor: colors.white,
          borderRadius: '12px',
          padding: '24px',
          maxWidth: '500px',
          width: '100%',
          maxHeight: '90vh',
          overflow: 'auto',
          position: 'relative',
          boxShadow: '0 20px 60px rgba(0,0,0,0.3)'
        }}>
          <button 
            onClick={() => setSelectedReview(null)}
            style={{
              position: 'absolute',
              top: '16px',
              right: '16px',
              backgroundColor: colors.lightGray,
              color: colors.textLight,
              border: 'none',
              cursor: 'pointer',
              padding: '8px',
              borderRadius: '6px',
              transition: 'all 0.2s ease',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
            onMouseEnter={(e) => {
              e.target.style.backgroundColor = colors.mediumGray;
            }}
            onMouseLeave={(e) => {
              e.target.style.backgroundColor = colors.lightGray;
            }}
          >
            <FaTimes size={16} />
          </button>

          <div style={{ marginBottom: '24px' }}>
            <h3 style={{ 
              margin: '0 0 16px 0', 
              fontSize: '20px', 
              fontWeight: '700',
              color: colors.textDark
            }}>
              Review Details
            </h3>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
              <div style={{
                width: '48px',
                height: '48px',
                backgroundColor: colors.primary,
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <FaUser color={colors.white} size={18} />
              </div>
              <div>
                <div style={{ 
                  fontSize: '16px', 
                  fontWeight: '600',
                  color: colors.textDark
                }}>
                  {selectedReview.is_anonymous ? 'Anonymous User' : (selectedReview.user?.name || 'Unknown User')}
                </div>
                <div style={{ 
                  fontSize: '14px', 
                  color: colors.textLight 
                }}>
                  {selectedReview.user?.email || 'No email provided'}
                </div>
              </div>
            </div>

            <div style={{ 
              backgroundColor: colors.lightGray,
              padding: '16px',
              borderRadius: '8px',
              marginBottom: '16px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                <FaBox color={colors.textLight} size={12} />
                <span style={{ 
                  fontSize: '14px', 
                  fontWeight: '600',
                  color: colors.textDark
                }}>
                  Product: {selectedReview.supply?.name || 'Unknown Product'}
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                {renderStars(selectedReview.rating, 16)}
                <span style={{ 
                  fontSize: '14px', 
                  color: colors.textLight,
                  marginLeft: '4px'
                }}>
                  {selectedReview.rating}/5
                </span>
              </div>
            </div>

            <div style={{ marginBottom: '16px' }}>
              <h4 style={{ 
                margin: '0 0 8px 0', 
                fontSize: '14px', 
                fontWeight: '600',
                color: colors.textDark
              }}>
                Review Comment
              </h4>
              <div style={{
                backgroundColor: colors.lightGray,
                padding: '16px',
                borderRadius: '8px',
                color: colors.textDark,
                lineHeight: '1.6',
                fontSize: '14px',
                minHeight: '80px'
              }}>
                {selectedReview.comment || (
                  <span style={{ color: colors.textLight, fontStyle: 'italic' }}>
                    No comment provided
                  </span>
                )}
              </div>
            </div>

            <div style={{ 
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '12px',
              fontSize: '13px'
            }}>
              <div>
                <div style={{ color: colors.textLight, marginBottom: '4px' }}>Status</div>
                <div>{getStatusBadge(selectedReview)}</div>
              </div>
              <div>
                <div style={{ color: colors.textLight, marginBottom: '4px' }}>Reviewed On</div>
                <div style={{ color: colors.textDark, fontWeight: '500' }}>
                  {formatDate(selectedReview.created_at)}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.7)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 1000,
      padding: '20px',
      backdropFilter: 'blur(4px)'
    }}>
      <div style={{
        backgroundColor: colors.white,
        borderRadius: '16px',
        width: '100%',
        maxWidth: '1400px',
        maxHeight: '90vh',
        overflow: 'hidden',
        display: 'flex',
        boxShadow: '0 25px 50px rgba(0,0,0,0.25)',
        animation: 'modalSlideIn 0.3s ease-out'
      }}>
        {/* Analytics Sidebar */}
        {renderAnalyticsSidebar()}

        {/* Main Content */}
        <div style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden'
        }}>
          {/* Header */}
          <div style={{
            padding: '24px',
            borderBottom: `1px solid ${colors.mediumGray}`,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            backgroundColor: colors.white
          }}>
            <div>
              <h2 style={{ 
                margin: 0, 
                fontSize: '24px', 
                fontWeight: '700',
                color: colors.textDark,
                display: 'flex',
                alignItems: 'center',
                gap: '12px'
              }}>
                <FaChartBar color={colors.primary} /> Customer Reviews
              </h2>
              <p style={{ 
                margin: '6px 0 0 0', 
                color: colors.textLight, 
                fontSize: '14px',
                lineHeight: '1.4'
              }}>
                Manage and analyze customer feedback with detailed insights and filtering options
              </p>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <button 
                onClick={handleRefresh}
                disabled={refreshing}
                style={{
                  backgroundColor: colors.primary,
                  color: colors.white,
                  border: 'none',
                  cursor: refreshing ? 'not-allowed' : 'pointer',
                  padding: '10px 16px',
                  borderRadius: '8px',
                  transition: 'all 0.2s ease',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  fontSize: '14px',
                  fontWeight: '500',
                  opacity: refreshing ? 0.7 : 1
                }}
                onMouseEnter={(e) => {
                  if (!refreshing) {
                    e.target.style.backgroundColor = colors.secondary;
                    e.target.style.transform = 'translateY(-1px)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!refreshing) {
                    e.target.style.backgroundColor = colors.primary;
                    e.target.style.transform = 'translateY(0)';
                  }
                }}
              >
                <FaSync className={refreshing ? 'spinning' : ''} />
                {refreshing ? 'Refreshing...' : 'Refresh'}
              </button>
              <button 
                onClick={onClose}
                style={{
                  backgroundColor: colors.lightGray,
                  color: colors.textLight,
                  border: 'none',
                  cursor: 'pointer',
                  padding: '10px',
                  borderRadius: '8px',
                  transition: 'all 0.2s ease',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
                onMouseEnter={(e) => {
                  e.target.style.backgroundColor = colors.mediumGray;
                }}
                onMouseLeave={(e) => {
                  e.target.style.backgroundColor = colors.lightGray;
                }}
              >
                <FaTimes size={18} />
              </button>
            </div>
          </div>

          {/* Search and Filters */}
          <div style={{
            padding: '20px 24px',
            borderBottom: `1px solid ${colors.mediumGray}`,
            backgroundColor: colors.white
          }}>
            <div style={{
              display: 'flex',
              gap: '16px',
              alignItems: 'center',
              flexWrap: 'wrap'
            }}>
              {/* Search */}
              <div style={{ position: 'relative', flex: '1 1 300px', minWidth: '280px' }}>
                <FaSearch style={{
                  position: 'absolute',
                  left: '14px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: colors.textLight
                }} />
                <input
                  type="text"
                  placeholder="Search by user, product, or comment..."
                  value={searchTerm}
                  onChange={handleSearch}
                  style={{
                    width: '100%',
                    padding: '12px 12px 12px 42px',
                    border: `1px solid ${colors.mediumGray}`,
                    borderRadius: '10px',
                    fontSize: '14px',
                    outline: 'none',
                    transition: 'all 0.3s ease',
                    backgroundColor: colors.lightGray,
                    fontWeight: '500'
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = colors.primary;
                    e.target.style.boxShadow = `0 0 0 3px ${colors.primary}20`;
                    e.target.style.backgroundColor = colors.white;
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = colors.mediumGray;
                    e.target.style.boxShadow = 'none';
                    e.target.style.backgroundColor = colors.lightGray;
                  }}
                />
              </div>

              {/* Rating Filter */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <FaFilter color={colors.textLight} size={14} />
                <select
                  value={filters.rating}
                  onChange={(e) => handleFilterChange('rating', e.target.value)}
                  style={{
                    padding: '11px 12px',
                    border: `1px solid ${colors.mediumGray}`,
                    borderRadius: '8px',
                    fontSize: '14px',
                    outline: 'none',
                    backgroundColor: colors.lightGray,
                    cursor: 'pointer',
                    minWidth: '120px',
                    fontWeight: '500',
                    transition: 'all 0.2s ease'
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = colors.primary;
                    e.target.style.boxShadow = `0 0 0 3px ${colors.primary}20`;
                    e.target.style.backgroundColor = colors.white;
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = colors.mediumGray;
                    e.target.style.boxShadow = 'none';
                    e.target.style.backgroundColor = colors.lightGray;
                  }}
                >
                  <option value="">All Ratings</option>
                  <option value="5">⭐ 5 Stars</option>
                  <option value="4">⭐ 4 Stars</option>
                  <option value="3">⭐ 3 Stars</option>
                  <option value="2">⭐ 2 Stars</option>
                  <option value="1">⭐ 1 Star</option>
                </select>
              </div>

              {/* Status Filter */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <FaFilter color={colors.textLight} size={14} />
                <select
                  value={filters.status}
                  onChange={(e) => handleFilterChange('status', e.target.value)}
                  style={{
                    padding: '11px 12px',
                    border: `1px solid ${colors.mediumGray}`,
                    borderRadius: '8px',
                    fontSize: '14px',
                    outline: 'none',
                    backgroundColor: colors.lightGray,
                    cursor: 'pointer',
                    minWidth: '120px',
                    fontWeight: '500',
                    transition: 'all 0.2s ease'
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = colors.primary;
                    e.target.style.boxShadow = `0 0 0 3px ${colors.primary}20`;
                    e.target.style.backgroundColor = colors.white;
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = colors.mediumGray;
                    e.target.style.boxShadow = 'none';
                    e.target.style.backgroundColor = colors.lightGray;
                  }}
                >
                  <option value="">All Status</option>
                  <option value="approved">Approved</option>
                  <option value="pending">Pending</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>

              {/* Sort Order */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <FaSort color={colors.textLight} size={14} />
                <select
                  value={filters.sort_order}
                  onChange={(e) => handleFilterChange('sort_order', e.target.value)}
                  style={{
                    padding: '11px 12px',
                    border: `1px solid ${colors.mediumGray}`,
                    borderRadius: '8px',
                    fontSize: '14px',
                    outline: 'none',
                    backgroundColor: colors.lightGray,
                    cursor: 'pointer',
                    minWidth: '140px',
                    fontWeight: '500',
                    transition: 'all 0.2s ease'
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = colors.primary;
                    e.target.style.boxShadow = `0 0 0 3px ${colors.primary}20`;
                    e.target.style.backgroundColor = colors.white;
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = colors.mediumGray;
                    e.target.style.boxShadow = 'none';
                    e.target.style.backgroundColor = colors.lightGray;
                  }}
                >
                  <option value="desc">Newest First</option>
                  <option value="asc">Oldest First</option>
                </select>
              </div>
            </div>
          </div>

          {/* Reviews Grid */}
          <div 
            className="reviews-main-content"
            style={{
              flex: 1,
              overflow: 'auto',
              backgroundColor: colors.lightGray
            }}
          >
            {renderReviewCards()}
          </div>

          {/* Pagination */}
          {!loading && reviews.length > 0 && (
            <div style={{
              padding: '20px 24px',
              borderTop: `1px solid ${colors.mediumGray}`,
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              backgroundColor: colors.white,
              flexWrap: 'wrap',
              gap: '12px'
            }}>
              <div style={{ 
                color: colors.textLight, 
                fontSize: '14px',
                fontWeight: '500'
              }}>
                Showing {((pagination.current_page - 1) * pagination.per_page) + 1} -{' '}
                {Math.min(pagination.current_page * pagination.per_page, pagination.total_items)} of{' '}
                {pagination.total_items} reviews
              </div>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <button
                  onClick={() => handlePageChange(pagination.current_page - 1)}
                  disabled={pagination.current_page === 1}
                  style={{
                    padding: '8px 12px',
                    border: `1px solid ${colors.mediumGray}`,
                    backgroundColor: pagination.current_page === 1 ? colors.lightGray : colors.white,
                    color: pagination.current_page === 1 ? colors.textLight : colors.textDark,
                    borderRadius: '6px',
                    cursor: pagination.current_page === 1 ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    transition: 'all 0.2s ease',
                    fontWeight: '500'
                  }}
                  onMouseEnter={(e) => {
                    if (pagination.current_page !== 1) {
                      e.target.style.backgroundColor = colors.primary;
                      e.target.style.color = colors.white;
                      e.target.style.borderColor = colors.primary;
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (pagination.current_page !== 1) {
                      e.target.style.backgroundColor = colors.white;
                      e.target.style.color = colors.textDark;
                      e.target.style.borderColor = colors.mediumGray;
                    }
                  }}
                >
                  <FaChevronLeft size={12} />
                  Previous
                </button>

                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  {Array.from({ length: Math.min(5, pagination.total_pages) }, (_, index) => {
                    const pageNumber = index + 1;
                    return (
                      <button
                        key={pageNumber}
                        onClick={() => handlePageChange(pageNumber)}
                        style={{
                          padding: '8px 12px',
                          border: `1px solid ${colors.mediumGray}`,
                          backgroundColor: pagination.current_page === pageNumber ? colors.primary : colors.white,
                          color: pagination.current_page === pageNumber ? colors.white : colors.textDark,
                          borderRadius: '6px',
                          cursor: 'pointer',
                          transition: 'all 0.2s ease',
                          fontWeight: '500',
                          minWidth: '40px'
                        }}
                        onMouseEnter={(e) => {
                          if (pagination.current_page !== pageNumber) {
                            e.target.style.backgroundColor = colors.lightGray;
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (pagination.current_page !== pageNumber) {
                            e.target.style.backgroundColor = colors.white;
                          }
                        }}
                      >
                        {pageNumber}
                      </button>
                    );
                  })}
                </div>

                <button
                  onClick={() => handlePageChange(pagination.current_page + 1)}
                  disabled={pagination.current_page === pagination.total_pages}
                  style={{
                    padding: '8px 12px',
                    border: `1px solid ${colors.mediumGray}`,
                    backgroundColor: pagination.current_page === pagination.total_pages ? colors.lightGray : colors.white,
                    color: pagination.current_page === pagination.total_pages ? colors.textLight : colors.textDark,
                    borderRadius: '6px',
                    cursor: pagination.current_page === pagination.total_pages ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    transition: 'all 0.2s ease',
                    fontWeight: '500'
                  }}
                  onMouseEnter={(e) => {
                    if (pagination.current_page !== pagination.total_pages) {
                      e.target.style.backgroundColor = colors.primary;
                      e.target.style.color = colors.white;
                      e.target.style.borderColor = colors.primary;
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (pagination.current_page !== pagination.total_pages) {
                      e.target.style.backgroundColor = colors.white;
                      e.target.style.color = colors.textDark;
                      e.target.style.borderColor = colors.mediumGray;
                    }
                  }}
                >
                  Next
                  <FaChevronRight size={12} />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Review Detail Modal */}
      {renderReviewDetail()}

      {notification && (
        <Notification 
          message={notification.message} 
          type={notification.type} 
          onClose={handleCloseNotification}
        />
      )}

      <style>
        {`
          @keyframes modalSlideIn {
            from {
              opacity: 0;
              transform: translateY(-30px) scale(0.9);
            }
            to {
              opacity: 1;
              transform: translateY(0) scale(1);
            }
          }

          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }

          .spinning {
            animation: spin 1s linear infinite;
          }

          /* Custom scrollbar */
          .reviews-main-content::-webkit-scrollbar {
            width: 8px;
          }

          .reviews-main-content::-webkit-scrollbar-track {
            background: ${colors.lightGray};
          }

          .reviews-main-content::-webkit-scrollbar-thumb {
            background: ${colors.mediumGray};
            border-radius: 4px;
          }

          .reviews-main-content::-webkit-scrollbar-thumb:hover {
            background: ${colors.darkGray};
          }
        `}
      </style>
    </div>
  );
};

export default ProductReviewsManagementModal;