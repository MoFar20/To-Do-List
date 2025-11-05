// Email Configuration - Node.js Backend
// Backend server must be running on http://localhost:3000

const EMAIL_API_URL = 'http://localhost:3000/api/send-verification-code';

// Send verification code email via backend
async function sendVerificationEmail(toEmail, code) {
  try {
    const response = await fetch(EMAIL_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: toEmail,
        code: code
      })
    });

    if (!response.ok) {
      const error = await response.json();
      console.error('Email API error:', error);
      return false;
    }

    const result = await response.json();
    console.log('✅ Email sent successfully:', result);
    return result.success;
  } catch (error) {
    console.error('❌ Failed to send email:', error);
    // Check if backend is running
    if (error.message.includes('fetch')) {
      console.error('⚠️ Backend server not running. Start with: npm start');
    }
    return false;
  }
}

// Export for use in auth.js
window.sendVerificationEmail = sendVerificationEmail;
