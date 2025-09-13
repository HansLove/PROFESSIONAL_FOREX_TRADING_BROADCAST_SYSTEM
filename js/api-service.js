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
   * Load contacts from the existing API (fallback)
   * @returns {Promise<Array>} Array of contact objects
   */
  async loadContacts() {
    try {
      const response = await $.get(this.API_ENDPOINTS.contacts);
      // Handle both old and new API response formats
      if (response.phones) {
        // Old API format
        return response.phones.map(item => ({
          ...item.json,
          id: Math.random().toString(36).substr(2, 9),
          status: this.getRandomStatus(),
          selected: false,
          source: 'old_api'
        }));
      } else if (response.numbers) {
        // New API format
        return response.numbers.map((number, index) => ({
          id: `num_${index}_${Date.now()}`,
          userName: number.name || `Contact ${index + 1}`,
          phone: number.number || 'Unknown',
          status: this.getContactStatus(number),
          selected: false,
          source: 'new_api',
          interview: number.interview || false,
          subscription: number.suscription || false,
          active: number.active || false
        }));
      } else {
        throw new Error('Invalid API response format');
      }
    } catch (error) {
      console.error('Error loading contacts:', error);
      throw new Error('Failed to load contacts');
    }
  }

  /**
   * Determine contact status based on API data
   * @param {Object} number - Number object from API
   * @returns {string} Contact status
   */
  getContactStatus(number) {
    if (!number.active) return 'offline';
    if (number.interview) return 'online';
    if (number.suscription) return 'online';
    return 'pending';
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
   * @param {Array} numbers - Array of phone numbers to send to
   * @param {string} template - Message template to send
   * @returns {Promise<Object>} Response from API
   */
  async sendMessage(numbers, template) {
    try {
      const requestData = {
        numbers: numbers,
        template: template
      };

      console.log('API Request to:', this.API_ENDPOINTS.sendMessage);
      console.log('Request data:', requestData);

      const response = await $.ajax({
        url: this.API_ENDPOINTS.sendMessage,
        type: 'POST',
        contentType: 'application/json',
        data: JSON.stringify(requestData)
      });

      console.log('API Response:', response);
      return response;
    } catch (error) {
      console.error('Error sending message:', error);
      console.error('Error details:', {
        status: error.status,
        statusText: error.statusText,
        responseText: error.responseText
      });
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
