import React, { useState, useEffect } from 'react';
import { 
  FiShoppingCart, 
  FiSearch, 
  FiFilter, 
  FiArrowLeft, 
  FiX,
  FiStar,
  FiHeart,
  FiDollarSign,
  FiEye,
  FiPlus,
  FiMinus,
  FiPackage,
  FiGrid,
  FiShield,
  FiHelpCircle,
  FiGift
} from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import { DotLottieReact } from '@lottiefiles/dotlottie-react';
import api from '../../api/axios';
import AddToCart from './AddToCart';
import CartModal from './CartModal';
import ImageModal from './ImageModal';
import SpinAnimation from './SpinAnimation';
import WishlistModal from './WishlistModal';
import ProductReviewsModal from './ProductReviewsModal';
import CheckoutModal from './CheckoutModal';
import FAQsModal from './FAQsModal';
import PromotionalModal from './PromotionalModal';
import PromosModal from './promosModal';

const professionalColors = {
  primary: '#395886',
  white: '#FFFFFF',
  green: '#477977',
  secondary: '#6B7280',
  lightBg: '#F8FAFC',
  textMuted: '#6B7280',
  border: '#E5E7EB',
  cardBg: '#FFFFFF',
  success: '#477977',
  warning: '#F59E0B',
  alert: '#EF4444',
  background: '#FFFFFF',
  subtle: '#F3F4F6',
  darkBlue: '#2D4A70',
  lightBlue: '#E8EDF5'
};

const PriceRangeFilter = ({ priceRange, onPriceRangeChange, colors }) => {
  return (
    <div style={{
      padding: '1.5rem',
      backgroundColor: colors.white,
      borderRadius: '12px',
      border: `1px solid ${colors.border}`,
      boxShadow: '0 8px 30px rgba(0,0,0,0.12)',
      minWidth: '280px'
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0.75rem',
        marginBottom: '1.5rem',
        color: colors.primary,
        fontWeight: '600'
      }}>
        <FiDollarSign size={18} color={colors.primary} />
        Price Range
      </div>
      
      <div style={{ marginBottom: '1.5rem' }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '1rem',
        }}>
          <span style={{ fontSize: '0.85rem', color: colors.textMuted, fontWeight: '500' }}>
            ₱{priceRange.min.toLocaleString()}
          </span>
          <span style={{ fontSize: '0.85rem', color: colors.textMuted, fontWeight: '500' }}>
            ₱{priceRange.max.toLocaleString()}
          </span>
        </div>
        
        <div style={{
          position: 'relative',
          height: '6px',
          backgroundColor: colors.border,
          borderRadius: '3px',
          marginBottom: '1.5rem'
        }}>
          <div style={{
            position: 'absolute',
            left: `${((priceRange.min - 0) / (10000 - 0)) * 100}%`,
            right: `${100 - ((priceRange.max - 0) / (10000 - 0)) * 100}%`,
            height: '100%',
            background: colors.primary,
            borderRadius: '3px'
          }} />
        </div>
        
        <div style={{ position: 'relative', height: '20px' }}>
          <input
            type="range"
            min="0"
            max="10000"
            step="100"
            value={priceRange.min}
            onChange={(e) => onPriceRangeChange('min', parseInt(e.target.value))}
            style={{
              position: 'absolute',
              width: '100%',
              height: '20px',
              background: 'transparent',
              appearance: 'none',
              cursor: 'pointer'
            }}
          />
          <input
            type="range"
            min="0"
            max="10000"
            step="100"
            value={priceRange.max}
            onChange={(e) => onPriceRangeChange('max', parseInt(e.target.value))}
            style={{
              position: 'absolute',
              width: '100%',
              height: '20px',
              background: 'transparent',
              appearance: 'none',
              cursor: 'pointer'
            }}
          />
        </div>
      </div>
      
      <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{
          flex: 1,
          padding: '0.75rem',
          background: colors.primary,
          borderRadius: '6px',
          textAlign: 'center',
          fontSize: '0.9rem',
          fontWeight: '600',
          color: colors.white,
          border: 'none'
        }}>
          ₱{priceRange.min.toLocaleString()}
        </div>
        <div style={{ padding: '0.5rem', color: colors.textMuted, fontSize: '0.8rem', fontWeight: '500' }}>
          to
        </div>
        <div style={{
          flex: 1,
          padding: '0.75rem',
          background: colors.primary,
          borderRadius: '6px',
          textAlign: 'center',
          fontSize: '0.9rem',
          fontWeight: '600',
          color: colors.white,
          border: 'none'
        }}>
          ₱{priceRange.max.toLocaleString()}
        </div>
      </div>
    </div>
  );
};

const ProductCardSkeleton = ({ colors }) => {
  return (
    <div style={{
      backgroundColor: colors.white,
      borderRadius: '12px',
      padding: '1.5rem',
      border: `1px solid ${colors.border}`,
      animation: 'pulse 2s infinite',
      height: '380px',
      display: 'flex',
      flexDirection: 'column'
    }}>
      <div style={{
        width: '100%',
        height: '200px',
        backgroundColor: colors.border,
        borderRadius: '8px',
        marginBottom: '1rem'
      }} />
      <div style={{
        height: '20px',
        backgroundColor: colors.border,
        borderRadius: '4px',
        marginBottom: '0.75rem',
        width: '80%'
      }} />
      <div style={{
        height: '16px',
        backgroundColor: colors.border,
        borderRadius: '4px',
        marginBottom: '1rem',
        width: '60%'
      }} />
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        marginTop: 'auto'
      }}>
        <div style={{ 
          height: '24px', 
          backgroundColor: colors.border, 
          borderRadius: '4px', 
          width: '40%' 
        }} />
        <div style={{ 
          height: '40px', 
          backgroundColor: colors.border, 
          borderRadius: '8px', 
          width: '40%' 
        }} />
      </div>
    </div>
  );
};

const LoadingAnimation = () => {
  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      height: '100vh',
      width: '100vw',
      backgroundColor: '#FFFFFF',
      flexDirection: 'column',
      gap: '2rem',
      marginTop: '-990px'
    }}>
      <DotLottieReact
        src="https://lottie.host/a7300954-0f07-4e99-b8ce-d4fc19f75b7a/NSDwQrhsYl.lottie"
        loop
        autoplay
        style={{
          width: '200px',
          height: '200px'
        }}
      />
      <div style={{ 
        textAlign: 'center', 
        color: '#395886',
        fontFamily: 'Arial, sans-serif'
      }}>
        <div style={{ 
          fontSize: '1.5rem', 
          fontWeight: '600', 
          marginBottom: '0.5rem' 
        }}>
          Loading Medical Supplies
        </div>
        <div style={{ 
          color: '#6B7280', 
          fontSize: '1rem',
          fontWeight: '500'
        }}>
          Preparing your essential healthcare products...
        </div>
      </div>
    </div>
  );
};

const MedsProd = ({ colors = professionalColors, navigate: propNavigate }) => {
  const navigate = propNavigate || useNavigate();
  
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [cart, setCart] = useState([]);
  const [selectedImage, setSelectedImage] = useState(null);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [cartAnimation, setCartAnimation] = useState({ show: false, product: null });
  const [priceRange, setPriceRange] = useState({ min: 0, max: 10000 });
  const [showPriceFilter, setShowPriceFilter] = useState(false);
  const [isWishlistOpen, setIsWishlistOpen] = useState(false);
  const [isReviewsOpen, setIsReviewsOpen] = useState(false);
  const [selectedProductForReview, setSelectedProductForReview] = useState(null);
  const [wishlistItems, setWishlistItems] = useState(new Set());
  const [sortBy, setSortBy] = useState('name');
  const [searchFocused, setSearchFocused] = useState(false);
  const [isFAQsOpen, setIsFAQsOpen] = useState(false);
  const [showPromotionalModal, setShowPromotionalModal] = useState(false);
  const [showPromosModal, setShowPromosModal] = useState(false);

  const sortOptions = [
    { value: 'name', label: 'Name A-Z' },
    { value: 'price', label: 'Price: Low to High' },
    { value: 'price-desc', label: 'Price: High to Low' },
    { value: 'stock', label: 'Stock Level' },
    { value: 'newest', label: 'Newest First' },
    { value: 'rating', label: 'Highest Rated' }
  ];

  // Fixed image URL handling
  const getProductImage = (product) => {
    // Priority 1: Use imageUrl from backend (already corrected in controller)
    if (product.imageUrl) return product.imageUrl;
    
    // Priority 2: Use image filename and construct URL
    if (product.image) {
      return `${process.env.REACT_APP_API_URL || 'http://localhost:8000'}/assets/images/Medical supplies/${product.image}`;
    }
    
    // Priority 3: Fallback placeholder
    return '/assets/images/medical-placeholder.png';
  };

  // Handle image loading errors
  const handleImageError = (e, product) => {
    console.warn(`Failed to load image for product ${product.name}:`, e.target.src);
    
    // Try alternative image paths
    if (product.image) {
      // Try direct path
      e.target.src = `/assets/images/Medical supplies/${product.image}`;
    } else {
      // Fallback to placeholder
      e.target.src = '/assets/images/medical-placeholder.png';
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      await new Promise(resolve => setTimeout(resolve, 1000));
      await fetchMedicalSupplies();
    };
    fetchData();
  }, []);

  useEffect(() => {
    fetchUserCart();
    fetchUserWishlist();
  }, []);

  // Show promotional modal every time component mounts (on open/refresh)
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowPromotionalModal(true);
    }, 500);
    
    return () => clearTimeout(timer);
  }, []);

  const fetchMedicalSupplies = async () => {
    try {
      setError('');
      const response = await api.get('/patient/supplies', { 
        params: searchTerm ? { search: searchTerm } : {} 
      });
      
      if (response.data.success) {
        const productsWithImages = response.data.supplies?.map(product => ({
          ...product,
          // imageUrl will now be properly set from the backend
          imageUrl: getProductImage(product),
          stock: parseInt(product.stock) || 0,
          price: parseFloat(product.price) || 0,
          minStock: parseInt(product.minStock) || 5,
          rating: Math.random() * 2 + 3,
          isFeatured: Math.random() > 0.7,
          reviewCount: Math.floor(Math.random() * 50) + 5,
          isNew: Math.random() > 0.8
        })) || [];
        
        setProducts(productsWithImages);
        
        // Debug: Check image URLs
        console.log('Products with images:', productsWithImages.map(p => ({
          name: p.name,
          image: p.image,
          imageUrl: p.imageUrl
        })));
      } else {
        throw new Error(response.data.message || 'Failed to fetch supplies');
      }
    } catch (err) {
      console.error('Error fetching medical supplies:', err);
      setError('Failed to fetch medical supplies. Please try again.');
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserCart = async () => {
    try {
      const response = await api.get('/patient/cart');
      if (response.data.success) {
        setCart(response.data.cart || []);
      }
    } catch (error) {
      console.error('Error fetching user cart:', error);
      setCart([]);
    }
  };

  const fetchUserWishlist = async () => {
    try {
      const response = await api.get('/patient/wishlist');
      if (response.data.success) {
        const wishlistIds = new Set(response.data.wishlist?.map(item => item.supplyID) || []);
        setWishlistItems(wishlistIds);
      }
    } catch (error) {
      console.error('Error fetching wishlist:', error);
    }
  };

  const addToCart = async (product, event) => {
    if (product.stock <= 0) return;
    
    const button = event.currentTarget;
    button.style.transform = 'scale(0.95)';
    
    setTimeout(() => {
      button.style.transform = 'scale(1)';
    }, 150);

    const buttonRect = event.currentTarget.getBoundingClientRect();
    setCartAnimation({
      show: true,
      product,
      startPos: { x: buttonRect.left + buttonRect.width / 2, y: buttonRect.top + buttonRect.height / 2 }
    });

    try {
      const response = await api.post('/patient/cart/add', {
        supplyID: product.supplyID,
        quantity: 1
      });

      if (response.data.success) {
        setCart(prevCart => {
          const existingItem = prevCart.find(item => item.supplyID === product.supplyID);
          if (existingItem) {
            if (existingItem.quantity >= product.stock) return prevCart;
            return prevCart.map(item =>
              item.supplyID === product.supplyID
                ? { ...item, quantity: item.quantity + 1 }
                : item
            );
          }
          return [...prevCart, { 
            ...product, 
            quantity: 1, 
            cartID: response.data.cartItem?.cartID || Date.now() 
          }];
        });
      } else {
        setError(response.data.message || 'Failed to add item to cart');
      }
    } catch (error) {
      console.error('Error adding to cart:', error);
      setError('Failed to add item to cart. Please try again.');
    } finally {
      setTimeout(() => setCartAnimation({ show: false, product: null }), 1200);
    }
  };

  const removeFromCart = async (cartID) => {
    try {
      const response = await api.delete(`/patient/cart/remove/${cartID}`);
      if (response.data.success) {
        setCart(prevCart => prevCart.filter(item => item.cartID !== cartID));
      } else {
        setError(response.data.message || 'Failed to remove item from cart');
      }
    } catch (error) {
      console.error('Error removing from cart:', error);
      setError('Failed to remove item from cart. Please try again.');
    }
  };

  const updateQuantity = async (cartID, newQuantity) => {
    if (newQuantity < 1) {
      removeFromCart(cartID);
      return;
    }
    
    const cartItem = cart.find(item => item.cartID === cartID);
    if (!cartItem) return;

    if (newQuantity > cartItem.stock) {
      newQuantity = cartItem.stock;
    }
    
    try {
      const response = await api.put(`/patient/cart/update/${cartID}`, {
        quantity: newQuantity
      });

      if (response.data.success) {
        setCart(prevCart =>
          prevCart.map(item =>
            item.cartID === cartID
              ? { ...item, quantity: newQuantity }
              : item
          )
        );
      } else {
        setError(response.data.message || 'Failed to update quantity');
      }
    } catch (error) {
      console.error('Error updating quantity:', error);
      setError('Failed to update quantity. Please try again.');
    }
  };

  const clearCart = async () => {
    try {
      const response = await api.delete('/patient/cart/clear');
      if (response.data.success) {
        setCart([]);
      } else {
        setError(response.data.message || 'Failed to clear cart');
      }
    } catch (error) {
      console.error('Error clearing cart:', error);
      setError('Failed to clear cart. Please try again.');
    }
  };

  const addToWishlist = async (productId) => {
    try {
      const response = await api.post('/patient/wishlist/add', {
        supplyID: productId
      });

      if (response.data.success) {
        setWishlistItems(prev => new Set([...prev, productId]));
      } else {
        setError(response.data.message || 'Failed to add to wishlist');
      }
    } catch (error) {
      console.error('Error adding to wishlist:', error);
      setError('Failed to add to wishlist. Please try again.');
    }
  };

  const removeFromWishlist = async (productId) => {
    try {
      const response = await api.delete(`/patient/wishlist/remove/${productId}`);
      if (response.data.success) {
        setWishlistItems(prev => {
          const newSet = new Set(prev);
          newSet.delete(productId);
          return newSet;
        });
      } else {
        setError(response.data.message || 'Failed to remove from wishlist');
      }
    } catch (error) {
      console.error('Error removing from wishlist:', error);
      setError('Failed to remove from wishlist. Please try again.');
    }
  };

  const toggleWishlist = async (productId) => {
    if (wishlistItems.has(productId)) {
      await removeFromWishlist(productId);
    } else {
      await addToWishlist(productId);
    }
  };

  const showProductReviews = (product) => {
    setSelectedProductForReview(product);
    setIsReviewsOpen(true);
  };

  const handleCheckout = () => {
    if (cart.length === 0) {
      setError('Your cart is empty. Add some items before checkout.');
      return;
    }
    setIsCartOpen(false);
    setIsCheckoutOpen(true);
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchTerm !== '') {
        fetchMedicalSupplies();
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const filteredProducts = products
    .filter(product => {
      const matchesSearch = !searchTerm || 
        product.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.description?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesPrice = product.price >= priceRange.min && product.price <= priceRange.max;
      return matchesSearch && matchesPrice;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'price': return a.price - b.price;
        case 'price-desc': return b.price - a.price;
        case 'stock': return b.stock - a.stock;
        case 'rating': return b.rating - a.rating;
        case 'newest': return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
        default: return a.name?.localeCompare(b.name);
      }
    });

  const handleImageClick = (product) => {
    setSelectedImage({
      ...product,
      url: getProductImage(product),
      id: product.supplyID
    });
  };

  const closeImageModal = () => setSelectedImage(null);

  const getTotalCartItems = () => cart.reduce((total, item) => total + item.quantity, 0);
  const getTotalPrice = () => cart.reduce((total, item) => total + (item.price * item.quantity), 0);

  const handlePriceRangeChange = (type, value) => {
    setPriceRange(prev => {
      const newRange = { ...prev, [type]: value };
      if (type === 'min' && value > prev.max) newRange.max = value;
      if (type === 'max' && value < prev.min) newRange.min = value;
      return newRange;
    });
  };

  // Update the ProductCard component usage to include error handling
  const renderProductCard = (product, index) => (
    <AddToCart.ProductCard 
      key={product.supplyID}
      product={product}
      onAddToCart={addToCart}
      onImageClick={handleImageClick}
      onToggleFavorite={toggleWishlist}
      onShowReviews={showProductReviews}
      isFavorite={wishlistItems.has(product.supplyID)}
      isInWishlist={wishlistItems.has(product.supplyID)}
      getProductImage={getProductImage}
      onImageError={handleImageError} // Pass error handler
      colors={colors}
      viewMode="grid"
    />
  );

  if (loading) {
    return <LoadingAnimation />;
  }

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: colors.background,
      padding: '0',
      margin: '0',
      width: '100vw',
      overflowX: 'hidden',
      marginTop: '240px'
    }}>
      {/* Promotional Modal - Shows every time */}
      <PromotionalModal 
        isOpen={showPromotionalModal}
        onClose={() => setShowPromotionalModal(false)}
        colors={colors}
      />

      {/* Promos Modal */}
      <PromosModal 
        isOpen={showPromosModal}
        onClose={() => setShowPromosModal(false)}
        colors={colors}
      />

      {/* Header */}
      <header style={{
        backgroundColor: colors.white,
        padding: '1.5rem 2rem',
        borderBottom: `1px solid ${colors.border}`,
        boxShadow: '0 2px 10px rgba(0,0,0,0.08)',
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 1000,
        width: '100%',
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          maxWidth: '100%',
          margin: '0 auto'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
            <button 
              onClick={() => navigate('/patient/PatientDashboard')}
              style={{
                background: colors.primary,
                border: 'none',
                color: colors.white,
                padding: '0.75rem 1.5rem',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '0.9rem',
                fontWeight: '600',
                transition: 'all 0.3s ease',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
              }}
              onMouseEnter={(e) => {
                e.target.style.transform = 'translateY(-2px)';
                e.target.style.boxShadow = '0 4px 12px rgba(57, 88, 134, 0.3)';
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = 'none';
              }}
            >
              <FiArrowLeft /> Back
            </button>
            
            <div>
              <h1 style={{ margin: 0, fontSize: '2rem', fontWeight: '600', color: colors.primary }}>
                Medical Supplies
              </h1>
              <p style={{ margin: '0.5rem 0 0 0', color: colors.textMuted, fontSize: '0.95rem', fontWeight: '500' }}>
                CAPD healthcare products • {products.length} items available
              </p>
            </div>
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            {/* Promos Button */}
            <button
              onClick={() => setShowPromosModal(true)}
              style={{
                background: `linear-gradient(135deg, ${colors.green}, #3a936f)`,
                border: 'none',
                color: colors.white,
                padding: '0.75rem 1.5rem',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '0.9rem',
                fontWeight: '600',
                transition: 'all 0.3s ease',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                boxShadow: '0 4px 12px rgba(71, 121, 119, 0.3)',
              }}
              onMouseEnter={(e) => {
                e.target.style.transform = 'translateY(-2px)';
                e.target.style.boxShadow = '0 6px 20px rgba(71, 121, 119, 0.4)';
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = '0 4px 12px rgba(71, 121, 119, 0.3)';
              }}
            >
              <FiGift />
              Special Offers
            </button>

            {/* FAQ Button */}
            <button
              onClick={() => setIsFAQsOpen(true)}
              style={{
                background: colors.white,
                border: `1px solid ${colors.primary}`,
                color: colors.primary,
                padding: '0.75rem 1.5rem',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '0.9rem',
                fontWeight: '600',
                transition: 'all 0.3s ease',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
              }}
              onMouseEnter={(e) => {
                e.target.style.background = colors.primary;
                e.target.style.color = colors.white;
                e.target.style.transform = 'translateY(-2px)';
              }}
              onMouseLeave={(e) => {
                e.target.style.background = colors.white;
                e.target.style.color = colors.primary;
                e.target.style.transform = 'translateY(0)';
              }}
            >
              <FiHelpCircle />
              FAQs
            </button>

            <button
              onClick={() => setIsWishlistOpen(true)}
              style={{
                background: colors.white,
                border: `1px solid ${colors.primary}`,
                color: colors.primary,
                padding: '0.75rem 1.5rem',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '0.9rem',
                fontWeight: '600',
                transition: 'all 0.3s ease',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                position: 'relative'
              }}
              onMouseEnter={(e) => {
                e.target.style.background = colors.primary;
                e.target.style.color = colors.white;
                e.target.style.transform = 'translateY(-2px)';
              }}
              onMouseLeave={(e) => {
                e.target.style.background = colors.white;
                e.target.style.color = colors.primary;
                e.target.style.transform = 'translateY(0)';
              }}
            >
              <FiHeart />
              Wishlist
              {wishlistItems.size > 0 && (
                <span style={{
                  position: 'absolute',
                  top: '-8px',
                  right: '-8px',
                  background: colors.green,
                  color: colors.white,
                  borderRadius: '50%',
                  width: '20px',
                  height: '20px',
                  fontSize: '0.7rem',
                  fontWeight: '600',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  animation: 'bounce 2s infinite',
                  border: `2px solid ${colors.white}`,
                }}>
                  {wishlistItems.size}
                </span>
              )}
            </button>

            <button
              onClick={() => setIsCartOpen(true)}
              style={{
                background: colors.primary,
                border: 'none',
                color: colors.white,
                padding: '0.75rem 1.5rem',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '0.9rem',
                fontWeight: '600',
                transition: 'all 0.3s ease',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                position: 'relative',
              }}
              onMouseEnter={(e) => {
                e.target.style.transform = 'translateY(-2px)';
                e.target.style.boxShadow = '0 4px 12px rgba(57, 88, 134, 0.3)';
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = 'none';
              }}
            >
              <FiShoppingCart />
              Cart
              {getTotalCartItems() > 0 && (
                <span style={{
                  position: 'absolute',
                  top: '-8px',
                  right: '-8px',
                  background: colors.green,
                  color: colors.white,
                  borderRadius: '50%',
                  width: '22px',
                  height: '22px',
                  fontSize: '0.75rem',
                  fontWeight: '600',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  animation: 'pulse 2s infinite',
                  border: `2px solid ${colors.white}`,
                }}>
                  {getTotalCartItems()}
                </span>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main style={{
        padding: '2rem',
        overflow: 'auto',
        width: '100%',
        maxWidth: '100%',
        margin: '120px 0 0 0',
        boxSizing: 'border-box',
      }}>
        {/* Filter and Search Section */}
        <div style={{
          backgroundColor: colors.white,
          padding: '1.5rem',
          borderRadius: '12px',
          border: `1px solid ${colors.border}`,
          marginBottom: '2rem',
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: '1.5rem',
            flexWrap: 'wrap'
          }}>
            {/* Left Section - Filters */}
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '1rem', 
              flexWrap: 'wrap' 
            }}>
              <div style={{ position: 'relative' }}>
                <button
                  onClick={() => setShowPriceFilter(!showPriceFilter)}
                  style={{
                    padding: '0.875rem 1.5rem',
                    background: showPriceFilter ? colors.primary : colors.white,
                    border: `1px solid ${showPriceFilter ? 'transparent' : colors.border}`,
                    borderRadius: '8px',
                    color: showPriceFilter ? colors.white : colors.primary,
                    cursor: 'pointer',
                    fontWeight: '600',
                    fontSize: '0.9rem',
                    transition: 'all 0.3s ease',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                  }}
                  onMouseEnter={(e) => {
                    if (!showPriceFilter) {
                      e.target.style.background = colors.primary;
                      e.target.style.color = colors.white;
                      e.target.style.borderColor = 'transparent';
                      e.target.style.transform = 'translateY(-2px)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!showPriceFilter) {
                      e.target.style.background = colors.white;
                      e.target.style.color = colors.primary;
                      e.target.style.borderColor = colors.border;
                      e.target.style.transform = 'translateY(0)';
                    }
                  }}
                >
                  <FiFilter size={16} />
                  Price Range
                  <span style={{
                    background: showPriceFilter ? 'rgba(255,255,255,0.2)' : `${colors.primary}10`,
                    color: showPriceFilter ? colors.white : colors.primary,
                    padding: '0.3rem 0.75rem',
                    borderRadius: '6px',
                    fontSize: '0.8rem',
                    fontWeight: '600',
                  }}>
                    ₱{priceRange.min.toLocaleString()}-{priceRange.max.toLocaleString()}
                  </span>
                </button>

                {showPriceFilter && (
                  <div style={{ 
                    position: 'absolute', 
                    top: '100%', 
                    left: 0, 
                    zIndex: 100, 
                    marginTop: '1rem' 
                  }}>
                    <PriceRangeFilter 
                      priceRange={priceRange}
                      onPriceRangeChange={handlePriceRangeChange}
                      colors={colors}
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Right Section - Search and Sort */}
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '1rem', 
              flexWrap: 'wrap', 
              justifyContent: 'flex-end',
              flex: 1
            }}>
              <div style={{ 
                position: 'relative', 
                minWidth: '300px',
                flex: 1
              }}>
                <FiSearch style={{
                  position: 'absolute',
                  left: '1rem',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: searchFocused ? colors.primary : colors.textMuted,
                  transition: 'color 0.3s ease'
                }} />
                <input
                  type="text"
                  placeholder="Search medical supplies..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onFocus={() => setSearchFocused(true)}
                  onBlur={() => setSearchFocused(false)}
                  style={{
                    width: '100%',
                    padding: '1rem 1rem 1rem 2.5rem',
                    border: `1px solid ${searchFocused ? colors.primary : colors.border}`,
                    borderRadius: '8px',
                    fontSize: '0.95rem',
                    outline: 'none',
                    backgroundColor: colors.white,
                    transition: 'all 0.3s ease',
                    fontWeight: '500',
                    color: colors.primary
                  }}
                />
              </div>

              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                style={{
                  padding: '1rem 1.25rem',
                  border: `1px solid ${colors.border}`,
                  borderRadius: '8px',
                  backgroundColor: colors.white,
                  color: colors.primary,
                  fontWeight: '600',
                  fontSize: '0.9rem',
                  minWidth: '180px',
                  outline: 'none',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = colors.primary;
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = colors.border;
                }}
              >
                {sortOptions.map(option => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
        {/* Product Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
          gap: '1.5rem',
          width: '100%'
        }}>
          {loading ? (
            Array.from({ length: 8 }).map((_, index) => (
              <ProductCardSkeleton key={index} colors={colors} />
            ))
          ) : (
            filteredProducts.map((product, index) => renderProductCard(product, index))
          )}
        </div>

        {/* Empty State */}
        {filteredProducts.length === 0 && !loading && (
          <div style={{
            textAlign: 'center',
            padding: '4rem 2rem',
            color: colors.textMuted,
            backgroundColor: colors.white,
            borderRadius: '12px',
            marginTop: '2rem',
            border: `1px solid ${colors.border}`,
          }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem', opacity: 0.7 }}>🔍</div>
            <h3 style={{ color: colors.primary, marginBottom: '1rem', fontWeight: '600' }}>No products found</h3>
            <p style={{ marginBottom: '2rem', lineHeight: '1.6', fontWeight: '500' }}>
              Try adjusting your search or filter criteria.
            </p>
            <button
              onClick={() => { setSearchTerm(''); setPriceRange({ min: 0, max: 10000 }); }}
              style={{
                padding: '1rem 2rem',
                background: colors.primary,
                color: colors.white,
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '1rem',
                fontWeight: '600',
                transition: 'all 0.3s ease'
              }}
              onMouseEnter={(e) => {
                e.target.style.transform = 'translateY(-2px)';
                e.target.style.boxShadow = '0 4px 12px rgba(57, 88, 134, 0.3)';
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = 'none';
              }}
            >
              Clear Filters
            </button>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer style={{
        backgroundColor: colors.white,
        padding: '2rem',
        borderTop: `1px solid ${colors.border}`,
        marginTop: '3rem',
        textAlign: 'center'
      }}>
        <div style={{
          color: colors.textMuted,
          fontSize: '0.9rem',
          fontWeight: '500'
        }}>
          <p>CAPD Medical Supplies • Certified Healthcare Products</p>
          <p style={{ marginTop: '0.5rem', fontSize: '0.8rem' }}>
            © 2024 Medical Supplies Store. All rights reserved.
          </p>
        </div>
      </footer>

      {/* Modals */}
      {selectedImage && (
        <ImageModal 
          image={selectedImage} 
          onClose={closeImageModal}
          onAddToCart={addToCart}
          onToggleFavorite={toggleWishlist}
          isFavorite={wishlistItems.has(selectedImage.id || selectedImage.supplyID)}
          colors={colors}
        />
      )}

      <CartModal
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cart={cart}
        updateQuantity={updateQuantity}
        removeFromCart={removeFromCart}
        clearCart={clearCart}
        getTotalPrice={getTotalPrice}
        getTotalCartItems={getTotalCartItems}
        getProductImage={getProductImage}
        colors={colors}
        onCheckout={handleCheckout}
      />

      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        cart={cart}
        updateQuantity={updateQuantity}
        removeFromCart={removeFromCart}
        clearCart={clearCart}
        getTotalPrice={getTotalPrice}
        getTotalCartItems={getTotalCartItems}
        getProductImage={getProductImage}
        colors={colors}
        fetchCart={fetchUserCart}
      />

      <WishlistModal
        isOpen={isWishlistOpen}
        onClose={() => setIsWishlistOpen(false)}
        colors={colors}
        onAddToCart={addToCart}
        getProductImage={getProductImage}
      />

      <ProductReviewsModal
        isOpen={isReviewsOpen}
        onClose={() => { setIsReviewsOpen(false); setSelectedProductForReview(null); }}
        product={selectedProductForReview}
        colors={colors}
      />

      {/* FAQ Modal */}
      <FAQsModal
        isOpen={isFAQsOpen}
        onClose={() => setIsFAQsOpen(false)}
        colors={colors}
      />

      {cartAnimation.show && (
        <SpinAnimation 
          startPos={cartAnimation.startPos}
          product={cartAnimation.product}
          colors={colors}
        />
      )}

      {/* Error Toast */}
      {error && (
        <div style={{
          position: 'fixed',
          top: '2rem',
          left: '50%',
          transform: 'translateX(-50%)',
          background: colors.alert,
          color: colors.white,
          padding: '1rem 1.5rem',
          borderRadius: '8px',
          border: 'none',
          fontSize: '0.9rem',
          fontWeight: '600',
          zIndex: 1001,
          display: 'flex',
          alignItems: 'center',
          gap: '1rem',
          boxShadow: '0 4px 15px rgba(239, 68, 68, 0.3)',
          animation: 'slideDown 0.3s ease-out'
        }}>
          <div style={{
            width: '20px',
            height: '20px',
            borderRadius: '50%',
            backgroundColor: colors.white,
            color: colors.alert,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '0.7rem',
            fontWeight: '600',
          }}>!</div>
          <span>{error}</span>
          <button
            onClick={() => setError('')}
            style={{
              backgroundColor: 'transparent',
              border: 'none',
              color: colors.white,
              cursor: 'pointer',
              fontSize: '1.2rem',
              padding: '0.25rem',
              borderRadius: '4px',
              transition: 'all 0.3s ease'
            }}
            onMouseEnter={(e) => {
              e.target.style.backgroundColor = 'rgba(255,255,255,0.2)';
            }}
            onMouseLeave={(e) => {
              e.target.style.backgroundColor = 'transparent';
            }}
          >
            <FiX />
          </button>
        </div>
      )}

      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.7; }
        }
        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-5px); }
        }
        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateX(-50%) translateY(-20px);
          }
          to {
            opacity: 1;
            transform: translateX(-50%) translateY(0);
          }
        }
        
        .range-slider::-webkit-slider-thumb {
          appearance: none;
          height: '18px';
          width: '18px';
          border-radius: '50%';
          background: ${colors.primary};
          cursor: pointer;
          border: 3px solid ${colors.white};
          box-shadow: 0 2px 6px rgba(0,0,0,0.2);
        }
        
        @media (max-width: 768px) {
          header { padding: 1rem; }
          main { padding: 1rem; }
        }
      `}</style>
    </div>
  );
};

export default MedsProd;