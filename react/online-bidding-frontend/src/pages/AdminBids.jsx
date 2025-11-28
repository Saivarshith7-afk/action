import { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Box,
  Alert,
  Divider,
} from '@mui/material';
import AdminNavbar from '../components/AdminNavbar';
import { getAllProducts, getBidsForProduct, getHighestBid } from '../api';

const API_BASE = import.meta.env?.VITE_API_URL || '';

const AdminBids = () => {
  const [products, setProducts] = useState([]);
  const [bidsByProduct, setBidsByProduct] = useState({});
  const [highestBids, setHighestBids] = useState({});
  const [error, setError] = useState('');

  useEffect(() => {
    fetchProductsAndBids();
  }, []);

  const fetchProductsAndBids = async () => {
    try {
      const productsRes = await getAllProducts();
      setProducts(productsRes.data);
      // Fetch bids for each product
      const bidsPromises = productsRes.data.map((product) => getBidsForProduct(product.id));
      const highestBidPromises = productsRes.data.map((product) => getHighestBid(product.id));
      const bidsResults = await Promise.all(bidsPromises);
      const highestResults = await Promise.all(highestBidPromises);
      const bidsMap = {};
      const highestMap = {};
      productsRes.data.forEach((product, idx) => {
        bidsMap[product.id] = bidsResults[idx].data;
        highestMap[product.id] = highestResults[idx].data;
      });
      setBidsByProduct(bidsMap);
      setHighestBids(highestMap);
    } catch (err) {
      setError('Failed to fetch bids or products');
    }
  };

  return (
    <>
      <AdminNavbar />
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Typography variant="h4" gutterBottom>
          All Bids
        </Typography>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        <Grid container spacing={4}>
          {products.map((product) => (
            <Grid item xs={12} md={6} key={product.id}>
              <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                <CardMedia
                  component="img"
                  height="250"
                  image={product.photoUrl ? `${API_BASE}${product.photoUrl}` : 'https://via.placeholder.com/300x250'}
                  alt={product.name}
                  sx={{ objectFit: 'cover' }}
                />
                <CardContent sx={{ flexGrow: 1 }}>
                  <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
                    {product.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                    Category: {product.category}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    Price: ${product.price.toFixed(2)}
                  </Typography>
                  <Divider sx={{ mb: 2 }} />
                  <Typography variant="subtitle1" sx={{ mb: 1 }}>
                    Highest Bid:
                  </Typography>
                  {highestBids[product.id] && highestBids[product.id].bidAmount ? (
                    <Box sx={{ mb: 2, p: 2, bgcolor: '#e3f2fd', borderRadius: 1 }}>
                      <Typography variant="body1" color="primary">
                        ${highestBids[product.id].bidAmount.toFixed(2)} by {highestBids[product.id].buyerEmail}
                      </Typography>
                    </Box>
                  ) : (
                    <Typography color="text.secondary" sx={{ mb: 2 }}>
                      No bids yet
                    </Typography>
                  )}
                  <Typography variant="subtitle1" sx={{ mb: 1 }}>
                    All Bids:
                  </Typography>
                  {bidsByProduct[product.id] && bidsByProduct[product.id].length > 0 ? (
                    bidsByProduct[product.id].map((bid) => (
                      <Box key={bid.id} sx={{ mb: 1, p: 1, border: '1px solid #eee', borderRadius: 1 }}>
                        <Typography variant="body2">
                          Bidder: {bid.buyerEmail}
                        </Typography>
                        <Typography variant="body2" color="primary">
                          Amount: ${bid.bidAmount.toFixed(2)}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Placed on: {new Date(bid.bidTime).toLocaleString()}
                        </Typography>
                      </Box>
                    ))
                  ) : (
                    <Typography color="text.secondary">No bids for this product</Typography>
                  )}
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>
    </>
  );
};

export default AdminBids; 