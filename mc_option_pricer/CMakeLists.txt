cmake_minimum_required(VERSION 3.10)
project(mc_option_pricer)

# Set C++ standard
set(CMAKE_CXX_STANDARD 17)
set(CMAKE_CXX_STANDARD_REQUIRED ON)

# Set optimization flags
set(CMAKE_CXX_FLAGS_RELEASE "-O3 -DNDEBUG")
set(CMAKE_CXX_FLAGS_DEBUG "-g -O0")

# Check for OpenMP support
find_package(OpenMP)
if(OpenMP_CXX_FOUND)
    message(STATUS "OpenMP found - enabling parallel processing")
    set(CMAKE_CXX_FLAGS "${CMAKE_CXX_FLAGS} ${OpenMP_CXX_FLAGS}")
    add_definitions(-DUSE_OPENMP)
else()
    message(STATUS "OpenMP not found - using sequential processing")
endif()

# Include directories
include_directories(include)

# Source files
set(SOURCES
    src/main.cpp
    src/random_utils.cpp
    src/gbm.cpp
    src/payoffs.cpp
    src/pricer.cpp
    src/black_scholes.cpp
)

# Create executable
add_executable(mc_option_pricer ${SOURCES})

# Link OpenMP if available
if(OpenMP_CXX_FOUND)
    target_link_libraries(mc_option_pricer OpenMP::OpenMP_CXX)
endif()

# Set default build type to Release for better performance
if(NOT CMAKE_BUILD_TYPE)
    set(CMAKE_BUILD_TYPE Release)
endif()

# Print build configuration
message(STATUS "Build type: ${CMAKE_BUILD_TYPE}")
message(STATUS "C++ standard: ${CMAKE_CXX_STANDARD}")
message(STATUS "C++ flags: ${CMAKE_CXX_FLAGS}")

# Test executable
add_executable(test_pricer
    tests/test_pricer.cpp
    src/random_utils.cpp
    src/gbm.cpp
    src/payoffs.cpp
    src/pricer.cpp
    src/black_scholes.cpp
)

# Link OpenMP to test executable if available
if(OpenMP_CXX_FOUND)
    target_link_libraries(test_pricer OpenMP::OpenMP_CXX)
endif()

# Enable testing
enable_testing()
add_test(NAME pricer_tests COMMAND test_pricer)
