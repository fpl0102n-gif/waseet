# Alkhayr Module Refactor - Consistency & Privacy

## 1. Field Unification
- **Shared Component**: Created `PersonalInfoSection.tsx` to unify the "Personal Information" block across `LocalMedicineForm` and `ForeignMedicineForm`.
- **Consistency**: Both forms now use identical fields and validation for:
  - Full Name
  - City
  - Wilaya
  - Email
  - Phone
  - Contact Type (WhatsApp/Telegram)

## 2. My Requests Simplification (Privacy)
- **Phone-Only Lookup**: Removed the requirement for "Request ID". Users now search using **only their phone number**.
- **Formatted Output**: The results are displayed as a list of cards, solving the issue of multiple requests per phone number.
- **Privacy Mode**: The tracking view **only** returns:
  - Request Title
  - ID (for reference)
  - Type (Local/Foreign)
  - Status
  - Created Date
  - Admin Note
- **Security**: No personal data (Name, Location, Medical Details) is returned in the search results, preventing extensive data scraping via phone numbers.

## 3. Database & Schema
- **Views**: The `alkhayr_requests_admin` view exposes all necessary fields (`email`, `contact_value`) for the Admin panel.
- **Tables**: `contact_value` is consistently used as the primary phone number column in both `local` and `foreign` tables.

## 4. Verification
- **Forms**: Checked that both Local and Foreign forms render the new Personal Info section correctly.
- **Tracking**: Verified that entering a phone number returns all associated requests without exposing sensitive data.

## 5. Alkhayr Green Theme (Humanitarian Design)
- **Scope**: Applied strictly to `/alkhayr` module pages.
- **Design System**:
    - **Primary Color**: `#2E7D32` (Humanitarian Green)
    - **Secondary**: `#4CAF50`
    - **Background**: Soft Green/White (`#F9FBF9`)
    - **Typography**: Inter font with specific weights for titles.
- **Implementation**:
    - Added `.theme-alkhayr` to `index.css`.
    - Updated `Section` component to support `alkhayr` variant.
    - Refactored `MyRequestsView` to use theme-compliant status colors.
