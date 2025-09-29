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

    // Pagination - Mobile Optimized
    $(document).on('click', '.pagination .page-link', (e) => {
      e.preventDefault();
      const page = parseInt($(e.target).data('page')) || parseInt($(e.target).text());
      if (page && !isNaN(page)) {
        this.contactManager.goToPage(page);
      }
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

// Initialize the application when DOM is ready
$(document).ready(async () => {
  window.app = new ForexBroadcastApp();
  await window.app.init();
  
  // Mobile-specific enhancements
  if (window.innerWidth <= 768) {
    // Add mobile-specific classes
    $('body').addClass('mobile-device');
    
    // Optimize viewport for mobile
    const viewport = document.querySelector('meta[name="viewport"]');
    if (viewport) {
      viewport.setAttribute('content', 'width=device-width, initial-scale=1.0, maximum-scale=5.0, user-scalable=yes');
    }
    
    // Add touch event listeners for better mobile UX
    $('.btn, .template-btn, .contact-item-compact').on('touchstart', function() {
      $(this).addClass('touch-active');
    }).on('touchend', function() {
      $(this).removeClass('touch-active');
    });
  }
  
  // Handle window resize for responsive updates with performance optimization
  let resizeTimeout;
  let lastWidth = window.innerWidth;
  
  $(window).on('resize', function() {
    const currentWidth = window.innerWidth;
    
    // Only trigger if width change is significant (avoid unnecessary updates)
    if (Math.abs(currentWidth - lastWidth) < 50) {
      return;
    }
    
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
      const isMobile = currentWidth <= 768;
      const wasMobile = lastWidth <= 768;
      
      // Only update if mobile state actually changed
      if (isMobile !== wasMobile) {
        $('body').toggleClass('mobile-device', isMobile);
        
        // Refresh contact display for responsive updates
        if (window.app && window.app.contactManager) {
          window.app.contactManager.displayContacts();
        }
        
        // Update broadcast UI for mobile state change
        if (window.app && window.app.broadcastManager) {
          window.app.broadcastManager.updateBroadcastUI(window.app.broadcastManager.isBroadcasting);
        }
      }
      
      lastWidth = currentWidth;
    }, 250);
  });
  
  // Performance optimization: Debounce scroll events
  let scrollTimeout;
  $(window).on('scroll', function() {
    clearTimeout(scrollTimeout);
    scrollTimeout = setTimeout(() => {
      // Only run scroll-based optimizations if needed
      if (window.app && window.app.contactManager) {
        // Lazy load contacts if needed (future enhancement)
      }
    }, 100);
  });
  
  // Performance optimization: Intersection Observer for lazy loading
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          // Lazy load content when it comes into view
          const element = entry.target;
          if (element.dataset.lazyLoad) {
            // Future enhancement: Load content on demand
          }
        }
      });
    }, {
      rootMargin: '50px 0px',
      threshold: 0.1
    });
    
    // Observe elements that might need lazy loading
    $('[data-lazy-load]').each(function() {
      observer.observe(this);
    });
  }
});
