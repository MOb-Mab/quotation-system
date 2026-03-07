// backend/routes/auth.js
const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');

router.post('/login', (req, res) => {
  const { username, password } = req.body;

  let role = null;

  if (
    username === process.env.ADMIN_USERNAME &&
    password === process.env.ADMIN_PASSWORD
  ) {
    role = 'admin';
  } else if (
    username === process.env.VIEWER_USERNAME &&
    password === process.env.VIEWER_PASSWORD
  ) {
    role = 'viewer';
  }

  if (!role) {
    return res.status(401).json({
      success: false,
      message: 'ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง',
    });
  }

  const token = jwt.sign(
    { username, role },
    process.env.JWT_SECRET,
    { expiresIn: '8h' }
  );

  res.json({
    success: true,
    token,
    user: { username, role },
  });
});

module.exports = router;