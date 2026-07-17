# Firestore Schema — ZXH4 Panel

## `users/{uid}`
| Field | Type | Notes |
|---|---|---|
| uid | string | matches Firebase Auth uid |
| email | string | |
| displayName | string | |
| role | "user" \| "subadmin" \| "admin" | |
| walletBalance | number | source of truth for spendable funds |
| permissions | map | only present when role == "subadmin" (see SubAdminPermissions) |
| createdAt | number (epoch ms) | |
| disabled | boolean | optional, for banning accounts |

## `services/{serviceId}`
| Field | Type |
|---|---|
| category | string |
| name | string |
| ratePer1000 | number |
| min / max | number |
| smmVaultServiceId | string |
| description | string (optional) |
| active | boolean |

## `orders/{orderId}`
userId, serviceId, serviceName, targetLink, quantity, charge, status
(pending / in_progress / completed / canceled / partial), smmVaultOrderId,
createdAt, updatedAt.

## `coupons/{code}`
code, creditAmount, expiryDate (epoch ms), claimLimit, claimedBy (array of
uids — enforces single-use per user), createdAt, createdBy.

## `chats/{userId}` (one thread per end user)
userId, userDisplayName, lastMessage, lastMessageAt, unreadForAdmin.

### `chats/{userId}/messages/{messageId}`
chatId, senderId, senderRole, text, createdAt, read.

## `wallet_transactions/{id}`
userId, type ("credit" | "debit"), amount, reason, actorId, createdAt.
Written by the admin-adjust-wallet API route as an audit trail — this is
what "View Financial Logs" sub-admin permission should read from.

## `password_resets/{uid}`
code (6-digit string), expiresAt (epoch ms), used (boolean).

## `system_settings/config`
`{ maintenanceMode: boolean }` — read by the public `/api/maintenance-status`
route and by `middleware.ts` on every request.

## `system_settings/smtp`
`{ host, port, secure, user, appPassword, fromName }` — Google SMTP /
App Password credentials, read only by server routes via firebase-admin.

## `system_settings/auth`
`{ googleClientId, googleClientSecret, enabled }` — for reference/display
in the admin panel. Actual Google OAuth in Firebase is configured once in
the Firebase console (Authentication -> Sign-in method -> Google); this
document lets the admin panel show/manage those values and toggle the
`enabled` flag that the login page checks before rendering the Google button.

## `system_settings/api`
`{ baseUrl, apiKey }` — SmmVault (or any compatible SMM panel API)
credentials, read only by server routes via firebase-admin.

---

## Suggested Firestore Security Rules (starting point)

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    function isSignedIn() { return request.auth != null; }
    function role() { return get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role; }
    function isAdmin() { return isSignedIn() && role() == "admin"; }
    function isAdminOrSub() { return isSignedIn() && (role() == "admin" || role() == "subadmin"); }

    match /users/{uid} {
      allow read: if isSignedIn() && (request.auth.uid == uid || isAdminOrSub());
      allow write: if isAdmin() || (isSignedIn() && request.auth.uid == uid && request.resource.data.role == resource.data.role);
    }

    match /services/{id} {
      allow read: if true;
      allow write: if isAdmin();
    }

    match /orders/{id} {
      allow read: if isSignedIn() && (resource.data.userId == request.auth.uid || isAdminOrSub());
      allow create: if false; // orders are created server-side only, via /api/place-order
      allow update: if isAdminOrSub();
    }

    match /coupons/{code} {
      allow read: if isAdminOrSub();
      allow write: if isAdmin() || (role() == "subadmin");
    }

    match /chats/{userId} {
      allow read, write: if isSignedIn() && (request.auth.uid == userId || isAdminOrSub());
      match /messages/{messageId} {
        allow read, write: if isSignedIn() && (request.auth.uid == userId || isAdminOrSub());
      }
    }

    match /system_settings/{doc} {
      allow read: if isAdmin(); // client reads only happen from the admin panel
      allow write: if isAdmin();
    }

    match /wallet_transactions/{id} {
      allow read: if isAdmin() || (role() == "subadmin");
      allow write: if false; // written only by the server via firebase-admin
    }

    match /password_resets/{uid} {
      allow read, write: if false; // server-only via firebase-admin
    }
  }
}
```

Note: `/api/maintenance-status` reads `system_settings/config` using
firebase-admin (bypasses these rules entirely), so the public middleware
check keeps working even though client reads of `system_settings` are
locked to admins above.
