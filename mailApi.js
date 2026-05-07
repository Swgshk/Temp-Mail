import { OneSecMail } from "./providers/oneSecMail.js";

export class MailAPI {
  constructor(provider = new OneSecMail()) {
    this.provider = provider;
  }

  async generateEmail() {
    return this.provider.generateEmail();
  }

  async getMessages(email) {
    return this.provider.getMessages(email);
  }

  async getMessage(email, id) {
    return this.provider.getMessage(email, id);
  }
}