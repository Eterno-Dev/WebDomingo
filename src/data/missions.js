export const secretMissions = [
  // Conversación
  { id: 'm1', text: 'Haz que alguien mencione su comida favorita.', category: 'Conversación', points: 15, penalty: 'Solo puedes hablar de comida basura.', duration: '30 minutos' },
  { id: 'm2', text: 'Saca el tema del horóscopo sin que parezca forzado.', category: 'Conversación', points: 10, penalty: 'Pregunta a todos su signo al hablarles.', duration: 'Toda la noche' },
  { id: 'm3', text: 'Convence a alguien de que viste un ovni de pequeño.', category: 'Conversación', points: 20, penalty: 'Añade "la verdad está ahí fuera" al final de tus frases.', duration: '10 minutos' },
  { id: 'm4', text: 'Pregúntale a alguien por su peor cita.', category: 'Conversación', points: 15, penalty: 'Habla como si fueras un presentador de talk show.', duration: '15 minutos' },
  { id: 'm5', text: 'Usa la palabra "espectacular" 3 veces en la misma charla.', category: 'Conversación', points: 15, penalty: 'Di "¡Espectacular!" cada vez que alguien beba.', duration: '20 minutos' },

  // Creatividad
  { id: 'm6', text: 'Ponle un apodo nuevo a alguien y haz que otro lo repita.', category: 'Creatividad', points: 25, penalty: 'Todos te tienen que llamar por un apodo ridículo.', duration: 'Toda la noche' },
  { id: 'm7', text: 'Inventa una excusa absurda para ir al baño.', category: 'Creatividad', points: 15, penalty: 'Debes ir al baño saltando a la pata coja.', duration: 'La próxima vez que vayas' },
  { id: 'm8', text: 'Cuenta una anécdota falsa y haz que te crean.', category: 'Creatividad', points: 30, penalty: 'Añade "pero me lo acabo de inventar" después de cada cosa seria que digas.', duration: '15 minutos' },
  { id: 'm9', text: 'Brinda por un motivo ridículo.', category: 'Creatividad', points: 15, penalty: 'No puedes beber sin brindar primero.', duration: '30 minutos' },
  { id: 'm10', text: 'Dibuja algo pequeño en una servilleta y regálaselo a alguien.', category: 'Creatividad', points: 20, penalty: 'Dibuja un bigote en tu propia servilleta y póntelo al hablar.', duration: '10 minutos' },

  // Disimulo
  { id: 'm11', text: 'Róbale sutilmente un trozo de comida a otro plato.', category: 'Disimulo', points: 30, penalty: 'Debes pedir permiso para coger comida de tu propio plato.', duration: '20 minutos' },
  { id: 'm12', text: 'Cambia de sitio un objeto de la mesa sin que lo noten.', category: 'Disimulo', points: 20, penalty: 'No puedes usar las manos para señalar, solo la cabeza.', duration: '30 minutos' },
  { id: 'm13', text: 'Imita el gesto típico de otro jugador mientras hablas con él.', category: 'Disimulo', points: 25, penalty: 'Tienes que mantener los brazos cruzados todo el rato.', duration: '15 minutos' },
  { id: 'm14', text: 'Finge que te llaman al móvil y sal de la habitación.', category: 'Disimulo', points: 20, penalty: 'Cada vez que alguien use el móvil, di "Ring Ring".', duration: 'Toda la noche' },
  { id: 'm15', text: 'Ponte una servilleta en la cabeza hasta que alguien te diga algo.', category: 'Disimulo', points: 30, penalty: 'Lleva la servilleta en el hombro como un loro.', duration: '30 minutos' },

  // Humor
  { id: 'm16', text: 'Cuenta un chiste malísimo y sé el único que se ría.', category: 'Humor', points: 25, penalty: 'Tienes que reírte en voz muy alta cada vez que alguien tosa.', duration: 'Toda la noche' },
  { id: 'm17', text: 'Haz un comentario fuera de lugar y ríete solo.', category: 'Humor', points: 20, penalty: 'No puedes usar expresiones faciales (cara de póker).', duration: '10 minutos' },
  { id: 'm18', text: 'Llama a alguien por el nombre equivocado aposta.', category: 'Humor', points: 20, penalty: 'Todos te van a llamar "Osito Gominola".', duration: 'Toda la noche' },
  { id: 'm19', text: 'Habla con acento pijo/surfero durante 1 minuto.', category: 'Humor', points: 25, penalty: 'Habla como un robot.', duration: '10 minutos' },
  { id: 'm20', text: 'Canta tu respuesta a una pregunta normal.', category: 'Humor', points: 30, penalty: 'Solo puedes comunicarte cantando.', duration: '5 minutos' },

  // Interacción
  { id: 'm21', text: 'Choca los cinco con alguien sin venir a cuento.', category: 'Interacción', points: 15, penalty: 'Tienes que chocar los cinco contigo mismo tras cada frase.', duration: '15 minutos' },
  { id: 'm22', text: 'Haz que alguien te sirva bebida.', category: 'Interacción', points: 20, penalty: 'Sirve la bebida de todos como si fueras un mayordomo elegante.', duration: 'Toda la noche' },
  { id: 'm23', text: 'Saca a alguien a bailar durante 10 segundos.', category: 'Interacción', points: 25, penalty: 'Debes permanecer de pie mientras los demás están sentados.', duration: '15 minutos' },
  { id: 'm24', text: 'Consigue que alguien te haga una foto.', category: 'Interacción', points: 15, penalty: 'Haz poses de modelo exageradas cuando alguien te hable.', duration: '10 minutos' },
  { id: 'm25', text: 'Hazle un masaje en los hombros a alguien de repente.', category: 'Interacción', points: 20, penalty: 'Mantén una postura encorvada (como el jorobado).', duration: '15 minutos' },

  // Nuevas Misiones - Tanda 2
  { id: 'm26', text: 'Inicia un aplauso sin razón y haz que al menos uno te siga.', category: 'Interacción', points: 25, penalty: 'Tienes que aplaudir cada vez que hables.', duration: '10 minutos' },
  { id: 'm27', text: 'Pregúntale a alguien cuál es su dinosaurio favorito.', category: 'Conversación', points: 10, penalty: 'Camina haciendo pasos gigantes de T-Rex.', duration: '20 minutos' },
  { id: 'm28', text: 'Habla de una película inventada como si fuera un peliculón.', category: 'Creatividad', points: 20, penalty: 'Critica todo lo que dicen los demás como si fueras juez de Masterchef.', duration: '15 minutos' },
  { id: 'm29', text: 'Acércate a alguien y dile "sé lo que hiciste" y vete.', category: 'Disimulo', points: 30, penalty: 'Camina siempre de espaldas.', duration: '10 minutos' },
  { id: 'm30', text: 'Haz un brindis por un objeto inanimado (ej: esta cuchara).', category: 'Humor', points: 15, penalty: 'No puedes usar cubiertos, come con las manos (si es posible).', duration: 'Próxima comida' },
  { id: 'm31', text: 'Grita "¡Olé!" cuando alguien tire o se le caiga algo.', category: 'Interacción', points: 20, penalty: 'Habla como si estuvieras narrando un partido de fútbol.', duration: '15 minutos' },
  { id: 'm32', text: 'Ponte una prenda de otro sin que se dé cuenta.', category: 'Disimulo', points: 40, penalty: 'Lleva una chaqueta al revés.', duration: '30 minutos' },
  { id: 'm33', text: 'Comienza una frase con "En mis tiempos..." 3 veces.', category: 'Conversación', points: 15, penalty: 'Habla muy lento como si fueras un anciano cansado.', duration: '15 minutos' },
  { id: 'm34', text: 'Haz beatbox mientras otro habla.', category: 'Humor', points: 20, penalty: 'Tienes que terminar todas tus frases con un sonido de batería ("badum tss").', duration: '10 minutos' },
  { id: 'm35', text: 'Inventa un saludo secreto (choque de manos) con alguien.', category: 'Creatividad', points: 20, penalty: 'Saluda militarmente a todos los que te hablen.', duration: '20 minutos' },
  { id: 'm36', text: 'Pregunta si alguien ha visto tu mascota invisible.', category: 'Conversación', points: 15, penalty: 'Acaricia a tu perro invisible mientras hablas.', duration: '10 minutos' },
  { id: 'm37', text: 'Bosteza muy exageradamente hasta que otro bostece.', category: 'Disimulo', points: 25, penalty: 'Tienes que estar tumbado o recostado en el sofá/silla.', duration: '15 minutos' },
  { id: 'm38', text: 'Llama a alguien "Bro" o "Jefe" 5 veces seguidas.', category: 'Humor', points: 15, penalty: 'Habla con acento de gánster de los años 20.', duration: '15 minutos' },
  { id: 'm39', text: 'Roba un vaso y esconde su contenido.', category: 'Disimulo', points: 30, penalty: 'Solo puedes beber si alguien te da permiso.', duration: '20 minutos' },
  { id: 'm40', text: 'Haz de DJ y cambia la música sin avisar.', category: 'Interacción', points: 20, penalty: 'Baila constantemente, aunque estés sentado.', duration: '10 minutos' },
  { id: 'm41', text: 'Hazte un selfie con 3 personas distraídas al fondo.', category: 'Creatividad', points: 25, penalty: 'Tienes que salir haciendo una mueca fea en todas las fotos.', duration: 'Toda la noche' },
  { id: 'm42', text: 'Pide a alguien que te lea las manos o tu futuro.', category: 'Conversación', points: 15, penalty: 'Actúa como si predijeras tragedias todo el rato.', duration: '15 minutos' },
  { id: 'm43', text: 'Dale un cumplido a alguien sobre sus orejas/nariz.', category: 'Interacción', points: 15, penalty: 'Cúbrete una oreja con la mano mientras hablas.', duration: '10 minutos' },
  { id: 'm44', text: 'Finge tropezarte de forma muy dramática.', category: 'Humor', points: 25, penalty: 'Camina arrastrando una pierna.', duration: '20 minutos' },
  { id: 'm45', text: 'Quédate mirando fijamente un punto vacío hasta que te pregunten.', category: 'Disimulo', points: 20, penalty: 'Mantén los ojos muy abiertos sin pestañear (lo máximo posible).', duration: '5 minutos' },
  { id: 'm46', text: 'Habla de una criptomoneda falsa ("El Cuñi-Coin").', category: 'Conversación', points: 20, penalty: 'Termina las frases diciendo "mentalidad de tiburón".', duration: '10 minutos' },
  { id: 'm47', text: 'Haz que dos personas choquen sus vasos.', category: 'Interacción', points: 20, penalty: 'Bebe un trago de agua cada vez que alguien diga tu nombre.', duration: '30 minutos' },
  { id: 'm48', text: 'Dobla una servilleta en un origami rápido.', category: 'Creatividad', points: 15, penalty: 'Habla con voz de Mickey Mouse.', duration: '5 minutos' },
  { id: 'm49', text: 'Pregunta si huele a quemado.', category: 'Disimulo', points: 10, penalty: 'Tápate la nariz con dos dedos al hablar.', duration: '10 minutos' },
  { id: 'm50', text: 'Canta el estribillo de una canción antigua de la nada.', category: 'Humor', points: 25, penalty: 'Habla solo susurrando.', duration: '15 minutos' },

  // Nuevas Misiones - Tanda 3
  { id: 'm51', text: 'Inventa una excusa falsa para mirar debajo de la mesa.', category: 'Disimulo', points: 15, penalty: 'Debes hablar como si estuvieras masticando algo enorme.', duration: '15 minutos' },
  { id: 'm52', text: 'Hazle una rima a alguien sin que se dé cuenta.', category: 'Creatividad', points: 20, penalty: 'Habla siempre en tono de interrogación.', duration: '10 minutos' },
  { id: 'm53', text: 'Intenta chocar los cinco, y cuando te respondan, apártala (¡te engañé!).', category: 'Interacción', points: 25, penalty: 'Tienes que mantener un ojo cerrado como un pirata.', duration: '20 minutos' },
  { id: 'm54', text: 'Di que te duele mucho el codo izquierdo de la nada.', category: 'Conversación', points: 15, penalty: 'Mantén las manos en los bolsillos todo el tiempo.', duration: '30 minutos' },
  { id: 'm55', text: 'Haz un estiramiento exagerado de brazos y piernas en medio del grupo.', category: 'Disimulo', points: 20, penalty: 'Tienes que estar sentado en el suelo, no en silla.', duration: '15 minutos' },
  { id: 'm56', text: 'Habla del clima como si fuera la noticia del siglo.', category: 'Humor', points: 15, penalty: 'Acaba todas tus frases suspirando exageradamente.', duration: '10 minutos' },
  { id: 'm57', text: 'Finge tener un calambre en el pie.', category: 'Interacción', points: 25, penalty: 'Da dos saltitos cada vez que te levantes.', duration: '30 minutos' },
  { id: 'm58', text: 'Pregúntale a alguien si sabe qué hora es en Japón.', category: 'Conversación', points: 10, penalty: 'Habla con voz muy, muy aguda.', duration: '5 minutos' },
  { id: 'm59', text: 'Haz que te pasen la sal o el agua y agradécelo haciendo una reverencia.', category: 'Creatividad', points: 20, penalty: 'Solo puedes hablar usando palabras sin "E".', duration: '5 minutos' },
  { id: 'm60', text: 'Dile a alguien que tiene algo en el pelo y haz que se lo quite.', category: 'Disimulo', points: 30, penalty: 'Ponte la ropa del revés o con la etiqueta por fuera.', duration: '30 minutos' },
  { id: 'm61', text: 'Ríe histéricamente de algo que no tiene gracia.', category: 'Humor', points: 25, penalty: 'Cruza los dedos de las manos siempre que hables.', duration: '15 minutos' },
  { id: 'm62', text: 'Llama a alguien por un nombre de un famoso (ej. "¡Oye, Brad Pitt!").', category: 'Interacción', points: 15, penalty: 'Tienes que actuar como si estuvieras siendo entrevistado.', duration: '20 minutos' }
];

export const groupChallenges = [
  { id: 'gc1', type: 'Duelo de dibujo', text: 'Dibujad esto en vuestra servilleta o teléfono.', duration: '5 minutos', reward: 40, emoji: '🎨' },
  { id: 'gc2', type: 'Duelo de interpretación', text: 'Haced el mejor moonwalk posible.', duration: 'Inmediato', reward: 40, emoji: '🕺' },
  { id: 'gc3', type: 'Haz reír', text: 'Disponéis de un minuto para hacer reír al resto.', duration: '1 minuto', reward: 40, emoji: '😂' },
  { id: 'gc4', type: 'Foto creativa', text: 'En parejas haced la foto más original.', duration: '5 minutos', reward: 40, emoji: '📸' },
  { id: 'gc5', type: 'Predicción', text: 'Predice algo que va a pasar en los próximos 10 minutos.', duration: '10 minutos', reward: 40, emoji: '🔮' },
];

export const storeActions = [
  { id: 'a1', text: 'Cambiar la misión actual.', desc: 'La misión actual se intercambiará por otra aleatoria nueva.', price: 10, type: 'change_mission', emoji: '🔄' },
  { id: 'a2', text: 'Saltarte una penalización activa.', desc: 'Selecciona una de tus penalizaciones actuales y descártala.', price: 30, type: 'skip_penalty', emoji: '🛡️' },
  { id: 'a3', text: 'Robar 10 monedas a otro jugador.', desc: 'Elige a un rival. Le quitas 10 monedas y te las sumas.', price: 20, type: 'steal_coins', emoji: '🥷' },
  { id: 'a4', text: 'Comprar una misión extra.', desc: 'Añade una misión más a tu mano para tener más opciones.', price: 30, type: 'buy_mission', emoji: '🃏' },
  { id: 'a5', text: 'Duplicar recompensa de tu misión.', desc: 'La misión actual multiplicará permanentemente sus puntos por 2.', price: 30, type: 'double_reward', emoji: 'x2' },
  { id: 'a6', text: 'Bomba secreta.', desc: 'La próxima persona que complete un reto perderá 2 puntos de reto.', price: 50, type: 'secret_bomb', emoji: '💣' },
  { id: 'a7', text: 'Robar 1 reto a otro jugador.', desc: 'Le restas 1 reto completado a un rival en la carrera y te lo sumas.', price: 80, type: 'steal_reto', emoji: '🏃‍♂️' },
  { id: 'a8', text: 'Intercambiar cantidad de retos con otro.', desc: 'Cambia todos tus retos completados por los de otro jugador.', price: 120, type: 'swap_retos', emoji: '🎭' },
  { id: 'a9', text: 'Comprar 1 punto de reto.', desc: 'Avanza 1 casilla en la carrera de retos mágicamente.', price: 50, type: 'buy_reto', emoji: '⭐' },
  { id: 'a10', text: 'Aplicar castigo a otro jugador', desc: 'Selecciona una víctima y métele un castigo aleatorio.', price: 40, type: 'curse_player', emoji: '⚡' },
  { id: 'a11', text: 'Iniciar Evento Aleatorio', desc: 'Fuerza un evento. Si tu equipo gana, consigues el doble de recompensa.', price: 40, type: 'trigger_event', emoji: '⚔️' },
];

export const teamChallenges = [
  "A ver quién hace la mejor coreografía con la canción de Superestrella.",
  "Batalla de gallos: improvisad un rap insultando amistosamente al otro equipo.",
  "Carrera de caballitos (uno a caballito del otro). El primero en llegar al objetivo establecido gana.",
  "El equipo que consiga meter más bolitas de papel en un vaso desde 2 metros en 1 minuto.",
  "Haceros pasar por un personaje famoso o de Disney: un jugador hace la voz estando escondido/de espaldas, y el otro actúa. El mejor dúo gana.",
  "Debate absurdo: Escoged un tema ridículo (ej: ¿Es mejor sudar mayonesa o llorar kétchup?). Tenéis 2 minutos para defender vuestra postura apasionadamente.",
  "Escena de telenovela: Tenéis 2 minutos para improvisar la escena de telenovela más dramática posible. Debe incluir una traición absurda y un desmayo.",
  "El equipo que consiga construir la estructura más alta y estable usando objetos de la sala (zapatos, libros, cojines...) en 2 minutos.",
  "Desfile de moda a ciegas: Un jugador cierra los ojos y su compañero tiene 1 minuto para disfrazarlo con lo que encuentre. Luego debe hacer un desfile épico.",
  "El monstruo de dos cabezas: Los dos del equipo se abrazan por la cintura. Uno usa solo el brazo izquierdo y el otro el derecho. Deben preparar un vaso de agua y bebérselo como si fueran una sola persona."
];

export const getRandomMission = () => {
  const randomIndex = Math.floor(Math.random() * secretMissions.length);
  return secretMissions[randomIndex];
};

export const getMultipleRandomMissions = (countToAdd = 3, existingMissions = []) => {
  const newMissions = [];
  const available = secretMissions.filter(m => !existingMissions.find(sel => sel.id === m.id));
  
  while (newMissions.length < countToAdd && available.length > 0) {
    const randomIndex = Math.floor(Math.random() * available.length);
    newMissions.push(available[randomIndex]);
    available.splice(randomIndex, 1);
  }
  
  return newMissions;
};
