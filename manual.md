
# CitadelCRM Manual

## Firebase Setup Steps

1. Go to [Firebase Console](https://console.firebase.google.com/) and create a new project (or use an existing one).
2. In the Firebase project, click on "Storage" in the left sidebar and set up Cloud Storage.
3. In "Project settings" > "General", scroll down to "Your apps" and click the "</>" (Web) icon to register a new web app.
4. Copy the Firebase config object and update `frontend/src/utils/firebase.js` with your project's credentials.
5. In "Build" > "Authentication", enable the sign-in method you want (if required).
6. In "Storage" > "Rules", set rules to allow authenticated users to upload/download files, or set to public for testing:
   ```
   service firebase.storage {
     match /b/{bucket}/o {
       match /{allPaths=**} {
         allow read, write: if true;
       }
     }
   }
   ```
   (For production, restrict access appropriately.)
7. Install Firebase SDK in your project:
   ```sh
   cd frontend
   npm install firebase
   ```
8. Restart your dev server if running.

## Issues Fixed

1. Not able to edit details once lead created
2. Uploaded quotation but not showing (Error 404 while showing preview)
