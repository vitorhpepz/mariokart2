import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = 3000;

// Disable caching for development
app.use((req, res, next) => {
    res.set('Cache-Control', 'no-store');
    next();
});

// Serve static files from the root directory
app.use(express.static(__dirname));

// Serve index.html for the root route
app.get('/', (req, res) => {
    let html = fs.readFileSync(path.join(__dirname, 'index.html'), 'utf8');
    // Add timestamp to main.js script
    html = html.replace('main.js', `main.js?t=${Date.now()}`);
    res.send(html);
});

function startServer() {
    app.listen(port, () => {
        console.log(`Server running at http://localhost:${port}`);
    });
}

startServer(); 