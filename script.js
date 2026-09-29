const WORKER_URL =
  "https://watchpays-api.rowelix153.workers.dev/create-payment";


const WEBSITE_URL =
  "https://inmeenax.github.io/trash/";


const ALLOWED_AMOUNTS = [
  100,
  200,
  300,
  400,
  500
];


// ------------------------------------
// SHOW LOADING SCREEN
// ------------------------------------

function showLoading(amount) {

  const walletScreen =
    document.getElementById("walletScreen");

  const loadingScreen =
    document.getElementById("loadingScreen");

  const loadingAmount =
    document.getElementById("loadingAmount");

  walletScreen.classList.add("hidden");

  loadingScreen.classList.remove("hidden");

  loadingAmount.textContent =
    amount;
}


// ------------------------------------
// CREATE PAYMENT
// ------------------------------------

async function createPayment(amount) {

  showLoading(amount);

  const loadingTitle =
    document.getElementById("loadingTitle");

  const loadingText =
    document.getElementById("loadingText");

  const gatewayStep =
    document.getElementById("gatewayStep");

  const redirectStep =
    document.getElementById("redirectStep");


  loadingTitle.textContent =
    "Preparing your payment";


  loadingText.textContent =
    "Please wait while we securely connect to the payment gateway.";


  gatewayStep.classList.add("active");


  try {

    const response =
      await fetch(WORKER_URL, {

        method: "POST",

        headers: {
          "Content-Type":
            "application/json"
        },

        body: JSON.stringify({
          amount: amount
        })

      });


    const data =
      await response.json();


    console.log(
      "Worker response:",
      data
    );


    if (
      data.success &&
      data.payment_url
    ) {

      gatewayStep.classList.add("done");

      redirectStep.classList.add("active");


      loadingTitle.textContent =
        "Payment gateway ready";


      loadingText.textContent =
        "Redirecting you securely to complete your payment...";


      // Small delay so user can see successful transition
      setTimeout(() => {

        window.location.href =
          data.payment_url;

      }, 500);


    } else {

      loadingTitle.textContent =
        "Payment could not be created";


      loadingText.textContent =
        data.error ||
        data.message ||
        "Please try again.";


      setTimeout(() => {

        document
          .getElementById("loadingScreen")
          .classList.add("hidden");

        document
          .getElementById("walletScreen")
          .classList.remove("hidden");

      }, 2500);

    }


  } catch (error) {

    console.error(
      "Payment error:",
      error
    );


    loadingTitle.textContent =
      "Connection problem";


    loadingText.textContent =
      "Please check your internet connection and try again.";


    setTimeout(() => {

      document
        .getElementById("loadingScreen")
        .classList.add("hidden");

      document
        .getElementById("walletScreen")
        .classList.remove("hidden");

    }, 2500);

  }

}


// ------------------------------------
// COPY PAYMENT LINK
// ------------------------------------

function copyPaymentLink(amount) {

  const paymentLink =
    WEBSITE_URL +
    "?amount=" +
    amount;


  navigator.clipboard
    .writeText(paymentLink)
    .then(() => {

      const status =
        document.getElementById("status");

      status.textContent =
        "₹" +
        amount +
        " payment link copied ✓";


      setTimeout(() => {

        status.textContent = "";

      }, 2500);

    })
    .catch(() => {

      prompt(
        "Copy this payment link:",
        paymentLink
      );

    });

}


// ------------------------------------
// DIRECT PAYMENT LINK
// ------------------------------------

function checkDirectPayment() {

  const params =
    new URLSearchParams(
      window.location.search
    );


  const amount =
    Number(
      params.get("amount")
    );


  if (
    ALLOWED_AMOUNTS.includes(amount)
  ) {

    // Immediately switch to loading screen
    showLoading(amount);

    // Then create payment
    createPayment(amount);

  }

}


// ------------------------------------
// PAGE LOAD
// ------------------------------------

window.addEventListener(
  "DOMContentLoaded",
  checkDirectPayment
);
