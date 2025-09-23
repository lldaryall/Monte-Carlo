#include "gbm.hpp"
#include "random_utils.hpp"
#include <cmath>

std::vector<double> simulate_path(const GBMParams& p, double r) {
    // Validate input parameters
    if (p.S0 <= 0.0) {
        throw std::invalid_argument("Initial stock price S0 must be positive");
    }
    if (p.sigma < 0.0) {
        throw std::invalid_argument("Volatility sigma must be non-negative");
    }
    if (p.T <= 0.0) {
        throw std::invalid_argument("Time to maturity T must be positive");
    }
    if (p.steps <= 0) {
        throw std::invalid_argument("Number of steps must be positive");
    }
    if (r < 0.0) {
        throw std::invalid_argument("Risk-free rate r must be non-negative");
    }
    
    // Calculate time step size
    double dt = p.T / p.steps;
    
    // Initialize result vector with initial price
    std::vector<double> path(p.steps + 1);
    path[0] = p.S0;
    
    // Simulate the path step by step
    double current_price = p.S0;
    for (int i = 1; i <= p.steps; ++i) {
        // Generate standard normal random variable
        double Z = randn();
        
        // Calculate next price using GBM formula
        // S_{t+1} = S_t * exp((r - 0.5*sigma^2)*dt + sigma*sqrt(dt)*Z)
        double drift_term = (r - 0.5 * p.sigma * p.sigma) * dt;
        double diffusion_term = p.sigma * std::sqrt(dt) * Z;
        
        current_price = current_price * std::exp(drift_term + diffusion_term);
        path[i] = current_price;
    }
    
    return path;
}
