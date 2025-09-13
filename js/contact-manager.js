/**
 * Contact Manager Module
 * Handles contact operations and display
 */
class ContactManager {
  constructor(apiService) {
    this.apiService = apiService;
    this.contacts = [];
    this.currentPage = 1;
    this.contactsPerPage = 10;
    this.filteredContacts = [];
  }

  /**
   * Load contacts from API
   * @returns {Promise<void>}
   */
  async loadContacts() {
    try {
      this.showLoading(true);
      
      // Try to load from the new numbers API first
      try {
        const numbers = await this.apiService.getAllNumbers();
        this.contacts = this.processNumbersData(numbers);
      } catch (error) {
        console.warn('Failed to load from numbers API, falling back to contacts API:', error);
        // Fallback to original contacts API
        this.contacts = await this.apiService.loadContacts();
      }
      
      this.filteredContacts = [...this.contacts];
      this.displayContacts();
      this.updateStats();
    } catch (error) {
      this.showToast('Error loading contacts: ' + error.message, 'error');
    } finally {
      this.showLoading(false);
    }
  }

  /**
   * Process numbers data from the new API
   * @param {Object} response - API response with numbers array
   * @returns {Array} Processed contact objects
   */
  processNumbersData(response) {
    if (!response || !response.numbers || !Array.isArray(response.numbers)) {
      console.warn('Invalid numbers data structure:', response);
      return [];
    }

    return response.numbers.map((number, index) => ({
      id: `num_${index}_${Date.now()}`,
      userName: number.name || `Contact ${index + 1}`,
      phone: number.number || 'Unknown',
      status: this.getContactStatus(number),
      selected: false,
      source: 'numbers_api',
      interview: number.interview || false,
      subscription: number.suscription || false,
      active: number.active || false
    }));
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
   * @param {string} name - Contact name
   * @param {string} phone - Contact phone
   * @returns {Promise<void>}
   */
  async addContact(name, phone) {
    if (!name || !phone) {
      this.showToast('Please fill in all fields', 'warning');
      return;
    }

    try {
      const newContact = { userName: name, phone };
      await this.apiService.addContact(newContact);
      
      // Clear form
      $('#contactName').val('');
      $('#contactPhone').val('');
      
      // Reload contacts
      await this.loadContacts();
      this.showToast('Contact added successfully', 'success');
    } catch (error) {
      this.showToast('Error adding contact: ' + error.message, 'error');
    }
  }

  /**
   * Display contacts in the UI
   */
  displayContacts() {
    const start = (this.currentPage - 1) * this.contactsPerPage;
    const end = start + this.contactsPerPage;
    const pageContacts = this.filteredContacts.slice(start, end);

    const contactsHtml = pageContacts.map(contact => `
      <div class="col-md-6 col-lg-4">
        <div class="contact-item-compact d-flex align-items-center p-2 border rounded">
          <div class="form-check me-2">
            <input class="form-check-input contact-checkbox" type="checkbox" 
                   value="${contact.id}" ${contact.selected ? 'checked' : ''}>
          </div>
          <span class="status-indicator status-${contact.status} me-2"></span>
          <div class="flex-grow-1">
            <div class="fw-bold text-primary small">${contact.userName}</div>
            <div class="text-secondary small">${contact.phone}</div>
            <div class="d-flex gap-1 mt-1">
              ${this.getContactBadges(contact)}
            </div>
          </div>
        </div>
      </div>
    `).join('');

    $('#contactsList').html(contactsHtml);
    this.generatePagination();
    this.bindContactCheckboxes();
    this.updateQuickStats();
  }

  /**
   * Get contact status badges
   * @param {Object} contact - Contact object
   * @returns {string} HTML for badges
   */
  getContactBadges(contact) {
    let badges = [];
    
    if (contact.source === 'numbers_api') {
      badges.push('<span class="badge bg-info badge-sm">API</span>');
    }
    
    if (contact.interview) {
      badges.push('<span class="badge bg-success badge-sm">Interviewed</span>');
    }
    
    if (contact.subscription) {
      badges.push('<span class="badge bg-primary badge-sm">Subscribed</span>');
    }
    
    if (!contact.active) {
      badges.push('<span class="badge bg-danger badge-sm">Inactive</span>');
    }
    
    return badges.join('');
  }

  /**
   * Generate pagination controls
   */
  generatePagination() {
    const totalPages = Math.ceil(this.filteredContacts.length / this.contactsPerPage);
    let paginationHtml = '';

    for (let i = 1; i <= totalPages; i++) {
      paginationHtml += `
        <li class="page-item ${i === this.currentPage ? 'active' : ''}">
          <a class="page-link" href="#">${i}</a>
        </li>
      `;
    }

    $('#pagination').html(paginationHtml);
  }

  /**
   * Bind checkbox events
   */
  bindContactCheckboxes() {
    $('.contact-checkbox').on('change', (e) => {
      const contactId = $(e.target).val();
      const contact = this.contacts.find(c => c.id === contactId);
      if (contact) {
        contact.selected = $(e.target).is(':checked');
        this.updateQuickStats();
      }
    });
  }

  /**
   * Go to specific page
   * @param {number} page - Page number
   */
  goToPage(page) {
    this.currentPage = page;
    this.displayContacts();
  }

  /**
   * Filter contacts based on search and status
   */
  filterContacts() {
    const searchTerm = $('#searchContacts').val().toLowerCase();
    const statusFilter = $('#statusFilter').val();

    this.filteredContacts = this.contacts.filter(contact => {
      const matchesSearch = contact.userName.toLowerCase().includes(searchTerm) ||
                          contact.phone.includes(searchTerm);
      const matchesStatus = !statusFilter || contact.status === statusFilter;
      return matchesSearch && matchesStatus;
    });

    this.currentPage = 1;
    this.displayContacts();
  }

  /**
   * Get contacts by status
   * @param {string} status - Status to filter by
   * @returns {Array} Filtered contacts
   */
  getContactsByStatus(status) {
    return this.contacts.filter(contact => contact.status === status);
  }

  /**
   * Get active contacts
   * @returns {Array} Active contacts
   */
  getActiveContacts() {
    return this.contacts.filter(contact => contact.active);
  }

  /**
   * Get interviewed contacts
   * @returns {Array} Interviewed contacts
   */
  getInterviewedContacts() {
    return this.contacts.filter(contact => contact.interview);
  }

  /**
   * Get subscribed contacts
   * @returns {Array} Subscribed contacts
   */
  getSubscribedContacts() {
    return this.contacts.filter(contact => contact.subscription);
  }

  /**
   * Toggle select all contacts
   */
  toggleSelectAll() {
    const isChecked = $('#selectAllContacts').is(':checked');
    $('.contact-checkbox').prop('checked', isChecked);
    
    this.contacts.forEach(contact => {
      contact.selected = isChecked;
    });
    this.updateQuickStats();
  }

  /**
   * Toggle online contacts only
   */
  toggleOnlineOnly() {
    const isOnlineOnly = $('#onlineContactsOnly').is(':checked');
    if (isOnlineOnly) {
      $('.contact-checkbox').each((index, checkbox) => {
        const contactId = $(checkbox).val();
        const contact = this.contacts.find(c => c.id === contactId);
        if (contact && contact.status !== 'online') {
          $(checkbox).prop('checked', false);
          contact.selected = false;
        }
      });
    }
    this.updateQuickStats();
  }

  /**
   * Get selected contacts
   * @returns {Array} Array of selected contacts
   */
  getSelectedContacts() {
    return this.contacts.filter(c => c.selected);
  }

  /**
   * Update quick stats display
   */
  updateQuickStats() {
    const selectedCount = this.contacts.filter(c => c.selected).length;
    const onlineCount = this.contacts.filter(c => c.status === 'online').length;
    
    $('#selectedCount').text(selectedCount);
    $('#onlineCount').text(onlineCount);
  }

  /**
   * Update main stats display
   */
  updateStats() {
    const totalContacts = this.contacts.length;
    const activeContacts = this.getActiveContacts().length;
    const interviewedContacts = this.getInterviewedContacts().length;
    const subscribedContacts = this.getSubscribedContacts().length;
    
    $('#totalContacts').text(totalContacts);
    $('#sentMessages').text(interviewedContacts);
    $('#conversionRate').text(subscribedContacts > 0 ? ((subscribedContacts / totalContacts) * 100).toFixed(1) + '%' : '0%');
    
    // Update additional stats if elements exist
    if ($('#activeContacts').length) {
      $('#activeContacts').text(activeContacts);
    }
    if ($('#interviewedContacts').length) {
      $('#interviewedContacts').text(interviewedContacts);
    }
    if ($('#subscribedContacts').length) {
      $('#subscribedContacts').text(subscribedContacts);
    }
  }

  /**
   * Show loading state
   * @param {boolean} show - Whether to show loading
   */
  showLoading(show) {
    if (show) {
      $('#contactsList').html('<div class="text-center py-4"><div class="spinner-border text-accent" role="status"></div><p class="mt-2">Loading contacts...</p></div>');
    }
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
window.ContactManager = ContactManager;
