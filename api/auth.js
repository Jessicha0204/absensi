const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// In-memory storage untuk demo (dalam production gunakan database)
let users = {
  'admin': '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', // password: admin123
  'user1': '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', // password: password1
  'test': '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi'   // password: test123
};

// Root endpoint
app.get('/api', (req, res) => {
  res.json({ 
    message: 'Flutter Auth API berjalan!',
    timestamp: new Date().toISOString(),
    totalUsers: Object.keys(users).length
  });
});

// Register endpoint
app.post('/api/register', async (req, res) => {
  try {
    const { username, password } = req.body;

    // Validasi input
    if (!username || !password) {
      return res.status(400).json({ 
        success: false, 
        message: 'Username dan password harus diisi' 
      });
    }

    // Cek username sudah ada
    if (users[username]) {
      return res.status(409).json({ 
        success: false, 
        message: 'Username sudah digunakan' 
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    users[username] = hashedPassword;

    res.status(201).json({ 
      success: true, 
      message: 'Registrasi berhasil',
      username: username,
      totalUsers: Object.keys(users).length
    });

  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
});

// Login endpoint  
app.post('/api/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    // Validasi input
    if (!username || !password) {
      return res.status(400).json({ 
        success: false, 
        message: 'Username dan password harus diisi' 
      });
    }

    // Cek username ada
    if (!users[username]) {
      return res.status(401).json({ 
        success: false, 
        message: 'Username tidak ditemukan' 
      });
    }

    // Verify password
    const isValid = await bcrypt.compare(password, users[username]);
    
    if (!isValid) {
      return res.status(401).json({ 
        success: false, 
        message: 'Password salah' 
      });
    }

    res.json({ 
      success: true, 
      message: 'Login berhasil',
      username: username
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
});

// Get users endpoint
app.get('/api/users', (req, res) => {
  const userList = Object.keys(users).map(username => ({
    username: username
  }));

  res.json({ 
    success: true, 
    total: userList.length,
    users: userList 
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = app;