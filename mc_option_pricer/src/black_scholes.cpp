#include "black_scholes.hpp"
#include <cmath>
#include <stdexcept>

double cumulative_normal(double x) {
    return 0.5 * (1.0 + std::erf(x / std::sqrt(2.0)));
}

double bs_call(double S0, double K, double r, double sigma, double T) {
    // Validate input parameters
    if (S0 <= 0.0) {
        throw std::invalid_argument("Stock price S0 must be positive");
    }
    if (K <= 0.0) {
        throw std::invalid_argument("Strike price K must be positive");
    }
    if (sigma < 0.0) {
        throw std::invalid_argument("Volatility sigma must be non-negative");
    }
    if (T <= 0.0) {
        throw std::invalid_argument("Time to maturity T must be positive");
    }
    
    // Handle special case: zero volatility
    if (sigma == 0.0) {
        if (S0 > K) {
            return S0 - K * std::exp(-r * T);
        } else {
            return 0.0;
        }
    }
    
    // Calculate d1 and d2
    double sqrt_T = std::sqrt(T);
    double d1 = (std::log(S0 / K) + (r + 0.5 * sigma * sigma) * T) / (sigma * sqrt_T);
    double d2 = d1 - sigma * sqrt_T;
    
    // Calculate cumulative normal distributions
    double N_d1 = cumulative_normal(d1);
    double N_d2 = cumulative_normal(d2);
    
    // Black-Scholes call formula: C = S0*N(d1) - K*e^(-r*T)*N(d2)
    double call_price = S0 * N_d1 - K * std::exp(-r * T) * N_d2;
    
    return call_price;
}

double bs_put(double S0, double K, double r, double sigma, double T) {
    // Validate input parameters
    if (S0 <= 0.0) {
        throw std::invalid_argument("Stock price S0 must be positive");
    }
    if (K <= 0.0) {
        throw std::invalid_argument("Strike price K must be positive");
    }
    if (sigma < 0.0) {
        throw std::invalid_argument("Volatility sigma must be non-negative");
    }
    if (T <= 0.0) {
        throw std::invalid_argument("Time to maturity T must be positive");
    }
    
    // Handle special case: zero volatility
    if (sigma == 0.0) {
        if (K > S0) {
            return K * std::exp(-r * T) - S0;
        } else {
            return 0.0;
        }
    }
    
    // Calculate d1 and d2
    double sqrt_T = std::sqrt(T);
    double d1 = (std::log(S0 / K) + (r + 0.5 * sigma * sigma) * T) / (sigma * sqrt_T);
    double d2 = d1 - sigma * sqrt_T;
    
    // Calculate cumulative normal distributions
    double N_neg_d1 = cumulative_normal(-d1);
    double N_neg_d2 = cumulative_normal(-d2);
    
    // Black-Scholes put formula: P = K*e^(-r*T)*N(-d2) - S0*N(-d1)
    double put_price = K * std::exp(-r * T) * N_neg_d2 - S0 * N_neg_d1;
    
    return put_price;
}
