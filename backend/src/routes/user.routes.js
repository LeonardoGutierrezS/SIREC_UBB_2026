"use strict";
import { Router } from "express";
import { isAdmin } from "../middlewares/authorization.middleware.js";
import { authenticateJwt } from "../middlewares/authentication.middleware.js";
import {
  approveUser,
  createUserByAdmin,
  deleteUser,
  getAllUsers,
  getPendingUsers,
  getUser,
  getUsers,
  rejectUser,
  updateUser,
  updateUserStatus,
} from "../controllers/user.controller.js";

const router = Router();

router.use(authenticateJwt);

router
  .get("/", isAdmin, getUsers)
  .get("/all", isAdmin, getAllUsers)
  .get("/pending", isAdmin, getPendingUsers)
  .get("/detail/", getUser) // Acceso permitido a todos los autenticados (validación en controlador)
  .post("/create", isAdmin, createUserByAdmin)
  .patch("/detail/", updateUser) // Acceso permitido a todos los autenticados (validación en controlador)
  .patch("/:rut/approve", isAdmin, approveUser)
  .patch("/:rut/status", isAdmin, updateUserStatus)
  .delete("/detail/", isAdmin, deleteUser)
  .delete("/:rut/reject", isAdmin, rejectUser);

export default router;