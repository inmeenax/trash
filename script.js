const WORKER_URL =
  "https://watchpays-api.rowelix153.workers.dev/create-payment";


async function createPayment(amount) {

  const status = document.getElementById("status");

  status.textContent = "Creating payment...";

  try {

    const response = await fetch(WORKER_URL, {

      method: "POST",

      headers: {
        "Content-Type": "application/json"
      },

      body: JSON.stringify({
        amount: amount
      })

    });


    const data = await response.json();

    console.log("Worker response:", data);


    if (data.success && data.payment_url) {

      status.textContent = "Redirecting to payment...";

      window.location.href = data.payment_url;

    } else {

      status.textContent =
        data.error ||
        data.message ||
        "Payment creation failed.";

      console.error("Payment error:", data);

    }

  } catch (error) {

    console.error("Connection error:", error);

    status.textContent =
      "Could not connect to payment server.";

  }
}
