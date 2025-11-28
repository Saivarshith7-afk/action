import React, { useEffect, useState } from 'react';
import { AppBar, Toolbar, Typography, Box, IconButton, Tooltip } from '@mui/material';
import { Link, useNavigate } from 'react-router-dom';
import ListAltIcon from '@mui/icons-material/ListAlt';
import CategoryIcon from '@mui/icons-material/Category';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import LogoutIcon from '@mui/icons-material/Logout';
import GavelIcon from '@mui/icons-material/Gavel';
import { getBalance, getUserTransactions, getFullname } from '../api';
import NotificationBell from './NotificationBell';
import logo from '../assets/logo.jpg';
import '../CSS/navbar.css';

const UserNavbar = () => {
  const navigate = useNavigate();
  const [walletBalance, setWalletBalance] = useState(0);
  const [recentTransaction, setRecentTransaction] = useState(null);
  const [userName, setUserName] = useState('User Panel');
  const email = localStorage.getItem('email');

  useEffect(() => {
    async function fetchWalletAndTransaction() {
      if (!email) return;
      try {
        const balanceRes = await getBalance(email);
        setWalletBalance(balanceRes.data);
        const txRes = await getUserTransactions(email);
        if (txRes.data && txRes.data.length > 0) {
          // Sort by transactionTime descending if not already
          const sorted = [...txRes.data].sort((a, b) => new Date(b.transactionTime) - new Date(a.transactionTime));
          setRecentTransaction(sorted[0]);
        }
      } catch (err) {
        // Optionally handle error
      }
    }
    
    async function fetchUserName() {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const response = await getFullname(token);
          const name = response.data;
          if (name && !name.includes('::') && !name.includes('401')) {
            setUserName(name);
          } else if (name && name.includes('::')) {
            const actualName = name.split('::')[1];
            if (actualName && actualName !== 'Token Expired!') {
              setUserName(actualName);
            }
          }
        } catch (error) {
          console.error('Error fetching user name:', error);
        }
      }
    }
    
    fetchWalletAndTransaction();
    fetchUserName();
  }, [email]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('email');
    localStorage.removeItem('isAdmin');
    navigate('/');
  };

  return (
    <AppBar position="static" className="navbar">
      <Toolbar>
        <Box component={Link} to="/user-dashboard" sx={{ display: 'flex', alignItems: 'center', textDecoration: 'none', color: 'inherit', mr: 2 }}>
          <img src={logo} alt="Logo" style={{ height: '40px', marginRight: '10px' }} />
          <Typography variant="h6" className="logo">
            {userName}
          </Typography>
        </Box>
        <Box className="nav-links">
          <Tooltip title="All Products">
            <IconButton color="inherit" component={Link} to="/user/products">
              <ListAltIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="My Bids">
            <IconButton color="inherit" component={Link} to="/user/bids">
              <GavelIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Wallet">
            <IconButton color="inherit" component={Link} to="/wallet">
              <AccountBalanceWalletIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="User Orders">
            <IconButton color="inherit" component={Link} to="/user/orders">
              <ShoppingCartIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="User Transactions">
            <IconButton color="inherit" component={Link} to="/user/transactions">
              <ReceiptLongIcon />
            </IconButton>
          </Tooltip>
          <NotificationBell />
          <Tooltip title="Logout">
            <IconButton color="inherit" onClick={handleLogout}>
              <LogoutIcon />
            </IconButton>
          </Tooltip>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default UserNavbar; 