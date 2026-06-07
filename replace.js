const fs = require('fs');
const path = require('path');

const directory = 'C:\\Users\\devba\\Desktop\\dr\\src';

function replaceInFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let originalContent = content;

  // Replacements
  content = content.replace(/Dr\. Rajesh Kumar/g, 'DR SK BHATT');
  content = content.replace(/Dr\. Rajesh/g, 'DR SK BHATT');
  content = content.replace(/Rajesh Kumar/g, 'SK BHATT');
  content = content.replace(/dr\.rajesh@heartcare\.com/g, 'dr.skbhatt@vardaanclinic.com');
  content = content.replace(/drrajeshkumar/g, 'drskbhatt');
  content = content.replace(/HeartCare Clinic/g, 'VARDAAN CLINIC');
  content = content.replace(/HeartCare/g, 'VARDAAN');
  content = content.replace(/heartcare\.com/g, 'vardaanclinic.com');

  if (content !== originalContent) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Updated ${filePath}`);
  }
}

function walk(dir) {
  const list = fs.readdirSync(dir);
  for (const file of list) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    if (stat && stat.isDirectory()) {
      walk(filePath);
    } else {
      if (filePath.endsWith('.tsx') || filePath.endsWith('.ts') || filePath.endsWith('.css')) {
        replaceInFile(filePath);
      }
    }
  }
}

walk(directory);
console.log('Replacement complete.');
