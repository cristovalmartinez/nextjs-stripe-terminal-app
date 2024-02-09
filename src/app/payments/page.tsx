import NewPayment from "components/NewPayment"
import { Header } from "components/ui"
import { stripeConfig } from "config/stripe.config"

const { stripe, readerId } = stripeConfig

export const dynamic = "force-dynamic"

/**
 * Home page. application main page
 *
 * @page
 * @returns {JSX.Element} The rendered React components.
 */
const HomePage = async (): Promise<JSX.Element> => {
  const reader = await stripe.terminal.readers.retrieve(readerId)
  const transactions = await stripe.paymentIntents.list({ limit: 100 })

  return (
    <>
      <Header reader={reader} />
      <section className='home'>
        <div className='home__container'>
          <NewPayment reader={reader} transactions={transactions} />
        </div>
      </section>
    </>
  )
}

export default HomePage
