/**
 * Broadcast Manager Module
 * Handles broadcast operations and sending
 */
class BroadcastManager {
  constructor(apiService, contactManager, templateManager) {
    this.apiService = apiService;
    this.contactManager = contactManager;
    this.templateManager = templateManager;
    this.isBroadcasting = false;
    this.isPrepared = false;
  }

  /**
   * Initialize broadcast manager
   */
  init() {
    this.bindEvents();
  }

  /**
   * Bind broadcast-related events
   */
  bindEvents() {
    $('#prepareBroadcast').on('click', () => this.prepareBroadcast());
    $('#sendBroadcast').on('click', () => this.sendBroadcast());
  }

  /**
   * Prepare broadcast for sending
   */
  prepareBroadcast() {
    const message = this.templateManager.getCurrentMessage();

    if (!message) {
      this.showToast('Please select a template or enter a custom message first', 'warning');
      return;
    }

    const selectedContacts = this.contactManager.getSelectedContacts();
    if (selectedContacts.length === 0) {
      this.showToast('Please select at least one recipient', 'warning');
      return;
    }

    this.isPrepared = true;
    $('#prepareBroadcast').prop('disabled', true);
    $('#sendBroadcast').prop('disabled', false);
    this.showToast(`Ready to send to ${selectedContacts.length} recipients`, 'success');
  }

  /**
   * Send broadcast message
   */
  async sendBroadcast() {
    if (this.isBroadcasting || !this.isPrepared) return;

    const selectedContacts = this.contactManager.getSelectedContacts();
    if (selectedContacts.length === 0) {
      this.showToast('Please select at least one recipient', 'warning');
      return;
    }

    const message = this.templateManager.getCurrentMessage();
    if (!message) {
      this.showToast('No message to send', 'warning');
      return;
    }

    try {
      this.isBroadcasting = true;
      $('#sendBroadcast').prop('disabled', true).html('<i class="fas fa-spinner fa-spin me-1"></i>Sending...');

      // Extract phone numbers from selected contacts
      const phoneNumbers = selectedContacts.map(contact => contact.phone);

      // Debug information
      console.log('Sending broadcast with:', {
        numbers: phoneNumbers,
        template: message,
        recipientCount: selectedContacts.length
      });

      // Send the message with numbers and template
      await this.apiService.sendMessage(phoneNumbers, message);

      this.showToast(`Broadcast sent to ${selectedContacts.length} recipients successfully!`, 'success');
      this.contactManager.updateStats();
      
      // Reset form
      this.isPrepared = false;
      $('#prepareBroadcast').prop('disabled', false);
      $('#sendBroadcast').prop('disabled', true).html('<i class="fas fa-paper-plane me-1"></i>Send Broadcast');
      
    } catch (error) {
      this.showToast('Error sending broadcast: ' + error.message, 'error');
    } finally {
      this.isBroadcasting = false;
    }
  }

  /**
   * Check if broadcast is prepared
   * @returns {boolean} Whether broadcast is prepared
   */
  isBroadcastPrepared() {
    return this.isPrepared;
  }

  /**
   * Reset broadcast state
   */
  resetBroadcastState() {
    this.isPrepared = false;
    $('#prepareBroadcast').prop('disabled', false);
    $('#sendBroadcast').prop('disabled', true);
  }

  /**
   * Show toast notification
   * @param {string} message - Toast message
   * @param {string} type - Toast type
   */
  showToast(message, type = 'info') {
    const toastHtml = `
      <div class="toast show" role="alert">
        <div class="toast-header bg-${type === 'error' ? 'danger' : type === 'success' ? 'success' : type === 'warning' ? 'warning' : 'info'} text-white">
          <strong class="me-auto">${type.charAt(0).toUpperCase() + type.slice(1)}</strong>
          <button type="button" class="btn-close btn-close-white" data-bs-dismiss="toast"></button>
        </div>
        <div class="toast-body">
          ${message}
        </div>
      </div>
    `;

    $('.toast-container').append(toastHtml);
    
    setTimeout(() => {
      $('.toast-container .toast').remove();
    }, 5000);
  }
}

// Export for use in other modules
window.BroadcastManager = BroadcastManager;
