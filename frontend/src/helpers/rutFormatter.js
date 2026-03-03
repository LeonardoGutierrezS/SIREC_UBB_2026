/**
 * Formatea un RUT a formato xx.xxx.xxx-x
 * @param {string} rut - RUT sin formato o parcialmente formateado
 * @returns {string} RUT formateado
 */
export const formatRut = (rut) => {
    // Eliminar puntos y guiones existentes
    let cleanRut = rut.replace(/\./g, '').replace(/-/g, '');
    
    // Eliminar caracteres no válidos (solo números y K)
    cleanRut = cleanRut.replace(/[^0-9kK]/g, '');
    
    // Limitar a 9 caracteres máximo
    if (cleanRut.length > 9) {
        cleanRut = cleanRut.slice(0, 9);
    }
    
    // Si está vacío, retornar vacío
    if (cleanRut.length === 0) {
        return '';
    }
    
    // Separar el dígito verificador
    const dv = cleanRut.slice(-1).toUpperCase();
    let rutNumbers = cleanRut.slice(0, -1);
    
    // Si solo hay dígito verificador, retornar como está
    if (rutNumbers.length === 0) {
        return dv;
    }
    
    // Formatear con puntos
    let formatted = '';
    let count = 0;
    
    // Recorrer de derecha a izquierda
    for (let i = rutNumbers.length - 1; i >= 0; i--) {
        if (count === 3) {
            formatted = '.' + formatted;
            count = 0;
        }
        formatted = rutNumbers[i] + formatted;
        count++;
    }
    
    // Agregar guión y dígito verificador
    return formatted + '-' + dv;
};

/**
 * Limpia el formato del RUT para enviar al backend
 * @param {string} rut - RUT formateado
 * @returns {string} RUT sin formato (solo números y dígito verificador)
 */
export const cleanRut = (rut) => {
    return rut.replace(/\./g, '').replace(/-/g, '');
};

/**
 * Valida que el RUT sea real mediante el cálculo del dígito verificador (checksum)
 * @param {string} rut - RUT formateado o sin formato
 * @returns {boolean} true si el RUT es válido
 */
export const validateRut = (rut) => {
    if (!rut) return false;
    
    // Limpiar el RUT
    const clean = rut.replace(/\./g, '').replace(/-/g, '').toUpperCase();
    
    if (clean.length < 8) return false;
    
    const body = clean.slice(0, -1);
    const dv = clean.slice(-1);
    
    // Validar que el cuerpo sean solo números
    if (!/^\d+$/.test(body)) return false;
    
    // Calcular dígito verificador
    let sum = 0;
    let multiplier = 2;
    
    for (let i = body.length - 1; i >= 0; i--) {
        sum += parseInt(body[i]) * multiplier;
        multiplier = multiplier === 7 ? 2 : multiplier + 1;
    }
    
    const expectedDv = 11 - (sum % 11);
    let dvChar;
    
    if (expectedDv === 11) dvChar = '0';
    else if (expectedDv === 10) dvChar = 'K';
    else dvChar = expectedDv.toString();
    
    return dvChar === dv;
};

/**
 * Valida que el RUT tenga un formato correcto (regex básico)
 * @param {string} rut - RUT a validar
 * @returns {boolean} true si el formato es válido
 */
export const validateRutFormat = (rut) => {
    const rutPattern = /^(?:(?:[1-9]\d{0}|[1-2]\d{1})(\.\d{3}){2}|[1-9]\d{6}|[1-2]\d{7}|29\.999\.999|29999999)-[\dkK]$/;
    return rutPattern.test(rut);
};
