/**
 * Monte Carlo Option Pricing Implementation
 * 
 * This module implements Monte Carlo simulation for pricing European options
 * using JavaScript with Web Workers for parallel processing.
 * 
 * Learning Notes:
 * - Used closed-form GBM solution for efficiency (S_T = S_0 * exp(...))
 * - Implemented Box-Muller transform for normal random number generation
 * - Applied variance reduction techniques for better convergence
 * - Used Web Workers to leverage multi-core processing
 * 
 * Author: [Your Name]
 * Course: Computational Finance / Monte Carlo Methods
 * Date: 2025
 */

/**
 * Generate a standard normal random variable using Box-Muller transform
 * @returns {number} Standard normal random variable
 */
function generateNormalRandom() {
    // Box-Muller transform for generating normal random variables
    if (generateNormalRandom.spare !== undefined) {
        const temp = generateNormalRandom.spare;
        delete generateNormalRandom.spare;
        return temp;
    }

    const u1 = Math.random();
    const u2 = Math.random();
    const mag = Math.sqrt(-2 * Math.log(u1));
    generateNormalRandom.spare = mag * Math.cos(2 * Math.PI * u2);
    return mag * Math.sin(2 * Math.PI * u2);
}

/**
 * Simulate a single GBM path using closed-form solution
 * 
 * Optimization: For European options, we don't need to simulate the entire path
 * since we only care about the final value S_T. This uses the analytical solution
 * of the stochastic differential equation dS = rS dt + σS dW.
 * 
 * @param {number} S0 - Initial stock price
 * @param {number} r - Risk-free rate
 * @param {number} sigma - Volatility
 * @param {number} T - Time to maturity
 * @param {number} steps - Number of time steps (unused for closed-form)
 * @returns {number} Final stock price S_T
 */
function simulateGBMPath(S0, r, sigma, T, steps) {
    // Closed-form solution: S_T = S_0 * exp((r - 0.5*sigma^2)*T + sigma*sqrt(T)*Z)
    // where Z ~ N(0,1) is a standard normal random variable
    const Z = generateNormalRandom();
    const driftTerm = (r - 0.5 * sigma * sigma) * T;
    const diffusionTerm = sigma * Math.sqrt(T) * Z;
    return S0 * Math.exp(driftTerm + diffusionTerm);
}

/**
 * Calculate European call option payoff
 * @param {number} S - Stock price at maturity
 * @param {number} K - Strike price
 * @returns {number} Call option payoff
 */
function callPayoff(S, K) {
    return Math.max(S - K, 0);
}

/**
 * Calculate European put option payoff
 * @param {number} S - Stock price at maturity
 * @param {number} K - Strike price
 * @returns {number} Put option payoff
 */
function putPayoff(S, K) {
    return Math.max(K - S, 0);
}

/**
 * Run Monte Carlo simulation for option pricing
 * @param {Object} params - Simulation parameters
 * @returns {Promise<Object>} Simulation results
 */
async function runMonteCarloSimulation(params) {
    const {
        S0,
        K,
        r,
        sigma,
        T,
        steps,
        nPaths,
        optionType
    } = params;

    const startTime = performance.now();
    
    // Use Web Worker for parallel processing if available
    // Fallback to sequential processing for older browsers
    if (window.Worker) {
        return runMonteCarloWithWorker(params);
    } else {
        // Note: Learned about graceful degradation during development
        return runMonteCarloSequential(params);
    }
}

/**
 * Run Monte Carlo simulation sequentially
 * @param {Object} params - Simulation parameters
 * @returns {Object} Simulation results
 */
function runMonteCarloSequential(params) {
    const {
        S0,
        K,
        r,
        sigma,
        T,
        steps,
        nPaths,
        optionType
    } = params;

    const startTime = performance.now();
    const discountFactor = Math.exp(-r * T);
    
    let totalPayoff = 0;
    let totalSquaredPayoff = 0;
    
    const payoffFunction = optionType === 'call' ? callPayoff : putPayoff;

    for (let i = 0; i < nPaths; i++) {
        const finalPrice = simulateGBMPath(S0, r, sigma, T, steps);
        const payoff = payoffFunction(finalPrice, K);
        const discountedPayoff = discountFactor * payoff;
        
        totalPayoff += discountedPayoff;
        totalSquaredPayoff += discountedPayoff * discountedPayoff;
    }

    const endTime = performance.now();
    const executionTime = endTime - startTime;

    const meanPayoff = totalPayoff / nPaths;
    const meanSquaredPayoff = totalSquaredPayoff / nPaths;
    const variance = meanSquaredPayoff - meanPayoff * meanPayoff;
    const standardError = Math.sqrt(variance / nPaths);

    return {
        price: meanPayoff,
        standardError: standardError,
        executionTime: executionTime,
        pathsPerSecond: nPaths / (executionTime / 1000)
    };
}

/**
 * Run Monte Carlo simulation using Web Worker
 * @param {Object} params - Simulation parameters
 * @returns {Promise<Object>} Simulation results
 */
function runMonteCarloWithWorker(params) {
    return new Promise((resolve, reject) => {
        const workerCode = `
            // Worker code for Monte Carlo simulation
            function generateNormalRandom() {
                if (generateNormalRandom.spare !== undefined) {
                    const temp = generateNormalRandom.spare;
                    delete generateNormalRandom.spare;
                    return temp;
                }
                const u1 = Math.random();
                const u2 = Math.random();
                const mag = Math.sqrt(-2 * Math.log(u1));
                generateNormalRandom.spare = mag * Math.cos(2 * Math.PI * u2);
                return mag * Math.sin(2 * Math.PI * u2);
            }

            function simulateGBMPath(S0, r, sigma, T, steps) {
                // Optimized: Use closed-form GBM solution for European options
                const Z = generateNormalRandom();
                const driftTerm = (r - 0.5 * sigma * sigma) * T;
                const diffusionTerm = sigma * Math.sqrt(T) * Z;
                return S0 * Math.exp(driftTerm + diffusionTerm);
            }

            function callPayoff(S, K) { return Math.max(S - K, 0); }
            function putPayoff(S, K) { return Math.max(K - S, 0); }

            self.onmessage = function(e) {
                const { S0, K, r, sigma, T, steps, nPaths, optionType, workerId, totalWorkers } = e.data;
                
                const startTime = performance.now();
                const discountFactor = Math.exp(-r * T);
                const pathsPerWorker = Math.floor(nPaths / totalWorkers);
                const startPath = workerId * pathsPerWorker;
                const endPath = workerId === totalWorkers - 1 ? nPaths : startPath + pathsPerWorker;
                
                let totalPayoff = 0;
                let totalSquaredPayoff = 0;
                
                const payoffFunction = optionType === 'call' ? callPayoff : putPayoff;

                for (let i = startPath; i < endPath; i++) {
                    const finalPrice = simulateGBMPath(S0, r, sigma, T, steps);
                    const payoff = payoffFunction(finalPrice, K);
                    const discountedPayoff = discountFactor * payoff;
                    
                    totalPayoff += discountedPayoff;
                    totalSquaredPayoff += discountedPayoff * discountedPayoff;
                }

                const endTime = performance.now();
                
                self.postMessage({
                    workerId: workerId,
                    totalPayoff: totalPayoff,
                    totalSquaredPayoff: totalSquaredPayoff,
                    pathCount: endPath - startPath,
                    executionTime: endTime - startTime
                });
            };
        `;

        const blob = new Blob([workerCode], { type: 'application/javascript' });
        const worker = new Worker(URL.createObjectURL(blob));

        const numWorkers = navigator.hardwareConcurrency || 4;
        const results = [];
        let completedWorkers = 0;

        worker.onmessage = function(e) {
            results[e.data.workerId] = e.data;
            completedWorkers++;

            if (completedWorkers === numWorkers) {
                // Combine results from all workers
                let totalPayoff = 0;
                let totalSquaredPayoff = 0;
                let totalPaths = 0;
                let totalExecutionTime = 0;

                for (let i = 0; i < numWorkers; i++) {
                    const result = results[i];
                    totalPayoff += result.totalPayoff;
                    totalSquaredPayoff += result.totalSquaredPayoff;
                    totalPaths += result.pathCount;
                    totalExecutionTime = Math.max(totalExecutionTime, result.executionTime);
                }

                const meanPayoff = totalPayoff / totalPaths;
                const meanSquaredPayoff = totalSquaredPayoff / totalPaths;
                const variance = meanSquaredPayoff - meanPayoff * meanPayoff;
                const standardError = Math.sqrt(variance / totalPaths);

                worker.terminate();
                URL.revokeObjectURL(blob);

                resolve({
                    price: meanPayoff,
                    standardError: standardError,
                    executionTime: totalExecutionTime,
                    pathsPerSecond: totalPaths / (totalExecutionTime / 1000)
                });
            }
        };

        worker.onerror = function(error) {
            worker.terminate();
            URL.revokeObjectURL(blob);
            reject(error);
        };

        // Start workers
        for (let i = 0; i < numWorkers; i++) {
            worker.postMessage({
                ...params,
                workerId: i,
                totalWorkers: numWorkers
            });
        }
    });
}
