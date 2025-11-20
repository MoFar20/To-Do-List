const express = require('express');
const nodemailer = require('nodemailer');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Serve static files (HTML, CSS, JS) from the current directory
app.use(express.static(__dirname));

// Handle the root URL request (serve the HTML file)
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Create email transporter
let transporter;
if (process.env.NODE_ENV === 'test') {
  // Non-network transport for tests (no real emails sent)
  transporter = nodemailer.createTransport({
    streamTransport: true,
    newline: 'unix',
    buffer: true
  });
} else {
  transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD  // Use App Password, not regular password
    }
  });
}

// Verify transporter configuration
if (process.env.NODE_ENV !== 'test') {
  transporter.verify((error, success) => {
    if (error) {
      console.error('❌ Email configuration error:', error);
    } else {
      console.log('✅ Email server is ready to send messages');
    }
  });
}

// Send verification code endpoint
app.post('/api/send-verification-code', async (req, res) => {
  const { email, code } = req.body;

  // Validation
  if (!email || !code) {
    return res.status(400).json({ 
      success: false, 
      error: 'Email and code are required' 
    });
  }

  // Email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ 
      success: false, 
      error: 'Invalid email format' 
    });
  }

  // Code validation (6 digits)
  if (!/^\d{6}$/.test(code)) {
    return res.status(400).json({ 
      success: false, 
      error: 'Invalid verification code format' 
    });
  }

  const mailOptions = {
    from: `"To-Do Liste" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: 'Ihr Bestätigungscode für To-Do Liste',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body {
            font-family: 'Segoe UI', Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
          }
          .container {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            padding: 40px;
            border-radius: 15px;
            box-shadow: 0 10px 30px rgba(0,0,0,0.2);
          }
          .content {
            background: white;
            padding: 30px;
            border-radius: 10px;
          }
          h1 {
            color: #2c3e50;
            margin-top: 0;
          }
          .code-box {
            background: #f8f9fa;
            border: 3px solid #3498db;
            border-radius: 10px;
            padding: 20px;
            text-align: center;
            margin: 30px 0;
          }
          .code {
            font-size: 36px;
            font-weight: bold;
            color: #3498db;
            letter-spacing: 8px;
            font-family: 'Courier New', monospace;
          }
          .warning {
            background: #fff3cd;
            border-left: 4px solid #ffc107;
            padding: 15px;
            margin: 20px 0;
            border-radius: 5px;
          }
          .footer {
            margin-top: 30px;
            padding-top: 20px;
            border-top: 1px solid #e1e5e9;
            font-size: 14px;
            color: #666;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="content">
            <h1>📝 Passwort zurücksetzen</h1>
            <p>Hallo,</p>
            <p>Sie haben eine Passwort-Zurücksetzung für Ihr To-Do Liste Konto angefordert.</p>
            
            <div class="code-box">
              <p style="margin: 0 0 10px 0; font-size: 14px; color: #666;">Ihr Bestätigungscode:</p>
              <div class="code">${code}</div>
            </div>

            <div class="warning">
              <strong>⚠️ Wichtig:</strong> Dieser Code ist nur 5 Minuten gültig.
            </div>

            <p>Geben Sie diesen Code auf der Webseite ein, um Ihr Passwort zurückzusetzen.</p>
            
            <p style="margin-top: 30px;">
              <strong>Falls Sie diese Anfrage nicht gestellt haben:</strong><br>
              Ignorieren Sie diese E-Mail. Ihr Passwort bleibt unverändert.
            </p>

            <div class="footer">
              <p>Mit freundlichen Grüßen,<br>
              <strong>ClearFocus Solutions Team</strong></p>
              <p style="font-size: 12px; color: #999;">
                Diese E-Mail wurde automatisch generiert. Bitte antworten Sie nicht darauf.
              </p>
            </div>
          </div>
        </div>
      </body>
      </html>
    `,
    // Plain text fallback
    text: `
Passwort zurücksetzen

Hallo,

Sie haben eine Passwort-Zurücksetzung für Ihr To-Do Liste Konto angefordert.

Ihr Bestätigungscode: ${code}

Dieser Code ist nur 5 Minuten gültig.

Geben Sie diesen Code auf der Webseite ein, um Ihr Passwort zurückzusetzen.

Falls Sie diese Anfrage nicht gestellt haben, ignorieren Sie diese E-Mail.

Mit freundlichen Grüßen,
ClearFocus Solutions Team
    `.trim()
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Email sent successfully:', info.messageId);
    console.log(`   To: ${email}`);
    console.log(`   Code: ${code}`);
    
    res.json({ 
      success: true, 
      messageId: info.messageId 
    });
  } catch (error) {
    console.error('❌ Email sending failed:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to send email. Please try again.' 
    });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString() 
  });
});

// Export app for testing; only listen when run directly
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`
╔════════════════════════════════════════════╗
║   🚀 Email Server Running                  ║
║   📧 Port: ${PORT}                         ║
║   🌐 http://localhost:${PORT}              ║
╚════════════════════════════════════════════╝
    `);
  });
}

module.exports = { app };
