#!/usr/bin/env node
/**
 * Input Focus Fix Script
 * 
 * This script identifies and reports files that may have input focus issues
 * and provides recommendations for fixing them.
 * 
 * Run this script to analyze your project for input focus problems.
 */

const { readFileSync, writeFileSync, existsSync } = require('fs');
const { join } = require('path');
const { glob } = require('glob');

/**
 * Analyze a TypeScript/TSX file for input focus issues
 */
function analyzeFile(filePath) {
  const content = readFileSync(filePath, 'utf-8');
  const issues = [];
  const recommendations = [];
  
  // Check for problematic patterns
  
  // 1. Inline onChange handlers
  const inlineHandlerPattern = /onChange=\{[^}]*\(e\)[^}]*e\.target\.value[^}]*\}/g;
  const inlineMatches = content.match(inlineHandlerPattern);
  if (inlineMatches) {
    issues.push(`Found ${inlineMatches.length} inline onChange handlers that may cause focus loss`);
    recommendations.push('Replace inline handlers with stable useCallback handlers');
  }
  
  // 2. handleInputChange with dependencies
  const handleInputChangePattern = /const handleInputChange.*useCallback.*\[([^\]]+)\]/g;
  const handlerMatches = content.match(handleInputChangePattern);
  if (handlerMatches) {
    handlerMatches.forEach(match => {
      if (match.includes('formErrors') || match.includes('errors')) {
        issues.push('handleInputChange depends on formErrors state which can cause re-renders');
        recommendations.push('Use functional state updates to avoid formErrors dependency');
      }
    });
  }
  
  // 3. Missing React.memo on form components
  const formComponentPattern = /const \w+Form.*=.*\(.*\) =>/g;
  const formMatches = content.match(formComponentPattern);
  if (formMatches && !content.includes('React.memo')) {
    issues.push('Form components are not memoized');
    recommendations.push('Wrap form components with React.memo to prevent unnecessary re-renders');
  }
  
  // 4. Input fields without stable handlers
  const inputPattern = /<input[^>]*onChange=\{[^}]*\}/g;
  const inputMatches = content.match(inputPattern);
  if (inputMatches) {
    const unstableInputs = inputMatches.filter(input => 
      input.includes('(e) =>') || input.includes('function(')
    );
    if (unstableInputs.length > 0) {
      issues.push(`Found ${unstableInputs.length} input fields with unstable handlers`);
      recommendations.push('Use stable input handlers with useCallback');
    }
  }
  
  // 5. setState calls in render
  const setStateInRenderPattern = /set\w+\([^)]*\)[^;]*;(?![^{]*\})/g;
  const setStateMatches = content.match(setStateInRenderPattern);
  if (setStateMatches) {
    issues.push('Potential setState calls during render detected');
    recommendations.push('Move setState calls to event handlers or useEffect');
  }
  
  // Determine severity
  let severity = 'low';
  if (issues.length > 3) severity = 'high';
  else if (issues.length > 1) severity = 'medium';
  
  return {
    file: filePath,
    issues,
    recommendations,
    severity
  };
}

/**
 * Main analysis function
 */
async function analyzeProject(projectRoot = process.cwd()) {
  console.log('🔍 Analyzing project for input focus issues...\n');
  
  // Find all TypeScript/TSX files
  const files = glob.sync('src/**/*.{ts,tsx}', { cwd: projectRoot });
  const results = [];
  
  for (const file of files) {
    const fullPath = join(projectRoot, file);
    if (existsSync(fullPath)) {
      const result = analyzeFile(fullPath);
      if (result.issues.length > 0) {
        results.push(result);
      }
    }
  }
  
  // Generate report
  console.log('📊 INPUT FOCUS ANALYSIS REPORT');
  console.log('===============================\n');
  
  if (results.length === 0) {
    console.log('✅ No input focus issues detected!');
    return;
  }
  
  // Sort by severity
  results.sort((a, b) => {
    const severityOrder = { high: 3, medium: 2, low: 1 };
    return severityOrder[b.severity] - severityOrder[a.severity];
  });
  
  results.forEach((result, index) => {
    const emoji = result.severity === 'high' ? '🔴' : result.severity === 'medium' ? '🟡' : '🟢';
    console.log(`${emoji} ${result.file} (${result.severity} priority)`);
    console.log('   Issues:');
    result.issues.forEach(issue => console.log(`     • ${issue}`));
    console.log('   Recommendations:');
    result.recommendations.forEach(rec => console.log(`     → ${rec}`));
    console.log('');
  });
  
  // Summary
  const highPriority = results.filter(r => r.severity === 'high').length;
  const mediumPriority = results.filter(r => r.severity === 'medium').length;
  const lowPriority = results.filter(r => r.severity === 'low').length;
  
  console.log('📈 SUMMARY');
  console.log('===========');
  console.log(`Files analyzed: ${files.length}`);
  console.log(`Files with issues: ${results.length}`);
  console.log(`High priority: ${highPriority}`);
  console.log(`Medium priority: ${mediumPriority}`);
  console.log(`Low priority: ${lowPriority}`);
  
  console.log('\n🛠️  RECOMMENDED ACTIONS');
  console.log('======================');
  console.log('1. Import and use useStableForm hook from @/hooks/useStableForm');
  console.log('2. Replace inline onChange handlers with stable handlers');
  console.log('3. Wrap form components with React.memo');
  console.log('4. Use functional state updates for error handling');
  console.log('5. Test all forms after fixes to ensure no focus loss');
  
  console.log('\n📝 NEXT STEPS');
  console.log('==============');
  console.log('• Run this script after making fixes to verify improvements');
  console.log('• Test input focus behavior manually in the browser');
  console.log('• Consider adding automated tests for form interactions');
}

// Export for use as a module
module.exports = { analyzeProject, analyzeFile };

// Run if called directly
if (require.main === module) {
  analyzeProject().catch(console.error);
}
