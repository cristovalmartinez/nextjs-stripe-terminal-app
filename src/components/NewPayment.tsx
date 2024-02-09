"use client"

import { useState } from "react"
import PaymentForm from "./PaymentForm"
import PaymentSuccessful from "./PaymentSuccessful"
import ReaderOffline from "./ReaderOffline"
import Transactions from "./Transactions"
import LogOut from "./LogOut"
import { Icons } from "./ui"

const menu = [
  { name: "Charge Customer", icon: <Icons.FaDollarSign /> },
  { name: "View Transactions", icon: <Icons.FaReceipt /> },
  { name: "Log Out", icon: <Icons.FaLongArrowAltRight /> },
]

/**
 * component renders the options of a new payment or showing transactions
 *
 * @component
 * @returns {JSX.Element} The rendered React component.
 */
const NewPayment = ({
  reader,
  transactions,
}: {
  reader: any
  transactions: any
}): JSX.Element => {
  const [amountToCharge, setAmountToCharge] = useState<string>("")
  const [paymentSuccess, setPaymentSuccess] = useState<boolean>(false)
  const [active, setActive] = useState<null | string>(null)
  const [loading, setLoading] = useState<boolean>(false)
  const [paymentIntent, setPaymentIntent] = useState<any>({})

  // function renders the selected component from the menu
  const renderMenuOption = () => {
    switch (active) {
      case "Charge Customer":
        return (
          <PaymentForm
            loading={loading}
            setLoading={setLoading}
            amountToCharge={amountToCharge}
            setAmountToCharge={setAmountToCharge}
            setPaymentSuccess={setPaymentSuccess}
            setPaymentIntent={setPaymentIntent}
          />
        )
      case "View Transactions":
        return <Transactions transactions={transactions} />

      case "Log Out":
        return <LogOut />
      default:
        return null
    }
  }

  return (
    <div className='payment-screen mx-[1rem] p-5'>
      {reader.status === "online" && !paymentSuccess && (
        <div className='grid grid-cols-full md:grid-cols-2 gap-10 my-5'>
          <p className='col-span-full font-medium text-lg'>
            What would you like to do?
          </p>
          {menu.map((item: any) => {
            return (
              <button
                disabled={loading}
                onClick={() => {
                  setActive(item.name)
                }}
                className={`p-8 ${
                  active === item.name
                    ? "bg-blue-800 border text-white"
                    : active === null
                    ? "bg-white bg-opacity-100"
                    : "bg-white opacity-30"
                }  font-semibold rounded shadow transition ease duration-300 text-sm md:text-lg flex items-center gap-x-2`}
                key={item.name}>
                <span className='text-green-900 text-xl'>{item.icon}</span>{" "}
                {item.name}
              </button>
            )
          })}
        </div>
      )}
      {paymentSuccess ? (
        <PaymentSuccessful
          amountToCharge={amountToCharge}
          paymentIntent={paymentIntent}
        />
      ) : (
        <>
          {reader.status === "offline" ? (
            <ReaderOffline loading={loading} setLoading={setLoading} />
          ) : (
            <>{renderMenuOption()}</>
          )}
        </>
      )}
    </div>
  )
}

export default NewPayment
