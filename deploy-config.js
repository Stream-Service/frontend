const fs = require('fs');

function cleanUrl(url) {
    if (!url) return "ERROR_MISSING_IP";
    // This removes http:// or https:// if you accidentally typed it
    return url.replace(/^https?:\/\//, '');
}

try {
    const template = fs.readFileSync('./_redirects.template', 'utf8');
    
    // We clean the URLs here to prevent "http://http://"
    const result = template
        .replace("AUTH_IP_PLACEHOLDER", cleanUrl(process.env.AUTH_URL))
        .replace("POSTS_IP_PLACEHOLDER", cleanUrl(process.env.POST_URL)) 
        .replace("STREAM_IP_PLACEHOLDER", cleanUrl(process.env.STREAM_URL))
        .replace("SEARCH_IP_PLACEHOLDER", cleanUrl(process.env.SEARCH_URL))
        .replace("FOLLOW_IP_PLACEHOLDER", cleanUrl(process.env.FOLLOW_URL))
        .replace("COMPRESSION_IP_PLACEHOLDER", cleanUrl(process.env.COMPRESSION_URL))
        .replace("NOTIFICATION_IP_PLACEHOLDER", cleanUrl(process.env.NOTIFICATION_URL));
        
    
    fs.writeFileSync('./_redirects', result);
    console.log("✅ Private _redirects generated correctly!");
} catch (err) {
    console.error("❌ Error:", err.message);
}

// Keep your config.js logic the same
const configContent = `window.CONFIG = {
    post: "/api",
     
};`;
fs.writeFileSync('./static/js/config.js', configContent);