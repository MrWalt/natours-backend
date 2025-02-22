import axios from "axios";
import "@babel/polyfill";
import { showAlert } from "./alerts";

export async function login(email, password) {
  try {
    const res = await axios({
      method: "POST",
      url: "/api/v1/users/login",
      data: {
        email,
        password,
      },
    });

    if (res.data.status === "success") {
      showAlert("success", "Successfully logged in");
      window.setTimeout(() => {
        // This is used to navigate to the home page
        location.assign("/");
      }, 1500);
    }
  } catch (error) {
    showAlert("error", error.response.data.message);
  }
}

export async function logout() {
  try {
    const res = await axios({
      method: "GET",
      url: "http://localhost:8000/api/v1/users/logout",
    });

    if (res.data.status === "success") {
      location.reload(true);
    }
  } catch (err) {
    showAlert("error", "Error logging out");
  }
}
