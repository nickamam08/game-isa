/**
 * quiz.js - Sistema de 5 niveles con dilemas abiertos e intriga para generar conversación y debate
 */

const ISA_LEVELS = [
    {
        level: 1,
        title: "Nivel 1: El Despertar en el Jardín",
        targetAltitude: 1200,
        skyTheme: 'morning',
        description: "Aprende los controles, disfruta del amanecer y recolecta tus primeros destellos.",
        difficulty: {
            platformWidthMin: 70,
            platformWidthMax: 90,
            gapMin: 50,
            gapMax: 80,
            movingSpeed: 1.2,
            hasStorms: false,
            hasWinds: false,
            hasMeteors: false
        },
        quiz: {
            tag: "🧪 El Dilema de la Verdad",
            question: "Si pudieras saber la verdad absoluta e incuestionable de UNA sola cosa (del universo, de la historia, de la vida o de alguien), ¿qué preguntarías y por qué?",
            quickIdeas: [
                "¿Qué hay después de la vida?",
                "¿Existe vida inteligente afuera?",
                "¿Qué pensó alguien en un momento clave?",
                "¿Cómo se originó todo?"
            ],
            placeholder: "Escribe tu respuesta aquí para debatirla..."
        }
    },
    {
        level: 2,
        title: "Nivel 2: Atardecer y Vientos Mágicos",
        targetAltitude: 2800,
        skyTheme: 'sunset',
        description: "El cielo se vuelve rosado. Cuidado con las plataformas móviles rápidas y las corrientes de aire.",
        difficulty: {
            platformWidthMin: 60,
            platformWidthMax: 78,
            gapMin: 60,
            gapMax: 95,
            movingSpeed: 1.8,
            hasStorms: false,
            hasWinds: true,
            hasMeteors: false
        },
        quiz: {
            tag: "🎭 La Gran Farsa Social",
            question: "¿Qué es algo que sientes que la gran mayoría de personas finge que le gusta o que disfruta, pero en el fondo sabes que nadie soporta?",
            quickIdeas: [
                "Ciertas fiestas ruidosas",
                "Reuniones de trabajo eternas",
                "Comidas 'aesthetic' que no saben a nada",
                "El networking forzado"
            ],
            placeholder: "Tu opinión sincera y sin filtros..."
        }
    },
    {
        level: 3,
        title: "Nivel 3: La Tormenta de los Retos",
        targetAltitude: 4800,
        skyTheme: 'storm',
        description: "¡Peligro! Esquiva las nubes de tormenta con rayos eléctricos y las plataformas quebradizas.",
        difficulty: {
            platformWidthMin: 52,
            platformWidthMax: 70,
            gapMin: 70,
            gapMax: 110,
            movingSpeed: 2.3,
            hasStorms: true,
            hasWinds: true,
            hasMeteors: false
        },
        quiz: {
            tag: "🌌 Vidas en el Multiverso",
            question: "Si existiera una versión tuya en un universo paralelo que tomó un rumbo completamente opuesto en un momento clave, ¿a qué crees que se estaría dedicando hoy?",
            quickIdeas: [
                "Viviendo en otro país remoto",
                "Dedicada a un arte o deporte loco",
                "Con una profesión totalmente distinta",
                "Siendo ermitaña en una montaña"
            ],
            placeholder: "¿Cómo imaginas a tu otro 'yo' paralelo?..."
        }
    },
    {
        level: 4,
        title: "Nivel 4: La Aurora de los Grandes Sueños",
        targetAltitude: 7200,
        skyTheme: 'aurora',
        description: "Entrando al cosmos. Esquiva fragmentos de meteoros y calcula tus saltos con precisión.",
        difficulty: {
            platformWidthMin: 46,
            platformWidthMax: 62,
            gapMin: 80,
            gapMax: 125,
            movingSpeed: 2.8,
            hasStorms: true,
            hasWinds: true,
            hasMeteors: true
        },
        quiz: {
            tag: "🔥 Debate de la Esencia Humana",
            question: "¿Crees que las personas realmente pueden cambiar su forma de ser y su esencia con los años, o simplemente aprenden a disimular y adaptarse mejor?",
            quickIdeas: [
                "La esencia nunca cambia, solo la fachada",
                "Los golpes de la vida sí te transforman",
                "Solo cambiamos por decisiones conscientes",
                "Depende de la madurez de cada quien"
            ],
            placeholder: "Defiende tu postura con un ejemplo..."
        }
    },
    {
        level: 5,
        title: "Nivel 5: La Cima: Constelación de Isa",
        targetAltitude: 10000,
        skyTheme: 'space',
        description: "¡El tramo legendario! El universo te espera con la gran cinemática final.",
        difficulty: {
            platformWidthMin: 42,
            platformWidthMax: 56,
            gapMin: 85,
            gapMax: 135,
            movingSpeed: 3.2,
            hasStorms: true,
            hasWinds: true,
            hasMeteors: true
        },
        quiz: {
            tag: "🗝️ La Opinión Impopular / Manía Oculta",
            question: "¿Cuál es una opinión impopular que tienes o una manía curiosa/extraña que casi nadie en este mundo sabe de ti?",
            quickIdeas: [
                "Una combinación de comida rara",
                "Un hábito que nadie entendería",
                "Una teoría propia sobre la vida",
                "Una fobia o gusto poco común"
            ],
            placeholder: "Confiesa tu secreto antes de la gran final..."
        }
    }
];

function getLevelData(levelNum) {
    return ISA_LEVELS[levelNum - 1] || ISA_LEVELS[0];
}
