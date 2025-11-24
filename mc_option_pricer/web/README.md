# Web Interface for Monte Carlo Option Pricing Simulator

This directory contains the web interface for the Monte Carlo Option Pricing Simulator, designed to be hosted on GitHub Pages.

## Files

- `index.html` - Main HTML page with the user interface
- `css/style.css` - Modern CSS styling with responsive design
- `js/app.js` - Main application controller
- `js/black-scholes.js` - Black-Scholes closed-form pricing implementation
- `js/monte-carlo.js` - Monte Carlo simulation with Web Workers

## Features

### Interactive Calculator
- Real-time input validation
- Responsive design for desktop and mobile
- Modern UI with gradient backgrounds
- Keyboard shortcuts (Ctrl+Enter, Ctrl+R)

### Advanced Simulation
- Parallel processing using Web Workers
- Statistical analysis with confidence intervals
- Performance metrics
- Error visualization with color coding

### Mathematical Accuracy
- High-precision Black-Scholes formulas
- Proper risk-neutral Monte Carlo pricing
- Variance reduction techniques
- Statistical validation

## Usage

1. Open `index.html` in a web browser
2. Enter option parameters
3. Click "Calculate Prices" to run simulation
4. View results with statistical analysis

## Browser Support

- Chrome/Edge: Full support
- Firefox: Full support  
- Safari: Full support
- Mobile browsers: Responsive design

## Performance

- 1M paths: ~2-5 seconds
- 10M paths: ~20-50 seconds
- Parallel processing: 2-4x speedup with Web Workers

## Deployment

This web interface is automatically deployed to GitHub Pages when pushed to the main branch. The deployment workflow is configured in `.github/workflows/deploy.yml`.
