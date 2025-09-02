/**
 * Main Application Module
 * Coordinates all other modules and initializes the application
 */
class ForexBroadcastApp {
  constructor() {
    this.apiService = null;
    this.uiUtils = null;
    this.contactManager = null;
    this.broadcastManager = null;
    
    this.init();
  }

  /**
   * Initialize the application
   */
  async init() {
    try {
      // Initialize core services
      this.apiService = new ApiService();
      this.uiUtils = new UiUtils();
      
      // Initialize managers
      this.contactManager = new ContactManager(this.apiService, this.uiUtils);
      this.broadcastManager = new BroadcastManager(this.apiService, this.uiUtils);
      
      // Initialize contact management
      await this.contactManager.init();
      
      // Set up global event handlers
      this.setupGlobalEvents();
      
      // Update connection status
      this.updateConnectionStatus();
      
      console.log('Forex Broadcast App initialized successfully');
    } catch (error) {
      console.error('Failed to initialize app:', error);
      this.uiUtils.showToast('Failed to initialize application', 'error');
    }
  }

  /**
   * Set up global event handlers
   */
  setupGlobalEvents() {
    // Handle window resize
    $(window).on('resize', this.debounce(() => {
      this.handleWindowResize();
    }, 250));

    // Handle page visibility change
    document.addEventListener('visibilitychange', () => {
      if (!document.hidden) {
        this.handlePageVisible();
      }
    });

    // Handle online/offline status
    window.addEventListener('online', () => {
      this.updateConnectionStatus(true);
    });

    window.addEventListener('offline', () => {
      this.updateConnectionStatus(false);
    });
  }

  /**
   * Update connection status
   */
  updateConnectionStatus() {
    const isOnline = navigator.onLine;
    this.uiUtils.updateConnectionStatus(isOnline);
  }

  /**
   * Handle window resize
   */
  handleWindowResize() {
    // Adjust UI elements based on screen size
    const isMobile = window.innerWidth < 768;
    
    if (isMobile) {
      // Mobile-specific adjustments
      $('.card').addClass('mobile-optimized');
    } else {
      $('.card').removeClass('mobile-optimized');
    }
  }

  /**
   * Handle page becoming visible
   */
  handlePageVisible() {
    // Refresh data when page becomes visible
    if (this.contactManager) {
      this.contactManager.loadContacts();
    }
  }

  /**
   * Get application statistics
   * @returns {Object} Application statistics
   */
  getStats() {
    return {
      totalContacts: this.contactManager ? this.contactManager.contacts.length : 0,
      selectedContacts: this.contactManager ? this.contactManager.getSelectedContacts().length : 0,
      onlineContacts: this.contactManager ? this.contactManager.getOnlineContacts().length : 0,
      isBroadcasting: this.broadcastManager ? this.broadcastManager.isBroadcasting : false
    };
  }

  /**
   * Export application data
   * @returns {Object} Exported data
   */
  exportData() {
    return {
      contacts: this.contactManager ? this.contactManager.contacts : [],
      settings: {
        telegramLink: this.broadcastManager ? this.broadcastManager.telegramLink : '',
        selectedTemplate: this.broadcastManager ? this.broadcastManager.selectedTemplate : null
      },
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Import application data
   * @param {Object} data - Data to import
   */
  importData(data) {
    try {
      if (data.contacts && this.contactManager) {
        this.contactManager.contacts = data.contacts;
        this.contactManager.displayContacts();
      }
      
      if (data.settings) {
        if (data.settings.telegramLink && this.broadcastManager) {
          this.broadcastManager.updateTelegramLink(data.settings.telegramLink);
          $('#telegramLink').val(data.settings.telegramLink);
        }
        
        if (data.settings.selectedTemplate && this.broadcastManager) {
          this.broadcastManager.selectTemplate(data.settings.selectedTemplate);
        }
      }
      
      this.uiUtils.showToast('Data imported successfully', 'success');
    } catch (error) {
      this.uiUtils.showToast('Failed to import data', 'error');
    }
  }

  /**
   * Utility function for debouncing
   * @param {Function} func - Function to debounce
   * @param {number} wait - Wait time in milliseconds
   * @returns {Function} Debounced function
   */
  debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }

  /**
   * Cleanup method for proper app shutdown
   */
  destroy() {
    // Remove event listeners
    $(window).off('resize');
    document.removeEventListener('visibilitychange');
    window.removeEventListener('online');
    window.removeEventListener('offline');
    
    // Clear any intervals or timeouts
    // (Add any cleanup logic here)
    
    console.log('Forex Broadcast App destroyed');
  }
}

// Global app instance
let forexApp = null;

// Initialize app when DOM is ready
$(document).ready(() => {
  forexApp = new ForexBroadcastApp();
});

// Expose app instance globally for debugging
window.forexApp = forexApp;
