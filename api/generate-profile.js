// This file must be saved as api/generate-profile.js in your repository.
// It uses Node.js and the 'node-fetch' library (available in Vercel runtime).

// The Gemini API Key MUST be stored as an environment variable in your Vercel project settings
// named GEMINI_API_KEY.

const API_KEY = "AIzaSyAqNcfQWSYyufS8Z2j732rxJupHRSt0u_M";
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=';

/**
 * Handles the POST request from the client-side survey form.
 */
module.exports = async (req, res) => {
    // 1. Check for API Key
    if (!API_KEY) {
        return res.status(500).json({ 
            error: "Server configuration error: GEMINI_API_KEY environment variable is not set." 
        });
    }

    // 2. Parse the request body (the survey answers)
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }
    
    let payload;
    try {
        // Vercel handles body parsing if the Content-Type is application/json
        payload = req.body; 
    } catch (e) {
        return res.status(400).json({ error: 'Invalid JSON payload.' });
    }

    // 3. Forward the request securely to the Gemini API
    try {
        const response = await fetch(GEMINI_API_URL + API_KEY, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        const result = await response.json();

        if (response.ok) {
            const generatedText = result.candidates?.[0]?.content?.parts?.[0]?.text;
            
            // 4. Send the generated text back to the client
            res.status(200).json({ profile: generatedText });
        } else {
            // Forward API errors back to the client
            res.status(response.status).json({ error: result.error || 'Gemini API call failed.' });
        }

    } catch (error) {
        console.error('Proxy Error:', error);
        res.status(500).json({ error: 'Internal Server Error during AI generation.' });
    }
};
