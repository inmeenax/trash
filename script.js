const WORKER_URL =
  "https://watchpays-api.rowelix153.workers.dev/create-payment";


const WEBSITE_URL =
  "https://inmeenax.github.io/trash/";


async function createPayment(amount) {

  const status =
    document.getElementById("status");

  status.textContent =
    "Creating payment...";


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

      status.textContent =
        "Redirecting to payment...";


      window.location.href =
        data.payment_url;


    } else {

      status.textContent =
        data.error ||
        data.message ||
        "Payment creation failed.";

    }


  } catch (error) {

    console.error(
      "Payment error:",
      error
    );


    status.textContent =
      "Could not connect to payment server.";

  }

}


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
        " payment URL copied!";

    })
    .catch(error => {

      console.error(
        "Copy error:",
        error
      );

      alert(paymentLink);

    });

}


function checkDirectPayment() {

  const params =
    new URLSearchParams(
      window.location.search
    );


  const amount =
    Number(
      params.get("amount")
    );


  const allowedAmounts = [
    100,
    200,
    300,
    400,
    500
  ];


  if (
    allowedAmounts.includes(amount)
  ) {

    createPayment(amount);

  }

}


window.addEventListener(
  "DOMContentLoaded",
  checkDirectPayment
);
