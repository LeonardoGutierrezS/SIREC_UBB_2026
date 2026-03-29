"use strict";
import multer from "multer";
import path from "path";
import fs from "fs";

// Asegurar que la carpeta de destino existe
const uploadDir = path.join(process.cwd(), "uploads", "actas");
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        // Formato: prestamo-ID-timestamp.ext
        const idPrestamo = req.params.id;
        const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
        const ext = path.extname(file.originalname);
        cb(null, `prestamo-${idPrestamo}-${uniqueSuffix}${ext}`);
    },
});

const fileFilter = (req, file, cb) => {
    const allowedExtensions = [".pdf", ".jpg", ".jpeg", ".png"];
    const allowedMimeTypes = ["application/pdf", "image/jpeg", "image/png"];
    
    const ext = path.extname(file.originalname).toLowerCase();
    
    if (allowedExtensions.includes(ext) && allowedMimeTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error("Formato de archivo inválido. Solo se permiten verdaderos archivos PDF e imágenes (JPG, PNG)"), false);
    }
};

export const uploadActa = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024, // Limite de 5MB
    },
}).single("acta");
