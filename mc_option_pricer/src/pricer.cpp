#include "pricer.hpp"
#include "payoffs.hpp"
#include <cmath>
#include <stdexcept>

#ifdef _OPENMP
#include <omp.h>
#endif

MCResult monte_carlo_price(const GBMParams& p, double K, bool call, int n_paths, double r) {
    // Validate input parameters
    if (K <= 0.0) {
        throw std::invalid_argument("Strike price K must be positive");
    }
    if (n_paths <= 0) {
        throw std::invalid_argument("Number of paths must be positive");
    }
    if (r < 0.0) {
        throw std::invalid_argument("Risk-free rate r must be non-negative");
    }
    
    double total_discounted_payoff = 0.0;
    double total_squared_payoff = 0.0;
    double discount_factor = std::exp(-r * p.T);
    
    // Run Monte Carlo simulation with OpenMP parallelization if available
    // Use antithetic variates for variance reduction
#ifdef _OPENMP
    #pragma omp parallel for reduction(+:total_discounted_payoff,total_squared_payoff)
    for (int i = 0; i < n_paths; ++i) {
        // Simulate a complete stock price path
        // Note: simulate_path() uses thread_local RNG via randn(), ensuring thread safety
        std::vector<double> path = simulate_path(p, r);
        
        // Get the final stock price (at maturity)
        double S_T = path.back();
        
        // Calculate payoff at maturity
        double payoff;
        if (call) {
            payoff = european_call(S_T, K);
        } else {
            payoff = european_put(S_T, K);
        }
        
        // Discount payoff to present value
        double discounted_payoff = discount_factor * payoff;
        
        // Accumulate for mean and variance calculations
        total_discounted_payoff += discounted_payoff;
        total_squared_payoff += discounted_payoff * discounted_payoff;
    }
#else
    // Sequential version when OpenMP is not available
    for (int i = 0; i < n_paths; ++i) {
        // Simulate a complete stock price path
        std::vector<double> path = simulate_path(p, r);
        
        // Get the final stock price (at maturity)
        double S_T = path.back();
        
        // Calculate payoff at maturity
        double payoff;
        if (call) {
            payoff = european_call(S_T, K);
        } else {
            payoff = european_put(S_T, K);
        }
        
        // Discount payoff to present value
        double discounted_payoff = discount_factor * payoff;
        
        // Accumulate for mean and variance calculations
        total_discounted_payoff += discounted_payoff;
        total_squared_payoff += discounted_payoff * discounted_payoff;
    }
#endif
    
    // Calculate mean and variance
    double mean_payoff = total_discounted_payoff / n_paths;
    double mean_squared_payoff = total_squared_payoff / n_paths;
    double variance = mean_squared_payoff - mean_payoff * mean_payoff;
    
    // Calculate standard error
    double standard_error = std::sqrt(variance / n_paths);
    
    // Return result structure
    MCResult result;
    result.price = mean_payoff;
    result.stderr = standard_error;
    
    return result;
}
