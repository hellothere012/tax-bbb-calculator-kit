// Initialize Lucide icons
lucide.createIcons();

// Global state
let calculatorData = {
    qbi: { beforeBBB: 0, afterBBB: 0, savings: 0 },
    vehicle: { beforeBBB: 0, afterBBB: 0, savings: 0 },
    asset: { beforeBBB: 0, afterBBB: 0, savings: 0 }
};

// Help content data
const helpContent = {
    'business-income': {
        title: 'Business Income',
        content: 'This is your <strong>net profit</strong> after expenses. Look at IRS Schedule C, Line 31. This is your total business revenue minus all business expenses.'
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
        content: 'The total sticker price of the new vehicle you bought. This should be the purchase price before taxes and fees.'
    },
    'loan-apr': {
        title: 'Loan APR',
        content: 'Annual interest rate on your car loan. Check your loan agreement or financing documents for this percentage.'
    },
    'year-purchased': {
        title: 'Year Purchased',
        content: 'Enter a year from 2023 to 2028. The vehicle loan interest deduction only applies to vehicles purchased in these years.'
    },
    'us-assembled': {
        title: 'U.S.-Assembled Vehicle',
        content: 'This deduction only applies to new, U.S.-made vehicles. Check your vehicle\'s VIN or manufacturer information.'
    },
    'asset-type': {
        title: 'Asset Type',
        content: 'Choose what you financed: Equipment (machinery, computers), Real Estate (commercial property), Vehicle (business vehicles), or Leasehold Improvements (office renovations).'
    },
    'asset-cost': {
        title: 'Asset Cost',
        content: 'The total purchase price of the asset you\'re financing. This is the amount before any down payment.'
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
    initializeCalculators();
    initializeExport();
    
    // Initial calculation
    calculateAll();
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

// Main calculators
function initializeCalculators() {
    // QBI Calculator inputs
    const qbiInputs = ['businessIncome', 'taxableIncome', 'w2Wages', 'filingStatus'];
    qbiInputs.forEach(id => {
        const element = document.getElementById(id);
        if (element) {
            element.addEventListener('input', calculateQBI);
            element.addEventListener('change', calculateQBI);
        }
    });
    
    // Vehicle Calculator inputs
    const vehicleInputs = ['vehicleCost', 'vehicleAPR', 'yearPurchased', 'usAssembled'];
    vehicleInputs.forEach(id => {
        const element = document.getElementById(id);
        if (element) {
            element.addEventListener('input', calculateVehicle);
            element.addEventListener('change', calculateVehicle);
        }
    });
    
    // Asset Calculator inputs
    const assetInputs = ['assetType', 'assetCost', 'downPayment', 'assetAPR', 'loanTerm', 'depreciationMethod'];
    assetInputs.forEach(id => {
        const element = document.getElementById(id);
        if (element) {
            element.addEventListener('input', calculateAsset);
            element.addEventListener('change', calculateAsset);
        }
    });
}

// QBI Calculation
function calculateQBI() {
    const businessIncome = parseFloat(document.getElementById('businessIncome').value) || 0;
    const taxableIncome = parseFloat(document.getElementById('taxableIncome').value) || 0;
    const w2Wages = parseFloat(document.getElementById('w2Wages').value) || 0;
    const filingStatus = document.getElementById('filingStatus').value;
    
    // QBI thresholds
    const oldThreshold = filingStatus === 'single' ? 182050 : 364100;
    const newThreshold = filingStatus === 'single' ? 75000 : 175000;
    
    // Calculate QBI deduction (simplified)
    const qbiBase = Math.min(businessIncome * 0.2, taxableIncome * 0.2);
    
    // Before BBB (higher threshold)
    let qbiBeforeBBB = qbiBase;
    if (taxableIncome > oldThreshold) {
        const phaseOutAmount = Math.min(taxableIncome - oldThreshold, 50000);
        const phaseOutReduction = phaseOutAmount / 50000;
        qbiBeforeBBB = qbiBase * (1 - phaseOutReduction);
    }
    
    // After BBB (lower threshold)
    let qbiAfterBBB = qbiBase;
    if (taxableIncome > newThreshold) {
        const phaseOutAmount = Math.min(taxableIncome - newThreshold, 50000);
        const phaseOutReduction = phaseOutAmount / 50000;
        qbiAfterBBB = qbiBase * (1 - phaseOutReduction);
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
    
    if (taxableIncome > newThreshold) {
        const phaseOutProgress = Math.min((taxableIncome - newThreshold) / 50000 * 100, 100);
        phaseOutPercent.textContent = Math.round(phaseOutProgress);
        phaseOutWarning.classList.remove('hidden');
    } else {
        phaseOutWarning.classList.add('hidden');
    }
    
    // Store results
    calculatorData.qbi = {
        beforeBBB: qbiBeforeBBB,
        afterBBB: qbiAfterBBB,
        savings: taxSavings
    };
    
    updateTotalSavings();
}

// Vehicle Calculation
function calculateVehicle() {
    const vehicleCost = parseFloat(document.getElementById('vehicleCost').value) || 0;
    const vehicleAPR = parseFloat(document.getElementById('vehicleAPR').value) || 0;
    const yearPurchased = parseInt(document.getElementById('yearPurchased').value) || 2025;
    const usAssembled = document.getElementById('usAssembled').value === 'yes';
    
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
    document.getElementById('monthlyPayment').textContent = formatCurrency(monthlyPayment);
    document.getElementById('totalInterest').textContent = formatCurrency(totalInterest);
    document.getElementById('annualInterest').textContent = formatCurrency(annualInterest);
    
    // Calculate deduction
    const beforeBBB = 0; // No deduction before BBB
    let afterBBB = 0;
    
    if (usAssembled && yearPurchased >= 2023 && yearPurchased <= 2028) {
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

// Asset Calculation
function calculateAsset() {
    const assetType = document.getElementById('assetType').value;
    const assetCost = parseFloat(document.getElementById('assetCost').value) || 0;
    const downPayment = parseFloat(document.getElementById('downPayment').value) || 0;
    const assetAPR = parseFloat(document.getElementById('assetAPR').value) || 0;
    const loanTerm = parseFloat(document.getElementById('loanTerm').value) || 10;
    const depreciationMethod = document.getElementById('depreciationMethod').value;
    
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
    document.getElementById('loanAmount').textContent = formatCurrency(loanAmount);
    document.getElementById('assetAnnualInterest').textContent = formatCurrency(annualInterest);
    document.getElementById('annualDepreciation').textContent = formatCurrency(annualDepreciation);
    
    const totalDeduction = annualInterest + annualDepreciation;
    document.getElementById('totalDeduction').textContent = formatCurrency(totalDeduction);
    
    // Calculate BBB impact (simplified - expanded interest deduction)
    const beforeBBB = annualInterest * 0.7 + annualDepreciation; // 70% of interest deductible before
    const afterBBB = annualInterest + annualDepreciation; // 100% of interest deductible after
    
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

