import axios from "axios";
import { showAlert } from "./alerts";

// Type is either "password" or "data"
export async function updateSettings(data, type) {
  try {
    const url = type === "password" ? "update-password" : "update-me";

    const res = await axios({
      method: "PATCH",
      url: `/api/v1/users/${url}`,
      data,
    });

    if (res.data.status === "success") {
      return showAlert("success", `Successfully updated ${type}.`);
    }
  } catch (err) {
    console.log(err);
    showAlert("error", err.response.data.message);
  }
}
