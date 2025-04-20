# Mental Health Companion App 🌱

A privacy-focused web app for anonymous mental health tracking, therapist matching, and AI-powered support.

![App Preview](https://asset.cloudinary.com/dd3wlco6o/00aeb7033283b169005f0fd4e27de345). <!-- Replace with actual screenshot -->

## Features ✨

- **Anonymous login** (Firebase Auth)
- **Mood tracking** with AI analysis (Gemini/Hugging Face)
- **Therapist directory** with booking system
- **Real-time chat** (Firestore)
- **Secure data handling** (Firestore Rules)

## Tech Stack 🛠️

**Frontend**  
- React.js (Vite)  
- Tailwind CSS  
- Firebase Client SDK  

**Backend**  
- Firebase:  
  - Firestore (Database)  
  - Authentication  
  - Cloud Functions (AI processing)  

**AI**  
- Google Gemini API  
- Sentiment analysis  

## Getting Started 🚀

### Prerequisites
- Node.js v18+
- Firebase account
- Google Cloud API key (for Gemini)

### Installation
1. Clone the repo:
   ```bash
   git clone https://github.com/PoTaTo-boy-00/Baymax.git
   ```
   
  ```bash
    cd Baymax
  ```
2. Install dependencies
   ```bash
   npm install
   ```
3. Set up environment
   ```bash
   VITE_FIREBASE_API_KEY=AIzaSyCMeP3kEttFnr87Ht1__1SCyVMAjbkLATg
    VITE_FIREBASE_AUTH_DOMAIN=""
    VITE_FIREBASE_PROJECT_ID=""
    VITE_FIREBASE_STORAGE_BUCKET=""
    VITE_FIREBASE_MESSAGING_SENDER_ID=""
    VITE_FIREBASE_APP_ID=""
    VITE_GEMINI_API_KEY=""
    ```
4. Run locally
   ```bash
   npm run dev
   ```

## Tech Stack 🔧
 ### Frontend
   React + Vite

   -Tailwind CSS

   -Firebase SDK

 ### Backend
   -Firebase Firestore

   -Firebase Authentication

### AI
   -Gemini API

   -Sentiment Analysis


## Deployment 🌐
### 1. Build for production:
   ```bash
   npm run build
   ```
### 2. Deploy to Firebase Hosting:
  ```bash
  firebase deploy
  ```

## How to Contribute 🤝
   -Fork the repository

   -Create a new branch

   -Commit your changes

   -Push to the branch

   -Create a Pull Request

## License 
   MIT © 2024 YourName
