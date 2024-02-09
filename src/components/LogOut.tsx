import { redirect } from "next/navigation"
import { useCookies } from "react-cookie"

/**
 * logout component when rendered handles removing token from cookies, invalidate session
 *
 * @component
 * @returns {JSX.Element} The rendered React component.
 */
const LogOut = (): JSX.Element => {
  const [_, __, removeCookie] = useCookies(["token"])
  removeCookie("token")
  return redirect("/signin")
}

export default LogOut
