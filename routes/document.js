const express = require('express');
const multer = require('multer');
const { Document } = require('../models'); // Import model Document

const router = express.Router();

// Cấu hình multer để lưu trữ file
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/'); // Đường dẫn thư mục để lưu trữ file
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});
const upload = multer({ storage });

// API upload file
router.post('/upload', upload.single('file'), async (req, res) => {
  try {
    const { chatId, userId } = req.body;

    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    // Lưu thông tin file vào cơ sở dữ liệu
    const newDocument = await Document.create({
      chatId,
      userId,
      filePath: req.file.path,
    });

    res.status(201).json({ message: 'File uploaded successfully', document: newDocument });
  } catch (error) {
    console.error('Error uploading file:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

module.exports = router;
