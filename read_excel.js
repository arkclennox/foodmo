const xlsx = require('xlsx');
const wb = xlsx.readFile('warung makan surabaya.xlsx');
const sheet = wb.Sheets[wb.SheetNames[0]];
const data = xlsx.utils.sheet_to_json(sheet);
console.log('Columns:', Object.keys(data[0] || {}));
console.log('First row:', data[0]);
