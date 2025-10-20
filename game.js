// PWA Service Worker Registration
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('sw.js')
            .then(registration => {
                console.log('SW registered: ', registration);
            })
            .catch(registrationError => {
                console.log('SW registration failed: ', registrationError);
            });
    });
}

// PWA Install Prompt
let deferredPrompt;
const installButton = document.getElementById('install-button');
const pwaInstall = document.getElementById('pwa-install');

window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    pwaInstall.style.display = 'block';
});

installButton.addEventListener('click', async () => {
    if (deferredPrompt) {
        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        if (outcome === 'accepted') {
            pwaInstall.style.display = 'none';
        }
        deferredPrompt = null;
    }
});

// Game variables
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const homeScoreElement = document.getElementById('home-score');
const awayScoreElement = document.getElementById('away-score');
const timerElement = document.getElementById('timer');
const startButton = document.getElementById('start-button');
const gameStatus = document.getElementById('game-status');

// Game state
let gameRunning = false;
let homeScore = 0;
let awayScore = 0;
let matchTime = 90 * 60;
let timerInterval;

// Field dimensions
const fieldWidth = canvas.width;
const fieldHeight = canvas.height;
const goalWidth = 100;
const goalHeight = 20;
const centerX = fieldWidth / 2;
const centerY = fieldHeight / 2;

// Player properties
const playerRadius = 15;
const playerSpeed = 3;

// Ball properties
const ballRadius = 10;
let ball = {
    x: centerX,
    y: centerY,
    dx: 0,
    dy: 0,
    speed: 0,
    friction: 0.98
};

// Players
const players = [
    // Home team (player 1 controlled)
    { x: centerX - 100, y: centerY, dx: 0, dy: 0, team: 'home', color: '#3498db', hasBall: false },
    { x: centerX - 150, y: centerY - 50, dx: 0, dy: 0, team: 'home', color: '#3498db', hasBall: false },
    { x: centerX - 150, y: centerY + 50, dx: 0, dy: 0, team: 'home', color: '#3498db', hasBall: false },
    { x: centerX - 200, y: centerY, dx: 0, dy: 0, team: 'home', color: '#3498db', hasBall: false },
    
    // Away team (AI controlled)
    { x: centerX + 100, y: centerY, dx: 0, dy: 0, team: 'away', color: '#e74c3c', hasBall: false },
    { x: centerX + 150, y: centerY - 50, dx: 0, dy: 0, team: 'away', color: '#e74c3c', hasBall: false },
    { x: centerX + 150, y: centerY + 50, dx: 0, dy: 0, team: 'away', color: '#e74c3c', hasBall: false },
    { x: centerX + 200, y: centerY, dx: 0, dy: 0, team: 'away', color: '#e74c3c', hasBall: false }
];

// Input handling
const keys = {};

window.addEventListener('keydown', (e) => {
    keys[e.key] = true;
    
    if (gameRunning && e.key === ' ' && players[0].hasBall) {
        kickBall(players[0]);
    }
    
    if (gameRunning && e.key === 'Enter' && players[4].hasBall) {
        kickBall(players[4]);
    }
});

window.addEventListener('keyup', (e) => {
    keys[e.key] = false;
});

// Touch controls for mobile
canvas.addEventListener('touchstart', handleTouch);
canvas.addEventListener('touchmove', handleTouch);

function handleTouch(e) {
    e.preventDefault();
    if (!gameRunning) return;
    
    const touch = e.touches[0];
    const rect = canvas.getBoundingClientRect();
    const touchX = touch.clientX - rect.left;
    const touchY = touch.clientY - rect.top;
    
    // Simple touch control - move player toward touch
    const dx = touchX - players[0].x;
    const dy = touchY - players[0].y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    
    if (dist > 10) {
        players[0].dx = (dx / dist) * playerSpeed;
        players[0].dy = (dy / dist) * playerSpeed;
    }
    
    // Kick if player has ball and touch is far enough
    if (players[0].hasBall && dist > 50) {
        kickBall(players[0]);
    }
}

// Start game
startButton.addEventListener('click', startGame);

function startGame() {
    gameRunning = true;
    homeScore = 0;
    awayScore = 0;
    matchTime = 90 * 60;
    updateScore();
    resetBall();
    
    players[0].x = centerX - 100;
    players[0].y = centerY;
    players[1].x = centerX - 150;
    players[1].y = centerY - 50;
    players[2].x = centerX - 150;
    players[2].y = centerY + 50;
    players[3].x = centerX - 200;
    players[3].y = centerY;
    
    players[4].x = centerX + 100;
    players[4].y = centerY;
    players[5].x = centerX + 150;
    players[5].y = centerY - 50;
    players[6].x = centerX + 150;
    players[6].y = centerY + 50;
    players[7].x = centerX + 200;
    players[7].y = centerY;
    
    startButton.style.display = 'none';
    
    clearInterval(timerInterval);
    timerInterval = setInterval(updateTimer, 1000);
    
    requestAnimationFrame(gameLoop);
}

function updateTimer() {
    if (!gameRunning) return;
    
    matchTime--;
    
    if (matchTime <= 0) {
        endGame();
        return;
    }
    
    const minutes = Math.floor(matchTime / 60);
    const seconds = matchTime % 60;
    timerElement.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

function endGame() {
    gameRunning = false;
    clearInterval(timerInterval);
    
    let message = "MATCH ENDED - ";
    if (homeScore > awayScore) {
        message += "HOME TEAM WINS!";
    } else if (awayScore > homeScore) {
        message += "AWAY TEAM WINS!";
    } else {
        message += "IT'S A DRAW!";
    }
    
    gameStatus.innerHTML = `<h2>${message}</h2><button id="restart-button">PLAY AGAIN</button>`;
    document.getElementById('restart-button').addEventListener('click', startGame);
}

function updateScore() {
    homeScoreElement.textContent = homeScore;
    awayScoreElement.textContent = awayScore;
}

function resetBall() {
    ball.x = centerX;
    ball.y = centerY;
    ball.dx = 0;
    ball.dy = 0;
    ball.speed = 0;
    players.forEach(player => player.hasBall = false);
}

function kickBall(player) {
    const angle = Math.atan2(ball.y - player.y, ball.x - player.x);
    const power = 8;
    
    ball.dx = Math.cos(angle) * power;
    ball.dy = Math.sin(angle) * power;
    ball.speed = power;
    player.hasBall = false;
}

function checkGoal() {
    if (ball.x < 0 && ball.y > centerY - goalWidth/2 && ball.y < centerY + goalWidth/2) {
        awayScore++;
        updateScore();
        showGoalMessage("AWAY TEAM SCORES!");
        resetBall();
        return true;
    }
    
    if (ball.x > fieldWidth && ball.y > centerY - goalWidth/2 && ball.y < centerY + goalWidth/2) {
        homeScore++;
        updateScore();
        showGoalMessage("HOME TEAM SCORES!");
        resetBall();
        return true;
    }
    
    return false;
}

function showGoalMessage(message) {
    const goalMessage = document.createElement('div');
    goalMessage.className = 'goal-message';
    goalMessage.textContent = message;
    goalMessage.style.display = 'block';
    document.body.appendChild(goalMessage);
    
    setTimeout(() => {
        goalMessage.style.display = 'none';
        document.body.removeChild(goalMessage);
    }, 2000);
}

function updatePlayerMovement() {
    if (keys['w'] || keys['W']) players[0].dy = -playerSpeed;
    else if (keys['s'] || keys['S']) players[0].dy = playerSpeed;
    else players[0].dy = 0;
    
    if (keys['a'] || keys['A']) players[0].dx = -playerSpeed;
    else if (keys['d'] || keys['D']) players[0].dx = playerSpeed;
    else players[0].dx = 0;
    
    if (keys['ArrowUp']) players[4].dy = -playerSpeed;
    else if (keys['ArrowDown']) players[4].dy = playerSpeed;
    else players[4].dy = 0;
    
    if (keys['ArrowLeft']) players[4].dx = -playerSpeed;
    else if (keys['ArrowRight']) players[4].dx = playerSpeed;
    else players[4].dx = 0;
    
    players.forEach(player => {
        player.x += player.dx;
        player.y += player.dy;
        
        if (player.x < playerRadius) player.x = playerRadius;
        if (player.x > fieldWidth - playerRadius) player.x = fieldWidth - playerRadius;
        if (player.y < playerRadius) player.y = playerRadius;
        if (player.y > fieldHeight - playerRadius) player.y = fieldHeight - playerRadius;
    });
    
    for (let i = 1; i < 4; i++) {
        if (!players[i].hasBall) {
            if (ball.x < centerX) {
                const dx = ball.x - players[i].x;
                const dy = ball.y - players[i].y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                
                if (dist > 50) {
                    players[i].dx = (dx / dist) * playerSpeed * 0.7;
                    players[i].dy = (dy / dist) * playerSpeed * 0.7;
                } else {
                    players[i].dx = 0;
                    players[i].dy = 0;
                }
            } else {
                const targetX = centerX - 150 + (i-1) * 50;
                const targetY = centerY - 50 + (i-1) * 50;
                const dx = targetX - players[i].x;
                const dy = targetY - players[i].y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                
                if (dist > 10) {
                    players[i].dx = (dx / dist) * playerSpeed * 0.5;
                    players[i].dy = (dy / dist) * playerSpeed * 0.5;
                } else {
                    players[i].dx = 0;
                    players[i].dy = 0;
                }
            }
        }
    }
    
    for (let i = 5; i < 8; i++) {
        if (!players[i].hasBall) {
            if (ball.x > centerX) {
                const dx = ball.x - players[i].x;
                const dy = ball.y - players[i].y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                
                if (dist > 50) {
                    players[i].dx = (dx / dist) * playerSpeed * 0.7;
                    players[i].dy = (dy / dist) * playerSpeed * 0.7;
                } else {
                    players[i].dx = 0;
                    players[i].dy = 0;
                }
            } else {
                const targetX = centerX + 150 - (i-5) * 50;
                const targetY = centerY - 50 + (i-5) * 50;
                const dx = targetX - players[i].x;
                const dy = targetY - players[i].y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                
                if (dist > 10) {
                    players[i].dx = (dx / dist) * playerSpeed * 0.5;
                    players[i].dy = (dy / dist) * playerSpeed * 0.5;
                } else {
                    players[i].dx = 0;
                    players[i].dy = 0;
                }
            }
        }
    }
}

function updateBall() {
    ball.dx *= ball.friction;
    ball.dy *= ball.friction;
    ball.speed *= ball.friction;
    
    ball.x += ball.dx;
    ball.y += ball.dy;
    
    if (ball.y - ballRadius < 0 || ball.y + ballRadius > fieldHeight) {
        ball.dy = -ball.dy * 0.8;
    }
    
    if (ball.x - ballRadius < 0 || ball.x + ballRadius > fieldWidth) {
        if (!checkGoal()) {
            ball.dx = -ball.dx * 0.8;
        }
    }
    
    if (ball.x < ballRadius) ball.x = ballRadius;
    if (ball.x > fieldWidth - ballRadius) ball.x = fieldWidth - ballRadius;
    if (ball.y < ballRadius) ball.y = ballRadius;
    if (ball.y > fieldHeight - ballRadius) ball.y = fieldHeight - ballRadius;
    
    players.forEach(player => {
        const dx = ball.x - player.x;
        const dy = ball.y - player.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance < playerRadius + ballRadius) {
            if (!player.hasBall) {
                player.hasBall = true;
                players.forEach(p => {
                    if (p !== player) p.hasBall = false;
                });
                
                const angle = Math.atan2(dy, dx);
                ball.x = player.x + Math.cos(angle) * (playerRadius + ballRadius);
                ball.y = player.y + Math.sin(angle) * (playerRadius + ballRadius);
                ball.dx = player.dx;
                ball.dy = player.dy;
                ball.speed = 0;
            } else {
                const kickPower = 5;
                ball.dx = dx / distance * kickPower;
                ball.dy = dy / distance * kickPower;
                ball.speed = kickPower;
                player.hasBall = false;
            }
        }
    });
}

function drawField() {
    ctx.fillStyle = '#2a5c2a';
    ctx.fillRect(0, 0, fieldWidth, fieldHeight);
    
    ctx.strokeStyle = 'white';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(centerX, 0);
    ctx.lineTo(centerX, fieldHeight);
    ctx.stroke();
    
    ctx.beginPath();
    ctx.arc(centerX, centerY, 70, 0, Math.PI * 2);
    ctx.stroke();
    
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, centerY - goalWidth/2, goalHeight, goalWidth);
    ctx.fillRect(fieldWidth - goalHeight, centerY - goalWidth/2, goalHeight, goalWidth);
    
    ctx.strokeRect(0, centerY - goalWidth, 130, goalWidth * 2);
    ctx.strokeRect(fieldWidth - 130, centerY - goalWidth, 130, goalWidth * 2);
}

function drawPlayers() {
    players.forEach(player => {
        ctx.fillStyle = player.color;
        ctx.beginPath();
        ctx.arc(player.x, player.y, playerRadius, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.fillStyle = 'white';
        ctx.font = '12px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        
        let playerNumber = players.indexOf(player) + 1;
        if (playerNumber > 4) playerNumber -= 4;
        ctx.fillText(playerNumber, player.x, player.y);
        
        if (player.hasBall) {
            ctx.strokeStyle = 'yellow';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.arc(player.x, player.y, playerRadius + 3, 0, Math.PI * 2);
            ctx.stroke();
        }
    });
}

function drawBall() {
    ctx.fillStyle = 'white';
    ctx.beginPath();
    ctx.arc(ball.x, ball.y, ballRadius, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.strokeStyle = 'black';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(ball.x, ball.y, ballRadius, 0, Math.PI * 2);
    ctx.stroke();
    
    for (let i = 0; i < 5; i++) {
        const angle = (i * 2 * Math.PI) / 5;
        const x = ball.x + Math.cos(angle) * ballRadius * 0.5;
        const y = ball.y + Math.sin(angle) * ballRadius * 0.5;
        ctx.beginPath();
        ctx.arc(x, y, 2, 0, Math.PI * 2);
        ctx.fillStyle = 'black';
        ctx.fill();
    }
}

function gameLoop() {
    if (!gameRunning) return;
    
    updatePlayerMovement();
    updateBall();
    
    drawField();
    drawPlayers();
    drawBall();
    
    requestAnimationFrame(gameLoop);
}

// Initial setup
drawField();
drawPlayers();
drawBall();
