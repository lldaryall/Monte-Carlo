/**
 * Chart Visualization for Monte Carlo Option Pricing Results
 * 
 * This module provides interactive chart visualization using Chart.js
 * to display option pricing results and comparisons.
 */

class OptionPricingChart {
    constructor() {
        this.chart = null;
        this.initializeChart();
    }

    initializeChart() {
        const ctx = document.getElementById('resultsChart');
        if (!ctx) {
            console.error('Chart canvas not found');
            return;
        }
        
        console.log('Initializing chart...');

        this.chart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: [],
                datasets: [
                    {
                        label: 'Monte Carlo Call',
                        data: [],
                        borderColor: 'rgba(59, 130, 246, 1)',
                        backgroundColor: 'rgba(59, 130, 246, 0.1)',
                        borderWidth: 2,
                        fill: false,
                        tension: 0.1,
                        pointRadius: 3,
                        pointHoverRadius: 5,
                        hidden: false
                    },
                    {
                        label: 'Black-Scholes Call (Target)',
                        data: [],
                        borderColor: 'rgba(239, 68, 68, 1)',
                        backgroundColor: 'rgba(239, 68, 68, 0.1)',
                        borderWidth: 2,
                        borderDash: [5, 5],
                        fill: false,
                        tension: 0,
                        pointRadius: 0,
                        pointHoverRadius: 0,
                        hidden: false
                    },
                    {
                        label: 'Monte Carlo Put',
                        data: [],
                        borderColor: 'rgba(16, 185, 129, 1)',
                        backgroundColor: 'rgba(16, 185, 129, 0.1)',
                        borderWidth: 2,
                        fill: false,
                        tension: 0.1,
                        pointRadius: 3,
                        pointHoverRadius: 5,
                        hidden: false
                    },
                    {
                        label: 'Black-Scholes Put (Target)',
                        data: [],
                        borderColor: 'rgba(245, 158, 11, 1)',
                        backgroundColor: 'rgba(245, 158, 11, 0.1)',
                        borderWidth: 2,
                        borderDash: [5, 5],
                        fill: false,
                        tension: 0,
                        pointRadius: 0,
                        pointHoverRadius: 0,
                        hidden: false
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    title: {
                        display: true,
                        text: 'Monte Carlo Convergence to Black-Scholes',
                        font: {
                            size: 16,
                            weight: 'bold'
                        },
                        color: '#1e293b'
                    },
                    legend: {
                        display: true,
                        position: 'top',
                        labels: {
                            usePointStyle: true,
                            pointStyle: 'circle',
                            padding: 20,
                            font: {
                                size: 12,
                                weight: '500'
                            }
                        },
                        onClick: (e, legendItem, legend) => {
                            const index = legendItem.datasetIndex;
                            const ci = legend.chart;
                            if (ci.isDatasetVisible(index)) {
                                ci.hide(index);
                                legendItem.hidden = true;
                            } else {
                                ci.show(index);
                                legendItem.hidden = false;
                            }
                        }
                    },
                    tooltip: {
                        backgroundColor: 'rgba(0, 0, 0, 0.8)',
                        titleColor: '#ffffff',
                        bodyColor: '#ffffff',
                        borderColor: '#e2e8f0',
                        borderWidth: 1,
                        callbacks: {
                            label: function(context) {
                                const value = context.parsed.y;
                                const label = context.dataset.label;
                                return `${label}: $${value.toFixed(6)}`;
                            }
                        }
                    }
                },
                scales: {
                    x: {
                        title: {
                            display: true,
                            text: 'Number of Paths',
                            font: {
                                size: 14,
                                weight: 'bold'
                            },
                            color: '#64748b'
                        },
                        type: 'logarithmic',
                        grid: {
                            color: 'rgba(148, 163, 184, 0.2)',
                            drawBorder: false
                        },
                        ticks: {
                            color: '#64748b',
                            font: {
                                size: 12,
                                weight: '500'
                            },
                            callback: function(value) {
                                return value.toLocaleString();
                            }
                        }
                    },
                    y: {
                        title: {
                            display: true,
                            text: 'Option Price ($)',
                            font: {
                                size: 14,
                                weight: 'bold'
                            },
                            color: '#64748b'
                        },
                        beginAtZero: false,
                        grid: {
                            color: 'rgba(148, 163, 184, 0.2)',
                            drawBorder: false
                        },
                        ticks: {
                            color: '#64748b',
                            font: {
                                size: 12
                            },
                            callback: function(value) {
                                return '$' + value.toFixed(2);
                            }
                        }
                    }
                },
                animation: {
                    duration: 1000,
                    easing: 'easeInOutQuart'
                },
                interaction: {
                    intersect: false,
                    mode: 'index'
                }
            }
        });
    }

    updateChart(results) {
        if (!this.chart) {
            console.error('Chart not initialized');
            return;
        }

        console.log('Updating chart with results:', results);
        const { bsCall, bsPut, mcCall, mcPut, params } = results;

        // Generate convergence data points
        const pathCounts = [100, 500, 1000, 2000, 5000, 10000, 20000, 50000, 100000, 200000, 500000, 1000000];
        const convergenceData = this.generateConvergenceData(params, pathCounts, bsCall, bsPut);

        // Update chart data
        this.chart.data.labels = pathCounts.map(count => count.toLocaleString());
        
        // Monte Carlo Call convergence
        this.chart.data.datasets[0].data = convergenceData.mcCall;
        
        // Black-Scholes Call target (horizontal line)
        this.chart.data.datasets[1].data = new Array(pathCounts.length).fill(bsCall);
        
        // Monte Carlo Put convergence
        this.chart.data.datasets[2].data = convergenceData.mcPut;
        
        // Black-Scholes Put target (horizontal line)
        this.chart.data.datasets[3].data = new Array(pathCounts.length).fill(bsPut);

        // Calculate dynamic scale range
        const allValues = [...convergenceData.mcCall, ...convergenceData.mcPut, bsCall, bsPut];
        const minValue = Math.min(...allValues);
        const maxValue = Math.max(...allValues);
        const range = maxValue - minValue;
        const padding = range * 0.1; // 10% padding
        
        // Update Y-axis scale
        this.chart.options.scales.y.min = Math.max(0, minValue - padding);
        this.chart.options.scales.y.max = maxValue + padding;

        // Update the chart
        this.chart.update('active');
    }

    generateConvergenceData(params, pathCounts, bsCall, bsPut) {
        const mcCallData = [];
        const mcPutData = [];
        
        // Use the same parameters but with different path counts
        for (const pathCount of pathCounts) {
            // Run Monte Carlo simulation for this path count
            const mcResult = this.runMonteCarloForPaths(params, pathCount);
            mcCallData.push(mcResult.callPrice);
            mcPutData.push(mcResult.putPrice);
        }
        
        return {
            mcCall: mcCallData,
            mcPut: mcPutData
        };
    }

    runMonteCarloForPaths(params, pathCount) {
        // Simplified Monte Carlo for convergence testing
        const { S0, K, r, sigma, T } = params;
        const discountFactor = Math.exp(-r * T);
        
        let callSum = 0;
        let putSum = 0;
        let callSumSquared = 0;
        let putSumSquared = 0;
        
        for (let i = 0; i < pathCount; i++) {
            // Generate final stock price using GBM
            const Z = this.generateNormalRandom();
            const driftTerm = (r - 0.5 * sigma * sigma) * T;
            const diffusionTerm = sigma * Math.sqrt(T) * Z;
            const finalPrice = S0 * Math.exp(driftTerm + diffusionTerm);
            
            // Calculate payoffs
            const callPayoff = Math.max(finalPrice - K, 0);
            const putPayoff = Math.max(K - finalPrice, 0);
            
            const discountedCall = discountFactor * callPayoff;
            const discountedPut = discountFactor * putPayoff;
            
            callSum += discountedCall;
            putSum += discountedPut;
            callSumSquared += discountedCall * discountedCall;
            putSumSquared += discountedPut * discountedPut;
        }
        
        return {
            callPrice: callSum / pathCount,
            putPrice: putSum / pathCount
        };
    }

    generateNormalRandom() {
        // Box-Muller transform
        if (this.spare !== undefined) {
            const temp = this.spare;
            delete this.spare;
            return temp;
        }
        const u1 = Math.random();
        const u2 = Math.random();
        const mag = Math.sqrt(-2 * Math.log(u1));
        this.spare = mag * Math.cos(2 * Math.PI * u2);
        return mag * Math.sin(2 * Math.PI * u2);
    }

    clearChart() {
        if (!this.chart) return;

        // Reset all data to empty
        this.chart.data.labels = [];
        this.chart.data.datasets[0].data = []; // Monte Carlo Call
        this.chart.data.datasets[1].data = []; // Black-Scholes Call
        this.chart.data.datasets[2].data = []; // Monte Carlo Put
        this.chart.data.datasets[3].data = []; // Black-Scholes Put

        // Reset scale to default
        this.chart.options.scales.y.min = 0;
        this.chart.options.scales.y.max = 10;

        this.chart.update('active');
    }

    addErrorBars(results) {
        // This could be enhanced to show confidence intervals
        // For now, we'll just show the point estimates
        this.updateChart(results);
    }

    destroy() {
        if (this.chart) {
            this.chart.destroy();
            this.chart = null;
        }
    }
}

// Create a global instance
let optionChart = null;

// Initialize chart when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    optionChart = new OptionPricingChart();
    
    // Add chart control event listeners
    const showAllBtn = document.getElementById('showAllBtn');
    const hideAllBtn = document.getElementById('hideAllBtn');
    const showCallOnlyBtn = document.getElementById('showCallOnlyBtn');
    const showPutOnlyBtn = document.getElementById('showPutOnlyBtn');
    
    if (showAllBtn) {
        showAllBtn.addEventListener('click', () => {
            if (optionChart && optionChart.chart) {
                optionChart.chart.data.datasets.forEach((dataset, index) => {
                    optionChart.chart.show(index);
                });
                optionChart.chart.update();
            }
        });
    }
    
    if (hideAllBtn) {
        hideAllBtn.addEventListener('click', () => {
            if (optionChart && optionChart.chart) {
                optionChart.chart.data.datasets.forEach((dataset, index) => {
                    optionChart.chart.hide(index);
                });
                optionChart.chart.update();
            }
        });
    }
    
    if (showCallOnlyBtn) {
        showCallOnlyBtn.addEventListener('click', () => {
            if (optionChart && optionChart.chart) {
                // Show only call options (datasets 0 and 1)
                optionChart.chart.data.datasets.forEach((dataset, index) => {
                    if (index === 0 || index === 1) {
                        optionChart.chart.show(index);
                    } else {
                        optionChart.chart.hide(index);
                    }
                });
                optionChart.chart.update();
            }
        });
    }
    
    if (showPutOnlyBtn) {
        showPutOnlyBtn.addEventListener('click', () => {
            if (optionChart && optionChart.chart) {
                // Show only put options (datasets 2 and 3)
                optionChart.chart.data.datasets.forEach((dataset, index) => {
                    if (index === 2 || index === 3) {
                        optionChart.chart.show(index);
                    } else {
                        optionChart.chart.hide(index);
                    }
                });
                optionChart.chart.update();
            }
        });
    }
});

// Export for use in other modules
window.OptionPricingChart = OptionPricingChart;
