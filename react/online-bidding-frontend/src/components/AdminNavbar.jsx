import React, { useEffect, useState } from 'react';
import { AppBar, Toolbar, Typography, Button, Box, IconButton, Tooltip } from '@mui/material';
import { Link, useNavigate } from 'react-router-dom';
import ListAltIcon from '@mui/icons-material/ListAlt';
import CategoryIcon from '@mui/icons-material/Category';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import GavelIcon from '@mui/icons-material/Gavel';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import LogoutIcon from '@mui/icons-material/Logout';
import { getFullname } from '../api';
import logo from '../assets/logo.jpg';
import '../CSS/navbar.css';

const AdminNavbar = () => {
  const navigate = useNavigate();
  const [adminName, setAdminName] = useState('Admin Panel');

  useEffect(() => {
    const fetchAdminName = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const response = await getFullname(token);
          const name = response.data;
          if (name && !name.includes('::') && !name.includes('401')) {
            setAdminName(name);
          } else if (name && name.includes('::')) {
            const actualName = name.split('::')[1];
            if (actualName && actualName !== 'Token Expired!') {
              setAdminName(actualName);
            }
          }
        } catch (error) {
          console.error('Error fetching admin name:', error);
        }
      }
    };
    fetchAdminName();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('email');
    localStorage.removeItem('isAdmin');
    navigate('/');
  };

  return (
    <AppBar position="static" className="navbar">
      <Toolbar>
        <Box component={Link} to="/admin-dashboard" sx={{ display: 'flex', alignItems: 'center', textDecoration: 'none', color: 'inherit', mr: 2 }}>
          <img src={logo} alt="Logo" style={{ height: '40px', marginRight: '10px' }} />
          <Typography variant="h6" className="logo">
            {adminName}
          </Typography>
        </Box>
        <Box className="nav-links">
          <Tooltip title="All Products">
            <IconButton color="inherit" component={Link} to="/products">
              <ListAltIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="All Categories">
            <IconButton color="inherit" component={Link} to="/admin/categories">
              <CategoryIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="All Orders">
            <IconButton color="inherit" component={Link} to="/orders">
              <ShoppingCartIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Transactions">
            <IconButton color="inherit" component={Link} to="/transactions">
              <ReceiptLongIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Bids">
            <IconButton color="inherit" component={Link} to="/admin/bids">
              <GavelIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Deliveries">
            <IconButton color="inherit" component={Link} to="/admin/deliveries">
              <LocalShippingIcon />
            </IconButton>
          </Tooltip>
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

export default AdminNavbar; 