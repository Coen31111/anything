
const express = require('express');
const fs = require('fs').promises;
const path = require('path');
const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(express.json());
app.use(express.static('.'));

// Ensure data directory exists
const dataDir = path.join(__dirname, 'data');
fs.mkdir(dataDir, { recursive: true }).catch(console.error);

// API endpoints for data storage
app.post('/api/save/:key', async (req, res) => {
    try {
        const { key } = req.params;
        const data = req.body;
        const filePath = path.join(dataDir, `${key}.json`);
        
        await fs.writeFile(filePath, JSON.stringify(data, null, 2));
        console.log(`Saved ${key} to file`);
        res.json({ success: true, message: `${key} saved successfully` });
    } catch (error) {
        console.error('Error saving file:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

app.get('/api/load/:key', async (req, res) => {
    try {
        const { key } = req.params;
        const filePath = path.join(dataDir, `${key}.json`);
        
        const data = await fs.readFile(filePath, 'utf8');
        const parsedData = JSON.parse(data);
        console.log(`Loaded ${key} from file`);
        res.json(parsedData);
    } catch (error) {
        if (error.code === 'ENOENT') {
            // File doesn't exist, return null
            res.status(404).json(null);
        } else {
            console.error('Error loading file:', error);
            res.status(500).json({ success: false, error: error.message });
        }
    }
});

app.delete('/api/clear/:key', async (req, res) => {
    try {
        const { key } = req.params;
        const filePath = path.join(dataDir, `${key}.json`);
        
        await fs.unlink(filePath);
        console.log(`Cleared ${key} file`);
        res.json({ success: true, message: `${key} cleared successfully` });
    } catch (error) {
        if (error.code === 'ENOENT') {
            // File doesn't exist, that's fine
            res.json({ success: true, message: 'File already cleared' });
        } else {
            console.error('Error clearing file:', error);
            res.status(500).json({ success: false, error: error.message });
        }
    }
});

// Serve index.html for all other routes
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
    console.log(`MedievalMC server running on port ${PORT}`);
    console.log('Data will be saved to JSON files in the data directory');
});
