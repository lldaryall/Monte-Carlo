#include <iostream>
#include <vector>
#include <random>
#include <cmath>
#include <chrono>
#include <iomanip>
#include <string>
#include <cstdlib>
#include "random_utils.hpp"
#include "gbm.hpp"
#include "pricer.hpp"
#include "black_scholes.hpp"

#ifdef _OPENMP
#include <omp.h>
#endif

// Monte Carlo Option Pricing Simulator
// Command-line interface for comparing Monte Carlo vs Black-Scholes pricing

void print_usage(const char* program_name) {
    std::cout << "Usage: " << program_name << " [options]\n";
    std::cout << "Options:\n";
    std::cout << "  -S0 <value>     Initial stock price (default: 100.0)\n";
    std::cout << "  -K <value>      Strike price (default: 100.0)\n";
    std::cout << "  -r <value>      Risk-free rate (default: 0.05)\n";
    std::cout << "  -mu <value>     Drift rate (default: 0.05)\n";
    std::cout << "  -sigma <value>  Volatility (default: 0.2)\n";
    std::cout << "  -T <value>      Time to maturity (default: 1.0)\n";
    std::cout << "  -steps <value>  Number of time steps (default: 252)\n";
    std::cout << "  -paths <value>  Number of Monte Carlo paths (default: 1000000)\n";
    std::cout << "  -h, --help      Show this help message\n";
}

double parse_double(const char* arg, const char* param_name) {
    char* end;
    double value = std::strtod(arg, &end);
    if (*end != '\0') {
        std::cerr << "Error: Invalid value for " << param_name << ": " << arg << std::endl;
        exit(1);
    }
    return value;
}

int parse_int(const char* arg, const char* param_name) {
    char* end;
    long value = std::strtol(arg, &end, 10);
    if (*end != '\0' || value <= 0) {
        std::cerr << "Error: Invalid value for " << param_name << ": " << arg << std::endl;
        exit(1);
    }
    return static_cast<int>(value);
}

// Timing utility class
class Timer {
private:
    std::chrono::high_resolution_clock::time_point start_time;
    std::chrono::high_resolution_clock::time_point end_time;
    bool is_running;

public:
    Timer() : is_running(false) {}
    
    void start() {
        start_time = std::chrono::high_resolution_clock::now();
        is_running = true;
    }
    
    void stop() {
        end_time = std::chrono::high_resolution_clock::now();
        is_running = false;
    }
    
    long long get_elapsed_ms() const {
        auto end = is_running ? std::chrono::high_resolution_clock::now() : end_time;
        return std::chrono::duration_cast<std::chrono::milliseconds>(end - start_time).count();
    }
    
    double get_elapsed_seconds() const {
        auto end = is_running ? std::chrono::high_resolution_clock::now() : end_time;
        return std::chrono::duration<double>(end - start_time).count();
    }
};

// Function to run Monte Carlo simulation with timing
std::pair<std::pair<MCResult, MCResult>, long long> run_monte_carlo_timed(
    const GBMParams& gbm_params, double K, int n_paths, double r) {
    
    Timer timer;
    timer.start();
    
    MCResult mc_call_result = monte_carlo_price(gbm_params, K, true, n_paths, r);
    MCResult mc_put_result = monte_carlo_price(gbm_params, K, false, n_paths, r);
    
    timer.stop();
    
    return std::make_pair(std::make_pair(mc_call_result, mc_put_result), timer.get_elapsed_ms());
}

int main(int argc, char* argv[]) {
    // Default parameters
    double S0 = 100.0;      // Initial stock price
    double K = 100.0;        // Strike price
    double r = 0.05;         // Risk-free rate
    double mu = 0.05;        // Drift rate
    double sigma = 0.2;      // Volatility
    double T = 1.0;          // Time to maturity
    int steps = 252;         // Number of time steps
    int n_paths = 1000000;   // Number of Monte Carlo paths
    
    // Parse command-line arguments
    for (int i = 1; i < argc; ++i) {
        std::string arg = argv[i];
        
        if (arg == "-h" || arg == "--help") {
            print_usage(argv[0]);
            return 0;
        }
        else if (arg == "-S0" && i + 1 < argc) {
            S0 = parse_double(argv[++i], "S0");
        }
        else if (arg == "-K" && i + 1 < argc) {
            K = parse_double(argv[++i], "K");
        }
        else if (arg == "-r" && i + 1 < argc) {
            r = parse_double(argv[++i], "r");
        }
        else if (arg == "-mu" && i + 1 < argc) {
            mu = parse_double(argv[++i], "mu");
        }
        else if (arg == "-sigma" && i + 1 < argc) {
            sigma = parse_double(argv[++i], "sigma");
        }
        else if (arg == "-T" && i + 1 < argc) {
            T = parse_double(argv[++i], "T");
        }
        else if (arg == "-steps" && i + 1 < argc) {
            steps = parse_int(argv[++i], "steps");
        }
        else if (arg == "-paths" && i + 1 < argc) {
            n_paths = parse_int(argv[++i], "paths");
        }
        else {
            std::cerr << "Error: Unknown argument " << arg << std::endl;
            print_usage(argv[0]);
            return 1;
        }
    }
    
    // Validate parameters
    if (S0 <= 0.0 || K <= 0.0 || sigma < 0.0 || T <= 0.0 || steps <= 0 || n_paths <= 0) {
        std::cerr << "Error: All parameters must be positive" << std::endl;
        return 1;
    }
    
    std::cout << "Monte Carlo Option Pricing Simulator" << std::endl;
    std::cout << "====================================" << std::endl;
    std::cout << std::endl;
    
    // Display parameters
    std::cout << "Parameters:" << std::endl;
    std::cout << "  Initial Stock Price (S0): " << S0 << std::endl;
    std::cout << "  Strike Price (K):         " << K << std::endl;
    std::cout << "  Risk-free Rate (r):       " << r << std::endl;
    std::cout << "  Drift Rate (mu):          " << mu << std::endl;
    std::cout << "  Volatility (sigma):       " << sigma << std::endl;
    std::cout << "  Time to Maturity (T):     " << T << std::endl;
    std::cout << "  Time Steps:               " << steps << std::endl;
    std::cout << "  Monte Carlo Paths:        " << n_paths << std::endl;
    std::cout << std::endl;
    
    // Unit test: Print 5 samples from randn()
    std::cout << "Unit Test - Random Normal Samples:" << std::endl;
    std::cout << "  Sample 1: " << std::fixed << std::setprecision(6) << randn() << std::endl;
    std::cout << "  Sample 2: " << std::fixed << std::setprecision(6) << randn() << std::endl;
    std::cout << "  Sample 3: " << std::fixed << std::setprecision(6) << randn() << std::endl;
    std::cout << "  Sample 4: " << std::fixed << std::setprecision(6) << randn() << std::endl;
    std::cout << "  Sample 5: " << std::fixed << std::setprecision(6) << randn() << std::endl;
    std::cout << std::endl;
    
    // Create GBM parameters
    GBMParams gbm_params = {S0, sigma, T, steps};
    
    // Calculate Black-Scholes prices
    double bs_call_price = bs_call(S0, K, r, sigma, T);
    double bs_put_price = bs_put(S0, K, r, sigma, T);
    
    // Run Monte Carlo simulation with timing
    std::cout << "Running Monte Carlo simulation..." << std::endl;
    
    MCResult mc_call_result, mc_put_result;
    long long runtime_ms;
    
#ifdef _OPENMP
    // Get number of threads for display
    int num_threads = omp_get_max_threads();
    std::cout << "  OpenMP enabled with " << num_threads << " threads" << std::endl;
    
    // Run multi-threaded version
    auto result = run_monte_carlo_timed(gbm_params, K, n_paths, r);
    mc_call_result = result.first.first;
    mc_put_result = result.first.second;
    runtime_ms = result.second;
    
    std::cout << "  Multi-threaded Runtime: " << runtime_ms << " ms" << std::endl;
    
    // Run single-threaded version for comparison
    std::cout << "  Running single-threaded version for comparison..." << std::endl;
    omp_set_num_threads(1);
    
    auto single_result = run_monte_carlo_timed(gbm_params, K, n_paths, r);
    long long single_runtime_ms = single_result.second;
    
    std::cout << "  Single-threaded Runtime: " << single_runtime_ms << " ms" << std::endl;
    
    // Calculate speedup
    double speedup = static_cast<double>(single_runtime_ms) / runtime_ms;
    std::cout << "  Speedup: " << std::fixed << std::setprecision(2) << speedup << "x" << std::endl;
    
    // Restore original thread count
    omp_set_num_threads(num_threads);
#else
    // Run single-threaded version (no OpenMP)
    auto result = run_monte_carlo_timed(gbm_params, K, n_paths, r);
    mc_call_result = result.first.first;
    mc_put_result = result.first.second;
    runtime_ms = result.second;
    
    std::cout << "  Single-threaded Runtime: " << runtime_ms << " ms" << std::endl;
#endif
    
    // Calculate relative errors
    double call_error = std::abs(mc_call_result.price - bs_call_price) / bs_call_price * 100.0;
    double put_error = std::abs(mc_put_result.price - bs_put_price) / bs_put_price * 100.0;
    
    // Display results
    std::cout << std::endl;
    std::cout << "Results:" << std::endl;
    std::cout << "=========" << std::endl;
    std::cout << std::endl;
    
    std::cout << "Call Option:" << std::endl;
    std::cout << "  Monte Carlo:  $" << std::fixed << std::setprecision(6) << mc_call_result.price 
              << " ± " << std::fixed << std::setprecision(6) << mc_call_result.stderr << std::endl;
    std::cout << "  Black-Scholes: $" << std::fixed << std::setprecision(6) << bs_call_price << std::endl;
    std::cout << "  Relative Error: " << std::fixed << std::setprecision(4) << call_error << "%" << std::endl;
    std::cout << std::endl;
    
    std::cout << "Put Option:" << std::endl;
    std::cout << "  Monte Carlo:  $" << std::fixed << std::setprecision(6) << mc_put_result.price 
              << " ± " << std::fixed << std::setprecision(6) << mc_put_result.stderr << std::endl;
    std::cout << "  Black-Scholes: $" << std::fixed << std::setprecision(6) << bs_put_price << std::endl;
    std::cout << "  Relative Error: " << std::fixed << std::setprecision(4) << put_error << "%" << std::endl;
    std::cout << std::endl;
    
    std::cout << "Performance:" << std::endl;
    std::cout << "  Runtime: " << runtime_ms << " ms" << std::endl;
    std::cout << "  Paths per second: " << std::fixed << std::setprecision(0) 
              << (n_paths * 1000.0 / runtime_ms) << std::endl;
    
    return 0;
}
