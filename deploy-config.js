const fs = require('fs');

const template = fs.readFileSync('./_redirects.template', 'utf8');

const result = template
    .replace(/POST_IP_PLACEHOLDER/g, process.env.POST_URL);

fs.writeFileSync('./_redirects', result);
console.log("✅ _redirects generated!");

const configContent = `window.CONFIG = {
    post: ""
};`;

fs.writeFileSync('./static/js/config.js', configContent);
console.log("✅ config.js generated!");