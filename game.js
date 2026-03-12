class LinkGame {
    constructor() {
        this.boardSize = 8;
        this.cellTypes = [
            // 火象星座
            { symbol: '♈', name: '白羊', element: 'fire' },
            { symbol: '♌', name: '狮子', element: 'fire' },
            { symbol: '♐', name: '射手', element: 'fire' },
            // 水象星座
            { symbol: '♋', name: '巨蟹', element: 'water' },
            { symbol: '♏', name: '天蝎', element: 'water' },
            { symbol: '♓', name: '双鱼', element: 'water' },
            // 风象星座
            { symbol: '♊', name: '双子', element: 'air' },
            { symbol: '♎', name: '天秤', element: 'air' },
            { symbol: '♒', name: '水瓶', element: 'air' },
            // 土象星座
            { symbol: '♉', name: '金牛', element: 'earth' },
            { symbol: '♍', name: '处女', element: 'earth' },
            { symbol: '♑', name: '摩羯', element: 'earth' }
        ];
        this.board = [];
        this.selectedCell = null;
        this.score = 0;
        this.level = 1;
        this.isAnimating = false;
        this.boardSizeLevel = 8;
        this.comboCount = 0;
        this.lastEliminateTime = 0;
        this.comboTimer = null;
        this.isPaused = false;
        this.highScore = parseInt(localStorage.getItem('linkGameHighScore')) || 0;
        this.totalLevels = 18;
        this.levelThemes = [
            { name: '白羊座', color: '#ff6b6b' },
            { name: '金牛座', color: '#4ecdc4' },
            { name: '双子座', color: '#ffe66d' },
            { name: '巨蟹座', color: '#95e1d3' },
            { name: '狮子座', color: '#ffa502' },
            { name: '处女座', color: '#a8e6cf' },
            { name: '天秤座', color: '#ffd3a5' },
            { name: '天蝎座', color: '#ff8b94' },
            { name: '射手座', color: '#a8d8ea' },
            { name: '摩羯座', color: '#aa96da' },
            { name: '水瓶座', color: '#fcbad3' },
            { name: '双鱼座', color: '#87ceeb' },
            { name: '木星', color: '#daa520' },
            { name: '金星', color: '#c71585' },
            { name: '土星', color: '#cd853f' },
            { name: '火星', color: '#b22222' },
            { name: '月球', color: '#c0c0c0' },
            { name: '太阳', color: '#ffd700' }
        ];

        // 计时器相关
        this.timeLeft = 60;
        this.maxTime = 60;
        this.timerInterval = null;

        // 连连看需要边界，实际棋盘比显示的大2
        this.padding = 1;

        // 游戏结束标记
        this.isGameOver = false;

        // 游戏是否已开始
        this.gameStarted = false;

        // 地图布局模板（0=空格，1=可玩区域）
        this.mapLayouts = this.getMapLayouts();

        this.init();
    }

    init() {
        this.createBoard();
        this.render();
        // 不自动启动计时器，等待用户点击开始
    }

    startGame() {
        if (this.gameStarted) return;
        this.gameStarted = true;

        // 隐藏开始弹窗
        document.getElementById('startGame').classList.remove('show');

        // 启动计时器
        this.startTimer();
    }

    createBoard() {
        this.board = [];

        // 获取当前关卡的地图布局
        const levelLayout = this.mapLayouts[this.level - 1];
        const layoutSize = levelLayout.length;

        // 计算时间（60-120秒，随关卡增加）
        this.maxTime = Math.min(120, 60 + this.level * 3);
        this.timeLeft = this.maxTime;

        // 计算可玩区域数量
        let playableCells = 0;
        for (let row = 0; row < layoutSize; row++) {
            for (let col = 0; col < layoutSize; col++) {
                if (levelLayout[row][col] === 1) {
                    playableCells++;
                }
            }
        }

        // 计算方块种类数量（2-12种）
        const typeCount = Math.min(12, 2 + Math.floor(this.level / 2));
        const pairCount = Math.floor(playableCells / 2);

        // 生成配对数组
        let types = [];
        for (let i = 0; i < pairCount; i++) {
            const typeObj = this.cellTypes[i % typeCount];
            types.push(typeObj);
            types.push(typeObj);
        }

        // 打乱
        for (let i = types.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [types[i], types[j]] = [types[j], types[i]];
        }

        // 初始化棋盘（带边界）
        this.displaySize = layoutSize;
        this.boardSizeLevel = layoutSize + this.padding * 2;

        // 初始化二维数组
        this.board = new Array(this.boardSizeLevel);
        for (let row = 0; row < this.boardSizeLevel; row++) {
            this.board[row] = new Array(this.boardSizeLevel).fill(null);
        }

        // 根据布局填充方块
        let index = 0;
        for (let row = 0; row < layoutSize; row++) {
            for (let col = 0; col < layoutSize; col++) {
                if (levelLayout[row][col] === 1 && index < types.length) {
                    this.board[row + this.padding][col + this.padding] = types[index++];
                }
            }
        }

        this.updateScoreBoard();
    }

    render() {
        const boardElement = document.getElementById('board');
        boardElement.innerHTML = '';

        // 更新网格列数 - 使用显示大小
        boardElement.style.gridTemplateColumns = `repeat(${this.displaySize}, 1fr)`;

        // 创建星空背景
        this.createStars(boardElement);

        for (let row = 0; row < this.displaySize; row++) {
            for (let col = 0; col < this.displaySize; col++) {
                const cell = document.createElement('div');
                cell.className = 'cell';

                // 计算实际在board中的位置（加上padding偏移）
                const actualRow = row + this.padding;
                const actualCol = col + this.padding;

                if (this.board[actualRow] && this.board[actualRow][actualCol]) {
                    cell.textContent = this.board[actualRow][actualCol].symbol;
                    cell.dataset.element = this.board[actualRow][actualCol].element;
                    cell.dataset.row = actualRow;
                    cell.dataset.col = actualCol;
                    cell.addEventListener('click', () => this.handleClick(actualRow, actualCol));
                } else {
                    cell.classList.add('empty');
                }

                boardElement.appendChild(cell);
            }
        }
    }

    createStars(boardElement) {
        // 清除旧星星
        const oldStars = boardElement.querySelectorAll('.star');
        oldStars.forEach(star => star.remove());

        // 创建新星星
        const starCount = 120;
        const boardRect = boardElement.getBoundingClientRect();

        for (let i = 0; i < starCount; i++) {
            const star = document.createElement('div');
            star.className = 'star';

            // 随机大小
            const size = Math.random() * 1.8 + 0.4;
            star.style.width = `${size}px`;
            star.style.height = `${size}px`;

            // 随机位置
            const x = Math.random() * 100;
            const y = Math.random() * 100;
            star.style.left = `${x}%`;
            star.style.top = `${y}%`;

            // 部分星星添加十字星光
            if (Math.random() > 0.8) {
                star.classList.add('bright');
            }

            // 随机动画延迟 - 分散
            star.style.animationDelay = `${Math.random() * 8}s`;

            // 随机动画时长 - 慢节奏
            star.style.animationDuration = `${Math.random() * 5 + 4}s`;

            // 随机不透明度
            star.style.opacity = Math.random() * 0.3 + 0.35;

            boardElement.appendChild(star);
        }
    }

    updateScoreBoard() {
        document.getElementById('score').textContent = this.score;
        document.getElementById('currentLevel').textContent = this.level;
        document.getElementById('highScore').textContent = this.highScore;

        // 更新计时器显示
        const minutes = Math.floor(this.timeLeft / 60);
        const seconds = this.timeLeft % 60;
        document.getElementById('timer').textContent =
            `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

        // 时间不足时变红
        if (this.timeLeft <= 10) {
            document.getElementById('timer').style.color = '#ff6b6b';
        } else {
            document.getElementById('timer').style.color = '';
        }

        // 更新进度条
        const progress = (this.level / this.totalLevels) * 100;
        document.getElementById('progressFill').style.width = `${progress}%`;

        let remaining = 0;
        // 只计算可玩区域的剩余方块
        for (let row = this.padding; row < this.padding + this.displaySize; row++) {
            for (let col = this.padding; col < this.padding + this.displaySize; col++) {
                if (this.board[row][col]) {
                    remaining++;
                }
            }
        }
        document.getElementById('remaining').textContent = remaining;
    }

    handleClick(row, col) {
        if (this.isAnimating) return;
        if (this.isPaused) return;

        // 快速连续点击时，检查是否还在动画中
        if (this.clickCooldown) return;

        if (!this.board[row][col]) return;

        const clickedCell = document.querySelector(`[data-row="${row}"][data-col="${col}"]`);

        if (!clickedCell) return;

        // 添加涟漪效果
        this.addRipple(clickedCell);

        if (!this.selectedCell) {
            // 选择第一个方块
            this.selectedCell = { row, col, element: clickedCell };
            clickedCell.classList.add('selected');
        } else {
            const { row: prevRow, col: prevCol, element: prevElement } = this.selectedCell;

            if (row === prevRow && col === prevCol) {
                // 点击同一个方块，取消选择
                prevElement.classList.remove('selected');
                this.selectedCell = null;
            } else {
                // 检查是否可以消除
                if (this.canConnect(prevRow, prevCol, row, col)) {
                    prevElement.classList.remove('selected');
                    this.eliminate(prevRow, prevCol, row, col);
                    this.selectedCell = null;
                } else {
                    // 不能消除，选择新方块
                    prevElement.classList.remove('selected');

                    // 添加抖动动画提示无法连接
                    prevElement.style.animation = 'shake 0.3s ease-out';
                    setTimeout(() => {
                        prevElement.style.animation = '';
                    }, 300);

                    this.selectedCell = { row, col, element: clickedCell };
                    clickedCell.classList.add('selected');
                }
            }
        }
    }

    addRipple(cell) {
        const ripple = document.createElement('div');
        ripple.classList.add('ripple');
        cell.appendChild(ripple);

        setTimeout(() => {
            ripple.remove();
        }, 600);
    }

    canConnect(row1, col1, row2, col2) {
        // 必须是相同的方块
        if (this.board[row1][col1].symbol !== this.board[row2][col2].symbol) {
            return false;
        }
        
        // 必须不是同一个位置
        if (row1 === row2 && col1 === col2) {
            return false;
        }
        
        // 检查是否可以连接（最多2个拐点）
        return this.checkConnection(row1, col1, row2, col2);
    }

    checkConnection(row1, col1, row2, col2) {
        // 检查直线连接
        if (this.checkLine(row1, col1, row2, col2)) {
            return true;
        }
        
        // 检查一个拐点
        if (this.checkOneTurn(row1, col1, row2, col2)) {
            return true;
        }
        
        // 检查两个拐点
        if (this.checkTwoTurns(row1, col1, row2, col2)) {
            return true;
        }
        
        return false;
    }

    checkLine(row1, col1, row2, col2) {
        // 水平直线
        if (row1 === row2) {
            const minCol = Math.min(col1, col2);
            const maxCol = Math.max(col1, col2);
            for (let col = minCol + 1; col < maxCol; col++) {
                if (this.board[row1][col]) return false;
            }
            this.connectionPath = [{r: row1, c: col1}, {r: row2, c: col2}];
            return true;
        }

        // 垂直直线
        if (col1 === col2) {
            const minRow = Math.min(row1, row2);
            const maxRow = Math.max(row1, row2);
            for (let row = minRow + 1; row < maxRow; row++) {
                if (this.board[row][col1]) return false;
            }
            this.connectionPath = [{r: row1, c: col1}, {r: row2, c: col2}];
            return true;
        }

        return false;
    }

    checkOneTurn(row1, col1, row2, col2) {
        // 尝试通过拐点 (row1, col2)
        if (!this.board[row1][col2] || (row1 === row2 && col2 === col1)) {
            if (this.checkLine(row1, col1, row1, col2) && this.checkLine(row1, col2, row2, col2)) {
                this.connectionPath = [{r: row1, c: col1}, {r: row1, c: col2}, {r: row2, c: col2}];
                return true;
            }
        }

        // 尝试通过拐点 (row2, col1)
        if (!this.board[row2][col1] || (row2 === row1 && col1 === col2)) {
            if (this.checkLine(row1, col1, row2, col1) && this.checkLine(row2, col1, row2, col2)) {
                this.connectionPath = [{r: row1, c: col1}, {r: row2, c: col1}, {r: row2, c: col2}];
                return true;
            }
        }

        return false;
    }

    checkTwoTurns(row1, col1, row2, col2) {
        // 水平扫描
        for (let col = 0; col < this.boardSizeLevel; col++) {
            if (col !== col1 && col !== col2) {
                if (!this.board[row1][col] || (row1 === row2 && col === col1)) {
                    if (this.checkLine(row1, col1, row1, col) &&
                        this.checkLine(row1, col, row2, col) &&
                        this.checkLine(row2, col, row2, col2)) {
                        this.connectionPath = [{r: row1, c: col1}, {r: row1, c: col}, {r: row2, c: col}, {r: row2, c: col2}];
                        return true;
                    }
                }
            }
        }

        // 垂直扫描
        for (let row = 0; row < this.boardSizeLevel; row++) {
            if (row !== row1 && row !== row2) {
                if (!this.board[row][col1] || (row === row1 && col1 === col2)) {
                    if (this.checkLine(row1, col1, row, col1) &&
                        this.checkLine(row, col1, row, col2) &&
                        this.checkLine(row, col2, row2, col2)) {
                        this.connectionPath = [{r: row1, c: col1}, {r: row, c: col1}, {r: row, c: col2}, {r: row2, c: col2}];
                        return true;
                    }
                }
            }
        }

        return false;
    }

    async eliminate(row1, col1, row2, col2) {
        this.isAnimating = true;
        this.clickCooldown = true;

        const cell1 = document.querySelector(`[data-row="${row1}"][data-col="${col1}"]`);
        const cell2 = document.querySelector(`[data-row="${row2}"][data-col="${col2}"]`);

        // 绘制连接线
        await this.drawConnectionLine();

        // 创建粒子效果
        this.createParticles(cell1);
        this.createParticles(cell2);

        if (cell1) cell1.classList.add('matched');
        if (cell2) cell2.classList.add('matched');

        // 连击计算
        const now = Date.now();
        if (now - this.lastEliminateTime < 2000) {
            this.comboCount++;
        } else {
            this.comboCount = 1;
        }
        this.lastEliminateTime = now;

        // 计算得分（连击加成，但不显示文字）
        let baseScore = 10;
        if (this.comboCount > 1) {
            baseScore *= this.comboCount;
        }
        this.score += baseScore;

        await this.delay(500);

        // 直接操作DOM而不是重新渲染
        if (cell1) {
            cell1.textContent = '';
            cell1.classList.remove('selected');
            cell1.classList.add('empty');
            delete cell1.dataset.element;
        }
        if (cell2) {
            cell2.textContent = '';
            cell2.classList.remove('selected');
            cell2.classList.add('empty');
            delete cell2.dataset.element;
        }

        // 更新数据
        this.board[row1][col1] = null;
        this.board[row2][col2] = null;

        this.updateScoreBoard();

        // 检查是否过关
        this.checkLevelComplete();

        this.isAnimating = false;
        this.clickCooldown = false;
    }

    createParticles(cell) {
        const rect = cell.getBoundingClientRect();
        const boardRect = document.getElementById('board').getBoundingClientRect();

        const centerX = rect.left - boardRect.left + rect.width / 2;
        const centerY = rect.top - boardRect.top + rect.height / 2;

        for (let i = 0; i < 8; i++) {
            const particle = document.createElement('div');
            particle.className = 'particle';

            const angle = (i / 8) * Math.PI * 2;
            const distance = 30 + Math.random() * 20;
            const tx = Math.cos(angle) * distance;
            const ty = Math.sin(angle) * distance;

            particle.style.cssText = `
                left: ${centerX}px;
                top: ${centerY}px;
                --tx: ${tx}px;
                --ty: ${ty}px;
                animation: particleFly 0.6s ease-out forwards;
            `;

            document.getElementById('board').appendChild(particle);

            setTimeout(() => particle.remove(), 600);
        }
    }

    checkLevelComplete() {
        let remaining = 0;
        // 只计算可玩区域
        for (let row = this.padding; row < this.padding + this.displaySize; row++) {
            for (let col = this.padding; col < this.padding + this.displaySize; col++) {
                if (this.board[row][col]) {
                    remaining++;
                }
            }
        }

        if (remaining === 0) {
            // 更新最高分
            if (this.score > this.highScore) {
                this.highScore = this.score;
                localStorage.setItem('linkGameHighScore', this.highScore);
            }

            const theme = this.levelThemes[this.level - 1];
            const levelComplete = document.getElementById('levelComplete');

            // 如果之前是游戏结束状态，恢复标题
            if (this.isGameOver) {
                levelComplete.querySelector('h2').textContent = '🎉 关卡完成！';
                this.isGameOver = false;
            }

            document.getElementById('levelMessage').textContent =
                `恭喜您完成了【${theme.name}】！得分：${this.score}`;

            // 恢复按钮为下一关
            const nextButton = levelComplete.querySelector('button');
            nextButton.textContent = '下一关';
            nextButton.onclick = () => {
                this.nextLevel();
            };

            levelComplete.classList.add('show');
        }
    }

    hint() {
        if (this.isAnimating) return;

        // 查找可以消除的一对（只在可玩区域搜索）
        for (let row1 = this.padding; row1 < this.padding + this.displaySize; row1++) {
            for (let col1 = this.padding; col1 < this.padding + this.displaySize; col1++) {
                if (!this.board[row1][col1]) continue;

                for (let row2 = this.padding; row2 < this.padding + this.displaySize; row2++) {
                    for (let col2 = this.padding; col2 < this.padding + this.displaySize; col2++) {
                        if (!this.board[row2][col2]) continue;
                        if (row1 === row2 && col1 === col2) continue;
                        if (this.board[row1][col1].symbol !== this.board[row2][col2].symbol) continue;

                        if (this.canConnect(row1, col1, row2, col2)) {
                            // 高亮提示
                            const cell1 = document.querySelector(`[data-row="${row1}"][data-col="${col1}"]`);
                            const cell2 = document.querySelector(`[data-row="${row2}"][data-col="${col2}"]`);

                            if (cell1) cell1.classList.add('selected');
                            if (cell2) cell2.classList.add('selected');

                            this.showMessage('提示：找到可以消除的方块！', 'success');

                            setTimeout(() => {
                                if (cell1) cell1.classList.remove('selected');
                                if (cell2) cell2.classList.remove('selected');
                            }, 2000);

                            return;
                        }
                    }
                }
            }
        }

        this.showMessage('没有可消除的方块了！', 'error');
    }

    restart() {
        this.score = 0;
        this.level = 1;
        this.selectedCell = null;
        this.comboCount = 0;
        this.lastEliminateTime = 0;
        this.isPaused = false;
        this.gameStarted = false;
        this.isGameOver = false;

        if (this.timerInterval) {
            clearInterval(this.timerInterval);
        }

        document.getElementById('levelComplete').classList.remove('show');
        this.createBoard();
        this.render();

        // 显示开始游戏弹窗
        document.getElementById('startGame').classList.add('show');
    }

    nextLevel() {
        this.level++;
        this.comboCount = 0;
        this.lastEliminateTime = 0;
        document.getElementById('levelComplete').classList.remove('show');
        this.createBoard();
        this.render();
        this.startTimer();
        this.showMessage(`进入第 ${this.level} 关！`, 'success');
    }

    showMessage(text, type) {
        const messageElement = document.getElementById('message');
        messageElement.textContent = text;
        messageElement.className = `message show ${type}`;
        
        setTimeout(() => {
            messageElement.classList.remove('show');
        }, 2000);
    }

    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    drawConnectionLine() {
        const boardElement = document.getElementById('board');
        const boardRect = boardElement.getBoundingClientRect();
        const cellSize = boardElement.offsetWidth / this.displaySize;

        this.connectionPath.forEach((point, index) => {
            if (index === 0) return;

            const prevPoint = this.connectionPath[index - 1];
            const line = document.createElement('div');
            line.className = 'connection-line line';

            // 计算显示位置（减去padding）
            const displayR1 = prevPoint.r - this.padding;
            const displayC1 = prevPoint.c - this.padding;
            const displayR2 = point.r - this.padding;
            const displayC2 = point.c - this.padding;

            const x1 = displayC1 * cellSize + cellSize / 2;
            const y1 = displayR1 * cellSize + cellSize / 2;
            const x2 = displayC2 * cellSize + cellSize / 2;
            const y2 = displayR2 * cellSize + cellSize / 2;

            const length = Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
            const angle = Math.atan2(y2 - y1, x2 - x1) * 180 / Math.PI;

            line.style.cssText = `
                left: ${x1}px;
                top: ${y1}px;
                width: ${length}px;
                height: 3px;
                transform-origin: 0 50%;
                transform: rotate(${angle}deg);
                animation: fadeInOut 0.3s ease-in-out forwards;
            `;

            boardElement.appendChild(line);
            setTimeout(() => line.remove(), 300);
        });
    }

    showScoreFloat(cell, text) {
        const boardElement = document.getElementById('board');
        const boardRect = boardElement.getBoundingClientRect();
        const cellRect = cell.getBoundingClientRect();

        const floatText = document.createElement('div');
        floatText.className = 'score-float';
        floatText.textContent = text;

        const x = cellRect.left - boardRect.left + cellRect.width / 2;
        const y = cellRect.top - boardRect.top;

        floatText.style.cssText = `
            left: ${x}px;
            top: ${y}px;
        `;

        boardElement.appendChild(floatText);
        setTimeout(() => floatText.remove(), 1000);
    }

    showCombo(count) {
        if (count < 2) return;

        const boardElement = document.getElementById('board');
        const comboText = document.createElement('div');
        comboText.className = 'combo-popup';
        comboText.textContent = `${count}连击！`;

        const messages = ['', '', '不错！', '漂亮！', '厉害！', '太神了！', '无敌！', '超神！', '恐怖如斯！', '传奇！'];
        comboText.textContent = messages[Math.min(count, messages.length - 1)] || `${count}连击！`;

        comboText.style.cssText = `
            left: 50%;
            top: 50%;
            transform: translate(-50%, -50%);
        `;

        boardElement.appendChild(comboText);
        setTimeout(() => comboText.remove(), 800);
    }

    shuffle() {
        if (this.isAnimating || this.isPaused) return;

        // 收集所有剩余方块（只从可玩区域）
        let remainingCells = [];
        for (let row = this.padding; row < this.padding + this.displaySize; row++) {
            for (let col = this.padding; col < this.padding + this.displaySize; col++) {
                if (this.board[row][col]) {
                    remainingCells.push(this.board[row][col]);
                    this.board[row][col] = null;
                }
            }
        }

        // 打乱
        for (let i = remainingCells.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [remainingCells[i], remainingCells[j]] = [remainingCells[j], remainingCells[i]];
        }

        // 重新填充（只填充可玩区域）
        let index = 0;
        for (let row = this.padding; row < this.padding + this.displaySize; row++) {
            for (let col = this.padding; col < this.padding + this.displaySize; col++) {
                if (index < remainingCells.length) {
                    this.board[row][col] = remainingCells[index++];
                }
            }
        }

        this.selectedCell = null;
        this.render();
        this.updateScoreBoard();
        this.showMessage('洗牌完成！', 'success');
    }

    togglePause() {
        if (this.isAnimating) return;

        this.isPaused = !this.isPaused;

        if (this.isPaused) {
            // 显示暂停遮罩
            const board = document.getElementById('board');
            const existingOverlay = document.querySelector('.pause-overlay');
            if (!existingOverlay) {
                const overlay = document.createElement('div');
                overlay.className = 'pause-overlay';
                overlay.innerHTML = '<div class="pause-text">⏸️ 游戏暂停</div>';
                overlay.style.cssText = `
                    position: absolute;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    background: rgba(0, 0, 0, 0.7);
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    z-index: 100;
                    border-radius: 10px;
                `;
                board.appendChild(overlay);
            }
            this.showMessage('游戏已暂停', 'success');
        } else {
            const overlay = document.querySelector('.pause-overlay');
            if (overlay) overlay.remove();
            this.showMessage('游戏继续', 'success');
        }
    }

    render() {
        const boardElement = document.getElementById('board');
        boardElement.innerHTML = '';

        // 更新网格列数（只渲染中间可玩区域）
        boardElement.style.gridTemplateColumns = `repeat(${this.displaySize}, 1fr)`;

        // 创建星空背景
        this.createStars(boardElement);

        // 只渲染中间可玩区域（不含边界）
        for (let row = 0; row < this.displaySize; row++) {
            for (let col = 0; col < this.displaySize; col++) {
                const actualRow = row + this.padding;
                const actualCol = col + this.padding;

                const cell = document.createElement('div');
                cell.className = 'cell';

                if (this.board[actualRow][actualCol]) {
                    cell.textContent = this.board[actualRow][actualCol].symbol;
                    cell.dataset.element = this.board[actualRow][actualCol].element;
                    cell.dataset.row = actualRow;
                    cell.dataset.col = actualCol;
                    cell.addEventListener('click', (e) => {
                        e.preventDefault();
                        this.handleClick(actualRow, actualCol);
                    });
                } else {
                    cell.classList.add('empty');
                }

                boardElement.appendChild(cell);
            }
        }
    }

    startTimer() {
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
        }

        this.updateScoreBoard();

        this.timerInterval = setInterval(() => {
            if (!this.isPaused && !this.isAnimating) {
                this.timeLeft--;
                this.updateScoreBoard();

                if (this.timeLeft <= 0) {
                    clearInterval(this.timerInterval);
                    this.gameOver();
                }
            }
        }, 1000);
    }

    gameOver() {
        // 更新最高分
        if (this.score > this.highScore) {
            this.highScore = this.score;
            localStorage.setItem('linkGameHighScore', this.highScore);
        }

        const theme = this.levelThemes[this.level - 1];
        const levelComplete = document.getElementById('levelComplete');
        levelComplete.querySelector('h2').textContent = '⏰ 时间到！';
        document.getElementById('levelMessage').textContent =
            `你在【${theme.name}】关卡得分：${this.score}`;

        // 修改按钮文字为重新开始（当前关卡）
        const nextButton = levelComplete.querySelector('button');
        nextButton.textContent = '🔄 重新开始';
        nextButton.onclick = () => {
            this.restartCurrentLevel();
        };

        levelComplete.classList.add('show');

        // 标记为游戏结束状态，以便下次通关时恢复
        this.isGameOver = true;
    }

    restartCurrentLevel() {
        this.score = 0; // 重置分数，但不重置关卡
        this.selectedCell = null;
        this.comboCount = 0;
        this.lastEliminateTime = 0;
        this.isPaused = false;
        this.isGameOver = false;
        this.gameStarted = false;

        if (this.timerInterval) {
            clearInterval(this.timerInterval);
        }

        document.getElementById('levelComplete').classList.remove('show');

        // 重新开始当前关卡
        this.createBoard();
        this.render();

        // 显示开始游戏弹窗
        document.getElementById('startGame').classList.add('show');
    }

    getMapLayouts() {
        return [
            // 1. 白羊座 - 简单矩形 (6x6)
            [
                [1,1,1,1,1,1],
                [1,1,1,1,1,1],
                [1,1,1,1,1,1],
                [1,1,1,1,1,1],
                [1,1,1,1,1,1],
                [1,1,1,1,1,1]
            ],
            // 2. 金牛座 - 环形地图 (8x8)
            [
                [1,1,1,1,1,1,1,1],
                [1,1,1,1,1,1,1,1],
                [1,1,0,0,0,0,1,1],
                [1,1,0,0,0,0,1,1],
                [1,1,0,0,0,0,1,1],
                [1,1,0,0,0,0,1,1],
                [1,1,1,1,1,1,1,1],
                [1,1,1,1,1,1,1,1]
            ],
            // 3. 双子座 - 十字形 (8x8)
            [
                [0,0,1,1,1,0,0,0],
                [0,0,1,1,1,0,0,0],
                [1,1,1,1,1,1,1,1],
                [1,1,1,1,1,1,1,1],
                [1,1,1,1,1,1,1,1],
                [1,1,1,1,1,1,1,1],
                [0,0,1,1,1,0,0,0],
                [0,0,1,1,1,0,0,0]
            ],
            // 4. 巨蟹座 - L形 (8x8)
            [
                [1,1,1,1,1,1,1,1],
                [1,1,1,1,1,1,1,1],
                [1,1,1,1,1,1,1,1],
                [1,1,1,1,1,1,1,1],
                [0,0,0,0,0,0,1,1],
                [0,0,0,0,0,0,1,1],
                [0,0,0,0,0,0,1,1],
                [0,0,0,0,0,0,1,1]
            ],
            // 5. 狮子座 - T形 (8x8)
            [
                [1,1,1,1,1,1,1,1],
                [1,1,1,1,1,1,1,1],
                [0,0,1,1,1,0,0,0],
                [0,0,1,1,1,0,0,0],
                [0,0,1,1,1,0,0,0],
                [0,0,1,1,1,0,0,0],
                [0,0,0,0,0,0,0,0],
                [0,0,0,0,0,0,0,0]
            ],
            // 6. 处女座 - U形 (8x8)
            [
                [1,1,1,1,1,1,1,1],
                [1,1,1,1,1,1,1,1],
                [1,0,0,0,0,0,0,1],
                [1,0,0,0,0,0,0,1],
                [1,0,0,0,0,0,0,1],
                [1,0,0,0,0,0,0,1],
                [1,1,1,1,1,1,1,1],
                [1,1,1,1,1,1,1,1]
            ],
            // 7. 天秤座 - 双环地图 (8x8)
            [
                [1,1,1,1,1,1,1,1],
                [1,0,0,0,0,0,0,1],
                [1,0,1,1,1,1,0,1],
                [1,0,1,0,0,1,0,1],
                [1,0,1,0,0,1,0,1],
                [1,0,1,1,1,1,0,1],
                [1,0,0,0,0,0,0,1],
                [1,1,1,1,1,1,1,1]
            ],
            // 8. 天蝎座 - 回字形 (10x10)
            [
                [1,1,1,1,1,1,1,1,1,1],
                [1,0,0,0,0,0,0,0,0,1],
                [1,0,1,1,1,1,1,1,0,1],
                [1,0,1,0,0,0,0,1,0,1],
                [1,0,1,0,1,1,0,1,0,1],
                [1,0,1,0,1,1,0,1,0,1],
                [1,0,1,0,0,0,0,1,0,1],
                [1,0,1,1,1,1,1,1,0,1],
                [1,0,0,0,0,0,0,0,0,1],
                [1,1,1,1,1,1,1,1,1,1]
            ],
            // 9. 射手座 - 锯齿形 (8x8)
            [
                [1,1,1,1,0,1,1,1],
                [0,1,1,1,1,0,1,1],
                [1,0,1,1,1,1,0,1],
                [1,1,0,1,1,1,1,0],
                [0,1,1,0,1,1,1,1],
                [1,1,1,1,0,1,1,1],
                [1,1,1,0,1,1,1,0],
                [1,0,1,1,1,0,1,1]
            ],
            // 10. 摩羯座 - 岛屿形 (10x10)
            [
                [1,1,1,0,0,0,0,1,1,1],
                [1,1,1,0,0,0,0,1,1,1],
                [1,1,1,0,0,0,0,0,0,0],
                [0,0,0,0,0,0,0,0,0,0],
                [0,0,0,1,1,1,0,0,0,0],
                [0,0,0,1,1,1,0,0,0,0],
                [0,0,0,0,0,0,0,0,0,0],
                [0,0,0,0,0,0,0,1,1,1],
                [1,1,1,0,0,0,0,1,1,1],
                [1,1,1,0,0,0,0,1,1,1]
            ],
            // 11. 水瓶座 - Z字形 (8x8)
            [
                [1,1,1,1,0,0,0,0],
                [0,0,1,1,1,1,1,0],
                [0,0,0,0,0,0,1,1],
                [0,1,1,1,1,1,1,0],
                [0,1,1,1,1,1,1,0],
                [1,1,0,0,0,0,0,0],
                [1,1,1,1,1,1,0,0],
                [0,0,0,0,1,1,1,1]
            ],
            // 12. 双鱼座 - 螺旋形 (8x8)
            [
                [0,0,0,0,0,0,0,0],
                [0,1,1,1,1,1,1,0],
                [0,0,0,0,0,1,1,0],
                [0,1,1,1,0,0,1,0],
                [0,1,0,0,0,1,1,0],
                [0,1,1,0,0,0,0,0],
                [0,1,1,1,1,1,1,0],
                [0,0,0,0,0,0,0,0]
            ],
            // 13. 木星 - 巨型十字 (10x10)
            [
                [0,0,0,1,1,1,0,0,0,0],
                [0,0,0,1,1,1,0,0,0,0],
                [0,0,0,1,1,1,0,0,0,0],
                [1,1,1,1,1,1,1,1,1,1],
                [1,1,1,1,1,1,1,1,1,1],
                [1,1,1,1,1,1,1,1,1,1],
                [0,0,0,1,1,1,0,0,0,0],
                [0,0,0,1,1,1,0,0,0,0],
                [0,0,0,1,1,1,0,0,0,0],
                [0,0,0,0,0,0,0,0,0,0]
            ],
            // 14. 金星 - 梅花形 (9x9)
            [
                [0,0,0,0,1,0,0,0,0],
                [0,0,0,1,1,1,0,0,0],
                [0,0,1,1,0,1,1,0,0],
                [0,1,1,0,0,0,1,1,0],
                [1,1,0,0,0,0,0,1,1],
                [0,1,1,0,0,0,1,1,0],
                [0,0,1,1,0,1,1,0,0],
                [0,0,0,1,1,1,0,0,0],
                [0,0,0,0,1,0,0,0,0]
            ],
            // 15. 土星 - 同心圆 (10x10)
            [
                [1,1,1,1,1,1,1,1,1,1],
                [1,1,1,1,1,1,1,1,1,1],
                [1,1,0,0,0,0,0,0,1,1],
                [1,1,0,0,0,0,0,0,1,1],
                [1,1,0,0,0,0,0,0,1,1],
                [1,1,0,0,0,0,0,0,1,1],
                [1,1,0,0,0,0,0,0,1,1],
                [1,1,0,0,0,0,0,0,1,1],
                [1,1,1,1,1,1,1,1,1,1],
                [1,1,1,1,1,1,1,1,1,1]
            ],
            // 16. 火星 - 迷宫形 (10x10)
            [
                [1,1,1,1,1,1,1,1,1,1],
                [1,0,0,0,0,0,0,0,0,1],
                [1,0,1,1,1,1,0,1,0,1],
                [1,0,1,0,0,0,0,1,0,1],
                [1,0,1,0,1,1,0,1,0,1],
                [1,0,1,0,1,1,0,1,0,1],
                [1,0,1,0,0,0,0,1,0,1],
                [1,0,1,1,1,1,0,1,0,1],
                [1,0,0,0,0,0,0,0,0,1],
                [1,1,1,1,1,1,1,1,1,1]
            ],
            // 17. 月球 - 新月形 (9x9)
            [
                [0,0,0,0,0,0,0,0,0],
                [0,0,0,0,1,1,1,0,0],
                [0,0,1,1,1,1,1,0,0],
                [0,1,1,1,1,1,1,0,0],
                [1,1,1,1,1,1,1,1,0],
                [1,1,1,1,1,1,1,1,0],
                [0,1,1,1,1,1,1,0,0],
                [0,0,1,1,1,0,0,0,0],
                [0,0,0,1,0,0,0,0,0]
            ],
            // 18. 太阳 - 日冕形 (10x10)
            [
                [0,0,1,1,1,1,1,1,0,0],
                [0,1,1,0,0,0,0,1,1,0],
                [1,1,0,0,0,0,0,0,1,1],
                [1,1,1,1,1,1,1,1,1,1],
                [1,1,1,1,1,1,1,1,1,1],
                [1,1,1,1,1,1,1,1,1,1],
                [1,1,0,0,0,0,0,0,1,1],
                [0,1,1,0,0,0,0,1,1,0],
                [0,0,1,1,1,1,1,1,0,0],
                [0,0,0,0,0,0,0,0,0,0]
            ]
        ];
    }
}

// 初始化游戏
const game = new LinkGame();
