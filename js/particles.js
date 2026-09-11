/**
 * particles.js - Sistema de partículas optimizado para efectos visuales estéticos
 * Incluye estelas de salto, corazones flotantes, destellos mágicos, confeti y estrellas de fondo.
 */

class ParticleSystem {
    constructor() {
        this.particles = [];
        this.backgroundStars = [];
        this.initStars(80);
    }

    // Inicializar estrellas del fondo con efecto de paralaje
    initStars(count) {
        this.backgroundStars = [];
        for (let i = 0; i < count; i++) {
            this.backgroundStars.push({
                x: Math.random(),
                y: Math.random(),
                size: Math.random() * 2.5 + 0.8,
                baseAlpha: Math.random() * 0.7 + 0.3,
                twinkleSpeed: Math.random() * 0.05 + 0.02,
                twinklePhase: Math.random() * Math.PI * 2,
                layer: Math.random() * 0.5 + 0.2 // Factor de paralaje
            });
        }
    }

    // Actualizar y dibujar estrellas de fondo según la altura de la cámara
    drawBackgroundStars(ctx, width, height, cameraY, spaceFactor) {
        if (spaceFactor <= 0.05) return; // No dibujar si es pleno día

        this.backgroundStars.forEach(star => {
            star.twinklePhase += star.twinkleSpeed;
            const alpha = (star.baseAlpha + Math.sin(star.twinklePhase) * 0.3) * spaceFactor;
            
            // Posición con paralaje vertical
            const screenX = star.x * width;
            let screenY = ((star.y * height - cameraY * star.layer) % height);
            if (screenY < 0) screenY += height;

            ctx.save();
            ctx.fillStyle = `rgba(255, 255, 255, ${Math.max(0, Math.min(1, alpha))})`;
            ctx.shadowBlur = 4;
            ctx.shadowColor = '#ffffff';

            ctx.beginPath();
            ctx.arc(screenX, screenY, star.size, 0, Math.PI * 2);
            ctx.fill();

            // Destello en cruz para estrellas grandes
            if (star.size > 2.2 && alpha > 0.6) {
                ctx.strokeStyle = `rgba(255, 240, 255, ${alpha * 0.5})`;
                ctx.lineWidth = 0.7;
                ctx.beginPath();
                ctx.moveTo(screenX - star.size * 2, screenY);
                ctx.lineTo(screenX + star.size * 2, screenY);
                ctx.moveTo(screenX, screenY - star.size * 2);
                ctx.lineTo(screenX, screenY + star.size * 2);
                ctx.stroke();
            }
            ctx.restore();
        });
    }

    // Crear destellos de estela tras Isa
    emitTrail(x, y, color = '#ffb6c1') {
        for (let i = 0; i < 2; i++) {
            this.particles.push({
                type: 'trail',
                x: x + (Math.random() - 0.5) * 16,
                y: y + (Math.random() - 0.5) * 8,
                vx: (Math.random() - 0.5) * 1.5,
                vy: Math.random() * 1.5 + 0.5,
                size: Math.random() * 3 + 1.5,
                color: color,
                alpha: 0.8,
                decay: 0.035
            });
        }
    }

    // Crear explosión de brillos al recoger items de belleza o inteligencia
    emitCollectSparkles(x, y, type = 'beauty') {
        const colors = type === 'beauty' 
            ? ['#ff758c', '#ff7eb3', '#ffc3a0', '#ffffff', '#ffd166']
            : ['#06d6a0', '#118ab2', '#70d6ff', '#ffffff', '#ffd166'];
        
        const count = 18;
        for (let i = 0; i < count; i++) {
            const angle = (Math.PI * 2 / count) * i + Math.random() * 0.3;
            const speed = Math.random() * 4 + 2;
            this.particles.push({
                type: type === 'beauty' && Math.random() > 0.5 ? 'heart' : 'sparkle',
                x: x,
                y: y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                size: Math.random() * 4 + 2,
                color: colors[Math.floor(Math.random() * colors.length)],
                alpha: 1,
                decay: Math.random() * 0.02 + 0.02,
                rotation: Math.random() * Math.PI * 2,
                rotSpeed: (Math.random() - 0.5) * 0.1
            });
        }
    }

    // Crear estela de fuego y humo para el cohete espacial
    emitRocketThrust(x, y) {
        const colors = ['#ff4d4d', '#ff9900', '#ffeb3b', '#ffffff', '#a855f7'];
        for (let i = 0; i < 4; i++) {
            this.particles.push({
                type: 'flame',
                x: x + (Math.random() - 0.5) * 14,
                y: y + 20 + Math.random() * 6,
                vx: (Math.random() - 0.5) * 2,
                vy: Math.random() * 5 + 4,
                size: Math.random() * 6 + 3,
                color: colors[Math.floor(Math.random() * colors.length)],
                alpha: 0.9,
                decay: 0.04
            });
        }
    }

    // Crear polvo esponjoso de salto al tocar una nube
    emitJumpPuff(x, y, color = '#ffffff') {
        for (let i = 0; i < 6; i++) {
            const angle = Math.PI + (Math.random() - 0.5) * 1.5;
            const speed = Math.random() * 2 + 1;
            this.particles.push({
                type: 'puff',
                x: x + (Math.random() - 0.5) * 30,
                y: y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed * 0.4 + 0.5,
                size: Math.random() * 7 + 4,
                color: color,
                alpha: 0.7,
                decay: 0.04
            });
        }
    }

    // Confeti masivo de celebración (Hitos y Victoria)
    emitCelebrationConfetti(width, height) {
        const colors = ['#ff4d88', '#ff758c', '#ffbe0b', '#fb5607', '#ff006e', '#8338ec', '#3a86ff', '#ffffff'];
        for (let i = 0; i < 120; i++) {
            this.particles.push({
                type: Math.random() > 0.4 ? 'confetti' : (Math.random() > 0.5 ? 'heart' : 'star'),
                x: Math.random() * width,
                y: Math.random() * height * 0.4,
                vx: (Math.random() - 0.5) * 4,
                vy: Math.random() * 3 + 2,
                size: Math.random() * 8 + 4,
                color: colors[Math.floor(Math.random() * colors.length)],
                alpha: 1,
                decay: Math.random() * 0.005 + 0.005,
                rotation: Math.random() * Math.PI * 2,
                rotSpeed: (Math.random() - 0.5) * 0.15
            });
        }
    }

    // Actualizar y renderizar todas las partículas activas
    updateAndDraw(ctx, cameraY) {
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const p = this.particles[i];
            
            p.x += p.vx;
            p.y += p.vy;
            p.alpha -= p.decay;

            if (p.rotation !== undefined) {
                p.rotation += p.rotSpeed || 0.05;
            }

            // Eliminar si es transparente o sale de rango
            if (p.alpha <= 0) {
                this.particles.splice(i, 1);
                continue;
            }

            const drawY = p.y - cameraY;

            ctx.save();
            ctx.globalAlpha = Math.max(0, p.alpha);

            if (p.type === 'heart') {
                ctx.translate(p.x, drawY);
                ctx.rotate(p.rotation || 0);
                ctx.fillStyle = p.color;
                this.drawHeartShape(ctx, 0, 0, p.size);
            } else if (p.type === 'star') {
                ctx.translate(p.x, drawY);
                ctx.rotate(p.rotation || 0);
                ctx.fillStyle = p.color;
                this.drawStarShape(ctx, 0, 0, 5, p.size, p.size * 0.5);
            } else if (p.type === 'confetti') {
                ctx.translate(p.x, drawY);
                ctx.rotate(p.rotation || 0);
                ctx.fillStyle = p.color;
                ctx.fillRect(-p.size / 2, -p.size / 4, p.size, p.size / 2);
            } else if (p.type === 'flame') {
                ctx.fillStyle = p.color;
                ctx.shadowColor = p.color;
                ctx.shadowBlur = 8;
                ctx.beginPath();
                ctx.arc(p.x, drawY, p.size * p.alpha, 0, Math.PI * 2);
                ctx.fill();
            } else if (p.type === 'puff') {
                ctx.fillStyle = p.color;
                ctx.beginPath();
                ctx.arc(p.x, drawY, p.size * (1.2 - p.alpha * 0.2), 0, Math.PI * 2);
                ctx.fill();
            } else { // Sparkle / Trail estándar
                ctx.fillStyle = p.color;
                ctx.beginPath();
                ctx.arc(p.x, drawY, p.size, 0, Math.PI * 2);
                ctx.fill();
            }

            ctx.restore();
        }
    }

    // Dibujar forma de corazón
    drawHeartShape(ctx, x, y, size) {
        ctx.beginPath();
        const topCurveHeight = size * 0.3;
        ctx.moveTo(x, y + topCurveHeight);
        ctx.bezierCurveTo(x, y, x - size / 2, y, x - size / 2, y + topCurveHeight);
        ctx.bezierCurveTo(x - size / 2, y + (size + topCurveHeight) / 2, x, y + size, x, y + size);
        ctx.bezierCurveTo(x, y + size, x + size / 2, y + (size + topCurveHeight) / 2, x + size / 2, y + topCurveHeight);
        ctx.bezierCurveTo(x + size / 2, y, x, y, x, y + topCurveHeight);
        ctx.closePath();
        ctx.fill();
    }

    // Dibujar estrella
    drawStarShape(ctx, cx, cy, spikes, outerRadius, innerRadius) {
        let rot = Math.PI / 2 * 3;
        let x = cx;
        let y = cy;
        const step = Math.PI / spikes;

        ctx.beginPath();
        ctx.moveTo(cx, cy - outerRadius);
        for (let i = 0; i < spikes; i++) {
            x = cx + Math.cos(rot) * outerRadius;
            y = cy + Math.sin(rot) * outerRadius;
            ctx.lineTo(x, y);
            rot += step;

            x = cx + Math.cos(rot) * innerRadius;
            y = cy + Math.sin(rot) * innerRadius;
            ctx.lineTo(x, y);
            rot += step;
        }
        ctx.lineTo(cx, cy - outerRadius);
        ctx.closePath();
        ctx.fill();
    }

    clear() {
        this.particles = [];
    }
}

window.particles = new ParticleSystem();
