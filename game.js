class FootballGame {
    constructor() {
        this.gameState = {
            isPlaying: false,
            isPaused: false,
            matchTime: 300,
            homeScore: 0,
            awayScore: 0,
            possession: 'home',
            selectedPlayer: 1
        };

        this.players = {
            home: [],
            away: []
        };

        this.ball = {
            x: 50,
            y: 50,
            withPlayer: null
        };

        this.init();
    }

    init() {
        this.createPitch();
        this.generateTeams();
        this.setupEventListeners();
        this.startGame();
    }

    createPitch() {
        const pitch = document.getElementById('gamePitch');
        const elements = [
            'pitch-outline', 'halfway-line', 'center-circle', 'center-spot',
            'penalty-area left', 'penalty-area right', 'goal left', 'goal right'
        ];

        elements.forEach(className => {
            const el = document.createElement('div');
            el.className = className;
            pitch.appendChild(el);
        });

        this.ball.element = document.createElement('div');
        this.ball.element.className = 'ball';
        this.ball.element.style.left = '50%';
        this.ball.element.style.top = '50%';
        pitch.appendChild(this.ball.element);
    }

    generateTeams() {
        const pitch = document.getElementById('gamePitch');
        
        // Home team (User)
        const homePlayers = [
            { id: 1, name: 'GK', number: 1, x: 10, y: 50 },
            { id: 2, name: 'DEF', number: 2, x: 25, y: 20 },
            { id: 3, name: 'DEF', number: 3, x: 25, y: 40 },
            { id: 4, name: 'DEF', number: 4, x: 25, y: 60 },
            { id: 5, name: 'DEF', number: 5, x: 25, y: 80 },
            { id: 6, name: 'MID', number: 6, x: 40, y: 30 },
            { id: 7, name: 'MID', number: 7, x: 40, y: 50 },
            { id: 8, name: 'MID', number: 8, x: 40, y: 70 },
            { id: 9, name: 'ATT', number: 9, x: 60, y: 20 },
            { id: 10, name: 'ATT', number: 10, x: 60, y: 50 },
            { id: 11, name: 'ATT', number: 11, x: 60, y: 80 }
        ];

        // Away team (Computer)
        const awayPlayers = [
            { id: 12, name: 'GK', number: 1, x: 90, y: 50 },
            { id: 13, name: 'DEF', number: 2, x: 75, y: 20 },
            { id: 14, name: 'DEF', number: 3, x: 75, y: 40 },
            { id: 15, name: 'DEF', number: 4, x: 75, y: 60 },
            { id: 16, name: 'DEF', number: 5, x: 75, y: 80 },
            { id: 17, name: 'MID', number: 6, x: 60, y: 30 },
            { id: 18, name: 'MID', number: 7, x: 60, y: 50 },
            { id: 19, name: 'MID', number: 8, x: 60, y: 70 },
            { id: 20, name: 'ATT', number: 9, x: 40, y: 20 },
            { id: 21, name: 'ATT', number: 10, x: 40, y: 50 },
            { id: 22, name: 'ATT', number: 11, x: 40, y: 80 }
        ];

        this.players.home = homePlayers.map(data => this.createPlayerElement(data, true));
        this.players.away = awayPlayers.map(data => this.createPlayerElement(data, false));

        this.selectPlayer(10);
        this.ball.withPlayer = 10;
        this.moveBallToPlayer(this.players.home.find(p => p.id === 10));
    }

    createPlayerElement(data, isUser) {
        const pitch = document.getElementById('gamePitch');
        const player = document.createElement('div');
        player.className = `player ${isUser ? 'user' : 'computer'}`;
        player.dataset.playerId = data.id;
        player.style.left = `${data.x}%`;
        player.style.top = `${data.y}%`;
        
        const number = document.createElement('div');
        number.textContent = data.number;
        player.appendChild(number);

        pitch.appendChild(player);

        return {
            element: player,
            ...data,
            isUser: isUser
        };
    }

    setupEventListeners() {
        document.querySelectorAll('.action-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const action = e.target.dataset.action;
                this.handlePlayerAction(action);
            });
        });

        document.getElementById('pauseBtn').addEventListener('click', () => {
            this.togglePause();
        });

        document.getElementById('resumeBtn').addEventListener('click', () => {
            this.togglePause();
        });

        document.addEventListener('keydown', (e) => {
            this.handleKeyboardInput(e);
        });

        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('player') && e.target.classList.contains('user')) {
                const playerId = parseInt(e.target.dataset.playerId);
                this.selectPlayer(playerId);
            }
        });
    }

    selectPlayer(playerId) {
        this.players.home.forEach(player => {
            player.element.classList.remove('selected');
        });

        const player = this.players.home.find(p => p.id === playerId);
        if (player) {
            player.element.classList.add('selected');
            this.gameState.selectedPlayer = playerId;
            
            if (this.ball.withPlayer === playerId) {
                this.moveBallToPlayer(player);
            }
        }
    }

    handlePlayerAction(action) {
        if (!this.gameState.isPlaying || this.gameState.isPaused) return;

        const player = this.players.home.find(p => p.id === this.gameState.selectedPlayer);
        if (!player) return;

        switch(action) {
            case 'pass':
                this.passBall(player);
                break;
            case 'shoot':
                this.shootBall(player);
                break;
            case 'tackle':
                this.tackle(player);
                break;
            case 'switch':
                this.switchPlayer();
                break;
        }

        setTimeout(() => this.computerAction(), 1000);
    }

    passBall(player) {
        if (this.ball.withPlayer !== player.id) return;

        const teammates = this.players.home.filter(p => p.id !== player.id);
        const nearest = this.findNearestPlayer(player, teammates);
        
        if (nearest) {
            this.moveBallToPlayer(nearest);
            this.addCommentary(`Pass to player ${nearest.number}`);
        }
    }

    shootBall(player) {
        if (this.ball.withPlayer !== player.id) return;

        const isGoal = Math.random() > 0.7;
        if (isGoal) {
            this.gameState.homeScore++;
            this.updateScore();
            this.addCommentary('GOAL! Amazing shot!');
        } else {
            this.addCommentary('Shot missed!');
        }

        this.resetBall();
    }

    tackle(player) {
        if (this.gameState.possession === 'away') {
            const isSuccessful = Math.random() > 0.5;
            if (isSuccessful) {
                this.gameState.possession = 'home';
                this.ball.withPlayer = player.id;
                this.moveBallToPlayer(player);
                this.addCommentary('Great tackle!');
            }
        }
    }

    switchPlayer() {
        const userPlayers = this.players.home.filter(p => p.id !== 1);
        const currentIndex = userPlayers.findIndex(p => p.id === this.gameState.selectedPlayer);
        const nextIndex = (currentIndex + 1) % userPlayers.length;
        this.selectPlayer(userPlayers[nextIndex].id);
        this.addCommentary('Player switched');
    }

    moveBallToPlayer(targetPlayer) {
        this.ball.withPlayer = targetPlayer.id;
        this.ball.x = targetPlayer.x;
        this.ball.y = targetPlayer.y;
        
        this.ball.element.style.left = `${targetPlayer.x}%`;
        this.ball.element.style.top = `${targetPlayer.y}%`;
        
        this.ball.element.classList.add('moving');
        setTimeout(() => this.ball.element.classList.remove('moving'), 300);
    }

    findNearestPlayer(fromPlayer, players) {
        let nearest = null;
        let minDistance = Infinity;

        players.forEach(player => {
            const distance = Math.sqrt(
                Math.pow(fromPlayer.x - player.x, 2) + 
                Math.pow(fromPlayer.y - player.y, 2)
            );
            
            if (distance < minDistance) {
                minDistance = distance;
                nearest = player;
            }
        });

        return nearest;
    }

    computerAction() {
        if (this.gameState.possession === 'away') {
            const computerWithBall = this.players.away.find(p => p.id === this.ball.withPlayer);
            if (computerWithBall) {
                const shouldShoot = computerWithBall.x > 60 && Math.random() > 0.7;
                
                if (shouldShoot) {
                    const isGoal = Math.random() > 0.6;
                    if (isGoal) {
                        this.gameState.awayScore++;
                        this.updateScore();
                        this.addCommentary('Computer scores!');
                    } else {
                        this.addCommentary('Computer shoots wide!');
                    }
                    this.resetBall();
                } else {
                    const teammates = this.players.away.filter(p => p.id !== computerWithBall.id);
                    const nearest = this.findNearestPlayer(computerWithBall, teammates);
                    if (nearest) {
                        this.moveBallToPlayer(nearest);
                    }
                }
            }
        }
    }

    handleKeyboardInput(e) {
        if (!this.gameState.isPlaying || this.gameState.isPaused) return;

        const player = this.players.home.find(p => p.id === this.gameState.selectedPlayer);
        if (!player) return;

        const speed = 0.5;
        let newX = player.x;
        let newY = player.y;

        switch(e.key.toLowerCase()) {
            case 'w':
                newY = Math.max(0, player.y - speed);
                break;
            case 's':
                newY = Math.min(100, player.y + speed);
                break;
            case 'a':
                newX = Math.max(0, player.x - speed);
                break;
            case 'd':
                newX = Math.min(100, player.x + speed);
                break;
        }

        player.x = newX;
        player.y = newY;
        player.element.style.left = `${newX}%`;
        player.element.style.top = `${newY}%`;

        if (this.ball.withPlayer === player.id) {
            this.ball.x = newX;
            this.ball.y = newY;
            this.ball.element.style.left = `${newX}%`;
            this.ball.element.style.top = `${newY}%`;
        }
    }

    startGame() {
        this.hideLoadingScreen();
        this.gameState.isPlaying = true;
        this.startTimer();
        this.addCommentary('Match started! Good luck!');
    }

    hideLoadingScreen() {
        const loadingScreen = document.getElementById('loadingScreen');
        const mainContainer = document.getElementById('mainContainer');
        
        setTimeout(() => {
            loadingScreen.style.display = 'none';
            mainContainer.style.display = 'flex';
        }, 2000);
    }

    startTimer() {
        setInterval(() => {
            if (!this.gameState.isPaused && this.gameState.isPlaying) {
                this.gameState.matchTime--;
                this.updateTimeDisplay();
                
                if (this.gameState.matchTime <= 0) {
                    this.endMatch();
                }
            }
        }, 1000);
    }

    updateTimeDisplay() {
        const minutes = Math.floor(this.gameState.matchTime / 60);
        const seconds = this.gameState.matchTime % 60;
        document.getElementById('matchTime').textContent = 
            `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }

    updateScore() {
        document.getElementById('homeScore').textContent = this.gameState.homeScore;
        document.getElementById('awayScore').textContent = this.gameState.awayScore;
    }

    resetBall() {
        this.ball.x = 50;
        this.ball.y = 50;
        this.ball.withPlayer = null;
        this.ball.element.style.left = '50%';
        this.ball.element.style.top = '50%';
        
        this.gameState.possession = Math.random() > 0.5 ? 'home' : 'away';
    }

    addCommentary(message) {
        const commentary = document.getElementById('commentaryMessages');
        const comment = document.createElement('div');
        comment.className = 'comment-message';
        
        const now = new Date();
        const time = `${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`;
        
        comment.textContent = `${time} - ${message}`;
        commentary.appendChild(comment);
        
        commentary.scrollTop = commentary.scrollHeight;
        if (commentary.children.length > 5) {
            commentary.removeChild(commentary.firstChild);
        }
    }

    togglePause() {
        this.gameState.isPaused = !this.gameState.isPaused;
        const modal = document.getElementById('pauseModal');
        modal.style.display = this.gameState.isPaused ? 'flex' : 'none';
    }

    endMatch() {
        this.gameState.isPlaying = false;
        
        let resultMessage = "";
        if (this.gameState.homeScore > this.gameState.awayScore) {
            resultMessage = "Congratulations! You win!";
        } else if (this.gameState.homeScore < this.gameState.awayScore) {
            resultMessage = "Computer wins! Better luck next time.";
        } else {
            resultMessage = "It's a draw! Well played.";
        }
        
        this.addCommentary(`Full time! ${resultMessage}`);
    }
}

window.addEventListener('load', () => {
    window.footballGame = new FootballGame();
});
