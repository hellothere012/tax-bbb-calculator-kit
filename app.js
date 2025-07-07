// Initialize Lucide icons
lucide.createIcons();

// Global state
let calculatorData = {
    qbi: { beforeBBB: 0, afterBBB: 0, savings: 0 },
    vehicle: { beforeBBB: 0, afterBBB: 0, savings: 0 },
    asset: { beforeBBB: 0, afterBBB: 0, savings: 0 }
};

// Validation rules for all input fields
const validationRules = {
    businessIncome: { 
        min: 0, 
        max: 10000000, 
        required: true,
        displayName: "Business Income",
        type: "currency"
    },
    taxableIncome: { 
        min: 0, 
        max: 10000000, 
        required: true,
        displayName: "Total Taxable Income",
        type: "currency"
    },
    w2Wages: { 
        min: 0, 
        max: 5000000, 
        required: false,
        displayName: "W-2 Wages",
        type: "currency"
    },
    vehicleCost: { 
        min: 0, 
        max: 200000, 
        required: true,
        displayName: "Vehicle Cost",
        type: "currency"
    },
    vehicleAPR: { 
        min: 0, 
        max: 25, 
        required: true,
        displayName: "Vehicle Loan APR",
        type: "percentage",
        step: 0.1
    },
    yearPurchased: { 
        min: 2023, 
        max: 2028, 
        required: true,
        displayName: "Year Purchased",
        type: "year"
    },
    assetCost: { 
        min: 0, 
        max: 5000000, 
        required: true,
        displayName: "Asset Cost",
        type: "currency"
    },
    assetAPR: { 
        min: 0, 
        max: 25, 
        required: true,
        displayName: "Asset Loan APR",
        type: "percentage",
        step: 0.1
    },
    downPayment: { 
        min: 0, 
        max: 1000000, 
        required: false,
        displayName: "Down Payment",
        type: "currency"
    },
    loanTerm: { 
        min: 1, 
        max: 30, 
        required: true,
        displayName: "Loan Term",
        type: "integer"
    }
};

// Core validation function
function validateNumericInput(value, fieldName, rules) {
    // Handle empty values
    if (value === '' || value === null || value === undefined) {
        if (rules.required) {
            return { 
                valid: false, 
                message: `${rules.displayName} is required`,
                value: null 
            };
        } else {
            return { 
                valid: true, 
                message: null,
                value: 0 
            };
        }
    }
    
    // Convert to number
    const numValue = parseFloat(value);
    
    // Check if numeric
    if (isNaN(numValue)) {
        return { 
            valid: false, 
            message: `${rules.displayName} must be a valid number`,
            value: null 
        };
    }
    
    // Check minimum bound
    if (numValue < rules.min) {
        const minDisplay = rules.min >= 1000 ? `${rules.min.toLocaleString()}` : rules.min;
        return { 
            valid: false, 
            message: `${rules.displayName} cannot be less than ${minDisplay}`,
            value: null 
        };
    }
    
    // Check maximum bound
    if (numValue > rules.max) {
        const maxDisplay = rules.max >= 1000 ? `${rules.max.toLocaleString()}` : rules.max;
        return { 
            valid: false, 
            message: `${rules.displayName} cannot exceed ${maxDisplay}`,
            value: null 
        };
    }
    
    // Additional validation for integer types
    if (rules.type === 'integer' && !Number.isInteger(numValue)) {
        return { 
            valid: false, 
            message: `${rules.displayName} must be a whole number`,
            value: null 
        };
    }
    
    // Additional validation for year type
    if (rules.type === 'year' && (numValue < 2023 || numValue > 2028)) {
        return { 
            valid: false, 
            message: `${rules.displayName} must be between 2023 and 2028`,
            value: null 
        };
    }
    
    return { 
        valid: true, 
        message: null,
        value: numValue 
    };
}

// Error display system
function showFieldError(fieldId, message) {
    const field = document.getElementById(fieldId);
    if (!field) return;
    
    // Add error styling to input
    field.classList.add('border-red-500', 'bg-red-900');
    field.classList.remove('border-gray-600', 'bg-gray-700');
    
    // Create or update error message
    let errorDiv = document.getElementById(`${fieldId}-error`);
    if (!errorDiv) {
        errorDiv = document.createElement('div');
        errorDiv.id = `${fieldId}-error`;
        errorDiv.className = 'text-red-400 text-sm mt-1';
        errorDiv.setAttribute('role', 'alert');
        errorDiv.setAttribute('aria-live', 'polite');
        
        // Insert after the input field
        const inputContainer = field.closest('.mb-6') || field.parentNode;
        inputContainer.appendChild(errorDiv);
    }
    
    errorDiv.textContent = message;
    errorDiv.classList.remove('hidden');
}

function hideFieldError(fieldId) {
    const field = document.getElementById(fieldId);
    if (!field) return;
    
    // Remove error styling from input
    field.classList.remove('border-red-500', 'bg-red-900');
    field.classList.add('border-gray-600', 'bg-gray-700');
    
    // Hide error message
    const errorDiv = document.getElementById(`${fieldId}-error`);
    if (errorDiv) {
        errorDiv.classList.add('hidden');
    }
}

function clearAllErrors() {
    // Clear all field errors
    Object.keys(validationRules).forEach(fieldId => {
        hideFieldError(fieldId);
    });
    
    // Clear any calculation errors
    const calculationError = document.getElementById('calculation-error');
    if (calculationError) {
        calculationError.classList.add('hidden');
    }
}

function showCalculationError(message) {
    let errorDiv = document.getElementById('calculation-error');
    if (!errorDiv) {
        errorDiv = document.createElement('div');
        errorDiv.id = 'calculation-error';
        errorDiv.className = 'bg-red-900 border border-red-700 text-red-300 p-4 rounded-lg mb-4';
        errorDiv.setAttribute('role', 'alert');
        errorDiv.setAttribute('aria-live', 'polite');
        
        // Insert at the top of the main content
        const mainContent = document.querySelector('main');
        mainContent.insertBefore(errorDiv, mainContent.firstChild);
    }
    
    errorDiv.textContent = message;
    errorDiv.classList.remove('hidden');
    
    // Auto-hide after 5 seconds
    setTimeout(() => {
        errorDiv.classList.add('hidden');
    }, 5000);
}

// Enhanced input event handlers
function initializeValidatedInputs() {
    const inputFields = Object.keys(validationRules);
    
    inputFields.forEach(fieldId => {
        const input = document.getElementById(fieldId);
        if (!input) return;
        
        // Add input event listener for real-time validation
        input.addEventListener('input', (e) => {
            const rules = validationRules[fieldId];
            const validation = validateNumericInput(e.target.value, fieldId, rules);
            
            if (validation.valid) {
                hideFieldError(fieldId);
                // Trigger calculation update if all required fields are valid
                if (shouldUpdateCalculations()) {
                    updateCalculations();
                }
            } else {
                showFieldError(fieldId, validation.message);
                // Clear calculations if there are validation errors
                clearCalculations();
            }
        });
        
        // Add blur event listener for formatting
        input.addEventListener('blur', (e) => {
            const rules = validationRules[fieldId];
            const validation = validateNumericInput(e.target.value, fieldId, rules);
            
            if (validation.valid && validation.value !== 0) {
                // Format the display value based on type
                if (rules.type === 'currency' && validation.value >= 1000) {
                    e.target.value = validation.value.toLocaleString();
                } else if (rules.type === 'percentage') {
                    e.target.value = validation.value.toString();
                } else if (rules.type === 'integer' || rules.type === 'year') {
                    e.target.value = validation.value.toString();
                } else {
                    e.target.value = validation.value.toString();
                }
            }
        });
        
        // Add focus event listener to remove formatting for editing
        input.addEventListener('focus', (e) => {
            const value = e.target.value.replace(/,/g, ''); // Remove commas for editing
            if (!isNaN(parseFloat(value))) {
                e.target.value = value;
            }
        });
        
        // Add keydown event listener for Enter key
        input.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                // Move to next input or trigger calculation
                const nextInput = findNextInput(fieldId);
                if (nextInput) {
                    nextInput.focus();
                } else {
                    updateCalculations();
                }
            }
        });
    });
}

function shouldUpdateCalculations() {
    // Check if all required fields have valid values
    const requiredFields = Object.keys(validationRules).filter(fieldId => {
        const field = document.getElementById(fieldId);
        return field && validationRules[fieldId].required;
    });
    
    return requiredFields.every(fieldId => {
        const input = document.getElementById(fieldId);
        if (!input) return false;
        
        const rules = validationRules[fieldId];
        const validation = validateNumericInput(input.value, fieldId, rules);
        return validation.valid;
    });
}

function findNextInput(currentFieldId) {
    const inputFields = Object.keys(validationRules);
    const currentIndex = inputFields.indexOf(currentFieldId);
    
    // Find next visible input field
    for (let i = currentIndex + 1; i < inputFields.length; i++) {
        const nextField = document.getElementById(inputFields[i]);
        if (nextField && nextField.offsetParent !== null) { // Check if field is visible
            return nextField;
        }
    }
    
    return null;
}

function clearCalculations() {
    // Clear all calculation results
    calculatorData = {
        qbi: { beforeBBB: 0, afterBBB: 0, savings: 0 },
        vehicle: { beforeBBB: 0, afterBBB: 0, savings: 0 },
        asset: { beforeBBB: 0, afterBBB: 0, savings: 0 }
    };
    
    updateTotalSavings();
    updateDisplayResults();
}

function updateDisplayResults() {
    // Update QBI display
    document.getElementById('qbiBeforeBBB').textContent = formatCurrency(calculatorData.qbi.beforeBBB);
    document.getElementById('qbiAfterBBB').textContent = formatCurrency(calculatorData.qbi.afterBBB);
    document.getElementById('qbiSavings').textContent = formatCurrency(calculatorData.qbi.savings);
    
    // Update Vehicle display
    document.getElementById('vehicleBeforeBBB').textContent = formatCurrency(calculatorData.vehicle.beforeBBB);
    document.getElementById('vehicleAfterBBB').textContent = formatCurrency(calculatorData.vehicle.afterBBB);
    document.getElementById('vehicleSavings').textContent = formatCurrency(calculatorData.vehicle.savings);
    
    // Update Asset display
    document.getElementById('assetBeforeBBB').textContent = formatCurrency(calculatorData.asset.beforeBBB);
    document.getElementById('assetAfterBBB').textContent = formatCurrency(calculatorData.asset.afterBBB);
    document.getElementById('assetSavings').textContent = formatCurrency(calculatorData.asset.savings);
}

function updateCalculations() {
    // Run appropriate calculations based on current tab
    const activeTab = document.querySelector('.tab-content.active');
    if (!activeTab) return;
    
    const tabId = activeTab.id;
    if (tabId === 'qbi-tab') {
        safeCalculateQBI();
    } else if (tabId === 'vehicle-tab') {
        safeCalculateVehicle();
    } else if (tabId === 'asset-tab') {
        safeCalculateAsset();
    }
}

// Safe calculation wrappers with error handling
function safeCalculateQBI() {
    try {
        calculateQBI();
    } catch (error) {
        console.error('QBI calculation error:', error);
        showCalculationError('An error occurred while calculating QBI deduction. Please check your inputs.');
    }
}

function safeCalculateVehicle() {
    try {
        calculateVehicle();
    } catch (error) {
        console.error('Vehicle calculation error:', error);
        showCalculationError('An error occurred while calculating vehicle loan benefits. Please check your inputs.');
    }
}

function safeCalculateAsset() {
    try {
        calculateAsset();
    } catch (error) {
        console.error('Asset calculation error:', error);
        showCalculationError('An error occurred while calculating asset financing benefits. Please check your inputs.');
    }
}

// Help content data
const helpContent = {
    'business-income': {
        title: 'Business Income',
        content: 'This is your <strong>net profit</strong> after expenses. Look at IRS Schedule C, Line 31. This is your total business revenue minus all business expenses.<br><br><em>BBB Section 70105 provides enhanced QBI deduction with $400 minimum for active businesses.</em>'
    },
    'taxable-income': {
        title: 'Total Taxable Income',
        content: 'Your total income after deductions. Check IRS Form 1040, Line 15. This includes all income sources minus standard or itemized deductions.'
    },
    'w2-wages': {
        title: 'W-2 Wages',
        content: 'Wages paid to employees. You can find this in your payroll records or W-3 form. Enter 0 if you have no employees.'
    },
    'filing-status': {
        title: 'Filing Status',
        content: 'Choose your filing status as used on your 1040 form. Most freelancers and single business owners select "Single."'
    },
    'vehicle-cost': {
        title: 'Vehicle Cost',
        content: 'The total sticker price of the new vehicle you bought. This should be the purchase price before taxes and fees.<br><br><em>BBB Section 70203 allows vehicle loan interest deduction for 2025-2028.</em>'
    },
    'loan-apr': {
        title: 'Loan APR',
        content: 'Annual interest rate on your car loan. Check your loan agreement or financing documents for this percentage.'
    },
    'year-purchased': {
        title: 'Year Purchased',
        content: 'Enter a year from 2025 to 2028. The vehicle loan interest deduction only applies to vehicles purchased in these years.'
    },
    'vehicle-type': {
        title: 'Vehicle Type',
        content: 'This deduction only applies to new vehicles where original use commences with the taxpayer. Used vehicles do not qualify.'
    },
    'asset-type': {
        title: 'Asset Type',
        content: 'Choose what you financed: Equipment (machinery, computers), Real Estate (commercial property), Vehicle (business vehicles), or Leasehold Improvements (office renovations).'
    },
    'asset-cost': {
        title: 'Asset Cost',
        content: 'The total purchase price of the asset you\'re financing. This is the amount before any down payment.<br><br><em>BBB Section 70303 changes business interest limitation from EBITDA to EBIT, allowing more deductible interest.</em>'
    },
    'down-payment': {
        title: 'Down Payment',
        content: 'The amount you paid upfront when purchasing the asset. This reduces the loan amount that will accrue interest.'
    },
    'asset-apr': {
        title: 'Asset Loan APR',
        content: 'Annual interest rate on your asset financing loan. Check your loan documents for this percentage.'
    },
    'loan-term': {
        title: 'Loan Term',
        content: 'The length of your loan in years. Common terms are 5-10 years for equipment, 15-30 years for real estate.'
    },
    'depreciation-method': {
        title: 'Depreciation Method',
        content: '<strong>Section 179:</strong> Full deduction in 1 year (up to limits)<br><strong>Bonus:</strong> Large percentage now, rest over time<br><strong>Straight-line:</strong> Even deduction over the asset\'s useful life'
    }
};

// Quick calculator content
const quickCalcContent = {
    'business-income': {
        title: 'Business Income Quick Calculator',
        content: `
            <div class="space-y-4">
                <div>
                    <label class="block text-sm font-medium mb-1">Annual Revenue</label>
                    <input type="number" id="quickRevenue" class="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2" placeholder="250000">
                </div>
                <div>
                    <label class="block text-sm font-medium mb-1">Annual Expenses</label>
                    <input type="number" id="quickExpenses" class="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2" placeholder="100000">
                </div>
                <div class="bg-gray-700 p-3 rounded">
                    <div class="text-sm">Net Business Income: <span id="quickNetIncome" class="font-bold text-green-400">$0</span></div>
                </div>
                <button id="useQuickIncome" class="w-full bg-green-600 hover:bg-green-700 py-2 rounded">Use This Amount</button>
            </div>
        `
    },
    'vehicle-payment': {
        title: 'Vehicle Payment Calculator',
        content: `
            <div class="space-y-4">
                <div>
                    <label class="block text-sm font-medium mb-1">Vehicle Price</label>
                    <input type="number" id="quickVehiclePrice" class="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2">
                </div>
                <div>
                    <label class="block text-sm font-medium mb-1">Down Payment</label>
                    <input type="number" id="quickVehicleDown" class="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2" placeholder="5000">
                </div>
                <div>
                    <label class="block text-sm font-medium mb-1">APR (%)</label>
                    <input type="number" id="quickVehicleAPR" step="0.1" class="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2">
                </div>
                <div>
                    <label class="block text-sm font-medium mb-1">Term (years)</label>
                    <input type="number" id="quickVehicleTerm" class="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2" value="5">
                </div>
                <div class="bg-gray-700 p-3 rounded space-y-1 text-sm">
                    <div>Loan Amount: <span id="quickLoanAmount" class="font-bold">$0</span></div>
                    <div>Monthly Payment: <span id="quickMonthlyPayment" class="font-bold">$0</span></div>
                    <div>Total Interest: <span id="quickTotalInterest" class="font-bold">$0</span></div>
                    <div>Annual Interest: <span id="quickAnnualInterest" class="font-bold text-green-400">$0</span></div>
                </div>
                <button id="calculateVehiclePayment" class="w-full bg-blue-600 hover:bg-blue-700 py-2 rounded">Calculate</button>
            </div>
        `
    },
    'asset-loan': {
        title: 'Asset Loan Calculator',
        content: `
            <div class="space-y-4">
                <div>
                    <label class="block text-sm font-medium mb-1">Asset Cost</label>
                    <input type="number" id="quickAssetCost" class="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2">
                </div>
                <div>
                    <label class="block text-sm font-medium mb-1">Down Payment</label>
                    <input type="number" id="quickAssetDown" class="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2">
                </div>
                <div>
                    <label class="block text-sm font-medium mb-1">APR (%)</label>
                    <input type="number" id="quickAssetAPR" step="0.1" class="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2">
                </div>
                <div>
                    <label class="block text-sm font-medium mb-1">Term (years)</label>
                    <input type="number" id="quickAssetTerm" class="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2">
                </div>
                <div class="bg-gray-700 p-3 rounded space-y-1 text-sm">
                    <div>Loan Amount: <span id="quickAssetLoanAmount" class="font-bold">$0</span></div>
                    <div>Annual Interest: <span id="quickAssetAnnualInterest" class="font-bold">$0</span></div>
                    <div>Estimated Annual Deduction: <span id="quickAssetDeduction" class="font-bold text-green-400">$0</span></div>
                </div>
                <button id="calculateAssetLoan" class="w-full bg-blue-600 hover:bg-blue-700 py-2 rounded">Calculate</button>
            </div>
        `
    }
};

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    initializeTabs();
    initializeHelpSystem();
    initializeQuickCalculators();
    initializeValidatedInputs(); // Initialize validation system
    initializeDropdownInputs(); // Initialize dropdown inputs
    initializeExport();
    
    // Clear any existing errors on page load
    clearAllErrors();
    
    // Initial calculation (will only run if all required fields are valid)
    if (shouldUpdateCalculations()) {
        calculateAll();
    }
});

// Tab functionality
function initializeTabs() {
    const tabButtons = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');
    
    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            const targetTab = button.dataset.tab;
            
            // Update button states
            tabButtons.forEach(btn => {
                btn.classList.remove('active', 'bg-gray-700', 'text-white', 'border-green-400');
                btn.classList.add('bg-gray-800', 'text-gray-300');
            });
            button.classList.add('active', 'bg-gray-700', 'text-white', 'border-green-400');
            button.classList.remove('bg-gray-800', 'text-gray-300');
            
            // Update content visibility
            tabContents.forEach(content => {
                content.classList.remove('active');
            });
            document.getElementById(`${targetTab}-tab`).classList.add('active');
        });
    });
}

// Help system
function initializeHelpSystem() {
    const helpButtons = document.querySelectorAll('.help-btn');
    const helpModal = document.getElementById('helpModal');
    const closeHelp = document.getElementById('closeHelp');
    
    helpButtons.forEach(button => {
        button.addEventListener('click', () => {
            const helpKey = button.dataset.help;
            const help = helpContent[helpKey];
            
            if (help) {
                document.getElementById('helpTitle').textContent = help.title;
                document.getElementById('helpContent').innerHTML = help.content;
                helpModal.classList.add('active');
            }
        });
    });
    
    closeHelp.addEventListener('click', () => {
        helpModal.classList.remove('active');
    });
    
    helpModal.addEventListener('click', (e) => {
        if (e.target === helpModal) {
            helpModal.classList.remove('active');
        }
    });
}

// Quick calculators
function initializeQuickCalculators() {
    const quickCalcButtons = document.querySelectorAll('.quick-calc-btn');
    const quickCalcModal = document.getElementById('quickCalcModal');
    const closeCalc = document.getElementById('closeCalc');
    
    quickCalcButtons.forEach(button => {
        button.addEventListener('click', () => {
            const calcKey = button.dataset.calc;
            const calc = quickCalcContent[calcKey];
            
            if (calc) {
                document.getElementById('calcTitle').textContent = calc.title;
                document.getElementById('calcContent').innerHTML = calc.content;
                quickCalcModal.classList.add('active');
                
                // Initialize calculator-specific functionality
                initializeSpecificCalculator(calcKey);
            }
        });
    });
    
    closeCalc.addEventListener('click', () => {
        quickCalcModal.classList.remove('active');
    });
    
    quickCalcModal.addEventListener('click', (e) => {
        if (e.target === quickCalcModal) {
            quickCalcModal.classList.remove('active');
        }
    });
}

function initializeSpecificCalculator(calcKey) {
    if (calcKey === 'business-income') {
        const revenueInput = document.getElementById('quickRevenue');
        const expensesInput = document.getElementById('quickExpenses');
        const netIncomeSpan = document.getElementById('quickNetIncome');
        const useButton = document.getElementById('useQuickIncome');
        
        function updateNetIncome() {
            const revenue = parseFloat(revenueInput.value) || 0;
            const expenses = parseFloat(expensesInput.value) || 0;
            const netIncome = revenue - expenses;
            netIncomeSpan.textContent = formatCurrency(netIncome);
        }
        
        revenueInput.addEventListener('input', updateNetIncome);
        expensesInput.addEventListener('input', updateNetIncome);
        
        useButton.addEventListener('click', () => {
            const revenue = parseFloat(revenueInput.value) || 0;
            const expenses = parseFloat(expensesInput.value) || 0;
            const netIncome = revenue - expenses;
            
            document.getElementById('businessIncome').value = netIncome;
            document.getElementById('quickCalcModal').classList.remove('active');
            calculateQBI();
        });
    }
    
    if (calcKey === 'vehicle-payment') {
        const calculateButton = document.getElementById('calculateVehiclePayment');
        
        calculateButton.addEventListener('click', () => {
            const price = parseFloat(document.getElementById('quickVehiclePrice').value) || 0;
            const down = parseFloat(document.getElementById('quickVehicleDown').value) || 0;
            const apr = parseFloat(document.getElementById('quickVehicleAPR').value) || 0;
            const term = parseFloat(document.getElementById('quickVehicleTerm').value) || 5;
            
            const loanAmount = price - down;
            const monthlyRate = apr / 100 / 12;
            const numPayments = term * 12;
            
            let monthlyPayment = 0;
            if (monthlyRate > 0) {
                monthlyPayment = loanAmount * (monthlyRate * Math.pow(1 + monthlyRate, numPayments)) / 
                                (Math.pow(1 + monthlyRate, numPayments) - 1);
            } else {
                monthlyPayment = loanAmount / numPayments;
            }
            
            const totalInterest = (monthlyPayment * numPayments) - loanAmount;
            const annualInterest = totalInterest / term;
            
            document.getElementById('quickLoanAmount').textContent = formatCurrency(loanAmount);
            document.getElementById('quickMonthlyPayment').textContent = formatCurrency(monthlyPayment);
            document.getElementById('quickTotalInterest').textContent = formatCurrency(totalInterest);
            document.getElementById('quickAnnualInterest').textContent = formatCurrency(annualInterest);
        });
    }
    
    if (calcKey === 'asset-loan') {
        const calculateButton = document.getElementById('calculateAssetLoan');
        
        calculateButton.addEventListener('click', () => {
            const cost = parseFloat(document.getElementById('quickAssetCost').value) || 0;
            const down = parseFloat(document.getElementById('quickAssetDown').value) || 0;
            const apr = parseFloat(document.getElementById('quickAssetAPR').value) || 0;
            const term = parseFloat(document.getElementById('quickAssetTerm').value) || 10;
            
            const loanAmount = cost - down;
            const annualInterest = loanAmount * (apr / 100);
            const estimatedDeduction = annualInterest + (cost * 0.2); // Rough estimate including depreciation
            
            document.getElementById('quickAssetLoanAmount').textContent = formatCurrency(loanAmount);
            document.getElementById('quickAssetAnnualInterest').textContent = formatCurrency(annualInterest);
            document.getElementById('quickAssetDeduction').textContent = formatCurrency(estimatedDeduction);
        });
    }
}

// Initialize dropdown/select inputs (not covered by validation rules)
function initializeDropdownInputs() {
    // Add event listeners for dropdown/select inputs that aren't numeric
    const dropdownInputs = ['filingStatus', 'usAssembled', 'assetType', 'depreciationMethod'];
    dropdownInputs.forEach(id => {
        const element = document.getElementById(id);
        if (element) {
            element.addEventListener('change', updateCalculations);
        }
    });
}

// QBI Calculation with validation
function calculateQBI() {
    // Validate all QBI inputs
    const inputs = {
        businessIncome: validateNumericInput(
            document.getElementById('businessIncome').value, 
            'businessIncome', 
            validationRules.businessIncome
        ),
        taxableIncome: validateNumericInput(
            document.getElementById('taxableIncome').value, 
            'taxableIncome', 
            validationRules.taxableIncome
        ),
        w2Wages: validateNumericInput(
            document.getElementById('w2Wages').value, 
            'w2Wages', 
            validationRules.w2Wages
        )
    };
    
    // Check if any validation failed
    const failedValidations = Object.entries(inputs).filter(([key, result]) => !result.valid);
    if (failedValidations.length > 0) {
        showCalculationError('Please fix the input errors before calculating QBI deduction');
        return;
    }
    
    // Use validated values
    const businessIncome = inputs.businessIncome.value;
    const taxableIncome = inputs.taxableIncome.value;
    const w2Wages = inputs.w2Wages.value;
    const filingStatus = document.getElementById('filingStatus').value;
    
    // QBI thresholds and phase-out ranges (BBB changes phase-out range, not thresholds)
    const qbiThreshold = filingStatus === 'single' ? 182000 : 364000;  // Phase-out start (unchanged by BBB)
    const oldPhaseOutRange = filingStatus === 'single' ? 50000 : 100000;  // Current law phase-out range
    const newPhaseOutRange = filingStatus === 'single' ? 75000 : 150000;  // BBB phase-out range
    
    // Calculate QBI deduction (simplified)
    const qbiBase = Math.min(businessIncome * 0.2, taxableIncome * 0.2);
    
    // Before BBB (current law - shorter phase-out range)
    let qbiBeforeBBB = qbiBase;
    if (taxableIncome > qbiThreshold) {
        const phaseOutAmount = Math.min(taxableIncome - qbiThreshold, oldPhaseOutRange);
        const phaseOutReduction = phaseOutAmount / oldPhaseOutRange;
        qbiBeforeBBB = qbiBase * (1 - phaseOutReduction);
    }
    
    // After BBB (extended phase-out range - more taxpayers keep some QBI)
    let qbiAfterBBB = qbiBase;
    if (taxableIncome > qbiThreshold) {
        const phaseOutAmount = Math.min(taxableIncome - qbiThreshold, newPhaseOutRange);
        const phaseOutReduction = phaseOutAmount / newPhaseOutRange;
        qbiAfterBBB = qbiBase * (1 - phaseOutReduction);
    }
    
    // Apply $400 minimum deduction for businesses with at least $1,000 QBI (BBB Section 70105(b))
    if (businessIncome >= 1000) {
        qbiAfterBBB = Math.max(qbiAfterBBB, 400);
    }
    
    const savings = Math.max(0, qbiAfterBBB - qbiBeforeBBB);
    const taxSavings = savings * 0.24; // Assuming 24% tax rate
    
    // Update display
    document.getElementById('qbiBeforeBBB').textContent = formatCurrency(qbiBeforeBBB);
    document.getElementById('qbiAfterBBB').textContent = formatCurrency(qbiAfterBBB);
    document.getElementById('qbiSavings').textContent = formatCurrency(taxSavings);
    
    // Phase-out warning
    const phaseOutWarning = document.getElementById('phaseOutWarning');
    const phaseOutPercent = document.getElementById('phaseOutPercent');
    
    if (phaseOutWarning && phaseOutPercent) {
        if (taxableIncome > newThreshold) {
            const phaseOutProgress = Math.min((taxableIncome - newThreshold) / 50000 * 100, 100);
            phaseOutPercent.textContent = Math.round(phaseOutProgress);
            phaseOutWarning.classList.remove('hidden');
        } else {
            phaseOutWarning.classList.add('hidden');
        }
    }
    
    // Store results
    calculatorData.qbi = {
        beforeBBB: qbiBeforeBBB,
        afterBBB: qbiAfterBBB,
        savings: taxSavings
    };
    
    updateTotalSavings();
}

// Vehicle Calculation with validation
function calculateVehicle() {
    // Validate all vehicle inputs
    const inputs = {
        vehicleCost: validateNumericInput(
            document.getElementById('vehicleCost').value, 
            'vehicleCost', 
            validationRules.vehicleCost
        ),
        vehicleAPR: validateNumericInput(
            document.getElementById('vehicleAPR').value, 
            'vehicleAPR', 
            validationRules.vehicleAPR
        ),
        yearPurchased: validateNumericInput(
            document.getElementById('yearPurchased').value, 
            'yearPurchased', 
            validationRules.yearPurchased
        )
    };
    
    // Check if any validation failed
    const failedValidations = Object.entries(inputs).filter(([key, result]) => !result.valid);
    if (failedValidations.length > 0) {
        showCalculationError('Please fix the input errors before calculating vehicle loan benefits');
        return;
    }
    
    // Additional validation for vehicle eligibility
    const yearPurchased = inputs.yearPurchased.value;
    if (yearPurchased < 2025 || yearPurchased > 2028) {
        showFieldError('yearPurchased', 'Vehicle must be purchased between 2025 and 2028 to qualify');
        return;
    }
    
    // Use validated values
    const vehicleCost = inputs.vehicleCost.value;
    const vehicleAPR = inputs.vehicleAPR.value;
    const vehicleType = document.getElementById('vehicleType').value;
    
    // Calculate loan details (assuming 5-year term)
    const loanTerm = 5;
    const monthlyRate = vehicleAPR / 100 / 12;
    const numPayments = loanTerm * 12;
    
    let monthlyPayment = 0;
    if (monthlyRate > 0) {
        monthlyPayment = vehicleCost * (monthlyRate * Math.pow(1 + monthlyRate, numPayments)) / 
                        (Math.pow(1 + monthlyRate, numPayments) - 1);
    } else {
        monthlyPayment = vehicleCost / numPayments;
    }
    
    const totalInterest = (monthlyPayment * numPayments) - vehicleCost;
    const annualInterest = totalInterest / loanTerm;
    
    // Update loan details display
    const monthlyPaymentEl = document.getElementById('monthlyPayment');
    const totalInterestEl = document.getElementById('totalInterest');
    const annualInterestEl = document.getElementById('annualInterest');
    
    if (monthlyPaymentEl) monthlyPaymentEl.textContent = formatCurrency(monthlyPayment);
    if (totalInterestEl) totalInterestEl.textContent = formatCurrency(totalInterest);
    if (annualInterestEl) annualInterestEl.textContent = formatCurrency(annualInterest);
    
    // Calculate deduction
    const beforeBBB = 0; // No deduction before BBB
    let afterBBB = 0;
    
    if (vehicleType === 'new' && yearPurchased >= 2025 && yearPurchased <= 2028) {
        afterBBB = Math.min(annualInterest, 10000); // Cap at $10,000
    }
    
    const savings = afterBBB - beforeBBB;
    const taxSavings = savings * 0.24; // Assuming 24% tax rate
    
    // Update display
    document.getElementById('vehicleBeforeBBB').textContent = formatCurrency(beforeBBB);
    document.getElementById('vehicleAfterBBB').textContent = formatCurrency(afterBBB);
    document.getElementById('vehicleSavings').textContent = formatCurrency(taxSavings);
    
    // Store results
    calculatorData.vehicle = {
        beforeBBB: beforeBBB,
        afterBBB: afterBBB,
        savings: taxSavings
    };
    
    updateTotalSavings();
}

// Asset Calculation with validation
function calculateAsset() {
    // Validate all asset inputs
    const inputs = {
        assetCost: validateNumericInput(
            document.getElementById('assetCost').value, 
            'assetCost', 
            validationRules.assetCost
        ),
        assetAPR: validateNumericInput(
            document.getElementById('assetAPR').value, 
            'assetAPR', 
            validationRules.assetAPR
        ),
        downPayment: validateNumericInput(
            document.getElementById('downPayment').value, 
            'downPayment', 
            validationRules.downPayment
        ),
        loanTerm: validateNumericInput(
            document.getElementById('loanTerm').value, 
            'loanTerm', 
            validationRules.loanTerm
        )
    };
    
    // Check if any validation failed
    const failedValidations = Object.entries(inputs).filter(([key, result]) => !result.valid);
    if (failedValidations.length > 0) {
        showCalculationError('Please fix the input errors before calculating asset financing benefits');
        return;
    }
    
    // Use validated values
    const assetType = document.getElementById('assetType').value;
    const assetCost = inputs.assetCost.value;
    const assetAPR = inputs.assetAPR.value;
    const downPayment = inputs.downPayment.value;
    const loanTerm = inputs.loanTerm.value;
    const depreciationMethod = document.getElementById('depreciationMethod').value;
    
    // Additional validation for down payment vs asset cost
    if (downPayment > assetCost) {
        showFieldError('downPayment', 'Down payment cannot exceed asset cost');
        return;
    }
    
    const loanAmount = assetCost - downPayment;
    const annualInterest = loanAmount * (assetAPR / 100);
    
    // Calculate depreciation
    let annualDepreciation = 0;
    switch (depreciationMethod) {
        case 'section179':
            annualDepreciation = Math.min(assetCost, 1160000); // 2024 Section 179 limit
            break;
        case 'bonus':
            annualDepreciation = assetCost * 0.8; // 80% bonus depreciation
            break;
        case 'straight-line':
            const depreciationYears = assetType === 'real-estate' ? 39 : 7;
            annualDepreciation = assetCost / depreciationYears;
            break;
    }
    
    // Update loan details display
    const loanAmountEl = document.getElementById('loanAmount');
    const assetAnnualInterestEl = document.getElementById('assetAnnualInterest');
    const annualDepreciationEl = document.getElementById('annualDepreciation');
    const totalDeductionEl = document.getElementById('totalDeduction');
    
    if (loanAmountEl) loanAmountEl.textContent = formatCurrency(loanAmount);
    if (assetAnnualInterestEl) assetAnnualInterestEl.textContent = formatCurrency(annualInterest);
    if (annualDepreciationEl) annualDepreciationEl.textContent = formatCurrency(annualDepreciation);
    
    const totalDeduction = annualInterest + annualDepreciation;
    if (totalDeductionEl) totalDeductionEl.textContent = formatCurrency(totalDeduction);
    
    // Calculate BBB impact (BBB Section 70303 - EBITDA to EBIT change)
    // Before BBB: 30% of EBITDA limit reduces deductible interest
    // After BBB: 30% of EBIT limit allows more deductible interest
    const beforeBBB = annualInterest * 0.7 + annualDepreciation; // Approximation of EBITDA limitation
    const afterBBB = annualInterest + annualDepreciation; // Approximation with EBIT limitation
    
    const savings = afterBBB - beforeBBB;
    const taxSavings = savings * 0.24; // Assuming 24% tax rate
    
    // Update display
    document.getElementById('assetBeforeBBB').textContent = formatCurrency(beforeBBB);
    document.getElementById('assetAfterBBB').textContent = formatCurrency(afterBBB);
    document.getElementById('assetSavings').textContent = formatCurrency(taxSavings);
    
    // Store results
    calculatorData.asset = {
        beforeBBB: beforeBBB,
        afterBBB: afterBBB,
        savings: taxSavings
    };
    
    updateTotalSavings();
}

// Update total savings
function updateTotalSavings() {
    const totalSavings = calculatorData.qbi.savings + calculatorData.vehicle.savings + calculatorData.asset.savings;
    document.getElementById('totalSavings').textContent = formatCurrency(totalSavings);
}

// Calculate all
function calculateAll() {
    calculateQBI();
    calculateVehicle();
    calculateAsset();
}

// Export functionality
function initializeExport() {
    document.getElementById('exportCSV').addEventListener('click', exportToCSV);
    document.getElementById('exportPDF').addEventListener('click', exportToPDF);
}

function exportToCSV() {
    const data = [
        ['Calculator', 'Before BBB', 'After BBB', 'Tax Savings'],
        ['QBI Deduction', formatCurrency(calculatorData.qbi.beforeBBB), formatCurrency(calculatorData.qbi.afterBBB), formatCurrency(calculatorData.qbi.savings)],
        ['Vehicle Loan', formatCurrency(calculatorData.vehicle.beforeBBB), formatCurrency(calculatorData.vehicle.afterBBB), formatCurrency(calculatorData.vehicle.savings)],
        ['Asset Depreciation', formatCurrency(calculatorData.asset.beforeBBB), formatCurrency(calculatorData.asset.afterBBB), formatCurrency(calculatorData.asset.savings)],
        ['Total', '', '', formatCurrency(calculatorData.qbi.savings + calculatorData.vehicle.savings + calculatorData.asset.savings)]
    ];
    
    const csvContent = data.map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'trump-bbb-tax-optimizer-results.csv';
    a.click();
    window.URL.revokeObjectURL(url);
}

function exportToPDF() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    
    // Title
    doc.setFontSize(20);
    doc.text('Trump BBB Tax Optimizer Results', 20, 30);
    
    // Date
    doc.setFontSize(12);
    doc.text(`Generated: ${new Date().toLocaleDateString()}`, 20, 45);
    
    // Results table
    doc.setFontSize(14);
    doc.text('Tax Savings Summary', 20, 65);
    
    const tableData = [
        ['Calculator', 'Before BBB', 'After BBB', 'Tax Savings'],
        ['QBI Deduction', formatCurrency(calculatorData.qbi.beforeBBB), formatCurrency(calculatorData.qbi.afterBBB), formatCurrency(calculatorData.qbi.savings)],
        ['Vehicle Loan', formatCurrency(calculatorData.vehicle.beforeBBB), formatCurrency(calculatorData.vehicle.afterBBB), formatCurrency(calculatorData.vehicle.savings)],
        ['Asset Depreciation', formatCurrency(calculatorData.asset.beforeBBB), formatCurrency(calculatorData.asset.afterBBB), formatCurrency(calculatorData.asset.savings)]
    ];
    
    let y = 80;
    tableData.forEach((row, index) => {
        if (index === 0) {
            doc.setFontSize(10);
            doc.setFont(undefined, 'bold');
        } else {
            doc.setFont(undefined, 'normal');
        }
        
        doc.text(row[0], 20, y);
        doc.text(row[1], 70, y);
        doc.text(row[2], 110, y);
        doc.text(row[3], 150, y);
        y += 10;
    });
    
    // Total
    doc.setFont(undefined, 'bold');
    doc.text('Total Tax Savings:', 20, y + 10);
    doc.text(formatCurrency(calculatorData.qbi.savings + calculatorData.vehicle.savings + calculatorData.asset.savings), 150, y + 10);
    
    // Disclaimer
    doc.setFontSize(8);
    doc.setFont(undefined, 'normal');
    doc.text('This calculator is for estimation purposes only. Consult a tax professional for personalized advice.', 20, 250);
    
    doc.save('trump-bbb-tax-optimizer-results.pdf');
}

// Utility functions
function formatCurrency(amount) {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    }).format(amount);
}

