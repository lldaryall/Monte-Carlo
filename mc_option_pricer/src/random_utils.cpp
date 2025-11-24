#include "random_utils.hpp"
#include <random>

double randn() {
    // Thread-local random number engine for thread safety
    thread_local std::mt19937_64 engine(std::random_device{}());
    
    // Standard normal distribution (mean=0, std=1)
    thread_local std::normal_distribution<double> distribution(0.0, 1.0);
    
    return distribution(engine);
}
