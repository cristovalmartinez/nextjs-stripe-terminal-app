"use server"

import { revalidatePath } from "next/cache"
import { handleDateFormat } from "utils"
import nodemailer from "nodemailer"
import type Mail from "nodemailer/lib/mailer"
import { cookies } from "next/headers"
import jwt from "jsonwebtoken"
import { stripeConfig } from "config/stripe.config"
import { multiplyByRandomFourDigitNumber } from "utils"
import { createApiError } from "utils/error-handler"

const { stripe, readerId } = stripeConfig

/**
 *  STRIPE API FUNCTIONS
 */

// First step for processing  terminal payment is creating a payment intent using stripe api
async function createPaymentIntent(amount: string) {
  try {
    const newAmount = parseFloat(amount)
    const convertToCents =
      newAmount % 1 === 0 ? Math.round(newAmount * 100) : newAmount * 100
    const paymentIntent = await stripe.paymentIntents.create({
      currency: "usd",
      payment_method_types: ["card_present"],
      capture_method: "automatic_async",
      amount: convertToCents,
      metadata: { response_code: multiplyByRandomFourDigitNumber(3030) },
    })
    return paymentIntent
  } catch (error: any) {
    console.error(error)
    throw createApiError(400, error.message)
  }
}

// second step for processing  terminal payment is processing payment and wait for
// customer to present payment method in person
async function processPaymentIntent(data: any) {
  const reader = await stripe.terminal.readers.processPaymentIntent(readerId, {
    payment_intent: data.id,
  })
  const paymentIntent = await stripe.paymentIntents.retrieve(data.id, {
    expand: ["payment_method"],
  })

  return { reader, data: paymentIntent }
}

// encapsulate all previous payment processing functions into one
export async function ProcessPayment(amount: string) {
  try {
    let paymentComplete = { status: false, message: "", paymentIntent: {} }
    const status = await createPaymentIntent(amount)
      .then(processPaymentIntent)
      .then((response) => {
        const checkStatusInterval = setInterval(async () => {
          const reader = await stripe.terminal.readers.retrieve(
            response.reader.id
          )

          // @ts-ignore
          const updatedStatus = reader
          // @ts-ignore
          if (updatedStatus.action.status === "succeeded") {
            // Payment has succeeded
            clearInterval(checkStatusInterval)
            paymentComplete.status = true
            paymentComplete.message = "succeeded"
            const paymentIntentId =
              // @ts-ignore
              updatedStatus?.action.process_payment_intent.payment_intent
            const paymentIntent = await stripe.paymentIntents
              .retrieve(paymentIntentId, {
                expand: ["payment_method"],
              })
              .then(async (response) => {
                if (response.latest_charge) {
                  const charge = await stripe.charges.retrieve(
                    // @ts-ignore
                    response.latest_charge
                  )
                  paymentComplete.paymentIntent = { ...response, charge }
                } else {
                  paymentComplete.paymentIntent = { response }
                }
              })
          } else if (
            // @ts-ignore
            updatedStatus?.action.status === "canceled" ||
            // @ts-ignore
            updatedStatus?.action.status === "failed"
          ) {
            // Payment has failed or canceled
            clearInterval(checkStatusInterval)
            paymentComplete.status = true
            // @ts-ignore
            paymentComplete.message = updatedStatus.status
            // @ts-ignore
            console.log("Payment failed or canceled:", updatedStatus.status)
          } else {
            // Payment in progress
            process.env.NODE_ENV === "development" &&
              (await stripe.testHelpers.terminal.readers.presentPaymentMethod(
                readerId
              ))
            // @ts-ignore
            console.log("Payment status:", updatedStatus.status)
          }
        }, 4000) // Check every 4 seconds
      })

    // Wait for the payment to be complete
    while (!paymentComplete.status) {
      await new Promise((resolve) => setTimeout(resolve, 1000))
    }

    revalidatePath("/")
    return paymentComplete
  } catch (error) {
    console.log(error)
    throw error
  }
}

// function handles canceling payment attempts on terminal while in progress
export async function cancelPaymentAttempt() {
  const reader = await stripe.terminal.readers.cancelAction(readerId)
  return reader
}

/**
 *  NODEMAILER API FUNCTIONS
 */

// function to generate an email template for transaction receipt
const htmlEmailTemplate = function (paymentIntent: any, customerName: string) {
  return `<html xmlns="http://www.w3.org/1999/xhtml">
  <head>
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="x-apple-disable-message-reformatting" />
    <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
    <meta name="color-scheme" content="light dark" />
    <meta name="supported-color-schemes" content="light dark" />
    <title></title>
    <style type="text/css" rel="stylesheet" media="all">
    /* Base ------------------------------ */
    
    @import url("https://fonts.googleapis.com/css?family=Nunito+Sans:400,700&display=swap");
    body {
      width: 100% !important;
      height: 100%;
      margin: 0;
      -webkit-text-size-adjust: none;
      background-color: lightgray;
    }
    
    a {
      color: #3869D4;
    }
    
    a img {
      border: none;
    }
    
    td {
      word-break: break-word;
    }
    
    .preheader {
      display: none !important;
      visibility: hidden;
      mso-hide: all;
      font-size: 1px;
      line-height: 1px;
      max-height: 0;
      max-width: 0;
      opacity: 0;
      overflow: hidden;
    }
    /* Type ------------------------------ */
    
    body,
    td,
    th {
      font-family: "Nunito Sans", Helvetica, Arial, sans-serif;
    }
    
    h1 {
      margin-top: 0;
      color: #333333;
      font-size: 18px;
      font-weight: bold;
      text-align: left;
    }
    
    h2 {
      margin-top: 0;
      color: #333333;
      font-size: 14px;
      font-weight: bold;
      text-align: left;
    }
    
    h3 {
      margin-top: 0;
      color: #333333;
      font-size: 13px;
      font-weight: bold;
      text-align: left;
    }
    
    td,
    th {
      font-size: 14px;
    }
    
    p,
    ul,
    ol,
    blockquote {
      margin: .4em 0 1.1875em;
      font-size: 13px;
      line-height: 1.625;
    }
    
    p.sub {
      font-size: 13px;
    }
    /* Utilities ------------------------------ */
    
    .align-right {
      text-align: right;
    }
    
    .align-left {
      text-align: left;
    }
    
    .align-center {
      text-align: center;
    }
    
    .u-margin-bottom-none {
      margin-bottom: 0;
    }
    /* Buttons ------------------------------ */
    
    .button {
      background-color: #3869D4;
      border-top: 10px solid #3869D4;
      border-right: 18px solid #3869D4;
      border-bottom: 10px solid #3869D4;
      border-left: 18px solid #3869D4;
      display: inline-block;
      color: #FFF;
      text-decoration: none;
      border-radius: 3px;
      box-shadow: 0 2px 3px rgba(0, 0, 0, 0.16);
      -webkit-text-size-adjust: none;
      box-sizing: border-box;
    }
    
    @media only screen and (max-width: 500px) {
      .button {
        width: 100% !important;
        text-align: center !important;
      }
    }
    /* Attribute list ------------------------------ */
    
    .attributes {
      margin: 0 0 21px;
    }
    
    .attributes_content {
      background-color: #F4F4F7;
      padding: 16px;
    }
    
    .attributes_item {
      padding: 0;
    }
    /* Related Items ------------------------------ */
    
    .related {
      width: 100%;
      margin: 0;
      padding: 25px 0 0 0;
      -premailer-width: 100%;
      -premailer-cellpadding: 0;
      -premailer-cellspacing: 0;
    }
    
    .related_item {
      padding: 10px 0;
      font-size: 13px;
      line-height: 18px;
    }
    
    .related_item-title {
      display: block;
      margin: .5em 0 0;
    }
    
    .related_item-thumb {
      display: block;
      padding-bottom: 10px;
    }
    
    .related_heading {
      border-top: 1px solid #CBCCCF;
      text-align: center;
      padding: 25px 0 10px;
    }
    /* Discount Code ------------------------------ */
    


    


    

    
    
    .purchase {
      width: 100%;
      margin: 0;
      padding: 35px 0;
      -premailer-width: 100%;
      -premailer-cellpadding: 0;
      -premailer-cellspacing: 0;
    }
    
    .purchase_content {
      width: 100%;
      margin: 0;
      padding: 25px 0 0 0;
      -premailer-width: 100%;
      -premailer-cellpadding: 0;
      -premailer-cellspacing: 0;
    }
    
    .purchase_item {
      padding: 10px 0;
      color: #51545E;
      font-size: 12px;
      line-height: 18px;
    }
    
    .purchase_heading {
      padding-bottom: 8px;
      border-bottom: 1px solid #EAEAEC;
    }
    
    .purchase_heading p {
      margin: 0;
      color: #85878E;
      font-size: 12px;
    }
    
    .purchase_footer {
      padding-top: 15px;
      border-top: 1px solid #EAEAEC;
    }
    
    .purchase_total {
      margin: 0;
      text-align: right;
      font-weight: bold;
      color: #333333;
    }
    
    .purchase_total--label {
      padding: 0 15px 0 0;
    }
    
    body {
      background-color: #F2F4F6;
      color: #51545E;
    }
    
    p {
      color: #51545E;
    }
    
    .email-wrapper {
      width: 100%;
      margin: 0;
      padding: 0;
      -premailer-width: 100%;
      -premailer-cellpadding: 0;
      -premailer-cellspacing: 0;
      background-color: #F2F4F6;
    }
    
    .email-content {
      width: 100%;
      margin: 0;
      padding: 0;
      -premailer-width: 100%;
      -premailer-cellpadding: 0;
      -premailer-cellspacing: 0;
    }
    /* Masthead ----------------------- */
    
    .email-masthead {
      padding: 25px 0;
      text-align: center;
    }
    
    .email-masthead_logo {
      width: 94px;
    }
    
    .email-masthead_name {
      font-size: 14px;
      font-weight: bold;
      color: #A8AAAF;
      text-decoration: none;
      text-shadow: 0 1px 0 white;
    }
    /* Body ------------------------------ */
    
    .email-body {
      width: 100%;
      margin: 0;
      padding: 0;
      -premailer-width: 100%;
      -premailer-cellpadding: 0;
      -premailer-cellspacing: 0;
    }
    
    .email-body_inner {
      width: 570px;
      margin: 0 auto;
      padding: 0;
      -premailer-width: 570px;
      -premailer-cellpadding: 0;
      -premailer-cellspacing: 0;
      background-color: #FFFFFF;
    }
    
    .email-footer {
      width: 570px;
      margin: 0 auto;
      padding: 0;
      -premailer-width: 570px;
      -premailer-cellpadding: 0;
      -premailer-cellspacing: 0;
      text-align: center;
    }
    
    .email-footer p {
      color: #A8AAAF;
    }
    
    .body-action {
      width: 100%;
      margin: 30px auto;
      padding: 0;
      -premailer-width: 100%;
      -premailer-cellpadding: 0;
      -premailer-cellspacing: 0;
      text-align: center;
    }
    
    .body-sub {
      margin-top: 25px;
      padding-top: 25px;
      border-top: 1px solid #EAEAEC;
    }
    
    .content-cell {
      padding: 45px;
    }
    /*Media Queries ------------------------------ */
    
    @media only screen and (max-width: 600px) {
      .email-body_inner,
      .email-footer {
        width: 100% !important;
      }
    }
    
    @media (prefers-color-scheme: dark) {
      body,
      .email-body,
      .email-body_inner,
      .email-content,
      .email-wrapper,
      .email-masthead,
      .email-footer {
        background-color: #444  !important;
        color: #FFF !important;
      }
      p,
      ul,
      ol,
      blockquote,
      h1,
      h2,
      h3,
      span,
      .purchase_item {
        color: #FFF !important;
      }
      .attributes_content,
      .discount {
        background-color: #222 !important;
      }
      .email-masthead_name {
        text-shadow: none !important;
      }
    }
    
    :root {
      color-scheme: light dark;
      supported-color-schemes: light dark;
    }
    </style>
    <!--[if mso]>
    <style type="text/css">
      .f-fallback  {
        font-family: Arial, sans-serif;
      }
    </style>
  <![endif]-->
  </head>
  <body>

   
    <table class="email-wrapper" width="100%" cellpadding="0" cellspacing="0" role="presentation">
      <tr>
        <td align="center">
          <table class="email-content" width="100%" cellpadding="0" cellspacing="0" role="presentation">
          <!--[if mso]>
            <tr>
              <td class="email-masthead">
                <a href="https://example.com" class="f-fallback email-masthead_name">
                [logo]
              </a>
              </td>
            </tr>
            <![endif]-->
            <!-- Email Body -->
            <tr>
              <td class="email-body" width="570" cellpadding="0" cellspacing="0">
                <table class="email-body_inner" align="center" width="570" cellpadding="0" cellspacing="0" role="presentation">
                  <!-- Body content -->
                  <tr>
                    <td class="content-cell">
                      <div class="f-fallback">
                        <h1>For ${customerName},</h1>
                        <p>Details for recent payment of $${(
                          paymentIntent.amount / 100
                        ).toFixed(2)}.</p>


                        <table class="purchase" width="100%" cellpadding="0" cellspacing="0" role="presentation">
                          <tr>
                            <td>
                              <h3>${paymentIntent.id}</h3></td>
                            <td>
                              <h3 class="align-right">${handleDateFormat(
                                paymentIntent.created
                              )}</h3></td>
                          </tr>
                                                    <tr>
                            <td colspan='2'>
                              <h3>${customerName}</h3></td>
                          </tr>
                          <tr>
                            <td colspan="2">
                              <table class="purchase_content" width="100%" cellpadding="0" cellspacing="0">
                                <tr>
                                  <th class="purchase_heading" align="left">
                                    <p class="f-fallback">Name</p>
                                  </th>
                                  <th class="purchase_heading" align="right">
                                    <p class="f-fallback">Description</p>
                                  </th>
                                </tr>
                                <tr>
                                  <td width="30%" class="purchase_item"><span class="f-fallback">TRANSACTION ID:</span></td>
                                  <td class="align-right" width="70%" class="purchase_item"><span class="f-fallback">${
                                    paymentIntent.id
                                  }</span></td>
                                </tr>
                                <tr>
                                <td width="30%" class="purchase_item"><span class="f-fallback">TERMINAL ID:</span></td>
                                <td class="align-right" width="70%" class="purchase_item"><span class="f-fallback">Black Wise</span></td>
                              </tr>
                                                                <tr>
                                  <td width="30%" class="purchase_item"><span class="f-fallback">DATE:</span></td>
                                  <td class="align-right" width="70%" class="purchase_item"><span class="f-fallback">${handleDateFormat(
                                    paymentIntent.created
                                  )}</span></td>
                                </tr>

                                <tr>
                                <td width="30%" class="purchase_item"><span class="f-fallback">TYPE:</span></td>
                                <td class="align-right" width="70%" class="purchase_item"><span class="f-fallback">${
                                  paymentIntent?.charge?.payment_method_details
                                    ?.card_present?.funding
                                    ? paymentIntent?.charge
                                        ?.payment_method_details?.card_present
                                        ?.funding
                                    : "N/A"
                                }</span></td>
                              </tr>

                              <tr>
                              <td width="30%" class="purchase_item"><span class="f-fallback">ENTRY MODE:</span></td>
                              <td class="align-right" width="70%" class="purchase_item"><span class="f-fallback">${
                                paymentIntent?.charge?.payment_method_details
                                  ?.card_present?.read_method
                                  ? paymentIntent?.charge?.payment_method_details?.card_present?.read_method.replaceAll(
                                      "_",
                                      " "
                                    )
                                  : "N/A"
                              }</span></td>
                            </tr>
                                                                                                <tr>
                                  <td width="30%" class="purchase_item"><span class="f-fallback">CARD TYPE:</span></td>
                                  <td class="align-right" width="70%" class="purchase_item"><span class="f-fallback">${
                                    paymentIntent?.charge
                                      ?.payment_method_details?.card_present
                                      ?.brand
                                      ? paymentIntent?.charge
                                          ?.payment_method_details?.card_present
                                          ?.brand
                                      : "N/A"
                                  }</span></td>
                                </tr>
                                                                <tr>
                                  <td width="30%" class="purchase_item"><span class="f-fallback">CARD #:</span></td>
                                  <td class="align-right" width="70%" class="purchase_item"><span class="f-fallback">${
                                    paymentIntent?.charge
                                      ?.payment_method_details?.card_present
                                      .last4
                                      ? "XXXX-XXXX-" +
                                        paymentIntent?.charge
                                          ?.payment_method_details?.card_present
                                          .last4
                                      : "N/A"
                                  }</span></td>
                                </tr>
                                                                                                <tr>
                                  <td width="30%" class="purchase_item"><span class="f-fallback">RESPONSE:</span></td>
                                  <td class="align-right" width="70%" class="purchase_item"><span class="f-fallback">${
                                    paymentIntent?.charge?.status ===
                                    "succeeded"
                                      ? "APPROVED"
                                      : paymentIntent.status.replaceAll(
                                          "_",
                                          " "
                                        )
                                  }</span></td>
                                </tr>
                                <tr>
                                <td width="30%" class="purchase_item"><span class="f-fallback">RESPONSE CODE:</span></td>
                                <td class="align-right" width="70%" class="purchase_item"><span class="f-fallback">${
                                  paymentIntent?.metadata?.response_code
                                    ? paymentIntent?.metadata?.response_code
                                    : "3030"
                                }</span></td>
                              </tr>
                              <tr>
                              <td width="30%" class="purchase_item"><span class="f-fallback">NETWORK STATUS:</span></td>
                              <td class="align-right" width="70%" class="purchase_item"><span class="f-fallback">${
                                paymentIntent?.charge?.outcome?.network_status
                                  ? paymentIntent?.charge?.outcome?.network_status?.replaceAll(
                                      "_",
                                      " "
                                    )
                                  : "N/A"
                              }</span></td>
                            </tr>
                                <tr>
                                  <td width="30%" class="purchase_footer" valign="middle">
                                    <p class="f-fallback purchase_total purchase_total--label">AMOUNT AUTHORIZED:</p>
                                  </td>
                                  <td width="70%" class="purchase_footer" valign="middle">
                                    <p class="f-fallback purchase_total">$${(
                                      paymentIntent.amount / 100
                                    ).toFixed(2)}</p>
                                  </td>
                                </tr>
                              </table>
                            </td>
                          </tr>
                        </table>
                        <p>If you have any questions about receipt, reach out to ${
                          process.env.ADMIN_EMAIL
                        }.</p>
                        <p>Cheers,
                        </p>

                      </div>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
            <tr>
              <td>
                <table class="email-footer" align="center" width="570" cellpadding="0" cellspacing="0" role="presentation">
                  <tr>
                    <td class="content-cell" align="center">
                      <p class="f-fallback sub align-center">
                       CRYPTOX HUB LLC
                        <br/>
                                                 cryptoxhub305@gmail.com

                  <br/>
                          201-207-9236
                      </p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`
}

// handles sending an email using the nodemailer api methods
export async function sendEmail(
  customerName: string,
  adminEmail: any,
  customerEmail: string,
  transaction: any
) {
  const paymentIntent = {
    ...transaction,
    payment_method:
      transaction.payment_method === null ? {} : transaction.payment_method,
    charge: transaction.charge
      ? transaction.charge
      : !transaction.latest_charge
      ? {}
      : await stripe.charges.retrieve(
          // @ts-ignore
          transaction.latest_charge
        ),
  }

  const mailOptions: Mail.Options = {
    from: process.env.DUMMY_EMAIL_CARRIER,
    to: adminEmail,
    cc: customerEmail && customerEmail !== "" ? customerEmail : adminEmail,
    subject: `Cryptoxhub Payment Receipt`,
    html: htmlEmailTemplate(paymentIntent, customerName),
  }

  try {
    const transport = nodemailer.createTransport({
      service: "gmail",
      /* 
        setting service as 'gmail' is same as providing these setings:
        host: "smtp.gmail.com",
        port: 465,
        secure: true
        If you want to use a different email provider other than gmail, you need to provide these manually.
        Or you can go use these well known services and their settings at
        https://github.com/nodemailer/nodemailer/blob/master/lib/well-known/services.json
    */
      auth: {
        user: process.env.DUMMY_EMAIL_CARRIER,
        pass: process.env.ADMIN_PASSWORD,
      },
    })

    const emailStatus = transport.sendMail(mailOptions, function (err: any) {
      if (!err) {
        return "Email sent"
      } else {
        throw err
      }
    })
    revalidatePath("/")
    return emailStatus
  } catch (error) {
    console.error(error)
    throw Error
  }
}

/**
 *  SIGNIN API FUNCTIONS
 */

// function handles signing in a user into the dashboard of the application
export async function Signin(email: string, password: string) {
  try {
    const isValidUser = validateUser(email, password)

    if (isValidUser) {
      // Generate a JWT token with user information
      const token = generateToken(email)
      // Send the token as a response
      cookies().set("token", token, { secure: true })
    } else {
      // Send an error response for invalid credentials
      return { message: "enter valid credentials to continue", error: true }
    }
    revalidatePath("/signin")
    return { message: "success", error: false }
  } catch (error) {
    return {
      message: "",
      error: true,
    }
  }
}

// Validate user credentials (replace this with your authentication logic)
function validateUser(email: string, password: string) {
  if (email === "cryptoxhub305@gmail.com" && password === "cryptoxhub10-99") {
    return true
  } else {
    return false
  }
}

// Generate a JWT token with user information
function generateToken(email: string) {
  // Replace 'your-secret-key' with a secret key for token signing
  const token = jwt.sign({ email }, "jwt-key", { expiresIn: "1h" })
  return token
}
