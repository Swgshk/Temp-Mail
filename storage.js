export const Storage = {
  async setEmail(email) {
    return browser.storage.local.set({ email });
  },

  async getEmail() {
    const data = await browser.storage.local.get("email");
    return data.email;
  }
};