// Replace this part in your game.js file
document.querySelector(".start-btn").addEventListener("click", function() {
    document.getElementById('main').style.display = 'none';
    document.getElementById('rulesContainer').style.display = 'none';
    
    // Fix the primary container display and layout
    const primary = document.getElementById('primary');
    primary.style.display = 'flex';
    primary.style.width = '100%';
    primary.style.maxWidth = '100%';
    primary.style.flexDirection = 'column';
    primary.style.alignItems = 'center';
    
    // Initialize the game after properly setting up the container
    initGame();
});
function toggleRules() {
    const rulesContainer = document.getElementById('rulesContainer');
    const main = document.getElementById('main');
    if (rulesContainer.style.display === 'block') {
        rulesContainer.style.display = 'none';

    } else {
        rulesContainer.style.display = 'block';
        main.style.marginLeft = '407px';
    }
}


// Game variables
let currentLevel = 1;
let moves = 0;
let totalMoves = 0;
let pairs = 0;
let totalPairs = 6;
let firstCard = null;
let secondCard = null;
let lockBoard = false;
let timer = 0;
let timerInterval;
let totalTime = 0;

// DOM Elements
const cardsGrid = document.getElementById('cards-grid');
const movesElement = document.getElementById('moves');
const pairsElement = document.getElementById('pairs');
const timerElement = document.getElementById('timer');
const currentLevelElement = document.getElementById('current-level');
const levelTitleElement = document.getElementById('level-title');
const nextLevelBtn = document.getElementById('next-level-btn');
const restartBtn = document.getElementById('restart-btn');
const levelCompleteModal = document.getElementById('level-complete-modal');
const gameCompleteModal = document.getElementById('game-complete-modal');
const modalRestartBtn = document.getElementById('modal-restart-btn');
const modalNextBtn = document.getElementById('modal-next-btn');
const playAgainBtn = document.getElementById('play-again-btn');
const completedLevelElement = document.getElementById('completed-level');
const modalTimeElement = document.getElementById('modal-time');
const modalMovesElement = document.getElementById('modal-moves');
const totalTimeElement = document.getElementById('total-time');
const totalMovesElement = document.getElementById('total-moves');

// Level content
const levelContent = {
    1: {
        title: "JavaScript Variables",
        pairs: [
            {
                keyword: "let",
                explanation: "Declares a block-scoped variable that can be reassigned",
                code: "let x = 5;\nx = 10; // OK"
            },
            {
                keyword: "const",
                explanation: "Declares a block-scoped variable that cannot be reassigned",
                code: "const PI = 3.14;\n// PI = 3.15; // Error"
            },
            {
                keyword: "var",
                explanation: "Declares a function-scoped variable that can be reassigned",
                code: "var count = 1;\ncount = 2; // OK"
            },
            {
                keyword: "Scope",
                explanation: "Determines where variables are accessible in your code",
                code: "// Block scope vs Function scope"
            },
            {
                keyword: "Hoisting",
                explanation: "Variables are processed before code execution",
                code: "console.log(x); // undefined\nvar x = 5;"
            },
            {
                keyword: "Destructuring",
                explanation: "Extract multiple values from data stored in objects and arrays",
                code: "const {name, age} = person;"
            }
        ]
    },
    2: {
        title: "Control Structures",
        pairs: [
            {
                keyword: "if/else",
                explanation: "Executes code block if condition is true, otherwise executes else block",
                code: "if (x > 10) {\n  // code\n} else {\n  // code\n}"
            },
            {
                keyword: "for",
                explanation: "Loops through a block of code a specified number of times",
                code: "for (let i = 0; i < 5; i++) {\n  console.log(i);\n}"
            },
            {
                keyword: "while",
                explanation: "Loops through a block of code while a condition is true",
                code: "while (count < 10) {\n  count++;\n}"
            },
            {
                keyword: "switch",
                explanation: "Selects one of many code blocks to be executed",
                code: "switch(day) {\n  case 'Monday':\n    // code\n    break;\n}"
            },
            {
                keyword: "try/catch",
                explanation: "Marks a block of statements to try and specifies a response if an exception is thrown",
                code: "try {\n  // code\n} catch (error) {\n  // handle error\n}"
            },
            {
                keyword: "for...of",
                explanation: "Loops through the values of an iterable object",
                code: "for (const item of array) {\n  console.log(item);\n}"
            }
        ]
    },
    3: {
        title: "JavaScript Functions",
        pairs: [
            {
                keyword: "function",
                explanation: "Declares a function with the specified parameters",
                code: "function greet(name) {\n  return Hello, ${name};\n}"
            },
            {
                keyword: "Arrow Function",
                explanation: "Shorter syntax for writing function expressions",
                code: "const add = (a, b) => a + b;"
            },
            {
                keyword: "Parameters",
                explanation: "Variables listed as part of the function definition",
                code: "function sum(a, b = 0) {\n  return a + b;\n}"
            },
            {
                keyword: "return",
                explanation: "Specifies the value to be returned by the function",
                code: "function multiply(a, b) {\n  return a * b;\n}"
            },
            {
                keyword: "Callback",
                explanation: "A function passed as an argument to another function",
                code: "array.forEach(item => {\n  console.log(item);\n});"
            },
            {
                keyword: "Closure",
                explanation: "A function that has access to its outer function's scope",
                code: "function outer() {\n  const x = 10;\n  return () => x;\n}"
            }
        ]
    }
};
        // Initialize game
        function initGame(level = 1) {
            // Reset game state
            currentLevel = level;
            moves = 0;
            pairs = 0;
            resetTimer();
            startTimer();
            
            // Update
            currentLevelElement.textContent = currentLevel;
            levelTitleElement.textContent = levelContent[currentLevel].title;
            movesElement.textContent = moves;
            pairsElement.textContent = pairs;
            nextLevelBtn.disabled = true;  // Makes the button unclickable
            
            // Prepare cards
            const currentLevelPairs = levelContent[currentLevel].pairs;
            const cards = [];
            
            // Create keyword cards
            currentLevelPairs.forEach(pair => {
                cards.push({
                    type: 'keyword',
                    keyword: pair.keyword,
                    matchId: pair.keyword
                });
                
                cards.push({
                    type: 'explanation',
                    explanation: pair.explanation,
                    code: pair.code,
                    matchId: pair.keyword
                });
            });
            
            // Shuffle cards
            shuffleArray(cards);
            
            // Create card elements
            cardsGrid.innerHTML = '';
            cards.forEach((card, index) => {
                const cardElement = document.createElement('div');
                cardElement.classList.add('card');
                cardElement.dataset.index = index;
                cardElement.dataset.matchId = card.matchId;
                
                // Create card front
                const cardFront = document.createElement('div');
                cardFront.classList.add('card-face', 'card-front');
                
                // Create card back
                const cardBack = document.createElement('div');
                cardBack.classList.add('card-face', 'card-back');
                
                // Add content based on card type
                if (card.type === 'keyword') {
                    cardFront.innerHTML =` <div class="keyword">${card.keyword}</div>`;
                } else {
                    cardFront.innerHTML = `
                        <div class="card-content">
                            <div class="explanation">${card.explanation}</div>
                            <div class="code">${card.code}</div>
                        </div>
                    `;
                }
                
                // Append to card
                cardElement.appendChild(cardFront);
                cardElement.appendChild(cardBack);
                
                // Add click event
                cardElement.addEventListener('click', flipCard);
                
                // Add to grid
                cardsGrid.appendChild(cardElement);
            });
        }
        
        // Shuffle array (Fisher-Yates algorithm)
        function shuffleArray(array) {
            for (let i = array.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [array[i], array[j]] = [array[j], array[i]];
            }
            return array;
        }
        
        // Start timer
        function startTimer() {
            timer = 0;
            timerElement.textContent = '00:00';
            timerInterval = setInterval(() => {
                timer++;
                updateTimerDisplay();
            }, 1000);
        }
        
        // Update timer display
        function updateTimerDisplay() {
            const minutes = Math.floor(timer / 60).toString().padStart(2, '0');
            const seconds = (timer % 60).toString().padStart(2, '0');
            timerElement.textContent = `${minutes}:${seconds}`;
        }
        
        // Format time 
        function formatTime(timeInSeconds) {
            const minutes = Math.floor(timeInSeconds / 60).toString().padStart(2, '0');
            const seconds = (timeInSeconds % 60).toString().padStart(2, '0');
            return `${minutes}:${seconds}`;
        }
        
        // Reset timer
        function resetTimer() {
            clearInterval(timerInterval);
            timer = 0;
            timerElement.textContent = '00:00';
        }
        
        // Flip card handler
        function flipCard() {
            if (lockBoard) return;
            if (this === firstCard) return;
            if (this.classList.contains('flipped')) return;
            
            this.classList.add('flipped');
            
            if (!firstCard) {
                // First card flipped
                firstCard = this;
                return;
            }
            
            // Second card flipped
            secondCard = this;
            moves++;
            movesElement.textContent = moves;
            
            checkForMatch();
        }
        
        // Check if cards match
        function checkForMatch() {
            const isMatch = firstCard.dataset.matchId === secondCard.dataset.matchId;
            
            if (isMatch) {
                disableCards();
                pairs++;
                pairsElement.textContent = pairs;
                
                // Check if level complete
                if (pairs === totalPairs) {
                    setTimeout(() => {
                        levelComplete();
                    }, 500);
                }
            } else {
                unflipCards();
            }
        }
        
        // Disable matched cards
        function disableCards() {
            firstCard.removeEventListener('click', flipCard);
            secondCard.removeEventListener('click', flipCard);
            
            firstCard.querySelector('.card-front').classList.add('matched');
            secondCard.querySelector('.card-front').classList.add('matched');
            
            resetBoard();
        }
        
        // Unflip cards
        function unflipCards() {
            lockBoard = true;
            
            setTimeout(() => {
                firstCard.classList.remove('flipped');
                secondCard.classList.remove('flipped');
                
                resetBoard();
            }, 1000);
        }
        
        // Reset board
        function resetBoard() {
            [firstCard, secondCard] = [null, null];
            lockBoard = false;
        }
        
        // Level complete
        function levelComplete() {
            clearInterval(timerInterval);
            totalTime += timer;
            totalMoves += moves;
            nextLevelBtn.disabled = false;
            
            if (currentLevel < 3) {
                // Show level complete modal
                completedLevelElement.textContent = currentLevel;
                modalTimeElement.textContent = formatTime(timer);
                modalMovesElement.textContent = moves;
                levelCompleteModal.classList.add('active');
            } else {
                // Show game complete modal
                totalTimeElement.textContent = formatTime(totalTime);
                totalMovesElement.textContent = totalMoves;
                gameCompleteModal.classList.add('active');
            }
        }
        
        // Next level
        function nextLevel() {
            levelCompleteModal.classList.remove('active');
            if (currentLevel < 3) {
                currentLevel++;
                initGame(currentLevel);
            }
        }
        
        // Restart current level
        function restartLevel() {
            levelCompleteModal.classList.remove('active');
            initGame(currentLevel);
        }
        
        // Play again (restart game)
        function playAgain() {
            gameCompleteModal.classList.remove('active');
            totalTime = 0;
            totalMoves = 0;
            initGame(1);
        }
        
        // Event listeners
        restartBtn.addEventListener('click', restartLevel);
        nextLevelBtn.addEventListener('click', nextLevel);
        modalRestartBtn.addEventListener('click', restartLevel);
        modalNextBtn.addEventListener('click', nextLevel);
        playAgainBtn.addEventListener('click', playAgain);
        
        // Initialize game
        initGame();