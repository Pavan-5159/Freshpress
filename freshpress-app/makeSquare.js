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

  let modified = false;

  // Replace any borderRadius > 8 with radius.md, except where it is 4 or 8.
  // Actually, we'll replace specific large ones remaining to enforce the square look.
  const regex = /border(?:TopLeft|TopRight|BottomLeft|BottomRight)?Radius:\s*(\d+)/g;
  content = content.replace(regex, (match, p1) => {
    const val = parseInt(p1, 10);
    if (val > 8) {
      modified = true;
      return match.replace(p1, 'radius.md');
    }
    return match;
  });

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
