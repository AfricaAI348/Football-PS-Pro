class GameUtils {
    static random(min, max) {
        return Math.random() * (max - min) + min;
    }

    static randomInt(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    static clamp(value, min, max) {
        return Math.min(Math.max(value, min), max);
    }

    static distance(x1, y1, x2, y2) {
        return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
    }

    static isMobile() {
        return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    }
}

class FootballPhysics {
    constructor() {
        this.gravity = 0.2;
        this.friction = 0.98;
        this.bounceFactor = 0.6;
    }

    calculateShotTrajectory(player, target, power) {
        const basePower = player.stats.shooting * power / 100;
        return {
            velocityX: basePower * 1.5,
            velocityY: -basePower * 0.3,
            curve: 0,
            dip: basePower * 0.1
        };
    }

    calculateShotAccuracy(player) {
        const baseAccuracy = 0.8;
        const technique = player.stats.technique / 100 || 0.8;
        return baseAccuracy * technique;
    }
}

class PlayerManager {
    constructor() {
        this.players = new Map();
    }

    createPlayer(data, isUser = true) {
        const player = {
            element: null,
            ...data,
            stamina: 100,
            speed: 80 + Math.random() * 20,
            power: 70 + Math.random() * 30,
            technique: 75 + Math.random() * 25,
            hasBall: false,
            isSelected: false
        };
        this.players.set(player.id, player);
        return player;
    }
}

class FootballAI {
    constructor(game) {
        this.game = game;
        this.difficulty = 'medium';
    }

    makeDecision(playerWithBall) {
        const situation = this.analyzeSituation(playerWithBall);
        const options = this.generateOptions(playerWithBall, situation);
        return this.chooseBestOption(options);
    }

    analyzeSituation(player) {
        return {
            position: player.x < 60 ? 'midfield' : 'attacking',
            pressure: this.calculatePressure(player),
            goalOpportunity: this.assessGoalOpportunity(player)
        };
    }

    calculatePressure(player) {
        const opponents = this.game.players.home;
        let pressure = 0;
        opponents.forEach(opponent => {
            const distance = GameUtils.distance(player.x, player.y, opponent.x, opponent.y);
            if (distance < 20) pressure += (20 - distance) / 20;
        });
        return Math.min(pressure, 1);
    }

    assessGoalOpportunity(player) {
        if (player.x < 60) return 0;
        const distanceToGoal = 100 - player.x;
        return Math.max(0, 1 - distanceToGoal / 40);
    }

    generateOptions(player, situation) {
        const options = [];
        if (situation.goalOpportunity > 0.3) {
            options.push({ type: 'shoot', confidence: situation.goalOpportunity });
        }
        options.push({ type: 'pass', confidence: 0.7 });
        options.push({ type: 'dribble', confidence: 0.5 });
        return options;
    }

    chooseBestOption(options) {
        if (options.length === 0) return { type: 'hold' };
        return options.sort((a, b) => b.confidence - a.confidence)[0];
    }
}

class CommentarySystem {
    constructor() {
        this.commentaryLines = {
            goal: ["GOAL! What an absolutely brilliant finish!", "He's done it! A magnificent goal!", "That's in the back of the net! Superb football!"],
            shot: ["What an effort! Just wide of the post.", "Good strike, but it's straight at the keeper."],
            skill: ["Oh what skill! He's made the defender look silly.", "Magnificent footwork to get away from his marker."],
            pass: ["Beautiful passing movement!", "A perfectly weighted pass!"],
            tackle: ["What a perfectly timed challenge!", "Excellent defensive work!"]
        };
    }

    addCommentary(eventType, context = {}) {
        const lines = this.commentaryLines[eventType];
        if (!lines) return;

        const randomLine = lines[Math.floor(Math.random() * lines.length)];
        this.displayCommentary(randomLine, context);
    }

    displayCommentary(commentary, context) {
        const commentaryFeed = document.querySelector('.commentary-messages');
        if (!commentaryFeed) return;

        const commentElement = document.createElement('div');
        commentElement.className = 'comment-message';
        
        const now = new Date();
        const timeString = `${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`;
        
        commentElement.innerHTML = `<span class="comment-time">${timeString}</span> <strong>Martin Tyler:</strong> ${commentary}`;
        commentaryFeed.appendChild(commentElement);
        
        commentaryFeed.scrollTop = commentaryFeed.scrollHeight;
        if (commentaryFeed.children.length > 8) {
            commentaryFeed.removeChild(commentaryFeed.firstChild);
        }
    }
}

class FootballGame {
    constructor() {
        this.gameState = {
            isPlaying: false,
            isPaused: false,
            matchTime: 0,
            homeScore: 0,
            awayScore: 0,
            possession: 'home',
            selectedPlayer: null,
            half: 1
        };

        this.players = { home: [], away: [] };
        this.ball = { x: 50, y: 50, withPlayer: null, element: null };
        this.physics = new FootballPhysics();
        this.playerManager = new PlayerManager();
        this.ai = new FootballAI(this);
        this.commentary = new CommentarySystem();

        this.initializeGame();
    }

    initializeGame() {
        this.setupEventListeners();
        this.createPitchElements();
        this.generateTeams();
        this.startGameLoop();
        this.showLoadingScreen();
    }

    setupEventListeners() {
        document.querySelectorAll('.action-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const action = e.target.dataset.action;
                this.handlePlayerAction(action);
            });
        });

        document.querySelectorAll('.skill-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const skill = e.target.dataset.skill;
                this.performSkillMove(skill);
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

    createPitchElements() {
        const pitch = document.getElementById('gamePitch');
        this.ball.element = document.createElement('div');
        this.ball.element.className = 'ball';
        this.ball.element.style.left = '50%';
        this.ball.element.style.top = '50%';
        pitch.appendChild(this.ball.element);
    }

    generateTeams() {
        this.players.home = [
            this.createPlayerElement({ id: 1, name: 'Courtois', number: 1, position: 'GK', x: 10, y: 50 }, true),
            this.createPlayerElement({ id: 2, name: 'Carvajal', number: 2, position: 'RB', x: 25, y: 20 }, true),
            this.createPlayerElement({ id: 3, name: 'Rudiger', number: 3, position: 'CB', x: 25, y: 40 }, true),
            this.createPlayerElement({ id: 4, name: 'Alaba', number: 4, position: 'CB', x: 25, y: 60 }, true),
            this.createPlayerElement({ id: 5, name: 'Mendy', number: 5, position: 'LB', x: 25, y: 80 }, true),
            this.createPlayerElement({ id: 6, name: 'Modric', number: 6, position: 'CM', x: 40, y: 30 }, true),
            this.createPlayerElement({ id: 7, name: 'Kroos', number: 7, position: 'CM', x: 40, y: 50 }, true),
            this.createPlayerElement({ id: 8, name: 'Valverde', number: 8, position: 'CM', x: 40, y: 70 }, true),
            this.createPlayerElement({ id: 9, name: 'Ronaldo', number: 9, position: 'RW', x: 60, y: 20 }, true),
            this.createPlayerElement({ id: 10, name: 'Benzema', number: 10, position: 'ST', x: 60, y: 50 }, true),
            this.createPlayerElement({ id: 11, name: 'Vinicius', number: 11, position: 'LW', x: 60, y: 80 }, true)
        ];

        this.players.away = [
            this.createPlayerElement({ id: 12, name: 'Ter Stegen', number: 1, position: 'GK', x: 90, y: 50 }, false),
            this.createPlayerElement({ id: 13, name: 'Kounde', number: 2, position: 'RB', x: 75, y: 20 }, false),
            this.createPlayerElement({ id: 14, name: 'Araujo', number: 3, position: 'CB', x: 75, y: 40 }, false),
            this.createPlayerElement({ id: 15, name: 'Christensen', number: 4, position: 'CB', x: 75, y: 60 }, false),
            this.createPlayerElement({ id: 16, name: 'Balde', number: 5, position: 'LB', x: 75, y: 80 }, false),
            this.createPlayerElement({ id: 17, name: 'Pedri', number: 6, position: 'CM', x: 60, y: 30 }, false),
            this.createPlayerElement({ id: 18, name: 'Busquets', number: 7, position: 'CM', x: 60, y: 50 }, false),
            this.createPlayerElement({ id: 19, name: 'De Jong', number: 8, position: 'CM', x: 60, y: 70 }, false),
            this.createPlayerElement({ id: 20, name: 'Raphinha', number: 9, position: 'RW', x: 40, y: 20 }, false),
            this.createPlayerElement({ id: 21, name: 'Lewandowski', number: 10, position: 'ST', x: 40, y: 50 }, false),
            this.createPlayerElement({ id: 22, name: 'Dembele', number: 11, position: 'LW', x: 40, y: 80 }, false)
        ];

        this.selectPlayer(10);
        this.ball.withPlayer = 10;
        this.moveBallToPlayer(this.players.home.find(p => p.id === 10));
    }

    createPlayerElement(data, isUser) {
        const pitch = document.getElementById('gamePitch');
        const player = this.playerManager.createPlayer(data, isUser);
        
        const playerElement = document.createElement('div');
        playerElement.className = `player ${isUser ? 'user' : 'computer'}`;
        playerElement.dataset.playerId = data.id;
        playerElement.style.left = `${data.x}%`;
        playerElement.style.top = `${data.y}%`;
        
        const number = document.createElement('div');
        number.className = 'player-number';
        number.textContent = data.number;
        playerElement.appendChild(number);

        const nameTag = document.createElement('div');
        nameTag.className = 'player-name-tag';
        nameTag.textContent = data.name;
        playerElement.appendChild(nameTag);

        pitch.appendChild(playerElement);
        player.element = playerElement;
        return player;
    }

    selectPlayer(playerId) {
        if (this.gameState.selectedPlayer) {
            const currentPlayer = this.players.home.find(p => p.id === this.gameState.selectedPlayer);
            if (currentPlayer) currentPlayer.element.classList.remove('selected');
        }

        const player = this.players.home.find(p => p.id === playerId);
        if (player) {
            player.element.classList.add('selected');
            this.gameState.selectedPlayer = playerId;
            this.updatePlayerIndicator(player);
            if (this.ball.withPlayer === playerId) this.moveBallToPlayer(player);
        }
    }

    updatePlayerIndicator(player) {
        const indicator = document.getElementById('playerIndicator');
        const avatar = indicator.querySelector('.player-avatar');
        const stats = indicator.querySelectorAll('.stat-bar .fill');
        avatar.textContent = player.name.split(' ').map(n => n[0]).join('');
        stats[0].style.width = `${player.stamina}%`;
        stats[1].style.width = `${player.power}%`;
    }

    handlePlayerAction(action) {
        if (!this.gameState.isPlaying || this.gameState.isPaused) return;
        const player = this.players.home.find(p => p.id === this.gameState.selectedPlayer);
        if (!player) return;

        switch(action) {
            case 'pass': this.passBall(player); break;
            case 'shoot': this.shootBall(player); break;
            case 'tackle': this.tackle(player); break;
            case 'skill': this.showSkillOptions(); break;
            case 'switch': this.switchPlayer(); break;
        }
        setTimeout(() => this.computerAction(), 1000);
    }

    performSkillMove(skill) {
        const player = this.players.home.find(p => p.id === this.gameState.selectedPlayer);
        if (!player) return;

        const effect = document.createElement('div');
        effect.className = `skill-effect ${skill}-effect`;
        effect.style.left = player.element.style.left;
        effect.style.top = player.element.style.top;
        document.getElementById('gamePitch').appendChild(effect);

        setTimeout(() => effect.remove(), 600);
        this.commentary.addCommentary('skill', { playerName: player.name });
    }

    passBall(player) {
        if (this.ball.withPlayer !== player.id) return;
        const teammates = this.players.home.filter(p => p.id !== player.id);
        const nearest = this.findNearestPlayer(player, teammates);
        if (nearest) {
            this.moveBallToPlayer(nearest);
            this.commentary.addCommentary('pass', { playerName: player.name, targetName: nearest.name });
        }
    }

    shootBall(player) {
        if (this.ball.withPlayer !== player.id) return;
        const isGoal = Math.random() < this.physics.calculateShotAccuracy(player);
        if (isGoal) {
            this.gameState.homeScore++;
            this.updateScore();
            this.commentary.addCommentary('goal', { playerName: player.name });
        } else {
            this.commentary.addCommentary('shot', { playerName: player.name });
        }
        this.resetBall();
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
            const distance = GameUtils.distance(fromPlayer.x, fromPlayer.y, player.x, player.y);
            if (distance < minDistance) {
                minDistance = distance;
                nearest = player;
            }
        });
        return nearest;
    }

    startGameLoop() {
        this.gameLoop = setInterval(() => {
            if (!this.gameState.isPaused && this.gameState.isPlaying) this.updateGame();
        }, 1000 / 60);
    }

    updateGame() {
        this.updateMatchTime();
        this.updatePlayerPositions();
        this.computerAI();
    }

    updateMatchTime() {
        this.gameState.matchTime += 1/60;
        if (this.gameState.matchTime >= 45 && this.gameState.half === 1) {
            this.gameState.half = 2;
            this.gameState.matchTime = 0;
            this.commentary.addCommentary('First half ends! Second half begins.');
        } else if (this.gameState.matchTime >= 45 && this.gameState.half === 2) this.endMatch();
        this.updateTimeDisplay();
    }

    updateTimeDisplay() {
        const timeElement = document.getElementById('matchTime');
        const minutes = Math.floor(this.gameState.matchTime);
        const seconds = Math.floor((this.gameState.matchTime - minutes) * 60);
        timeElement.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }

    updatePlayerPositions() {
        this.players.away.forEach(player => this.updateAIPlayerPosition(player));
    }

    computerAI() {
        if (this.gameState.possession === 'away') {
            const computerWithBall = this.players.away.find(p => p.id === this.ball.withPlayer);
            if (computerWithBall) {
                const decision = this.ai.makeDecision(computerWithBall);
                this.executeComputerDecision(computerWithBall, decision);
            }
        }
    }

    executeComputerDecision(player, decision) {
        switch(decision.type) {
            case 'shoot': this.computerShoot(player); break;
            case 'pass': this.computerPass(player); break;
            case 'dribble': this.computerDribble(player); break;
        }
    }

    computerShoot(player) {
        const isGoal = Math.random() < this.physics.calculateShotAccuracy(player);
        if (isGoal) {
            this.gameState.awayScore++;
            this.updateScore();
            this.commentary.addCommentary('goal', { playerName: player.name });
        } else this.commentary.addCommentary('shot', { playerName: player.name });
        this.resetBall();
    }

    computerPass(player) {
        const teammates = this.players.away.filter(p => p.id !== player.id);
        const nearest = this.findNearestPlayer(player, teammates);
        if (nearest) this.moveBallToPlayer(nearest);
    }

    updateAIPlayerPosition(player) {
        if (this.ball.withPlayer === player.id) {
            player.x = GameUtils.clamp(player.x + 0.2, 0, 100);
        } else {
            const dx = this.ball.x - player.x;
            const dy = this.ball.y - player.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            if (distance > 10) {
                player.x = GameUtils.clamp(player.x + (dx / distance) * 0.1, 0, 100);
                player.y = GameUtils.clamp(player.y + (dy / distance) * 0.1, 0, 100);
            }
        }
        player.element.style.left = `${player.x}%`;
        player.element.style.top = `${player.y}%`;
    }

    handleKeyboardInput(e) {
        if (!this.gameState.isPlaying || this.gameState.isPaused) return;
        const player = this.players.home.find(p => p.id === this.gameState.selectedPlayer);
        if (!player) return;

        const speed = 0.5;
        let newX = player.x, newY = player.y;
        switch(e.key.toLowerCase()) {
            case 'w': newY = Math.max(0, player.y - speed); break;
            case 's': newY = Math.min(100, player.y + speed); break;
            case 'a': newX = Math.max(0, player.x - speed); break;
            case 'd': newX = Math.min(100, player.x + speed); break;
        }

        player.x = newX; player.y = newY;
        player.element.style.left = `${newX}%`;
        player.element.style.top = `${newY}%`;

        if (this.ball.withPlayer === player.id) {
            this.ball.x = newX; this.ball.y = newY;
            this.ball.element.style.left = `${newX}%`;
            this.ball.element.style.top = `${newY}%`;
        }
    }

    togglePause() {
        this.gameState.isPaused = !this.gameState.isPaused;
        const modal = document.getElementById('pauseModal');
        modal.style.display = this.gameState.isPaused ? 'flex' : 'none';
    }

    updateScore() {
        document.getElementById('homeScore').textContent = this.gameState.homeScore;
        document.getElementById('awayScore').textContent = this.gameState.awayScore;
    }

    resetBall() {
        this.ball.x = 50; this.ball.y = 50;
        this.ball.withPlayer = null;
        this.ball.element.style.left = '50%';
        this.ball.element.style.top = '50%';
        this.gameState.possession = Math.random() > 0.5 ? 'home' : 'away';
    }

    switchPlayer
