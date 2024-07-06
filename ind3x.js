// Use dynamic import to load node-fetch
import('node-fetch').then((fetch) => {
    const express = require('express');
    const app = express();
    require('dotenv').config();
    const PORT = process.env.PORT || 80;

    // Middleware to get client's IP address
    app.use((req, res, next) => {
        req.client_ip = req.headers['x-real-ip'] || req.socket.remoteAddress;
        next();
    });

    // Endpoint to handle /api/hello
    app.get('/api/hello', async (req, res) => {
        const visitor_name = req.query.visitor_name || 'Guest';
        const client_ip = req.client_ip;

        try {
            const geo_api_key = process.env.GEO_API_KEY;
            const geo_api_endpoint = `https://api.ipgeolocation.io/ipgeo?apiKey=${geo_api_key}&ip=${client_ip}`;

            const response = await fetch.default(geo_api_endpoint);
            if (!response.ok) {
                console.error('Error fetching location data. Status:', response.status);
                return res.status(response.status).json({ error: 'Failed to fetch location data' });
            }

            const data = await response.json();
            const location = data.city;
            const temperature = data.temperature;

            const greeting = `Hello, ${visitor_name}!, the temperature is ${temperature} degrees Celsius in ${location}`;

            return res.json({
                client_ip: client_ip,
                location: location,
                greeting: greeting
            });
        } catch (error) {
            console.error('Exception occurred:', error);
            return res.status(500).json({ error: 'Failed to fetch location data' });
        }
    });

    // Start the server
    app.listen(PORT, () => {
        console.log(`Server is running on http://localhost:${PORT}/api/hello`);
    });
}).catch((err) => {
    console.error('Failed to import node-fetch:', err);
});
module.exports = app;