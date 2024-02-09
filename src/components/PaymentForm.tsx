"use client"

import { Icons } from "./ui"
import { ProcessPayment, cancelPaymentAttempt } from "app/actions"

/**
 * component renders the ui for a new payment, handling input and connecting the terminal for
 * the desired payment attempt
 *
 * @component
 * @returns {JSX.Element} The rendered React component.
 */
const PaymentForm = ({
  loading,
  setLoading,
  amountToCharge,
  setAmountToCharge,
  setPaymentSuccess,
  setPaymentIntent,
}: {
  loading: boolean
  setLoading: any
  amountToCharge: string
  setAmountToCharge: any
  setPaymentSuccess: any
  setPaymentIntent: any
}): JSX.Element => {
  function amountToChargeCustomer(event: any) {
    const amount = event.target.value.replace(/[^\d.]/g, "")

    setAmountToCharge(amount)
  }

  return (
    <div className='mt-10'>
      <h1 className='font-bold text-center'>Enter amount in USD to charge:</h1>
      <form className='flex flex-col space-y-10'>
        <div className='mt-4 flex items-center ps-4 border border-gray-300 rounded max-w-xl w-full mx-auto'>
          <p className='text-xl px-2 font-semibold border-r-2 border-gray-400 text-gray-500'>
            $
          </p>
          <input
            id='payment-screen'
            type='text'
            name='amount'
            disabled={loading}
            value={amountToCharge}
            className='w-full px-5 ml-4 font-medium text-lg text-blue-900 bg-gray-100 border-gray-400 rounded focus:ring-blue-500 focus:ring-2 focus:outline-none py-4'
            onChange={amountToChargeCustomer}
            required={true}
          />
        </div>
        <div className='relative flex space-y-4 flex-col justify-center items-center'>
          {Number(amountToCharge) > 0.4 && (
            <button
              type='submit'
              disabled={loading}
              onClick={async (e) => {
                if (Number(amountToCharge) > 999999.99) {
                  window.alert("Enter a value smaller than $999,999.99")
                  e.preventDefault()
                  return
                }
                e.preventDefault()
                setLoading(true)
                const result = await ProcessPayment(amountToCharge)
                // @ts-ignore
                if (result?.message === "succeeded") {
                  setPaymentSuccess(true)
                  setPaymentIntent(result?.paymentIntent)
                } else {
                  window.alert("failed to process payment. please try again")
                  e.preventDefault()
                  return
                }
                setLoading(false)
              }}
              className='disabled:bg-opacity-40 h-16 disabled:shadow-sm lowercase shadow-lg hover:shadow-md transition ease duration-500 shadow-blue-400 bg-blue-900 py-5 rounded-full text-blue-200 w-2/3 md:w-1/3 flex items-center justify-center px-6 text-lg font-medium mx-auto'>
              {!loading ? (
                `charge 
        $${Number(amountToCharge).toFixed(2)}`
              ) : (
                <span className='flex block gap-x-2 items-center justify-center'>
                  in progress
                  <Icons.FaSpinner className='animate-spin' />
                </span>
              )}
              {!loading && <Icons.FaChevronRight className='ml-2' />}
            </button>
          )}
          {loading && (
            <button
              type='reset'
              className='font-semibold py-4 rounded-full text-red-500 px-5'
              onClick={() => {
                setLoading(false)
                cancelPaymentAttempt()
              }}>
              cancel
            </button>
          )}
        </div>
      </form>
    </div>
  )
}

export default PaymentForm
