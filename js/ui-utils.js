/**
 * UI Utilities Module
 * Handles UI-related utilities like toast notifications and loading states
 */
class UiUtils {
  constructor() {
    this.toastContainer = $('.toast-container');
  }

  /**
   * Show a toast notification
   * @param {string} message - Message to display
   * @param {string} type - Type of toast (success, error, warning, info)
   */
  showToast(message, type = 'info') {
    const toastHtml = this.createToastHtml(message, type);
    this.toastContainer.append(toastHtml);
    
    // Auto-remove toast after 5 seconds
    setTimeout(() => {
      this.toastContainer.find('.toast').first().remove();
    }, 5000);
  }

  /**
   * Create toast HTML
   * @param {string} message - Message content
   * @param {string} type - Toast type
   * @returns {string} HTML string for toast
   */
  createToastHtml(message, type) {
    const bgClass = this.getToastBgClass(type);
    const title = type.charAt(0).toUpperCase() + type.slice(1);
    
    return `
      <div class="toast show" role="alert">
        <div class="toast-header ${bgClass} text-white">
          <strong class="me-auto">${title}</strong>
          <button type="button" class="btn-close btn-close-white" data-bs-dismiss="toast"></button>
        </div>
        <div class="toast-body">
          ${message}
        </div>
      </div>
    `;
  }

  /**
   * Get background class for toast based on type
   * @param {string} type - Toast type
   * @returns {string} Bootstrap background class
   */
  getToastBgClass(type) {
    const typeMap = {
      'error': 'bg-danger',
      'success': 'bg-success',
      'warning': 'bg-warning',
      'info': 'bg-info'
    };
    return typeMap[type] || 'bg-info';
  }

  /**
   * Show or hide loading state
   * @param {boolean} show - Whether to show loading
   * @param {string} target - Target element selector (optional)
   */
  showLoading(show, target = '#contactsList') {
    if (show) {
      $(target).html(`
        <div class="text-center py-4">
          <div class="spinner-border text-accent" role="status"></div>
          <p class="mt-2">Loading...</p>
        </div>
      `);
    }
  }

  /**
   * Update connection status indicator
   * @param {boolean} connected - Whether connected or not
   */
  updateConnectionStatus(connected) {
    const statusElement = $('#connectionStatus');
    const indicatorElement = statusElement.prev();
    
    if (connected) {
      statusElement.text('Connected');
      indicatorElement.removeClass('text-danger').addClass('text-success');
    } else {
      statusElement.text('Disconnected');
      indicatorElement.removeClass('text-success').addClass('text-danger');
    }
  }

  /**
   * Show modal dialog
   * @param {string} title - Modal title
   * @param {string} content - Modal content
   * @param {Object} options - Modal options
   */
  showModal(title, content, options = {}) {
    const modalId = options.id || 'dynamicModal';
    const modalHtml = `
      <div class="modal fade" id="${modalId}" tabindex="-1">
        <div class="modal-dialog">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title">${title}</h5>
              <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
            </div>
            <div class="modal-body">
              ${content}
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
              ${options.confirmButton ? `<button type="button" class="btn btn-primary" id="confirmAction">${options.confirmText || 'Confirm'}</button>` : ''}
            </div>
          </div>
        </div>
      </div>
    `;

    // Remove existing modal if it exists
    $(`#${modalId}`).remove();
    
    // Add new modal to body
    $('body').append(modalHtml);
    
    // Show modal
    const modal = new bootstrap.Modal(document.getElementById(modalId));
    modal.show();

    // Bind confirm action if provided
    if (options.confirmButton && options.onConfirm) {
      $('#confirmAction').on('click', () => {
        options.onConfirm();
        modal.hide();
      });
    }

    return modal;
  }

  /**
   * Format phone number
   * @param {string} phone - Raw phone number
   * @returns {string} Formatted phone number
   */
  formatPhoneNumber(phone) {
    // Simple phone formatting - can be enhanced
    const cleaned = phone.replace(/\D/g, '');
    if (cleaned.length === 10) {
      return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
    }
    return phone;
  }

  /**
   * Validate email format
   * @param {string} email - Email to validate
   * @returns {boolean} Whether email is valid
   */
  validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Validate phone number format
   * @param {string} phone - Phone to validate
   * @returns {boolean} Whether phone is valid
   */
  validatePhone(phone) {
    const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
    return phoneRegex.test(phone.replace(/\s/g, ''));
  }

  /**
   * Debounce function for input events
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
}
