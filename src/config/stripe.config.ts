import Stripe from "stripe"
import { createEnvError } from "utils/error-handler"

const stripeSecretKey = process.env.STRIPE_SECRET_KEY
const stripeApiVersion = process.env.STRIPE_API_VERSION
const readerId = process.env.STRIPE_READER_ID

// Check if enviornment variables have been defined
if (!stripeSecretKey || !stripeApiVersion || !readerId) {
  throw createEnvError(
    "stripe",
    `stripeSecretKey: ${stripeSecretKey} or stripeApiVersion: ${stripeApiVersion}or readerId: ${readerId}`
  )
}

// Instantiate new stripe module
const stripe = new Stripe(stripeSecretKey, {
  // Stripe has hard-coded the stripe api version type
  // different api versions will throw typescript error. not an actual error.
  // @ts-ignore
  apiVersion: stripeApiVersion,
})

// export the stripe api object to use throughout the application
export const stripeConfig = {
  stripe,
  readerId,
}
