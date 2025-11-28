import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Box,
  Alert,
  Button,
} from '@mui/material';
import UserNavbar from '../components/UserNavbar';
import OrderModal from '../components/OrderModal';
import { getBidsForProduct, getHighestBid, placeOrder, createDelivery } from '../api';

const API_BASE = import.meta.env?.VITE_API_URL || '';

const UserBids = () => {
  const navigate = useNavigate();
  const [userBids, setUserBids] = useState([]);
  const [highestBids, setHighestBids] = useState({});
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [orderModalOpen, setOrderModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);

  const userEmail = localStorage.getItem('email');

  useEffect(() => {
    fetchUserBids();
  }, []);

  const fetchUserBids = async () => {
    try {
      // Get all products first
      const productsResponse = await fetch(`${API_BASE}/products/all`);
      const products = await productsResponse.json();

      // For each product, get bids and check if user has highest bid
      const bidsPromises = products.map(product => getBidsForProduct(product.id));
      const highestBidPromises = products.map(product => getHighestBid(product.id));
      
      const bidsResults = await Promise.all(bidsPromises);
      const highestResults = await Promise.all(highestBidPromises);

      // Filter bids made by the current user
      const userBidsList = [];
      const highestBidsMap = {};

      products.forEach((product, index) => {
        const productBids = bidsResults[index].data;
        const highestBid = highestResults[index].data;
        
        // Store highest bid for each product
        highestBidsMap[product.id] = highestBid;

        // Find all bids by the current user for this product
        const userBidsForProduct = productBids.filter(bid => bid.buyerEmail === userEmail);
        // Find the highest bid by the user for this product
        if (userBidsForProduct.length > 0) {
          const userHighestBid = userBidsForProduct.reduce((max, bid) => bid.bidAmount > max.bidAmount ? bid : max, userBidsForProduct[0]);
          userBidsList.push({
            ...userHighestBid,
            product: product
          });
        }
      });

      setUserBids(userBidsList);
      setHighestBids(highestBidsMap);
    } catch (err) {
      setError('Failed to fetch bids');
    }
  };

  const handleOrderClick = (product) => {
    setSelectedProduct(product);
    setError('');
    setSuccess('');
    setOrderModalOpen(true);
  };

  const handleOrderSuccess = async (addressData) => {
    try {
      // Format address string
      const addressString = addressData.addressLine2
        ? `${addressData.addressLine1}, ${addressData.addressLine2}, ${addressData.city}, ${addressData.state} ${addressData.zipCode}`
        : `${addressData.addressLine1}, ${addressData.city}, ${addressData.state} ${addressData.zipCode}`;

      // Place the order
      const orderData = {
        buyerEmail: userEmail,
        productId: selectedProduct.id,
        amount: highestBids[selectedProduct.id].bidAmount
      };

      const orderResponse = await placeOrder(orderData);
      if (!orderResponse.data || !orderResponse.data.toString().includes('200')) {
        setError(orderResponse.data?.split('::')[1] || 'Failed to place order');
        return;
      }

      // Extract order ID from response
      let orderId;
      if (typeof orderResponse.data === 'string') {
        if (orderResponse.data.includes('::')) {
          orderId = orderResponse.data.split('::')[1];
        } else if (orderResponse.data.includes('Order placed successfully')) {
          // Try to get order ID from the response or fetch the latest order
          const ordersResponse = await fetch(`${import.meta.env?.VITE_API_URL || ''}/orders/getbyuser`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: userEmail })
          });
          const orders = await ordersResponse.json();
          if (orders && orders.length > 0) {
            orderId = orders[orders.length - 1].id;
          }
        }
      }

      if (orderId) {
        // Create delivery record
        const deliveryData = {
          orderId: parseInt(orderId),
          deliveryStatus: 'Pending',
          deliveryAddress: addressString
        };

        await createDelivery(deliveryData);
      }

      setSuccess('Order placed successfully!');
      setOrderModalOpen(false);
      fetchUserBids(); // Refresh the list
      
      // Redirect to My Orders page after a short delay
      setTimeout(() => {
        navigate('/user/orders');
      }, 1500);
    } catch (err) {
      console.error('Error placing order:', err);
      setError('Failed to place order. Please try again.');
    }
  };

  return (
    <>
      <UserNavbar />
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Typography variant="h4" gutterBottom>
          My Bids
        </Typography>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}
        
        <Grid container spacing={3}>
          {userBids.map((bid) => (
            <Grid item xs={12} sm={6} md={4} key={bid.id}>
              <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column', transition: 'transform 0.3s', '&:hover': { transform: 'translateY(-6px)', boxShadow: '0 8px 24px rgba(0,0,0,0.08)' } }}>
                <CardMedia
                  component="img"
                  height="200"
                  image={bid.product.photoUrl ? `${API_BASE}${bid.product.photoUrl}` : 'https://via.placeholder.com/300x200'}
                  alt={bid.product.name}
                  sx={{ objectFit: 'cover' }}
                />
                <CardContent sx={{ flexGrow: 1 }}>
                  <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
                    {bid.product.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                    Category: {bid.product.category}
                  </Typography>
                  <Typography variant="body1" color="primary" sx={{ mb: 1, fontWeight: 'bold' }}>
                    Your Bid: ${bid.bidAmount.toFixed(2)}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    Current Highest Bid: ${highestBids[bid.product.id]?.bidAmount.toFixed(2) || '0.00'}
                  </Typography>
                  {highestBids[bid.product.id]?.buyerEmail === userEmail && (
                    <Button
                      variant="contained"
                      color="primary"
                      fullWidth
                      sx={{ mt: 2 }}
                      onClick={() => handleOrderClick(bid.product)}
                    >
                      Order Now
                    </Button>
                  )}
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        <OrderModal
          open={orderModalOpen}
          onClose={() => setOrderModalOpen(false)}
          product={selectedProduct}
          orderAmount={selectedProduct ? highestBids[selectedProduct.id]?.bidAmount : 0}
          onSuccess={handleOrderSuccess}
        />
      </Container>
    </>
  );
};

export default UserBids; 