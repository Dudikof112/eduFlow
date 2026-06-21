const rateLimit = require("express-rate-limit");

// Ogólny limit zapytań — chroni API przed nadużyciami. Hojny, by nie utrudniać normalnej pracy.
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minut
  max: 1000,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "Zbyt wiele zapytań — spróbuj ponownie za chwilę." },
});

// Ostrzejszy limit dla logowania/rejestracji — utrudnia ataki na hasła metodą prób i błędów.
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "Zbyt wiele prób — spróbuj ponownie później." },
});

module.exports = { generalLimiter, authLimiter };
