import { useState, useEffect } from 'react';
import { Modal, Box, Typography, TextField, Button, Alert, Link, CircularProgress } from '@mui/material';
import { signin, sendOTP, forgotPassword } from '../api';
import { useNavigate } from 'react-router-dom';
import Captcha from './Captcha';
import '../CSS/modal.css';

const LoginModal = ({ open, onClose, onLoginSuccess }) => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [forgotPasswordStep, setForgotPasswordStep] = useState(1); // 1: email, 2: OTP, 3: new password
  const [forgotPasswordData, setForgotPasswordData] = useState({
    email: '',
    otp: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [forgotPasswordError, setForgotPasswordError] = useState('');
  const [forgotPasswordSuccess, setForgotPasswordSuccess] = useState('');
  const [sendingOTP, setSendingOTP] = useState(false);
  const [captchaVerified, setCaptchaVerified] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleForgotPasswordChange = (e) => {
    setForgotPasswordData({
      ...forgotPasswordData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSendOTP = async (e) => {
    e.preventDefault();
    setForgotPasswordError('');
    setForgotPasswordSuccess('');
    setSendingOTP(true);

    if (!forgotPasswordData.email || !forgotPasswordData.email.includes('@')) {
      setForgotPasswordError('Please enter a valid email address');
      setSendingOTP(false);
      return;
    }

    try {
      console.log('Sending OTP to:', forgotPasswordData.email);
      const response = await sendOTP(forgotPasswordData.email);
      console.log('OTP response:', response);
      const data = response.data;
      
      if (data.startsWith('200::')) {
        setForgotPasswordSuccess('OTP sent successfully! Please check your email (including spam folder).');
        setForgotPasswordStep(2);
      } else {
        const errorMsg = data.includes('::') ? data.split('::')[1] : data;
        setForgotPasswordError(errorMsg || 'Failed to send OTP');
      }
    } catch (error) {
      console.error('Send OTP error:', error);
      console.error('Error response:', error.response);
      let errorMessage = 'Failed to send OTP. Please try again.';
      if (error.response) {
        const responseData = error.response.data;
        if (typeof responseData === 'string') {
          errorMessage = responseData;
        } else if (responseData && typeof responseData === 'object') {
          errorMessage = responseData.message || JSON.stringify(responseData);
        } else {
          errorMessage = error.response.statusText || errorMessage;
        }
      } else if (error.message) {
        errorMessage = error.message;
      }
      // Ensure errorMessage is a string before calling includes
      const errorStr = String(errorMessage);
      const cleanMessage = errorStr.includes('::') ? errorStr.split('::')[1] : errorStr;
      setForgotPasswordError(cleanMessage);
    } finally {
      setSendingOTP(false);
    }
  };

  const handleVerifyOTPAndReset = async (e) => {
    e.preventDefault();
    setForgotPasswordError('');
    setForgotPasswordSuccess('');

    if (!forgotPasswordData.otp || forgotPasswordData.otp.length !== 6) {
      setForgotPasswordError('Please enter a valid 6-digit OTP');
      return;
    }

    if (forgotPasswordData.newPassword !== forgotPasswordData.confirmPassword) {
      setForgotPasswordError('Passwords do not match');
      return;
    }

    if (forgotPasswordData.newPassword.length < 6) {
      setForgotPasswordError('Password must be at least 6 characters long');
      return;
    }

    try {
      const response = await forgotPassword(
        forgotPasswordData.email, 
        forgotPasswordData.otp, 
        forgotPasswordData.newPassword
      );
      const data = response.data;
      
      if (data.startsWith('200::')) {
        setForgotPasswordSuccess('Password reset successfully! You can now login with your new password.');
        setTimeout(() => {
          setShowForgotPassword(false);
          setForgotPasswordStep(1);
          setForgotPasswordData({ email: '', otp: '', newPassword: '', confirmPassword: '' });
        }, 2000);
      } else {
        const errorMsg = data.includes('::') ? data.split('::')[1] : data;
        setForgotPasswordError(errorMsg || 'Failed to reset password');
      }
    } catch (error) {
      console.error('Forgot password error:', error);
      let errorMessage = error.response?.data || error.message || 'Failed to reset password. Please try again.';
      // Ensure errorMessage is a string
      if (typeof errorMessage !== 'string') {
        errorMessage = String(errorMessage);
      }
      const cleanMessage = errorMessage.includes('::') ? errorMessage.split('::')[1] : errorMessage;
      setForgotPasswordError(cleanMessage);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validate CAPTCHA
    if (!captchaVerified) {
      setError('Please complete the CAPTCHA verification.');
      return;
    }

    try {
      const response = await signin(formData);
      const data = response.data;

      if (data.startsWith('200::')) {
        const token = data.split('::')[1];
        localStorage.setItem('token', token);
        localStorage.setItem('email', formData.email);
        localStorage.setItem('isAdmin', formData.email === 'admin@gmail.com');
        onClose();
        if (formData.email === 'admin@gmail.com') {
          navigate('/admin-dashboard');
        } else {
          navigate('/user-dashboard');
        }
        if (onLoginSuccess) onLoginSuccess();
      } else {
        setError('Invalid credentials');
        setCaptchaVerified(false); // Reset CAPTCHA on error
      }
    } catch (error) {
      setError('Login failed. Please try again.');
      setCaptchaVerified(false); // Reset CAPTCHA on error
    }
  };

  if (showForgotPassword) {
    return (
      <Modal open={open} onClose={onClose} className="modal">
        <Box className="modal-content">
          <Typography variant="h5" component="h2" className="modal-title">
            Forgot Password
          </Typography>

          {forgotPasswordError && (
            <Alert severity="error" className="error-message">
              {forgotPasswordError}
            </Alert>
          )}

          {forgotPasswordSuccess && (
            <Alert severity="success" className="error-message">
              {forgotPasswordSuccess}
            </Alert>
          )}

          {forgotPasswordStep === 1 && (
            <form onSubmit={handleSendOTP} className="modal-form">
              <TextField
                fullWidth
                label="Email"
                name="email"
                type="email"
                value={forgotPasswordData.email}
                onChange={handleForgotPasswordChange}
                required
                margin="normal"
                disabled={sendingOTP}
              />

              <Button
                type="submit"
                variant="contained"
                color="primary"
                fullWidth
                className="submit-button"
                disabled={sendingOTP}
              >
                {sendingOTP ? <CircularProgress size={24} /> : 'Send OTP'}
              </Button>
            </form>
          )}

          {forgotPasswordStep === 2 && (
            <form onSubmit={handleVerifyOTPAndReset} className="modal-form">
              <TextField
                fullWidth
                label="OTP (6 digits)"
                name="otp"
                type="text"
                value={forgotPasswordData.otp}
                onChange={handleForgotPasswordChange}
                required
                margin="normal"
                inputProps={{ maxLength: 6, pattern: '[0-9]*' }}
                helperText="Enter the 6-digit OTP sent to your email"
              />

              <TextField
                fullWidth
                label="New Password"
                name="newPassword"
                type="password"
                value={forgotPasswordData.newPassword}
                onChange={handleForgotPasswordChange}
                required
                margin="normal"
              />

              <TextField
                fullWidth
                label="Confirm New Password"
                name="confirmPassword"
                type="password"
                value={forgotPasswordData.confirmPassword}
                onChange={handleForgotPasswordChange}
                required
                margin="normal"
              />

              <Button
                type="submit"
                variant="contained"
                color="primary"
                fullWidth
                className="submit-button"
              >
                Reset Password
              </Button>
            </form>
          )}

          <Box sx={{ mt: 2, textAlign: 'center' }}>
            <Link href="#" onClick={() => { 
              setShowForgotPassword(false); 
              setForgotPasswordStep(1);
              setForgotPasswordError(''); 
              setForgotPasswordSuccess('');
              setForgotPasswordData({ email: '', otp: '', newPassword: '', confirmPassword: '' });
            }}>
              Back to Login
            </Link>
          </Box>
        </Box>
      </Modal>
    );
  }

  return (
    <Modal open={open} onClose={onClose} className="modal">
      <Box className="modal-content">
        <Typography variant="h5" component="h2" className="modal-title">
          Login
        </Typography>

        {error && (
          <Alert severity="error" className="error-message">
            {error}
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="modal-form">
          <TextField
            fullWidth
            label="Email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            required
            margin="normal"
          />

          <TextField
            fullWidth
            label="Password"
            name="password"
            type="password"
            value={formData.password}
            onChange={handleChange}
            required
            margin="normal"
          />

          <Captcha 
            onVerify={setCaptchaVerified}
            error={error && !captchaVerified}
          />

          <Box sx={{ textAlign: 'right', mb: 1 }}>
            <Link href="#" onClick={(e) => { e.preventDefault(); setShowForgotPassword(true); }} sx={{ fontSize: '0.875rem' }}>
              Forgot Password?
            </Link>
          </Box>

          <Button
            type="submit"
            variant="contained"
            color="primary"
            fullWidth
            className="submit-button"
          >
            Login
          </Button>
        </form>
        <Box sx={{ mt: 2, textAlign: 'center' }}>
          <Link href="#" onClick={() => { onClose(); setTimeout(() => { document.querySelector('.signup-btn')?.click(); }, 200); }}>
            Don't have an account? Sign Up
          </Link>
        </Box>
      </Box>
    </Modal>
  );
};

export default LoginModal; 