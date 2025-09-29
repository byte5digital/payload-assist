export default class PayloadAssistError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "PayloadAssistError";
  }
}
