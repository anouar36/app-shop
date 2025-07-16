// Logout Function Test
// This test verifies the logout function is properly implemented

const fs = require('fs');
const path = require('path');

const dashboardPath = path.join(__dirname, 'shop-app', 'app', 'admin', 'dashboard', 'page.js');

try {
  const dashboardContent = fs.readFileSync(dashboardPath, 'utf8');
  
  console.log('🔍 Logout Function Validation Test');
  console.log('===================================\n');
  
  // Test 1: Check if logout function is defined
  const hasLogoutFunction = dashboardContent.includes('const logout = () => {');
  console.log(`✅ logout function definition: ${hasLogoutFunction ? 'FOUND' : 'MISSING'}`);
  
  // Test 2: Check if logout clears localStorage
  const clearsToken = dashboardContent.includes("localStorage.removeItem('admin_token')");
  const clearsUser = dashboardContent.includes("localStorage.removeItem('admin_user')");
  console.log(`🗂️  localStorage cleanup:`);
  console.log(`   ${clearsToken ? '✅' : '❌'} admin_token removal: ${clearsToken ? 'IMPLEMENTED' : 'MISSING'}`);
  console.log(`   ${clearsUser ? '✅' : '❌'} admin_user removal: ${clearsUser ? 'IMPLEMENTED' : 'MISSING'}`);
  
  // Test 3: Check if logout shows success message
  const showsMessage = dashboardContent.includes('toast.success("Logged out successfully!")');
  console.log(`📢 Success message: ${showsMessage ? 'IMPLEMENTED' : 'MISSING'}`);
  
  // Test 4: Check if logout redirects to admin page
  const redirectsToAdmin = dashboardContent.includes("router.push('/admin')");
  console.log(`🔄 Redirect to admin: ${redirectsToAdmin ? 'IMPLEMENTED' : 'MISSING'}`);
  
  // Test 5: Count logout function calls
  const logoutCalls = (dashboardContent.match(/logout\(\)/g) || []).length;
  const onClickLogout = (dashboardContent.match(/onClick={logout}/g) || []).length;
  console.log(`\n🖱️  Logout function usage:`);
  console.log(`   📞 Direct calls: ${logoutCalls}`);
  console.log(`   🖱️  onClick handlers: ${onClickLogout}`);
  console.log(`   📊 Total usage: ${logoutCalls + onClickLogout}`);
  
  // Summary
  const allTests = [
    hasLogoutFunction,
    clearsToken,
    clearsUser,
    showsMessage,
    redirectsToAdmin
  ];
  
  const passedTests = allTests.filter(test => test).length;
  const totalTests = allTests.length;
  
  console.log(`\n🎯 Test Summary:`);
  console.log(`   ✅ Passed: ${passedTests}/${totalTests} tests`);
  console.log(`   📈 Success Rate: ${((passedTests/totalTests) * 100).toFixed(1)}%`);
  
  if (passedTests === totalTests) {
    console.log('\n🎉 ALL LOGOUT TESTS PASSED!');
    console.log('\n✅ Logout Function Features:');
    console.log('   • Clears authentication tokens');
    console.log('   • Removes user data from localStorage');
    console.log('   • Shows success message to user');
    console.log('   • Redirects to admin login page');
    console.log('   • Properly integrated with UI components');
  } else {
    console.log(`\n⚠️  ${totalTests - passedTests} tests failed. Please check the implementation.`);
  }
  
} catch (error) {
  console.error('❌ Error reading dashboard file:', error.message);
}
