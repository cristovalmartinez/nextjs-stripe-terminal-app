export function createEnvError(subject: string, variableName: string): Error {
  return new Error(
    `${subject?.toUpperCase()}: Environment variable '${variableName}' is missing`
  )
}

export function createApiError(statusCode: number, message: string): Error {
  const error: any = new Error(message)

  error.statusCode = statusCode
  return error
}
