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
    this.enableGenerateTemplateButton();
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
   * Enable the Generate Template button by default
   */
  enableGenerateTemplateButton() {
    $('#sendMessageBtn').prop('disabled', false);
  }

  /**
   * Generate AI template for each user (simulated)
   */
  async generateTemplate() {
    const selectedTemplate = this.selectedTemplate;
    
    if (!selectedTemplate) {
      this.uiUtils.showToast('Please select a template first', 'warning');
      return;
    }

    try {
      // Disable button and show loading
      $('#sendMessageBtn').prop('disabled', true).html('<i class="fas fa-spinner fa-spin me-1"></i>Generating...');
      
      // Simulate AI generation time (2-3 seconds)
      await new Promise(resolve => setTimeout(resolve, 2500));
      
      // Generate unique message for each user
      const baseMessage = this.messageTemplates[selectedTemplate];
      const personalizedMessage = this.personalizeMessage(baseMessage);
      
      $('#customMessage').val(personalizedMessage);
      
      // Enable send broadcast button after 5 seconds
      this.startBroadcastDelay();
      
      this.uiUtils.showToast('Template generated successfully!', 'success');
      
    } catch (error) {
      this.uiUtils.showToast('Error generating template: ' + error.message, 'error');
    } finally {
      $('#sendMessageBtn').prop('disabled', false).html('<i class="fas fa-magic me-1"></i>Generate Template');
    }
  }

  /**
   * Personalize message for each user (simulated AI personalization)
   */
  personalizeMessage(baseMessage) {
    // Add some personalization elements
    const personalizations = [
      'Hey there!',
      'Hi!',
      'Hello!',
      'Greetings!'
    ];
    
    const randomGreeting = personalizations[Math.floor(Math.random() * personalizations.length)];
    return `${randomGreeting}\n\n${baseMessage}`;
  }

  /**
   * Start the 5-second delay before enabling Send Broadcast
   */
  startBroadcastDelay() {
    $('#sendBroadcast').prop('disabled', true);
    $('#progressText').text('Generating AI messages... Please wait 5 seconds');
    
    let countdown = 5;
    const countdownInterval = setInterval(() => {
      $('#progressText').text(`Generating AI messages... ${countdown} seconds remaining`);
      countdown--;
      
      if (countdown < 0) {
        clearInterval(countdownInterval);
        $('#sendBroadcast').prop('disabled', false);
        $('#progressText').text('Ready to send broadcast');
        this.uiUtils.showToast('Broadcast ready to send!', 'success');
      }
    }, 1000);
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
    $('#sendBroadcast').on('click', () => this.sendBroadcast());
    $('#sendMessageBtn').on('click', () => this.generateTemplate());

    $('#telegramLink').on('input', (e) => {
      this.updateTelegramLink(e.target.value);
    });

    // Template selection
    $('.template-option').on('click', (e) => {
      const template = $(e.currentTarget).data('template');
      this.selectTemplate(template);
    });
  }
}
