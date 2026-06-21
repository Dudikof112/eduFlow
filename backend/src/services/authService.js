const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { User } = require("../models");

// POPRAWKA: dochodzi parametr "name".
// Model User ma name allowNull:false, więc bez tego rejestracja rzucała
// "notNull Violation: User.name cannot be null".
const register = async (name, email, password, role) => {
  const hash = await bcrypt.hash(password, 10);

  const user = await User.create({
    name,
    email,
    password: hash,
    role: role || "student",
  });

  // POPRAWKA: nie zwracamy hasła (nawet zahashowanego) na zewnątrz
  const { password: _omit, ...safeUser } = user.toJSON();
  return safeUser;
};

const login = async (email, password) => {
  const user = await User.findOne({ where: { email } });
  if (!user) throw new Error("User not found");

  const valid = await bcrypt.compare(password, user.password);
  if (!valid) throw new Error("Invalid password");

  const token = jwt.sign(
    { id: user.id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );

  // POPRAWKA: zwracamy usera bez hasła
  const { password: _omit, ...safeUser } = user.toJSON();
  return { token, user: safeUser };
};

// Funkcja zwraca dane konta (bez hasła) na podstawie identyfikatora użytkownika.
const getMe = async (userId) => {
  const user = await User.findByPk(userId, {
    attributes: { exclude: ["password"] },
  });
  if (!user) {
    const e = new Error("Nie znaleziono użytkownika");
    e.status = 404;
    throw e;
  }
  return user;
};

// Funkcja aktualizuje dane profilu (imię, e-mail). Pilnuje unikalności adresu e-mail.
const updateProfile = async (userId, { name, email }) => {
  const user = await User.findByPk(userId);
  if (!user) {
    const e = new Error("Nie znaleziono użytkownika");
    e.status = 404;
    throw e;
  }
  if (email !== undefined && email !== user.email) {
    const taken = await User.findOne({ where: { email } });
    if (taken) {
      const e = new Error("Ten adres e-mail jest już zajęty");
      e.status = 400;
      throw e;
    }
    user.email = email;
  }
  if (name !== undefined) user.name = name;
  await user.save();
  const { password: _omit, ...safe } = user.toJSON();
  return safe;
};

// Funkcja zmienia hasło użytkownika po weryfikacji bieżącego hasła.
const changePassword = async (userId, currentPassword, newPassword) => {
  if (!newPassword || newPassword.length < 6) {
    const e = new Error("Nowe hasło musi mieć co najmniej 6 znaków");
    e.status = 400;
    throw e;
  }
  const user = await User.findByPk(userId);
  if (!user) {
    const e = new Error("Nie znaleziono użytkownika");
    e.status = 404;
    throw e;
  }
  const valid = await bcrypt.compare(currentPassword || "", user.password);
  if (!valid) {
    const e = new Error("Bieżące hasło jest nieprawidłowe");
    e.status = 400;
    throw e;
  }
  user.password = await bcrypt.hash(newPassword, 10);
  await user.save();
  return { success: true };
};

module.exports = {
  register,
  login,
  getMe,
  updateProfile,
  changePassword,
};
