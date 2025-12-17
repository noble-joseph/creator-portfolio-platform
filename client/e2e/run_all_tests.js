import { TestLogin } from './test_login.js';
import { TestDashboard } from './test_dashboard.js';
import { TestPortfolio } from './test_portfolio.js';
import { TestConnections } from './test_connections.js';

async function runAllTests() {
  console.log('=== Creator Portfolio Platform E2E Test Suite ===\n');

  const results = [];
  const tests = [
    { name: 'Login Test', class: TestLogin, method: 'test_login' },
    { name: 'Dashboard Test', class: TestDashboard, method: 'test_dashboard_functionality' },
    { name: 'Portfolio Test', class: TestPortfolio, method: 'test_portfolio_management' },
    { name: 'Connections Test', class: TestConnections, method: 'test_connections_management' }
  ];

  for (const test of tests) {
    console.log(`\n--- Running ${test.name} ---`);
    try {
      const testInstance = new test.class();
      await testInstance[test.method]();
      results.push({ test: test.name, status: 'PASSED', details: 'Completed successfully' });
    } catch (error) {
      console.log(`✗ ${test.name} failed: ${error.message}`);
      results.push({ test: test.name, status: 'FAILED', details: error.message });
    }
  }

  // Print summary
  console.log('\n=== Test Results Summary ===');
  const passed = results.filter(r => r.status === 'PASSED').length;
  const failed = results.filter(r => r.status === 'FAILED').length;
  const total = results.length;

  console.log(`Total Tests: ${total}`);
  console.log(`Passed: ${passed}`);
  console.log(`Failed: ${failed}`);
  console.log(`Success Rate: ${((passed / total) * 100).toFixed(1)}%\n`);

  console.log('=== Detailed Results ===');
  results.forEach((result, index) => {
    console.log(`${index + 1}. ${result.test}: ${result.status}`);
    if (result.status === 'FAILED') {
      console.log(`   Error: ${result.details}`);
    }
    console.log('');
  });

  return { passed, failed, total, results };
}

// Run all tests
runAllTests().catch(console.error);
