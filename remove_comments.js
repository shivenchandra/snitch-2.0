const fs = require('fs');
const path = require('path');

// Safe regex to remove comments without breaking URLs
function stripComments(content) {
  // Remove multi-line comments
  let text = content.replace(/\/\*[\s\S]*?\*\//g, '');
  
  // Remove single-line comments (ignoring http:// and https://)
  text = text.replace(/(?<!:)\/\/.*$/gm, '');
  
  // Clean up excessive empty lines left behind
  text = text.replace(/^\s*[\r\n]/gm, '');
  
  return text;
}

function processDirectory(dir) {
  if (!fs.existsSync(dir)) return;
  
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    
    if (stat.isDirectory()) {
      if (!['node_modules', '.expo', 'assets'].includes(file)) {
        processDirectory(fullPath);
      }
    } else if (file.endsWith('.ts') || file.endsWith('.tsx') || file.endsWith('.js')) {
      const content = fs.readFileSync(fullPath, 'utf8');
      const newContent = stripComments(content);
      if (content !== newContent) {
        fs.writeFileSync(fullPath, newContent, 'utf8');
        console.log(`Cleaned: ${fullPath}`);
      }
    }
  }
}

const clientDir = path.join(__dirname, 'client');
const foldersToClean = [
  'app', 'components', 'config', 'constants', 
  'context', 'hooks', 'services', 'types', 'utils'
];

console.log('Starting comment removal...');
foldersToClean.forEach(folder => {
  processDirectory(path.join(clientDir, folder));
});
console.log('Finished removing comments!');
