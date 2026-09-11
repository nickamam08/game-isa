/**
 * game.js - Motor de juego mejorado para "El Gran Salto de la Pulguita"
 * Físicas suaves y cadenciosas, 5 niveles con dificultad progresiva, obstáculos dinámicos,
 * sistema de 3 vidas/corazones y trivias de vida entre niveles.
 */

class IsaJumpGame {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        
        // Dimensiones lógicas internas
        this.logicalWidth = 400;
        this.logicalHeight = 650;
        this.scale = 1;
        this.dpr = window.devicePixelRatio || 1;

        // Estado del juego
        this.state = 'START'; // START, PLAYING, QUIZ, LEVEL_TRANSITION, VICTORY, GAMEOVER
        this.currentLevel = 1;
        this.maxLevels = 5;
        this.score = 0;
        this.lives = 3;
        this.maxLives = 3;
        this.maxAltitude = 0;
        this.levelBaseAltitude = 0;
        this.cameraY = 0;
        
        // Jugador (Isa) con físicas suaves y flotantes
        this.player = {
            x: 200,
            y: 500,
            vx: 0,
            vy: 0,
            width: 38,
            height: 38,
            jumpForce: -10.2, // Salto más suave y controlado
            gravity: 0.25,    // Gravedad suave para parábolas elegantes
            maxVx: 5.6,
            facingRight: true,
            squash: 1,
            stretch: 1,
            wingFlap: 0,
            blinkTimer: 0,
            shield: false,
            shieldTimer: 0,
            rocket: false,
            rocketTimer: 0,
            invulnerableTimer: 0
        };

        // Entidades y obstáculos
        this.platforms = [];
        this.items = [];
        this.obstacles = []; // Nubes de tormenta, rayos, meteoros
        this.windZones = []; // Corrientes de aire lateral
        this.highestPlatformY = 600;

        // Controles táctiles y teclado
        this.input = {
            left: false,
            right: false,
            dragActive: false,
            touchTargetX: null
        };

        // Callbacks de interfaz
        this.onScoreUpdate = null;
        this.onLivesUpdate = null;
        this.onAltitudeUpdate = null;
        this.onLevelUpdate = null;
        this.onToastMessage = null;
        this.onLevelComplete = null;
        this.onVictoryReached = null;
        this.onGameOver = null;

        this.lastFrameTime = performance.now();
        this.resize();
        this.bindEvents();
    }

    // Ajuste de resolución para pantallas móviles
    resize() {
        const container = document.getElementById('gameContainer');
        const displayWidth = container.clientWidth;
        const displayHeight = container.clientHeight;

        this.canvas.width = displayWidth * this.dpr;
        this.canvas.height = displayHeight * this.dpr;

        this.scale = displayWidth / this.logicalWidth;
        this.logicalHeight = displayHeight / this.scale;

        this.ctx.resetTransform();
        this.ctx.scale(this.dpr * this.scale, this.dpr * this.scale);
    }

    bindEvents() {
        window.addEventListener('resize', () => this.resize());

        // Teclado
        window.addEventListener('keydown', (e) => {
            if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') this.input.left = true;
            if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') this.input.right = true;
        });

        window.addEventListener('keyup', (e) => {
            if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') this.input.left = false;
            if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') this.input.right = false;
        });

        // Controles táctiles mobile
        const canvas = this.canvas;
        const handleTouch = (clientX) => {
            const rect = canvas.getBoundingClientRect();
            const touchLogicalX = (clientX - rect.left) / this.scale;
            this.input.touchTargetX = touchLogicalX;
            this.input.dragActive = true;

            if (touchLogicalX < this.player.x - 10) {
                this.input.left = true;
                this.input.right = false;
            } else if (touchLogicalX > this.player.x + 10) {
                this.input.right = true;
                this.input.left = false;
            } else {
                this.input.left = false;
                this.input.right = false;
            }
        };

        canvas.addEventListener('touchstart', (e) => {
            e.preventDefault();
            if (e.touches.length > 0) handleTouch(e.touches[0].clientX);
        }, { passive: false });

        canvas.addEventListener('touchmove', (e) => {
            e.preventDefault();
            if (e.touches.length > 0) handleTouch(e.touches[0].clientX);
        }, { passive: false });

        canvas.addEventListener('touchend', () => {
            this.input.left = false;
            this.input.right = false;
            this.input.dragActive = false;
            this.input.touchTargetX = null;
        });

        canvas.addEventListener('mousedown', (e) => handleTouch(e.clientX));
        window.addEventListener('mousemove', (e) => {
            if (this.input.dragActive) handleTouch(e.clientX);
        });
        window.addEventListener('mouseup', () => {
            this.input.left = false;
            this.input.right = false;
            this.input.dragActive = false;
            this.input.touchTargetX = null;
        });
    }

    // Iniciar el juego desde el Nivel 1 o un nivel específico
    start(level = 1, resetScore = true) {
        this.currentLevel = level;
        const levelConfig = getLevelData(this.currentLevel);

        if (resetScore) this.score = 0;
        this.lives = 3;
        this.state = 'PLAYING';

        // Altura base según el nivel
        const prevLevel = this.currentLevel > 1 ? getLevelData(this.currentLevel - 1) : null;
        this.levelBaseAltitude = prevLevel ? prevLevel.targetAltitude : 0;
        this.maxAltitude = this.levelBaseAltitude;

        // Posicionar jugador y cámara
        const startY = -this.levelBaseAltitude + (this.logicalHeight - 120);
        this.player.x = this.logicalWidth / 2;
        this.player.y = startY;
        this.player.vx = 0;
        this.player.vy = this.player.jumpForce;
        this.player.shield = false;
        this.player.rocket = false;
        this.player.invulnerableTimer = 1.0;

        this.cameraY = this.player.y - this.logicalHeight * 0.55;

        // Generar plataformas iniciales del nivel
        this.platforms = [];
        this.items = [];
        this.obstacles = [];
        this.windZones = [];
        this.highestPlatformY = startY + 40;

        // Plataforma base segura
        this.platforms.push({
            x: this.logicalWidth / 2 - 55,
            y: startY + 20,
            width: 110,
            height: 18,
            type: 'cloud',
            vx: 0
        });

        // Generar primer tramo del nivel
        this.generateWorldChunk(this.cameraY - this.logicalHeight * 2);

        if (window.sound) {
            window.sound.init();
            window.sound.startBGM();
        }

        this.updateHUD();
        this.triggerToast(`🌟 ${levelConfig.title}`, 'potential');
    }

    // Generador procedural de plataformas y obstáculos según la dificultad del nivel
    generateWorldChunk(targetY) {
        const levelConfig = getLevelData(this.currentLevel);
        const diff = levelConfig.difficulty;
        let currentY = this.highestPlatformY;

        while (currentY > targetY) {
            const gapY = Math.random() * (diff.gapMax - diff.gapMin) + diff.gapMin;
            currentY -= gapY;

            const altitude = Math.max(0, Math.floor(-currentY));

            // Si llegamos a la meta del nivel, no generar más allá
            if (altitude > levelConfig.targetAltitude + 300) break;

            // Selección de plataforma
            let type = 'cloud';
            const roll = Math.random();

            if (this.currentLevel >= 4 && roll < 0.28) {
                type = 'galaxy_pad';
            } else if (roll < 0.18) {
                type = 'flower_spring';
            } else if (roll < 0.38) {
                type = 'moving';
            } else if (roll < 0.48) {
                type = 'book';
            } else if (roll < 0.62 && this.currentLevel >= 2) {
                type = 'fragile';
            }

            const pWidth = Math.random() * (diff.platformWidthMax - diff.platformWidthMin) + diff.platformWidthMin;
            const pX = Math.random() * (this.logicalWidth - pWidth - 20) + 10;

            const platform = {
                x: pX,
                y: currentY,
                width: pWidth,
                height: 16,
                type: type,
                vx: type === 'moving' ? (Math.random() > 0.5 ? diff.movingSpeed : -diff.movingSpeed) : 0,
                minX: 10,
                maxX: this.logicalWidth - pWidth - 10,
                isBroken: false
            };
            this.platforms.push(platform);

            // Generar Obstáculos (Nubes de tormenta con rayos)
            if (diff.hasStorms && Math.random() < 0.22 && type === 'cloud') {
                this.obstacles.push({
                    type: 'storm_cloud',
                    x: Math.random() * (this.logicalWidth - 60) + 10,
                    y: currentY - gapY * 0.5,
                    width: 50,
                    height: 24,
                    zapTimer: 0,
                    zapActive: false
                });
            }

            // Generar Corrientes de Viento
            if (diff.hasWinds && Math.random() < 0.15) {
                this.windZones.push({
                    x: 0,
                    y: currentY - gapY * 0.4,
                    width: this.logicalWidth,
                    height: 60,
                    direction: Math.random() > 0.5 ? 1 : -1,
                    strength: 0.8 + Math.random() * 0.6
                });
            }

            // Generar Coleccionables
            if (type !== 'fragile' && Math.random() < 0.45) {
                let itemType = 'beauty';
                const itemRoll = Math.random();

                if (itemRoll < 0.45) {
                    itemType = 'beauty';
                } else if (itemRoll < 0.75) {
                    itemType = 'intelligence';
                } else if (itemRoll < 0.90) {
                    itemType = 'potential';
                } else if (itemRoll >= 0.90 && this.currentLevel >= 2) {
                    itemType = 'rocket';
                }

                this.items.push({
                    x: platform.x + platform.width / 2,
                    y: platform.y - 24,
                    type: itemType,
                    collected: false,
                    bobPhase: Math.random() * Math.PI * 2,
                    platformRef: platform
                });
            }
        }

        this.highestPlatformY = currentY;
    }

    // Actualización de física y lógica por frame
    update(dt) {
        if (this.state !== 'PLAYING') return;

        const levelConfig = getLevelData(this.currentLevel);

        // 1. Invulnerabilidad temporal
        if (this.player.invulnerableTimer > 0) {
            this.player.invulnerableTimer -= dt;
        }

        // 2. Manejo de potenciadores (Cohete y Escudo)
        if (this.player.rocket) {
            this.player.rocketTimer -= dt;
            this.player.vy = -14;
            if (window.particles) {
                window.particles.emitRocketThrust(this.player.x, this.player.y);
            }
            if (this.player.rocketTimer <= 0) {
                this.player.rocket = false;
                this.player.vy = this.player.jumpForce * 0.9;
            }
        } else {
            this.player.vy += this.player.gravity;
        }

        if (this.player.shield) {
            this.player.shieldTimer -= dt;
            if (this.player.shieldTimer <= 0) this.player.shield = false;
        }

        // 3. Movimiento horizontal y control en el aire
        const moveAccel = 0.72;
        if (this.input.left) {
            this.player.vx -= moveAccel;
            this.player.facingRight = false;
        } else if (this.input.right) {
            this.player.vx += moveAccel;
            this.player.facingRight = true;
        } else {
            this.player.vx *= 0.86; // Fricción suave y natural
        }

        // 4. Efecto de zonas de viento
        this.windZones.forEach(w => {
            if (this.player.y >= w.y && this.player.y <= w.y + w.height) {
                this.player.vx += w.direction * w.strength * 0.12;
            }
        });

        // Limitar velocidad horizontal
        this.player.vx = Math.max(-this.player.maxVx, Math.min(this.player.maxVx, this.player.vx));
        this.player.x += this.player.vx;

        // Wrap-around en los bordes de la pantalla
        if (this.player.x < -this.player.width / 2) {
            this.player.x = this.logicalWidth + this.player.width / 2;
        } else if (this.player.x > this.logicalWidth + this.player.width / 2) {
            this.player.x = -this.player.width / 2;
        }

        // 5. Movimiento vertical
        this.player.y += this.player.vy;

        // Partículas al saltar
        if (this.player.vy < -1.5 && window.particles) {
            window.particles.emitTrail(this.player.x, this.player.y + 14, this.player.rocket ? '#ffd166' : '#ff9ebb');
        }

        // Animación de aleteo y parpadeo
        this.player.wingFlap += 0.2;
        this.player.blinkTimer += dt;
        if (this.player.blinkTimer > 3.8) {
            if (this.player.blinkTimer > 4.0) this.player.blinkTimer = 0;
        }

        // Squash & stretch dinámico
        if (this.player.vy < 0) {
            this.player.stretch = Math.min(1.22, 1 + Math.abs(this.player.vy) * 0.02);
            this.player.squash = 1 / this.player.stretch;
        } else {
            this.player.stretch = 1;
            this.player.squash = 1;
        }

        // 6. Actualizar plataformas móviles
        this.platforms.forEach(p => {
            if (p.type === 'moving') {
                p.x += p.vx;
                if (p.x < p.minX) {
                    p.x = p.minX;
                    p.vx = Math.abs(p.vx);
                } else if (p.x > p.maxX) {
                    p.x = p.maxX;
                    p.vx = -Math.abs(p.vx);
                }
            }
        });

        // 7. Actualizar obstáculos (Nubes de tormenta con rayos cíclicos)
        this.obstacles.forEach(obs => {
            if (obs.type === 'storm_cloud') {
                obs.zapTimer += dt;
                // Rayo activo cada 2.5 segundos durante 0.8 segundos
                obs.zapActive = (obs.zapTimer % 2.5) > 1.7;
                if (obs.zapActive && (obs.zapTimer % 2.5) < 1.75 && window.sound) {
                    window.sound.playThunder();
                }
            }
        });

        // 8. Colisión con Plataformas (cuando cae)
        if (this.player.vy > 0 && !this.player.rocket) {
            const playerFeetY = this.player.y + this.player.height / 2;
            const prevPlayerFeetY = playerFeetY - this.player.vy;

            for (let i = 0; i < this.platforms.length; i++) {
                const p = this.platforms[i];
                if (p.isBroken) continue;

                if (
                    this.player.x + 10 > p.x &&
                    this.player.x - 10 < p.x + p.width &&
                    prevPlayerFeetY <= p.y + 6 &&
                    playerFeetY >= p.y - 5
                ) {
                    this.player.y = p.y - this.player.height / 2;

                    if (p.type === 'flower_spring') {
                        this.player.vy = this.player.jumpForce * 1.55;
                        if (window.sound) window.sound.playSpring();
                        if (window.particles) window.particles.emitCollectSparkles(this.player.x, this.player.y, 'beauty');
                    } else {
                        this.player.vy = this.player.jumpForce;
                        if (window.sound) window.sound.playJump();
                        if (window.particles) window.particles.emitJumpPuff(this.player.x, p.y, '#ffffff');
                    }

                    if (p.type === 'fragile') {
                        p.isBroken = true;
                        if (window.particles) window.particles.emitJumpPuff(p.x + p.width / 2, p.y, '#d8b4e2');
                    }

                    if (p.type === 'book') {
                        this.score += 50;
                        this.updateHUD();
                    }

                    break;
                }
            }
        }

        // 9. Colisión con Obstáculos (Tormentas y Rayos)
        if (this.player.invulnerableTimer <= 0 && !this.player.rocket) {
            for (let obs of this.obstacles) {
                if (obs.type === 'storm_cloud' && obs.zapActive) {
                    const dx = this.player.x - (obs.x + obs.width / 2);
                    const dy = this.player.y - (obs.y + 15);
                    if (Math.hypot(dx, dy) < 28) {
                        this.takeDamage("⚡ ¡Cuidado con la tormenta! Mantén el enfoque, pulga.");
                        break;
                    }
                }
            }
        }

        // 10. Colisión con Coleccionables
        this.items.forEach(item => {
            if (item.collected) return;

            if (item.platformRef && item.platformRef.type === 'moving') {
                item.x = item.platformRef.x + item.platformRef.width / 2;
            }

            const dx = this.player.x - item.x;
            const dy = this.player.y - item.y;

            if (Math.hypot(dx, dy) < 32) {
                item.collected = true;

                if (item.type === 'beauty') {
                    this.score += 100;
                    if (window.sound) window.sound.playBeautyCollect();
                    if (window.particles) window.particles.emitCollectSparkles(item.x, item.y, 'beauty');
                    this.triggerToast(getRandomQuote('beauty'), 'beauty');
                } else if (item.type === 'intelligence') {
                    this.score += 150;
                    this.player.shield = true;
                    this.player.shieldTimer = 7.0;
                    if (window.sound) window.sound.playIntelCollect();
                    if (window.particles) window.particles.emitCollectSparkles(item.x, item.y, 'intelligence');
                    this.triggerToast(getRandomQuote('intelligence'), 'intelligence');
                } else if (item.type === 'potential') {
                    this.score += 250;
                    this.player.vy = this.player.jumpForce * 1.35;
                    if (window.sound) window.sound.playSpring();
                    if (window.particles) window.particles.emitCollectSparkles(item.x, item.y, 'potential');
                    this.triggerToast(getRandomQuote('potential'), 'potential');
                } else if (item.type === 'rocket') {
                    this.score += 500;
                    this.player.rocket = true;
                    this.player.rocketTimer = 2.6;
                    if (window.sound) window.sound.playRocket();
                    this.triggerToast("🚀 ¡SÚPER COHETE! ¡Nada te frena!", 'potential');
                }

                this.updateHUD();
            }
        });

        // 11. Cámara y Altitud
        const targetScreenY = this.logicalHeight * 0.50;
        if (this.player.y < this.cameraY + targetScreenY) {
            this.cameraY = this.player.y - targetScreenY;
        }

        const currentAltitudeMeters = Math.max(0, Math.floor(-this.player.y + (this.logicalHeight - 120)));
        if (currentAltitudeMeters > this.maxAltitude) {
            this.maxAltitude = currentAltitudeMeters;
            this.updateHUD();
        }

        // 12. Comprobar si se completó el nivel actual
        if (this.maxAltitude >= levelConfig.targetAltitude) {
            this.completeLevel();
            return;
        }

        // Generar más mundo según asciende
        if (this.cameraY - this.logicalHeight < this.highestPlatformY) {
            this.generateWorldChunk(this.cameraY - this.logicalHeight * 2);
        }

        // Limpiar entidades lejanas
        const cleanupLimit = this.cameraY + this.logicalHeight + 150;
        this.platforms = this.platforms.filter(p => p.y < cleanupLimit);
        this.items = this.items.filter(item => item.y < cleanupLimit && !item.collected);
        this.obstacles = this.obstacles.filter(obs => obs.y < cleanupLimit);
        this.windZones = this.windZones.filter(w => w.y < cleanupLimit);

        // 13. Caída al vacío (Pérdida de vida)
        const fallLimit = this.cameraY + this.logicalHeight + 35;
        if (this.player.y > fallLimit) {
            this.takeDamage("☁️ ¡Cuidado con el salto! La perseverancia es tu mayor virtud ✨");
        }
    }

    // Sistema de daño y pérdida de vidas
    takeDamage(message) {
        if (this.player.shield) {
            // El escudo absorbe el golpe
            this.player.shield = false;
            this.player.invulnerableTimer = 1.8;
            this.player.vy = this.player.jumpForce * 1.1;
            if (window.sound) window.sound.playSpring();
            this.triggerToast("🛡️ ¡Tu escudo absorbió el golpe! ¡Sigue adelante!", 'intelligence');
            return;
        }

        this.lives--;
        this.updateHUD();

        if (window.sound) window.sound.playHurt();

        if (this.lives > 0) {
            // Rescate a plataforma segura con invulnerabilidad temporal
            const targetPlatform = this.platforms.find(p => p.y >= this.cameraY + 80 && p.y <= this.cameraY + this.logicalHeight - 120)
                || { x: this.logicalWidth / 2 - 35, y: this.cameraY + 300, width: 70 };

            this.player.x = targetPlatform.x + targetPlatform.width / 2;
            this.player.y = targetPlatform.y - 35;
            this.player.vx = 0;
            this.player.vy = this.player.jumpForce * 1.15;
            this.player.invulnerableTimer = 2.2;

            if (window.particles) {
                window.particles.emitCollectSparkles(this.player.x, this.player.y, 'beauty');
            }

            this.triggerToast(message || "❤️ ¡Te queda fuerza! Una pulguita valiente nunca se rinde.", 'beauty');
        } else {
            // Game Over de Nivel
            this.state = 'GAMEOVER';
            if (this.onGameOver) this.onGameOver(this.currentLevel);
        }
    }

    // Superación de nivel
    completeLevel() {
        if (this.currentLevel >= this.maxLevels) {
            // ¡Victoria Total del Juego!
            this.state = 'VICTORY';
            if (window.sound) window.sound.playWinFanfare();
            if (window.particles) window.particles.emitCelebrationConfetti(this.logicalWidth, this.logicalHeight);
            if (this.onVictoryReached) this.onVictoryReached();
        } else {
            // Pausar y activar la trivia interactiva de este nivel
            this.state = 'QUIZ';
            const levelData = getLevelData(this.currentLevel);
            if (window.sound) window.sound.playLevelUp();
            if (window.particles) window.particles.emitCelebrationConfetti(this.logicalWidth, this.logicalHeight * 0.5);
            if (this.onLevelComplete) this.onLevelComplete(levelData);
        }
    }

    // Avanzar al siguiente nivel tras responder la trivia
    nextLevel() {
        this.currentLevel++;
        this.start(this.currentLevel, false);
    }

    // Actualizar HUD superior
    updateHUD() {
        const levelConfig = getLevelData(this.currentLevel);
        if (this.onScoreUpdate) this.onScoreUpdate(this.score);
        if (this.onLivesUpdate) this.onLivesUpdate(this.lives);
        if (this.onAltitudeUpdate) this.onAltitudeUpdate(this.maxAltitude, levelConfig.targetAltitude);
        if (this.onLevelUpdate) this.onLevelUpdate(this.currentLevel, levelConfig.title);
    }

    triggerToast(message, type = 'beauty') {
        if (this.onToastMessage) this.onToastMessage(message, type);
    }

    // Renderizado en Canvas
    render() {
        const ctx = this.ctx;
        const width = this.logicalWidth;
        const height = this.logicalHeight;
        const cameraY = this.cameraY;

        ctx.clearRect(0, 0, width, height);

        // 1. Fondo dinámico según nivel
        this.drawDynamicBackground(ctx, width, height);

        // 2. Estrellas de fondo
        const spaceFactor = Math.min(1, Math.max(0, (this.maxAltitude - 2000) / 4000));
        if (window.particles) {
            window.particles.drawBackgroundStars(ctx, width, height, cameraY, spaceFactor);
        }

        // 3. Corrientes de viento
        this.windZones.forEach(w => this.drawWindZone(ctx, w, cameraY));

        // 4. Plataformas
        this.platforms.forEach(p => this.drawPlatform(ctx, p, cameraY));

        // 5. Obstáculos (Nubes de tormenta y rayos)
        this.obstacles.forEach(obs => this.drawObstacle(ctx, obs, cameraY));

        // 6. Coleccionables
        this.items.forEach(item => this.drawItem(ctx, item, cameraY));

        // 7. Partículas
        if (window.particles) {
            window.particles.updateAndDraw(ctx, cameraY);
        }

        // 8. Personaje Isa
        this.drawIsa(ctx, cameraY);
    }

    // Fondos por nivel
    drawDynamicBackground(ctx, width, height) {
        const levelData = getLevelData(this.currentLevel);
        let grad = ctx.createLinearGradient(0, 0, 0, height);

        switch (levelData.skyTheme) {
            case 'morning':
                grad.addColorStop(0, '#a1c4fd');
                grad.addColorStop(0.5, '#c2e9fb');
                grad.addColorStop(1, '#ffe3e8');
                break;
            case 'sunset':
                grad.addColorStop(0, '#667eea');
                grad.addColorStop(0.5, '#764ba2');
                grad.addColorStop(1, '#fbc2eb');
                break;
            case 'storm':
                grad.addColorStop(0, '#2b2d42');
                grad.addColorStop(0.5, '#4a4e69');
                grad.addColorStop(1, '#6b2d5c');
                break;
            case 'aurora':
                grad.addColorStop(0, '#0f2027');
                grad.addColorStop(0.5, '#203a43');
                grad.addColorStop(1, '#2c5364');
                break;
            default: // space
                grad.addColorStop(0, '#050518');
                grad.addColorStop(0.5, '#0d0d2b');
                grad.addColorStop(1, '#1b0933');
                break;
        }

        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, width, height);
    }

    // Dibujar corriente de viento
    drawWindZone(ctx, w, cameraY) {
        const screenY = w.y - cameraY;
        if (screenY < -100 || screenY > this.logicalHeight + 100) return;

        ctx.save();
        ctx.fillStyle = 'rgba(255, 255, 255, 0.08)';
        ctx.fillRect(w.x, screenY, w.width, w.height);

        // Brisas ondeantes
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.25)';
        ctx.lineWidth = 1.5;
        const time = performance.now() * 0.003;
        for (let i = 0; i < 3; i++) {
            const lineY = screenY + 15 + i * 16;
            ctx.beginPath();
            ctx.moveTo(0, lineY + Math.sin(time + i) * 4);
            ctx.quadraticCurveTo(this.logicalWidth / 2, lineY - Math.sin(time + i) * 6, this.logicalWidth, lineY + Math.sin(time + i) * 4);
            ctx.stroke();
        }
        ctx.restore();
    }

    // Dibujar obstáculos (Tormenta y Rayos)
    drawObstacle(ctx, obs, cameraY) {
        const screenY = obs.y - cameraY;
        if (screenY < -60 || screenY > this.logicalHeight + 60) return;

        ctx.save();
        if (obs.type === 'storm_cloud') {
            // Nube gris oscura de tormenta
            ctx.fillStyle = '#4a4e69';
            ctx.beginPath();
            ctx.arc(obs.x + 15, screenY + 12, 12, 0, Math.PI * 2);
            ctx.arc(obs.x + 30, screenY + 8, 15, 0, Math.PI * 2);
            ctx.arc(obs.x + 45, screenY + 12, 12, 0, Math.PI * 2);
            ctx.fill();

            // Rayo eléctrico si está activo
            if (obs.zapActive) {
                ctx.strokeStyle = '#ffee32';
                ctx.lineWidth = 2.5;
                ctx.shadowColor = '#ffd166';
                ctx.shadowBlur = 10;
                ctx.beginPath();
                ctx.moveTo(obs.x + 30, screenY + 20);
                ctx.lineTo(obs.x + 22, screenY + 32);
                ctx.lineTo(obs.x + 34, screenY + 34);
                ctx.lineTo(obs.x + 26, screenY + 48);
                ctx.stroke();
            }
        }
        ctx.restore();
    }

    // Dibujar Plataformas
    drawPlatform(ctx, p, cameraY) {
        const screenY = p.y - cameraY;
        if (screenY < -50 || screenY > this.logicalHeight + 50) return;

        ctx.save();
        if (p.type === 'flower_spring') {
            ctx.fillStyle = '#ff758c';
            this.drawRoundedRect(ctx, p.x, screenY, p.width, p.height, 8);
            ctx.fill();

            ctx.fillStyle = '#ffbe0b';
            ctx.beginPath();
            ctx.arc(p.x + p.width / 2, screenY - 4, 6, 0, Math.PI * 2);
            ctx.fill();
        } else if (p.type === 'book') {
            ctx.fillStyle = '#3a86ff';
            this.drawRoundedRect(ctx, p.x, screenY, p.width, p.height * 0.75, 4);
            ctx.fill();

            ctx.fillStyle = '#ffbe0b';
            this.drawRoundedRect(ctx, p.x + 4, screenY + 7, p.width - 8, p.height * 0.45, 3);
            ctx.fill();
        } else if (p.type === 'galaxy_pad') {
            const grad = ctx.createLinearGradient(p.x, screenY, p.x + p.width, screenY);
            grad.addColorStop(0, '#8338ec');
            grad.addColorStop(0.5, '#3a86ff');
            grad.addColorStop(1, '#ff006e');

            ctx.fillStyle = grad;
            ctx.shadowColor = '#8338ec';
            ctx.shadowBlur = 8;
            this.drawRoundedRect(ctx, p.x, screenY, p.width, p.height, 6);
            ctx.fill();
        } else if (p.type === 'fragile') {
            ctx.fillStyle = p.isBroken ? 'rgba(255, 200, 220, 0.25)' : '#f3c5ff';
            this.drawRoundedRect(ctx, p.x, screenY, p.width, p.height, 8);
            ctx.fill();
        } else {
            const grad = ctx.createLinearGradient(p.x, screenY, p.x, screenY + p.height);
            grad.addColorStop(0, '#ffffff');
            grad.addColorStop(1, '#e8f0fe');

            ctx.fillStyle = grad;
            ctx.shadowColor = 'rgba(0, 0, 0, 0.08)';
            ctx.shadowBlur = 4;
            this.drawRoundedRect(ctx, p.x, screenY, p.width, p.height, 8);
            ctx.fill();
        }
        ctx.restore();
    }

    // Dibujar Coleccionables
    drawItem(ctx, item, cameraY) {
        if (item.collected) return;
        const screenY = item.y - cameraY + Math.sin(performance.now() * 0.005 + item.bobPhase) * 4;
        if (screenY < -40 || screenY > this.logicalHeight + 40) return;

        ctx.save();
        ctx.translate(item.x, screenY);

        if (item.type === 'beauty') {
            ctx.shadowColor = '#ff758c';
            ctx.shadowBlur = 8;
            ctx.fillStyle = '#ff758c';
            for (let i = 0; i < 5; i++) {
                ctx.rotate((Math.PI * 2) / 5);
                ctx.beginPath();
                ctx.arc(0, 6, 4.5, 0, Math.PI * 2);
                ctx.fill();
            }
            ctx.fillStyle = '#ffe600';
            ctx.beginPath();
            ctx.arc(0, 0, 4, 0, Math.PI * 2);
            ctx.fill();
        } else if (item.type === 'intelligence') {
            ctx.shadowColor = '#00f5d4';
            ctx.shadowBlur = 10;
            ctx.fillStyle = '#00f5d4';
            ctx.beginPath();
            ctx.arc(0, -2, 6.5, 0, Math.PI * 2);
            ctx.fill();

            ctx.fillStyle = '#ffffff';
            ctx.beginPath();
            ctx.arc(-2, -4, 2, 0, Math.PI * 2);
            ctx.fill();
        } else if (item.type === 'potential') {
            ctx.shadowColor = '#ffd166';
            ctx.shadowBlur = 10;
            ctx.fillStyle = '#ffd166';
            ctx.beginPath();
            ctx.moveTo(-9, 5);
            ctx.lineTo(-9, -3);
            ctx.lineTo(-4, 0);
            ctx.lineTo(0, -6);
            ctx.lineTo(4, 0);
            ctx.lineTo(9, -3);
            ctx.lineTo(9, 5);
            ctx.closePath();
            ctx.fill();
        } else if (item.type === 'rocket') {
            ctx.shadowColor = '#ff4d6d';
            ctx.shadowBlur = 8;
            ctx.fillStyle = '#ff4d6d';
            ctx.beginPath();
            ctx.moveTo(0, -11);
            ctx.lineTo(5, 5);
            ctx.lineTo(-5, 5);
            ctx.closePath();
            ctx.fill();
        }

        ctx.restore();
    }

    // Renderizar a Isa ("La Pulguita")
    drawIsa(ctx, cameraY) {
        const screenY = this.player.y - cameraY;
        const p = this.player;

        ctx.save();
        ctx.translate(p.x, screenY);

        // Parpadeo de invulnerabilidad tras recibir daño
        if (p.invulnerableTimer > 0 && Math.floor(performance.now() / 100) % 2 === 0) {
            ctx.globalAlpha = 0.45;
        }

        ctx.scale((p.facingRight ? 1 : -1) * p.squash, p.stretch);

        // 1. Escudo burbuja
        if (p.shield) {
            ctx.save();
            ctx.strokeStyle = `rgba(112, 214, 255, ${0.7 + Math.sin(performance.now() * 0.01) * 0.3})`;
            ctx.lineWidth = 3;
            ctx.shadowColor = '#70d6ff';
            ctx.shadowBlur = 12;
            ctx.beginPath();
            ctx.arc(0, 0, 26, 0, Math.PI * 2);
            ctx.stroke();

            ctx.fillStyle = 'rgba(112, 214, 255, 0.15)';
            ctx.fill();
            ctx.restore();
        }

        // 2. Cohete
        if (p.rocket) {
            ctx.save();
            ctx.fillStyle = '#ff5964';
            ctx.beginPath();
            ctx.moveTo(0, -30);
            ctx.lineTo(13, 8);
            ctx.lineTo(-13, 8);
            ctx.closePath();
            ctx.fill();
            ctx.restore();
        }

        // 3. Alitas
        const wingOffset = Math.sin(p.wingFlap) * 4;
        ctx.fillStyle = 'rgba(255, 255, 255, 0.75)';
        ctx.beginPath();
        ctx.ellipse(-14, -4 + wingOffset, 10, 5, -Math.PI / 4, 0, Math.PI * 2);
        ctx.fill();

        // 4. Cuerpo de la pulguita
        const bodyGrad = ctx.createRadialGradient(-4, -4, 4, 0, 0, 18);
        bodyGrad.addColorStop(0, '#ffccd5');
        bodyGrad.addColorStop(0.6, '#ff8fa3');
        bodyGrad.addColorStop(1, '#ff4d6d');

        ctx.fillStyle = bodyGrad;
        ctx.shadowColor = 'rgba(255, 77, 109, 0.3)';
        ctx.shadowBlur = 6;
        ctx.beginPath();
        ctx.arc(0, 0, 17, 0, Math.PI * 2);
        ctx.fill();

        // 5. Antenitas con corazones
        ctx.strokeStyle = '#c9184a';
        ctx.lineWidth = 2;
        ctx.lineCap = 'round';

        ctx.beginPath();
        ctx.moveTo(-6, -15);
        ctx.quadraticCurveTo(-10, -25, -12, -26);
        ctx.stroke();

        ctx.fillStyle = '#ff0054';
        ctx.beginPath();
        ctx.arc(-13, -27, 3, 0, Math.PI * 2);
        ctx.fill();

        ctx.beginPath();
        ctx.moveTo(6, -15);
        ctx.quadraticCurveTo(10, -25, 12, -26);
        ctx.stroke();

        ctx.fillStyle = '#ff0054';
        ctx.beginPath();
        ctx.arc(13, -27, 3, 0, Math.PI * 2);
        ctx.fill();

        // 6. Coronita de Isa
        ctx.fillStyle = '#ffd166';
        ctx.beginPath();
        ctx.moveTo(0, -17);
        ctx.lineTo(-6, -21);
        ctx.lineTo(-4, -15);
        ctx.lineTo(0, -16);
        ctx.lineTo(4, -15);
        ctx.lineTo(6, -21);
        ctx.closePath();
        ctx.fill();

        // 7. Mejillas sonrojadas
        ctx.fillStyle = 'rgba(255, 25, 100, 0.35)';
        ctx.beginPath();
        ctx.arc(-8, 5, 4, 0, Math.PI * 2);
        ctx.arc(8, 5, 4, 0, Math.PI * 2);
        ctx.fill();

        // 8. Ojos expresivos
        const isBlinking = p.blinkTimer > 3.8 && p.blinkTimer <= 4.0;
        if (isBlinking) {
            ctx.strokeStyle = '#2b0938';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.arc(-5, 0, 4, Math.PI * 1.1, Math.PI * 1.9);
            ctx.stroke();
            ctx.beginPath();
            ctx.arc(7, 0, 4, Math.PI * 1.1, Math.PI * 1.9);
            ctx.stroke();
        } else {
            ctx.fillStyle = '#2b0938';
            ctx.beginPath();
            ctx.ellipse(-5, 0, 4, 5.5, 0, 0, Math.PI * 2);
            ctx.ellipse(7, 0, 4, 5.5, 0, 0, Math.PI * 2);
            ctx.fill();

            ctx.fillStyle = '#ffffff';
            ctx.beginPath();
            ctx.arc(-4, -2, 1.8, 0, Math.PI * 2);
            ctx.arc(8, -2, 1.8, 0, Math.PI * 2);
            ctx.arc(-6, 2, 0.9, 0, Math.PI * 2);
            ctx.arc(6, 2, 0.9, 0, Math.PI * 2);
            ctx.fill();
        }

        // 9. Sonrisa
        ctx.strokeStyle = '#590d22';
        ctx.lineWidth = 1.8;
        ctx.beginPath();
        ctx.arc(1, 4, 3.5, 0.2, Math.PI - 0.2);
        ctx.stroke();

        ctx.restore();
    }

    drawRoundedRect(ctx, x, y, width, height, radius) {
        ctx.beginPath();
        ctx.moveTo(x + radius, y);
        ctx.lineTo(x + width - radius, y);
        ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
        ctx.lineTo(x + width, y + height - radius);
        ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
        ctx.lineTo(x + radius, y + height);
        ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
        ctx.lineTo(x, y + radius);
        ctx.quadraticCurveTo(x, y, x + radius, y);
        ctx.closePath();
    }

    loop(currentTime) {
        const dt = Math.min(0.05, (currentTime - this.lastFrameTime) / 1000);
        this.lastFrameTime = currentTime;

        this.update(dt);
        this.render();

        requestAnimationFrame((t) => this.loop(t));
    }
}

window.IsaJumpGame = IsaJumpGame;
