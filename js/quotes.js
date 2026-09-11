/**
 * quotes.js - Mensajes, cumplidos y carta personalizada para Isa ("La Pulguita")
 */

const ISA_QUOTES = {
    // Cumplidos de Belleza (al recoger flores, coronitas o gemas rosas)
    beauty: [
        "¡Esa sonrisa tuya ilumina hasta el día más nublado! ✨",
        "Puro porte, elegancia y un encanto que no tiene comparación 🌸",
        "Dicen que el arte está en los museos, pero claramente no te han visto a ti 💖",
        "Hermosa por fuera y aún más increíble por dentro 🌟",
        "¡Una pulguita con una presencia que enamora a cualquiera! 🥰",
        "Tu mirada tiene más magia y brillo que todas las estrellas juntas ✨",
        "¡Esa vibra tan bonita y única que solo tú transmites! 💫",
        "Definición gráfica de perfección: Isa sonriendo 🌺",
        "Ese estilazo y esa gracia natural que te caracterizan 💅✨",
        "Un monumento de mujer, por donde se mire 🌷"
    ],

    // Cumplidos de Inteligencia (al recoger libros, bombillos o gemas azules)
    intelligence: [
        "¡Mente brillante en acción! Nada se te escapa 🧠💡",
        "Inteligente, analítica y siempre tres pasos adelante 🎯",
        "Tu ingenio y tu capacidad de resolver lo que sea es admirable 📚✨",
        "No solo eres hermosa: ¡tienes una cabeza brillante que deslumbra! 💡",
        "Cada desafío que se te presenta lo transformas en una solución genial 🌟",
        "Astuta, curiosa, creativa y con criterio de sobra 💎",
        "Esa agudeza mental tuya es de otro planeta 🪐✨",
        "Aprender de ti y escucharte hablar es todo un privilegio 📖💖",
        "Estrategia, disciplina y genialidad pura 🚀"
    ],

    // Cumplidos de Potencial, Metas y Capacidad (al recoger cohetes o estrellas doradas)
    potential: [
        "¡Vas a llegar lejísimos! El mundo te queda chiquito 🌍✨",
        "Cada meta que te propones la vas a conquistar con creces 🏆",
        "Naciste para cosas gigantescas, pulga imparable 🚀",
        "Tu potencial no tiene límites, nunca lo olvides 🌠",
        "Cualquier sueño que tengas está destinado a hacerse realidad con tu fuerza 💪💖",
        "Pequeña de apodo, pero GIGANTE en talento y determinación 👑",
        "No hay montaña demasiado alta para ti cuando decides subirla 🏔️✨",
        "El futuro tiene tu nombre escrito en letras doradas ✨",
        "Tu disciplina y pasión te llevarán a la cima de todo lo que sueñes 🌟"
    ],

    // Mensajes de Hitos de Altura
    milestones: {
        1000: {
            title: "🌤️ ¡Nivel 1 Superado: Dejando huella!",
            subtitle: "1,000 metros de altura",
            message: "Apenas estás calentando motores y ya dejas a todos maravillados con tu carisma y tu energía."
        },
        2000: {
            title: "🌇 ¡Nivel 2 Superado: Entre las Nubes Rosadas!",
            subtitle: "2,000 metros de altura",
            message: "Tu inteligencia y tu constancia te hacen destacar donde sea que vayas. ¡Eres imparable, pulga!"
        },
        3000: {
            title: "🌌 ¡Nivel 3 Superado: Cruzando la Estratosfera!",
            subtitle: "3,000 metros de altura",
            message: "Nada en este mundo te queda grande. Cuando te enfocas en algo, el universo conspira a tu favor."
        },
        4000: {
            title: "👑 ¡NIVEL FINAL: La Constelación de Isa!",
            subtitle: "¡Has alcanzado la cima del universo!",
            message: "¡Llegaste a las estrellas, el lugar al que perteneces!"
        }
    },

    // Carta final sorpresa al llegar a la cima
    finalLetter: {
        recipient: "Para la pulguita más increíble del universo (Isa) ✨",
        paragraphs: [
            "Si llegaste hasta aquí, no es casualidad: es solo una pequeña muestra interactiva de lo que eres capaz de lograr cuando te lo propones.",
            "Quise crear este detalle para ti porque no me canso de admirar lo hermosa que eres en cada detalle, esa sonrisa que desarma a cualquiera y esa presencia tan única que tienes.",
            "Pero más allá de lo increíblemente linda que eres por fuera, me fascina tu inteligencia, tu astucia, tus ganas de superarte y esa chispa tan brillante que llevas dentro.",
            "Nunca dudes de tu capacidad, de tu talento ni del futuro brillante que estás construyendo. Para mí ya estás en la cima, brillando con luz propia.",
            "¡Sigue conquistando el mundo, pulga hermosa! 💖🚀"
        ],
        signature: "Con mucho cariño y admiración sincera ✨"
    }
};

// Función auxiliar para obtener un cumplido aleatorio por tipo
function getRandomQuote(category) {
    const list = ISA_QUOTES[category] || ISA_QUOTES.beauty;
    return list[Math.floor(Math.random() * list.length)];
}
