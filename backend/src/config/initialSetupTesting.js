"use strict";

/**
 * Autor: Leonardo Gutierrez Sanchez
 * Proyecto: SIREC UBB
 * Versión: 5.0.0
 * Año: 2026
 */
import User from "../entity/user.entity.js";
import TipoUsuarioSchema from "../entity/tipo_usuario.entity.js";
import CargoSchema from "../entity/cargo.entity.js";
import CarreraSchema from "../entity/carrera.entity.js";
import MarcaSchema from "../entity/marca.entity.js";
import CategoriaSchema from "../entity/categoria.entity.js";
import EstadoSchema from "../entity/estado.entity.js";
import EstadoPrestamoSchema from "../entity/estado_prestamo.entity.js";
import EquiposSchema from "../entity/equipos.entity.js";
import EspecificacionesHWSchema from "../entity/especificaciones_hw.entity.js";
import PenalizacionesSchema from "../entity/penalizaciones.entity.js";
import { AppDataSource } from "./configDb.js";
import { encryptPassword } from "../helpers/bcrypt.helper.js";

/**
 * Crea los tipos de usuario iniciales del sistema (3FN)
 */
async function createTiposUsuario() {
  try {
    const tipoUsuarioRepository = AppDataSource.getRepository(TipoUsuarioSchema);

    const count = await tipoUsuarioRepository.count();
    if (count > 0) return;

    await Promise.all([
      tipoUsuarioRepository.save(
        tipoUsuarioRepository.create({
          Descripcion: "Administrador",
        }),
      ),
      tipoUsuarioRepository.save(
        tipoUsuarioRepository.create({
          Descripcion: "Alumno",
        }),
      ),
      tipoUsuarioRepository.save(
        tipoUsuarioRepository.create({
          Descripcion: "Profesor",
        }),
      ),
    ]);
    console.log("* => Tipos de usuario creados exitosamente (Administrador, Alumno, Profesor)");
  } catch (error) {
    console.error("Error al crear tipos de usuario:", error);
  }
}

/**
 * Crea los cargos iniciales del sistema
 */
async function createCargos() {
  try {
    const cargoRepository = AppDataSource.getRepository(CargoSchema);

    const count = await cargoRepository.count();
    if (count > 0) return;

    await Promise.all([
      cargoRepository.save(
        cargoRepository.create({
          ID_Cargo: 1,
          Desc_Cargo: "Director/a de Escuela IECI",
        }),
      ),
      cargoRepository.save(
        cargoRepository.create({
          ID_Cargo: 2,
          Desc_Cargo: "Director/a de Escuela ICI",
        }),
      ),
      cargoRepository.save(
        cargoRepository.create({
          ID_Cargo: 3,
          Desc_Cargo: "Otro",
        }),
      ),
    ]);
    console.log("* => Cargos creados exitosamente (Director/a de Escuela IECI, Director/a de Escuela ICI, Otro)");
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
      carreraRepository.save(
        carreraRepository.create({
          Nombre_Carrera: "Ingeniería de Ejecución en Computación e Informática",
        }),
      ),
      carreraRepository.save(
        carreraRepository.create({
          Nombre_Carrera: "Ingeniería Civil Informática",
        }),
      ),
    ]);
    console.log("* => Carreras creadas exitosamente");
  } catch (error) {
    console.error("Error al crear carreras:", error);
  }
}

/**
 * Crea los usuarios iniciales del sistema (3FN)
 */
async function createUsers() {
  try {
    const userRepository = AppDataSource.getRepository(User);
    const tipoUsuarioRepository = AppDataSource.getRepository(TipoUsuarioSchema);
    const cargoRepository = AppDataSource.getRepository(CargoSchema);
    const carreraRepository = AppDataSource.getRepository(CarreraSchema);
    const poseeCargoRepository = AppDataSource.getRepository("PoseeCargo");

    const countBefore = await userRepository.count();
    console.log(`* => Usuarios existentes en la base de datos: ${countBefore}`);
    if (countBefore > 0) return;

    // Obtener tipos de usuario, cargos y carreras
    const tipoAdmin = await tipoUsuarioRepository.findOne({ where: { Descripcion: "Administrador" } });
    const tipoAlumno = await tipoUsuarioRepository.findOne({ where: { Descripcion: "Alumno" } });
    const tipoProfesor = await tipoUsuarioRepository.findOne({ where: { Descripcion: "Profesor" } });
    
    const cargoDirectorIECI = await cargoRepository.findOne({ where: { ID_Cargo: 1 } }); 
    const cargoDirectorICI = await cargoRepository.findOne({ where: { ID_Cargo: 2 } });
    const cargoOtro = await cargoRepository.findOne({ where: { ID_Cargo: 3 } }); 
    
    const carreraInformatica = await carreraRepository.findOne({ 
      where: { Nombre_Carrera: "Ingeniería Civil Informática" } 
    });
    const carreraEjecucion = await carreraRepository.findOne({ 
      where: { Nombre_Carrera: "Ingeniería de Ejecución en Computación e Informática" } 
    });

    if (!tipoAdmin || !tipoAlumno || !tipoProfesor || !cargoDirectorIECI || !cargoDirectorICI || !cargoOtro || !carreraInformatica || !carreraEjecucion) {
      console.error("Error: No se encontraron los tipos de usuario, cargos o carreras necesarios");
      return;
    }

    // 1. Crear Administrador (sin carrera, sin cargo)
    const admin = await userRepository.save(
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

    // 2. Crear Director de Escuela IECI
    const directorIECI = await userRepository.save(
      userRepository.create({
        Nombre_Completo: "María José Martínez Vega",
        Rut: "15234567-4", // RUT Válido
        Correo: "directorieci@gmail.cl",
        Contrasenia: await encryptPassword("director1234"),
        Vigente: true,
        Aprobado: true,
        Cod_TipoUsuario: tipoProfesor.Cod_TipoUsuario,
        ID_Carrera: carreraEjecucion.ID_Carrera,
        ID_Cargo: cargoDirectorIECI.ID_Cargo,
      }),
    );

    await poseeCargoRepository.save({
      Rut_profesor: directorIECI.Rut,
      ID_Cargo: cargoDirectorIECI.ID_Cargo,
      Descripcion_Cargo: null,
      Fecha_Inicio: new Date(),
      Fecha_Fin: null,
    });

    // 3. Crear Director de Escuela ICI
    const directorICI = await userRepository.save(
      userRepository.create({
        Nombre_Completo: "Carolina Andrea Silva Ramos",
        Rut: "16234567-6", // RUT Válido
        Correo: "directorici@gmail.cl",
        Contrasenia: await encryptPassword("director1234"),
        Vigente: true,
        Aprobado: true,
        Cod_TipoUsuario: tipoProfesor.Cod_TipoUsuario,
        ID_Carrera: carreraInformatica.ID_Carrera,
        ID_Cargo: cargoDirectorICI.ID_Cargo,
      }),
    );

    await poseeCargoRepository.save({
      Rut_profesor: directorICI.Rut,
      ID_Cargo: cargoDirectorICI.ID_Cargo,
      Descripcion_Cargo: null,
      Fecha_Inicio: new Date(),
      Fecha_Fin: null,
    });

    // 4. Crear Profesores con cargo "Otro"
    const profesor1 = await userRepository.save(
      userRepository.create({
        Nombre_Completo: "Felipe Ignacio Castro Ruiz",
        Rut: "16789012-1", // RUT Válido
        Correo: "profesor1.2024@gmail.cl",
        Contrasenia: await encryptPassword("profesor1234"),
        Vigente: true,
        Aprobado: true,
        Cod_TipoUsuario: tipoProfesor.Cod_TipoUsuario,
        ID_Carrera: null,
        ID_Cargo: cargoOtro.ID_Cargo,
      }),
    );

    await poseeCargoRepository.save({
      Rut_profesor: profesor1.Rut,
      ID_Cargo: cargoOtro.ID_Cargo,
      Descripcion_Cargo: "Profesor de Programación",
      Fecha_Inicio: new Date(),
      Fecha_Fin: null,
    });

    const profesor2 = await userRepository.save(
      userRepository.create({
        Nombre_Completo: "Valentina Paz Gómez Herrera",
        Rut: "17345678-6", // RUT Válido
        Correo: "profesor2.2024@gmail.cl",
        Contrasenia: await encryptPassword("profesor1234"),
        Vigente: true,
        Aprobado: true,
        Cod_TipoUsuario: tipoProfesor.Cod_TipoUsuario,
        ID_Carrera: null,
        ID_Cargo: cargoOtro.ID_Cargo,
      }),
    );

    await poseeCargoRepository.save({
      Rut_profesor: profesor2.Rut,
      ID_Cargo: cargoOtro.ID_Cargo,
      Descripcion_Cargo: "Profesora de Base de Datos",
      Fecha_Inicio: new Date(),
      Fecha_Fin: null,
    });

    // 4. Crear Alumnos con carrera
    await Promise.all([
      userRepository.save(
        userRepository.create({
          Nombre_Completo: "Javier Eduardo Campos Neira",
          Rut: "21151897-9",
          Correo: "alumno1.2024@gmail.cl",
          Contrasenia: await encryptPassword("alumno1234"),
          Vigente: true,
          Aprobado: true,
          Cod_TipoUsuario: tipoAlumno.Cod_TipoUsuario,
          ID_Carrera: carreraInformatica.ID_Carrera,
          ID_Cargo: null,
        }),
      ),
      userRepository.save(
        userRepository.create({
          Nombre_Completo: "Sebastián Ignacio Torres Castro",
          Rut: "20630735-8",
          Correo: "alumno2.2024@gmail.cl",
          Contrasenia: await encryptPassword("alumno1234"),
          Vigente: true,
          Aprobado: true,
          Cod_TipoUsuario: tipoAlumno.Cod_TipoUsuario,
          ID_Carrera: carreraInformatica.ID_Carrera,
          ID_Cargo: null,
        }),
      ),
      userRepository.save(
        userRepository.create({
          Nombre_Completo: "Matías Alejandro Díaz Soto",
          Rut: "20738450-K",
          Correo: "alumno3.2024@gmail.cl",
          Contrasenia: await encryptPassword("alumno1234"),
          Vigente: true,
          Aprobado: true,
          Cod_TipoUsuario: tipoAlumno.Cod_TipoUsuario,
          ID_Carrera: carreraEjecucion.ID_Carrera,
          ID_Cargo: null,
        }),
      ),
      userRepository.save(
        userRepository.create({
          Nombre_Completo: "Joaquín Alonso Pérez Molina",
          Rut: "20976635-3",
          Correo: "alumno4.2024@gmail.cl",
          Contrasenia: await encryptPassword("alumno1234"),
          Vigente: true,
          Aprobado: true,
          Cod_TipoUsuario: tipoAlumno.Cod_TipoUsuario,
          ID_Carrera: carreraInformatica.ID_Carrera,
          ID_Cargo: null,
        }),
      ),
      userRepository.save(
        userRepository.create({
          Nombre_Completo: "Tomás Vicente Rojas Fuentes",
          Rut: "21172447-1",
          Correo: "alumno5.2024@gmail.cl",
          Contrasenia: await encryptPassword("alumno1234"),
          Vigente: true,
          Aprobado: true,
          Cod_TipoUsuario: tipoAlumno.Cod_TipoUsuario,
          ID_Carrera: carreraEjecucion.ID_Carrera,
          ID_Cargo: null,
        }),
      ),
      userRepository.save(
        userRepository.create({
          Nombre_Completo: "Martina Jesús Morales Salas",
          Rut: "20738415-1",
          Correo: "alumno6.2024@gmail.cl",
          Contrasenia: await encryptPassword("alumno1234"),
          Vigente: true,
          Aprobado: true,
          Cod_TipoUsuario: tipoAlumno.Cod_TipoUsuario,
          ID_Carrera: carreraInformatica.ID_Carrera,
        }),
      ),
    ]);

    const countAfter = await userRepository.count();
    console.log("* => Usuarios creados exitosamente:");
    console.log("  - 1 Administrador");
    console.log("  - 2 Directores de Escuela (IECI e ICI)");
    console.log("  - 2 Profesores con cargo \"Otro\"");
    console.log("  - 6 Alumnos");
    console.log(`  Total: ${countAfter} usuarios`);
  } catch (error) {
    console.error("Error al crear usuarios:", error);
  }
}

/**
 * Crea las marcas iniciales del sistema
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
    console.log("* => Marcas creadas exitosamente");
  } catch (error) {
    console.error("Error al crear marcas:", error);
  }
}

/**
 * Crea las categorías iniciales del sistema
 */
async function createCategorias() {
  try {
    const categoriaRepository = AppDataSource.getRepository(CategoriaSchema);

    const count = await categoriaRepository.count();
    if (count > 0) return;

    await Promise.all([
      categoriaRepository.save(categoriaRepository.create({ Descripcion: "Notebook" })),
      categoriaRepository.save(categoriaRepository.create({ Descripcion: "Desktop" })),
      categoriaRepository.save(categoriaRepository.create({ Descripcion: "Tablet" })),
      categoriaRepository.save(categoriaRepository.create({ Descripcion: "Proyector" })),
      categoriaRepository.save(categoriaRepository.create({ Descripcion: "Impresora" })),
      categoriaRepository.save(categoriaRepository.create({ Descripcion: "Monitor" })),
      categoriaRepository.save(categoriaRepository.create({ Descripcion: "Teclado" })),
      categoriaRepository.save(categoriaRepository.create({ Descripcion: "Mouse" })),
      categoriaRepository.save(categoriaRepository.create({ Descripcion: "Cámara Web" })),
      categoriaRepository.save(categoriaRepository.create({ Descripcion: "Otro" })),
    ]);
    console.log("* => Categorías creadas exitosamente");
  } catch (error) {
    console.error("Error al crear categorías:", error);
  }
}

/**
 * Crea los estados iniciales del sistema (para equipos)
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
    console.log("* => Estados creados exitosamente");
  } catch (error) {
    console.error("Error al crear estados:", error);
  }
}

/**
 * Crea los estados de préstamo iniciales del sistema
 * Flujo: Pendiente → Listo para Entregar (Director aprueba) → Entregado (Admin entrega) → Devuelto (Admin recibe)
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
 * Crea equipos de prueba
 */
async function createEquipos() {
  try {
    const equipoRepository = AppDataSource.getRepository(EquiposSchema);
    const marcaRepository = AppDataSource.getRepository(MarcaSchema);
    const categoriaRepository = AppDataSource.getRepository(CategoriaSchema);
    const estadoRepository = AppDataSource.getRepository(EstadoSchema);

    const countBefore = await equipoRepository.count();
    console.log(`* => Equipos existentes en la base de datos: ${countBefore}`);
    if (countBefore > 0) return;

    // Obtener marcas, categorías y estados
    const hp = await marcaRepository.findOne({ where: { Descripcion: "HP" } });
    const dell = await marcaRepository.findOne({ where: { Descripcion: "Dell" } });
    const lenovo = await marcaRepository.findOne({ where: { Descripcion: "Lenovo" } });
    const asus = await marcaRepository.findOne({ where: { Descripcion: "Asus" } });
    const epson = await marcaRepository.findOne({ where: { Descripcion: "Epson" } });

    const notebook = await categoriaRepository.findOne({ where: { Descripcion: "Notebook" } });
    const desktop = await categoriaRepository.findOne({ where: { Descripcion: "Desktop" } });
    const proyector = await categoriaRepository.findOne({ where: { Descripcion: "Proyector" } });
    const impresora = await categoriaRepository.findOne({ where: { Descripcion: "Impresora" } });

    const disponible = await estadoRepository.findOne({ where: { Descripcion: "Disponible" } });
    const enPrestamo = await estadoRepository.findOne({ where: { Descripcion: "En Préstamo" } });

    if (!hp || !notebook || !disponible) {
      console.error("Error: No se encontraron las entidades necesarias para crear equipos");
      return;
    }

    const especificacionesRepository = AppDataSource.getRepository(EspecificacionesHWSchema);

    const notebook1 = await equipoRepository.save(
      equipoRepository.create({
        ID_Num_Inv: "NB-2024-001",
        Modelo: "Pavilion 15",
        Numero_Serie: "5CD1234ABC",
        Comentarios: "Notebook para préstamo a estudiantes",
        Disponible: true,
        marca: hp,
        categoria: notebook,
        estado: disponible,
      }),
    );

    const notebook2 = await equipoRepository.save(
      equipoRepository.create({
        ID_Num_Inv: "NB-2024-002",
        Modelo: "Latitude 5420",
        Numero_Serie: "DELL5420XYZ",
        Comentarios: "Notebook para profesores",
        Disponible: true,
        marca: dell,
        categoria: notebook,
        estado: disponible,
      }),
    );

    const notebook3 = await equipoRepository.save(
      equipoRepository.create({
        ID_Num_Inv: "NB-2024-003",
        Modelo: "ThinkPad E14",
        Numero_Serie: "LEN14GEN3",
        Comentarios: null,
        Disponible: true,
        marca: lenovo,
        categoria: notebook,
        estado: disponible,
      }),
    );

    // Crear especificaciones para los notebooks
    await Promise.all([
      // Especificaciones NB1
      especificacionesRepository.save(especificacionesRepository.create({ ID_Num_Inv: notebook1.ID_Num_Inv, Tipo_Especificacion_HW: "Procesador", Descripcion: "Intel Core i5-1135G7" })),
      especificacionesRepository.save(especificacionesRepository.create({ ID_Num_Inv: notebook1.ID_Num_Inv, Tipo_Especificacion_HW: "RAM", Descripcion: "8GB DDR4" })),
      especificacionesRepository.save(especificacionesRepository.create({ ID_Num_Inv: notebook1.ID_Num_Inv, Tipo_Especificacion_HW: "Almacenamiento", Descripcion: "256GB SSD NVMe" })),

      // Especificaciones NB2
      especificacionesRepository.save(especificacionesRepository.create({ ID_Num_Inv: notebook2.ID_Num_Inv, Tipo_Especificacion_HW: "Procesador", Descripcion: "Intel Core i7-1185G7" })),
      especificacionesRepository.save(especificacionesRepository.create({ ID_Num_Inv: notebook2.ID_Num_Inv, Tipo_Especificacion_HW: "RAM", Descripcion: "16GB DDR4" })),
      especificacionesRepository.save(especificacionesRepository.create({ ID_Num_Inv: notebook2.ID_Num_Inv, Tipo_Especificacion_HW: "Almacenamiento", Descripcion: "512GB SSD NVMe" })),

      // Especificaciones NB3
      especificacionesRepository.save(especificacionesRepository.create({ ID_Num_Inv: notebook3.ID_Num_Inv, Tipo_Especificacion_HW: "Procesador", Descripcion: "AMD Ryzen 5 5500U" })),
      especificacionesRepository.save(especificacionesRepository.create({ ID_Num_Inv: notebook3.ID_Num_Inv, Tipo_Especificacion_HW: "RAM", Descripcion: "8GB DDR4" })),
      especificacionesRepository.save(especificacionesRepository.create({ ID_Num_Inv: notebook3.ID_Num_Inv, Tipo_Especificacion_HW: "Almacenamiento", Descripcion: "256GB SSD" })),

      // Otros equipos
      equipoRepository.save(
        equipoRepository.create({
          ID_Num_Inv: "DT-2024-001",
          Modelo: "Desktop D500",
          Numero_Serie: "ASUS500DT",
          Comentarios: "Desktop para laboratorio",
          Disponible: true,
          marca: asus,
          categoria: desktop,
          estado: disponible,
        }),
      ),
      equipoRepository.save(
        equipoRepository.create({
          ID_Num_Inv: "PY-2024-001",
          Modelo: "PowerLite",
          Numero_Serie: "EPSPWLT2024",
          Comentarios: "Proyector sala 401",
          Disponible: true,
          marca: epson,
          categoria: proyector,
          estado: disponible,
        }),
      ),
      equipoRepository.save(
        equipoRepository.create({
          ID_Num_Inv: "IP-2024-001",
          Modelo: "L3250",
          Numero_Serie: "EPSL3250ABC",
          Comentarios: "Impresora oficina",
          Disponible: true,
          marca: epson,
          categoria: impresora,
          estado: disponible,
        }),
      ),
    ]);
    const countAfter = await equipoRepository.count();
    console.log(`* => Equipos creados exitosamente (${countAfter} equipos creados)`);
  } catch (error) {
    console.error("Error al crear equipos:", error);
  }
}

/**
 * Crea las penalizaciones iniciales del sistema (3FN)
 */
async function createPenalizaciones() {
  try {
    const penalizacionesRepository = AppDataSource.getRepository(PenalizacionesSchema);

    const countBefore = await penalizacionesRepository.count();
    console.log(`* => Penalizaciones existentes en la base de datos: ${countBefore}`);
    if (countBefore > 0) return;

    await Promise.all([
      penalizacionesRepository.save(
        penalizacionesRepository.create({
          Descripcion: "Retraso en devolución de equipo (menor a 7 días)",
          Dias_Sancion: 3,
        }),
      ),
      penalizacionesRepository.save(
        penalizacionesRepository.create({
          Descripcion: "Retraso en devolución de equipo (mayor a 7 días)",
          Dias_Sancion: 7,
        }),
      ),
      penalizacionesRepository.save(
        penalizacionesRepository.create({
          Descripcion: "Daño leve al equipo prestado",
          Dias_Sancion: 5,
        }),
      ),
      penalizacionesRepository.save(
        penalizacionesRepository.create({
          Descripcion: "Daño grave al equipo prestado",
          Dias_Sancion: 14,
        }),
      ),
      penalizacionesRepository.save(
        penalizacionesRepository.create({
          Descripcion: "Pérdida de equipo",
          Dias_Sancion: 30,
        }),
      ),
      penalizacionesRepository.save(
        penalizacionesRepository.create({
          Descripcion: "Uso indebido del equipo",
          Dias_Sancion: 10,
        }),
      ),
    ]);
    const countAfter = await penalizacionesRepository.count();
    console.log(`* => Penalizaciones creadas exitosamente (${countAfter} penalizaciones creadas)`);
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
  createEquipos, 
  createPenalizaciones 
};