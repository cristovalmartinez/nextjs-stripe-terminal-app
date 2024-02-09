// Function handles changing stripe unix timestamp to PST
export function handleDateFormat(timeStamp: number) {
  const unixTimestamp = timeStamp

  // Convert Unix timestamp to a Date object
  const createdDate = new Date(unixTimestamp * 1000)

  // Create options for formatting in PST
  const options = {
    timeZone: "America/Los_Angeles",
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "numeric",
    minute: "numeric",
    second: "numeric",
  }

  // Format the date as a string in PST
  // @ts-ignore
  const formattedCreatedAt = new Intl.DateTimeFormat("en-US", options).format(
    createdDate
  )

  return formattedCreatedAt
}

// function handles handing off the stripe payment intent in development mode and using stripe
// similuated reader
export async function handOffPaymentIntent(
  stripeSecretKey: string,
  paymentIntent: any,
  readerId: string
) {
  try {
    // Stripe API endpoint and parameters
    const stripeEndpoint = `https://api.stripe.com/v1/terminal/readers/${readerId}/collect_payment_method`
    const data = {
      payment_intent: paymentIntent,
    }

    // Make the HTTP request using axios
    const response = await fetch(stripeEndpoint, {
      // Set the authentication header
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization: `Basic ${Buffer.from(stripeSecretKey + ":").toString(
          "base64"
        )}`,
      },
      body: new URLSearchParams(data).toString(),
    })

    // Send the response back to the client
    return response.json()
  } catch (error) {
    // Handle errors
    console.log(error)
    throw error
  }
}

// handles creating a four digit number for the payment receipt for successful terminal payments
// required for compliance
export function multiplyByRandomFourDigitNumber(num: number) {
  // Generate a random 4-digit number
  const randomNum = Math.floor(Math.random() * (9999 - 1000 + 1)) + 1000

  // Multiply the given number by the random 4-digit number
  let result = num * randomNum

  // Ensure the result is a 4-digit number
  result %= 10000

  return result
}
