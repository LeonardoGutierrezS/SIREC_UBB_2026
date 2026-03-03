"use strict";
import User from "../entity/user.entity.js";
import TipoUsuarioSchema from "../entity/tipo_usuario.entity.js";
import CargoSchema from "../entity/cargo.entity.js";
import CarreraSchema from "../entity/carrera.entity.js";
import MarcaSchema from "../entity/marca.entity.js";
import CategoriaSchema from "../entity/categoria.entity.js";
import EstadoSchema from "../entity/estado.entity.js";
import EstadoPrestamoSchema from "../entity/estado_prestamo.entity.js";
import PenalizacionesSchema from "../entity/penalizaciones.entity.js";
import { AppDataSource } from "./configDb.js";
import { encryptPassword } from "../helpers/bcrypt.helper.js";

/**
 * Crea los tipos de usuario iniciales del sistema
 */
async function createTiposUsuario() {
  try {
    const tipoUsuarioRepository = AppDataSource.getRepository(TipoUsuarioSchema);
    const count = await tipoUsuarioRepository.count();
    if (count > 0) return;

    await Promise.all([
      tipoUsuarioRepository.save(tipoUsuarioRepository.create({ Descripcion: "Administrador" })),
      tipoUsuarioRepository.save(tipoUsuarioRepository.create({ Descripcion: "Alumno" })),
      tipoUsuarioRepository.save(tipoUsuarioRepository.create({ Descripcion: "Profesor" })),
    ]);
    console.log("* => Tipos de usuario creados exitosamente");
  } catch (error) {
    console.error("Error al crear tipos de usuario:", error);
  }
}

/**
 * Crea los cargos iniciales del sistema (Necesarios para lógica de flujo)
 */
async function createCargos() {
  try {
    const cargoRepository = AppDataSource.getRepository(CargoSchema);
    const count = await cargoRepository.count();
    if (count > 0) return;

    await Promise.all([
      cargoRepository.save(cargoRepository.create({ ID_Cargo: 1, Desc_Cargo: "Director/a de Escuela IECI" })),
      cargoRepository.save(cargoRepository.create({ ID_Cargo: 2, Desc_Cargo: "Director/a de Escuela ICI" })),
      cargoRepository.save(cargoRepository.create({ ID_Cargo: 3, Desc_Cargo: "Otro" })),
    ]);
    console.log("* => Cargos creados exitosamente");
  } catch (error) {
    console.error("Error al crear cargos:", error);
  }
}

/**
 * Crea las carreras iniciales del sistema
 */
async function createCarreras() {
  try {
    const carreraRepository = AppDataSource.getRepository(CarreraSchema);
    const count = await carreraRepository.count();
    if (count > 0) return;

    await Promise.all([
      carreraRepository.save(carreraRepository.create({ Nombre_Carrera: "Ingeniería de Ejecución en Computación e Informática" })),
      carreraRepository.save(carreraRepository.create({ Nombre_Carrera: "Ingeniería Civil Informática" })),
    ]);
    console.log("* => Carreras creadas exitosamente");
  } catch (error) {
    console.error("Error al crear carreras:", error);
  }
}

/**
 * Crea el usuario administrador principal
 */
async function createUsers() {
  try {
    const userRepository = AppDataSource.getRepository(User);
    const tipoUsuarioRepository = AppDataSource.getRepository(TipoUsuarioSchema);

    const count = await userRepository.count();
    if (count > 0) return;

    const tipoAdmin = await tipoUsuarioRepository.findOne({ where: { Descripcion: "Administrador" } });
    if (!tipoAdmin) {
      console.error("Error: No se encontró el tipo de usuario Administrador");
      return;
    }

    await userRepository.save(
      userRepository.create({
        Nombre_Completo: "Administrador Principal",
        Rut: "21308770-3",
        Correo: "administrador@gmail.cl",
        Contrasenia: await encryptPassword("admin1234"),
        Vigente: true,
        Aprobado: true,
        Cod_TipoUsuario: tipoAdmin.Cod_TipoUsuario,
        ID_Carrera: null,
        ID_Cargo: null,
      }),
    );
    console.log("* => Administrador Principal creado exitosamente");
  } catch (error) {
    console.error("Error al crear el administrador principal:", error);
  }
}

/**
 * Crea las marcas base
 */
async function createMarcas() {
  try {
    const marcaRepository = AppDataSource.getRepository(MarcaSchema);
    const count = await marcaRepository.count();
    if (count > 0) return;

    await Promise.all([
      marcaRepository.save(marcaRepository.create({ Descripcion: "HP" })),
      marcaRepository.save(marcaRepository.create({ Descripcion: "Dell" })),
      marcaRepository.save(marcaRepository.create({ Descripcion: "Lenovo" })),
      marcaRepository.save(marcaRepository.create({ Descripcion: "Asus" })),
      marcaRepository.save(marcaRepository.create({ Descripcion: "Acer" })),
      marcaRepository.save(marcaRepository.create({ Descripcion: "Apple" })),
      marcaRepository.save(marcaRepository.create({ Descripcion: "Samsung" })),
      marcaRepository.save(marcaRepository.create({ Descripcion: "Epson" })),
      marcaRepository.save(marcaRepository.create({ Descripcion: "Canon" })),
      marcaRepository.save(marcaRepository.create({ Descripcion: "Logitech" })),
    ]);
    console.log("* => Marcas base creadas exitosamente");
  } catch (error) {
    console.error("Error al crear marcas:", error);
  }
}

/**
 * Crea las categorías base
 */
async function createCategorias() {
  try {
    const categoriaRepository = AppDataSource.getRepository(CategoriaSchema);
    const count = await categoriaRepository.count();
    if (count > 0) return;

    await Promise.all([
      categoriaRepository.save(categoriaRepository.create({ Descripcion: "Notebook" })),
    ]);
    console.log("* => Categoría Notebook creada exitosamente");
  } catch (error) {
    console.error("Error al crear categorías:", error);
  }
}

/**
 * Crea los estados de equipos base
 */
async function createEstados() {
  try {
    const estadoRepository = AppDataSource.getRepository(EstadoSchema);
    const count = await estadoRepository.count();
    if (count > 0) return;

    await Promise.all([
      estadoRepository.save(estadoRepository.create({ Descripcion: "Disponible" })),
      estadoRepository.save(estadoRepository.create({ Descripcion: "Solicitado" })),
      estadoRepository.save(estadoRepository.create({ Descripcion: "En Préstamo" })),
      estadoRepository.save(estadoRepository.create({ Descripcion: "En Reparación" })),
      estadoRepository.save(estadoRepository.create({ Descripcion: "Dado de Baja" })),
    ]);
    console.log("* => Estados de equipo creados exitosamente");
  } catch (error) {
    console.error("Error al crear estados de equipo:", error);
  }
}

/**
 * Crea los estados de préstamo base
 */
async function createEstadosPrestamo() {
  try {
    const estadoPrestamoRepository = AppDataSource.getRepository(EstadoPrestamoSchema);
    const count = await estadoPrestamoRepository.count();
    if (count > 0) return;

    await Promise.all([
      estadoPrestamoRepository.save(estadoPrestamoRepository.create({ Descripcion: "Pendiente" })),
      estadoPrestamoRepository.save(estadoPrestamoRepository.create({ Descripcion: "Listo para Entregar" })),
      estadoPrestamoRepository.save(estadoPrestamoRepository.create({ Descripcion: "Listo para recepcionar" })),
      estadoPrestamoRepository.save(estadoPrestamoRepository.create({ Descripcion: "Devuelto" })),
      estadoPrestamoRepository.save(estadoPrestamoRepository.create({ Descripcion: "Rechazado" })),
    ]);
    console.log("* => Estados de préstamo creados exitosamente");
  } catch (error) {
    console.error("Error al crear estados de préstamo:", error);
  }
}

/**
 * Crea las penalizaciones base
 */
async function createPenalizaciones() {
  try {
    const penalizacionesRepository = AppDataSource.getRepository(PenalizacionesSchema);
    const count = await penalizacionesRepository.count();
    if (count > 0) return;

    await Promise.all([
      penalizacionesRepository.save(penalizacionesRepository.create({ Descripcion: "Retraso en devolución (< 7 días)", Dias_Sancion: 3 })),
      penalizacionesRepository.save(penalizacionesRepository.create({ Descripcion: "Retraso en devolución (> 7 días)", Dias_Sancion: 7 })),
      penalizacionesRepository.save(penalizacionesRepository.create({ Descripcion: "Daño grave al equipo", Dias_Sancion: 14 })),
      penalizacionesRepository.save(penalizacionesRepository.create({ Descripcion: "Pérdida de equipo", Dias_Sancion: 30 })),
    ]);
    console.log("* => Penalizaciones base creadas exitosamente");
  } catch (error) {
    console.error("Error al crear penalizaciones:", error);
  }
}

export { 
  createTiposUsuario, 
  createCargos, 
  createCarreras, 
  createUsers, 
  createMarcas, 
  createCategorias, 
  createEstados,
  createEstadosPrestamo,
  createPenalizaciones 
};
