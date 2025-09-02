/**
 * Contact Manager Module
 * Handles contact-related operations and UI updates
 */
class ContactManager {
  constructor(apiService, uiUtils) {
    this.apiService = apiService;
    this.uiUtils = uiUtils;
    this.contacts = [];
    this.currentPage = 1;
    this.contactsPerPage = 10;
    this.filteredContacts = [];
  }

  /**
   * Initialize contact management
   */
  async init() {
    await this.loadContacts();
    this.bindEvents();
  }

  /**
   * Load contacts from API
   */
  async loadContacts() {
    try {
      this.uiUtils.showLoading(true);
      this.contacts = await this.apiService.getContacts();
      this.filteredContacts = [...this.contacts];
      this.displayContacts();
      this.updateStats();
    } catch (error) {
      this.uiUtils.showToast(error.message, 'error');
    } finally {
      this.uiUtils.showLoading(false);
    }
  }

  /**
   * Add a new contact
   * @param {string} name - Contact name
   * @param {string} phone - Contact phone
   */
  async addContact(name, phone) {
    if (!name || !phone) {
      this.uiUtils.showToast('Please fill in all fields', 'warning');
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
      this.uiUtils.showToast('Contact added successfully', 'success');
    } catch (error) {
      this.uiUtils.showToast(error.message, 'error');
    }
  }

  /**
   * Display contacts in the UI
   */
  displayContacts() {
    const start = (this.currentPage - 1) * this.contactsPerPage;
    const end = start + this.contactsPerPage;
    const pageContacts = this.filteredContacts.slice(start, end);

    const contactsHtml = pageContacts.map(contact => this.renderContactItem(contact)).join('');
    $('#contactsList').html(contactsHtml);
    this.generatePagination();
    this.bindContactCheckboxes();
  }

  /**
   * Render a single contact item
   * @param {Object} contact - Contact object
   * @returns {string} HTML string for contact item
   */
  renderContactItem(contact) {
    return `
      <div class="list-group-item contact-item d-flex justify-content-between align-items-center">
        <div class="d-flex align-items-center">
          <span class="status-indicator status-${contact.status}"></span>
          <div>
            <strong class="text-primary">${contact.userName}</strong>
            <br>
            <small class="text-secondary">${contact.phone}</small>
          </div>
        </div>
        <div class="form-check">
          <input class="form-check-input contact-checkbox" type="checkbox" 
                 value="${contact.id}" ${contact.selected ? 'checked' : ''}>
        </div>
      </div>
    `;
  }

  /**
   * Generate pagination HTML
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
   * Bind checkbox events for contacts
   */
  bindContactCheckboxes() {
    $('.contact-checkbox').on('change', (e) => {
      const contactId = $(e.target).val();
      const contact = this.contacts.find(c => c.id === contactId);
      if (contact) {
        contact.selected = $(e.target).is(':checked');
      }
    });
  }

  /**
   * Navigate to a specific page
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

    this.currentPage = 1; // Reset to first page when filtering
    this.displayContacts();
  }

  /**
   * Toggle select all contacts
   * @param {boolean} isChecked - Whether to select or deselect all
   */
  toggleSelectAll(isChecked) {
    $('.contact-checkbox').prop('checked', isChecked);
    this.contacts.forEach(contact => {
      contact.selected = isChecked;
    });
  }

  /**
   * Get selected contacts
   * @returns {Array} Array of selected contact objects
   */
  getSelectedContacts() {
    return this.contacts.filter(contact => contact.selected);
  }

  /**
   * Get online contacts only
   * @returns {Array} Array of online contact objects
   */
  getOnlineContacts() {
    return this.contacts.filter(contact => contact.status === 'online');
  }

  /**
   * Update statistics display
   */
  updateStats() {
    $('#totalContacts').text(this.contacts.length);
    $('#sentMessages').text(Math.floor(Math.random() * 500) + 200);
    $('#conversionRate').text((Math.random() * 20 + 10).toFixed(1) + '%');
    $('#telegramClicks').text(Math.floor(Math.random() * 100) + 50);
  }

  /**
   * Bind event listeners
   */
  bindEvents() {
    $('#contactForm').on('submit', (e) => {
      e.preventDefault();
      const name = $('#contactName').val().trim();
      const phone = $('#contactPhone').val().trim();
      this.addContact(name, phone);
    });

    $('#searchContacts').on('input', () => this.filterContacts());
    $('#statusFilter').on('change', () => this.filterContacts());

    $('#selectAllContacts').on('change', (e) => {
      this.toggleSelectAll($(e.target).is(':checked'));
    });

    $(document).on('click', '.pagination .page-link', (e) => {
      e.preventDefault();
      const page = parseInt($(e.target).text());
      this.goToPage(page);
    });
  }
}
