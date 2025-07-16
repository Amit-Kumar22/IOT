"""
Test runner script for IoT Platform smoke tests.
"""

import os
import sys
import subprocess
import argparse
from datetime import datetime

def run_smoke_tests(browser="chrome", headless=False, parallel=True, markers=None, output_dir="reports"):
    """
    Run smoke tests with specified configuration.
    
    Args:
        browser (str): Browser to use (chrome, firefox, edge)
        headless (bool): Run in headless mode
        parallel (bool): Run tests in parallel
        markers (str): pytest markers to filter tests
        output_dir (str): Output directory for reports
    """
    
    # Ensure output directory exists
    if not os.path.exists(output_dir):
        os.makedirs(output_dir)
    
    # Build pytest command
    cmd = ["python", "-m", "pytest"]
    
    # Add test directory
    cmd.append("test_suites/")
    
    # Add browser option
    cmd.extend(["--browser", browser])
    
    # Add headless option if specified
    if headless:
        cmd.append("--headless")
    
    # Add parallel execution if specified
    if parallel:
        cmd.extend(["-n", "4"])
    
    # Add markers if specified
    if markers:
        cmd.extend(["-m", markers])
    
    # Add HTML report
    html_report = os.path.join(output_dir, f"smoke_report_{datetime.now().strftime('%Y%m%d_%H%M%S')}.html")
    cmd.extend(["--html", html_report, "--self-contained-html"])
    
    # Add JUnit XML report
    xml_report = os.path.join(output_dir, f"smoke_junit_{datetime.now().strftime('%Y%m%d_%H%M%S')}.xml")
    cmd.extend(["--junitxml", xml_report])
    
    # Add verbose output
    cmd.append("-v")
    
    # Add short traceback
    cmd.append("--tb=short")
    
    # Add duration report
    cmd.append("--durations=10")
    
    print(f"Running smoke tests with command: {' '.join(cmd)}")
    print(f"Browser: {browser}")
    print(f"Headless: {headless}")
    print(f"Parallel: {parallel}")
    print(f"Markers: {markers}")
    print(f"Output directory: {output_dir}")
    print("-" * 50)
    
    # Run the tests
    try:
        result = subprocess.run(cmd, cwd=os.path.dirname(__file__), capture_output=False)
        return result.returncode
    except Exception as e:
        print(f"Error running tests: {e}")
        return 1

def run_quick_smoke():
    """Run quick smoke tests (critical tests only)."""
    return run_smoke_tests(
        browser="chrome",
        headless=True,
        parallel=True,
        markers="smoke and critical"
    )

def run_full_smoke():
    """Run full smoke test suite."""
    return run_smoke_tests(
        browser="chrome",
        headless=False,
        parallel=True,
        markers="smoke"
    )

def run_auth_tests():
    """Run authentication smoke tests only."""
    return run_smoke_tests(
        browser="chrome",
        headless=False,
        parallel=False,
        markers="smoke and auth"
    )

def run_dashboard_tests():
    """Run dashboard smoke tests only."""
    return run_smoke_tests(
        browser="chrome",
        headless=False,
        parallel=False,
        markers="smoke and dashboard"
    )

def run_cross_browser_tests():
    """Run tests across multiple browsers."""
    browsers = ["chrome", "firefox", "edge"]
    results = []
    
    for browser in browsers:
        print(f"\n{'='*60}")
        print(f"Running tests on {browser.upper()}")
        print('='*60)
        
        result = run_smoke_tests(
            browser=browser,
            headless=True,
            parallel=True,
            markers="smoke and critical",
            output_dir=f"reports/{browser}"
        )
        results.append((browser, result))
    
    # Summary
    print(f"\n{'='*60}")
    print("CROSS-BROWSER TEST SUMMARY")
    print('='*60)
    
    for browser, result in results:
        status = "PASSED" if result == 0 else "FAILED"
        print(f"{browser.upper()}: {status}")
    
    return results

def main():
    """Main function to parse arguments and run tests."""
    parser = argparse.ArgumentParser(description="IoT Platform Smoke Test Runner")
    
    parser.add_argument(
        "--browser",
        choices=["chrome", "firefox", "edge"],
        default="chrome",
        help="Browser to use for testing"
    )
    
    parser.add_argument(
        "--headless",
        action="store_true",
        help="Run tests in headless mode"
    )
    
    parser.add_argument(
        "--parallel",
        action="store_true",
        default=True,
        help="Run tests in parallel"
    )
    
    parser.add_argument(
        "--markers",
        help="pytest markers to filter tests (e.g., 'smoke and critical')"
    )
    
    parser.add_argument(
        "--output-dir",
        default="reports",
        help="Output directory for test reports"
    )
    
    parser.add_argument(
        "--preset",
        choices=["quick", "full", "auth", "dashboard", "cross-browser"],
        help="Use preset test configuration"
    )
    
    args = parser.parse_args()
    
    # Change to test directory
    test_dir = os.path.dirname(os.path.abspath(__file__))
    os.chdir(test_dir)
    
    # Run tests based on preset or custom configuration
    if args.preset == "quick":
        result = run_quick_smoke()
    elif args.preset == "full":
        result = run_full_smoke()
    elif args.preset == "auth":
        result = run_auth_tests()
    elif args.preset == "dashboard":
        result = run_dashboard_tests()
    elif args.preset == "cross-browser":
        results = run_cross_browser_tests()
        result = 0 if all(r[1] == 0 for r in results) else 1
    else:
        result = run_smoke_tests(
            browser=args.browser,
            headless=args.headless,
            parallel=args.parallel,
            markers=args.markers,
            output_dir=args.output_dir
        )
    
    # Exit with appropriate code
    sys.exit(result)

if __name__ == "__main__":
    main()
