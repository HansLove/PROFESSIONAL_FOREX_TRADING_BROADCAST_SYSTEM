# Forex Broadcast Manager - Modular Architecture

This application has been refactored into a modular architecture for better maintainability, testability, and code organization.

## Project Structure

```
viewtt/
├── index.html              # Main HTML file
├── style.css              # CSS styles
├── js/                    # JavaScript modules
│   ├── api-service.js     # API communication layer
│   ├── ui-utils.js        # UI utilities and helpers
│   ├── contact-manager.js # Contact management functionality
│   ├── broadcast-manager.js # Broadcast and messaging functionality
│   └── app.js            # Main application coordinator
└── README.md             # This file
```

## Module Overview

### 1. ApiService (`js/api-service.js`)
Handles all external API communications and webhook calls.

**Key Features:**
- Centralized API endpoint management
- Contact CRUD operations
- Message creation and broadcasting
- Error handling and response processing

**Main Methods:**
- `getContacts()` - Fetch all contacts
- `addContact(contact)` - Add new contact
- `createMessage(template)` - Create message template
- `sendBroadcast()` - Send broadcast message

### 2. UiUtils (`js/ui-utils.js`)
Provides UI-related utilities and helper functions.

**Key Features:**
- Toast notifications
- Loading states
- Modal dialogs
- Form validation
- Connection status updates

**Main Methods:**
- `showToast(message, type)` - Display toast notifications
- `showLoading(show, target)` - Show/hide loading states
- `updateConnectionStatus(connected)` - Update connection indicator
- `showModal(title, content, options)` - Display modal dialogs

### 3. ContactManager (`js/contact-manager.js`)
Manages all contact-related operations and UI updates.

**Key Features:**
- Contact loading and display
- Contact filtering and pagination
- Contact selection management
- Statistics updates

**Main Methods:**
- `loadContacts()` - Load contacts from API
- `addContact(name, phone)` - Add new contact
- `displayContacts()` - Render contacts in UI
- `filterContacts()` - Filter contacts by search/status
- `getSelectedContacts()` - Get selected contacts

### 4. BroadcastManager (`js/broadcast-manager.js`)
Handles message templates, broadcasting, and related functionality.

**Key Features:**
- Message template management
- Template selection and insertion
- Individual and broadcast messaging
- Telegram link management

**Main Methods:**
- `selectTemplate(template)` - Select message template
- `sendIndividualMessage()` - Send single message
- `sendBroadcast()` - Send broadcast to all contacts
- `updateTelegramLink(link)` - Update Telegram channel link

### 5. ForexBroadcastApp (`js/app.js`)
Main application coordinator that initializes and manages all modules.

**Key Features:**
- Module initialization and coordination
- Global event handling
- Application lifecycle management
- Data export/import functionality

**Main Methods:**
- `init()` - Initialize the application
- `getStats()` - Get application statistics
- `exportData()` - Export application data
- `importData(data)` - Import application data

## Benefits of Modular Architecture

### 1. **Separation of Concerns**
Each module has a single responsibility, making the code easier to understand and maintain.

### 2. **Reusability**
Modules can be easily reused in other projects or extended with new functionality.

### 3. **Testability**
Individual modules can be unit tested in isolation, improving code quality.

### 4. **Maintainability**
Changes to one module don't affect others, reducing the risk of bugs.

### 5. **Scalability**
New features can be added as separate modules without modifying existing code.

### 6. **Code Organization**
Related functionality is grouped together, making the codebase more navigable.

## Usage

The application automatically initializes when the page loads. The main app instance is available globally as `window.forexApp` for debugging purposes.

### Example Usage:
```javascript
// Access the app instance
const app = window.forexApp;

// Get current statistics
const stats = app.getStats();

// Export data
const data = app.exportData();

// Import data
app.importData(data);
```

## Dependencies

- jQuery 3.7.1
- Bootstrap 5.3.3
- Font Awesome 6.4.0

## Browser Compatibility

The application is compatible with modern browsers that support:
- ES6+ JavaScript features
- Fetch API
- CSS Grid and Flexbox
- Bootstrap 5 components

## Development

To extend the application:

1. **Add new API endpoints**: Update `ApiService` class
2. **Add new UI components**: Extend `UiUtils` class
3. **Add new contact features**: Extend `ContactManager` class
4. **Add new messaging features**: Extend `BroadcastManager` class
5. **Add global features**: Extend `ForexBroadcastApp` class

## Migration Notes

The original monolithic `ForexBroadcastManager` class has been split into the above modules. All original functionality is preserved, but the code is now better organized and more maintainable.
