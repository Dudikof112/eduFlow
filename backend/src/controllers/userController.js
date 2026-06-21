const userService = require("../services/userService");

// GET /users — lista wszystkich użytkowników (tylko admin).
const list = async (req, res, next) => {
  try {
    res.json(await userService.getAllUsers());
  } catch (err) {
    next(err);
  }
};

// PUT /users/:id/role — zmiana roli użytkownika (tylko admin).
const updateRole = async (req, res, next) => {
  try {
    res.json(await userService.updateUserRole(req.params.id, req.body.role));
  } catch (err) {
    next(err);
  }
};

// DELETE /users/:id — usunięcie użytkownika wraz z danymi (tylko admin).
const remove = async (req, res, next) => {
  try {
    res.json(await userService.deleteUser(req.params.id, req.user));
  } catch (err) {
    next(err);
  }
};

module.exports = { list, updateRole, remove };
