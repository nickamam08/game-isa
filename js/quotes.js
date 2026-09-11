/**
 * quotes.js - Mensajes, cumplidos y carta inspiradora de esfuerzo y futuro para Isa
 */

const ISA_QUOTES = {
    // Cumplidos de Belleza y Porte
    beauty: [
        "Esa elegancia y esa presencia tan única que tienes 🌸",
        "Una sonrisa genuina que transmite una vibra increíble ✨",
        "Ese estilo natural y esa gracia que te distinguen 💫",
        "Hermosa en cada detalle y con un encanto único 🌷",
        "Una presencia magnética que resalta donde sea 🥰"
    ],

    // Cumplidos de Inteligencia y Astucia
    intelligence: [
        "¡Mente brillante en acción! Estrategia pura 🧠💡",
        "Inteligente, analítica y siempre un paso adelante 🎯",
        "Esa capacidad que tienes de resolver lo que sea es admirable 📚✨",
        "Criterio, agudeza mental y pensamiento rápido 💡",
        "Astuta, curiosa y con una visión genial 💎"
    ],

    // Cumplidos de Dedicación, Responsabilidad y Metas
    potential: [
        "La disciplina y la constancia siempre dan frutos 🏆",
        "Cada día de esfuerzo te acerca a metas gigantescas 🚀",
        "Responsable, dedicada y con un futuro brillante por delante 🌠",
        "No hay reto demasiado grande para una mente enfocada 💪✨",
        "Tu determinación es tu mayor superpoder 👑"
    ],

    // Carta final inspiradora y motivacional
    finalLetter: {
        recipient: "Para una mujer verdaderamente admirable (Isa) ✨",
        paragraphs: [
            "Quiero aprovechar este momento para recordarte algo fundamental que nunca debes olvidar: cada día, cada hora y cada paso que das esforzándote, estudiando y trabajando no es en vano.",
            "Todo ese esfuerzo constante, esas desveladas y esa disciplina que demuestras a diario están sembrando las bases de un camino extraordinario, y muy pronto verás cómo cada sacrificio dará frutos gigantescos.",
            "Eres una mujer no solo sumamente linda por fuera, sino con una inteligencia brillante, una responsabilidad intachable y una dedicación digna de admirar.",
            "Nunca dejes de ser esa persona soñadora y enfocada. Tienes todo el talento, la resiliencia y la capacidad para conquistar cualquier meta que te propongas en la vida.",
            "¡Sigue adelante con la frente en alto y con paso firme, porque el futuro te tiene preparadas cosas increíbles! 🌟🚀"
        ],
        signature: "Con mucho respeto, cariño y admiración sincera ✨"
    }
};

function getRandomQuote(category) {
    const list = ISA_QUOTES[category] || ISA_QUOTES.potential;
    return list[Math.floor(Math.random() * list.length)];
}
