#ifndef PAYOFFS_HPP
#define PAYOFFS_HPP

/**
 * @brief European option payoff functions
 * 
 * This module provides payoff functions for European options.
 * These functions calculate the payoff at expiration based on
 * the underlying asset price and strike price.
 */

/**
 * @brief Calculate European call option payoff
 * 
 * The payoff for a European call option is:
 * max(S - K, 0)
 * 
 * Where:
 * - S is the underlying asset price at expiration
 * - K is the strike price
 * 
 * @param S Underlying asset price at expiration
 * @param K Strike price
 * @return double Call option payoff (always non-negative)
 */
double european_call(double S, double K);

/**
 * @brief Calculate European put option payoff
 * 
 * The payoff for a European put option is:
 * max(K - S, 0)
 * 
 * Where:
 * - S is the underlying asset price at expiration
 * - K is the strike price
 * 
 * @param S Underlying asset price at expiration
 * @param K Strike price
 * @return double Put option payoff (always non-negative)
 */
double european_put(double S, double K);

#endif // PAYOFFS_HPP
