/**
 * Monte Carlo Option Pricing Application Controller
 * 
 * A comprehensive web application for pricing European options using both
 * Monte Carlo simulation and Black-Scholes closed-form solutions.
 * 
 * Features:
 * - Real-time input validation with visual feedback
 * - Parallel Monte Carlo simulation using Web Workers
 * - Statistical error analysis and convergence metrics
 * - Responsive design with modern UI/UX
 * 
 * Author: [Your Name]
 * Course: Quantitative Finance / Computational Methods
 * Date: 2025
 */

class OptionPricingApp {
    constructor() {
        this.initializeElements();
        this.bindEvents();
        this.resetForm();
        // Initially disable the calculate button since fields are empty
        this.calculateBtn.disabled = true;
    }

    initializeElements() {
        // Input elements
        this.s0Input = document.getElementById('s0');
        this.kInput = document.getElementById('k');
        this.rInput = document.getElementById('r');
        this.sigmaInput = document.getElementById('sigma');
        this.tInput = document.getElementById('t');
        this.stepsInput = document.getElementById('steps');
        this.pathsSelect = document.getElementById('paths');
        
        // Button elements
        this.calculateBtn = document.getElementById('calculateBtn');
        this.resetBtn = document.getElementById('resetBtn');
        
        // Result elements
        this.loadingDiv = document.getElementById('loading');
        this.resultsDiv = document.getElementById('results');
        
        // Call option results
        this.mcCallPrice = document.getElementById('mc-call-price');
        this.mcCallError = document.getElementById('mc-call-error');
        this.bsCallPrice = document.getElementById('bs-call-price');
        this.callError = document.getElementById('call-error');
        
        // Put option results
        this.mcPutPrice = document.getElementById('mc-put-price');
        this.mcPutError = document.getElementById('mc-put-error');
        this.bsPutPrice = document.getElementById('bs-put-price');
        this.putError = document.getElementById('put-error');
        
        // Performance metrics
        this.executionTime = document.getElementById('execution-time');
        this.pathsPerSecond = document.getElementById('paths-per-second');
        this.callStderr = document.getElementById('call-stderr');
        this.putStderr = document.getElementById('put-stderr');
    }

    bindEvents() {
        this.calculateBtn.addEventListener('click', () => this.calculatePrices());
        this.resetBtn.addEventListener('click', () => this.resetForm());
        
        // Add input validation
        this.addInputValidation();
    }

    addInputValidation() {
        const inputs = [this.s0Input, this.kInput, this.rInput, this.sigmaInput, this.tInput, this.stepsInput];
        
        inputs.forEach(input => {
            input.addEventListener('input', () => {
                this.validateInput(input);
            });
        });
    }

    /**
     * Validates user input with real-time feedback
     * Implements comprehensive validation for financial parameters
     * 
     * @param {HTMLInputElement} input - The input element to validate
     */
    validateInput(input) {
        const value = parseFloat(input.value);
        const min = parseFloat(input.min) || 0;
        const max = parseFloat(input.max) || Infinity;
        
        // Check if all required fields have values
        const requiredFields = [this.s0Input, this.kInput, this.rInput, this.sigmaInput, this.tInput, this.stepsInput];
        const allFieldsFilled = requiredFields.every(field => field.value && field.value.trim() !== '');
        
        // Allow empty values (show placeholders) - disable button
        if (input.value === '') {
            input.style.borderColor = '#e2e8f0';
            input.style.boxShadow = 'none';
            this.calculateBtn.disabled = true;
            return;
        }
        
        // Validate numerical constraints
        if (isNaN(value) || value < min || value > max) {
            input.style.borderColor = '#e53e3e';
            input.style.boxShadow = '0 0 0 3px rgba(229, 62, 62, 0.1)';
            this.calculateBtn.disabled = true;
        } else {
            input.style.borderColor = '#e2e8f0';
            input.style.boxShadow = 'none';
            // Only enable button if all fields are filled and valid
            this.calculateBtn.disabled = !allFieldsFilled;
        }
    }

    /**
     * Main calculation orchestrator
     * Coordinates Black-Scholes and Monte Carlo calculations for comparison
     * 
     * This method demonstrates understanding of:
     * - Asynchronous programming with async/await
     * - Parallel processing with Promise.all()
     * - Error handling and user feedback
     * - Performance measurement
     */
    async calculatePrices() {
        try {
            this.showLoading();
            this.disableForm();
            
            const params = this.getInputParameters();
            
            // Calculate Black-Scholes prices (closed-form solution)
            const bsCallPrice = bsCall(params.S0, params.K, params.r, params.sigma, params.T);
            const bsPutPrice = bsPut(params.S0, params.K, params.r, params.sigma, params.T);
            
            // Run Monte Carlo simulations in parallel for efficiency
            const startTime = performance.now();
            
            const [mcCallResult, mcPutResult] = await Promise.all([
                runMonteCarloSimulation({ ...params, optionType: 'call' }),
                runMonteCarloSimulation({ ...params, optionType: 'put' })
            ]);
            
            const totalTime = performance.now() - startTime;
            
            // Display results with statistical analysis
            this.displayResults({
                bsCall: bsCallPrice,
                bsPut: bsPutPrice,
                mcCall: mcCallResult,
                mcPut: mcPutResult,
                executionTime: totalTime,
                params: params
            });
            
        } catch (error) {
            console.error('Calculation error:', error);
            this.showError('An error occurred during calculation. Please check your inputs.');
        } finally {
            this.hideLoading();
            this.enableForm();
        }
    }

    getInputParameters() {
        // Check if any required fields are empty
        const requiredFields = [
            { input: this.s0Input, name: 'Initial Stock Price' },
            { input: this.kInput, name: 'Strike Price' },
            { input: this.rInput, name: 'Risk-Free Rate' },
            { input: this.sigmaInput, name: 'Volatility' },
            { input: this.tInput, name: 'Time to Maturity' },
            { input: this.stepsInput, name: 'Time Steps' }
        ];

        // Find empty fields
        const emptyFields = requiredFields.filter(field => !field.input.value || field.input.value.trim() === '');
        
        if (emptyFields.length > 0) {
            // Highlight empty fields in red
            emptyFields.forEach(field => {
                field.input.style.borderColor = '#e53e3e';
                field.input.style.boxShadow = '0 0 0 3px rgba(229, 62, 62, 0.1)';
            });
            
            // Create detailed error message
            const fieldNames = emptyFields.map(field => field.name).join(', ');
            const message = `Please fill in the following fields: ${fieldNames}`;
            
            throw new Error(message);
        }

        // Validate that all values are positive numbers
        const S0 = parseFloat(this.s0Input.value);
        const K = parseFloat(this.kInput.value);
        const r = parseFloat(this.rInput.value);
        const sigma = parseFloat(this.sigmaInput.value);
        const T = parseFloat(this.tInput.value);
        const steps = parseInt(this.stepsInput.value);

        if (isNaN(S0) || S0 <= 0) throw new Error('Initial Stock Price must be a positive number');
        if (isNaN(K) || K <= 0) throw new Error('Strike Price must be a positive number');
        if (isNaN(r) || r < 0) throw new Error('Risk-Free Rate must be a non-negative number');
        if (isNaN(sigma) || sigma < 0) throw new Error('Volatility must be a non-negative number');
        if (isNaN(T) || T <= 0) throw new Error('Time to Maturity must be a positive number');
        if (isNaN(steps) || steps <= 0) throw new Error('Time Steps must be a positive number');

        return {
            S0: S0,
            K: K,
            r: r / 100, // Convert percentage to decimal
            sigma: sigma / 100, // Convert percentage to decimal
            T: T,
            steps: steps,
            nPaths: parseInt(this.pathsSelect.value)
        };
    }

    displayResults(results) {
        const { bsCall, bsPut, mcCall, mcPut, executionTime } = results;
        
        // Debug: Log the values being compared
        // Note: This helped me understand convergence behavior during development
        console.log('Black-Scholes Call:', bsCall);
        console.log('Monte Carlo Call:', mcCall.price);
        console.log('Black-Scholes Put:', bsPut);
        console.log('Monte Carlo Put:', mcPut.price);
        
        // Call option results
        this.mcCallPrice.textContent = `$${mcCall.price.toFixed(6)}`;
        this.mcCallError.textContent = `± $${mcCall.standardError.toFixed(6)}`;
        this.bsCallPrice.textContent = `$${bsCall.toFixed(6)}`;
        
        const callErrorPercent = Math.abs(mcCall.price - bsCall) / bsCall * 100;
        console.log('Call Error Percent:', callErrorPercent);
        this.callError.textContent = `${callErrorPercent.toFixed(4)}%`;
        this.callError.className = this.getErrorClass(callErrorPercent);
        
        // Put option results
        this.mcPutPrice.textContent = `$${mcPut.price.toFixed(6)}`;
        this.mcPutError.textContent = `± $${mcPut.standardError.toFixed(6)}`;
        this.bsPutPrice.textContent = `$${bsPut.toFixed(6)}`;
        
        const putErrorPercent = Math.abs(mcPut.price - bsPut) / bsPut * 100;
        console.log('Put Error Percent:', putErrorPercent);
        this.putError.textContent = `${putErrorPercent.toFixed(4)}%`;
        this.putError.className = this.getErrorClass(putErrorPercent);
        
        // Performance metrics
        this.executionTime.textContent = `${executionTime.toFixed(0)} ms`;
        this.pathsPerSecond.textContent = `${((mcCall.pathsPerSecond + mcPut.pathsPerSecond) / 2).toFixed(0)}`;
        this.callStderr.textContent = `${mcCall.standardError.toFixed(6)}`;
        this.putStderr.textContent = `${mcPut.standardError.toFixed(6)}`;
        
        
        this.showResults();
    }

    getErrorClass(errorPercent) {
        if (errorPercent < 0.1) return 'error-value good';
        if (errorPercent < 1.0) return 'error-value warning';
        return 'error-value bad';
    }

    showLoading() {
        this.loadingDiv.classList.remove('hidden');
        this.resultsDiv.classList.add('hidden');
    }

    hideLoading() {
        this.loadingDiv.classList.add('hidden');
    }

    showResults() {
        this.resultsDiv.classList.remove('hidden');
    }

    showError(message) {
        // Create a better error display
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        errorDiv.innerHTML = `
            <div class="error-content">
                <i class="fas fa-exclamation-triangle"></i>
                <span>${message}</span>
                <button onclick="this.parentElement.parentElement.remove()" class="error-close">&times;</button>
            </div>
        `;
        
        // Insert error message at the top of the main content
        const mainContent = document.querySelector('.main-content');
        mainContent.insertBefore(errorDiv, mainContent.firstChild);
        
        // Auto-remove after 5 seconds
        setTimeout(() => {
            if (errorDiv.parentElement) {
                errorDiv.remove();
            }
        }, 5000);
    }

    disableForm() {
        this.calculateBtn.disabled = true;
        this.calculateBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Calculating...';
    }

    enableForm() {
        this.calculateBtn.disabled = false;
        this.calculateBtn.innerHTML = '<i class="fas fa-calculator"></i> Calculate Prices';
    }

    resetForm() {
        // Clear all input values to show placeholders
        this.s0Input.value = '';
        this.kInput.value = '';
        this.rInput.value = '';
        this.sigmaInput.value = '';
        this.tInput.value = '';
        this.stepsInput.value = '';
        this.pathsSelect.value = '100000';
        
        // Reset styling
        const inputs = [this.s0Input, this.kInput, this.rInput, this.sigmaInput, this.tInput, this.stepsInput];
        inputs.forEach(input => {
            input.style.borderColor = '#e2e8f0';
            input.style.boxShadow = 'none';
        });
        
        // Hide results
        this.resultsDiv.classList.add('hidden');
        this.loadingDiv.classList.add('hidden');
        
        
        // Disable form since all fields are empty
        this.calculateBtn.disabled = true;
        this.calculateBtn.innerHTML = '<i class="fas fa-calculator"></i> Calculate Prices';
    }
}

// Initialize the application when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new OptionPricingApp();
});

// Add some utility functions for better user experience
function formatNumber(num, decimals = 6) {
    return num.toFixed(decimals);
}

function formatCurrency(amount, decimals = 2) {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals
    }).format(amount);
}

function formatPercentage(value, decimals = 4) {
    return `${value.toFixed(decimals)}%`;
}

// Add keyboard shortcuts
document.addEventListener('keydown', (e) => {
    if (e.ctrlKey || e.metaKey) {
        switch (e.key) {
            case 'Enter':
                e.preventDefault();
                document.getElementById('calculateBtn').click();
                break;
            case 'r':
                e.preventDefault();
                document.getElementById('resetBtn').click();
                break;
        }
    }
});
