export class OneSecMail {
  constructor() {
    this.base = "https://www.1secmail.com/api/v1/";
  }

  parse(email) {
    const [login, domain] = email.split("@");
    return { login, domain };
  }

  async generateEmail() {
    const res = await fetch(`${this.base}?action=genRandomMailbox&count=1`);
    const data = await res.json();
    return data[0];
  }

  async getMessages(email) {
    const { login, domain } = this.parse(email);
    const res = await fetch(`${this.base}?action=getMessages&login=${login}&domain=${domain}`);
    return res.json();
  }

  async getMessage(email, id) {
    const { login, domain } = this.parse(email);
    const res = await fetch(`${this.base}?action=readMessage&login=${login}&domain=${domain}&id=${id}`);
    return res.json();
  }
}