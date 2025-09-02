/**
 * API Service Module
 * Handles all webhook calls and API communications
 */
class ApiService {
  constructor() {
    this.endpoints = {
      contacts: "https://ttsupport-n8n.rfi9up.easypanel.host/webhook/3cd6b9c9-5586-46e6-9ffc-0b8f5465b6de",
      addContact: "https://ttsupport-n8n.rfi9up.easypanel.host/webhook/0dc54efc-986c-4a67-a32e-0a1feb7735d2",
      createMessage: "https://ttsupport-n8n.rfi9up.easypanel.host/webhook/131f8084-7fd7-41e7-bac7-717370210773",
      sendMessage: "https://ttsupport-n8n.rfi9up.easypanel.host/webhook/22373b13-d0e2-4eec-a972-bc93c3de6f99"
    };
  }

  /**
   * Fetch all contacts from the API
   * @returns {Promise<Array>} Array of contact objects
   */
  async getContacts() {
    try {
      const response = await $.get(this.endpoints.contacts);
      return response.phones.map(item => ({
        ...item.json,
        id: Math.random().toString(36).substr(2, 9),
        status: this.getRandomStatus(),
        selected: false
      }));
    } catch (error) {
      throw new Error('Failed to load contacts: ' + error.message);
    }
  }

  /**
   * Add a new contact
   * @param {Object} contact - Contact object with userName and phone
   * @returns {Promise<void>}
   */
  async addContact(contact) {
    try {
      await $.ajax({
        url: this.endpoints.addContact,
        type: 'POST',
        contentType: 'application/json',
        data: JSON.stringify(contact)
      });
    } catch (error) {
      throw new Error('Failed to add contact: ' + error.message);
    }
  }

  /**
   * Create a message template
   * @param {string} template - Message template content
   * @returns {Promise<void>}
   */
  async createMessage(template) {
    try {
      await $.ajax({
        url: this.endpoints.createMessage,
        type: 'POST',
        contentType: 'application/json',
        data: JSON.stringify({ template })
      });
    } catch (error) {
      throw new Error('Failed to create message: ' + error.message);
    }
  }

  /**
   * Send a broadcast message
   * @returns {Promise<void>}
   */
  async sendBroadcast() {
    try {
      await $.ajax({
        url: this.endpoints.sendMessage,
        type: 'GET'
      });
    } catch (error) {
      throw new Error('Failed to send broadcast: ' + error.message);
    }
  }

  /**
   * Generate random status for contacts
   * @returns {string} Random status (online, offline, pending)
   */
  getRandomStatus() {
    const statuses = ['online', 'offline', 'pending'];
    return statuses[Math.floor(Math.random() * statuses.length)];
  }
}
