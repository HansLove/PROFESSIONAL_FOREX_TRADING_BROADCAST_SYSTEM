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
   * Send broadcast message - Mobile Optimized
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

    // Mobile confirmation for large broadcasts
    if (selectedContacts.length > 10) {
      const isMobile = window.innerWidth <= 768;
      const confirmMessage = isMobile 
        ? `Send to ${selectedContacts.length} contacts?` 
        : `Are you sure you want to send this broadcast to ${selectedContacts.length} recipients?`;
      
      if (!confirm(confirmMessage)) {
        return;
      }
    }

    try {
      this.isBroadcasting = true;
      this.updateBroadcastUI(true);
      this.updateProgress(0, 'Preparing broadcast...');

      // Extract phone numbers from selected contacts
      const phoneNumbers = selectedContacts.map(contact => contact.phone);

      // Debug information
      console.log('Sending broadcast with:', {
        numbers: phoneNumbers,
        template: message,
        recipientCount: selectedContacts.length
      });

      // Simulate progress for better UX
      this.updateProgress(25, 'Sending messages...');
      
      // Send the message with numbers and template
      await this.apiService.sendMessage(phoneNumbers, message);

      this.updateProgress(100, 'Broadcast completed!');
      this.showToast(`Broadcast sent to ${selectedContacts.length} recipients successfully!`, 'success');
      this.contactManager.updateStats();
      
      // Reset form after delay
      setTimeout(() => {
        this.resetBroadcastState();
      }, 2000);
      
    } catch (error) {
      this.updateProgress(0, 'Broadcast failed');
      this.showToast('Error sending broadcast: ' + error.message, 'error');
    } finally {
      this.isBroadcasting = false;
      this.updateBroadcastUI(false);
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
    this.updateProgress(0, 'Ready to broadcast');
    this.updateBroadcastUI(false);
  }

  /**
   * Update broadcast UI for mobile optimization
   * @param {boolean} isBroadcasting - Whether currently broadcasting
   */
  updateBroadcastUI(isBroadcasting) {
    const isMobile = window.innerWidth <= 768;
    
    if (isBroadcasting) {
      $('#prepareBroadcast').prop('disabled', true);
      $('#sendBroadcast').prop('disabled', true);
      
      if (isMobile) {
        $('#sendBroadcast').html('<i class="fas fa-spinner fa-spin me-1"></i>Sending...');
      } else {
        $('#sendBroadcast').html('<i class="fas fa-spinner fa-spin me-1"></i>Sending Broadcast...');
      }
    } else {
      $('#prepareBroadcast').prop('disabled', false);
      $('#sendBroadcast').prop('disabled', !this.isPrepared);
      
      if (isMobile) {
        $('#sendBroadcast').html('<i class="fas fa-paper-plane me-2"></i>Send');
      } else {
        $('#sendBroadcast').html('<i class="fas fa-paper-plane me-2"></i>Send Broadcast');
      }
    }
  }

  /**
   * Update progress bar and text - Performance Optimized
   * @param {number} percentage - Progress percentage (0-100)
   * @param {string} text - Progress text
   */
  updateProgress(percentage, text) {
    // Use requestAnimationFrame for smooth progress updates
    requestAnimationFrame(() => {
      $('#broadcastProgress').css('width', percentage + '%');
      $('#progressText').text(text);
      
      // Add visual feedback for mobile
      if (window.innerWidth <= 768) {
        const progressBar = $('#broadcastProgress');
        if (percentage > 0 && percentage < 100) {
          progressBar.addClass('progress-bar-animated');
        } else {
          progressBar.removeClass('progress-bar-animated');
        }
      }
    });
  }

  /**
   * Show toast notification - Mobile Optimized
   * @param {string} message - Toast message
   * @param {string} type - Toast type
   */
  showToast(message, type = 'info') {
    const isMobile = window.innerWidth <= 768;
    const toastId = 'toast_' + Date.now();
    
    const toastHtml = `
      <div class="toast show" id="${toastId}" role="alert">
        <div class="toast-header bg-${type === 'error' ? 'danger' : type === 'success' ? 'success' : type === 'warning' ? 'warning' : 'info'} text-white">
          <strong class="me-auto">${type.charAt(0).toUpperCase() + type.slice(1)}</strong>
          <button type="button" class="btn-close btn-close-white" data-bs-dismiss="toast"></button>
        </div>
        <div class="toast-body ${isMobile ? 'small' : ''}">
          ${message}
        </div>
      </div>
    `;

    $('.toast-container').append(toastHtml);
    
    // Mobile-specific auto-dismiss timing
    const dismissTime = isMobile ? 3000 : 5000;
    
    setTimeout(() => {
      $(`#${toastId}`).fadeOut(300, function() {
        $(this).remove();
      });
    }, dismissTime);
  }
}

// Export for use in other modules
window.BroadcastManager = BroadcastManager;
