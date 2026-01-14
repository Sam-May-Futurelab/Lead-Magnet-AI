import confetti from 'canvas-confetti';

/**
 * Trigger celebration confetti animation
 * Based on Inkfluence's celebration effect
 */
export function triggerCelebration() {
    const duration = 3000;
    const animationEnd = Date.now() + duration;
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 9999 };

    function randomInRange(min: number, max: number) {
        return Math.random() * (max - min) + min;
    }

    const interval = setInterval(function () {
        const timeLeft = animationEnd - Date.now();

        if (timeLeft <= 0) {
            return clearInterval(interval);
        }

        const particleCount = 50 * (timeLeft / duration);

        // Fire from left and right
        confetti({
            ...defaults,
            particleCount,
            origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 },
            colors: ['#8B5CF6', '#A78BFA', '#C4B5FD', '#DDD6FE', '#7C3AED'],
        });
        confetti({
            ...defaults,
            particleCount,
            origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 },
            colors: ['#8B5CF6', '#A78BFA', '#C4B5FD', '#DDD6FE', '#7C3AED'],
        });
    }, 250);
}

/**
 * Quick burst of confetti from center
 */
export function triggerConfettiBurst() {
    confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#8B5CF6', '#A78BFA', '#C4B5FD', '#10B981', '#F59E0B'],
        zIndex: 9999,
    });
}

/**
 * Star-shaped celebration
 */
export function triggerStarCelebration() {
    const defaults = {
        spread: 360,
        ticks: 50,
        gravity: 0,
        decay: 0.94,
        startVelocity: 30,
        shapes: ['star'] as confetti.Shape[],
        colors: ['#8B5CF6', '#A78BFA', '#C4B5FD', '#FFD700'],
        zIndex: 9999,
    };

    function shoot() {
        confetti({
            ...defaults,
            particleCount: 40,
            scalar: 1.2,
            shapes: ['star'] as confetti.Shape[],
        });

        confetti({
            ...defaults,
            particleCount: 10,
            scalar: 0.75,
            shapes: ['circle'] as confetti.Shape[],
        });
    }

    setTimeout(shoot, 0);
    setTimeout(shoot, 100);
    setTimeout(shoot, 200);
}
