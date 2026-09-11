/**
 * main.js - Inicialización, selector de 4 personajes 3D, control de debates, cinemática y carta
 */

document.addEventListener('DOMContentLoaded', () => {
    // 1. Instanciar el juego
    const game = new IsaJumpGame();

    // 2. Elementos del DOM
    const hud = document.getElementById('hud');
    const hudLives = document.getElementById('hudLives');
    const hudLevelTag = document.getElementById('hudLevelTag');
    const hudScore = document.getElementById('hudScore');
    const hudAltitude = document.getElementById('hudAltitude');
    const hudTargetAltitude = document.getElementById('hudTargetAltitude');
    const hudProgressFill = document.getElementById('hudProgressFill');
    const soundToggleBtn = document.getElementById('soundToggleBtn');
    const toastContainer = document.getElementById('toastContainer');

    // Modales y Pantallas
    const startScreen = document.getElementById('startScreen');
    const instructionsModal = document.getElementById('instructionsModal');
    const quizModal = document.getElementById('quizModal');
    const gameOverModal = document.getElementById('gameOverModal');
    const cinematicModal = document.getElementById('cinematicModal');
    const victoryModal = document.getElementById('victoryModal');

    // Selector de Personajes 3D
    const characterCards = document.querySelectorAll('.character-card');
    let selectedCharacterId = 'elmacho';

    characterCards.forEach(card => {
        card.addEventListener('click', () => {
            characterCards.forEach(c => c.classList.remove('active'));
            card.classList.add('active');
            selectedCharacterId = card.dataset.char;
            
            if (window.sound) {
                window.sound.init();
                window.sound.playBeautyCollect();
            }
        });
    });

    // Elementos de Debate / Quiz
    const quizTagBadge = document.getElementById('quizTagBadge');
    const quizQuestion = document.getElementById('quizQuestion');
    const quizQuickIdeas = document.getElementById('quizQuickIdeas');
    const quizTextAnswer = document.getElementById('quizTextAnswer');
    const saveAndNextBtn = document.getElementById('saveAndNextBtn');

    // Elementos de la Cinemática
    const cinematicViewport = document.getElementById('cinematicViewport');
    const cinematicImage = document.getElementById('cinematicImage');
    const cinematicRoundTag = document.getElementById('cinematicRoundTag');
    const cinematicText = document.getElementById('cinematicText');
    const cinematicNextBtn = document.getElementById('cinematicNextBtn');
    const cinematicFinishBtn = document.getElementById('cinematicFinishBtn');
    const cinemaDots = document.querySelectorAll('.cinema-dot');

    // Botones de Acción Generales
    const startBtn = document.getElementById('startBtn');
    const instructionsBtn = document.getElementById('instructionsBtn');
    const closeInstructionsBtn = document.getElementById('closeInstructionsBtn');
    const retryLevelBtn = document.getElementById('retryLevelBtn');
    const playAgainBtn = document.getElementById('playAgainBtn');
    const replayLetterBtn = document.getElementById('replayLetterBtn');
    const letterBody = document.getElementById('letterBody');

    // Memoria de respuestas
    const userDebateAnswers = {};

    // Escenas de la Cinemática
    const cinematicScenes = [
        {
            image: 'assets/cinematic/scene1_faceoff.jpg',
            tag: '🥊 ROUND 1: EL CARA A CARA',
            text: 'El temible Oso Gigante desafía al valiente Cerdo Boxeador en la arena estelar. ¡El público ruge de emoción!',
            action: () => {
                if (window.sound) window.sound.playBoxingBell();
            }
        },
        {
            image: 'assets/cinematic/scene2_superpunch.jpg',
            tag: '⚡ ¡¡EL SÚPER GOLPE RELÁMPAGO!!',
            text: '¡¡KRA-KOOM!! El Cerdo esquiva el zarpazo con una agilidad prodigiosa y conecta un potente golpe directo al mentón.',
            action: () => {
                if (window.sound) window.sound.playPunchImpact();
                cinematicViewport.classList.remove('screen-shake');
                void cinematicViewport.offsetWidth;
                cinematicViewport.classList.add('screen-shake');
            }
        },
        {
            image: 'assets/cinematic/scene3_knockout.jpg',
            tag: '😵 ¡LA CUENTA DE PROTECCIÓN: 1... 2... 3...!',
            text: '¡El Oso cae completamente noqueado contra las cuerdas con estrellas girando! ¡No puede levantarse!',
            action: () => {
                if (window.sound) window.sound.playBoxingBell();
            }
        },
        {
            image: 'assets/cinematic/scene4_champion.jpg',
            tag: '👑 ¡¡EL CERDO ES EL GANADOR INDISCUTIBLE!!',
            text: '¡K.O. FULMINANTE! El Cerdo alza el cinturón dorado de Campeón Mundial bajo una lluvia de confeti y fuegos artificiales. 🐷🏆',
            action: () => {
                if (window.sound) window.sound.playWinFanfare();
                if (window.particles) window.particles.emitCelebrationConfetti(game.logicalWidth, game.logicalHeight);
            }
        }
    ];
    let currentCinematicStep = 0;

    // 3. Conectar Callbacks del Motor de Juego
    game.onScoreUpdate = (score) => {
        hudScore.textContent = score.toLocaleString();
    };

    game.onLivesUpdate = (lives) => {
        let hearts = '';
        for (let i = 0; i < 3; i++) {
            hearts += (i < lives) ? '❤️' : '🖤';
        }
        hudLives.textContent = hearts;
    };

    game.onAltitudeUpdate = (altitude, target) => {
        hudAltitude.textContent = altitude.toLocaleString();
        hudTargetAltitude.textContent = target.toLocaleString();
        const progressPct = Math.min(100, Math.max(0, (altitude / target) * 100));
        hudProgressFill.style.width = `${progressPct}%`;
    };

    game.onLevelUpdate = (level) => {
        hudLevelTag.textContent = `Nivel ${level}`;
    };

    game.onToastMessage = (message, type) => {
        showToast(message, type);
    };

    game.onLevelComplete = (levelData) => {
        quizTagBadge.textContent = levelData.quiz.tag || "💬 Momento de Debate";
        quizQuestion.textContent = levelData.quiz.question;
        quizTextAnswer.value = userDebateAnswers[levelData.level] || '';
        quizTextAnswer.placeholder = levelData.quiz.placeholder || "Escribe tu respuesta aquí...";

        quizQuickIdeas.innerHTML = '';
        if (levelData.quiz.quickIdeas) {
            levelData.quiz.quickIdeas.forEach(idea => {
                const pill = document.createElement('span');
                pill.className = 'idea-pill';
                pill.textContent = `💡 ${idea}`;
                pill.addEventListener('click', () => {
                    quizTextAnswer.value = idea;
                    quizTextAnswer.focus();
                });
                quizQuickIdeas.appendChild(pill);
            });
        }

        quizModal.classList.add('active');
    };

    game.onGameOver = () => {
        gameOverModal.classList.add('active');
    };

    game.onVictoryReached = () => {
        hud.style.display = 'none';
        startCinematic();
    };

    // 4. Funciones de la Cinemática
    function startCinematic() {
        currentCinematicStep = 0;
        cinematicModal.classList.add('active');
        showCinematicScene(currentCinematicStep);
    }

    function showCinematicScene(index) {
        const scene = cinematicScenes[index];
        if (!scene) return;

        cinematicImage.classList.remove('zooming');
        cinematicImage.src = scene.image;
        void cinematicImage.offsetWidth;
        cinematicImage.classList.add('zooming');

        cinematicRoundTag.textContent = scene.tag;
        cinematicText.textContent = scene.text;

        cinemaDots.forEach((dot, idx) => {
            dot.classList.toggle('active', idx === index);
        });

        if (scene.action) scene.action();

        if (index === cinematicScenes.length - 1) {
            cinematicNextBtn.style.display = 'none';
            cinematicFinishBtn.style.display = 'block';
        } else {
            cinematicNextBtn.style.display = 'block';
            cinematicFinishBtn.style.display = 'none';
        }
    }

    cinematicNextBtn.addEventListener('click', () => {
        if (currentCinematicStep < cinematicScenes.length - 1) {
            currentCinematicStep++;
            showCinematicScene(currentCinematicStep);
        }
    });

    cinematicFinishBtn.addEventListener('click', () => {
        cinematicModal.classList.remove('active');
        victoryModal.classList.add('active');
        typewriterLetter(ISA_QUOTES.finalLetter.paragraphs);
    });

    // 5. Guardar respuesta del debate y pasar al siguiente nivel
    saveAndNextBtn.addEventListener('click', () => {
        const currentAns = quizTextAnswer.value.trim();
        userDebateAnswers[game.currentLevel] = currentAns;

        if (window.sound) window.sound.playSpring();
        if (window.particles) window.particles.emitCelebrationConfetti(game.logicalWidth, game.logicalHeight * 0.3);

        quizModal.classList.remove('active');
        game.nextLevel();
    });

    // 6. Notificaciones Toast Flotantes
    function showToast(message, type = 'beauty') {
        const toast = document.createElement('div');
        toast.className = `toast-message toast-${type}`;

        let icon = '🌸';
        if (type === 'intelligence') icon = '💡';
        if (type === 'potential') icon = '🚀';

        toast.innerHTML = `<span>${icon}</span><span>${message}</span>`;
        toastContainer.appendChild(toast);

        setTimeout(() => {
            if (toast.parentNode) {
                toast.parentNode.removeChild(toast);
            }
        }, 3800);
    }

    // 7. Animación de Máquina de Escribir para la Carta
    let typewriterTimeout = null;
    function typewriterLetter(paragraphs) {
        if (typewriterTimeout) clearTimeout(typewriterTimeout);
        letterBody.innerHTML = '';

        let pIndex = 0;
        let charIndex = 0;
        let currentP = null;

        function typeNextChar() {
            if (pIndex >= paragraphs.length) return;

            if (!currentP) {
                currentP = document.createElement('p');
                letterBody.appendChild(currentP);
            }

            const currentText = paragraphs[pIndex];
            if (charIndex < currentText.length) {
                currentP.textContent += currentText.charAt(charIndex);
                charIndex++;
                typewriterTimeout = setTimeout(typeNextChar, 18);
            } else {
                pIndex++;
                charIndex = 0;
                currentP = null;
                typewriterTimeout = setTimeout(typeNextChar, 160);
            }
        }

        typeNextChar();
    }

    // 8. Listeners de Botones de Interfaz
    startBtn.addEventListener('click', () => {
        startScreen.classList.remove('active');
        hud.style.display = 'flex';
        game.start(1, true, selectedCharacterId);
    });

    instructionsBtn.addEventListener('click', () => {
        instructionsModal.classList.add('active');
    });

    closeInstructionsBtn.addEventListener('click', () => {
        instructionsModal.classList.remove('active');
    });

    retryLevelBtn.addEventListener('click', () => {
        gameOverModal.classList.remove('active');
        game.start(game.currentLevel, false, selectedCharacterId);
    });

    playAgainBtn.addEventListener('click', () => {
        victoryModal.classList.remove('active');
        hud.style.display = 'flex';
        game.start(1, true, selectedCharacterId);
    });

    replayLetterBtn.addEventListener('click', () => {
        typewriterLetter(ISA_QUOTES.finalLetter.paragraphs);
    });

    soundToggleBtn.addEventListener('click', () => {
        if (window.sound) {
            const isMuted = window.sound.toggleMute();
            soundToggleBtn.textContent = isMuted ? '🔇' : '🔊';
        }
    });

    // 9. Iniciar Loop de Animación
    requestAnimationFrame((t) => game.loop(t));
});
