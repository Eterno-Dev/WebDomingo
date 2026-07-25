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
];

export const groupChallenges = [
  { id: 'gc1', type: 'Duelo de dibujo', text: 'Dibujad esto en vuestra servilleta o teléfono.', duration: '5 minutos', reward: 40, emoji: '🎨' },
  { id: 'gc2', type: 'Duelo de interpretación', text: 'Haced el mejor moonwalk posible.', duration: 'Inmediato', reward: 40, emoji: '🕺' },
  { id: 'gc3', type: 'Haz reír', text: 'Disponéis de un minuto para hacer reír al resto.', duration: '1 minuto', reward: 40, emoji: '😂' },
  { id: 'gc4', type: 'Foto creativa', text: 'En parejas haced la foto más original.', duration: '5 minutos', reward: 40, emoji: '📸' },
  { id: 'gc5', type: 'Predicción', text: 'Predice algo que va a pasar en los próximos 10 minutos.', duration: '10 minutos', reward: 40, emoji: '🔮' },
];

export const storeActions = [
  { id: 'a1', text: 'Cambiar la misión actual.', price: 30, type: 'change_mission', emoji: '🔄' },
  { id: 'a2', text: 'Saltarte una penalización activa.', price: 40, type: 'skip_penalty', emoji: '🛡️' },
  { id: 'a3', text: 'Ver la mano de misiones de otro.', price: 50, type: 'spy_missions', emoji: '👀' },
  { id: 'a4', text: 'Robar 10 monedas a otro.', price: 60, type: 'steal_coins', emoji: '🥷' },
  { id: 'a5', text: 'Bloquear la próxima compra de otro.', price: 70, type: 'block_store', emoji: '🚫' },
  { id: 'a6', text: 'Duplicar recompensa de tu misión.', price: 80, type: 'double_reward', emoji: 'x2' },
];

export const getRandomMission = () => {
  const randomIndex = Math.floor(Math.random() * secretMissions.length);
  return secretMissions[randomIndex];
};

export const getMultipleRandomMissions = (count = 3, existingMissions = []) => {
  const selected = [...existingMissions];
  const available = secretMissions.filter(m => !selected.find(sel => sel.id === m.id));
  
  while (selected.length < count && available.length > 0) {
    const randomIndex = Math.floor(Math.random() * available.length);
    selected.push(available[randomIndex]);
    available.splice(randomIndex, 1);
  }
  
  return selected;
};
