import axios from "axios";
import { showAlert } from "./alerts";

export async function bookTour(tourId) {
  // For some god awful reason line 5 causes multiple CORS errors. For some other god awful reason
  // When you proceed with the payment, it just works, even though there are over 200 errors.
  // 2 fucking hours of my life gone on utter fuckery.
  // God has left us
  try {
    const stripe = Stripe(
      `pk_test_51QunVpGCfui8zvyydXnsOtGsgcoK8vg9txHwftCtdIL7yslAyuGJ1CKsKgeBb2LzotN0d5EOfaIBrIesB8bRRvlZ001qQ4d8ch`
    );
    // Get checkout session from endpoint
    const session = await axios({
      method: "GET",
      url: `/api/v1/bookings/checkout-session/${tourId}`,
    });

    await stripe.redirectToCheckout({
      sessionId: session.data.session.id,
    });
  } catch (err) {
    showAlert("error", err);
  }

  // Use stripe object to create checkout form
}
