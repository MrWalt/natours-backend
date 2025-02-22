import { login, logout } from "./login";
import { displayMap } from "./leaflet";
import { updateSettings } from "./updateSettings";
import { bookTour } from "./stripe";

// Values
const email = document.querySelector("#email");
const password = document.querySelector("#password");
const passwordCurrent = document.querySelector("#password-current");
const passwordConfirm = document.querySelector("#password-confirm");
const name = document.querySelector("#name");
const photo = document.querySelector("#photo");

const loginForm = document.querySelector(".form--login");
const mapBox = document.getElementById("map");
const logoutButton = document.querySelector(".nav__el--logout");
const updateUserForm = document.querySelector(".form-user-data");
const updateUserPasswordForm = document.querySelector(".form-user-settings");
const bookTourButton = document.querySelector("#book-tour");

if (mapBox) {
  const locations = JSON.parse(mapBox.dataset.locations);
  displayMap(locations);
}

if (loginForm)
  loginForm.addEventListener("submit", function (e) {
    e.preventDefault();

    login(email.value, password.value);
  });

if (logoutButton) logoutButton.addEventListener("click", logout);

if (updateUserForm)
  updateUserForm.addEventListener("submit", function (e) {
    e.preventDefault();

    const form = new FormData();
    form.append("name", name.value);
    form.append("email", email.value);
    form.append("photo", photo.files[0]);

    console.log(form);

    updateSettings(form, "data");
  });

if (updateUserPasswordForm)
  updateUserPasswordForm.addEventListener("submit", async function (e) {
    e.preventDefault();
    document.querySelector(".btn-password").textContent = "Updating...";
    await updateSettings(
      {
        password: password.value,
        passwordConfirm: passwordConfirm.value,
        passwordCurrent: passwordCurrent.value,
      },
      "password"
    );

    document.querySelector(".btn-password").textContent = "Save password";
    password.value = "";
    passwordConfirm.value = "";
    passwordCurrent.value = "";
  });

if (bookTourButton)
  bookTourButton.addEventListener("click", function (e) {
    const tourId = e.target.dataset.tour;
    bookTourButton.textContent = "Processing...";
    bookTour(tourId);
  });
