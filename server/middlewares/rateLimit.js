import rateLimit from 'express-rate-limit';

// Giới hạn đăng nhập
export const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 phút
  max: 5, // Tối đa 5 lần đăng nhập
  message: 'Quá nhiều lần đăng nhập không thành công. Vui lòng thử lại sau 15 phút.',
  standardHeaders: true,
  legacyHeaders: false
});

// Giới hạn đăng ký
export const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 giờ
  max: 5, // Tối đa 10 lần đăng ký
  message: 'Quá nhiều yêu cầu đăng ký. Vui lòng thử lại sau.',
  standardHeaders: true,
  legacyHeaders: false
});