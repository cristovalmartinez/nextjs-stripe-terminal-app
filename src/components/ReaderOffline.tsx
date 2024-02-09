"use client"

import { useCookies } from "react-cookie"
import { Icons } from "./ui"
import { useRouter } from "next/navigation"

/**
 * component renders the ui for when a reader is offline. Does not allow payments ui or payments ui
 * if reader is offline
 *
 * @component
 * @returns {JSX.Element} The rendered React component.
 */
const ReaderOffline = ({
  loading,
  setLoading,
}: {
  loading: boolean
  setLoading: any
}): JSX.Element => {
  const [cookies, setCookie, removeCookie] = useCookies(["token"])
  const router = useRouter()

  return (
    <div className='text-center text-2xl flex flex-col items-center'>
      <h1 className='font-bold'>
        power your terminal to begin processing a payment.
      </h1>
      <button
        onClick={() => {
          setLoading(true)
          window.location.reload()
        }}
        disabled={loading}
        className='mt-[2rem] disabled:bg-opacity-40 disabled:shadow-sm lowercase shadow-lg hover:shadow-none transition ease duration-300 shadow-blue-400 bg-blue-900 py-5 rounded-full text-blue-100 w-2/3 md:w-1/3 flex items-center justify-center px-6 text-lg font-medium mx-auto'>
        check terminal status
      </button>
      <button
        onClick={() => {
          setLoading(true)
          removeCookie("token")
          router.replace("/signin")
        }}
        className='text-sm mt-8 border rounded-full px-4 py-2'>
        {!loading ? (
          `Log Out`
        ) : (
          <span className='flex block gap-x-2 items-center justify-center'>
            <Icons.FaSpinner className='animate-spin' />
          </span>
        )}
      </button>
    </div>
  )
}

export default ReaderOffline
