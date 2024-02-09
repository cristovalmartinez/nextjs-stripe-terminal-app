import { useState } from "react"

const BusinessInformation = () => {
  const [formData, setFormData] = useState({
    businessName: "",
    email: "",
    merchantId: "",
    website: "",
    country: "United States",
    streetAddress: "",
    city: "",
    state: "",
    zip: "",
  })

  /*
   * Function handles on change for input fields
   *
   */
  const handleChange = (field: string, value: string) => {
    setFormData({ ...formData, [field]: value })
  }

  /*
   * Function handles form submission
   *
   */
  const handleSubmit = (event: any) => {
    event.preventDefault()
    // Perform any additional logic with the emails (e.g., submit to server)
    console.log("Submitted emails:")
  }

  return (
    <form className='p-10'>
      <div className='space-y-12'>
        <div className='border-y border-gray-900/10 py-12'>
          <h3 className='text-left font-bold text-lg'>Business Details</h3>
          <div className='mt-10 grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6'>
            <div className='sm:col-span-full'>
              <label
                htmlFor='businessName'
                className='block text-sm font-medium leading-6 text-gray-900'>
                Business Name
              </label>
              <div className='mt-2'>
                <input
                  type='text'
                  value={formData.businessName}
                  name='businessName'
                  className='block placeholder:text-gray-300 w-full px-5 font-medium text-lg text-blue-900 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2 focus:outline-none py-4'
                  onChange={(e) => {
                    handleChange("businessName", e.target.value)
                  }}
                  required
                />
              </div>
            </div>
            <div className='sm:col-span-full'>
              <label
                htmlFor='email'
                className='block text-sm font-medium leading-6 text-gray-900'>
                Merchant ID
              </label>
              <div className='mt-2'>
                <input
                  type='text'
                  value={formData.merchantId}
                  name='merchantId'
                  className='block placeholder:text-gray-300 w-full px-5 font-medium text-lg text-blue-900 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2 focus:outline-none py-4'
                  onChange={(e) => {
                    handleChange("merchantId", e.target.value)
                  }}
                  required
                />
              </div>
            </div>

            <div className='sm:col-span-full'>
              <label
                htmlFor='email'
                className='block text-sm font-medium leading-6 text-gray-900'>
                Email Address
              </label>
              <div className='mt-2'>
                <input
                  type='text'
                  value={formData.email}
                  name='email'
                  className='block placeholder:text-gray-300 w-full px-5 font-medium text-lg text-blue-900 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2 focus:outline-none py-4'
                  onChange={(e) => {
                    handleChange("email", e.target.value)
                  }}
                  required
                />
              </div>
            </div>
            <div className='sm:col-span-full'>
              <label
                htmlFor='website'
                className='block text-sm font-medium leading-6 text-gray-900'>
                {"website (optional)"}
              </label>
              <div className='mt-2'>
                <input
                  type='text'
                  value={formData.website}
                  name='website'
                  className='block placeholder:text-gray-300 w-full px-5 font-medium text-lg text-blue-900 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2 focus:outline-none py-4'
                  onChange={(e) => {
                    handleChange("website", e.target.value)
                  }}
                />
              </div>
            </div>

            <div className='col-span-full'>
              <label
                htmlFor='streetAddress'
                className='block text-sm font-medium leading-6 text-gray-900'>
                Street Address
              </label>
              <input
                type='text'
                value={formData.streetAddress}
                name='streetAddress'
                className='block placeholder:text-gray-300 w-full px-5 font-medium text-lg text-blue-900 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2 focus:outline-none py-4'
                onChange={(e) => {
                  handleChange("streetAddress", e.target.value)
                }}
                required
              />
            </div>

            <div className='sm:col-span-2 sm:col-start-1'>
              <label
                htmlFor='city'
                className='block text-sm font-medium leading-6 text-gray-900'>
                City
              </label>
              <div className='mt-2'>
                <input
                  type='text'
                  value={formData.city}
                  name='city'
                  className='block placeholder:text-gray-300 w-full px-5 font-medium text-lg text-blue-900 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2 focus:outline-none py-4'
                  onChange={(e) => {
                    handleChange("city", e.target.value)
                  }}
                  required
                />
              </div>
            </div>

            <div className='sm:col-span-2'>
              <label
                htmlFor='region'
                className='block text-sm font-medium leading-6 text-gray-900'>
                State / Province
              </label>
              <div className='mt-2'>
                <input
                  type='text'
                  value={formData.state}
                  name='state'
                  className='block placeholder:text-gray-300 w-full px-5 font-medium text-lg text-blue-900 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2 focus:outline-none py-4'
                  onChange={(e) => {
                    handleChange("state", e.target.value)
                  }}
                  required
                />
              </div>
            </div>

            <div className='sm:col-span-2'>
              <label
                htmlFor='zip'
                className='block text-sm font-medium leading-6 text-gray-900'>
                ZIP / Postal code
              </label>
              <div className='mt-2'>
                <input
                  type='text'
                  value={formData.zip}
                  name='zip'
                  className='block placeholder:text-gray-300 w-full px-5 font-medium text-lg text-blue-900 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2 focus:outline-none py-4'
                  onChange={(e) => {
                    handleChange("zip", e.target.value)
                  }}
                  required
                />
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className='mt-6 flex items-center justify-end gap-x-6'>
        <button
          type='button'
          className='text-sm font-semibold leading-6 text-gray-900'>
          Cancel
        </button>
        <button
          className='bg-gray-900 text-white py-2 px-10 rounded-full'
          type='submit'>
          save
        </button>
      </div>
    </form>
  )
}

export default BusinessInformation
