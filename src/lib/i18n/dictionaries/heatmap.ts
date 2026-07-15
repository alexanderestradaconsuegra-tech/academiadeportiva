import type { Translations } from "@/lib/i18n/useT"

export const heatmap = {
  pageTitle: { es: "Mapa de Calor", en: "Heatmap", pt: "Mapa de Calor" },
  pageSubtitle: { es: "Zonas de la cancha donde el jugador estuvo presente, con GPS real", en: "Pitch zones where the player was present, using real GPS", pt: "Zonas do campo onde o jogador esteve presente, com GPS real" },

  calibStep1Label: { es: "Esquina 1 de 3", en: "Corner 1 of 3", pt: "Canto 1 de 3" },
  calibStep1Hint: { es: "Párate en la esquina de TU arco, lado izquierdo.", en: "Stand at the corner of YOUR goal, left side.", pt: "Fique no canto do SEU gol, lado esquerdo." },
  calibStep2Label: { es: "Esquina 2 de 3", en: "Corner 2 of 3", pt: "Canto 2 de 3" },
  calibStep2Hint: { es: "Ahora ve a la esquina de TU arco, lado derecho.", en: "Now go to the corner of YOUR goal, right side.", pt: "Agora vá até o canto do SEU gol, lado direito." },
  calibStep3Label: { es: "Esquina 3 de 3", en: "Corner 3 of 3", pt: "Canto 3 de 3" },
  calibStep3Hint: { es: "Por último, ve a la esquina del arco RIVAL, lado izquierdo.", en: "Finally, go to the corner of the RIVAL goal, left side.", pt: "Por fim, vá até o canto do gol RIVAL, lado esquerdo." },

  infoBanner: {
    es: "Esta función usa GPS real: un reloj inteligente, el celular del jugador o una pechera/chaleco GPS deportivo. Si no tienen ningún dispositivo con GPS, esta función no se puede usar todavía. Primero calibra tu cancha una sola vez (marcando 3 esquinas), y luego puedes grabar en vivo (abriendo esta página desde el dispositivo con GPS durante el entrenamiento) o importar el archivo (GPX o CSV) que el reloj o la pechera exportan después de la sesión.",
    en: "This feature uses real GPS: a smartwatch, the player's phone, or a sports GPS vest/strap. If they don't have any GPS device, this feature can't be used yet. First calibrate your pitch once (marking 3 corners), then you can record live (opening this page from the GPS device during training) or import the file (GPX or CSV) that the watch or vest exports after the session.",
    pt: "Esse recurso usa GPS real: um relógio inteligente, o celular do jogador ou um colete/cinta GPS esportiva. Se eles não tiverem nenhum dispositivo com GPS, esse recurso ainda não pode ser usado. Primeiro calibre seu campo uma única vez (marcando 3 cantos) e depois você pode gravar em tempo real (abrindo esta página no dispositivo com GPS durante o treino) ou importar o arquivo (GPX ou CSV) que o relógio ou o colete exportam após a sessão.",
  },
  recordLiveBold: { es: "grabar en vivo", en: "record live", pt: "gravar em tempo real" },
  importFileBold: { es: "importar el archivo", en: "import the file", pt: "importar o arquivo" },

  courtCalibratedGps: { es: "Cancha calibrada con GPS", en: "Pitch calibrated with GPS", pt: "Campo calibrado com GPS" },
  courtNotCalibrated: { es: "Tu cancha aún no está calibrada", en: "Your pitch isn't calibrated yet", pt: "Seu campo ainda não está calibrado" },
  recalibrate: { es: "Recalibrar", en: "Recalibrate", pt: "Recalibrar" },
  calibrateCourtGps: { es: "Calibrar cancha con GPS", en: "Calibrate pitch with GPS", pt: "Calibrar campo com GPS" },
  markThisCorner: { es: "Marcar esta esquina", en: "Mark this corner", pt: "Marcar este canto" },
  cancel: { es: "Cancelar", en: "Cancel", pt: "Cancelar" },
  geolocationNotAvailable: { es: "Este navegador no tiene GPS disponible.", en: "This browser doesn't have GPS available.", pt: "Este navegador não tem GPS disponível." },
  couldNotGetGpsLocation: { es: "No se pudo obtener tu ubicación GPS: ", en: "Could not get your GPS location: ", pt: "Não foi possível obter sua localização GPS: " },

  selectPlayerPlaceholder: { es: "Selecciona un jugador", en: "Select a player", pt: "Selecione um jogador" },
  sessionNamePlaceholder: { es: "Nombre de la sesión (ej: vs Rival FC)", en: "Session name (e.g.: vs Rival FC)", pt: "Nome da sessão (ex: vs Rival FC)" },
  stopRecording: { es: "Detener grabación", en: "Stop recording", pt: "Parar gravação" },
  recordGpsLive: { es: "Grabar GPS en vivo", en: "Record GPS live", pt: "Gravar GPS em tempo real" },
  importFileGpxCsv: { es: "Importar archivo (GPX/CSV)", en: "Import file (GPX/CSV)", pt: "Importar arquivo (GPX/CSV)" },

  calibrateBeforeHint: { es: "Calibra la cancha con GPS arriba antes de grabar o importar.", en: "Calibrate the pitch with GPS above before recording or importing.", pt: "Calibre o campo com GPS acima antes de gravar ou importar." },
  importedPointsBefore: { es: "Se importaron", en: "Imported", pt: "Foram importados" },
  importedPointsAfter: { es: "puntos GPS.", en: "GPS points.", pt: "pontos GPS." },
  recordingLiveHint: { es: "Grabando posición GPS en vivo. Llévate este dispositivo durante el entrenamiento o partido.", en: "Recording live GPS position. Take this device with you during training or the match.", pt: "Gravando posição GPS em tempo real. Leve este dispositivo durante o treino ou a partida." },
  chooseSessionHint: { es: "Elige un jugador y escribe el nombre de la sesión (ej: el partido de hoy) para grabar en vivo o importar un archivo del dispositivo GPS.", en: "Choose a player and enter the session name (e.g., today's match) to record live or import a file from the GPS device.", pt: "Escolha um jogador e digite o nome da sessão (ex: o jogo de hoje) para gravar em tempo real ou importar um arquivo do dispositivo GPS." },

  thirdOwn: { es: "Tercio propio", en: "Own third", pt: "Terço próprio" },
  midfield: { es: "Mediocampo", en: "Midfield", pt: "Meio-campo" },
  thirdRival: { es: "Tercio rival", en: "Rival third", pt: "Terço rival" },

  savedSessions: { es: "Sesiones guardadas", en: "Saved sessions", pt: "Sessões salvas" },
  noHeatmapSessionsYet: { es: "Este jugador todavía no tiene sesiones de mapa de calor.", en: "This player doesn't have any heatmap sessions yet.", pt: "Este jogador ainda não tem sessões de mapa de calor." },
  points: { es: "puntos", en: "points", pt: "pontos" },
  view: { es: "Ver", en: "View", pt: "Ver" },

  choosePlayerAndNameFirst: { es: "Elige un jugador y escribe el nombre de la sesión antes de importar.", en: "Choose a player and enter the session name before importing.", pt: "Escolha um jogador e digite o nome da sessão antes de importar." },
  calibrateFirst: { es: "Primero calibra la cancha con GPS.", en: "First calibrate the pitch with GPS.", pt: "Primeiro calibre o campo com GPS." },
  noGpsPointsFound: { es: "No se encontraron puntos GPS en ese archivo.", en: "No GPS points were found in that file.", pt: "Nenhum ponto GPS foi encontrado nesse arquivo." },
  couldNotReadFile: { es: "No se pudo leer ese archivo.", en: "Could not read that file.", pt: "Não foi possível ler esse arquivo." },
  gpsErrorPrefix: { es: "Error de GPS: ", en: "GPS error: ", pt: "Erro de GPS: " },

  confirmDeleteSessionBefore: { es: "¿Eliminar la sesión", en: "Delete session", pt: "Excluir a sessão" },
  confirmDeleteSessionAfter: { es: "? Se borrarán todos sus puntos.", en: "? All its points will be deleted.", pt: "? Todos os seus pontos serão excluídos." },
} satisfies Translations
