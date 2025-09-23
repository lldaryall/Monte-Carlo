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

        this.chart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: ['Call Option', 'Put Option'],
                datasets: [
                    {
                        label: 'Monte Carlo Call',
                        data: [0, 0],
                        backgroundColor: 'rgba(59, 130, 246, 0.8)',
                        borderColor: 'rgba(59, 130, 246, 1)',
                        borderWidth: 2,
                        borderRadius: 4,
                        borderSkipped: false,
                    },
                    {
                        label: 'Black-Scholes Call',
                        data: [0, 0],
                        backgroundColor: 'rgba(239, 68, 68, 0.8)',
                        borderColor: 'rgba(239, 68, 68, 1)',
                        borderWidth: 2,
                        borderRadius: 4,
                        borderSkipped: false,
                    },
                    {
                        label: 'Monte Carlo Put',
                        data: [0, 0],
                        backgroundColor: 'rgba(16, 185, 129, 0.8)',
                        borderColor: 'rgba(16, 185, 129, 1)',
                        borderWidth: 2,
                        borderRadius: 4,
                        borderSkipped: false,
                    },
                    {
                        label: 'Black-Scholes Put',
                        data: [0, 0],
                        backgroundColor: 'rgba(245, 158, 11, 0.8)',
                        borderColor: 'rgba(245, 158, 11, 1)',
                        borderWidth: 2,
                        borderRadius: 4,
                        borderSkipped: false,
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    title: {
                        display: true,
                        text: 'Option Pricing Comparison: Monte Carlo vs Black-Scholes',
                        font: {
                            size: 16,
                            weight: 'bold'
                        },
                        color: '#1e293b'
                    },
                    legend: {
                        display: false // We have custom legend in HTML
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
                            text: 'Option Type',
                            font: {
                                size: 14,
                                weight: 'bold'
                            },
                            color: '#64748b'
                        },
                        grid: {
                            display: false
                        },
                        ticks: {
                            color: '#64748b',
                            font: {
                                size: 12,
                                weight: '500'
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
                        beginAtZero: false, // Don't force zero start
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

        const { bsCall, bsPut, mcCall, mcPut } = results;

        // Update the data
        this.chart.data.datasets[0].data = [mcCall.price, 0]; // Monte Carlo Call
        this.chart.data.datasets[1].data = [bsCall, 0]; // Black-Scholes Call
        this.chart.data.datasets[2].data = [0, mcPut.price]; // Monte Carlo Put
        this.chart.data.datasets[3].data = [0, bsPut]; // Black-Scholes Put

        // Calculate dynamic scale range
        const allValues = [mcCall.price, bsCall, mcPut.price, bsPut].filter(v => v > 0);
        if (allValues.length > 0) {
            const minValue = Math.min(...allValues);
            const maxValue = Math.max(...allValues);
            const range = maxValue - minValue;
            const padding = range * 0.1; // 10% padding
            
            // Update Y-axis scale
            this.chart.options.scales.y.min = Math.max(0, minValue - padding);
            this.chart.options.scales.y.max = maxValue + padding;
        }

        // Update the chart
        this.chart.update('active');
    }

    clearChart() {
        if (!this.chart) return;

        // Reset all data to zero
        this.chart.data.datasets.forEach(dataset => {
            dataset.data = [0, 0];
        });

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
});

// Export for use in other modules
window.OptionPricingChart = OptionPricingChart;
