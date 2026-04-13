const fs = require('fs');
const path = require('path');

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach((file) => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    if (stat && stat.isDirectory()) {
      if (!filePath.includes('node_modules') && !filePath.includes('.next')) {
        results = results.concat(walk(filePath));
      }
    } else if (filePath.endsWith('.tsx') || filePath.endsWith('.ts')) {
      results.push(filePath);
    }
  });
  return results;
}

const files = walk('./src');

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  let original = content;

  // Fix pseudo-class breaking bug from earlier regexes

  // General regex to find misplaced split classes from pseudo prefixes
  // e.g. "hover:dark:text-white text-gray-900" 
  //   group1 = "hover:" or "group-hover:" or "focus:"
  //   We want to make the second class also have the prefix.
  
  const prefixes = ['hover:', 'group-hover:', 'focus:', 'active:'];
  const targets = ['text-gray-900', 'bg-black/5', 'bg-black/10', 'bg-black/20', 'border-black/5', 'border-black/10', 'border-black/20'];
  
  prefixes.forEach(prefix => {
    targets.forEach(target => {
      // Find "prefix" followed by any whitespace-separated dark:... and then the target
      // This is quite specific to what we produced: `prefix + dark:xyz + space + target`
      // Actually simpler:
      // Search for e.g. "hover:dark:text-white text-gray-900"
      
      if (target === 'text-gray-900') {
         content = content.replace(new RegExp(prefix + 'dark:text-white text-gray-900', 'g'), prefix + 'dark:text-white ' + prefix + 'text-gray-900');
      }
      if (target === 'bg-black/5') {
         content = content.replace(new RegExp(prefix + 'dark:bg-white/5 bg-black/5', 'g'), prefix + 'dark:bg-white/5 ' + prefix + 'bg-black/5');
      }
      if (target === 'bg-black/10') {
         content = content.replace(new RegExp(prefix + 'dark:bg-white/10 bg-black/10', 'g'), prefix + 'dark:bg-white/10 ' + prefix + 'bg-black/10');
      }
      if (target === 'bg-black/20') {
         content = content.replace(new RegExp(prefix + 'dark:bg-white/20 bg-black/20', 'g'), prefix + 'dark:bg-white/20 ' + prefix + 'bg-black/20');
      }
      if (target === 'border-black/5') {
         content = content.replace(new RegExp(prefix + 'dark:border-white/5 border-black/5', 'g'), prefix + 'dark:border-white/5 ' + prefix + 'border-black/5');
      }
      if (target === 'border-black/10') {
         content = content.replace(new RegExp(prefix + 'dark:border-white/10 border-black/10', 'g'), prefix + 'dark:border-white/10 ' + prefix + 'border-black/10');
      }
      if (target === 'border-black/20') {
         content = content.replace(new RegExp(prefix + 'dark:border-white/20 border-black/20', 'g'), prefix + 'dark:border-white/20 ' + prefix + 'border-black/20');
      }
    });
  });

  // Sidebar visibility explicitly:
  // Using `bg-black/40` unconditionally makes the sidebar very dark in light mode, making text hard to read.
  // The user says "text color is very deam like not clear visual akdom halka".
  // Let's replace "bg-black/40" with "bg-[var(--glass-bg)]" in layout.tsx.
  // Actually, better yet: "bg-[var(--bg-secondary)]" or "bg-[rgba(0,0,0,0.03)] dark:bg-black/40".
  content = content.replace(/\bbg-black\/40\b/g, 'dark:bg-black/40 bg-[rgba(0,0,0,0.02)]');
  
  // Replace text-dark-500 unconditionally in Nav headers to text-[var(--text-secondary)] or something?
  // User says "text color is very deam". In light mode, text-dark-500 (#64748B) is pretty decent but let's make it darker: text-dark-400 or dark:text-dark-500 text-slate-700
  content = content.replace(/\btext-dark-500\b/g, 'text-slate-600 dark:text-dark-500');

  if (content !== original) {
    fs.writeFileSync(file, content);
    console.log('Fixed', file);
  }
});
