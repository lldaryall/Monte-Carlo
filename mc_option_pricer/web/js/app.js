/**
 * Main Application Controller
 * 
 * This module handles the user interface interactions and coordinates
 * between the Black-Scholes calculator and Monte Carlo simulator.
 */

class OptionPricingApp {
    constructor() {
        this.initializeElements();
        this.bindEvents();
        this.resetForm();
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

    validateInput(input) {
        const value = parseFloat(input.value);
        const min = parseFloat(input.min) || 0;
        const max = parseFloat(input.max) || Infinity;
        
        if (isNaN(value) || value < min || value > max) {
            input.style.borderColor = '#e53e3e';
            this.calculateBtn.disabled = true;
        } else {
            input.style.borderColor = '#e2e8f0';
            this.calculateBtn.disabled = false;
        }
    }

    async calculatePrices() {
        try {
            this.showLoading();
            this.disableForm();
            
            const params = this.getInputParameters();
            
            // Calculate Black-Scholes prices
            const bsCall = bsCall(params.S0, params.K, params.r, params.sigma, params.T);
            const bsPut = bsPut(params.S0, params.K, params.r, params.sigma, params.T);
            
            // Run Monte Carlo simulations
            const startTime = performance.now();
            
            const [mcCallResult, mcPutResult] = await Promise.all([
                runMonteCarloSimulation({ ...params, optionType: 'call' }),
                runMonteCarloSimulation({ ...params, optionType: 'put' })
            ]);
            
            const totalTime = performance.now() - startTime;
            
            // Display results
            this.displayResults({
                bsCall,
                bsPut,
                mcCall: mcCallResult,
                mcPut: mcPutResult,
                executionTime: totalTime
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
        return {
            S0: parseFloat(this.s0Input.value),
            K: parseFloat(this.kInput.value),
            r: parseFloat(this.rInput.value) / 100, // Convert percentage to decimal
            sigma: parseFloat(this.sigmaInput.value) / 100, // Convert percentage to decimal
            T: parseFloat(this.tInput.value),
            steps: parseInt(this.stepsInput.value),
            nPaths: parseInt(this.pathsSelect.value)
        };
    }

    displayResults(results) {
        const { bsCall, bsPut, mcCall, mcPut, executionTime } = results;
        
        // Call option results
        this.mcCallPrice.textContent = `$${mcCall.price.toFixed(6)}`;
        this.mcCallError.textContent = `± $${mcCall.standardError.toFixed(6)}`;
        this.bsCallPrice.textContent = `$${bsCall.toFixed(6)}`;
        
        const callErrorPercent = Math.abs(mcCall.price - bsCall) / bsCall * 100;
        this.callError.textContent = `${callErrorPercent.toFixed(4)}%`;
        this.callError.className = this.getErrorClass(callErrorPercent);
        
        // Put option results
        this.mcPutPrice.textContent = `$${mcPut.price.toFixed(6)}`;
        this.mcPutError.textContent = `± $${mcPut.standardError.toFixed(6)}`;
        this.bsPutPrice.textContent = `$${bsPut.toFixed(6)}`;
        
        const putErrorPercent = Math.abs(mcPut.price - bsPut) / bsPut * 100;
        this.putError.textContent = `${putErrorPercent.toFixed(4)}%`;
        this.putError.className = this.getErrorClass(putErrorPercent);
        
        // Performance metrics
        this.executionTime.textContent = `${executionTime.toFixed(0)} ms`;
        this.pathsPerSecond.textContent = `${(mcCall.pathsPerSecond + mcPut.pathsPerSecond) / 2).toFixed(0)}`;
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
        // Simple error display - could be enhanced with a proper error modal
        alert(message);
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
        // Reset to default values
        this.s0Input.value = '100';
        this.kInput.value = '100';
        this.rInput.value = '5';
        this.sigmaInput.value = '20';
        this.tInput.value = '1.0';
        this.stepsInput.value = '252';
        this.pathsSelect.value = '1000000';
        
        // Reset styling
        const inputs = [this.s0Input, this.kInput, this.rInput, this.sigmaInput, this.tInput, this.stepsInput];
        inputs.forEach(input => {
            input.style.borderColor = '#e2e8f0';
        });
        
        // Hide results
        this.resultsDiv.classList.add('hidden');
        this.loadingDiv.classList.add('hidden');
        
        // Enable form
        this.enableForm();
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
