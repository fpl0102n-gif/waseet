# How to Deploy to Firebase Hosting

This guide assumes you have the **Firebase CLI** installed. If not, install it via npm:
```bash
npm install -g firebase-tools
```

## Step 1: Login to Firebase
Authenticate with your Google account:
```bash
firebase login
```

## Step 2: Initialize Project (One-time)
If you haven't associated this folder with your Firebase project yet:
1.  Run `firebase use --add`.
2.  Select your Firebase project from the list.
3.  Give it the alias `default`.

*Alternatively, manually edit `.firebaserc` and replace `"your-project-id-here"` with your actual project ID.*

## Step 3: Build the Application
Create the production build of your Vite app:
```bash
npm run build
```
*This will generate a `dist` folder.*

## Step 4: Deploy
Upload the build to Firebase Hosting:
```bash
firebase deploy --only hosting
```

Your app will be live at `https://<your-project-id>.web.app`.
