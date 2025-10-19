/**
 * Black-Scholes Option Pricing Implementation
 * 
 * Implements the Black-Scholes-Merton model for pricing European options.
 * This is the analytical solution to the Black-Scholes partial differential equation.
 * 
 * Mathematical Foundation:
 * - Assumes log-normal distribution of stock prices
 * - Risk-neutral valuation framework
 * - No-arbitrage pricing principle
 * 
 * Author: [Your Name]
 * Course: Derivatives Pricing / Financial Mathematics
 * Date: 2025
 */

/**
 * Calculate cumulative normal distribution using Abramowitz-Stegun approximation
 * 
 * This is a high-precision approximation of the standard normal CDF.
 * The Abramowitz-Stegun method provides accuracy to ~7 decimal places,
 * which is sufficient for financial calculations.
 * 
 * @param {number} x - Input value
 * @returns {number} Cumulative normal distribution value N(x)
 */
function cumulativeNormal(x) {
    // Abramowitz and Stegun approximation (Handbook of Mathematical Functions)
    const a1 =  0.254829592;
    const a2 = -0.284496736;
    const a3 =  1.421413741;
    const a4 = -1.453152027;
    const a5 =  1.061405429;
    const p  =  0.3275911;

    const sign = x >= 0 ? 1 : -1;
    x = Math.abs(x) / Math.sqrt(2.0);

    const t = 1.0 / (1.0 + p * x);
    const y = 1.0 - (((((a5 * t + a4) * t) + a3) * t + a2) * t + a1) * t * Math.exp(-x * x);

    return 0.5 * (1.0 + sign * y);
}

/**
 * Price a European call option using Black-Scholes formula
 * @param {number} S0 - Current stock price
 * @param {number} K - Strike price
 * @param {number} r - Risk-free interest rate
 * @param {number} sigma - Volatility
 * @param {number} T - Time to maturity (years)
 * @returns {number} Call option price
 */
function bsCall(S0, K, r, sigma, T) {
    // Validate input parameters
    if (S0 <= 0 || K <= 0 || sigma < 0 || T <= 0) {
        throw new Error('Invalid parameters for Black-Scholes calculation');
    }

    // Handle special case: zero volatility
    if (sigma === 0) {
        return Math.max(S0 - K * Math.exp(-r * T), 0);
    }

    // Calculate d1 and d2
    const sqrtT = Math.sqrt(T);
    const d1 = (Math.log(S0 / K) + (r + 0.5 * sigma * sigma) * T) / (sigma * sqrtT);
    const d2 = d1 - sigma * sqrtT;

    // Calculate cumulative normal distributions
    const N_d1 = cumulativeNormal(d1);
    const N_d2 = cumulativeNormal(d2);

    // Black-Scholes call formula: C = S0*N(d1) - K*e^(-r*T)*N(d2)
    const callPrice = S0 * N_d1 - K * Math.exp(-r * T) * N_d2;

    return callPrice;
}

/**
 * Price a European put option using Black-Scholes formula
 * @param {number} S0 - Current stock price
 * @param {number} K - Strike price
 * @param {number} r - Risk-free interest rate
 * @param {number} sigma - Volatility
 * @param {number} T - Time to maturity (years)
 * @returns {number} Put option price
 */
function bsPut(S0, K, r, sigma, T) {
    // Validate input parameters
    if (S0 <= 0 || K <= 0 || sigma < 0 || T <= 0) {
        throw new Error('Invalid parameters for Black-Scholes calculation');
    }

    // Handle special case: zero volatility
    if (sigma === 0) {
        return Math.max(K * Math.exp(-r * T) - S0, 0);
    }

    // Calculate d1 and d2
    const sqrtT = Math.sqrt(T);
    const d1 = (Math.log(S0 / K) + (r + 0.5 * sigma * sigma) * T) / (sigma * sqrtT);
    const d2 = d1 - sigma * sqrtT;

    // Calculate cumulative normal distributions
    const N_neg_d1 = cumulativeNormal(-d1);
    const N_neg_d2 = cumulativeNormal(-d2);

    // Black-Scholes put formula: P = K*e^(-r*T)*N(-d2) - S0*N(-d1)
    const putPrice = K * Math.exp(-r * T) * N_neg_d2 - S0 * N_neg_d1;

    return putPrice;
}

/**
 * Calculate option Greeks (Delta, Gamma, Theta, Vega, Rho)
 * @param {number} S0 - Current stock price
 * @param {number} K - Strike price
 * @param {number} r - Risk-free interest rate
 * @param {number} sigma - Volatility
 * @param {number} T - Time to maturity (years)
 * @param {string} optionType - 'call' or 'put'
 * @returns {Object} Greeks object
 */
function calculateGreeks(S0, K, r, sigma, T, optionType) {
    if (sigma === 0 || T <= 0) {
        return {
            delta: 0,
            gamma: 0,
            theta: 0,
            vega: 0,
            rho: 0
        };
    }

    const sqrtT = Math.sqrt(T);
    const d1 = (Math.log(S0 / K) + (r + 0.5 * sigma * sigma) * T) / (sigma * sqrtT);
    const d2 = d1 - sigma * sqrtT;

    const N_d1 = cumulativeNormal(d1);
    const N_d2 = cumulativeNormal(d2);
    const n_d1 = Math.exp(-0.5 * d1 * d1) / Math.sqrt(2 * Math.PI);

    const delta = optionType === 'call' ? N_d1 : N_d1 - 1;
    const gamma = n_d1 / (S0 * sigma * sqrtT);
    const theta = -(S0 * n_d1 * sigma) / (2 * sqrtT) - 
                  (optionType === 'call' ? 1 : -1) * r * K * Math.exp(-r * T) * N_d2;
    const vega = S0 * n_d1 * sqrtT;
    const rho = (optionType === 'call' ? 1 : -1) * K * T * Math.exp(-r * T) * N_d2;

    return {
        delta: delta,
        gamma: gamma,
        theta: theta / 365, // Convert to per day
        vega: vega / 100,   // Convert to per 1% change in volatility
        rho: rho / 100      // Convert to per 1% change in interest rate
    };
}
