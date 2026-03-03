/**
 * Valida que el RUT sea real mediante el cálculo del dígito verificador (checksum)
 * @param {string} rut - RUT formateado o sin formato
 * @returns {boolean} true si el RUT es válido
 */
export const validateRutHelper = (rut) => {
    if (!rut) return false;
    
    // Limpiar el RUT: eliminar puntos y guiones, convertir a mayúscula
    const clean = rut.replace(/\./g, '').replace(/-/g, '').toUpperCase();
    
    // Un RUT tiene entre 8 y 9 caracteres (ej: 12.345.678-5 -> 123456785)
    if (clean.length < 8 || clean.length > 9) return false;
    
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
