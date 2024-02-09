"use client"

import ReceiptForm from "./ReceiptForm"

const SuccessfulPayment = ({
  amountToCharge,
  paymentIntent,
}: {
  amountToCharge: string
  paymentIntent: any
}): JSX.Element => {
  return (
    <div>
      <h1 className='font-bold text-center text-xl text-green-800'>
        <span className='font-medium text-gray-900'>Approved, </span> $
        {Number(amountToCharge).toFixed(2)}.
      </h1>
      <p className='text-center mt-[.5rem]'>
        Transaction ID: {paymentIntent.id}
      </p>
      <div className='flex flex-col space-y-10 text-gray-600 text-center'>
        <ReceiptForm paymentIntent={paymentIntent} />
      </div>
    </div>
  )
}

export default SuccessfulPayment
