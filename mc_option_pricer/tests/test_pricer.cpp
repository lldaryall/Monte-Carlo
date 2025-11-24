#include <iostream>
#include <iomanip>
#include <cmath>
#include <vector>
#include <cassert>
#include "../include/pricer.hpp"
#include "../include/black_scholes.hpp"
#include "../include/gbm.hpp"

/**
 * @brief Simple test framework for Monte Carlo pricer
 * 
 * This test suite verifies:
 * 1. Monte Carlo call prices are within 1% of Black-Scholes
 * 2. Monte Carlo put prices are within 1% of Black-Scholes
 * 3. Variance decreases as the number of paths increases
 */

// Test parameters
const double S0 = 100.0;
const double K = 100.0;
const double r = 0.05;
const double mu = 0.05;
const double sigma = 0.2;
const double T = 1.0;
const int steps = 252;
const int n_paths = 10000000; // 10M paths for better accuracy
const double tolerance = 0.01; // 1% tolerance (STRICT REQUIREMENT)

// Test result structure
struct TestResult {
    bool passed;
    std::string message;
    double expected;
    double actual;
    double error_percent;
};

// Helper function to calculate relative error percentage
double calculate_error_percent(double expected, double actual) {
    return std::abs(actual - expected) / expected * 100.0;
}

// Test call option pricing accuracy
TestResult test_call_accuracy() {
    std::cout << "Testing call option pricing accuracy..." << std::endl;
    
    // Calculate Black-Scholes price
    double bs_price = bs_call(S0, K, r, sigma, T);
    
    // Calculate Monte Carlo price
    GBMParams gbm_params = {S0, sigma, T, steps};
    MCResult mc_result = monte_carlo_price(gbm_params, K, true, n_paths, r);
    
    double error_percent = calculate_error_percent(bs_price, mc_result.price);
    bool passed = error_percent <= tolerance;
    
    TestResult result;
    result.passed = passed;
    result.expected = bs_price;
    result.actual = mc_result.price;
    result.error_percent = error_percent;
    
    if (passed) {
        result.message = "PASSED";
    } else {
        result.message = "FAILED";
    }
    
    return result;
}

// Test put option pricing accuracy
TestResult test_put_accuracy() {
    std::cout << "Testing put option pricing accuracy..." << std::endl;
    
    // Calculate Black-Scholes price
    double bs_price = bs_put(S0, K, r, sigma, T);
    
    // Calculate Monte Carlo price
    GBMParams gbm_params = {S0, sigma, T, steps};
    MCResult mc_result = monte_carlo_price(gbm_params, K, false, n_paths, r);
    
    double error_percent = calculate_error_percent(bs_price, mc_result.price);
    bool passed = error_percent <= tolerance;
    
    TestResult result;
    result.passed = passed;
    result.expected = bs_price;
    result.actual = mc_result.price;
    result.error_percent = error_percent;
    
    if (passed) {
        result.message = "PASSED";
    } else {
        result.message = "FAILED";
    }
    
    return result;
}

// Test variance convergence
TestResult test_variance_convergence() {
    std::cout << "Testing variance convergence..." << std::endl;
    
    GBMParams gbm_params = {S0, sigma, T, steps};
    
    // Test with different numbers of paths
    std::vector<int> path_counts = {10000, 100000, 1000000};
    std::vector<double> variances;
    
    for (int paths : path_counts) {
        MCResult result = monte_carlo_price(gbm_params, K, true, paths, r);
        double variance = result.stderr * result.stderr * paths; // Convert stderr back to variance
        variances.push_back(variance);
        std::cout << "  " << paths << " paths: variance = " << std::scientific << variance << std::endl;
    }
    
    // Check that variance is approximately constant (within 20% tolerance)
    // The variance should be roughly the same regardless of sample size
    bool passed = true;
    double mean_variance = 0.0;
    for (double var : variances) {
        mean_variance += var;
    }
    mean_variance /= variances.size();
    
    for (double var : variances) {
        double relative_error = std::abs(var - mean_variance) / mean_variance;
        if (relative_error > 0.2) { // 20% tolerance
            passed = false;
            break;
        }
    }
    
    TestResult result;
    result.passed = passed;
    result.message = passed ? "PASSED" : "FAILED";
    result.expected = 0.0; // Not applicable for this test
    result.actual = 0.0;   // Not applicable for this test
    result.error_percent = 0.0;
    
    return result;
}

// Test standard error scaling
TestResult test_standard_error_scaling() {
    std::cout << "Testing standard error scaling..." << std::endl;
    
    GBMParams gbm_params = {S0, sigma, T, steps};
    
    // Test with different numbers of paths
    std::vector<int> path_counts = {10000, 100000, 1000000};
    std::vector<double> standard_errors;
    
    for (int paths : path_counts) {
        MCResult result = monte_carlo_price(gbm_params, K, true, paths, r);
        standard_errors.push_back(result.stderr);
        std::cout << "  " << paths << " paths: stderr = " << std::scientific << result.stderr << std::endl;
    }
    
    // Check that standard error decreases as sqrt(n_paths)
    bool passed = true;
    for (size_t i = 1; i < standard_errors.size(); ++i) {
        double expected_ratio = std::sqrt(static_cast<double>(path_counts[i-1]) / path_counts[i]);
        double actual_ratio = standard_errors[i] / standard_errors[i-1];
        double ratio_error = std::abs(actual_ratio - expected_ratio) / expected_ratio;
        
        if (ratio_error > 0.1) { // 10% tolerance for ratio
            passed = false;
            break;
        }
    }
    
    TestResult result;
    result.passed = passed;
    result.message = passed ? "PASSED" : "FAILED";
    result.expected = 0.0; // Not applicable for this test
    result.actual = 0.0;   // Not applicable for this test
    result.error_percent = 0.0;
    
    return result;
}

// Print test result
void print_test_result(const std::string& test_name, const TestResult& result) {
    std::cout << std::endl;
    std::cout << "=== " << test_name << " ===" << std::endl;
    std::cout << "Status: " << result.message << std::endl;
    
    if (result.expected != 0.0 || result.actual != 0.0) {
        std::cout << "Expected: " << std::fixed << std::setprecision(6) << result.expected << std::endl;
        std::cout << "Actual:   " << std::fixed << std::setprecision(6) << result.actual << std::endl;
        std::cout << "Error:    " << std::fixed << std::setprecision(4) << result.error_percent << "%" << std::endl;
    }
    
    std::cout << std::endl;
}

int main() {
    std::cout << "Monte Carlo Pricer Test Suite" << std::endl;
    std::cout << "=============================" << std::endl;
    std::cout << std::endl;
    
    std::cout << "Test Parameters:" << std::endl;
    std::cout << "  S0 = " << S0 << std::endl;
    std::cout << "  K = " << K << std::endl;
    std::cout << "  r = " << r << std::endl;
    std::cout << "  sigma = " << sigma << std::endl;
    std::cout << "  T = " << T << std::endl;
    std::cout << "  steps = " << steps << std::endl;
    std::cout << "  n_paths = " << n_paths << std::endl;
    std::cout << "  tolerance = " << tolerance * 100 << "%" << std::endl;
    std::cout << std::endl;
    
    // Run tests
    TestResult call_test = test_call_accuracy();
    TestResult put_test = test_put_accuracy();
    TestResult variance_test = test_variance_convergence();
    TestResult stderr_test = test_standard_error_scaling();
    
    // Print results
    print_test_result("Call Option Accuracy", call_test);
    print_test_result("Put Option Accuracy", put_test);
    print_test_result("Variance Convergence", variance_test);
    print_test_result("Standard Error Scaling", stderr_test);
    
    // Summary
    int total_tests = 4;
    int passed_tests = (call_test.passed ? 1 : 0) + 
                      (put_test.passed ? 1 : 0) + 
                      (variance_test.passed ? 1 : 0) + 
                      (stderr_test.passed ? 1 : 0);
    
    std::cout << "=== Test Summary ===" << std::endl;
    std::cout << "Passed: " << passed_tests << "/" << total_tests << std::endl;
    
    if (passed_tests == total_tests) {
        std::cout << "All tests PASSED!" << std::endl;
        return 0;
    } else {
        std::cout << "Some tests FAILED!" << std::endl;
        return 1;
    }
}
