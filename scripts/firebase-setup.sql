-- Firebase Collections Structure
-- This is a reference for the Firestore collections structure

-- Collection: donor
-- Document ID: user.uid
-- Fields:
-- - name: string
-- - email: string
-- - createdAt: timestamp
-- - uid: string

-- Collection: hospital
-- Document ID: user.uid
-- Fields:
-- - hospitalName: string
-- - email: string
-- - createdAt: timestamp
-- - uid: string

-- Collection: donordetails
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
-- - lastDonationDate: string (ISO date)
-- - bloodGroup: string (A+, A-, B+, B-, AB+, AB-, O+, O-)
-- - email: string
-- - createdAt: timestamp
-- - isEligible: boolean

-- Collection: requests
-- Document ID: auto-generated
-- Fields:
-- - hospitalId: string
-- - hospitalName: string
-- - address: string
-- - phone: string
-- - bloodGroup: string
-- - unitsRequired: number
-- - donorId: string
-- - donorName: string
-- - createdAt: timestamp
-- - status: string (pending, accepted, declined, cancelled, accepted_by_hospital)
-- - acceptedAt: timestamp (optional)
-- - declinedAt: timestamp (optional)
-- - cancelledAt: timestamp (optional)
-- - cancelReason: string (optional)
-- - acceptedByHospitalAt: timestamp (optional)

-- Collection: notifications
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
-- - createdAt: timestamp
-- - read: boolean
-- - readAt: timestamp (optional)
-- - hospitalAccepted: boolean (optional)
-- - hospitalAcceptedAt: timestamp (optional)

-- Collection: extradetails
-- Document ID: user.uid (hospital)
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
-- - createdAt: timestamp

-- Firestore Security Rules (to be added in Firebase Console):
/*
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow users to read/write their own donor data
    match /donor/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Allow users to read/write their own hospital data
    match /hospital/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Allow users to read/write their own donor details
    match /donordetails/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
      allow read: if request.auth != null; // Hospitals can read donor details
    }
    
    // Allow authenticated users to read/write requests
    match /requests/{requestId} {
      allow read, write: if request.auth != null;
    }

    // Allow authenticated users to read/write notifications
    match /notifications/{notificationId} {
      allow read, write: if request.auth != null;
    }

    // Allow hospitals to read/write their own extra details
    match /extradetails/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
*/
