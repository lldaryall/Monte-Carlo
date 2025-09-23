#ifndef BLACK_SCHOLES_HPP
#define BLACK_SCHOLES_HPP

/**
 * @brief Black-Scholes closed-form option pricing functions
 * 
 * This module provides the standard Black-Scholes closed-form solutions
 * for European call and put options. These formulas give exact theoretical
 * prices under the Black-Scholes model assumptions.
 */

/**
 * @brief Calculate cumulative normal distribution using std::erf
 * 
 * Implements the cumulative normal distribution function N(x) using
 * the error function std::erf for numerical stability.
 * 
 * @param x Input value
 * @return double Cumulative normal distribution value N(x)
 */
double cumulative_normal(double x);

/**
 * @brief Price a European call option using Black-Scholes formula
 * 
 * The Black-Scholes formula for a European call option is:
 * C = S0*N(d1) - K*e^(-r*T)*N(d2)
 * 
 * Where:
 * - d1 = [ln(S0/K) + (r + 0.5*σ²)*T] / (σ*√T)
 * - d2 = d1 - σ*√T
 * - N(x) is the cumulative normal distribution function
 * 
 * @param S0 Current stock price
 * @param K Strike price
 * @param r Risk-free interest rate
 * @param sigma Volatility
 * @param T Time to maturity (years)
 * @return double Call option price
 */
double bs_call(double S0, double K, double r, double sigma, double T);

/**
 * @brief Price a European put option using Black-Scholes formula
 * 
 * The Black-Scholes formula for a European put option is:
 * P = K*e^(-r*T)*N(-d2) - S0*N(-d1)
 * 
 * Where:
 * - d1 = [ln(S0/K) + (r + 0.5*σ²)*T] / (σ*√T)
 * - d2 = d1 - σ*√T
 * - N(x) is the cumulative normal distribution function
 * 
 * @param S0 Current stock price
 * @param K Strike price
 * @param r Risk-free interest rate
 * @param sigma Volatility
 * @param T Time to maturity (years)
 * @return double Put option price
 */
double bs_put(double S0, double K, double r, double sigma, double T);

#endif // BLACK_SCHOLES_HPP
