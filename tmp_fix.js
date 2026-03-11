const fs = require('fs');
const files = [
  'd:/web software developement/wexo/wexo/src/app/dashboard/workers/page.tsx',
  'd:/web software developement/wexo/wexo/src/app/dashboard/workers/add/page.tsx',
  'd:/web software developement/wexo/wexo/src/app/dashboard/workers/edit/[id]/page.tsx',
  'd:/web software developement/wexo/wexo/src/app/dashboard/workers/attendance/[id]/page.tsx'
];

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  // Clean up any remaining : classes that were broken from dark:hover:
  content = content.replace(/ :[a-z0-9\-/\\[\\]#]+/g, '');
  content = content.replace(/\" :[a-z0-9\-/\\[\\]#]+/g, '\"');
  content = content.replace(/\s+:[a-z0-9\-/\\[\\]#]+/g, '');
  
  // Apply glass and card-3d classes where card or glass styling makes sense
  content = content.replace(/bg-white\s+rounded-3xl\s+border\s+border-slate-200\s+p-6/g, 'glass p-6 rounded-[2.5rem] card-3d border border-slate-100');
  content = content.replace(/bg-white\s+rounded-\[32px\]\s+border\s+border-slate-200\s+/g, 'glass p-6 rounded-[2.5rem] card-3d border border-slate-100 ');

  // Update headers class
  content = content.replace(/bg-white\/70 backdrop-blur-xl rounded-\[40px\] border border-slate-200\/60 p-8 shadow-2xl shadow-slate-200\/20 /g, 'glass p-10 rounded-[2.5rem]');
  // Clean up multiple spaces
  content = content.replace(/  +/g, ' ');

  fs.writeFileSync(file, content);
  console.log('Fixed ' + file);
});
