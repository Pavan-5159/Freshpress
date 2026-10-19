const fs = require('fs');
const path = require('path');

const walkSync = (dir, filelist = []) => {
  fs.readdirSync(dir).forEach(file => {
    const filePath = path.join(dir, file);
    if (fs.statSync(filePath).isDirectory()) {
      filelist = walkSync(filePath, filelist);
    } else {
      if (filePath.endsWith('.tsx') || filePath.endsWith('.ts')) {
        filelist.push(filePath);
      }
    }
  });
  return filelist;
};

const dirs = [path.join(__dirname, 'app'), path.join(__dirname, 'components')];
let files = [];
dirs.forEach(d => files = files.concat(walkSync(d)));

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  let original = content;

  // Replace borderRadius
  let modified = false;
  if (content.match(/borderRadius:\s*16\b/)) { content = content.replace(/borderRadius:\s*16\b/g, 'borderRadius: radius.lg'); modified = true; }
  if (content.match(/borderRadius:\s*12\b/)) { content = content.replace(/borderRadius:\s*12\b/g, 'borderRadius: radius.md'); modified = true; }
  if (content.match(/borderRadius:\s*8\b/)) { content = content.replace(/borderRadius:\s*8\b/g, 'borderRadius: radius.sm'); modified = true; }
  if (content.match(/borderRadius:\s*99\b/)) { content = content.replace(/borderRadius:\s*99\b/g, 'borderRadius: radius.pill'); modified = true; }
  if (content.match(/borderRadius:\s*20\b/)) { content = content.replace(/borderRadius:\s*20\b/g, 'borderRadius: radius.pill'); modified = true; }
  if (content.match(/borderRadius:\s*24\b/)) { content = content.replace(/borderRadius:\s*24\b/g, 'borderRadius: radius.pill'); modified = true; }

  // Inject import if needed
  if (modified && !content.includes('import { radius }')) {
    const lastImportIndex = content.lastIndexOf('import ');
    if (lastImportIndex !== -1) {
      const endOfLastImport = content.indexOf('\n', lastImportIndex);
      content = content.slice(0, endOfLastImport + 1) + "import { radius } from '@/constants/theme';\n" + content.slice(endOfLastImport + 1);
    } else {
      content = "import { radius } from '@/constants/theme';\n" + content;
    }
  }

  if (content !== original) {
    fs.writeFileSync(file, content, 'utf8');
    console.log('Updated: ' + file);
  }
});
