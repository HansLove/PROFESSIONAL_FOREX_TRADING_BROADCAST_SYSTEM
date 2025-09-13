/**
 * API Service Module
 * Handles all API interactions for the Forex Broadcast Manager
 */
class ApiService {
  constructor() {
    this.API_BASE = 'https://broadcast-system-d7ca773e62c8.herokuapp.com';
    this.API_ENDPOINTS = {
      contacts: `${this.API_BASE}/n/get/all`,
      addContact: `${this.API_BASE}/n/add`,
      sendMessage: `${this.API_BASE}/m/send/to/numbers`,
      getAllNumbers: `${this.API_BASE}/n/get/all`
    };
  }

  /**
   * Fetch all numbers from the API
   * @returns {Promise<Array>} Array of number objects
   */
  async getAllNumbers() {
    try {
      const response = await $.ajax({
        url: this.API_ENDPOINTS.getAllNumbers,
        type: 'GET',
        dataType: 'json'
      });
      return response;
    } catch (error) {
      console.error('Error fetching numbers:', error);
      throw new Error('Failed to fetch numbers from API');
    }
  }

  /**
   * Load contacts from the existing API
   * @returns {Promise<Array>} Array of contact objects
   */
  async loadContacts() {
    try {
      const response = await $.get(this.API_ENDPOINTS.contacts);
      return response.phones.map(item => ({
        ...item.json,
        id: Math.random().toString(36).substr(2, 9),
        status: this.getRandomStatus(),
        selected: false
      }));
    } catch (error) {
      console.error('Error loading contacts:', error);
      throw new Error('Failed to load contacts');
    }
  }

  /**
   * Add a new contact
   * @param {Object} contact - Contact object with userName and phone
   * @returns {Promise<Object>} Response from API
   */
  async addContact(contact) {
    try {
      const response = await $.ajax({
        url: this.API_ENDPOINTS.addContact,
        type: 'POST',
        contentType: 'application/json',
        data: JSON.stringify(contact)
      });
      return response;
    } catch (error) {
      console.error('Error adding contact:', error);
      throw new Error('Failed to add contact');
    }
  }


  /**
   * Send broadcast message
   * @returns {Promise<Object>} Response from API
   */
  async sendMessage() {
    try {
      const response = await $.ajax({
        url: this.API_ENDPOINTS.sendMessage,
        type: 'GET'
      });
      return response;
    } catch (error) {
      console.error('Error sending message:', error);
      throw new Error('Failed to send message');
    }
  }

  /**
   * Get random status for contacts
   * @returns {string} Random status
   */
  getRandomStatus() {
    const statuses = ['online', 'offline', 'pending'];
    return statuses[Math.floor(Math.random() * statuses.length)];
  }
}

// Export for use in other modules
window.ApiService = ApiService;
