// Manual test script for document upload
const FormData = require('form-data');
const fs = require('fs');
const axios = require('axios');

const token = 'YOUR_JWT_TOKEN'; // Get from login
const file = fs.createReadStream('./test-t4.pdf');

const form = new FormData();
form.append('file', file);
form.append('docType', 'T4');
form.append('docSubtype', 'Employer Inc.');

axios.post('http://localhost:3001/api/client/tax-years/2025/documents', form, {
  headers: {
    ...form.getHeaders(),
    'Authorization': `Bearer ${token}`
  }
})
.then(res => console.log('Success:', res.data))
.catch(err => console.error('Error:', err.response?.data || err.message));
