import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  Typography,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormControl,
  Divider,
  Alert,
  CircularProgress,
  Card,
  CardContent,
  CardMedia,
  Grid,
} from '@mui/material';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import IconButton from '@mui/material/IconButton';
import { getBalance } from '../api';

const API_BASE = import.meta.env?.VITE_API_URL || '';

const OrderModal = ({ open, onClose, product, orderAmount, onSuccess }) => {
  const [step, setStep] = useState(1); // 1: Address selection, 2: Review, 3: Success
  const [selectedAddress, setSelectedAddress] = useState('');
  const [addressType, setAddressType] = useState('existing'); // 'existing' or 'new'
  const [newAddress, setNewAddress] = useState({
    fullName: '',
    phone: '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: '',
    zipCode: '',
  });
  const [walletBalance, setWalletBalance] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [savedAddresses, setSavedAddresses] = useState(() => {
    // Load from localStorage or use default
    const stored = localStorage.getItem('savedAddresses');
    if (stored) {
      return JSON.parse(stored);
    }
    return [
      {
        id: 1,
        fullName: 'John Doe',
        phone: '+1 234-567-8900',
        addressLine1: '123 Main Street',
        addressLine2: 'Apt 4B',
        city: 'New York',
        state: 'NY',
        zipCode: '10001',
      },
      {
        id: 2,
        fullName: 'John Doe',
        phone: '+1 234-567-8900',
        addressLine1: '456 Oak Avenue',
        addressLine2: '',
        city: 'Brooklyn',
        state: 'NY',
        zipCode: '11201',
      },
    ];
  });
  const [editingAddress, setEditingAddress] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);

  const userEmail = localStorage.getItem('email');

  useEffect(() => {
    if (open && step === 1) {
      fetchWalletBalance();
      setStep(1);
      setSelectedAddress('');
      setAddressType('existing');
      setNewAddress({
        fullName: '',
        phone: '',
        addressLine1: '',
        addressLine2: '',
        city: '',
        state: '',
        zipCode: '',
      });
      setError('');
      setSuccess(false);
      setEditingAddress(null);
      setShowDeleteConfirm(null);
    }
  }, [open]);

  // Save addresses to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('savedAddresses', JSON.stringify(savedAddresses));
  }, [savedAddresses]);

  const fetchWalletBalance = async () => {
    try {
      const response = await getBalance(userEmail);
      setWalletBalance(response.data || 0);
    } catch (err) {
      console.error('Error fetching wallet balance:', err);
    }
  };

  const handleAddressSelect = (addressId) => {
    setSelectedAddress(addressId.toString());
    setError('');
  };

  const handleNext = () => {
    if (step === 1) {
      if (addressType === 'existing') {
        if (!selectedAddress || selectedAddress === '') {
          setError('Please select an address');
          return;
        }
        const selectedAddr = savedAddresses.find(addr => addr.id === parseInt(selectedAddress));
        if (!selectedAddr) {
          setError('Please select a valid address');
          return;
        }
      }
      if (addressType === 'new') {
        if (!newAddress.fullName || !newAddress.phone || !newAddress.addressLine1 || !newAddress.city || !newAddress.state || !newAddress.zipCode) {
          setError('Please fill in all required address fields');
          return;
        }
      }
      if (walletBalance < orderAmount) {
        setError(`Insufficient balance. You need $${(orderAmount - walletBalance).toFixed(2)} more.`);
        return;
      }
      setError('');
      setStep(2);
    }
  };

  const handlePlaceOrder = async () => {
    setLoading(true);
    setError('');
    
    // Get the selected address details
    const addressData = getSelectedAddressDetails();
    
    // Simulate order processing
    setTimeout(() => {
      setLoading(false);
      setSuccess(true);
      setStep(3);
      
      // Call success callback after showing success with address data
      setTimeout(() => {
        if (onSuccess) {
          onSuccess(addressData);
        }
        handleClose();
      }, 2000);
    }, 1500);
  };

  const handleClose = () => {
    if (!loading && !success) {
      setStep(1);
      setSelectedAddress('');
      setAddressType('existing');
      setNewAddress({
        fullName: '',
        phone: '',
        addressLine1: '',
        addressLine2: '',
        city: '',
        state: '',
        zipCode: '',
      });
      setError('');
      setSuccess(false);
      onClose();
    }
  };

  const getSelectedAddressDetails = () => {
    if (addressType === 'existing') {
      return savedAddresses.find(addr => addr.id === parseInt(selectedAddress));
    }
    return newAddress;
  };

  const handleEditAddress = (address) => {
    setEditingAddress({ ...address });
    setAddressType('new');
    setNewAddress({ ...address });
    setSelectedAddress('');
  };

  const handleDeleteAddress = (addressId) => {
    if (showDeleteConfirm === addressId) {
      // Confirm delete
      setSavedAddresses(savedAddresses.filter(addr => addr.id !== addressId));
      if (selectedAddress === addressId.toString()) {
        setSelectedAddress('');
      }
      setShowDeleteConfirm(null);
    } else {
      // Show confirmation
      setShowDeleteConfirm(addressId);
    }
  };

  const handleSaveNewAddress = () => {
    if (!newAddress.fullName || !newAddress.phone || !newAddress.addressLine1 || !newAddress.city || !newAddress.state || !newAddress.zipCode) {
      setError('Please fill in all required address fields');
      return;
    }

    if (editingAddress) {
      // Update existing address
      setSavedAddresses(savedAddresses.map(addr => 
        addr.id === editingAddress.id ? { ...newAddress, id: editingAddress.id } : addr
      ));
      setSelectedAddress(editingAddress.id.toString());
      setEditingAddress(null);
    } else {
      // Add new address
      const newId = Math.max(...savedAddresses.map(a => a.id), 0) + 1;
      const addressToAdd = { ...newAddress, id: newId };
      setSavedAddresses([...savedAddresses, addressToAdd]);
      setSelectedAddress(newId.toString());
    }
    
    // Reset form
    setNewAddress({
      fullName: '',
      phone: '',
      addressLine1: '',
      addressLine2: '',
      city: '',
      state: '',
      zipCode: '',
    });
    setAddressType('existing');
    setError('');
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Typography variant="h6">Place Order</Typography>
      </DialogTitle>
      
      <DialogContent>
        {step === 3 ? (
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
              <CheckCircleIcon sx={{ fontSize: 80, color: 'success.main' }} />
            </Box>
            <Typography variant="h5" sx={{ mb: 1, fontWeight: 'bold' }}>
              Order Placed Successfully!
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Your order has been confirmed and will be delivered soon.
            </Typography>
          </Box>
        ) : (
          <>
            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}

            {/* Product Summary */}
            <Card sx={{ mb: 3, bgcolor: '#f5f5f5' }}>
              <Box sx={{ display: 'flex', p: 2 }}>
                {product?.photoUrl && (
                  <CardMedia
                    component="img"
                    sx={{ width: 100, height: 100, objectFit: 'cover', borderRadius: 1, mr: 2 }}
                    image={`${API_BASE}${product.photoUrl}`}
                    alt={product.name}
                  />
                )}
                <Box sx={{ flexGrow: 1 }}>
                  <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 1 }}>
                    {product?.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                    Category: {product?.category}
                  </Typography>
                  <Typography variant="h6" color="primary" sx={{ fontWeight: 'bold' }}>
                    ${orderAmount?.toFixed(2)}
                  </Typography>
                </Box>
              </Box>
            </Card>

            {step === 1 && (
              <>
                <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                  <LocationOnIcon color="primary" />
                  Select Delivery Address
                </Typography>

                <FormControl component="fieldset" sx={{ mb: 3 }}>
                  <RadioGroup
                    value={addressType}
                    onChange={(e) => {
                      setAddressType(e.target.value);
                      setSelectedAddress('');
                      setError('');
                    }}
                  >
                    <FormControlLabel value="existing" control={<Radio />} label="Use Saved Address" />
                    {addressType === 'existing' && (
                      <Box sx={{ ml: 4, mt: 1 }}>
                        {savedAddresses.map((address) => (
                          <Card
                            key={address.id}
                            sx={{
                              mb: 2,
                              cursor: 'pointer',
                              border: selectedAddress === address.id.toString() ? 2 : 1,
                              borderColor: selectedAddress === address.id.toString() ? 'primary.main' : 'divider',
                              '&:hover': { borderColor: 'primary.main' },
                            }}
                            onClick={() => handleAddressSelect(address.id.toString())}
                          >
                            <CardContent>
                              <Box sx={{ display: 'flex', alignItems: 'start', justifyContent: 'space-between' }}>
                                <Box 
                                  sx={{ flexGrow: 1, cursor: 'pointer' }} 
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleAddressSelect(address.id.toString());
                                  }}
                                >
                                  <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                                    {address.fullName}
                                  </Typography>
                                  <Typography variant="body2" color="text.secondary">
                                    {address.addressLine1}
                                    {address.addressLine2 && `, ${address.addressLine2}`}
                                  </Typography>
                                  <Typography variant="body2" color="text.secondary">
                                    {address.city}, {address.state} {address.zipCode}
                                  </Typography>
                                  <Typography variant="body2" color="text.secondary">
                                    Phone: {address.phone}
                                  </Typography>
                                  {showDeleteConfirm === address.id && (
                                    <Alert severity="warning" sx={{ mt: 1, mb: 1 }}>
                                      <Typography variant="body2" sx={{ mb: 1 }}>
                                        Are you sure you want to delete this address?
                                      </Typography>
                                      <Box sx={{ display: 'flex', gap: 1 }}>
                                        <Button
                                          size="small"
                                          variant="contained"
                                          color="error"
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            handleDeleteAddress(address.id);
                                          }}
                                        >
                                          Delete
                                        </Button>
                                        <Button
                                          size="small"
                                          variant="outlined"
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            setShowDeleteConfirm(null);
                                          }}
                                        >
                                          Cancel
                                        </Button>
                                      </Box>
                                    </Alert>
                                  )}
                                </Box>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                  <IconButton
                                    size="small"
                                    color="primary"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleEditAddress(address);
                                    }}
                                  >
                                    <EditIcon fontSize="small" />
                                  </IconButton>
                                  <IconButton
                                    size="small"
                                    color="error"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleDeleteAddress(address.id);
                                    }}
                                  >
                                    <DeleteIcon fontSize="small" />
                                  </IconButton>
                                  <Radio
                                    checked={selectedAddress === address.id.toString()}
                                    value={address.id.toString()}
                                    onChange={(e) => {
                                      e.stopPropagation();
                                      handleAddressSelect(address.id.toString());
                                    }}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleAddressSelect(address.id.toString());
                                    }}
                                  />
                                </Box>
                              </Box>
                            </CardContent>
                          </Card>
                        ))}
                      </Box>
                    )}

                    <FormControlLabel value="new" control={<Radio />} label={editingAddress ? "Edit Address" : "Add New Address"} />
                    {addressType === 'new' && (
                      <Box sx={{ ml: 4, mt: 2 }}>
                        <Grid container spacing={2}>
                          <Grid item xs={12}>
                            <TextField
                              fullWidth
                              label="Full Name"
                              value={newAddress.fullName}
                              onChange={(e) => setNewAddress({ ...newAddress, fullName: e.target.value })}
                              required
                            />
                          </Grid>
                          <Grid item xs={12} sm={6}>
                            <TextField
                              fullWidth
                              label="Phone Number"
                              value={newAddress.phone}
                              onChange={(e) => setNewAddress({ ...newAddress, phone: e.target.value })}
                              required
                            />
                          </Grid>
                          <Grid item xs={12}>
                            <TextField
                              fullWidth
                              label="Address Line 1"
                              value={newAddress.addressLine1}
                              onChange={(e) => setNewAddress({ ...newAddress, addressLine1: e.target.value })}
                              required
                            />
                          </Grid>
                          <Grid item xs={12}>
                            <TextField
                              fullWidth
                              label="Address Line 2 (Optional)"
                              value={newAddress.addressLine2}
                              onChange={(e) => setNewAddress({ ...newAddress, addressLine2: e.target.value })}
                            />
                          </Grid>
                          <Grid item xs={12} sm={4}>
                            <TextField
                              fullWidth
                              label="City"
                              value={newAddress.city}
                              onChange={(e) => setNewAddress({ ...newAddress, city: e.target.value })}
                              required
                            />
                          </Grid>
                          <Grid item xs={12} sm={4}>
                            <TextField
                              fullWidth
                              label="State"
                              value={newAddress.state}
                              onChange={(e) => setNewAddress({ ...newAddress, state: e.target.value })}
                              required
                            />
                          </Grid>
                          <Grid item xs={12} sm={4}>
                            <TextField
                              fullWidth
                              label="ZIP Code"
                              value={newAddress.zipCode}
                              onChange={(e) => setNewAddress({ ...newAddress, zipCode: e.target.value })}
                              required
                            />
                          </Grid>
                          <Grid item xs={12}>
                            <Box sx={{ display: 'flex', gap: 2, mt: 1 }}>
                              <Button
                                variant="contained"
                                color="primary"
                                onClick={handleSaveNewAddress}
                              >
                                {editingAddress ? 'Update Address' : 'Save Address'}
                              </Button>
                              {editingAddress && (
                                <Button
                                  variant="outlined"
                                  onClick={() => {
                                    setEditingAddress(null);
                                    setAddressType('existing');
                                    setNewAddress({
                                      fullName: '',
                                      phone: '',
                                      addressLine1: '',
                                      addressLine2: '',
                                      city: '',
                                      state: '',
                                      zipCode: '',
                                    });
                                  }}
                                >
                                  Cancel
                                </Button>
                              )}
                            </Box>
                          </Grid>
                        </Grid>
                      </Box>
                    )}
                  </RadioGroup>
                </FormControl>
              </>
            )}

            {step === 2 && (
              <>
                <Typography variant="h6" sx={{ mb: 2 }}>Review Your Order</Typography>
                
                {/* Address Summary */}
                <Card sx={{ mb: 2, bgcolor: '#f9f9f9' }}>
                  <CardContent>
                    <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
                      DELIVERY ADDRESS
                    </Typography>
                    {(() => {
                      const addr = getSelectedAddressDetails();
                      return (
                        <>
                          <Typography variant="body1" sx={{ fontWeight: 'bold', mb: 0.5 }}>
                            {addr.fullName}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {addr.addressLine1}
                            {addr.addressLine2 && `, ${addr.addressLine2}`}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {addr.city}, {addr.state} {addr.zipCode}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Phone: {addr.phone}
                          </Typography>
                        </>
                      );
                    })()}
                  </CardContent>
                </Card>

                <Divider sx={{ my: 2 }} />

                {/* Payment Summary */}
                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
                    PAYMENT SUMMARY
                  </Typography>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2">Product Amount:</Typography>
                    <Typography variant="body2">${orderAmount?.toFixed(2)}</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2">Your Wallet Balance:</Typography>
                    <Typography variant="body2" color={walletBalance >= orderAmount ? 'success.main' : 'error.main'}>
                      ${walletBalance.toFixed(2)}
                    </Typography>
                  </Box>
                  <Divider sx={{ my: 1 }} />
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                      Total Amount:
                    </Typography>
                    <Typography variant="h6" color="primary" sx={{ fontWeight: 'bold' }}>
                      ${orderAmount?.toFixed(2)}
                    </Typography>
                  </Box>
                  {walletBalance < orderAmount && (
                    <Alert severity="warning" sx={{ mt: 1 }}>
                      Insufficient balance. Please add ${(orderAmount - walletBalance).toFixed(2)} to your wallet.
                    </Alert>
                  )}
                </Box>
              </>
            )}
          </>
        )}
      </DialogContent>

      {step !== 3 && (
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={handleClose} disabled={loading}>
            Cancel
          </Button>
          {step === 1 ? (
            <Button onClick={handleNext} variant="contained" color="primary" disabled={loading}>
              Continue
            </Button>
          ) : (
            <Button
              onClick={handlePlaceOrder}
              variant="contained"
              color="primary"
              disabled={loading || walletBalance < orderAmount}
              sx={{ minWidth: 150 }}
            >
              {loading ? <CircularProgress size={24} /> : 'Place Order'}
            </Button>
          )}
        </DialogActions>
      )}
    </Dialog>
  );
};

export default OrderModal;

