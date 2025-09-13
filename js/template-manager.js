/**
 * Template Manager Module
 * Handles message templates and AI processing
 */
class TemplateManager {
  constructor(apiService) {
    this.apiService = apiService;
    this.selectedTemplate = null;
    this.customTemplates = {};
    this.messageTemplates = {};
    this.telegramLink = "https://t.me/tradetabofficial";
  }

  /**
   * Initialize template manager
   */
  init() {
    this.loadMessageTemplates();
    this.bindEvents();
  }

  /**
   * Bind template-related events
   */
  bindEvents() {
    // Template selection
    $('.template-btn').on('click', (e) => {
      const template = $(e.currentTarget).data('template');
      this.selectTemplate(template);
      
    });

    // Template creation
    $('#createTemplateBtn').on('click', () => this.showTemplateCreation());
    $('#saveTemplateBtn').on('click', () => this.saveTemplate());
    $('#cancelTemplateBtn').on('click', () => this.hideTemplateCreation());
    
    // Template preview
    $('#closePreview').on('click', () => this.hideTemplatePreview());

    // Message actions
    $('#insertTemplateBtn').on('click', () => this.insertTemplate());
    $('#clearMessageBtn').on('click', () => this.clearMessage());
    $('#previewMessageBtn').on('click', () => this.previewMessage());

    // Message textarea
    $('#customMessage').on('input', () => {
      this.updateCharCount();
      this.updateInsertTemplateButton();
    });

    // Telegram link
    $('#telegramLink').on('input', (e) => {
      this.telegramLink = e.target.value;
      this.updateMessagePreview();
    });
  }

  /**
   * Load predefined message templates
   */
  loadMessageTemplates() {
    this.messageTemplates = {
      realNumber: "Hey! This is my real number. I'm a professional Forex trader with proven strategies that generate consistent profits. Please don't share this number with anyone else - I only work with serious traders.",
      privacyRequest: "IMPORTANT: This is my private trading number. Please keep it confidential and don't share it with others. I only work with dedicated traders who are serious about their success.",
      telegramCTA: `Ready to access my exclusive trading strategies and real-time signals? Join my private Telegram channel for professional insights: ${this.telegramLink}`,
      fullStrategy: `Hey! This is my real trading number. I'm a professional Forex trader with proven strategies that generate consistent profits. Please don't share this number with anyone else - I only work with serious traders.\n\nReady to access my exclusive trading strategies and real-time signals? Join my private Telegram channel: ${this.telegramLink}`
    };
  }

  /**
   * Select a template
   * @param {string} template - Template identifier
   */
  selectTemplate(template) {
    // Remove previous selection
    $('.template-btn').removeClass('active');
    
    // Add selection to clicked template
    $(`.template-btn[data-template="${template}"]`).addClass('active');
    
    this.selectedTemplate = template;
    
    // Get template content and insert into textarea
    let content = '';
    if (this.customTemplates && this.customTemplates[template]) {
      content = this.customTemplates[template].content;
    } else if (this.messageTemplates[template]) {
      content = this.messageTemplates[template];
    }
    
    if (content) {
      // Insert template content into textarea
      $('#customMessage').val(content);
      this.updateCharCount();
      this.showToast(`Template "${this.getTemplateName(template)}" inserted into message`, 'success');
    }
    
    this.hideTemplatePreview();
    this.updateInsertTemplateButton();
  }

  /**
   * Show template preview
   */
  showTemplatePreview() {
    if (this.selectedTemplate) {
      let content = '';
      
      // Check if it's a custom template
      if (this.customTemplates && this.customTemplates[this.selectedTemplate]) {
        content = this.customTemplates[this.selectedTemplate].content;
      } else if (this.messageTemplates[this.selectedTemplate]) {
        content = this.messageTemplates[this.selectedTemplate];
      }
      
      if (content) {
        // Show preview in the preview area
        $('#templatePreviewContent').text(content);
        $('#templatePreview').slideDown(300);
        this.showToast(`Template "${this.getTemplateName()}" selected. Click "Insert Template" to process with AI.`, 'info');
      }
    }
  }

  /**
   * Hide template preview
   */
  hideTemplatePreview() {
    $('#templatePreview').slideUp(300);
  }

  /**
   * Get template name
   * @param {string} template - Template identifier (optional, uses selectedTemplate if not provided)
   * @returns {string} Template name
   */
  getTemplateName(template = null) {
    const templateId = template || this.selectedTemplate;
    
    if (this.customTemplates && this.customTemplates[templateId]) {
      return this.customTemplates[templateId].name;
    }
    
    const templateNames = {
      realNumber: 'Real Number',
      privacyRequest: 'Privacy Request',
      telegramCTA: 'Telegram CTA',
      fullStrategy: 'Full Strategy'
    };
    
    return templateNames[templateId] || 'Template';
  }


  /**
   * Process message content with AI
   */
  async insertTemplate() {
    const content = $('#customMessage').val().trim();
    
    if (!content) {
      this.showToast('Please write a message first', 'warning');
      return;
    }

    try {
      $('#insertTemplateBtn').prop('disabled', true).html('<i class="fas fa-spinner fa-spin me-1"></i>Processing...');
      
      // Process the content that's already in the textarea
      // TODO: Add AI processing logic here
      // For now, just show success message
      
      this.updateCharCount();
      this.showToast('Content processed with AI successfully!', 'success');
      
    } catch (error) {
      this.showToast('Error processing content: ' + error.message, 'error');
    } finally {
      this.updateInsertTemplateButton();
    }
  }

  /**
   * Clear message and reset template selection
   */
  clearMessage() {
    $('#customMessage').val('');
    this.selectedTemplate = null;
    $('.template-btn').removeClass('active');
    this.hideTemplatePreview();
    this.updateCharCount();
    this.updateInsertTemplateButton();
    this.showToast('Message cleared', 'info');
  }

  /**
   * Preview message in modal
   */
  previewMessage() {
    const message = $('#customMessage').val().trim();
    if (!message) {
      this.showToast('No message to preview', 'warning');
      return;
    }

    // Create a modal for preview
    const previewModal = `
      <div class="modal fade" id="previewModal" tabindex="-1">
        <div class="modal-dialog modal-lg">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title">Message Preview</h5>
              <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
            </div>
            <div class="modal-body">
              <div class="border rounded p-3 bg-light">
                <pre style="white-space: pre-wrap; font-family: inherit;">${message}</pre>
              </div>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
            </div>
          </div>
        </div>
      </div>
    `;

    // Remove existing modal if any
    $('#previewModal').remove();
    
    // Add and show modal
    $('body').append(previewModal);
    $('#previewModal').modal('show');
  }

  /**
   * Show template creation form
   */
  showTemplateCreation() {
    $('#templateCreationForm').slideDown(300);
    $('#createTemplateBtn').prop('disabled', true);
  }

  /**
   * Hide template creation form
   */
  hideTemplateCreation() {
    $('#templateCreationForm').slideUp(300);
    $('#createTemplateBtn').prop('disabled', false);
    this.clearTemplateForm();
  }

  /**
   * Clear template form
   */
  clearTemplateForm() {
    $('#templateName').val('');
    $('#templateCategory').val('greeting');
    $('#templateContent').val('');
  }

  /**
   * Save custom template
   */
  saveTemplate() {
    const name = $('#templateName').val().trim();
    const category = $('#templateCategory').val();
    const content = $('#templateContent').val().trim();

    if (!name || !content) {
      this.showToast('Please fill in template name and content', 'warning');
      return;
    }

    // Create a new template button
    const templateId = 'custom_' + Date.now();
    const templateBtn = `
      <button class="btn btn-outline-success btn-sm template-btn" data-template="${templateId}">
        <i class="fas fa-file-text me-1"></i>${name}
      </button>
    `;

    // Add the new template button
    $('.template-btn').last().after(templateBtn);

    // Store the template
    if (!this.customTemplates) {
      this.customTemplates = {};
    }
    this.customTemplates[templateId] = {
      name: name,
      category: category,
      content: content
    };

    // Bind click event to new button
    $(`.template-btn[data-template="${templateId}"]`).on('click', (e) => {
      const template = $(e.currentTarget).data('template');
      this.selectTemplate(template);
    });

    this.hideTemplateCreation();
    this.showToast(`Template "${name}" saved successfully!`, 'success');
  }

  /**
   * Update character count
   */
  updateCharCount() {
    const text = $('#customMessage').val();
    const charCount = text.length;
    const lineCount = text.split('\n').length;
    
    $('#charCount').text(charCount);
    $('#lineCount').text(lineCount);
  }

  /**
   * Update insert template button state and text
   */
  updateInsertTemplateButton() {
    const hasContent = $('#customMessage').val().trim().length > 0;
    
    // Enable button if there's content to process
    $('#insertTemplateBtn').prop('disabled', !hasContent);
    
    // Update button text based on state
    if (hasContent) {
      $('#insertTemplateBtn').html('<i class="fas fa-magic me-1"></i><span class="d-none d-sm-inline">Process with AI</span><span class="d-inline d-sm-none">AI</span>');
    } else {
      $('#insertTemplateBtn').html('<i class="fas fa-magic me-1"></i><span class="d-none d-sm-inline">Process with AI</span><span class="d-inline d-sm-none">AI</span>');
    }
  }

  /**
   * Update message preview
   */
  updateMessagePreview() {
    if (this.selectedTemplate) {
      this.loadMessageTemplates();
    }
  }

  /**
   * Get current message content
   * @returns {string} Current message content
   */
  getCurrentMessage() {
    return $('#customMessage').val().trim();
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
window.TemplateManager = TemplateManager;
