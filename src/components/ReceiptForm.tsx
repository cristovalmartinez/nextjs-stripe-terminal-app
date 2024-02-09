"use client"

import { useState } from "react"
import { Icons } from "./ui"
import { sendEmail } from "app/actions"
import Link from "next/link"

/**
 * component renders after payment is successful to send receipt to desired email address
 * using the nodemailer api
 *
 * @component
 * @returns {JSX.Element} The rendered React component.
 */
const ReceiptForm = ({
  paymentIntent,
}: {
  paymentIntent: any
}): JSX.Element => {
  const [formData, setFormData] = useState({
    emails: [""],
    customerName: "",
    customerEmail: "",
  })
  const [customerDetails, setCustomerDetails] = useState<boolean>(true)
  const [loading, setLoading] = useState<boolean>(false)

  //Function handles input change in the form
  const handleEmailChange = (index: number, value: string) => {
    const newEmails = [...formData.emails]
    newEmails[index] = value
    setFormData({ ...formData, emails: newEmails })
    console.log(formData.emails[0])
  }

  //Function handles email input change in the form
  const handleAddEmailField = () => {
    setFormData({ ...formData, emails: [...formData.emails, ""] })
  }

  // Function handles when an email input field
  const handleRemoveEmailField = (index: number) => {
    const newEmails = [...formData.emails]
    newEmails.splice(index, 1)
    setFormData({ ...formData, emails: newEmails })
  }

  // Function handles on change for input fields
  const handleChange = (field: string, value: string) => {
    setFormData({ ...formData, [field]: value })
  }

  return (
    <form className='p-10'>
      <p className='mb-5'>Email receipt to:</p>
      <div className='relative w-full flex flex-col items-center justify-start'>
        <div className='flex flex-col gap-4 w-full items-center justify-between'>
          {formData.emails.map((email, index) => (
            <div key={index}>
              <input
                id={`email-${index + 1}`}
                type='email'
                value={email}
                name={`email-${index + 1}`}
                className='block placeholder:text-gray-300 w-full px-5 font-medium text-lg text-blue-900 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2 focus:outline-none py-4'
                onChange={(e) => handleEmailChange(index, e.target.value)}
                required
              />
              {index > 0 && (
                <button
                  type='button'
                  onClick={() => handleRemoveEmailField(index)}>
                  Remove
                </button>
              )}
            </div>
          ))}
        </div>
        <button
          type='button'
          className='absolute bottom-0 right-0 uppercase'
          onClick={handleAddEmailField}>
          <Icons.FaPlusSquare className='text-green-900' size={30} />
          Add
        </button>
      </div>
      <div className='space-y-12'>
        <div className='flex items-center gap-x-5 mt-[3rem]'>
          <input
            checked={customerDetails}
            type='checkbox'
            name=''
            id=''
            onChange={() => {
              setCustomerDetails(!customerDetails)
            }}
          />
          <label htmlFor='customerCheckbox'>Add customer details?</label>
        </div>
        {customerDetails && (
          <div className='border-b border-gray-900/10 pb-6'>
            <h3 className='text-left font-bold text-lg'>
              Customer Information
            </h3>
            <div className='mt-10 grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6'>
              <div className='sm:col-span-full'>
                <label
                  htmlFor='customerName'
                  className='block text-sm font-medium leading-6 text-gray-900'>
                  Customer Name
                </label>
                <div className='mt-2'>
                  <input
                    type='text'
                    value={formData.customerName}
                    name='customerName'
                    className='block placeholder:text-gray-300 w-full px-5 font-medium text-lg text-blue-900 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2 focus:outline-none py-4'
                    onChange={(e) => {
                      handleChange("customerName", e.target.value)
                    }}
                    required
                  />
                </div>
              </div>

              <div className='sm:col-span-full'>
                <label
                  htmlFor='customerEmail'
                  className='block text-sm font-medium leading-6 text-gray-900'>
                  {"Customer Email Address (optional)"}
                </label>
                <div className='mt-2'>
                  <input
                    type='email'
                    value={formData.customerEmail}
                    name='email'
                    className='block placeholder:text-gray-300 w-full px-5 font-medium text-lg text-blue-900 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2 focus:outline-none py-4'
                    onChange={(e) => {
                      handleChange("customerEmail", e.target.value)
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
      <div className='mt-6 flex items-center justify-end gap-x-6'>
        <button
          type='submit'
          disabled={loading}
          onClick={async (e) => {
            if (formData.emails[0] === "") {
              window.alert("Enter your email address to send receipt")
              e.preventDefault()
              return
            }
            if (formData.customerName === "" && customerDetails) {
              window.alert("Enter customer name")
              e.preventDefault()
              return
            }
            setLoading(true)
            const emailConfirmation = await sendEmail(
              formData.customerName,
              formData.emails[0],
              formData.customerEmail,
              paymentIntent
            )
            window.location.reload()
          }}
          className='disabled:bg-opacity-40 h-16 disabled:shadow-sm lowercase shadow-lg hover:shadow-none transition ease duration-300 shadow-blue-400 bg-blue-900 py-5 rounded-full text-blue-100 w-2/3 md:w-1/3 flex items-center justify-center px-6 text-lg font-medium'>
          {loading ? <Icons.FaSpinner className='animate-spin' /> : "finish"}
        </button>
      </div>
      <p className='mt-[2rem] text-gray-400 text-left'>
        For the latest technical docs regarding Stripe terminal, refer to their
        official{" "}
        <Link className='underline' href='https://www.stripe.com'>
          website.
        </Link>
      </p>
    </form>
  )
}

export default ReceiptForm
