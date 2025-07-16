# IoT Platform Smoke Tests

This directory contains comprehensive Selenium Python-based smoke tests for the IoT Platform application.

## Quick Start

1. **Install Dependencies**
   ```bash
   pip install -r requirements.txt
   ```

2. **Run Quick Smoke Tests**
   ```bash
   python run_smoke_tests.py --preset quick
   ```

3. **Run Full Smoke Tests**
   ```bash
   python run_smoke_tests.py --preset full
   ```

## Test Structure

```
tests/
├── conftest.py                 # Pytest configuration and fixtures
├── pytest.ini                 # Pytest settings
├── requirements.txt            # Python dependencies
├── run_smoke_tests.py         # Test runner script
├── page_objects/              # Page Object Model classes
│   ├── base_page.py           # Base page with common functionality
│   ├── login_page.py          # Login page interactions
│   └── dashboard_page.py      # Dashboard page interactions
├── test_data/                 # Test data and configuration
│   ├── test_config.py         # Test configuration settings
│   └── test_users.py          # Test user data
├── test_suites/               # Test case files
│   ├── test_smoke_authentication.py  # Authentication tests
│   └── test_smoke_dashboard.py       # Dashboard tests
├── utilities/                 # Helper utilities
│   ├── driver_factory.py     # WebDriver factory
│   ├── screenshot_util.py    # Screenshot utilities
│   └── helpers.py            # General helper functions
└── reports/                   # Test reports and screenshots
    └── screenshots/           # Test failure screenshots
```

## Running Tests

### Available Presets

- **quick**: Critical tests only, headless mode (~5 minutes)
- **full**: All smoke tests, with UI (~15 minutes)
- **auth**: Authentication tests only
- **dashboard**: Dashboard tests only
- **cross-browser**: Tests across Chrome, Firefox, Edge

### Custom Test Execution

```bash
# Run with specific browser
python run_smoke_tests.py --browser firefox

# Run in headless mode
python run_smoke_tests.py --headless

# Run specific test markers
python run_smoke_tests.py --markers "smoke and critical"

# Run with custom output directory
python run_smoke_tests.py --output-dir custom_reports
```

### Direct Pytest Commands

```bash
# Run all smoke tests
pytest test_suites/ -m smoke

# Run authentication tests only
pytest test_suites/test_smoke_authentication.py -v

# Run with HTML report
pytest test_suites/ --html=reports/report.html --self-contained-html

# Run in parallel
pytest test_suites/ -n 4
```

## Test Configuration

### Environment Variables

Create a `.env` file in the tests directory:

```env
BASE_URL=http://localhost:3000
BROWSER=chrome
HEADLESS=false
IMPLICIT_WAIT=10
EXPLICIT_WAIT=20
PARALLEL_WORKERS=4
```

### Test Data

The test suite uses the demo credentials from the IoT Platform:

- **Admin**: admin@iotplatform.com / Admin123!
- **Company**: manager@acmecorp.com / Manager456!
- **Consumer**: jane.doe@example.com / Consumer789!

## Test Categories

### Critical Tests (P1)
- Login functionality for all user types
- Dashboard loading and navigation
- Basic UI element presence
- Authentication flow validation

### High Priority Tests (P2)
- Form validation
- Error message handling
- Navigation functionality
- Session management

### Medium Priority Tests (P3)
- Responsive design
- Performance checks
- Accessibility basics
- Browser compatibility

### Low Priority Tests (P4)
- UI/UX elements
- Optional features
- Enhanced functionality

## Reporting

### HTML Reports
Generated in `reports/` directory with:
- Test execution summary
- Pass/fail status for each test
- Screenshots on failure
- Execution time details

### Screenshots
Automatically captured on test failure and saved to `reports/screenshots/`

### Console Output
Detailed logging with:
- Test step information
- Error messages
- Performance metrics
- Browser console logs

## Browser Support

- **Chrome** (recommended)
- **Firefox**
- **Edge**
- **Mobile Chrome** (for responsive testing)

## CI/CD Integration

### GitHub Actions Example

```yaml
name: Smoke Tests
on: [push, pull_request]

jobs:
  smoke-tests:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v2
    - name: Set up Python
      uses: actions/setup-python@v2
      with:
        python-version: 3.9
    - name: Install dependencies
      run: |
        cd tests
        pip install -r requirements.txt
    - name: Run smoke tests
      run: |
        cd tests
        python run_smoke_tests.py --preset quick
    - name: Upload test results
      uses: actions/upload-artifact@v2
      if: always()
      with:
        name: test-results
        path: tests/reports/
```

## Maintenance

### Adding New Tests

1. Create test methods in appropriate test suite files
2. Use appropriate pytest markers (@pytest.mark.smoke, @pytest.mark.critical)
3. Follow Page Object Model pattern
4. Include proper assertions and logging
5. Add screenshots for verification

### Updating Test Data

1. Modify `test_data/test_config.py` for configuration changes
2. Update `test_data/test_users.py` for user data changes
3. Regenerate test data using helper functions

### Extending Page Objects

1. Add new page classes in `page_objects/`
2. Inherit from `BasePage` class
3. Define locators and methods
4. Include verification methods
5. Add comprehensive error handling

## Troubleshooting

### Common Issues

1. **WebDriver Issues**
   - Update webdriver-manager: `pip install --upgrade webdriver-manager`
   - Check browser version compatibility

2. **Element Not Found**
   - Increase timeout values in `test_config.py`
   - Verify element locators are correct
   - Check page loading issues

3. **Permission Errors**
   - Run with administrator privileges
   - Check file permissions in reports directory

4. **Network Issues**
   - Verify application is running
   - Check firewall settings
   - Validate base URL configuration

### Debug Mode

Run tests with debug information:

```bash
python run_smoke_tests.py --markers "smoke and critical" --browser chrome --output-dir debug_reports
```

## Contributing

1. Follow existing code structure and patterns
2. Add comprehensive test documentation
3. Include proper error handling
4. Write meaningful test names and descriptions
5. Add appropriate test markers
6. Update documentation as needed

## Support

For issues or questions:
1. Check the troubleshooting section
2. Review test logs and screenshots
3. Verify test environment setup
4. Contact the QA team for assistance
