# Forex Broadcast Manager - Modular Version

A modular WhatsApp broadcast management system for Forex trading communications.

## Features

- **Modular Architecture**: Clean separation of concerns with dedicated modules
- **API Integration**: Fetches numbers from `https://broadcast-system-d7ca773e62c8.herokuapp.com/n/get/all`
- **Template Management**: Pre-built and custom message templates
- **AI Processing**: AI-powered message generation and enhancement
- **Contact Management**: Add, filter, and manage recipient contacts
- **Broadcast System**: Send messages to selected recipients

## Project Structure

```
WhatsBroadcast/
├── index.html              # Main HTML file
├── style.css              # Custom CSS styles
├── js/                    # JavaScript modules
│   ├── api-service.js     # API communication layer
│   ├── contact-manager.js # Contact management
│   ├── template-manager.js # Template and message handling
│   ├── broadcast-manager.js # Broadcast operations
│   └── app.js             # Main application coordinator
└── README.md              # This file
```

## Modules

### 1. API Service (`js/api-service.js`)
Handles all API communications:
- Fetches numbers from the new API endpoint
- Manages contact operations (add, load)
- Handles AI message generation
- Sends broadcast messages

**Key Methods:**
- `getAllNumbers()` - Fetches from `/n/get/all` endpoint
- `loadContacts()` - Loads contacts with fallback to original API
- `addContact(contact)` - Adds new contact
- `createMessage(template)` - Generates AI message
- `sendMessage()` - Sends broadcast

### 2. Contact Manager (`js/contact-manager.js`)
Manages contact operations and display:
- Loads contacts from API (tries new numbers API first)
- Handles contact filtering and pagination
- Manages contact selection
- Updates statistics

**Key Methods:**
- `loadContacts()` - Loads and processes contact data
- `addContact(name, phone)` - Adds new contact
- `filterContacts()` - Filters by search and status
- `displayContacts()` - Renders contact list
- `getSelectedContacts()` - Returns selected contacts

### 3. Template Manager (`js/template-manager.js`)
Handles message templates and AI processing:
- Manages predefined and custom templates
- Processes messages with AI
- Handles template creation and selection
- Manages message preview

**Key Methods:**
- `selectTemplate(template)` - Selects a template
- `insertTemplate()` - Processes template with AI
- `saveTemplate()` - Saves custom template
- `previewMessage()` - Shows message preview

### 4. Broadcast Manager (`js/broadcast-manager.js`)
Manages broadcast operations:
- Prepares broadcasts for sending
- Handles message sending
- Manages broadcast state

**Key Methods:**
- `prepareBroadcast()` - Prepares broadcast
- `sendBroadcast()` - Sends broadcast
- `isBroadcastPrepared()` - Checks preparation status

### 5. Main App (`js/app.js`)
Coordinates all modules:
- Initializes all managers
- Binds global events
- Loads initial data
- Provides module access

## API Integration

The application now integrates with the new numbers API:

**Endpoint:** `https://broadcast-system-d7ca773e62c8.herokuapp.com/n/get/all`

**Fallback:** If the new API fails, it falls back to the original contacts API.

**Data Processing:** Numbers from the new API are processed to match the expected contact format with:
- `id`: Unique identifier
- `userName`: Contact name (from API or generated)
- `phone`: Phone number
- `status`: Random status (online/offline/pending)
- `selected`: Selection state
- `source`: API source indicator

## Usage

1. Open `index.html` in a web browser
2. The app will automatically load contacts from the API
3. Select a template or write a custom message
4. Choose recipients from the contact list
5. Prepare and send the broadcast

## Browser Compatibility

- Modern browsers with ES6+ support
- jQuery 3.7.1+
- Bootstrap 5.3.3+

## Dependencies

- jQuery 3.7.1
- Bootstrap 5.3.3
- Font Awesome 6.4.0

## Development

To modify the application:

1. **API Changes**: Update `js/api-service.js`
2. **Contact Management**: Modify `js/contact-manager.js`
3. **Templates**: Edit `js/template-manager.js`
4. **Broadcast Logic**: Update `js/broadcast-manager.js`
5. **Global Features**: Modify `js/app.js`

Each module is self-contained and can be modified independently.
