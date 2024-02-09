"use client"

import { useState } from "react"
import { handleDateFormat } from "utils"
import { Icons } from "./ui"
import { sendEmail } from "app/actions"

/**
 * renders all of the transactions related to terminal payments
 *
 * @component
 * @returns {JSX.Element} The rendered React component.
 */
const Transactions = ({ transactions }: { transactions: any }): JSX.Element => {
  const data = transactions.data
  const itemsPerPage = 15
  const [currentPage, setCurrentPage] = useState(1)

  // Calculate start and end indices based on the current page
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage

  // Filter and slice the data based on pagination
  const paginatedData = data
    .filter((t: any) => t.payment_method_types[0] === "card_present")
    .slice(startIndex, endIndex)

  const totalPages = Math.ceil(data.length / itemsPerPage)

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  return (
    <div className='mt-[5rem] bg-white rounded'>
      {paginatedData.map((transaction: any, index: any) => (
        <div
          key={index}
          className='text-sm grid grid-cols-2 gap-4 border-b px-3 py-5 text-left my-[2rem]'>
          <p className='col-span-full'>
            <span className='font-bold'>Transaction ID:</span> {transaction.id}
          </p>
          <p>
            <span className='font-bold'>Date:</span>{" "}
            {handleDateFormat(transaction.created)}
          </p>
          <p>
            <span className='font-bold'>Status:</span>{" "}
            {transaction.status.replaceAll("_", " ")}
          </p>
          <p>
            <span className='font-bold'>Amount:</span> $
            {(transaction.amount / 100).toFixed(2)}
          </p>
          <button
            onClick={async (e) => {
              const emailAddress = window.prompt("enter email address")
              if (emailAddress === null || emailAddress === "") {
                e.preventDefault()
                return
              } else {
                const result = await sendEmail(
                  "",
                  emailAddress,
                  "",
                  transaction
                )

                alert(`Email sent successfully to: ${emailAddress}.`)
              }
            }}>
            <Icons.FaEnvelope
              size={35}
              className='text-blue-800 border border-gray-200 rounded-full p-1 mx-auto'
            />
          </button>
        </div>
      ))}
      <div className='flex justify-center mt-4 pb-5'>
        {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
          <button
            key={page}
            className={`mx-2 px-4 py-2 rounded ${
              currentPage === page ? "bg-blue-800 text-white" : "bg-gray-300"
            }`}
            onClick={() => handlePageChange(page)}>
            {page}
          </button>
        ))}
      </div>
    </div>
  )
}

export default Transactions
