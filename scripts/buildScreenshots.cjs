const fs = require('fs');
const path = require('path');

const files = [
  { id: 'patient', name: 'Patient_Portal.png', file: 'public/Patient_Portal.png', title: 'Patient Portal', desc: 'Full desktop dashboard with AI Symptom Checker, hospital search & filters, verified hospital cards, appointments, and diagnostic reports.' },
  { id: 'registration', name: 'Hospital_Registration.png', file: 'public/Hospital_Registration.png', title: 'Hospital Registration Portal', desc: 'Registration portal with hospital details, logo uploader, interactive map location picker, facilities badges, and certificate submission.' },
  { id: 'management', name: 'Hospital_Management.png', file: 'public/Hospital_Management.png', title: 'Hospital Management Portal', desc: 'Multi-tenant hospital management dashboard with isolated doctor roster, appointments, bed tracker, patient roster, and reviews.' },
  { id: 'admin', name: 'Admin_Portal.png', file: 'public/Admin_Portal.png', title: 'Admin Portal', desc: 'Super Admin verification dashboard with pending hospital request approvals, verified hospitals directory, analytics, and audit logs.' }
];

let content = '// Auto-generated high quality base64 PNG images for presentation screenshots\n\nexport interface ScreenshotData {\n  id: string;\n  title: string;\n  filename: string;\n  description: string;\n  base64: string;\n}\n\nexport const SCREENSHOTS_DATA: ScreenshotData[] = [\n';

for (const item of files) {
  const buf = fs.readFileSync(item.file);
  const b64 = 'data:image/png;base64,' + buf.toString('base64');
  content += `  {\n    id: ${JSON.stringify(item.id)},\n    title: ${JSON.stringify(item.title)},\n    filename: ${JSON.stringify(item.name)},\n    description: ${JSON.stringify(item.desc)},\n    base64: ${JSON.stringify(b64)}\n  },\n`;
}

content += '];\n';

fs.writeFileSync('src/assets/images/screenshotsData.ts', content);
console.log('Successfully created src/assets/images/screenshotsData.ts with valid base64 PNGs!');
