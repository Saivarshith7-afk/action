import { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  Typography,
  Tabs,
  Tab,
  Alert,
  CircularProgress,
  Card,
  CardContent,
  InputAdornment,
} from '@mui/material';
import CreditCardIcon from '@mui/icons-material/CreditCard';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import RedeemIcon from '@mui/icons-material/Redeem';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

const PaymentModal = ({ open, onClose, amount, onSuccess }) => {
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  
  // Card payment form
  const [cardData, setCardData] = useState({
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    cardName: '',
  });

  // Redeem code form
  const [redeemCode, setRedeemCode] = useState('');

  const handlePaymentMethodChange = (event, newValue) => {
    setPaymentMethod(newValue);
    setError('');
  };

  const formatCardNumber = (value) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = matches && matches[0] || '';
    const parts = [];
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    if (parts.length) {
      return parts.join(' ');
    } else {
      return v;
    }
  };

  const formatExpiryDate = (value) => {
    const v = value.replace(/\D/g, '');
    if (v.length >= 2) {
      return v.substring(0, 2) + '/' + v.substring(2, 4);
    }
    return v;
  };

  const handleCardInputChange = (field, value) => {
    let formattedValue = value;
    if (field === 'cardNumber') {
      formattedValue = formatCardNumber(value);
      if (formattedValue.replace(/\s/g, '').length > 16) return;
    } else if (field === 'expiryDate') {
      formattedValue = formatExpiryDate(value);
      if (formattedValue.replace(/\D/g, '').length > 4) return;
    } else if (field === 'cvv') {
      formattedValue = value.replace(/\D/g, '').substring(0, 3);
    }
    setCardData({ ...cardData, [field]: formattedValue });
  };

  const validateCardForm = () => {
    if (!cardData.cardNumber || cardData.cardNumber.replace(/\s/g, '').length < 16) {
      return 'Please enter a valid card number';
    }
    if (!cardData.expiryDate || cardData.expiryDate.length < 5) {
      return 'Please enter a valid expiry date (MM/YY)';
    }
    if (!cardData.cvv || cardData.cvv.length < 3) {
      return 'Please enter a valid CVV';
    }
    if (!cardData.cardName || cardData.cardName.trim().length < 3) {
      return 'Please enter cardholder name';
    }
    return null;
  };

  const handlePayment = async () => {
    setError('');
    
    if (paymentMethod === 'card') {
      const validationError = validateCardForm();
      if (validationError) {
        setError(validationError);
        return;
      }
    } else if (paymentMethod === 'redeem') {
      if (!redeemCode || redeemCode.trim().length < 6) {
        setError('Please enter a valid redeem code');
        return;
      }
    }

    setLoading(true);
    
    // Simulate payment processing
    setTimeout(() => {
      setLoading(false);
      setSuccess(true);
      
      // Call success callback after showing success message
      setTimeout(() => {
        if (onSuccess) {
          onSuccess();
        }
        handleClose();
      }, 2000);
    }, 2000);
  };

  const handleClose = () => {
    if (!loading && !success) {
      setPaymentMethod('card');
      setCardData({ cardNumber: '', expiryDate: '', cvv: '', cardName: '' });
      setRedeemCode('');
      setError('');
      setSuccess(false);
      onClose();
    }
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6">Add Money to Wallet</Typography>
          <Typography variant="h6" color="primary" sx={{ fontWeight: 'bold' }}>
            ${parseFloat(amount || 0).toFixed(2)}
          </Typography>
        </Box>
      </DialogTitle>
      
      <DialogContent>
        {success ? (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <Box
              sx={{
                display: 'inline-flex',
                borderRadius: '50%',
                bgcolor: 'success.light',
                p: 2,
                mb: 2,
                animation: 'scaleIn 0.5s ease-in-out',
                '@keyframes scaleIn': {
                  '0%': {
                    transform: 'scale(0)',
                    opacity: 0,
                  },
                  '50%': {
                    transform: 'scale(1.1)',
                  },
                  '100%': {
                    transform: 'scale(1)',
                    opacity: 1,
                  },
                },
              }}
            >
              <CheckCircleIcon 
                sx={{ 
                  fontSize: 80, 
                  color: 'success.main',
                }} 
              />
            </Box>
            <Typography variant="h5" sx={{ mb: 1, fontWeight: 'bold' }}>
              Payment Successful!
            </Typography>
            <Typography variant="body1" color="text.secondary">
              ${parseFloat(amount || 0).toFixed(2)} has been added to your wallet
            </Typography>
          </Box>
        ) : loading ? (
          <Box sx={{ textAlign: 'center', py: 6 }}>
            <CircularProgress size={60} sx={{ mb: 2 }} />
            <Typography variant="h6" sx={{ mb: 1 }}>
              Processing Payment...
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Please wait while we process your payment
            </Typography>
          </Box>
        ) : (
          <>
            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}

            <Tabs
              value={paymentMethod}
              onChange={handlePaymentMethodChange}
              sx={{ mb: 3, borderBottom: 1, borderColor: 'divider' }}
            >
              <Tab 
                icon={<CreditCardIcon />} 
                iconPosition="start"
                label="Card" 
                value="card" 
              />
              <Tab 
                icon={<AccountBalanceWalletIcon />} 
                iconPosition="start"
                label="Google Pay" 
                value="googlepay" 
              />
              <Tab 
                icon={<RedeemIcon />} 
                iconPosition="start"
                label="Redeem Code" 
                value="redeem" 
              />
            </Tabs>

            {paymentMethod === 'card' && (
              <Box>
                <TextField
                  fullWidth
                  label="Card Number"
                  placeholder="1234 5678 9012 3456"
                  value={cardData.cardNumber}
                  onChange={(e) => handleCardInputChange('cardNumber', e.target.value)}
                  sx={{ mb: 2 }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <CreditCardIcon />
                      </InputAdornment>
                    ),
                  }}
                  required
                />
                <TextField
                  fullWidth
                  label="Cardholder Name"
                  placeholder="John Doe"
                  value={cardData.cardName}
                  onChange={(e) => handleCardInputChange('cardName', e.target.value)}
                  sx={{ mb: 2 }}
                  required
                />
                <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                  <TextField
                    fullWidth
                    label="Expiry Date"
                    placeholder="MM/YY"
                    value={cardData.expiryDate}
                    onChange={(e) => handleCardInputChange('expiryDate', e.target.value)}
                    required
                  />
                  <TextField
                    fullWidth
                    label="CVV"
                    placeholder="123"
                    type="password"
                    value={cardData.cvv}
                    onChange={(e) => handleCardInputChange('cvv', e.target.value)}
                    required
                  />
                </Box>
                <Card sx={{ bgcolor: '#f5f5f5', mb: 2 }}>
                  <CardContent>
                    <Typography variant="body2" color="text.secondary">
                      💳 This is a demo payment. No real transaction will be processed.
                    </Typography>
                  </CardContent>
                </Card>
              </Box>
            )}

            {paymentMethod === 'googlepay' && (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <AccountBalanceWalletIcon sx={{ fontSize: 80, color: '#4285F4', mb: 2 }} />
                <Typography variant="h6" sx={{ mb: 2 }}>
                  Google Pay
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                  Click "Continue to Payment" to proceed with Google Pay
                </Typography>
                <Card sx={{ bgcolor: '#f5f5f5' }}>
                  <CardContent>
                    <Typography variant="body2" color="text.secondary">
                      💳 This is a demo payment. No real transaction will be processed.
                    </Typography>
                  </CardContent>
                </Card>
              </Box>
            )}

            {paymentMethod === 'redeem' && (
              <Box>
                <TextField
                  fullWidth
                  label="Redeem Code"
                  placeholder="Enter your redeem code"
                  value={redeemCode}
                  onChange={(e) => setRedeemCode(e.target.value.toUpperCase())}
                  sx={{ mb: 2 }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <RedeemIcon />
                      </InputAdornment>
                    ),
                  }}
                  required
                />
                <Card sx={{ bgcolor: '#f5f5f5' }}>
                  <CardContent>
                    <Typography variant="body2" color="text.secondary">
                      💳 Enter a valid redeem code to add money to your wallet
                    </Typography>
                  </CardContent>
                </Card>
              </Box>
            )}
          </>
        )}
      </DialogContent>

      {!success && !loading && (
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={handleClose} disabled={loading}>
            Cancel
          </Button>
          <Button
            onClick={handlePayment}
            variant="contained"
            color="primary"
            disabled={loading}
            sx={{ minWidth: 150 }}
          >
            Continue to Payment
          </Button>
        </DialogActions>
      )}
    </Dialog>
  );
};

export default PaymentModal;

