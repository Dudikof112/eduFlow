const { Notification } = require("../models");
const { getIO } = require("../realtime");

// Funkcja tworzy powiadomienie i — jeśli odbiorca jest online — wysyła je na żywo
// do jego osobistego pokoju socket.io.
const createNotification = async ({ userId, type, text, link }) => {
  const notif = await Notification.create({
    userId,
    type,
    text,
    link: link || null,
  });
  const io = getIO();
  if (io) io.to(`user:${userId}`).emit("notification", notif.toJSON());
  return notif;
};

// Funkcja zwraca ostatnie powiadomienia użytkownika oraz liczbę nieprzeczytanych.
const getMyNotifications = async (userId) => {
  const items = await Notification.findAll({
    where: { userId },
    order: [["createdAt", "DESC"]],
    limit: 30,
  });
  const unread = await Notification.count({ where: { userId, read: false } });
  return { items, unread };
};

// Funkcja oznacza wszystkie powiadomienia użytkownika jako przeczytane.
const markAllRead = async (userId) => {
  await Notification.update({ read: true }, { where: { userId, read: false } });
  return { success: true };
};

module.exports = { createNotification, getMyNotifications, markAllRead };
