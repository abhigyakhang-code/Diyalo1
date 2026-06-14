import express from 'express';
import nodemailer from 'nodemailer';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();

// Middlewares
app.use(cors()); // CORS allow garne
app.use(express.json());

// Transporter (Fix: connectionTimeout added)
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'abhigyakhanga365@gmail.com',
    pass: 'mlwh gtkv wjnr qhpy' // App Password fix hunuparyo
  },
  connectionTimeout: 5000 // 5 seconds wait
});

app.post('/api/send-otp', async (req, res) => {
  const { to_email, otp } = req.body;
  
  if (!to_email || !otp) {
    return res.status(400).json({ success: false, error: "Missing data" });
  }

  try {
    await transporter.sendMail({
      from: '"Hamro Job Portal" <abhigyakhanga365@gmail.com>',
      to: to_email,
      subject: 'तपाईंको भेरिफिकेशन कोड - Hamro Job Portal',
      html: `
        <div style="font-family: 'Segoe UI', sans-serif; max-width: 500px; margin: auto; border: 1px solid #e0e0e0; border-radius: 15px; overflow: hidden; box-shadow: 0 4px 15px rgba(0,0,0,0.1);">
          <div style="background-color: #059669; padding: 25px; text-align: center; color: white;">
            <h1 style="margin: 0; font-size: 24px;">Hamro Job Portal</h1>
          </div>
          <div style="padding: 40px 30px; text-align: center; background: #ffffff;">
            <p style="color: #333; font-size: 18px; margin-bottom: 20px;">नमस्ते! तपाईंको भेरिफिकेशन कोड:</p>
            <div style="font-size: 40px; font-weight: 800; color: #059669; letter-spacing: 8px; margin: 20px 0; background: #f0fdf4; padding: 15px; border-radius: 10px;">${otp}</div>
            <p style="color: #666; font-size: 14px; margin-top: 20px;">यो कोड १० मिनेटको लागि मात्र मान्य छ।</p>
          </div>
          <div style="background-color: #f8fafc; padding: 20px; text-align: center; font-size: 12px; color: #94a3b8;">
            © ${new Date().getFullYear()} Hamro Job Portal. सबै अधिकार सुरक्षित।
          </div>
        </div>
      `
    });
    console.log(`✅ OTP ${otp} successfully sent to ${to_email}`);
    res.status(200).json({ success: true });
  } catch (error) {
    console.error("❌ Email error:", error.message);
    res.status(500).json({ success: false, error: error.message });
  }
});

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GROQ_API_KEY = process.env.GROQ_API_KEY || process.env.GEMINI_API_KEY; // Support both var names

if (!OPENAI_API_KEY && !GEMINI_API_KEY && !GROQ_API_KEY) {
  console.warn('⚠️ No API key configured. Create a .env file with OPENAI_API_KEY, GEMINI_API_KEY, or GROQ_API_KEY.');
}

app.post('/api/career-chat', async (req, res) => {
  const { message, language } = req.body;

  if (!message || typeof message !== 'string') {
    return res.status(400).json({ error: "Missing message" });
  }

  if (!OPENAI_API_KEY && !GEMINI_API_KEY && !GROQ_API_KEY) {
    return res.status(500).json({ error: "No AI API key configured. Add OPENAI_API_KEY, GEMINI_API_KEY, or GROQ_API_KEY to your .env file." });
  }

  try {
    let data;
    let text;

    // Use Groq if key starts with gsk_ (Groq key format)
    if (GROQ_API_KEY && GROQ_API_KEY.startsWith('gsk_')) {
      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${GROQ_API_KEY}`,
        },
        body: JSON.stringify({
          model: 'llama-3.3-70b-versatile',
          messages: [
            {
              role: 'system',
              content: 'You are a friendly career advisor for Nepali users. Only answer questions about jobs, training, resume building, interview preparation, and career guidance. Keep answers practical and respectful.'
            },
            {
              role: 'user',
              content: `${language === 'ne' ? 'Nepali:' : 'English:'} ${message}`
            }
          ],
          max_tokens: 500,
          temperature: 0.8,
        }),
      });

      data = await response.json();
      if (!response.ok) {
        const errorMessage = data?.error?.message || data?.error || 'Groq request failed';
        return res.status(response.status).json({ error: errorMessage });
      }

      text = data?.choices?.[0]?.message?.content || 'Sorry, I could not get a response from Groq.';
    } else if (GEMINI_API_KEY && !GROQ_API_KEY?.startsWith('gsk_')) {
      const endpoint = `https://generativelanguage.googleapis.com/v1/models/gemini-pro:generateContent?key=${encodeURIComponent(GEMINI_API_KEY)}`;
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: `${language === 'ne' ? 'Nepali:' : 'English:'} ${message}`
                }
              ]
            }
          ],
          generationConfig: {
            temperature: 0.8,
            maxOutputTokens: 500
          }
        }),
      });

      data = await response.json();
      if (!response.ok) {
        const errorMessage = data?.error?.message || data?.error || 'Gemini request failed';
        return res.status(response.status).json({ error: errorMessage });
      }

      text = data?.candidates?.[0]?.content?.parts?.[0]?.text || 'Sorry, I could not get a response from Gemini.';
    } else {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${OPENAI_API_KEY}`,
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [
            {
              role: 'system',
             content: "तपाईं Diyalo AI हुनुहुन्छ — नेपालका अदक्ष/सिमित आय भएका कामदारहरूका लागि मात्र करियर सहायक। केवल काम, तालिम, सिप विकास, CV/रिज्युमे, अन्तर्वार्ता तयारी, र वैदेशिक रोजगार (खाडी, मलेसिया, कोरिया) सम्बन्धी प्रश्नको मात्र जवाफ दिनुहोस्। अन्य कुनै विषय (कोडिंग, राजनीति, मनोरञ्जन, सामान्य ज्ञान) सोधिएमा भन्नुहोस् 'माफ गर्नुहोस्, म केवल करियर र रोजगार सम्बन्धी प्रश्नमा मात्र मदत गर्न सक्छु।' सधैं सरल नेपाली भाषामा छोटो र व्यावहारिक जवाफ दिनुहोस्। ** जस्ता markdown चिन्ह प्रयोग नगर्नुहोस्, सादा पाठमा लेख्नुहोस्।"
            },
            {
              role: 'user',
              content: `${language === 'ne' ? 'Nepali:' : 'English:'} ${message}`
            }
          ],
          max_tokens: 500,
          temperature: 0.8,
        }),
      });

      data = await response.json();
      if (!response.ok) {
        const errorMessage = data?.error?.message || data?.error || 'OpenAI request failed';
        return res.status(response.status).json({ error: errorMessage });
      }

      text = data?.choices?.[0]?.message?.content || 'Sorry, I could not get a response from the AI.';
    }

    res.json({ text });
  } catch (error) {
    console.error('AI request failed:', error);
    res.status(500).json({ error: 'AI request failed' });
  }
});

app.listen(5000, '0.0.0.0', () => {
  console.log("🚀 Server is running smoothly on http://0.0.0.0:5000");
});