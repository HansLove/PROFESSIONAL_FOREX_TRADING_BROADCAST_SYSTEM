/**
 * Main Application Module
 * Initializes and coordinates all other modules
 */
class ForexBroadcastApp {
  constructor() {
    this.apiService = null;
    this.contactManager = null;
    this.templateManager = null;
    this.broadcastManager = null;
  }

  /**
   * Initialize the application
   */
  async init() {
    try {
      // Initialize API service
      this.apiService = new ApiService();
      
      // Initialize managers
      this.contactManager = new ContactManager(this.apiService);
      this.templateManager = new TemplateManager(this.apiService);
      this.broadcastManager = new BroadcastManager(this.apiService, this.contactManager, this.templateManager);
      
      // Initialize all modules
      this.templateManager.init();
      this.broadcastManager.init();
      
      // Bind global events
      this.bindGlobalEvents();
      
      // Load initial data
      await this.loadInitialData();
      
      console.log('Forex Broadcast App initialized successfully');
    } catch (error) {
      console.error('Failed to initialize app:', error);
      this.showToast('Failed to initialize application', 'error');
    }
  }

  /**
   * Bind global application events
   */
  bindGlobalEvents() {
    // Contact form submission
    $('#contactForm').on('submit', (e) => {
      e.preventDefault();
      const name = $('#contactName').val().trim();
      const phone = $('#contactPhone').val().trim();
      this.contactManager.addContact(name, phone);
    });

    // Search and filter events
    $('#searchContacts').on('input', () => this.contactManager.filterContacts());
    $('#statusFilter').on('change', () => this.contactManager.filterContacts());

    // Selection controls
    $('#selectAllContacts').on('change', () => this.contactManager.toggleSelectAll());
    $('#onlineContactsOnly').on('change', () => this.contactManager.toggleOnlineOnly());

    // Pagination
    $(document).on('click', '.pagination .page-link', (e) => {
      e.preventDefault();
      const page = parseInt($(e.target).text());
      this.contactManager.goToPage(page);
    });

    // Message textarea changes
    $('#customMessage').on('input', () => {
      this.broadcastManager.resetBroadcastState();
    });
  }

  /**
   * Load initial application data
   */
  async loadInitialData() {
    try {
      // Load contacts (this will try the new numbers API first)
      await this.contactManager.loadContacts();
      
      // Update stats
      this.contactManager.updateStats();
      this.contactManager.updateQuickStats();
      
    } catch (error) {
      console.error('Error loading initial data:', error);
      this.showToast('Error loading initial data', 'error');
    }
  }

  /**
   * Get API service instance
   * @returns {ApiService} API service instance
   */
  getApiService() {
    return this.apiService;
  }

  /**
   * Get contact manager instance
   * @returns {ContactManager} Contact manager instance
   */
  getContactManager() {
    return this.contactManager;
  }

  /**
   * Get template manager instance
   * @returns {TemplateManager} Template manager instance
   */
  getTemplateManager() {
    return this.templateManager;
  }

  /**
   * Get broadcast manager instance
   * @returns {BroadcastManager} Broadcast manager instance
   */
  getBroadcastManager() {
    return this.broadcastManager;
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

// Initialize the application when DOM is ready
$(document).ready(async () => {
  window.app = new ForexBroadcastApp();
  await window.app.init();
});
