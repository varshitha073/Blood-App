-- Firebase Collections Structure for Blood Donation App
-- This document outlines the 6 main collections used in the application

-- Collection 1: donors (Authentication data for donors)
-- Document ID: user.uid
-- Fields:
-- - name: string
-- - email: string
-- - createdAt: timestamp (ISO string)
-- - uid: string

-- Collection 2: hospitals (Authentication data for hospitals)
-- Document ID: user.uid
-- Fields:
-- - hospitalName: string
-- - email: string
-- - createdAt: timestamp (ISO string)
-- - uid: string

-- Collection 3: donordetails (Complete donor profile information)
-- Document ID: user.uid
-- Fields:
-- - uid: string
-- - name: string
-- - age: number
-- - weight: number
-- - phone: string
-- - city: string
-- - state: string
-- - country: string
-- - pincode: string
-- - lastDonationDate: string (ISO date) | null
-- - bloodGroup: string (A+, A-, B+, B-, AB+, AB-, O+, O-)
-- - healthCondition: string (healthy, minor_illness, chronic_condition, on_medication, recent_surgery)
-- - hemoglobin: number | null
-- - email: string
-- - createdAt: timestamp (ISO string)
-- - isEligible: boolean
-- - isAvailable: boolean (for availability toggle)
-- - eligibilityReasons: array of strings
-- - eligibilityCheckedAt: timestamp (ISO string)

-- Collection 4: hospitaldetails (Complete hospital profile information)
-- Document ID: user.uid
-- Fields:
-- - uid: string
-- - hospitalName: string
-- - address: string
-- - phone: string
-- - city: string
-- - state: string
-- - country: string
-- - pincode: string
-- - email: string
-- - createdAt: timestamp (ISO string)

-- Collection 5: bloodrequests (Blood donation requests from hospitals to donors)
-- Document ID: auto-generated
-- Fields:
-- - hospitalId: string
-- - hospitalName: string
-- - address: string
-- - phone: string
-- - city: string
-- - state: string
-- - country: string
-- - pincode: string
-- - bloodGroup: string
-- - unitsRequired: number
-- - donorId: string
-- - donorName: string
-- - createdAt: timestamp (ISO string)
-- - status: string (pending, accepted, declined, cancelled)
-- - acceptedAt: timestamp (ISO string) | null
-- - declinedAt: timestamp (ISO string) | null
-- - cancelledAt: timestamp (ISO string) | null
-- - cancelReason: string | null

-- Collection 6: notifications (Notifications for hospitals when donors accept requests)
-- Document ID: auto-generated
-- Fields:
-- - type: string (request_accepted, request_declined)
-- - hospitalId: string
-- - donorId: string
-- - requestId: string
-- - message: string
-- - donorDetails: object {
--   - name: string
--   - phone: string
--   - bloodGroup: string
--   - age: number
--   - weight: number
--   - city: string
--   - state: string
-- }
-- - createdAt: timestamp (ISO string)
-- - read: boolean
-- - readAt: timestamp (ISO string) | null
-- - hospitalAccepted: boolean | null
-- - hospitalAcceptedAt: timestamp (ISO string) | null

-- Firestore Security Rules (to be added in Firebase Console):
/*
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow users to read/write their own donor auth data
    match /donors/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Allow users to read/write their own hospital auth data
    match /hospitals/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Allow users to read/write their own donor details
    match /donordetails/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
      allow read: if request.auth != null; // Hospitals can read donor details
    }
    
    // Allow users to read/write their own hospital details
    match /hospitaldetails/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Allow authenticated users to read/write blood requests
    match /bloodrequests/{requestId} {
      allow read, write: if request.auth != null;
    }

    // Allow authenticated users to read/write notifications
    match /notifications/{notificationId} {
      allow read, write: if request.auth != null;
    }
  }
}
*/

-- Collection Usage Summary:
-- 1. donors: Basic auth info for donor users
-- 2. hospitals: Basic auth info for hospital users  
-- 3. donordetails: Complete donor profiles with eligibility and availability
-- 4. hospitaldetails: Complete hospital profiles with contact info
-- 5. bloodrequests: All blood donation requests (replaces old 'requests' collection)
-- 6. notifications: Hospital notifications when donors accept requests

-- Key Changes from Previous Structure:
-- - Separated auth data (donors/hospitals) from profile data (donordetails/hospitaldetails)
-- - Renamed 'requests' to 'bloodrequests' for clarity
-- - Added 'isAvailable' field to donordetails for availability toggle
-- - Enhanced hospital profile with complete address information
-- - Maintained notifications collection for hospital-donor communication
