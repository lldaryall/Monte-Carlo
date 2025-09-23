#include "payoffs.hpp"
#include <algorithm>

double european_call(double S, double K) {
    return std::max(S - K, 0.0);
}

double european_put(double S, double K) {
    return std::max(K - S, 0.0);
}
