# Data Safety and Privacy FAQ (Draft)

## What data does the app read?
The app reads transaction-like notification text from enabled UPI/payment apps (for example, merchant, amount, timestamp, and message context needed to classify a transaction).

## Does the app read SMS messages?
No. The v1 Play Store build does not require `READ_SMS`. Notification access is used instead.

## Why is Notification Access required?
Notification access is the minimum Android capability needed for automatic capture without manual entry. Without it, the app cannot auto-detect incoming transaction alerts.

## Do I need to grant phone OTP access?
Phone OTP is used for account authentication and sync setup. It is separate from notification capture.

## Is data processing on-device or server-side?
The product is on-device-first for parsing and categorization. Server-side APIs are used for account sync, review actions, and insights where required.

## Can I review and correct wrong categories?
Yes. Low-confidence transactions are sent to the Review Queue, where users can accept or edit the suggested category.

## What control do users have over their data?
Users can export data and request account deletion from Settings.

## How is account deletion handled?
A deletion request should remove user-linked records from backend data stores and revoke future sync access for that account.

## How is exported data delivered?
Export endpoints produce an export job and downloadable artifact once complete (see `plans/api-contracts.md` privacy endpoints).

## Is personal financial data sold to third parties?
No product requirement supports selling personal financial data. Data use is limited to core app functionality (capture, categorization, review, and insights).

## How long is data retained?
Retention policy is not finalized in this draft and must be explicitly defined before GA (for active, exported, and deleted-account datasets).

## What should users do if they suspect unauthorized access?
Immediately disable notification access for the app in Android settings, rotate account credentials, and request account deletion/export review from Settings.
