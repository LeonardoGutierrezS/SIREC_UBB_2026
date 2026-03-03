import Swal from 'sweetalert2';

export async function deleteDataAlert() {
  return Swal.fire({
    title: "¿Estás seguro?",
    text: "¡No podrás revertir esto!",
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#3085d6",
    cancelButtonColor: "#d33",
    confirmButtonText: "Si, eliminar!"
  })
}

export async function showConfirmAlert(title, text, confirmButtonText = "Sí, confirmar") {
  const result = await Swal.fire({
    title: title,
    text: text,
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#3085d6",
    cancelButtonColor: "#d33",
    confirmButtonText: confirmButtonText,
    cancelButtonText: "Cancelar"
  });
  return result.isConfirmed;
}

export const showSuccessAlert = (titleMessage, message) => {
  return Swal.fire(
    titleMessage,
    message,
    'success'
  );
};

export const showLoadingAlert = (title = 'Procesando...', html = 'Por favor, espere un momento') => {
  Swal.fire({
    title: title,
    html: html,
    allowOutsideClick: false,
    allowEscapeKey: false,
    didOpen: () => {
      Swal.showLoading();
    }
  });
};

export const closeAlert = () => {
  Swal.close();
};

export const showErrorAlert = (titleMessage, message, showConfirmButton = false, onConfirm = null) => {
  if (showConfirmButton && onConfirm) {
    Swal.fire({
      title: titleMessage,
      text: message,
      icon: 'error',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Sí, registrarme',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        onConfirm();
      }
    });
  } else {
    Swal.fire(
      titleMessage,
      message,
      'error'
    );
  }
};