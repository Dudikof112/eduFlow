// Przechowuje instancję socket.io, aby inne moduły (np. serwisy) mogły wysyłać
// zdarzenia na żywo bez tworzenia zależności cyklicznych. Ustawiana w socket.js.
let io = null;

module.exports = {
  setIO: (instance) => {
    io = instance;
  },
  getIO: () => io,
};
