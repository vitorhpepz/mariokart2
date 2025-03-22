const express = require('express');
const path = require('path');
const app = express();

// Serve static files from the root directory
app.use(express.static(__dirname));

// Handle all routes by serving index.html
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

const startServer = async (port = 3000) => {
    try {
        await app.listen(port);
        console.log(`Server running at http://localhost:${port}`);
    } catch (error) {
        if (error.code === 'EADDRINUSE') {
            console.log(`Port ${port} is busy, trying ${port + 1}`);
            await startServer(port + 1);
        } else {
            console.error('Error starting server:', error);
        }
    }
};

startServer(); 