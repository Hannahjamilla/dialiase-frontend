// ProductReviewsModal.jsx
import React, { useState, useEffect } from 'react';
import { FiX, FiStar, FiSend, FiUser, FiCalendar, FiEye, FiEyeOff, FiThumbsUp, FiAward } from 'react-icons/fi';
import api from '../../api/axios';

const ProductReviewsModal = ({ isOpen, onClose, product, colors }) => {
  const [reviews, setReviews] = useState([]);
  const [averageRating, setAverageRating] = useState(0);
  const [totalReviews, setTotalReviews] = useState(0);
  const [ratingDistribution, setRatingDistribution] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [activeFilter, setActiveFilter] = useState('all');
  const [reviewForm, setReviewForm] = useState({
    rating: 0,
    comment: '',
    isAnonymous: false
  });

  const fetchReviews = async () => {
    if (!product) return;
    
    try {
      setLoading(true);
      const response = await api.get(`/reviews/product/${product.supplyID}`);
      
      if (response.data.success) {
        setReviews(response.data.reviews);
        setAverageRating(response.data.averageRating);
        setTotalReviews(response.data.totalReviews);
        setRatingDistribution(response.data.ratingDistribution || []);
      }
    } catch (error) {
      console.error('Error fetching reviews:', error);
    } finally {
      setLoading(false);
    }
  };

  const submitReview = async (e) => {
    e.preventDefault();
    if (!reviewForm.rating) {
      alert('Please select a rating');
      return;
    }

    try {
      setSubmitting(true);
      const payload = {
        supplyID: product.supplyID,
        rating: reviewForm.rating,
        comment: reviewForm.comment,
        isAnonymous: reviewForm.isAnonymous
      };

      const response = await api.post('/patient/reviews/submit', payload);

      if (response.data.success) {
        setReviewForm({ rating: 0, comment: '', isAnonymous: false });
        setShowReviewForm(false);
        fetchReviews();
        alert('Review submitted successfully!');
      } else {
        alert(response.data.message || 'Failed to submit review');
      }
    } catch (error) {
      console.error('Error submitting review:', error);
      alert(error.response?.data?.message || 'Failed to submit review. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const getFilteredReviews = () => {
    if (activeFilter === 'all') return reviews;
    return reviews.filter(review => review.rating === parseInt(activeFilter));
  };

  const getRatingPercentage = (rating) => {
    const ratingCount = ratingDistribution[rating - 1] || 0;
    return totalReviews > 0 ? (ratingCount / totalReviews) * 100 : 0;
  };

  useEffect(() => {
    if (isOpen && product) {
      fetchReviews();
    }
  }, [isOpen, product]);

  if (!isOpen || !product) return null;

  const filteredReviews = getFilteredReviews();

  // Color scheme using #395886
  const primaryColor = '#395886';
  const lightColor = '#EBF0F7';
  const darkColor = '#2A4161';
  const textColor = '#1F2937';
  const textLight = '#6B7280';
  const borderColor = '#E5E7EB';

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100vw',
      height: '100vh',
      backgroundColor: 'rgba(0, 0, 0, 0.8)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 2000,
      padding: '1rem'
    }} onClick={onClose}>
      
      <div style={{
        width: '95vw',
        maxWidth: '1200px',
        maxHeight: '95vh',
        backgroundColor: 'white',
        borderRadius: '16px',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        boxShadow: '0 20px 40px rgba(0, 0, 0, 0.3)'
      }} onClick={(e) => e.stopPropagation()}>

        {/* Header */}
        <div style={{
          padding: '1.5rem 2rem',
          borderBottom: `1px solid ${borderColor}`,
          backgroundColor: 'white',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          gap: '1rem'
        }}>
          <div style={{ flex: 1 }}>
            <h2 style={{ margin: '0 0 0.5rem 0', fontSize: '1.5rem', fontWeight: 700, color: textColor }}>
              Customer Reviews
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
              <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 600, color: textColor }}>
                {product.name}
              </h3>
              {product.description && (
                <p style={{ margin: 0, color: textLight, fontSize: '0.9rem' }}>
                  {product.description}
                </p>
              )}
              <div style={{ marginTop: '0.5rem' }}>
                <div style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  backgroundColor: 'white',
                  padding: '0.75rem 1rem',
                  borderRadius: '8px',
                  border: `1px solid ${borderColor}`
                }}>
                  <div style={{ fontSize: '1.25rem', fontWeight: 800, color: primaryColor }}>
                    {averageRating.toFixed(1)}
                  </div>
                  <div style={{ display: 'flex', gap: '0.1rem' }}>
                    {[1,2,3,4,5].map(star => (
                      <FiStar
                        key={star}
                        size={16}
                        color={star <= averageRating ? primaryColor : borderColor}
                        fill={star <= averageRating ? primaryColor : 'transparent'}
                      />
                    ))}
                  </div>
                  <div style={{ color: textLight, fontSize: '0.9rem' }}>
                    {totalReviews} reviews
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <button
            onClick={onClose}
            style={{
              width: '40px',
              height: '40px',
              border: `1px solid ${borderColor}`,
              backgroundColor: 'white',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              color: textLight,
              fontSize: '1.1rem'
            }}
          >
            <FiX />
          </button>
        </div>

        {/* Content */}
        <div style={{ flex: 1, overflowY: 'auto', backgroundColor: lightColor }}>

          {/* Summary Section */}
          <div style={{
            padding: '2rem',
            backgroundColor: 'white',
            borderBottom: `1px solid ${borderColor}`,
            display: 'grid',
            gridTemplateColumns: '1fr auto',
            gap: '2rem',
            alignItems: 'start'
          }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr', gap: '2rem', alignItems: 'start' }}>
              {/* Overall Rating */}
              <div style={{
                backgroundColor: lightColor,
                padding: '1.5rem',
                borderRadius: '12px',
                border: `1px solid ${borderColor}`,
                minWidth: '180px'
              }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: '0.75rem' }}>
                  <div style={{ fontSize: '3rem', fontWeight: 800, color: primaryColor, lineHeight: 1 }}>
                    {averageRating.toFixed(1)}
                  </div>
                  <div style={{ display: 'flex', gap: '0.1rem', justifyContent: 'center' }}>
                    {[1,2,3,4,5].map(star => (
                      <FiStar
                        key={star}
                        size={20}
                        color={star <= averageRating ? primaryColor : borderColor}
                        fill={star <= averageRating ? primaryColor : 'transparent'}
                      />
                    ))}
                  </div>
                  <div style={{ color: textLight, fontSize: '0.9rem' }}>
                    {totalReviews} reviews
                  </div>
                </div>
              </div>

              {/* Rating Distribution */}
              <div style={{
                backgroundColor: 'white',
                padding: '1.5rem',
                borderRadius: '12px',
                border: `1px solid ${borderColor}`
              }}>
                <h4 style={{ margin: '0 0 1rem 0', fontSize: '1.1rem', fontWeight: 600, color: textColor }}>
                  Rating Distribution
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {[5,4,3,2,1].map(rating => (
                    <div key={rating} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', width: '50px' }}>
                        <span style={{ fontWeight: 600, color: textColor, fontSize: '0.9rem' }}>{rating}</span>
                        <FiStar size={14} color={primaryColor} fill={primaryColor} />
                      </div>
                      <div style={{ flex: 1, height: '8px', backgroundColor: borderColor, borderRadius: '4px', overflow: 'hidden' }}>
                        <div 
                          style={{
                            height: '100%',
                            backgroundColor: primaryColor,
                            borderRadius: '4px',
                            width: `${getRatingPercentage(rating)}%`
                          }}
                        ></div>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', width: '70px', fontSize: '0.8rem' }}>
                        <span style={{ fontWeight: 600, color: textColor }}>{Math.round(getRatingPercentage(rating))}%</span>
                        <span style={{ color: textLight }}>({ratingDistribution[rating - 1] || 0})</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', alignItems: 'flex-end' }}>
              <button
                onClick={() => setShowReviewForm(true)}
                style={{
                  padding: '1rem 1.5rem',
                  backgroundColor: primaryColor,
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  whiteSpace: 'nowrap'
                }}
              >
                <FiSend size={16} />
                Write a Review
              </button>
              {totalReviews > 0 && (
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.75rem 1rem',
                  backgroundColor: lightColor,
                  color: darkColor,
                  borderRadius: '6px',
                  fontSize: '0.9rem',
                  fontWeight: 500
                }}>
                  <FiAward size={16} />
                  <span>{Math.round((ratingDistribution[4] || 0) / totalReviews * 100)}% positive reviews</span>
                </div>
              )}
            </div>
          </div>

          {/* Review Form */}
          {showReviewForm && (
            <div style={{ padding: '2rem', backgroundColor: 'white', borderBottom: `1px solid ${borderColor}` }}>
              <div style={{ marginBottom: '2rem', textAlign: 'center' }}>
                <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1.5rem', fontWeight: 700, color: textColor }}>
                  Share Your Experience
                </h3>
                <p style={{ margin: 0, color: textLight, fontSize: '1rem' }}>
                  Help other customers by sharing your thoughts about this product
                </p>
              </div>
              <form onSubmit={submitReview}>
                <div style={{ marginBottom: '1.5rem' }}>
                  <label style={{ display: 'block', marginBottom: '0.75rem', fontWeight: 600, color: textColor }}>
                    How would you rate this product? *
                  </label>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
                      {[1,2,3,4,5].map(star => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setReviewForm(prev => ({ ...prev, rating: star }))}
                          style={{
                            width: '50px',
                            height: '50px',
                            border: `2px solid ${reviewForm.rating >= star ? primaryColor : borderColor}`,
                            backgroundColor: reviewForm.rating >= star ? primaryColor : 'white',
                            borderRadius: '8px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer',
                            color: reviewForm.rating >= star ? 'white' : textLight,
                            fontSize: '1.2rem'
                          }}
                        >
                          <FiStar />
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div style={{ marginBottom: '1.5rem' }}>
                  <label style={{ display: 'block', marginBottom: '0.75rem', fontWeight: 600, color: textColor }}>
                    Your Review
                  </label>
                  <div style={{ position: 'relative' }}>
                    <textarea
                      value={reviewForm.comment}
                      onChange={(e) => setReviewForm(prev => ({ ...prev, comment: e.target.value }))}
                      placeholder="Share details about your experience with this product..."
                      rows="4"
                      style={{
                        width: '100%',
                        padding: '1rem',
                        border: `2px solid ${borderColor}`,
                        borderRadius: '8px',
                        fontSize: '1rem',
                        resize: 'vertical',
                        outline: 'none',
                        fontFamily: 'inherit',
                        lineHeight: 1.5
                      }}
                    />
                    <div style={{
                      position: 'absolute',
                      bottom: '0.75rem',
                      right: '0.75rem',
                      fontSize: '0.8rem',
                      color: textLight,
                      backgroundColor: 'white',
                      padding: '0.25rem 0.5rem',
                      borderRadius: '4px'
                    }}>
                      {reviewForm.comment.length}/1000
                    </div>
                  </div>
                </div>

                <div style={{ marginBottom: '2rem' }}>
                  <label style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '1rem',
                    cursor: 'pointer',
                    padding: '1rem',
                    border: `2px solid ${borderColor}`,
                    borderRadius: '8px',
                    backgroundColor: lightColor
                  }}>
                    <input
                      type="checkbox"
                      checked={reviewForm.isAnonymous}
                      onChange={(e) => setReviewForm(prev => ({ ...prev, isAnonymous: e.target.checked }))}
                      style={{ display: 'none' }}
                    />
                    <div style={{
                      width: '20px',
                      height: '20px',
                      border: `2px solid ${reviewForm.isAnonymous ? primaryColor : borderColor}`,
                      borderRadius: '4px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      backgroundColor: reviewForm.isAnonymous ? primaryColor : 'white',
                      color: 'white',
                      fontSize: '12px',
                      marginTop: '0.25rem'
                    }}>
                      {reviewForm.isAnonymous && '✓'}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', flex: 1 }}>
                      {reviewForm.isAnonymous ? <FiEyeOff size={18} color={primaryColor} /> : <FiEye size={18} color={textLight} />}
                      <div>
                        <div style={{ fontWeight: 600, color: textColor, marginBottom: '0.25rem' }}>
                          Post as Anonymous
                        </div>
                        <div style={{ color: textLight, fontSize: '0.9rem' }}>
                          {reviewForm.isAnonymous 
                            ? 'Your name will not be shown with your review' 
                            : 'Your name will be visible to other users'
                          }
                        </div>
                      </div>
                    </div>
                  </label>
                </div>

                <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                  <button
                    type="button"
                    onClick={() => setShowReviewForm(false)}
                    style={{
                      padding: '0.875rem 1.5rem',
                      border: `1px solid ${borderColor}`,
                      backgroundColor: 'white',
                      color: textLight,
                      borderRadius: '8px',
                      cursor: 'pointer',
                      fontWeight: 600
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={!reviewForm.rating || submitting}
                    style={{
                      padding: '0.875rem 1.5rem',
                      backgroundColor: !reviewForm.rating || submitting ? borderColor : primaryColor,
                      color: 'white',
                      border: 'none',
                      borderRadius: '8px',
                      cursor: !reviewForm.rating || submitting ? 'not-allowed' : 'pointer',
                      fontWeight: 600,
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem'
                    }}
                  >
                    <FiSend size={16} />
                    {submitting ? 'Submitting...' : 'Submit Review'}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Reviews Filter */}
          {reviews.length > 0 && (
            <div style={{ padding: '1.5rem 2rem', backgroundColor: 'white', borderBottom: `1px solid ${borderColor}` }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '1rem' }}>
                <h4 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 600, color: textColor }}>Customer Reviews</h4>
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                  {[
                    { key: 'all', label: 'All Reviews', count: totalReviews },
                    { key: '5', label: '5 Stars', count: ratingDistribution[4] || 0 },
                    { key: '4', label: '4 Stars', count: ratingDistribution[3] || 0 },
                    { key: '3', label: '3 Stars', count: ratingDistribution[2] || 0 },
                    { key: '2', label: '2 Stars', count: ratingDistribution[1] || 0 },
                    { key: '1', label: '1 Star', count: ratingDistribution[0] || 0 }
                  ].map(filter => (
                    <button
                      key={filter.key}
                      onClick={() => setActiveFilter(filter.key)}
                      style={{
                        padding: '0.5rem 1rem',
                        border: `1px solid ${activeFilter === filter.key ? primaryColor : borderColor}`,
                        backgroundColor: activeFilter === filter.key ? primaryColor : 'white',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        fontSize: '0.8rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        color: activeFilter === filter.key ? 'white' : textColor
                      }}
                    >
                      <span>{filter.label}</span>
                      <span>({filter.count})</span>
                    </button>
                  ))}
                </div>
              </div>
              <div style={{ color: textLight, fontSize: '0.9rem' }}>
                Showing {filteredReviews.length} of {totalReviews} reviews
              </div>
            </div>
          )}

          {/* Reviews List */}
          <div style={{ padding: '2rem' }}>
            {loading ? (
              <div style={{ textAlign: 'center', padding: '3rem', color: textLight }}>
                <div style={{
                  width: '40px',
                  height: '40px',
                  border: `3px solid ${borderColor}`,
                  borderTop: `3px solid ${primaryColor}`,
                  borderRadius: '50%',
                  animation: 'spin 1s linear infinite',
                  margin: '0 auto 1rem'
                }}></div>
                <p>Loading reviews...</p>
              </div>
            ) : filteredReviews.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '3rem', color: textLight }}>
                <FiAward size={48} style={{ marginBottom: '1rem', opacity: 0.5 }} />
                <h3 style={{ margin: '0 0 0.5rem 0', color: textColor }}>No reviews yet</h3>
                <p style={{ margin: '0 0 1.5rem 0' }}>Be the first to share your experience with this product</p>
                <button 
                  onClick={() => setShowReviewForm(true)}
                  style={{
                    padding: '0.75rem 1.5rem',
                    backgroundColor: primaryColor,
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontWeight: 600
                  }}
                >
                  Write First Review
                </button>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                {filteredReviews.map((review) => (
                  <div key={review.reviewID} style={{
                    padding: '1.5rem',
                    backgroundColor: 'white',
                    border: `1px solid ${borderColor}`,
                    borderRadius: '12px'
                  }}>
                    <div style={{ marginBottom: '1rem' }}>
                      <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                        <div style={{ flexShrink: 0 }}>
                          {review.isAnonymous ? (
                            <div style={{
                              width: '40px',
                              height: '40px',
                              borderRadius: '50%',
                              backgroundColor: lightColor,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              color: primaryColor
                            }}>
                              <FiUser size={18} />
                            </div>
                          ) : (
                            <div style={{
                              width: '40px',
                              height: '40px',
                              borderRadius: '50%',
                              backgroundColor: primaryColor,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              color: 'white',
                              fontWeight: 600,
                              fontSize: '1rem'
                            }}>
                              {review.userName?.charAt(0).toUpperCase() || 'U'}
                            </div>
                          )}
                        </div>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontWeight: 600, color: textColor, display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                            {review.isAnonymous ? 'Anonymous User' : review.userName}
                            {review.isAnonymous && (
                              <span style={{
                                backgroundColor: lightColor,
                                color: darkColor,
                                padding: '0.25rem 0.5rem',
                                borderRadius: '12px',
                                fontSize: '0.7rem',
                                fontWeight: 500,
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.25rem'
                              }}>
                                <FiEyeOff size={10} />
                                Anonymous
                              </span>
                            )}
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', fontSize: '0.8rem', color: textLight, flexWrap: 'wrap' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                              {[1,2,3,4,5].map(star => (
                                <FiStar
                                  key={star}
                                  size={12}
                                  color={star <= review.rating ? primaryColor : borderColor}
                                  fill={star <= review.rating ? primaryColor : 'transparent'}
                                />
                              ))}
                            </div>
                            <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                              <FiCalendar size={10} />
                              {review.time_ago}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {review.comment && (
                      <div style={{ marginBottom: '1rem' }}>
                        <p style={{ margin: 0, color: textColor, lineHeight: 1.6, fontSize: '0.9rem' }}>
                          {review.comment}
                        </p>
                      </div>
                    )}

                    <div>
                      <button style={{
                        padding: '0.5rem 1rem',
                        border: `1px solid ${borderColor}`,
                        backgroundColor: 'white',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        fontSize: '0.8rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        color: textLight
                      }}>
                        <FiThumbsUp size={12} />
                        Helpful ({Math.floor(Math.random() * 50)})
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default ProductReviewsModal;