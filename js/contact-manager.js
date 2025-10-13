/**
 * Contact Manager Module
 * Handles contact operations and display
 */
class ContactManager {
  constructor(apiService) {
    this.apiService = apiService;
    this.contacts = [];
    this.folders = [];
    this.currentPage = 1;
    this.contactsPerPage = 10;
    this.filteredContacts = [];
    this.filteredFolders = [];
  }

  /**
   * Load contacts from API
   * @returns {Promise<void>}
   */
  async loadContacts() {
    try {
      this.showLoading(true);
      
      // Try to load folders first, then fallback to individual contacts
      try {
        const foldersData = await this.apiService.getFolders();
        this.folders = this.processFoldersData(foldersData);
        this.filteredFolders = [...this.folders];
        this.displayFolders();
      } catch (error) {
        console.warn('Failed to load folders, falling back to individual contacts:', error);
        // Fallback to individual contacts
        try {
          const numbers = await this.apiService.getAllNumbers();
          this.contacts = this.processNumbersData(numbers);
        } catch (error2) {
          console.warn('Failed to load from numbers API, falling back to contacts API:', error2);
          // Fallback to original contacts API
          this.contacts = await this.apiService.loadContacts();
        }
        
        this.filteredContacts = [...this.contacts];
        this.displayContacts();
      }
      
      this.updateStats();
    } catch (error) {
      this.showToast('Error loading contacts: ' + error.message, 'error');
    } finally {
      this.showLoading(false);
    }
  }

  /**
   * Process folders data from the API
   * @param {Array} foldersData - API response with folders array
   * @returns {Array} Processed folder objects
   */
  processFoldersData(foldersData) {
    if (!Array.isArray(foldersData)) {
      console.warn('Invalid folders data structure:', foldersData);
      return [];
    }

    return foldersData.map(folder => ({
      id: folder.id,
      name: folder.name,
      instance: folder.instance,
      proyecto_id: folder.proyecto_id,
      numbers: (folder.numbers || []).map(number => ({
        id: `folder_${folder.id}_num_${number.number}`,
        userName: number.name || `Contact ${number.number}`,
        phone: number.number,
        status: this.getContactStatus(number),
        selected: false,
        source: 'folder_api',
        interview: number.interview || false,
        subscription: number.suscription || false,
        active: number.active || false,
        tag: number.tag,
        proyecto_id: number.proyecto_id,
        folder_id: number.folder_id
      })),
      selected: false,
      expanded: false
    }));
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
      const newContact = { name: name, number: phone };
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
   * Display folders in the UI - Mobile Optimized
   */
  displayFolders() {
    const isMobile = window.innerWidth <= 768;

    const foldersHtml = this.filteredFolders.map(folder => `
      <div class="col-12 mb-3">
        <div class="folder-container border rounded">
          <div class="folder-header d-flex align-items-center justify-content-between p-3 bg-light">
            <div class="d-flex align-items-center">
              <div class="form-check me-3">
                <input class="form-check-input folder-checkbox" type="checkbox" 
                       value="${folder.id}" ${folder.selected ? 'checked' : ''}>
              </div>
              <div class="folder-info">
                <h6 class="mb-1 fw-bold">
                  <i class="fas fa-folder me-2"></i>${folder.name}
                </h6>
                <small class="text-muted">${folder.instance} • ${folder.numbers.length} contacts</small>
              </div>
            </div>
            <div class="d-flex align-items-center gap-2">
              <button class="btn btn-outline-primary btn-sm folder-broadcast-btn" 
                      data-folder-id="${folder.id}" 
                      data-folder-name="${folder.name}"
                      ${folder.numbers.length === 0 ? 'disabled' : ''}>
                <i class="fas fa-paper-plane me-1"></i>
                <span class="d-none d-sm-inline">Broadcast</span>
              </button>
              <button class="btn btn-outline-secondary btn-sm folder-toggle-btn" 
                      data-folder-id="${folder.id}">
                <i class="fas fa-chevron-${folder.expanded ? 'up' : 'down'}"></i>
              </button>
            </div>
          </div>
          <div class="folder-contacts ${folder.expanded ? 'show' : ''}" data-folder-id="${folder.id}">
            <div class="p-3">
              ${folder.numbers.length === 0 ? 
                '<div class="text-center text-muted py-3">No contacts in this folder</div>' :
                '<div class="row g-2">' + folder.numbers.map(contact => `
                  <div class="col-12 col-sm-6 col-md-4 col-lg-3">
                    <div class="contact-item-compact d-flex align-items-center p-2 border rounded">
                      <div class="form-check me-2">
                        <input class="form-check-input contact-checkbox" type="checkbox" 
                               value="${contact.id}" ${contact.selected ? 'checked' : ''}>
                      </div>
                      <span class="status-indicator status-${contact.status} me-2"></span>
                      <div class="flex-grow-1">
                        <div class="fw-bold text-primary ${isMobile ? 'small' : ''}">${contact.userName}</div>
                        <div class="text-secondary ${isMobile ? 'small' : ''}">${contact.phone}</div>
                        <div class="d-flex flex-wrap gap-1 mt-1">
                          ${this.getContactBadges(contact)}
                        </div>
                      </div>
                    </div>
                  </div>
                `).join('') + '</div>'
              }
            </div>
          </div>
        </div>
      </div>
    `).join('');

    $('#contactsList').html(foldersHtml);
    this.bindFolderEvents();
    this.updateQuickStats();
  }

  /**
   * Display contacts in the UI - Mobile Optimized
   */
  displayContacts() {
    const start = (this.currentPage - 1) * this.contactsPerPage;
    const end = start + this.contactsPerPage;
    const pageContacts = this.filteredContacts.slice(start, end);
    const isMobile = window.innerWidth <= 768;

    const contactsHtml = pageContacts.map(contact => `
      <div class="col-12 col-sm-6 col-md-4 col-lg-3">
        <div class="contact-item-compact d-flex align-items-center p-2 border rounded">
          <div class="form-check me-2">
            <input class="form-check-input contact-checkbox" type="checkbox" 
                   value="${contact.id}" ${contact.selected ? 'checked' : ''}>
          </div>
          <span class="status-indicator status-${contact.status} me-2"></span>
          <div class="flex-grow-1">
            <div class="fw-bold text-primary ${isMobile ? 'small' : ''}">${contact.userName}</div>
            <div class="text-secondary ${isMobile ? 'small' : ''}">${contact.phone}</div>
            <div class="d-flex flex-wrap gap-1 mt-1">
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
   * Generate pagination controls - Mobile Optimized
   */
  generatePagination() {
    const totalPages = Math.ceil(this.filteredContacts.length / this.contactsPerPage);
    const isMobile = window.innerWidth <= 768;
    let paginationHtml = '';

    if (totalPages <= 1) {
      $('#pagination').html('');
      return;
    }

    // Mobile pagination - show fewer pages
    if (isMobile) {
      const maxVisible = 5;
      let startPage = Math.max(1, this.currentPage - 2);
      let endPage = Math.min(totalPages, startPage + maxVisible - 1);
      
      if (endPage - startPage < maxVisible - 1) {
        startPage = Math.max(1, endPage - maxVisible + 1);
      }

      // Previous button
      if (this.currentPage > 1) {
        paginationHtml += `
          <li class="page-item">
            <a class="page-link" href="#" data-page="${this.currentPage - 1}">
              <i class="fas fa-chevron-left"></i>
            </a>
          </li>
        `;
      }

      // Page numbers
      for (let i = startPage; i <= endPage; i++) {
        paginationHtml += `
          <li class="page-item ${i === this.currentPage ? 'active' : ''}">
            <a class="page-link" href="#" data-page="${i}">${i}</a>
          </li>
        `;
      }

      // Next button
      if (this.currentPage < totalPages) {
        paginationHtml += `
          <li class="page-item">
            <a class="page-link" href="#" data-page="${this.currentPage + 1}">
              <i class="fas fa-chevron-right"></i>
            </a>
          </li>
        `;
      }
    } else {
      // Desktop pagination - show all pages
      for (let i = 1; i <= totalPages; i++) {
        paginationHtml += `
          <li class="page-item ${i === this.currentPage ? 'active' : ''}">
            <a class="page-link" href="#" data-page="${i}">${i}</a>
          </li>
        `;
      }
    }

    $('#pagination').html(paginationHtml);
  }

  /**
   * Bind folder-related events
   */
  bindFolderEvents() {
    // Folder checkbox events
    $('.folder-checkbox').on('change', (e) => {
      const folderId = parseInt($(e.target).val());
      const folder = this.folders.find(f => f.id === folderId);
      if (folder) {
        folder.selected = $(e.target).is(':checked');
        // Select/deselect all contacts in this folder
        folder.numbers.forEach(contact => {
          contact.selected = folder.selected;
        });
        this.displayFolders();
        this.updateQuickStats();
      }
    });

    // Folder toggle events
    $('.folder-toggle-btn').on('click', (e) => {
      const folderId = parseInt($(e.target).closest('.folder-toggle-btn').data('folder-id'));
      const folder = this.folders.find(f => f.id === folderId);
      if (folder) {
        folder.expanded = !folder.expanded;
        this.displayFolders();
      }
    });

    // Folder broadcast events
    $('.folder-broadcast-btn').on('click', (e) => {
      const folderId = parseInt($(e.target).closest('.folder-broadcast-btn').data('folder-id'));
      const folderName = $(e.target).closest('.folder-broadcast-btn').data('folder-name');
      const folder = this.folders.find(f => f.id === folderId);
      
      if (folder && folder.numbers.length > 0) {
        // Trigger folder broadcast event
        $(document).trigger('folderBroadcastRequested', {
          folderId: folderId,
          folderName: folderName,
          contactCount: folder.numbers.length
        });
      }
    });

    this.bindContactCheckboxes();
  }

  /**
   * Bind checkbox events
   */
  bindContactCheckboxes() {
    $('.contact-checkbox').on('change', (e) => {
      const contactId = $(e.target).val();
      
      // Handle both individual contacts and folder contacts
      let contact = this.contacts.find(c => c.id === contactId);
      let folder = null;
      
      if (!contact) {
        // Find contact in folders
        for (const f of this.folders) {
          contact = f.numbers.find(c => c.id === contactId);
          if (contact) {
            folder = f;
            break;
          }
        }
      }
      
      if (contact) {
        contact.selected = $(e.target).is(':checked');
        
        // Update folder selection status if this is a folder contact
        if (folder) {
          const allSelected = folder.numbers.every(c => c.selected);
          const noneSelected = folder.numbers.every(c => !c.selected);
          
          if (allSelected) {
            folder.selected = true;
          } else if (noneSelected) {
            folder.selected = false;
          }
          
          // Update folder checkbox
          $(`.folder-checkbox[value="${folder.id}"]`).prop('checked', folder.selected);
        }
        
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
   * Filter contacts based on search and status - Performance Optimized
   */
  filterContacts() {
    const searchTerm = $('#searchContacts').val().toLowerCase();
    const statusFilter = $('#statusFilter').val();

    // Performance optimization: Use requestAnimationFrame for smooth filtering
    requestAnimationFrame(() => {
      this.filteredContacts = this.contacts.filter(contact => {
        const matchesSearch = contact.userName.toLowerCase().includes(searchTerm) ||
                            contact.phone.includes(searchTerm);
        const matchesStatus = !statusFilter || contact.status === statusFilter;
        return matchesSearch && matchesStatus;
      });

      this.currentPage = 1;
      this.displayContacts();
    });
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
    const selectedContacts = this.contacts.filter(c => c.selected);
    
    // Add selected contacts from folders
    this.folders.forEach(folder => {
      const folderSelectedContacts = folder.numbers.filter(c => c.selected);
      selectedContacts.push(...folderSelectedContacts);
    });
    
    return selectedContacts;
  }

  /**
   * Get selected folders
   * @returns {Array} Array of selected folders
   */
  getSelectedFolders() {
    return this.folders.filter(f => f.selected);
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
    // Calculate stats from both individual contacts and folder contacts
    let totalContacts = this.contacts.length;
    let allContacts = [...this.contacts];
    
    this.folders.forEach(folder => {
      totalContacts += folder.numbers.length;
      allContacts.push(...folder.numbers);
    });
    
    const activeContacts = allContacts.filter(c => c.active).length;
    const interviewedContacts = allContacts.filter(c => c.interview).length;
    const subscribedContacts = allContacts.filter(c => c.subscription).length;
    
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
   * Show loading state with skeleton screens
   * @param {boolean} show - Whether to show loading
   */
  showLoading(show) {
    if (show) {
      const skeletonHtml = `
        <div class="text-center py-4">
          <div class="spinner-modern mb-3"></div>
          <p class="text-muted">Loading contacts...</p>
        </div>
        <div class="row g-2">
          ${Array.from({length: 8}, (_, i) => `
            <div class="col-12 col-sm-6 col-md-4 col-lg-3">
              <div class="skeleton skeleton-contact">
                <div class="d-flex align-items-center p-2">
                  <div class="skeleton skeleton-text short me-2" style="width: 20px; height: 20px; border-radius: 50%;"></div>
                  <div class="flex-grow-1">
                    <div class="skeleton skeleton-text medium mb-1"></div>
                    <div class="skeleton skeleton-text short"></div>
                    <div class="d-flex gap-1 mt-1">
                      <div class="skeleton skeleton-text" style="width: 40px; height: 16px; border-radius: 4px;"></div>
                      <div class="skeleton skeleton-text" style="width: 60px; height: 16px; border-radius: 4px;"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          `).join('')}
        </div>
      `;
      $('#contactsList').html(skeletonHtml);
    }
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
window.ContactManager = ContactManager;
