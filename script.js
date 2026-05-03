// Global variables
let currentUser = null;
let quizData = [];
let currentQuestion = 0;
let score = 0;
let currentPage = 'analysis';

// Initialize application
document.addEventListener('DOMContentLoaded', function() {
    initializeAuth();
    setupMainOptions();
    loadPage('analysis'); // Load default page
});

// Main Options Navigation
function setupMainOptions() {
    const optionCards = document.querySelectorAll('.option-card');
    
    optionCards.forEach(card => {
        card.addEventListener('click', function() {
            const pageType = this.getAttribute('onclick').match(/loadPage\('([^']+)'\)/)[1];
            loadPage(pageType);
        });
    });
}

// Page Loading System
function loadPage(pageType) {
    const contentContainer = document.getElementById('content-container');
    const optionCards = document.querySelectorAll('.option-card');
    const quizContainer = document.getElementById('quiz-container');
    
    // Hide quiz container if showing
    if (quizContainer) {
        quizContainer.classList.add('hidden');
    }
    
    // Show content container
    if (contentContainer) {
        contentContainer.classList.remove('hidden');
    }
    
    // Update active option card
    optionCards.forEach(card => card.classList.remove('active'));
    
    // Highlight active option
    const activeCard = document.querySelector(`[onclick*="${pageType}"]`);
    if (activeCard) {
        activeCard.classList.add('active');
    }
    
    // Load content based on page type
    switch(pageType) {
        case 'analysis':
            loadEmailAnalysisPage(contentContainer);
            break;
        case 'generator':
            loadEmailGeneratorPage(contentContainer);
            break;
        case 'inbox':
            loadInboxPage(contentContainer);
            break;
    }
    
    currentPage = pageType;
}

// Separate Quiz Page Loading
function loadQuizPage() {
    const contentContainer = document.getElementById('content-container');
    const quizContainer = document.getElementById('quiz-container');
    const mainOptions = document.querySelector('.main-options');
    
    // Hide main options and content container
    if (mainOptions) mainOptions.classList.add('hidden');
    if (contentContainer) contentContainer.classList.add('hidden');
    
    // Show quiz container
    if (quizContainer) {
        quizContainer.classList.remove('hidden');
        loadQuizContent(quizContainer);
    }
}

// Email Analysis Page
function loadEmailAnalysisPage(container) {
    container.innerHTML = `
        <div class="page-content">
            <h2>📧 Analyze Email for Scam Detection</h2>
            <p>Enter the email details below to check if it might be a scam:</p>
            
            <form id="analysis-form">
                <div class="form-group">
                    <label for="email-address">From Email Address:</label>
                    <input type="email" id="email-address" required placeholder="sender@example.com">
                </div>
                <div class="form-group">
                    <label for="email-subject">Subject:</label>
                    <input type="text" id="email-subject" required placeholder="Email subject line">
                </div>
                <div class="form-group">
                    <label for="email-body">Email Body:</label>
                    <textarea id="email-body" required placeholder="Paste or type the email content here..." rows="8"></textarea>
                </div>
                <div class="form-buttons">
                    <button type="submit" class="analyze-btn">🔍 Analyze Email</button>
                    <button type="button" id="clear-form" class="clear-btn">🗑️ Clear All</button>
                </div>
            </form>
            
            <div id="analysis-result" class="result-box hidden">
                <h3>Analysis Results:</h3>
                <div id="result-content"></div>
            </div>
        </div>
    `;
    
    initializeEmailAnalysis();
}

// Email Generator Page
function loadEmailGeneratorPage(container) {
    container.innerHTML = `
        <div class="page-content">
            <h2>📧 Email Forwarding Analyzer</h2>
            <p>Get a temporary email address to forward suspicious emails for instant scam analysis:</p>
            
            <div class="generator-controls">
                <button id="generate-temp-email" class="generate-btn">🎯 Generate Temporary Email</button>
                <div class="email-info">
                    <small>Emails are analyzed locally and never stored on external servers</small>
                </div>
            </div>
            
            <div id="temp-email-display" class="temp-email-display hidden">
                <h3>📬 Your Temporary Email Address: <span class="offline-badge">OFFLINE</span></h3>
                <div class="temp-email-box">
                    <input type="text" id="temp-email-address" readonly>
                    <button id="copy-email" class="copy-btn" disabled>📋 Copy</button>
                </div>
                <div class="instructions">
                    <h4>How to use:</h4>
                    <ol>
                        <li>Copy the temporary email address above</li>
                        <li>Forward the suspicious email to this address</li>
                        <li>Click "Check for Forwarded Email" below</li>
                        <li>View the detailed scam analysis with highlighted red flags</li>
                    </ol>
                </div>
                <button id="check-forwarded" class="check-btn" disabled>🔍 Check for Forwarded Email</button>
            </div>
            
            <div id="generated-email" class="generated-email hidden">
                <!-- Generated email will be displayed here -->
            </div>
            
            <div id="forwarded-analysis" class="forwarded-analysis hidden">
                <!-- Analysis results will be displayed here -->
            </div>
        </div>
    `;
    
    initializeEmailGenerator();
}

// Quiz Content Loading
function loadQuizContent(container) {
    container.innerHTML = `
        <div class="quiz-page-content">
            <div class="quiz-header">
                <button class="back-to-main-btn" onclick="backToMainOptions()">← Back to Main Options</button>
                <h2>🎯 Scam Detection Quiz</h2>
                <p>Test your ability to identify scam emails:</p>
            </div>
            
            <div class="quiz-content-area">
                <div id="quiz-start">
                    <p>Can you spot the scam? We'll show you emails and you decide if they're legitimate or scams.</p>
                    <button id="start-quiz" class="start-btn">🚀 Start Quiz</button>
                </div>
                
                <div id="quiz-question" class="hidden">
                    <div class="question-number">
                        Question <span id="current-question">1</span> of <span id="total-questions">5</span>
                    </div>
                    <div class="email-preview">
                        <div class="email-header">
                            <strong>From:</strong> <span id="quiz-from"></span><br>
                            <strong>Subject:</strong> <span id="quiz-subject"></span>
                        </div>
                        <div class="email-body" id="quiz-body"></div>
                    </div>
                    <div class="quiz-options">
                        <button class="quiz-option" data-answer="legitimate">✅ Legitimate</button>
                        <button class="quiz-option" data-answer="scam">❌ Scam</button>
                    </div>
                </div>
                
                <div id="quiz-feedback" class="hidden">
                    <div id="feedback-content"></div>
                    <button id="next-question" class="next-btn">Next Question →</button>
                </div>
                
                <div id="quiz-results" class="hidden">
                    <h3>Quiz Complete!</h3>
                    <div id="results-content"></div>
                    <button id="restart-quiz" class="restart-btn">🔄 Try Again</button>
                </div>
            </div>
        </div>
    `;
    
    initializeQuiz();
}

// Back to Main Options
function backToMainOptions() {
    const contentContainer = document.getElementById('content-container');
    const quizContainer = document.getElementById('quiz-container');
    const mainOptions = document.querySelector('.main-options');
    
    // Hide quiz container
    if (quizContainer) {
        quizContainer.classList.add('hidden');
    }
    
    // Show main options
    if (mainOptions) {
        mainOptions.classList.remove('hidden');
    }
    
    // Hide content container
    if (contentContainer) {
        contentContainer.classList.add('hidden');
    }
}

// Inbox Page
function loadInboxPage(container) {
    if (!currentUser) {
        container.innerHTML = `
            <div class="page-content">
                <h2>📬 My Email Inbox</h2>
                <div class="login-required">
                    <h3>🔐 Login Required</h3>
                    <p>Please log in to view your email history and analysis records.</p>
                    <button onclick="document.getElementById('login-modal').classList.remove('hidden')" class="login-btn">🔐 Login Now</button>
                </div>
            </div>
        `;
        return;
    }
    
    container.innerHTML = `
        <div class="page-content">
            <h2>📬 My Email Inbox</h2>
            <p>View and manage all your previously analyzed emails:</p>
            
            <div id="user-inbox-content">
                <!-- Inbox content will be dynamically loaded here -->
            </div>
            
            <!-- Email Detail View -->
            <div id="inbox-email-detail" class="inbox-email-detail hidden">
                <button id="back-to-inbox" class="back-btn">← Back to Inbox</button>
                <div id="inbox-email-analysis">
                    <!-- Email analysis will be displayed here -->
                </div>
            </div>
        </div>
    `;
    
    initializeInbox();
    updateEmailHistory();
}

// Authentication System
function initializeAuth() {
    const authBtn = document.getElementById('auth-btn');
    const loginModal = document.getElementById('login-modal');
    const closeBtn = document.querySelector('.close');
    const authForm = document.getElementById('auth-form');
    const userStatus = document.getElementById('user-status');

    // Check if user is already logged in
    checkAuthStatus();

    authBtn.addEventListener('click', function() {
        if (currentUser) {
            logout();
        } else {
            loginModal.classList.remove('hidden');
        }
    });

    closeBtn.addEventListener('click', function() {
        loginModal.classList.add('hidden');
    });

    authForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const userId = document.getElementById('user-id').value.trim();
        const password = document.getElementById('user-password').value.trim();
        
        if (userId && password) {
            login(userId, password);
        }
    });
}

function checkAuthStatus() {
    const users = JSON.parse(localStorage.getItem('users') || '{}');
    const loggedInUserId = localStorage.getItem('currentUser');
    
    if (loggedInUserId && users[loggedInUserId]) {
        currentUser = users[loggedInUserId];
        updateUserStatus();
        updateNavigation();
    }
}

function login(userId, password) {
    const users = JSON.parse(localStorage.getItem('users') || '{}');
    
    // Accept any password for demo purposes - just need a non-empty password
    if (password && password.trim() !== '') {
        if (!users[userId]) {
            users[userId] = {
                id: userId,
                emailHistory: [],
                quizScores: []
            };
        }
        
        localStorage.setItem('currentUser', userId);
        localStorage.setItem('users', JSON.stringify(users));
        
        currentUser = users[userId];
        updateUserStatus();
        updateNavigation();
        
        // Close modal and update UI
        document.getElementById('login-modal').classList.add('hidden');
        document.getElementById('user-id').value = '';
        document.getElementById('user-password').value = '';
        
        // Reload current page to update content
        if (currentPage && currentPage !== 'quiz') {
            loadPage(currentPage);
        } else {
            backToMainOptions();
        }
    } else {
        alert('Please enter both User ID and password to continue.');
    }
}

function logout() {
    localStorage.removeItem('currentUser');
    currentUser = null;
    updateUserStatus();
    updateNavigation();
    
    // Return to main options
    backToMainOptions();
}

function updateUserStatus() {
    const userStatus = document.getElementById('user-status');
    const authBtn = document.getElementById('auth-btn');
    
    if (currentUser) {
        userStatus.textContent = 'Logged in as: ' + currentUser.id;
        authBtn.textContent = '🔐 Logout';
    } else {
        userStatus.textContent = 'Not logged in';
        authBtn.textContent = '🔐 Login';
    }
}

function updateNavigation() {
    const inboxOption = document.getElementById('inbox-option');
    
    if (inboxOption) {
        if (currentUser) {
            inboxOption.style.display = 'block';
        } else {
            inboxOption.style.display = 'none';
        }
    }
}

// Email Analysis Functionality
function initializeEmailAnalysis() {
    const analysisForm = document.getElementById('analysis-form');
    if (!analysisForm) return;
    
    const resultBox = document.getElementById('analysis-result');
    const resultContent = document.getElementById('result-content');
    const clearBtn = document.getElementById('clear-form');

    analysisForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const emailAddress = document.getElementById('email-address').value;
        const emailSubject = document.getElementById('email-subject').value;
        const emailBody = document.getElementById('email-body').value;
        
        const analysis = analyzeEmail(emailAddress, emailSubject, emailBody);
        displayAnalysisResult(analysis, resultContent, resultBox, emailAddress, emailSubject, emailBody);
    });
    
    if (clearBtn) {
        clearBtn.addEventListener('click', function() {
            // Clear all form fields
            document.getElementById('email-address').value = '';
            document.getElementById('email-subject').value = '';
            document.getElementById('email-body').value = '';
            
            // Clear any previous analysis results
            const resultContent = document.getElementById('result-content');
            const resultBox = document.getElementById('analysis-result');
            
            if (resultContent) resultContent.innerHTML = '';
            if (resultBox) resultBox.classList.add('hidden');
            
            // Focus back to first field
            document.getElementById('email-address').focus();
        });
    }
}

function analyzeEmail(address, subject, body) {
    const warnings = [];
    let riskScore = 0;
    
    // Check email address
    if (isSuspiciousAddress(address)) {
        warnings.push('Suspicious email address format');
        riskScore += 2;
    }
    
    if (hasFreeEmailProvider(address) && !address.includes('gmail.com') && !address.includes('recruiter') && !address.includes('hr')) {
        warnings.push('Using free email provider for business communication');
        riskScore += 1;
    }
    
    // Check subject
    const suspiciousSubjectPatterns = [
        { pattern: /urgent/i, risk: 2, message: 'Urgent language' },
        { pattern: /immediate action required/i, risk: 2, message: 'Immediate action required' },
        { pattern: /limited time offer/i, risk: 2, message: 'Limited time offer' },
        { pattern: /congratulations.*selected/i, risk: 2, message: 'Congratulations/selected language' },
        { pattern: /you.*won.*prize/i, risk: 2, message: 'Prize/winner language' }
    ];
    
    suspiciousSubjectPatterns.forEach(({pattern, risk, message}) => {
        if (pattern.test(subject)) {
            warnings.push(message);
            riskScore += risk;
        }
    });
    
    // Check body for scam indicators
    const highRiskPatterns = [
        { pattern: /pay.*fee/i, message: 'Payment request with fee' },
        { pattern: /wire.*transfer/i, message: 'Wire transfer request' },
        { pattern: /bank.*account.*details/i, message: 'Bank account details request' },
        { pattern: /ssn.*social.*security/i, message: 'SSN or personal info request' },
        { pattern: /act.*now.*limited.*offer/i, message: 'Urgent limited offer' }
    ];
    
    highRiskPatterns.forEach(({pattern, message}) => {
        if (pattern.test(body)) {
            warnings.push(message);
            riskScore += 3;
        }
    });
    
    // Check for medium risk patterns
    const mediumRiskPatterns = [
        { pattern: /dear.*(candidate|student|applicant)/i, message: 'Generic greeting' },
        { pattern: /too good to be true/i, message: 'Too good to be true' },
        { pattern: /no.*experience.*required.*high.*salary/i, message: 'High salary no experience' }
    ];
    
    mediumRiskPatterns.forEach(({pattern, message}) => {
        if (pattern.test(body)) {
            warnings.push(message);
            riskScore += 2;
        }
    });
    
    // Determine risk level based on score
    let riskLevel = 'low';
    if (riskScore >= 6) {
        riskLevel = 'high';
    } else if (riskScore >= 4) {
        riskLevel = 'medium';
    } else {
        riskLevel = 'low';
    }
    
    // Calculate confidence based on risk score
    let confidence = 0.3; // Base confidence for low risk
    if (riskLevel === 'medium') {
        confidence = 0.5 + Math.min((riskScore - 3) * 0.1, 0.2); // 0.5-0.7
    } else if (riskLevel === 'high') {
        confidence = 0.7 + Math.min((riskScore - 5) * 0.05, 0.15); // 0.7-0.85
    }
    
    return {
        riskLevel,
        confidence,
        warnings,
        isScam: riskLevel === 'high'
    };
}

function isSuspiciousAddress(address) {
    // Check for suspicious patterns in email address
    const suspiciousPatterns = [
        /^[0-9]+@/, // Numbers at start
        /.*[0-9]{5,}/, // Long number sequences
        /@(yahoo|hotmail|outlook)\.(com|net|org)$/i // Common providers with suspicious domains (removed Gmail)
    ];
    
    return suspiciousPatterns.some(pattern => pattern.test(address));
}

function hasFreeEmailProvider(address) {
    const freeProviders = ['gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com'];
    return freeProviders.some(provider => address.toLowerCase().includes(provider));
}

function displayAnalysisResult(analysis, resultContent, resultBox, address, subject, body) {
    const highlightedSubject = highlightScamIndicators(subject);
    const highlightedContent = highlightScamIndicators(body);
    
    // Show result
    if (resultBox) resultBox.classList.remove('hidden');
    if (resultContent) {
        resultContent.innerHTML = `
            <div class="email-analysis-inline">
                <div class="risk-summary">
                    <span class="scam-indicator ${analysis.riskLevel}">${analysis.riskLevel.toUpperCase()} RISK</span>
                    <span class="confidence-tag">Confidence: ${Math.round(analysis.confidence * 100)}%</span>
                </div>
                
                <div class="email-content highlighted">
                    <div class="email-header">
                        <strong>From:</strong> ${address}<br>
                        <strong>Subject:</strong> ${highlightedSubject}<br>
                    </div>
                    <div class="email-body">${highlightedContent.replace(/\n/g, '<br>')}</div>
                </div>
                
                <div class="analysis-details">
                    <h5>🔍 Scam Indicators Found:</h5>
                    <ul class="warning-list">
                        ${analysis.warnings.map(warning => `<li>${warning}</li>`).join('')}
                    </ul>
                    <div class="recommendation ${analysis.riskLevel}-risk">
                        ${analysis.isScam ? 
                            `<strong>⚠️ CONFIRMED SCAM!</strong><br>
                            This email shows multiple indicators of a scam. Do not respond, click any links, or provide personal information.` :
                            `<strong>✅ LOW RISK</strong><br>
                            This email appears legitimate, but always verify through official company channels.`
                        }
                    </div>
                </div>
            </div>
        `;
    }
    
    // Save to history if user is logged in
    if (currentUser) {
        const emailData = {
            from: address,
            subject: subject,
            body: body,
            riskLevel: analysis.riskLevel,
            confidence: analysis.confidence,
            warnings: analysis.warnings,
            isScam: analysis.isScam
        };
        saveEmailToHistory(emailData);
    }
}

// Email Generator Functionality
function initializeEmailGenerator() {
    const generateBtn = document.getElementById('generate-temp-email');
    const copyBtn = document.getElementById('copy-email');
    const checkBtn = document.getElementById('check-forwarded');
    const generatedEmail = document.getElementById('generated-email');
    const forwardedAnalysis = document.getElementById('forwarded-analysis');

    if (generateBtn) {
        generateBtn.addEventListener('click', function() {
            const tempEmail = generateUniqueTempEmail();
            displayTempEmail(tempEmail);
        });
    }

    if (copyBtn) {
        copyBtn.addEventListener('click', function() {
            const emailText = document.getElementById('temp-email-address').value;
            navigator.clipboard.writeText(emailText).then(() => {
                alert('Email copied to clipboard!');
            });
        });
    }

    if (checkBtn) {
        checkBtn.addEventListener('click', function() {
            // Simulate checking for forwarded emails (offline mode)
            if (forwardedAnalysis) {
                forwardedAnalysis.innerHTML = `
                    <div style="text-align: center; padding: 2rem; background: #f8f9fa; border-radius: 10px;">
                        <div style="font-size: 3rem; margin-bottom: 1rem;">📭</div>
                        <h3>No Emails Found</h3>
                        <p>No forwarded emails have been received yet.</p>
                        <p style="color: #666; margin-top: 1rem;">
                            For demonstration purposes, click "Check for Forwarded Email" again to see a sample scam email analysis.
                        </p>
                    </div>
                `;
            }
        });
    }
}

function generateScamEmail(type) {
    const templates = {
        'urgent-payment': {
            from: 'hr@techcareer-growth.com',
            subject: 'URGENT: Payment Required for Internship',
            body: `Dear Candidate,

Congratulations on your selection for our internship program! We are excited to have you join our team.

However, we require a small payment of $299 to process your background check and set up your employee account. This is a standard procedure that all interns go through.

Please send payment via wire transfer to: account-payment@techcorp.com

Once payment is received, we will immediately send you your internship welcome packet and schedule your orientation.

Best regards,
HR Department
Tech Career Growth`
        }
    };
    
    return templates[type] || templates['urgent-payment'];
}

function generateUniqueTempEmail() {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 8);
    return `temp-${timestamp}-${random}@scamcheck.intern`;
}

function displayTempEmail(tempEmail) {
    const generatedEmailDiv = document.getElementById('generated-email');
    if (!generatedEmailDiv) return;
    
    generatedEmailDiv.classList.remove('hidden');
    generatedEmailDiv.innerHTML = `
        <div class="temp-email-display">
            <div class="email-status offline">
                <span class="status-indicator">🔴</span>
                <span class="status-text">OFFLINE</span>
            </div>
            <div class="temp-email-info">
                <h3 style="color: #000000;">📧 Temporary Email Address Generated</h3>
                <div class="email-address-display">
                    <input type="text" id="temp-email-address" value="${tempEmail}" readonly>
                    <button id="copy-email" class="copy-btn">📋 Copy</button>
                </div>
                <div class="offline-notice">
                    <p><strong>⚠️ Service Status: Offline</strong></p>
                    <p>The temporary email service is currently offline. You can copy the generated email address for future use when the service comes back online.</p>
                </div>
                <div class="usage-instructions">
                    <h4>How to use this email:</h4>
                    <ol>
                        <li>Copy the temporary email address above</li>
                        <li>Forward suspicious emails to this address</li>
                        <li>Check back later when service is online to view analysis</li>
                    </ol>
                </div>
            </div>
        </div>
    `;
    
    // Re-attach copy button event listener (disabled for offline mode)
    setTimeout(() => {
        const copyBtn = document.getElementById('copy-email');
        if (copyBtn) {
            copyBtn.disabled = true;
            copyBtn.addEventListener('click', function() {
                // Button is disabled, so this won't execute
                const emailText = document.getElementById('temp-email-address').value;
                navigator.clipboard.writeText(emailText).then(() => {
                    alert('Email copied to clipboard!');
                });
            });
        }
    }, 100);
}

function displayForwardedEmailAnalysis(email, analysis) {
    const forwardedAnalysis = document.getElementById('forwarded-analysis');
    if (!forwardedAnalysis) return;
    
    // Analyze and highlight scam indicators
    const highlightedContent = highlightScamIndicators(email.body);
    
    forwardedAnalysis.innerHTML = `
        <div class="email-analysis-inline">
            <div class="risk-summary">
                <span class="scam-indicator ${analysis.riskLevel}">${analysis.riskLevel.toUpperCase()} RISK</span>
                <span>Confidence: ${Math.round(analysis.confidence * 100)}%</span>
            </div>
            
            <div class="email-content highlighted">
                <div class="email-header">
                    <strong>From:</strong> ${email.from}<br>
                    <strong>Subject:</strong> ${email.subject}<br>
                </div>
                <div class="email-body">${highlightedContent.replace(/\n/g, '<br>')}</div>
            </div>
            
            <div class="analysis-details">
                <h5>🔍 Scam Indicators Found:</h5>
                <ul class="warning-list">
                    ${analysis.warnings.map(warning => `<li>${warning}</li>`).join('')}
                </ul>
                <div class="recommendation">
                    ${analysis.isScam ? 
                        `<div style="background: #f8d7da; padding: 1rem; border-radius: 8px; margin-top: 1rem;">
                            <strong>⚠️ CONFIRMED SCAM!</strong><br>
                            This email shows multiple indicators of a scam. Do not respond, click any links, or provide personal information.
                        </div>` :
                        `<div style="background: #d4edda; padding: 1rem; border-radius: 8px; margin-top: 1rem;">
                            <strong>✅ LOW RISK</strong><br>
                            This email appears legitimate, but always verify through official company channels.
                        </div>`
                    }
                </div>
            </div>
            <button id="analyze-another" class="analyze-another-btn">🔄 Analyze Another Email</button>
        </div>
    `;
    
    forwardedAnalysis.classList.remove('hidden');
    
    // Save to history if user is logged in
    if (currentUser) {
        const emailData = {
            ...email,
            riskLevel: analysis.riskLevel,
            confidence: analysis.confidence,
            warnings: analysis.warnings,
            isScam: analysis.isScam
        };
        saveEmailToHistory(emailData);
    }
    
    // Add event listener for analyze another button
    setTimeout(() => {
        const analyzeAnotherBtn = document.getElementById('analyze-another');
        if (analyzeAnotherBtn) {
            analyzeAnotherBtn.addEventListener('click', function() {
                document.getElementById('forwarded-analysis').classList.add('hidden');
                document.getElementById('generated-email').classList.add('hidden');
            });
        }
    }, 100);
}

// Quiz Functionality
function initializeQuiz() {
    const quizStart = document.getElementById('quiz-start');
    const quizQuestion = document.getElementById('quiz-question');
    const quizFeedback = document.getElementById('quiz-feedback');
    const quizResults = document.getElementById('quiz-results');

    // Quiz data
    quizData = [
        {
            id: 1,
            question: "Is this email legitimate?",
            email: {
                from: "recruiter@techcorp.com",
                subject: "Exciting Internship Opportunity",
                body: `Dear Student,

We were impressed with your resume and would like to offer you an internship position at our company. The role involves data entry and administrative tasks with a competitive salary.

Please reply with your interest and availability for an interview.

Best regards,
HR Team
TechCorp Industries`
            },
            options: [
                { text: "This is legitimate", correct: true, explanation: "Professional email from verified company with proper contact information" },
                { text: "This is a scam", correct: false, explanation: "Unsolicited offer with vague details and pressure to respond quickly" }
            ]
        },
        {
            id: 2,
            question: "What should you do with this email?",
            email: {
                from: "winner@lottery-intl.com",
                subject: "CONGRATULATIONS! YOU WON $1,000,000",
                body: `Dear Winner,

Congratulations! You have been selected as winner of our international lottery with a grand prize of $1,000,000!

To claim your prize, please send a processing fee of $500 to:
prize-claim@lottery-intl.com

Hurry! This offer expires in 24 hours.

Sincerely,
Prize Distribution Team`
            },
            options: [
                { text: "Delete and ignore", correct: true, explanation: "Lottery emails are always scams - never send money or personal information" },
                { text: "Reply with questions", correct: false, explanation: "Engaging with scammers gives them access to you" }
            ]
        },
        {
            id: 3,
            question: "Is this request appropriate?",
            email: {
                from: "support@amazon-security.com",
                subject: "URGENT: Account Verification Required",
                body: `Dear Customer,

We detected suspicious activity on your Amazon account. Please verify your identity immediately by clicking the link below:

http://amazon-security-verification.com/login

If you don't verify within 24 hours, your account will be permanently suspended.

Amazon Security Team`
            },
            options: [
                { text: "Contact Amazon directly", correct: true, explanation: "Always verify security requests through official company channels" },
                { text: "Click the link", correct: false, explanation: "Phishing attempts use fake links to steal credentials" }
            ]
        }
    ];

    // Check if user is logged in and show quiz scores
    if (currentUser) {
        loadQuizScores();
    } else {
        if (quizStart) {
            quizStart.innerHTML = `
                <p>Can you spot the scam? We'll show you emails and you decide if they're legitimate or scams.</p>
                <button id="start-quiz" class="start-btn">🚀 Start Quiz</button>
            `;
            
            const startQuizBtn = document.getElementById('start-quiz');
            if (startQuizBtn) {
                startQuizBtn.addEventListener('click', startQuiz);
            }
        }
    }
}

function startQuiz() {
    currentQuestion = 0;
    score = 0;
    
    const quizStart = document.getElementById('quiz-start');
    const quizQuestion = document.getElementById('quiz-question');
    const quizFeedback = document.getElementById('quiz-feedback');
    const quizResults = document.getElementById('quiz-results');
    
    // Hide start and show quiz
    if (quizStart) quizStart.classList.add('hidden');
    if (quizQuestion) quizQuestion.classList.remove('hidden');
    if (quizFeedback) quizFeedback.classList.remove('hidden');
    if (quizResults) quizResults.classList.remove('hidden');
    
    showQuestion();
}

function showQuestion() {
    const quizQuestion = document.getElementById('quiz-question');
    const quizFeedback = document.getElementById('quiz-feedback');
    const quizResults = document.getElementById('quiz-results');
    
    if (currentQuestion < quizData.length) {
        const question = quizData[currentQuestion];
        
        if (quizQuestion) {
            quizQuestion.innerHTML = `
                <div class="quiz-question-card">
                    <h3>Question ${currentQuestion + 1} of ${quizData.length}</h3>
                    <p>${question.question}</p>
                    
                    <div class="quiz-email">
                        <div class="email-header">
                            <strong>From:</strong> ${question.email.from}<br>
                            <strong>Subject:</strong> ${question.email.subject}<br>
                        </div>
                        <div class="email-body">${question.email.body.replace(/\n/g, '<br>')}</div>
                    </div>
                    
                    <div class="quiz-options">
                        ${question.options.map((option, index) => `
                            <button class="quiz-option" data-index="${index}">
                                ${option.text}
                            </button>
                        `).join('')}
                    </div>
                </div>
            `;
        }
        
        // Add event listeners to options
        setTimeout(() => {
            const options = document.querySelectorAll('.quiz-option');
            options.forEach(option => {
                option.addEventListener('click', function() {
                    const selectedIndex = parseInt(this.dataset.index);
                    checkAnswer(selectedIndex);
                });
            });
        }, 100);
    } else {
        showResults();
    }
}

function checkAnswer(selectedIndex) {
    const question = quizData[currentQuestion];
    const selectedOption = question.options[selectedIndex];
    
    const quizFeedback = document.getElementById('quiz-feedback');
    const quizQuestion = document.getElementById('quiz-question');
    
    if (selectedOption.correct) {
        score++;
        if (quizFeedback) {
            quizFeedback.innerHTML = `
                <div class="feedback correct">
                    <h4>✅ Correct!</h4>
                    <p>${selectedOption.explanation}</p>
                </div>
            `;
        }
    } else {
        if (quizFeedback) {
            quizFeedback.innerHTML = `
                <div class="feedback incorrect">
                    <h4>❌ Incorrect</h4>
                    <p>${selectedOption.explanation}</p>
                </div>
            `;
        }
    }
    
    // Move to next question after delay
    setTimeout(() => {
        currentQuestion++;
        showQuestion();
    }, 2000);
}

function showResults() {
    const quizQuestion = document.getElementById('quiz-question');
    const quizFeedback = document.getElementById('quiz-feedback');
    const quizResults = document.getElementById('quiz-results');
    
    if (quizQuestion) quizQuestion.classList.add('hidden');
    if (quizFeedback) quizFeedback.classList.add('hidden');
    
    if (quizResults) {
        const percentage = Math.round((score / quizData.length) * 100);
        
        quizResults.innerHTML = `
            <div class="quiz-results-card">
                <h3>Quiz Complete!</h3>
                <p>Your score: ${score} out of ${quizData.length}</p>
                <p>Accuracy: ${percentage}%</p>
                
                <div class="quiz-score-display">
                    ${percentage >= 80 ? 
                        '<div class="score-excellent">🏆 Excellent! You can spot scams well.</div>' :
                        percentage >= 60 ? 
                            '<div class="score-good">👍 Good! You have decent scam detection skills.</div>' :
                            '<div class="score-poor">📚 Keep Learning! Review the explanations to improve.</div>'
                    }
                </div>
                
                <button class="restart-btn" onclick="restartQuiz()">🔄 Try Again</button>
            </div>
        `;
    }
    
    // Save score if user is logged in
    if (currentUser) {
        saveQuizScore(score);
    }
}

function restartQuiz() {
    currentQuestion = 0;
    score = 0;
    
    const quizStart = document.getElementById('quiz-start');
    const quizQuestion = document.getElementById('quiz-question');
    const quizFeedback = document.getElementById('quiz-feedback');
    const quizResults = document.getElementById('quiz-results');
    
    // Reset all quiz states
    if (quizStart) {
        quizStart.classList.add('hidden');
        quizFeedback.classList.add('hidden');
        quizResults.classList.add('hidden');
        quizStart.classList.remove('hidden');
    }
    
    // Reload quiz display to show scores
    if (currentUser) {
        loadQuizScores();
    } else {
        if (quizStart) {
            quizStart.innerHTML = `
                <p>Can you spot the scam? We'll show you emails and you decide if they're legitimate or scams.</p>
                <button id="start-quiz" class="start-btn">🚀 Start Quiz</button>
            `;
            
            const startQuizBtn = document.getElementById('start-quiz');
            if (startQuizBtn) {
                startQuizBtn.addEventListener('click', startQuiz);
            }
        }
    }
}

// Inbox Functionality
function initializeInbox() {
    // Add back to inbox button listener
    initializeInboxDetail();
}

function updateEmailHistory() {
    const userInboxContent = document.getElementById('user-inbox-content');
    if (!userInboxContent) return;
    
    const inboxEmailDetail = document.getElementById('inbox-email-detail');
    
    if (!currentUser) {
        userInboxContent.innerHTML = '<p>Please log in to view your email history.</p>';
        return;
    }
    
    const users = JSON.parse(localStorage.getItem('users') || '{}');
    const username = currentUser.id;
    const history = users[username]?.emailHistory || [];
    
    if (history.length === 0) {
        userInboxContent.innerHTML = '<p>No emails analyzed yet.</p>';
        return;
    }
    
    // Display emails
    const historyHtml = history.map(item => `
        <div class="history-item" data-id="${item.id}" onclick="showEmailFromHistory(${item.id})">
            <div class="history-header">
                <div class="history-from">${item.from}</div>
                <div class="history-subject">${item.subject}</div>
                <div class="history-date">${new Date(item.date).toLocaleString()}</div>
            </div>
            <div class="history-preview">${item.body}</div>
            <div class="risk-indicator ${item.riskLevel}">${item.riskLevel.toUpperCase()}</div>
        </div>
    `).join('');
    
    userInboxContent.innerHTML = historyHtml;
}

function showEmailFromHistory(emailId) {
    const users = JSON.parse(localStorage.getItem('users') || '{}');
    const username = currentUser.id;
    const history = users[username]?.emailHistory || [];
    const emailItem = history.find(item => item.id === emailId);
    
    if (emailItem) {
        // Combine stored analysis data with full email data
        const emailData = {
            ...emailItem.fullEmail,
            riskLevel: emailItem.riskLevel,
            confidence: emailItem.confidence,
            warnings: emailItem.warnings,
            isScam: emailItem.isScam,
            from: emailItem.from,
            subject: emailItem.subject,
            body: emailItem.fullEmail?.body || emailItem.body,
            received: emailItem.fullEmail?.received || emailItem.received
        };
        
        // Show email analysis in inbox detail section
        showInboxEmailDetail(emailData);
    }
}

function showInboxEmailDetail(email) {
    const userInboxContent = document.getElementById('user-inbox-content');
    const inboxEmailDetail = document.getElementById('inbox-email-detail');
    const inboxEmailAnalysis = document.getElementById('inbox-email-analysis');
    
    // Ensure highlighting styles are loaded
    ensureHighlightStyles();
    
    // Use passed email data directly (it should already contain complete analysis)
    const analysis = {
        riskLevel: email.riskLevel,
        confidence: email.confidence,
        warnings: email.warnings || [],
        isScam: email.isScam
    };
    
    const highlightedSubject = highlightScamIndicators(email.subject);
    const highlightedContent = highlightScamIndicators(email.body);
    
    // Hide inbox list and show detail view
    if (userInboxContent) userInboxContent.classList.add('hidden');
    if (inboxEmailDetail) inboxEmailDetail.classList.remove('hidden');
    
    // Display email analysis
    if (inboxEmailAnalysis) {
        inboxEmailAnalysis.innerHTML = `
            <div class="email-analysis-inline">
                <div class="risk-summary">
                    <span class="scam-indicator ${analysis.riskLevel}">${analysis.riskLevel.toUpperCase()} RISK</span>
                    <span>Confidence: ${Math.round(analysis.confidence * 100)}%</span>
                </div>
                
                <div class="email-content highlighted">
                    <div class="email-header">
                        <strong>From:</strong> ${email.from}<br>
                        <strong>Subject:</strong> ${highlightedSubject}<br>
                        <strong>Received:</strong> ${email.received ? email.received.toLocaleString() : new Date(email.date).toLocaleString()}
                    </div>
                    <div class="email-body">${highlightedContent.replace(/\n/g, '<br>')}</div>
                </div>
                
                <div class="analysis-details">
                    <h5>🔍 Scam Indicators Found:</h5>
                    <ul class="warning-list">
                        ${analysis.warnings.map(warning => `<li>${warning}</li>`).join('')}
                    </ul>
                    <div class="recommendation">
                        ${analysis.isScam ? 
                            `<div style="background: #f8d7da; padding: 1rem; border-radius: 8px; margin-top: 1rem;">
                                <strong>⚠️ CONFIRMED SCAM!</strong><br>
                                This email shows multiple indicators of a scam. Do not respond, click any links, or provide personal information.
                            </div>` :
                            `<div style="background: #d4edda; padding: 1rem; border-radius: 8px; margin-top: 1rem;">
                                <strong>✅ LOW RISK</strong><br>
                                This email appears legitimate, but always verify through official company channels.
                            </div>`
                        }
                    </div>
                </div>
                <button id="back-to-inbox" class="analyze-another-btn">← Back to Inbox</button>
            </div>
        `;
    }
    
    // Add back button event listener
    setTimeout(() => {
        const backToInboxBtn = document.getElementById('back-to-inbox');
        if (backToInboxBtn) {
            backToInboxBtn.addEventListener('click', function() {
                const userInboxContent = document.getElementById('user-inbox-content');
                const inboxEmailDetail = document.getElementById('inbox-email-detail');
                
                // Show inbox list and hide detail view
                if (userInboxContent) userInboxContent.classList.remove('hidden');
                if (inboxEmailDetail) inboxEmailDetail.classList.add('hidden');
            });
        }
    }, 100);
}

function initializeInboxDetail() {
    const backToInboxBtn = document.getElementById('back-to-inbox');
    
    if (backToInboxBtn) {
        backToInboxBtn.addEventListener('click', function() {
            const userInboxContent = document.getElementById('user-inbox-content');
            const inboxEmailDetail = document.getElementById('inbox-email-detail');
            
            // Show inbox list and hide detail view
            if (userInboxContent) userInboxContent.classList.remove('hidden');
            if (inboxEmailDetail) inboxEmailDetail.classList.add('hidden');
        });
    }
}

function saveEmailToHistory(emailData) {
    if (!currentUser) return;

    const users = JSON.parse(localStorage.getItem('users') || '{}');
    const username = currentUser.id;

    // Check if email already exists to prevent duplicates
    const existingEmail = users[username].emailHistory.find(item => 
        item.from === emailData.from && 
        item.subject === emailData.subject && 
        Math.abs(new Date(item.date) - new Date()) < 5000 // Within 5 seconds
    );
    
    if (existingEmail) {
        return; // Don't save duplicate
    }
    
    // Add email to history
    const historyItem = {
        id: Date.now(),
        from: emailData.from,
        subject: emailData.subject,
        body: emailData.body.substring(0, 200) + '...', // Store preview
        riskLevel: emailData.riskLevel,
        confidence: emailData.confidence,
        warnings: emailData.warnings,
        isScam: emailData.isScam,
        date: new Date().toISOString(),
        fullEmail: {
            ...emailData,
            body: emailData.body // Store full body for detailed view
        }
    };
    
    users[username].emailHistory.unshift(historyItem); // Add to beginning
    
    // Keep only last 50 emails
    if (users[username].emailHistory.length > 50) {
        users[username].emailHistory = users[username].emailHistory.slice(0, 50);
    }
    
    localStorage.setItem('users', JSON.stringify(users));
    
    // Update inbox if we're on that page
    if (currentPage === 'inbox') {
        updateEmailHistory();
    }
}

function saveQuizScore(score) {
    if (!currentUser) return;

    const users = JSON.parse(localStorage.getItem('users') || '{}');
    const username = currentUser.id;
    
    if (!users[username].quizScores) {
        users[username].quizScores = [];
    }
    
    users[username].quizScores.push({
        score: score,
        total: quizData.length,
        percentage: Math.round((score / quizData.length) * 100),
        date: new Date().toISOString()
    });
    
    // Keep only last 10 scores
    if (users[username].quizScores.length > 10) {
        users[username].quizScores = users[username].quizScores.slice(0, 10);
    }
    
    localStorage.setItem('users', JSON.stringify(users));
}

function loadQuizScores() {
    if (!currentUser) return;

    const users = JSON.parse(localStorage.getItem('users') || '{}');
    const username = currentUser.id;
    const scores = users[username]?.quizScores || [];
    
    if (scores.length === 0) {
        const quizStart = document.getElementById('quiz-start');
        if (quizStart) {
            quizStart.innerHTML = `
                <p>Can you spot the scam? We'll show you emails and you decide if they're legitimate or scams.</p>
                <button id="start-quiz" class="start-btn">🚀 Start Quiz</button>
            `;
            
            const startQuizBtn = document.getElementById('start-quiz');
            if (startQuizBtn) {
                startQuizBtn.addEventListener('click', startQuiz);
            }
        }
        return;
    }
    
    const scoresHtml = `
        <div class="quiz-scores">
            <h3>Your Quiz History</h3>
            <div class="scores-list">
                ${scores.map((score, index) => `
                    <div class="score-item">
                        <span class="score-rank">#${index + 1}</span>
                        <span class="score-details">
                            ${score.score}/${score.total} (${score.percentage}%)
                            <span class="score-date">${new Date(score.date).toLocaleString()}</span>
                        </span>
                    </div>
                `).join('')}
            </div>
            <button class="view-history-btn" onclick="showQuizHistory()">📊 View Detailed History</button>
        </div>
    `;
    
    const quizStart = document.getElementById('quiz-start');
    if (quizStart) {
        quizStart.innerHTML = scoresHtml;
    }
}

function showQuizHistory() {
    const users = JSON.parse(localStorage.getItem('users') || '{}');
    const username = currentUser.id;
    const scores = users[username]?.quizScores || [];
    
    if (scores.length === 0) {
        alert('No quiz history available.');
        return;
    }
    
    // Create modal overlay
    const modal = document.createElement('div');
    modal.className = 'quiz-modal-overlay';
    modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background-color: rgba(0, 0, 0, 0.8);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 1000;
    `;
    
    const historyHtml = `
        <div class="quiz-history-modal">
            <div class="quiz-history-header">
                <h3>Quiz History</h3>
                <button class="close-btn" onclick="closeQuizHistory()">✕</button>
            </div>
            <div class="quiz-history-content">
                ${scores.map((score, index) => `
                    <div class="history-item">
                        <div class="history-header">
                            <span class="history-date">${new Date(score.date).toLocaleString()}</span>
                            <span class="score-badge">${score.percentage}%</span>
                        </div>
                        <div class="history-details">
                            Score: ${score.score}/${score.total} correct
                            ${score.percentage >= 80 ? '🏆 Excellent' : score.percentage >= 60 ? '👍 Good' : '📚 Keep Learning'}
                        </div>
                    </div>
                `).join('')}
            </div>
        </div>
    `;
    
    modal.innerHTML = historyHtml;
    document.body.appendChild(modal);
    
    // Add close functionality
    modal.addEventListener('click', function(e) {
        if (e.target === modal) {
            closeQuizHistory();
        }
    });
}

function closeQuizHistory() {
    const modal = document.querySelector('.quiz-modal-overlay');
    if (modal) {
        modal.remove();
    }
}

function ensureHighlightStyles() {
    if (!document.getElementById('highlight-styles')) {
        const style = document.createElement('style');
        style.id = 'highlight-styles';
        style.textContent = `
            .highlight-urgent { 
                background-color: #ff6b6b !important; 
                color: white !important; 
                padding: 2px 4px !important; 
                border-radius: 3px !important;
                font-weight: bold !important;
                display: inline-block !important;
            }
            .highlight-payment { 
                background-color: #dc3545 !important; 
                color: white !important; 
                padding: 2px 4px !important; 
                border-radius: 3px !important;
                font-weight: bold !important;
                display: inline-block !important;
            }
            .highlight-personal { 
                background-color: #fd7e14 !important; 
                color: white !important; 
                padding: 2px 4px !important; 
                border-radius: 3px !important;
                font-weight: bold !important;
                display: inline-block !important;
            }
            .highlight-congratulations { 
                background-color: #ffc107 !important; 
                color: #333 !important; 
                padding: 2px 4px !important; 
                border-radius: 3px !important;
                font-weight: bold !important;
                display: inline-block !important;
            }
            .highlight-money { 
                background-color: #20c997 !important; 
                color: white !important; 
                padding: 2px 4px !important; 
                border-radius: 3px !important;
                font-weight: bold !important;
                display: inline-block !important;
            }
            .highlight-pressure { 
                background-color: #6f42c1 !important; 
                color: white !important; 
                padding: 2px 4px !important; 
                border-radius: 3px !important;
                font-weight: bold !important;
                display: inline-block !important;
            }
        `;
        document.head.appendChild(style);
    }
}

function highlightScamIndicators(text) {
    let highlightedText = text;
    
    // Define patterns to highlight with different colors
    const highlightPatterns = [
        {
            pattern: /\b(urgent|immediate|act now|limited time|don't miss|expires|deadline)\b/gi,
            class: 'highlight-urgent',
            explanation: 'Urgent language - pressure tactic'
        },
        {
            pattern: /\b(pay|payment|fee|cost|charge|wire transfer|bank account|credit card)\b/gi,
            class: 'highlight-payment',
            explanation: 'Payment request - major red flag'
        },
        {
            pattern: /\b(personal information|ssn|social security|passport|driver's license|bank details)\b/gi,
            class: 'highlight-personal',
            explanation: 'Personal information request'
        },
        {
            pattern: /\b(congratulations|selected|won|prize|reward)\b/gi,
            class: 'highlight-congratulations',
            explanation: 'Too good to be true language'
        },
        {
            pattern: /\b(\$[0-9,]+|[0-9,]+ dollars?|[0-9,]+ usd)\b/gi,
            class: 'highlight-money',
            explanation: 'Specific money amounts'
        },
        {
            pattern: /\b(reply immediately|respond now|contact urgently)\b/gi,
            class: 'highlight-pressure',
            explanation: 'Pressure to respond quickly'
        }
    ];
    
    // Apply highlighting
    highlightPatterns.forEach(({pattern, class: className, explanation}) => {
        highlightedText = highlightedText.replace(pattern, 
            `<span class="${className}" title="${explanation}">$&</span>`
        );
    });
    
    return highlightedText;
}

// Scroll to About section
function scrollToAbout() {
    const aboutSection = document.getElementById('about');
    if (aboutSection) {
        aboutSection.scrollIntoView({ behavior: 'smooth' });
    }
}
