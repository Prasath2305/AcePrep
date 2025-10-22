import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Log that the API route is being called
  console.log('🚀 API route called via Pages Router');
  console.log('📝 Request method:', req.method);
  console.log('📝 Request headers:', req.headers);

  if (req.method !== 'POST') {
    console.log('❌ Method not allowed:', req.method);
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { type, userData, userName } = req.body;
    console.log('📥 Received request body:', { type, userName });

    // Validate required fields
    if (!type || !userName) {
      console.error('❌ Missing required fields');
      return res.status(400).json({ 
        error: 'Missing required fields: type and userName are required' 
      });
    }

    const API_KEY = process.env.GEMINI_API_KEY;
    
    if (!API_KEY) {
      console.error('❌ GEMINI_API_KEY is not set');
      return res.status(500).json({ 
        error: 'API configuration error - GEMINI_API_KEY not found in environment variables' 
      });
    }

    console.log('🔑 API Key found, generating prompt...');

    const prompt = getPrompt(type, userData, userName);
    console.log('📝 Generated prompt length:', prompt.length);

    const apiUrl = `https://generativelanguage.googleapis.com/v1/models/gemini-pro:generateContent?key=${API_KEY}`;
    console.log('🌐 Calling Gemini API...');

    const geminiResponse = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: prompt
          }]
        }],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 1024,
        }
      }),
    });

    console.log('📨 Gemini API response status:', geminiResponse.status);

    if (!geminiResponse.ok) {
      const errorText = await geminiResponse.text();
      console.error('❌ Gemini API error:', errorText);
      return res.status(500).json({ 
        error: `AI service error: ${geminiResponse.status} ${geminiResponse.statusText}` 
      });
    }

    const data = await geminiResponse.json();
    console.log('✅ Gemini API success response received');

    if (!data.candidates || !data.candidates[0]?.content?.parts?.[0]?.text) {
      console.error('❌ Invalid response format from Gemini API:', data);
      return res.status(500).json({ 
        error: 'Invalid response format from AI service' 
      });
    }

    const generatedText = data.candidates[0].content.parts[0].text.trim();
    console.log('📄 Generated text length:', generatedText.length);
    console.log('📄 Generated text preview:', generatedText.substring(0, 100) + '...');

    // Success response
    res.status(200).json({ 
      success: true,
      content: generatedText,
      type 
    });
    
  } catch (error) {
    console.error('💥 Error in generate-content API:', error);
    
    res.status(500).json({ 
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
      timestamp: new Date().toISOString()
    });
  }
}

function getPrompt(type: string, userData: any, userName: string): string {
  // Simple prompts for testing first
  switch (type) {
    case 'summary':
      return `Write a professional 2-3 sentence summary for ${userName} as a software developer. Focus on technical skills and career objectives.`;
    
    case 'skills':
      return `Generate a comma-separated list of technical skills for a software developer named ${userName}. Include programming languages, frameworks, and tools.`;
    
    case 'project':
      return `Write a 2-3 sentence description for a software development project by ${userName}. Describe the technologies used and the project's purpose.`;
    
    default:
      return `Write professional content for ${userName}'s resume.`;
  }
}