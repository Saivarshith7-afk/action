import axios from 'axios';

// Use relative URL for Kubernetes deployment (nginx will proxy to backend)
// For local dev: use http://localhost:8080
// In Kubernetes, use empty string so requests go to same origin, nginx proxies to backend
const API_BASE_URL = import.meta.env?.VITE_API_URL || '';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 second timeout
});

// Add response interceptor for debugging
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', {
      message: error.message,
      url: error.config?.url,
      baseURL: error.config?.baseURL,
      status: error.response?.status,
      data: error.response?.data,
    });
    return Promise.reject(error);
  }
);

// Add token to requests if available
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth APIs
export const signup = (userData) => api.post('/users/signup', userData);
export const signin = (userData) => api.post('/users/signin', userData);
export const getFullname = (token) => api.post('/users/getfullname', { csrid: token });
export const sendOTP = (email) => api.post('/users/send-otp', { email });
export const forgotPassword = (email, otp, newPassword) => api.post('/users/forgot-password', { email, otp, newPassword });

// Product APIs
export const getAllProducts = () => api.get('/products/all');
export const getProductsBySeller = (email) => api.get(`/products/seller/${email}`);
export const getProductById = (id) => api.get(`/products/${id}`);
export const addProduct = (formData) => {
  // For multipart/form-data, we need to set the content type header correctly
  return api.post('/products/add', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
};
export const updateProduct = (productData) => api.put('/products/update', productData);
export const deleteProduct = (id) => api.delete(`/products/delete/${id}`);

// Bid APIs
export const placeBid = (bidData) => api.post('/bid/place', bidData);
export const getBidsForProduct = (productId) => api.get(`/bid/getbids?productId=${productId}`);
export const getHighestBid = (productId) => api.get(`/bid/highest?productId=${productId}`);

// Order APIs
export const placeOrder = (orderData) => api.post('/orders/place', orderData);
export const getOrdersByUser = (email) => api.post('/orders/getbyuser', { email });
export const getAllOrders = () => api.get('/orders/all');
export const cancelOrder = (orderId) => api.post('/orders/cancel', { orderId });

// Wallet APIs
export const addMoney = (email, amount) => api.post(`/wallet/add?email=${email}&amount=${amount}`);
export const getBalance = (email) => api.get(`/wallet/balance?email=${email}`);
export const deductBalance = (email, amount) => api.post(`/wallet/deduct?email=${email}&amount=${amount}`);
export const creditBalance = (email, amount) => api.post(`/wallet/credit?email=${email}&amount=${amount}`);

// Transaction APIs
export const recordTransaction = (transactionData) => api.post('/transaction/record', transactionData);
export const getUserTransactions = (email) => api.get(`/transaction/user?email=${email}`);
export const getAllTransactions = () => api.get('/transaction/all');
export const getTransactionsByUser = (email) => {
  return api.get(`/transaction/user?email=${encodeURIComponent(email)}`);
};

// Analytics APIs
export const getDashboardSummary = () => api.get('/admin/analytics/summary');

// Category APIs
export const getAllCategories = () => api.get('/categories/all');
export const addCategory = (categoryData) => api.post('/categories/add', categoryData);
export const updateCategory = (categoryData) => api.put('/categories/update', categoryData);
export const deleteCategory = (id) => api.delete(`/categories/delete/${id}`);

// Delivery APIs
export const createDelivery = (deliveryData) => api.post('/delivery/create', deliveryData);
export const getAllDeliveries = () => api.get('/delivery/all');
export const getDeliveryById = (id) => api.get(`/delivery/${id}`);
export const updateDeliveryStatus = (id, status) => api.post(`/delivery/updatestatus?id=${id}&status=${status}`);

// Notification APIs
export const getUserNotifications = (email) => api.get(`/notifications/user?email=${email}`);
export const getUnreadNotifications = (email) => api.get(`/notifications/unread?email=${email}`);
export const getUnreadCount = (email) => api.get(`/notifications/unread-count?email=${email}`);
export const markNotificationRead = (id) => api.post(`/notifications/mark-read?id=${id}`);
export const markAllNotificationsRead = (email) => api.post('/notifications/mark-all-read', { email });

// Chat APIs
export const sendChatMessage = (message, email) => api.post('/chat/message', { message, email });

export default api; 