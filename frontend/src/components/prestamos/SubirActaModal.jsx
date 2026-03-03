import React, { useState, useCallback } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCloudUploadAlt, faFilePdf, faTimes, faSyncAlt } from '@fortawesome/free-solid-svg-icons';
import '@styles/subir-acta-modal.css';

const SubirActaModal = ({ isOpen, onClose, onUpload, solicitud }) => {
    const [file, setFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(null);
    const [isDragging, setIsDragging] = useState(false);
    const [uploading, setUploading] = useState(false);

    const handleFile = (selectedFile) => {
        if (!selectedFile) return;

        // Validar tipo de archivo
        const validTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'];
        if (!validTypes.includes(selectedFile.type)) {
            alert('Por favor, suba un archivo PDF o una imagen (JPG, PNG).');
            return;
        }

        // Validar tamaño (5MB)
        if (selectedFile.size > 5 * 1024 * 1024) {
            alert('El archivo es demasiado grande. El máximo es 5MB.');
            return;
        }

        setFile(selectedFile);

        // Crear previsualización si es imagen
        if (selectedFile.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreviewUrl(reader.result);
            };
            reader.readAsDataURL(selectedFile);
        } else {
            setPreviewUrl(null); // Para PDF no mostramos preview de imagen
        }
    };

    const onDrop = useCallback((e) => {
        e.preventDefault();
        setIsDragging(false);
        const droppedFile = e.dataTransfer.files[0];
        handleFile(droppedFile);
    }, []);

    const onDragOver = (e) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const onDragLeave = () => {
        setIsDragging(false);
    };

    const handleRemoveFile = () => {
        setFile(null);
        setPreviewUrl(null);
    };

    const handleConfirmUpload = async () => {
        if (!file) return;
        setUploading(true);
        try {
            await onUpload(file);
            handleClose();
        } catch (error) {
            console.error('Error al subir:', error);
        } finally {
            setUploading(false);
        }
    };

    const handleClose = () => {
        setFile(null);
        setPreviewUrl(null);
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="upload-modal-overlay">
            <div className="upload-modal-container">
                <div className="upload-modal-header">
                    <h3>Subir Acta Firmada</h3>
                    <button className="close-x" onClick={handleClose}>
                        <FontAwesomeIcon icon={faTimes} />
                    </button>
                </div>

                <div className="upload-modal-body">
                    <p className="solicitud-info">
                        <strong>Solicitud #{solicitud.ID_Solicitud}</strong> - {solicitud.usuario?.Nombre_Completo}
                    </p>

                    {!file ? (
                        <div 
                            className={`dropzone ${isDragging ? 'dragging' : ''}`}
                            onDrop={onDrop}
                            onDragOver={onDragOver}
                            onDragLeave={onDragLeave}
                        >
                            <input 
                                type="file" 
                                id="fileInput" 
                                hidden 
                                onChange={(e) => handleFile(e.target.files[0])}
                                accept="application/pdf,image/*"
                            />
                            <label htmlFor="fileInput">
                                <FontAwesomeIcon icon={faCloudUploadAlt} className="upload-icon" />
                                <p>Arrastra el acta aquí o haz clic para buscar</p>
                                <span>Formatos aceptados: PDF, JPG, PNG (Máx 5MB)</span>
                            </label>
                        </div>
                    ) : (
                        <div className="file-preview-container">
                            <div className="preview-card">
                                {previewUrl ? (
                                    <img src={previewUrl} alt="Vista previa" className="image-preview" />
                                ) : (
                                    <div className="pdf-placeholder">
                                        <FontAwesomeIcon icon={faFilePdf} className="pdf-icon" />
                                        <p>{file.name}</p>
                                    </div>
                                )}
                                <div className="file-details">
                                    <span className="file-name">{file.name}</span>
                                    <span className="file-size">({(file.size / 1024 / 1024).toFixed(2)} MB)</span>
                                </div>
                                <button className="remove-file-btn" onClick={handleRemoveFile} title="Eliminar y elegir otro">
                                    <FontAwesomeIcon icon={faSyncAlt} /> Cambiar Archivo
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                <div className="upload-modal-footer">
                    <button className="btn-cancel" onClick={handleClose} disabled={uploading}>
                        Cancelar
                    </button>
                    <button 
                        className="btn-confirm-upload" 
                        onClick={handleConfirmUpload}
                        disabled={!file || uploading}
                    >
                        {uploading ? (
                            <><span className="spinner"></span> Subiendo...</>
                        ) : (
                            'Confirmar y Subir'
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default SubirActaModal;
