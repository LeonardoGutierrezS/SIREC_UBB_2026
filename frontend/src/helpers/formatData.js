import { startCase } from 'lodash';
import { format as formatRut } from 'rut.js';
import { format as formatTempo } from "@formkit/tempo";

export function formatUserData(user) {
    // Extraer nombre de la carrera
    let nombreCarrera = 'Sin carrera';
    let idCarrera = null;
    
    if (user.carrera) {
        if (typeof user.carrera === 'object' && user.carrera.Nombre_Carrera) {
            nombreCarrera = user.carrera.Nombre_Carrera;
            idCarrera = user.carrera.ID_Carrera;
        } else if (typeof user.carrera === 'string') {
            nombreCarrera = user.carrera;
        }
    }
    
    // Si no se extrajo de la relación, intentar del campo directo
    if (!idCarrera && user.ID_Carrera) {
        idCarrera = user.ID_Carrera;
    }

    // Extraer cargo
    let nombreCargo = 'Sin cargo';
    let idCargo = null;
    
    if (user.cargo) {
        if (typeof user.cargo === 'object' && user.cargo.Desc_Cargo) {
            nombreCargo = user.cargo.Desc_Cargo;
            idCargo = user.cargo.ID_Cargo;
        } else if (typeof user.cargo === 'string') {
            nombreCargo = user.cargo;
        }
    }
    
    // Si no se extrajo de la relación, intentar del campo directo
    if (!idCargo && user.ID_Cargo) {
        idCargo = user.ID_Cargo;
    }

    // Extraer tipo de usuario
    let tipoUsuarioDesc = 'Sin tipo';
    let codTipoUsuario = null;
    
    if (user.tipoUsuario) {
        if (typeof user.tipoUsuario === 'object' && user.tipoUsuario.Descripcion) {
            tipoUsuarioDesc = user.tipoUsuario.Descripcion;
            codTipoUsuario = user.tipoUsuario.Cod_TipoUsuario;
        } else if (typeof user.tipoUsuario === 'string') {
            tipoUsuarioDesc = user.tipoUsuario;
        }
    }
    
    // Si no se extrajo de la relación, intentar del campo directo
    if (!codTipoUsuario && user.Cod_TipoUsuario) {
        codTipoUsuario = user.Cod_TipoUsuario;
    }

    return {
        nombreCompleto: user.Nombre_Completo || user.nombreCompleto,
        rut: formatRut(user.Rut || user.rut),
        email: user.Correo || user.email,
        tipoUsuario: tipoUsuarioDesc,
        codTipoUsuario: codTipoUsuario,
        carrera: nombreCarrera,
        idCarrera: idCarrera,
        cargo: nombreCargo,
        idCargo: idCargo,
        vigente: user.Vigente !== undefined ? user.Vigente : user.vigente,
        createdAt: user.createdAt || new Date().toISOString()
    };
}

export function convertirMinusculas(obj) {
    for (let key in obj) {
        if (typeof obj[key] === 'string') {
            obj[key] = obj[key].toLowerCase();
        }
    }
    return obj;
}

export function formatPostUpdate(user) {
    let idCarrera = null;
    let nombreCarrera = 'Sin carrera';
    
    if (user.carrera) {
        if (typeof user.carrera === 'object') {
            nombreCarrera = user.carrera.Nombre_Carrera || 'Sin carrera';
            idCarrera = user.carrera.ID_Carrera;
        } else if (typeof user.carrera === 'string') {
            nombreCarrera = user.carrera;
        }
    }
    
    if (!idCarrera && user.ID_Carrera) {
        idCarrera = user.ID_Carrera;
    }
    
    let idCargo = null;
    let nombreCargo = 'Sin cargo';
    
    if (user.cargo) {
        if (typeof user.cargo === 'object') {
            nombreCargo = user.cargo.Desc_Cargo || 'Sin cargo';
            idCargo = user.cargo.ID_Cargo;
        } else if (typeof user.cargo === 'string') {
            nombreCargo = user.cargo;
        }
    }
    
    if (!idCargo && user.ID_Cargo) {
        idCargo = user.ID_Cargo;
    }
    
    let codTipoUsuario = null;
    let tipoUsuarioDesc = 'Sin tipo';
    
    if (user.tipoUsuario) {
        if (typeof user.tipoUsuario === 'object') {
            tipoUsuarioDesc = user.tipoUsuario.Descripcion || 'Sin tipo';
            codTipoUsuario = user.tipoUsuario.Cod_TipoUsuario;
        } else if (typeof user.tipoUsuario === 'string') {
            tipoUsuarioDesc = user.tipoUsuario;
        }
    }
    
    if (!codTipoUsuario && user.Cod_TipoUsuario) {
        codTipoUsuario = user.Cod_TipoUsuario;
    }
    
    return {
        nombreCompleto: user.Nombre_Completo || user.nombreCompleto,
        tipoUsuario: tipoUsuarioDesc,
        codTipoUsuario: codTipoUsuario,
        carrera: nombreCarrera,
        idCarrera: idCarrera,
        cargo: nombreCargo,
        idCargo: idCargo,
        rut: formatRut(user.Rut || user.rut),
        email: user.Correo || user.email,
        vigente: user.Vigente !== undefined ? user.Vigente : user.vigente,
        createdAt: user.createdAt || new Date().toISOString()
    };
}