#ifndef PRICER_HPP
#define PRICER_HPP

#include "gbm.hpp"

/**
 * @brief Monte Carlo simulation result structure
 * 
 * Contains both the estimated option price and its standard error
 * for statistical analysis and confidence interval construction.
 */
struct MCResult {
    double price;    // Monte Carlo estimate of option price
    double stderr;   // Standard error of the estimate
};

/**
 * @brief Monte Carlo option pricing functions
 * 
 * This module provides Monte Carlo simulation methods for pricing
 * European options using the Geometric Brownian Motion model.
 */

/**
 * @brief Price a European option using Monte Carlo simulation
 * 
 * This function simulates multiple stock price paths using GBM and
 * calculates the option price as the discounted expected payoff.
 * 
 * Algorithm:
 * 1. For each simulation path:
 *    - Generate a complete stock price path using simulate_path()
 *    - Calculate the payoff at maturity (call or put)
 *    - Discount the payoff to present value using exp(-r*T)
 * 2. Calculate the mean and variance of all discounted payoffs
 * 3. Return both the price estimate and its standard error
 * 
 * @param p GBM parameters (S0, mu, sigma, T, steps)
 * @param K Strike price
 * @param call If true, price a call option; if false, price a put option
 * @param n_paths Number of Monte Carlo simulation paths
 * @param r Risk-free interest rate for discounting
 * @return MCResult Structure containing price estimate and standard error
 */
MCResult monte_carlo_price(const GBMParams& p, double K, bool call, int n_paths, double r);

#endif // PRICER_HPP
