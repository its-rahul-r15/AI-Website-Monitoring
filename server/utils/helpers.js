// JWT token generate karna
const jwt = require('jsonwebtoken');

const generateToken = (userId) => {
  return jwt.sign(
    { id: userId }, 
    process.env.JWT_SECRET || 'fallback_secret',
    { expiresIn: '30d' }
  );
};

// Response time check karna
const checkResponseTime = async (url) => {
  try {
    const start = Date.now();
    const response = await fetch(url, { method: 'HEAD' });
    const end = Date.now();
    
    return {
      responseTime: end - start,
      status: response.status
    };
  } catch (error) {
    return {
      responseTime: null,
      status: null,
      error: error.message
    };
  }
};

// Simple SEO analysis
const analyzeSEO = (html) => {
  // Yeh basic checks hain, baad mein improve karenge
  const issues = [];
  
  if (!html.includes('<title>')) {
    issues.push('Missing title tag');
  }
  
  if (!html.includes('meta name="description"')) {
    issues.push('Missing meta description');
  }
  
  if (!html.includes('<h1>')) {
    issues.push('Missing H1 tag');
  }
  
  return issues;
};

module.exports = {
  generateToken,
  checkResponseTime,
  analyzeSEO
};