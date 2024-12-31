'use strict';

// DOM Elements
const timerDisplay = document.getElementById('timer');
const questionTimerDisplay = document.getElementById('questionTimer');
const startBtn = document.getElementById('startBtn');
const nextBtn = document.getElementById('nextBtn');
const resetBtn = document.getElementById('resetBtn');
const remainingCountDisplay = document.getElementById('remainingCount');
const totalCountDisplay = document.getElementById('totalCount');
const editTotalBtn = document.querySelector('.edit-total');
const worstTimeDisplay = document.querySelector('.time-stats .worst');
const avgTimeDisplay = document.querySelector('.time-stats .average');
const bestTimeDisplay = document.querySelector('.time-stats .best');
const etfDisplay = document.getElementById('etf');

// Timer variables
let timeElapsed = 0;
let timerInterval = null;
let solvedQuestions = 0;
let totalQuestions = 20; // Default to 20 questions
let isPaused = true;
let times = [];
let lastQuestionStartTime = 0;

// Confetti configuration
const confettiConfig = {
    particleCount: 30,
    spread: 100,
    origin: { y: 0 }
};

// Format time from seconds to MM:SS
function formatTime(seconds) {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
}

// Format time from seconds to HH:MM:SS
function formatETF(seconds) {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
}

// Fire confetti
function fireConfetti() {
    // Fire from left
    confetti({
        ...confettiConfig,
        origin: { x: 0.2, y: 0.6 },
        angle: 60
    });

    // Fire from right
    confetti({
        ...confettiConfig,
        origin: { x: 0.8, y: 0.6 },
        angle: 120
    });
}

// Update statistics
function updateStats() {
    if (times.length === 0) {
        worstTimeDisplay.textContent = '00:00';
        avgTimeDisplay.textContent = '00:00';
        bestTimeDisplay.textContent = '00:00';
        etfDisplay.textContent = '00:00:00';
        return;
    }

    // Calculate times
    const avgTime = Math.floor(times.reduce((a, b) => a + b, 0) / times.length);
    const bestTime = Math.min(...times);
    const worstTime = Math.max(...times);

    // Update displays
    worstTimeDisplay.textContent = formatTime(worstTime);
    avgTimeDisplay.textContent = formatTime(avgTime);
    bestTimeDisplay.textContent = formatTime(bestTime);

    // Calculate ETF (Estimated Time to Finish)
    const remainingQuestions = totalQuestions - solvedQuestions;
    const etf = avgTime * remainingQuestions;
    etfDisplay.textContent = formatETF(etf);
}

// Update timer display
function updateTimer() {
    timeElapsed++;
    timerDisplay.textContent = formatTime(timeElapsed);

    // Update question timer
    const questionTime = timeElapsed - lastQuestionStartTime;
    questionTimerDisplay.textContent = formatTime(questionTime);
}

// Toggle timer
function toggleTimer() {
    if (isPaused) {
        // Start timer
        timerInterval = setInterval(updateTimer, 1000);
        startBtn.textContent = 'Pause';
        startBtn.classList.add('paused');
        nextBtn.disabled = false;

        if (timeElapsed === 0) {
            lastQuestionStartTime = 0;
        }
    } else {
        // Pause timer
        clearInterval(timerInterval);
        startBtn.textContent = 'Resume';
        startBtn.classList.remove('paused');
    }

    isPaused = !isPaused;
}

// Next question
function nextQuestion() {
    if (timeElapsed === 0 || solvedQuestions >= totalQuestions) return;

    const questionTime = timeElapsed - lastQuestionStartTime;

    // Update statistics
    times.push(questionTime);
    solvedQuestions++;
    remainingCountDisplay.textContent = solvedQuestions;

    updateStats();

    // Reset states for next question
    lastQuestionStartTime = timeElapsed;
    questionTimerDisplay.textContent = '00:00';

    // Fire confetti
    fireConfetti();
}

// Reset everything
function resetAll() {
    clearInterval(timerInterval);

    // Clear all data
    times = [];
    solvedQuestions = 0;
    timeElapsed = 0;
    lastQuestionStartTime = 0;
    isPaused = true;

    // Reset UI
    timerDisplay.textContent = '00:00';
    questionTimerDisplay.textContent = '00:00';
    remainingCountDisplay.textContent = '0';
    startBtn.textContent = 'Start';
    startBtn.classList.remove('paused');
    nextBtn.disabled = false;

    // Update stats and remove states
    updateStats();
    timerDisplay.classList.remove('success-state', 'danger-state');
}

// Edit total questions
function editTotalQuestions() {
    const newTotal = prompt('Enter total number of questions:', totalQuestions);
    if (newTotal !== null) {
        const parsedTotal = parseInt(newTotal);
        if (!isNaN(parsedTotal) && parsedTotal > 0) {
            totalQuestions = parsedTotal;
            totalCountDisplay.textContent = totalQuestions;
            updateStats();
        }
    }
}

// Event Listeners
startBtn.addEventListener('click', toggleTimer);
nextBtn.addEventListener('click', nextQuestion);
resetBtn.addEventListener('click', resetAll);
editTotalBtn.addEventListener('click', editTotalQuestions);

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    timerDisplay.textContent = '00:00';
    questionTimerDisplay.textContent = '00:00';
    totalCountDisplay.textContent = totalQuestions; // Set initial total questions display
    updateStats();
}); 