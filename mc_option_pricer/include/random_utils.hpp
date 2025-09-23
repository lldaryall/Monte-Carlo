#ifndef RANDOM_UTILS_HPP
#define RANDOM_UTILS_HPP

/**
 * @brief Random utilities for Monte Carlo simulations
 * 
 * This header provides thread-safe random number generation utilities
 * optimized for Monte Carlo option pricing simulations.
 */

/**
 * @brief Generate a standard normal random variable
 * 
 * Uses thread_local std::mt19937_64 engine with std::normal_distribution
 * for thread-safe, high-quality random number generation.
 * 
 * @return double A standard normal random variable (mean=0, std=1)
 */
double randn();

#endif // RANDOM_UTILS_HPP
