# **App Name**: Win11 Check

## Core Features:

- User Authentication: User authentication using email and password to secure the inventory data.
- Add Computer Entry: Form to add new computer entries with fields for Asset Tag, Computer Name, Processor, RAM, Storage, TPM version, UEFI support, Secure Boot status, Windows 11 compatibility (calculated), and Observations. Bilingual support (English/Spanish) for all labels.
- Compatibility Checklist: Display a dynamic checklist based on international standards (TPM 2.0, UEFI with Secure Boot, Supported CPU, RAM, Storage, Compatibility Verified) with bilingual support.

## Style Guidelines:

- Primary color: Teal (#008080) for a professional and calm feel.
- Secondary color: Light gray (#F0F0F0) for backgrounds and neutral elements.
- Accent: Orange (#FFA500) to highlight important actions and status indicators.
- Clear, sans-serif font for form labels and data display.
- Mobile-first responsive design with a simple, single-column layout for forms and data display.
- Use clear and recognizable icons for navigation and status indicators (e.g., checkmark for compatibility, warning for incompatibility).

## Original User Request:
Create a bilingual (English/Spanish) prototype app using Firebase Studio. The app will serve as an inventory tool for a small business to register computers that are not compatible with Windows 11. The app should:

1. Be simple and mobile-friendly.
2. Include user authentication (email/password).
3. Allow the user to add computer entries with the following fields:
   - Asset Tag or ID
   - Computer Name
   - Processor (e.g., Intel i5-4570)
   - RAM Size (e.g., 8 GB)
   - Storage Type and Size
   - TPM (Trusted Platform Module) version
   - UEFI support (Yes/No)
   - Secure Boot Enabled (Yes/No)
   - Windows 11 Compatible (Yes/No - calculated or entered)
   - Observations/Notes

4. Display a checklist based on international standards:
   - TPM 2.0 required
   - UEFI with Secure Boot enabled
   - Supported CPU generation
   - Minimum 4 GB RAM
   - Minimum 64 GB Storage
   - Compatibility verified using PC Health Check or equivalent

5. Use Firebase Realtime Database or Firestore to store the computer data.
6. Support Spanish and English for all field labels and interface text.

Provide the JSON structure for the database, example entries, and Firestore rules for access control.
  