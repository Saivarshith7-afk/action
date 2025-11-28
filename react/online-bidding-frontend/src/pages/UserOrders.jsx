import { useState, useEffect } from 'react';
import {
  Container,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Typography,
  Alert,
  Box,
  Chip,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  DialogContentText,
} from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import CancelIcon from '@mui/icons-material/Cancel';
import UserNavbar from '../components/UserNavbar';
import { getOrdersByUser, getProductById, getDeliveryById, getAllDeliveries, cancelOrder, recordTransaction, updateDeliveryStatus } from '../api';

const API_BASE = import.meta.env?.VITE_API_URL || '';

const UserOrders = () => {
  const [orders, setOrders] = useState([]);
  const [ordersWithDetails, setOrdersWithDetails] = useState([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(true);
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [orderToCancel, setOrderToCancel] = useState(null);
  const [cancelling, setCancelling] = useState(false);
  const email = localStorage.getItem('email');

  useEffect(() => {
    fetchUserOrders();
    
    // Auto-refresh every 10 seconds to get updated delivery status
    const interval = setInterval(() => {
      fetchUserOrders();
    }, 10000); // Refresh every 10 seconds
    
    return () => clearInterval(interval);
    // eslint-disable-next-line
  }, [email]);

  const fetchUserOrders = async () => {
    try {
      setLoading(true);
      setError('');
      
      // Fetch orders and deliveries in parallel for better performance
      const [ordersResponse, deliveriesResponse] = await Promise.all([
        getOrdersByUser(email),
        getAllDeliveries().catch(() => ({ data: [] })) // Don't fail if deliveries fail
      ]);
      
      const ordersData = ordersResponse.data || [];
      const deliveries = deliveriesResponse.data || [];
      
      setOrders(ordersData);

      // Create a map of deliveries by orderId for quick lookup
      const deliveryMap = new Map();
      deliveries.forEach(delivery => {
        deliveryMap.set(delivery.orderId, delivery);
      });

      // Fetch product details and delivery status for each order
      const ordersWithDetailsPromises = ordersData.map(async (order) => {
        try {
          // Fetch product details
          const productResponse = await getProductById(order.productId);
          const product = productResponse.data;

          // Get delivery from map
          const delivery = deliveryMap.get(order.id) || null;

          return {
            ...order,
            product,
            delivery,
          };
        } catch (err) {
          console.error(`Error fetching details for order ${order.id}:`, err);
          // Still try to get delivery even if product fetch fails
          const delivery = deliveryMap.get(order.id) || null;
          return {
            ...order,
            product: null,
            delivery,
          };
        }
      });

      const ordersWithDetailsData = await Promise.all(ordersWithDetailsPromises);
      setOrdersWithDetails(ordersWithDetailsData);
    } catch (error) {
      console.error('Error fetching orders:', error);
      setError('Failed to fetch your orders');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'pending':
        return 'warning';
      case 'processing':
        return 'info';
      case 'shipped':
        return 'info';
      case 'delivered':
        return 'success';
      case 'cancelled':
        return 'error';
      default:
        return 'default';
    }
  };

  const handleCancelClick = (order) => {
    setOrderToCancel(order);
    setCancelDialogOpen(true);
  };

  const handleCancelConfirm = async () => {
    if (!orderToCancel) return;
    
    setCancelling(true);
    setError('');
    setSuccess('');
    
    try {
      // Cancel the order
      const cancelResponse = await cancelOrder(orderToCancel.id);
      
      // Check response - handle both string and object responses
      let responseData = cancelResponse.data;
      if (typeof responseData === 'object' && responseData !== null) {
        responseData = JSON.stringify(responseData);
      }
      const responseStr = responseData?.toString() || '';
      
      if (!responseStr.includes('200') && !responseStr.includes('successfully')) {
        const errorMsg = responseStr.includes('::') ? responseStr.split('::')[1] : 'Failed to cancel order';
        setError(errorMsg || 'Failed to cancel order. Please try again.');
        setCancelDialogOpen(false);
        setCancelling(false);
        return;
      }

      // Update delivery status to Cancelled if delivery exists
      if (orderToCancel.delivery) {
        try {
          await updateDeliveryStatus(orderToCancel.delivery.id, 'Cancelled');
        } catch (err) {
          console.error('Error updating delivery status:', err);
          // Continue even if delivery update fails
        }
      }

      // Record transaction for refund
      try {
        await recordTransaction({
          buyerEmail: email,
          productId: 0, // 0 indicates refund transaction
          amount: orderToCancel.amount
        });
      } catch (err) {
        console.error('Error recording transaction:', err);
        // Don't fail the whole operation if transaction recording fails
      }

      setSuccess(`Order #${orderToCancel.id} cancelled successfully. Refund of $${orderToCancel.amount.toFixed(2)} has been processed.`);
      setCancelDialogOpen(false);
      setOrderToCancel(null);
      
      // Refresh orders list after a short delay to ensure backend has processed
      setTimeout(() => {
        fetchUserOrders();
      }, 500);
    } catch (err) {
      console.error('Error cancelling order:', err);
      const errorMessage = err.response?.data?.message || err.message || 'Failed to cancel order. Please try again.';
      setError(errorMessage);
    } finally {
      setCancelling(false);
    }
  };

  const handleCancelDialogClose = () => {
    if (!cancelling) {
      setCancelDialogOpen(false);
      setOrderToCancel(null);
    }
  };

  const canCancelOrder = (order) => {
    const status = order.delivery?.deliveryStatus?.toLowerCase();
    return status === 'pending' || status === 'processing' || !status;
  };

  if (loading) {
    return (
      <>
        <UserNavbar />
        <Container maxWidth="lg" sx={{ py: 4, textAlign: 'center' }}>
          <Typography variant="h6">Loading orders...</Typography>
        </Container>
      </>
    );
  }

  return (
    <>
      <UserNavbar />
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h4">
            My Orders
          </Typography>
          <Button
            variant="outlined"
            color="primary"
            startIcon={<RefreshIcon />}
            onClick={fetchUserOrders}
          >
            Refresh
          </Button>
        </Box>
        {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>{error}</Alert>}
        {success && <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess('')}>{success}</Alert>}
        <Grid container spacing={3}>
          {ordersWithDetails.length === 0 && (
            <Grid item xs={12}>
              <Typography variant="h6" textAlign="center">
                You have no orders yet.
              </Typography>
            </Grid>
          )}
          {ordersWithDetails.map((order) => (
            <Grid item xs={12} sm={6} md={6} key={order.id}>
              <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                <Box sx={{ display: 'flex' }}>
                  {order.product?.photoUrl && (
                    <CardMedia
                      component="img"
                      sx={{ width: 200, height: 200, objectFit: 'cover' }}
                      image={`${API_BASE}${order.product.photoUrl}`}
                      alt={order.product.name || 'Product'}
                    />
                  )}
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', mb: 2 }}>
                      <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                        Order #{order.id}
                      </Typography>
                      <Chip
                        label={order.delivery?.deliveryStatus || 'Pending'}
                        color={getStatusColor(order.delivery?.deliveryStatus)}
                        size="small"
                      />
                    </Box>
                    
                    {order.product ? (
                      <>
                        <Typography variant="h6" sx={{ mb: 1, fontWeight: 'bold' }}>
                          {order.product.name}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                          Category: {order.product.category}
                        </Typography>
                      </>
                    ) : (
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                        Product ID: {order.productId}
                      </Typography>
                    )}
                    
                    <Typography variant="h6" color="primary" sx={{ mb: 1, fontWeight: 'bold' }}>
                      ${order.amount.toFixed(2)}
                    </Typography>
                    
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                      Ordered on: {new Date(order.orderDate).toLocaleString()}
                    </Typography>
                    
                    {order.delivery && (
                      <Box sx={{ mt: 2, p: 2, bgcolor: '#f5f5f5', borderRadius: 1 }}>
                        <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
                          DELIVERY ADDRESS
                        </Typography>
                        <Typography variant="body2">
                          {order.delivery.deliveryAddress}
                        </Typography>
                      </Box>
                    )}

                    {canCancelOrder(order) && (
                      <Button
                        variant="outlined"
                        color="error"
                        startIcon={<CancelIcon />}
                        fullWidth
                        sx={{ mt: 2 }}
                        onClick={() => handleCancelClick(order)}
                      >
                        Cancel Order
                      </Button>
                    )}
                  </CardContent>
                </Box>
              </Card>
            </Grid>
          ))}
        </Grid>

        {/* Cancel Order Confirmation Dialog */}
        <Dialog open={cancelDialogOpen} onClose={handleCancelDialogClose}>
          <DialogTitle>Cancel Order</DialogTitle>
          <DialogContent>
            <DialogContentText>
              Are you sure you want to cancel Order #{orderToCancel?.id}?
              <br />
              <br />
              <strong>Product:</strong> {orderToCancel?.product?.name || `Product ID: ${orderToCancel?.productId}`}
              <br />
              <strong>Amount:</strong> ${orderToCancel?.amount?.toFixed(2)}
              <br />
              <br />
              The amount of <strong>${orderToCancel?.amount?.toFixed(2)}</strong> will be refunded to your wallet.
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCancelDialogClose} disabled={cancelling}>
              Keep Order
            </Button>
            <Button 
              onClick={handleCancelConfirm} 
              color="error" 
              variant="contained"
              disabled={cancelling}
            >
              {cancelling ? 'Cancelling...' : 'Cancel Order'}
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </>
  );
};

export default UserOrders; 