// type is success || error
export function showAlert(type, message) {
  hideAlert();

  const markup = `<div class="alert alert--${type}">${message}</div>`;

  document.body.insertAdjacentHTML("afterbegin", markup);

  window.setTimeout(hideAlert, 5000);
}

export function hideAlert() {
  const element = document.querySelector(".alert");

  if (element) element.parentElement.removeChild(element);
}
