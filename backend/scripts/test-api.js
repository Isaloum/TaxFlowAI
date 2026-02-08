#!/usr/bin/env node

/**
 * TaxFlowAI Backend API Test Script
 * Tests the accountant registration and login endpoints
 */

const http = require('http');

// Configuration
const BASE_URL = process.env.API_URL || 'http://localhost:3001';
const TEST_EMAIL = 'test-accountant@example.com';
const TEST_PASSWORD = 'SecurePass123';

// ANSI color codes
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

/**
 * Make HTTP request
 */
function makeRequest(options, data = null) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let body = '';
      
      res.on('data', (chunk) => {
        body += chunk;
      });
      
      res.on('end', () => {
        try {
          const jsonBody = JSON.parse(body);
          resolve({ status: res.statusCode, body: jsonBody, headers: res.headers });
        } catch (e) {
          resolve({ status: res.statusCode, body, headers: res.headers });
        }
      });
    });
    
    req.on('error', reject);
    
    if (data) {
      req.write(JSON.stringify(data));
    }
    
    req.end();
  });
}

/**
 * Test accountant registration
 */
async function testRegisterAccountant() {
  console.log(`\n${colors.cyan}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}`);
  console.log(`${colors.bright}Test 1: Register Accountant${colors.reset}`);
  console.log(`${colors.cyan}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}\n`);
  
  const url = new URL('/api/auth/register-accountant', BASE_URL);
  
  const options = {
    hostname: url.hostname,
    port: url.port || 80,
    path: url.pathname,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
  };
  
  const data = {
    email: TEST_EMAIL,
    password: TEST_PASSWORD,
    firmName: 'Test Accounting Firm',
    phone: '+1-514-555-0100',
    languagePref: 'fr',
  };
  
  try {
    console.log(`${colors.blue}→${colors.reset} POST ${url.pathname}`);
    console.log(`${colors.blue}→${colors.reset} Email: ${data.email}`);
    
    const response = await makeRequest(options, data);
    
    if (response.status === 201 || response.status === 200) {
      console.log(`${colors.green}✓${colors.reset} Status: ${response.status} (Success)`);
      console.log(`${colors.green}✓${colors.reset} Accountant registered successfully`);
      
      if (response.body.accountant) {
        console.log(`\n${colors.bright}Response Data:${colors.reset}`);
        console.log(`  ID: ${response.body.accountant.id}`);
        console.log(`  Email: ${response.body.accountant.email}`);
        console.log(`  Firm: ${response.body.accountant.firmName}`);
      }
      
      return { success: true, response };
    } else if (response.status === 400 && response.body.error?.includes('already exists')) {
      console.log(`${colors.yellow}⚠${colors.reset} Status: ${response.status} (User already exists)`);
      console.log(`${colors.yellow}ℹ${colors.reset} This is expected if you've run this test before`);
      return { success: true, response, alreadyExists: true };
    } else {
      console.log(`${colors.red}✗${colors.reset} Status: ${response.status} (Failed)`);
      console.log(`${colors.red}✗${colors.reset} Error: ${response.body.error || 'Unknown error'}`);
      return { success: false, response };
    }
  } catch (error) {
    console.log(`${colors.red}✗${colors.reset} Request failed: ${error.message}`);
    console.log(`${colors.yellow}ℹ${colors.reset} Is the server running? Try: npm run dev`);
    return { success: false, error };
  }
}

/**
 * Test login
 */
async function testLogin() {
  console.log(`\n${colors.cyan}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}`);
  console.log(`${colors.bright}Test 2: Login${colors.reset}`);
  console.log(`${colors.cyan}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}\n`);
  
  const url = new URL('/api/auth/login', BASE_URL);
  
  const options = {
    hostname: url.hostname,
    port: url.port || 80,
    path: url.pathname,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
  };
  
  const data = {
    email: TEST_EMAIL,
    password: TEST_PASSWORD,
  };
  
  try {
    console.log(`${colors.blue}→${colors.reset} POST ${url.pathname}`);
    console.log(`${colors.blue}→${colors.reset} Email: ${data.email}`);
    
    const response = await makeRequest(options, data);
    
    if (response.status === 200) {
      console.log(`${colors.green}✓${colors.reset} Status: ${response.status} (Success)`);
      console.log(`${colors.green}✓${colors.reset} Login successful`);
      
      if (response.body.token) {
        console.log(`\n${colors.bright}Response Data:${colors.reset}`);
        console.log(`  Token: ${response.body.token.substring(0, 20)}...`);
        console.log(`  Role: ${response.body.user.role}`);
        console.log(`  Firm: ${response.body.user.firmName}`);
        
        console.log(`\n${colors.bright}Usage Example:${colors.reset}`);
        console.log(`  ${colors.cyan}curl -H "Authorization: Bearer ${response.body.token.substring(0, 30)}..." \\${colors.reset}`);
        console.log(`  ${colors.cyan}     http://localhost:3001/api/accountant/clients${colors.reset}`);
      }
      
      return { success: true, response };
    } else {
      console.log(`${colors.red}✗${colors.reset} Status: ${response.status} (Failed)`);
      console.log(`${colors.red}✗${colors.reset} Error: ${response.body.error || 'Unknown error'}`);
      return { success: false, response };
    }
  } catch (error) {
    console.log(`${colors.red}✗${colors.reset} Request failed: ${error.message}`);
    console.log(`${colors.yellow}ℹ${colors.reset} Is the server running? Try: npm run dev`);
    return { success: false, error };
  }
}

/**
 * Main test runner
 */
async function runTests() {
  console.log(`\n${colors.bright}${colors.blue}╔═══════════════════════════════════════╗${colors.reset}`);
  console.log(`${colors.bright}${colors.blue}║   TaxFlowAI Backend API Test Suite   ║${colors.reset}`);
  console.log(`${colors.bright}${colors.blue}╚═══════════════════════════════════════╝${colors.reset}`);
  console.log(`\n${colors.bright}Testing server:${colors.reset} ${BASE_URL}`);
  
  const results = {
    passed: 0,
    failed: 0,
    warnings: 0,
  };
  
  // Test 1: Register Accountant
  const registerResult = await testRegisterAccountant();
  if (registerResult.success) {
    results.passed++;
    if (registerResult.alreadyExists) {
      results.warnings++;
    }
  } else {
    results.failed++;
  }
  
  // Test 2: Login
  const loginResult = await testLogin();
  if (loginResult.success) {
    results.passed++;
  } else {
    results.failed++;
  }
  
  // Print summary
  console.log(`\n${colors.cyan}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}`);
  console.log(`${colors.bright}Test Summary${colors.reset}`);
  console.log(`${colors.cyan}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}\n`);
  
  console.log(`${colors.green}✓${colors.reset} Passed: ${results.passed}/2`);
  if (results.failed > 0) {
    console.log(`${colors.red}✗${colors.reset} Failed: ${results.failed}/2`);
  }
  if (results.warnings > 0) {
    console.log(`${colors.yellow}⚠${colors.reset} Warnings: ${results.warnings}`);
  }
  
  if (results.failed === 0) {
    console.log(`\n${colors.green}${colors.bright}All tests passed! ✓${colors.reset}`);
    console.log(`\n${colors.bright}Next steps:${colors.reset}`);
    console.log(`  • Test creating a client: POST /api/accountant/clients`);
    console.log(`  • Open Prisma Studio: ${colors.cyan}npm run db:studio${colors.reset}`);
    console.log(`  • Check the full API docs in README.md`);
    process.exit(0);
  } else {
    console.log(`\n${colors.red}${colors.bright}Some tests failed ✗${colors.reset}`);
    console.log(`\n${colors.bright}Troubleshooting:${colors.reset}`);
    console.log(`  • Ensure the server is running: ${colors.cyan}npm run dev${colors.reset}`);
    console.log(`  • Check your .env configuration`);
    console.log(`  • Review the error messages above`);
    console.log(`  • See QUICKSTART.md for detailed help`);
    process.exit(1);
  }
}

// Run tests
runTests().catch((error) => {
  console.error(`${colors.red}${colors.bright}Fatal error:${colors.reset}`, error);
  process.exit(1);
});
