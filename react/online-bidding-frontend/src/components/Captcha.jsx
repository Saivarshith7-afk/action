import { useState, useEffect, useRef } from 'react';
import { Box, TextField, Typography, IconButton } from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';

const Captcha = ({ onVerify, error }) => {
  const canvasRef = useRef(null);
  const [captchaText, setCaptchaText] = useState('');
  const [userInput, setUserInput] = useState('');

  const generateCaptcha = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;

    // Clear canvas
    ctx.clearRect(0, 0, width, height);

    // Generate random 5-character alphanumeric code
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let text = '';
    for (let i = 0; i < 5; i++) {
      text += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setCaptchaText(text);

    // Background
    ctx.fillStyle = '#f0f0f0';
    ctx.fillRect(0, 0, width, height);

    // Add noise lines
    ctx.strokeStyle = '#cccccc';
    for (let i = 0; i < 5; i++) {
      ctx.beginPath();
      ctx.moveTo(Math.random() * width, Math.random() * height);
      ctx.lineTo(Math.random() * width, Math.random() * height);
      ctx.stroke();
    }

    // Draw text with distortion
    ctx.fillStyle = '#333333';
    ctx.font = 'bold 28px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    for (let i = 0; i < text.length; i++) {
      const x = (width / 6) * (i + 1);
      const y = height / 2 + (Math.random() - 0.5) * 10;
      const rotation = (Math.random() - 0.5) * 0.3;

      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(rotation);
      ctx.fillText(text[i], 0, 0);
      ctx.restore();
    }

    // Add noise dots
    ctx.fillStyle = '#999999';
    for (let i = 0; i < 50; i++) {
      ctx.fillRect(
        Math.random() * width,
        Math.random() * height,
        1,
        1
      );
    }
  };

  useEffect(() => {
    generateCaptcha();
  }, []);

  useEffect(() => {
    if (userInput.length === 5) {
      const isCorrect = userInput.toUpperCase() === captchaText.toUpperCase();
      onVerify(isCorrect);
    } else {
      onVerify(false);
    }
  }, [userInput, captchaText, onVerify]);

  return (
    <Box sx={{ mb: 2 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
        <Box sx={{ position: 'relative' }}>
          <canvas
            ref={canvasRef}
            width={180}
            height={50}
            style={{
              border: '2px solid #ddd',
              borderRadius: '4px',
              cursor: 'pointer',
            }}
            onClick={generateCaptcha}
          />
          <IconButton
            size="small"
            onClick={generateCaptcha}
            sx={{
              position: 'absolute',
              right: -40,
              top: '50%',
              transform: 'translateY(-50%)',
            }}
            title="Refresh CAPTCHA"
          >
            <RefreshIcon fontSize="small" />
          </IconButton>
        </Box>
      </Box>
      <TextField
        fullWidth
        label="Enter CAPTCHA"
        value={userInput}
        onChange={(e) => {
          const value = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 5);
          setUserInput(value);
        }}
        required
        size="small"
        error={error}
        helperText={error ? 'CAPTCHA is incorrect' : 'Click on the image to refresh'}
        inputProps={{
          style: {
            textTransform: 'uppercase',
            letterSpacing: '4px',
            fontFamily: 'monospace',
            fontSize: '18px',
            fontWeight: 'bold',
          },
        }}
      />
    </Box>
  );
};

export default Captcha;

