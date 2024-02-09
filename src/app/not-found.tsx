/**
 * Not found page when requested resources do not exist, this page is shown on the client ui.
 *
 * @page
 * @returns {JSX.Element} The rendered React page.
 */
const NotFoundPage = (): JSX.Element => {
  return (
    <div className='h-screen w-full flex items-center justify-center'>
      The requested resources are not found.
    </div>
  )
}

export default NotFoundPage
