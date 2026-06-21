const service = require("../services/authService");

const register = async (req, res) => {
  try {
    // POPRAWKA: czytamy też req.body.name (wcześniej był pomijany)
    const user = await service.register(
      req.body.name,
      req.body.email,
      req.body.password,
      req.body.role
    );

    res.status(201).json(user);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

const login = async (req, res) => {
  try {
    const data = await service.login(req.body.email, req.body.password);
    res.json(data);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// GET /auth/me — dane zalogowanego użytkownika (bez hasła).
const me = async (req, res) => {
  try {
    res.json(await service.getMe(req.user.id));
  } catch (err) {
    res.status(err.status || 400).json({ error: err.message });
  }
};

// PUT /auth/profile — aktualizacja imienia i adresu e-mail zalogowanego użytkownika.
const updateProfile = async (req, res) => {
  try {
    res.json(
      await service.updateProfile(req.user.id, {
        name: req.body.name,
        email: req.body.email,
      })
    );
  } catch (err) {
    res.status(err.status || 400).json({ error: err.message });
  }
};

// PUT /auth/password — zmiana hasła zalogowanego użytkownika.
const changePassword = async (req, res) => {
  try {
    res.json(
      await service.changePassword(
        req.user.id,
        req.body.currentPassword,
        req.body.newPassword
      )
    );
  } catch (err) {
    res.status(err.status || 400).json({ error: err.message });
  }
};

module.exports = {
  register,
  login,
  me,
  updateProfile,
  changePassword,
};
