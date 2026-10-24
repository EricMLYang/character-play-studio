/** 伺服器回的錯誤，帶狀態碼，呼叫端才分得出「再試一次」跟「永遠不會成功」。 */
export class ApiError extends Error {
  status: number
  constructor(message: string, status: number) {
    super(message)
    this.status = status
  }
}
