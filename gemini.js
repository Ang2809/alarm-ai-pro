export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    // Vercel inyectará esta variable si la configuras en el Dashboard
    const apiKey = process.env.GEMINI_API_KEY;
    
    if (!apiKey) {
        return res.status(500).json({ error: 'API Key no configurada en Vercel (Environment Variables)' });
    }

    const { prompt } = req.body;

    try {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts: [{ text: prompt }] }],
                generationConfig: {
                    temperature: 0.7,
                    responseMimeType: "application/json"
                }
            })
        });

        const data = await response.json();
        
        if (!response.ok) {
            return res.status(response.status).json({ error: data.error?.message || 'Error interno de Gemini API' });
        }

        let responseText = data.candidates[0].content.parts[0].text;
        responseText = responseText.replace(/```json/gi, '').replace(/```/g, '').trim();
        
        return res.status(200).json(JSON.parse(responseText));
    } catch (error) {
        console.error("Error en Vercel Serverless Function:", error);
        return res.status(500).json({ error: 'Error interno conectando con Google Gemini' });
    }
}
