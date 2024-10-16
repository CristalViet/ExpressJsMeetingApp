const express = require('express');
const http = require('http');
const cors = require('cors'); // Import cors middleware


const app = express();
app.use(cors());

const server = http.createServer(app);

// Middleware để parse JSON từ body request
app.use(express.json());

// Endpoint nhận POST request từ client
app.post('/confirm', (req, res) => {
  const { message } = req.body; // Nhận dữ liệu từ body của request

  console.log('Dữ liệu nhận được từ client:', message);

  // Gửi phản hồi về client
  res.json({ confirmation: `Server đã nhận: ${message} `});
});
app.get('/', (req, res) => {
   
  
    console.log('Dữ liệu nhận được từ client:');

    // Gửi phản hồi về client
    res.json({ confirmation: `Server đã nhận: } `});
  });

// Khởi động server
const PORT = 3005;
server.listen(PORT, () => {
  console.log(`Server đang chạy tại http://localhost:${PORT}`);
});
