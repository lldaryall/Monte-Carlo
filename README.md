# Monte Carlo Option Pricing Simulator

A comprehensive web application for pricing European call and put options using Monte Carlo simulation, with comparison against Black-Scholes closed-form solutions.

## Project Overview

This project demonstrates the practical application of Monte Carlo methods in quantitative finance, showcasing both computational efficiency and modern web development practices. The implementation compares simulation results with analytical solutions to validate accuracy and analyze convergence behavior.

## Technical Implementation

### Architecture
- **Frontend**: Modern JavaScript (ES6+) with Web Workers for parallel processing
- **Mathematical Models**: Black-Scholes-Merton framework with GBM simulation
- **Performance**: Optimized algorithms with statistical error analysis
- **UI/UX**: Responsive design with real-time validation and feedback

### Key Features

#### Interactive Calculator
- Real-time input validation with visual feedback
- Responsive design for desktop and mobile devices
- Modern UI with glassmorphism design elements
- Keyboard shortcuts (Ctrl+Enter to calculate, Ctrl+R to reset)

#### Pricing Methods
- **Monte Carlo Simulation**: Parallel processing with Web Workers
- **Black-Scholes Closed-Form**: High-precision analytical solution
- **Statistical Analysis**: Standard error, relative error, and convergence metrics
- **Performance Monitoring**: Execution time and paths-per-second calculations

#### Mathematical Foundation
- **Geometric Brownian Motion**: S_{t+1} = S_t × exp((r - 0.5σ²)dt + σ√dt×Z)
- **Call Option**: C = e^(-rT) × E[max(S_T - K, 0)]
- **Put Option**: P = e^(-rT) × E[max(K - S_T, 0)]
- **Box-Muller Transform**: For generating normal random variables

## File Structure

```
├── index.html              # Main HTML page with user interface
├── css/
│   └── style.css          # Modern CSS styling with responsive design
├── js/
│   ├── app.js             # Main application controller
│   ├── black-scholes.js   # Black-Scholes closed-form pricing
│   └── monte-carlo.js     # Monte Carlo simulation with Web Workers
└── README.md              # Project documentation
```

## Usage

### Live Demo
Visit the live application at: [https://lldaryall.github.io/Monte-Carlo/](https://lldaryall.github.io/Monte-Carlo/)

### Local Development
1. Clone the repository
2. Open `index.html` in a modern web browser
3. Enter option parameters and click "Calculate Prices"

### Input Parameters
- **Initial Stock Price (S₀)**: Current stock price
- **Strike Price (K)**: Option strike price
- **Risk-Free Rate (r)**: Annual risk-free interest rate (%)
- **Volatility (σ)**: Annual volatility (%)
- **Time to Maturity (T)**: Time until expiration (years)
- **Number of Paths**: Monte Carlo simulation paths (10K - 1M)

## Technical Highlights

### Performance Optimizations
- **Closed-Form GBM**: Uses analytical solution instead of step-by-step simulation
- **Web Workers**: Parallel processing for Monte Carlo calculations
- **Efficient Algorithms**: Box-Muller transform for random number generation
- **Memory Management**: Optimized data structures and garbage collection

### Code Quality
- **Modular Architecture**: Separation of concerns with dedicated modules
- **Error Handling**: Comprehensive input validation and error reporting
- **Documentation**: Detailed JSDoc comments and inline explanations
- **Testing**: Console logging for debugging and validation

### Learning Outcomes
This project demonstrates understanding of:
- Monte Carlo methods in quantitative finance
- Web Workers and parallel processing
- Modern JavaScript (ES6+) features
- Responsive web design principles
- Statistical analysis and error metrics
- Mathematical modeling in finance

## Browser Compatibility

- Chrome 60+
- Firefox 55+
- Safari 12+
- Edge 79+

## Future Enhancements

- Additional option types (American, Asian, etc.)
- More sophisticated variance reduction techniques
- Real-time market data integration
- Advanced visualization features
- Export functionality for results

*This project was developed as part of a personal project in quantitative finance and computational methods, demonstrating practical application of Monte Carlo simulation techniques in option pricing.*