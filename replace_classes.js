import fs from 'fs';

const transformClasses = (filePath) => {
  let content = fs.readFileSync(filePath, 'utf8');

  const replacements = [
    { target: /bg-\[\#1F2128\]/g, replacement: 'bg-[#F8F9FA] dark:bg-[#1F2128]' },
    { target: /bg-\[\#1A1C23\]/g, replacement: 'bg-white dark:bg-[#1A1C23]' },
    { target: /border-\[\#2C2F36\]/g, replacement: 'border-gray-200 dark:border-[#2C2F36]' },
    { target: /bg-\[\#242730\]/g, replacement: 'bg-white dark:bg-[#242730]' },
    { target: /text-\[\#8A8E93\]/g, replacement: 'text-gray-500 dark:text-[#8A8E93]' },
    { target: /hover:bg-\[\#2C2F36\]/g, replacement: 'hover:bg-gray-100 dark:hover:bg-[#2C2F36]' },
    { target: /bg-\[\#111315\]\/80/g, replacement: 'bg-gray-100/80 dark:bg-[#111315]/80' },
    { target: /bg-\[\#2C2F36\](?! border)/g, replacement: 'bg-gray-100 dark:bg-[#2C2F36]' },
  ];

  replacements.forEach(({target, replacement}) => {
    content = content.replace(target, replacement);
  });
  
  // Custom replacements
  content = content.replace(/\btext-white\b/g, 'text-gray-900 dark:text-white');
  content = content.replace(/hover:text-white\b/g, 'hover:text-gray-900 dark:hover:text-white');

  fs.writeFileSync(filePath, content, 'utf8');
}

transformClasses('src/pages/Dashboard.jsx');
transformClasses('src/components/TransactionModal.jsx');

console.log('Transformation complete');
