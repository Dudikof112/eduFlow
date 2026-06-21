const service = require("../services/notificationService");

// GET /notifications — moje powiadomienia + liczba nieprzeczytanych.
const list = async (req, res, next) => {
  try {
    res.json(await service.getMyNotifications(req.user.id));
  } catch (err) {
    next(err);
  }
};

// POST /notifications/read-all — oznacz wszystkie jako przeczytane.
const readAll = async (req, res, next) => {
  try {
    res.json(await service.markAllRead(req.user.id));
  } catch (err) {
    next(err);
  }
};

module.exports = { list, readAll };
