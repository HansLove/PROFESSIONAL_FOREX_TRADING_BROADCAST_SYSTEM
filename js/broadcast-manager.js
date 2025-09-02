/**
 * Broadcast Manager Module
 * Handles message templates, broadcasting, and related functionality
 */
class BroadcastManager {
  constructor(apiService, uiUtils) {
    this.apiService = apiService;
    this.uiUtils = uiUtils;
    this.telegramLink = "https://t.me/tradetabofficial";
    this.selectedTemplate = null;
    this.isBroadcasting = false;
    this.messageTemplates = {};
    
    this.init();
  }

  /**
   * Initialize broadcast manager
   */
  init() {
    this.loadMessageTemplates();
    this.bindEvents();
  }

  /**
   * Load predefined message templates
   */
  loadMessageTemplates() {
    this.messageTemplates = {
      realNumber: "Hey! This is my real number. I'm a professional Forex trader with proven strategies that generate consistent profits. Please don't share this number with anyone else - I only work with serious traders.",
      privacyRequest: "IMPORTANT: This is my private trading number. Please keep it confidential and don't share it with others. I only work with dedicated traders who are serious about their success.",
      telegramCTA: `Ready to access my exclusive trading strategies and real-time signals? Join my private Telegram channel for professional insights: ${this.telegramLink}`,
      fullStrategy: `Hey! This is my real number. I'm a professional Forex trader with proven strategies that generate consistent profits. Please don't share this number with anyone else - I only work with serious traders.\n\nReady to access my exclusive trading strategies and real-time signals? Join my private Telegram channel: ${this.telegramLink}`
    };
  }

  /**
   * Select a message template
   * @param {string} template - Template name
   */
  selectTemplate(template) {
    // Remove previous selection
    $('.template-option').removeClass('selected');
    
    // Add selection to clicked template
    $(`.template-option[data-template="${template}"]`).addClass('selected');
    
    this.selectedTemplate = template;
    this.loadMessageTemplate();
  }

  /**
   * Load the selected message template into the textarea
   */
  loadMessageTemplate() {
    if (this.selectedTemplate && this.messageTemplates[this.selectedTemplate]) {
      $('#customMessage').val(this.messageTemplates[this.selectedTemplate]);
      this.updateSendButtonState();
    }
  }

  /**
   * Update message preview when telegram link changes
   */
  updateMessagePreview() {
    if (this.selectedTemplate) {
      this.loadMessageTemplate();
    }
  }

  /**
   * Prepare broadcast by validating message
   */
  prepareBroadcast() {
    const message = $('#customMessage').val().trim();

    if (!message) {
      this.uiUtils.showToast('Please select a template or enter a custom message first', 'warning');
      return;
    }

    $('#sendBroadcast').prop('disabled', false);
    this.uiUtils.showToast('Ready to send message', 'success');
  }

  /**
   * Insert a template (placeholder functionality)
   */
  insertTemplate() {
    // Enable send button since we now have text
    $('#sendMessageBtn').prop('disabled', false);
    this.uiUtils.showToast('Template inserted successfully', 'success');
  }

  /**
   * Send individual message
   */
  async sendIndividualMessage() {
    const message = $('#customMessage').val().trim();
    
    if (!message) {
      this.uiUtils.showToast('Please enter a message first', 'warning');
      return;
    }

    try {
      $('#sendMessageBtn').prop('disabled', true).html('<i class="fas fa-spinner fa-spin me-1"></i>Sending...');
      
      await this.apiService.createMessage(message);
      
      this.uiUtils.showToast('Message sent successfully!', 'success');
      
    } catch (error) {
      this.uiUtils.showToast('Error sending message: ' + error.message, 'error');
    } finally {
      $('#sendMessageBtn').prop('disabled', false).html('<i class="fas fa-paper-plane me-1"></i>Send Message');
    }
  }

  /**
   * Send broadcast to all selected contacts
   */
  async sendBroadcast() {
    if (this.isBroadcasting) return;

    try {
      this.isBroadcasting = true;
      $('#sendBroadcast').prop('disabled', true);
      $('.loading-spinner').show();

      const message = $('#customMessage').val().trim();
      
      if (!message) {
        this.uiUtils.showToast('Please enter a message first', 'warning');
        return;
      }

      await this.apiService.sendBroadcast();
      
      this.uiUtils.showToast('Message sent successfully!', 'success');
      
    } catch (error) {
      this.uiUtils.showToast('Error sending message: ' + error.message, 'error');
    } finally {
      this.isBroadcasting = false;
      $('#sendBroadcast').prop('disabled', true);
      $('.loading-spinner').hide();
    }
  }

  /**
   * Update send button state based on message content
   */
  updateSendButtonState() {
    const hasText = $('#customMessage').val().trim().length > 0;
    $('#sendMessageBtn').prop('disabled', !hasText);
  }

  /**
   * Update telegram link
   * @param {string} link - New telegram link
   */
  updateTelegramLink(link) {
    this.telegramLink = link;
    this.updateMessagePreview();
  }

  /**
   * Bind event listeners
   */
  bindEvents() {
    $('#prepareBroadcast').on('click', () => this.prepareBroadcast());
    $('#sendBroadcast').on('click', () => this.sendBroadcast());
    $('#sendMessageBtn').on('click', () => this.sendIndividualMessage());
    $('#insertTemplateBtn').on('click', () => this.insertTemplate());

    $('#telegramLink').on('input', (e) => {
      this.updateTelegramLink(e.target.value);
    });

    // Allow manual typing in the message textarea
    $('#customMessage').on('input', () => {
      this.updateSendButtonState();
    });

    // Template selection
    $('.template-option').on('click', (e) => {
      const template = $(e.currentTarget).data('template');
      this.selectTemplate(template);
    });
  }
}
