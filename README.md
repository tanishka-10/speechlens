# Speech Lens

An AI-powered speech and debate coach for iOS. Record a speech, get it transcribed, and receive instant feedback on clarity, confidence and structure. Practice against an AI opponent, generate debate cases, and track your progress over time.

## Features

- **AI Speech Coach**: record a speech and get a transcript plus scored feedback (clarity, confidence, structure) with suggestions for improvement.
- **Debate Practice Mode**: record your argument, get it transcribed and analyzed, and receive an AI-generated rebuttal.
- **AI Argument Generator**: generate affirmative and negative Lincoln-Douglas cases (value, criterion, contentions) for any topic.
- **Mock Arguments**: generate arguments for a chosen debate type.
- **Prompt Generator**: generate debate topics for a category.
- **Saved Arguments**: save, filter and revisit generated arguments.
- **Feedback History**: browse past feedback with transcripts and scores, with filtering.
- **Analytics**: charts of clarity and confidence over time.
- **Export**: turn past debate sessions into a PDF to share or email.
- **Accounts**: email/password sign-in with email verification.

## Tech Stack

| Area | Technology |
| --- | --- |
| App | React Native, Expo, React Navigation, React Native Paper |
| Audio | expo-av (recording) |
| AI | OpenAI Whisper (transcription), OpenAI GPT chat models (feedback, arguments, rebuttals) |
| Backend | Firebase Authentication, Cloud Firestore, Firebase Storage |
| Charts | react-native-chart-kit, react-native-svg |
| Export | expo-print, expo-sharing, expo-mail-composer |
| Build & release | EAS Build, EAS Submit, expo-updates |

## Architecture

```
Recording (expo-av)
   -> upload audio (Firebase Storage)
   -> Whisper transcription (OpenAI API)
   -> GPT analysis: scores, feedback, rebuttals (OpenAI API)
   -> results saved to Cloud Firestore
   -> Analytics, History and Export screens read from Firestore
```

- `App.js`: auth state listener and navigation (stack navigator plus bottom tabs).
- `src/screens/`: one file per screen.
- `src/services/firebase.js`: Firebase initialization, configured from environment variables.
- `src/services/openai.js`, `whisper.js`: OpenAI API calls.
- `src/services/firestore.js`: Firestore reads and writes for saved arguments and feedback.
- `src/services/auth.js`, `src/context/AuthProvider.js`: authentication helpers and context.
- `src/components/`: shared navigation components.

Firestore collections: `arguments`, `speech_feedbacks`, `debate_sessions`, `usages`, and `Config` (holds runtime configuration).

## Getting Started

### Prerequisites

- Node.js 18 or newer
- An iOS device or simulator (or Expo Go for quick testing)
- A Firebase project with Authentication (email/password), Firestore and Storage enabled
- An OpenAI API key

### Installation

```bash
git clone https://github.com/tanishka-10/speechlens.git
cd speechlens
npm install
```

### Configuration

1. Copy the example environment file and fill in your Firebase web app values (Firebase Console, Project settings, Your apps):

   ```bash
   cp .env.example .env
   ```

   ```
   EXPO_PUBLIC_FIREBASE_API_KEY=
   EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=
   EXPO_PUBLIC_FIREBASE_PROJECT_ID=
   EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=
   EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
   EXPO_PUBLIC_FIREBASE_APP_ID=
   EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID=
   ```

   `.env` is git-ignored. Never commit it.

2. The app reads the OpenAI key at runtime from the Firestore document `Config/api_keys`, in a field named `OPENAI_API_KEY`. Create that document in your own Firestore project.

   > **Security note:** any signed-in user who can read that document can read the key. Set Firestore security rules so the `Config` collection is not readable by clients, or, better, move the OpenAI calls behind a server-side function so the key never reaches the app.

3. Set Firestore and Storage security rules so users can only read and write their own data.

### Run

```bash
npx expo start -c
```

Then press `i` for the iOS simulator, or scan the QR code with Expo Go.

## Building and Releasing

Builds use [EAS](https://docs.expo.dev/eas/). Environment variables from `.env` are not included in cloud builds, so add the `EXPO_PUBLIC_FIREBASE_*` values as EAS environment variables first.

```bash
eas build --platform ios --profile production
eas submit --platform ios
```

`eas submit` will prompt for your Apple credentials. Over-the-air updates are delivered through `expo-updates`.

## Project Structure

```
App.js
app.json
eas.json
src/
  assets/
  components/
  context/
  screens/
  services/
  utils/
```

## License

No license has been specified. All rights reserved by the author.
