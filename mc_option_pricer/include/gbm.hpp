#ifndef GBM_HPP
#define GBM_HPP

#include <vector>

/**
 * @brief Geometric Brownian Motion (GBM) parameters
 * 
 * This structure contains all the parameters needed to simulate
 * a stock price path using the GBM model.
 */
struct GBMParams {
    double S0;    // Initial stock price
    double sigma; // Volatility (standard deviation of returns)
    double T;     // Time to maturity (years)
    int steps;    // Number of time steps for discretization
};

/**
 * @brief Simulate a single GBM path
 * 
 * Generates a discretized stock price path using the GBM model:
 * S_{t+1} = S_t * exp((r - 0.5*sigma^2)*dt + sigma*sqrt(dt)*Z)
 * 
 * Where:
 * - dt = T/steps (time step size)
 * - r = risk-free rate (for risk-neutral pricing)
 * - Z ~ N(0,1) (standard normal random variable)
 * 
 * @param p GBM parameters structure
 * @param r Risk-free interest rate
 * @return std::vector<double> Vector containing the simulated stock prices
 *         at each time step (length = steps + 1, including initial price)
 */
std::vector<double> simulate_path(const GBMParams& p, double r);

#endif // GBM_HPP
