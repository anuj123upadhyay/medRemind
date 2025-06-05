# 💊 MedRemind - Medication Management App

MedRemind is your personal medication assistant, helping you track, remember, and manage your medications effectively.

![MedRemind Logo](./assets/images/icon.png)

## 🌟 Features

- 📅 **Smart Medication Scheduling** - Set custom reminders for each medication
- 📊 **Adherence Tracking** - Monitor your medication compliance with detailed statistics
- 📈 **Progress Reports** - Generate CSV reports for healthcare providers
- 🔒 **Secure Storage** - Biometric authentication and encrypted data storage
- 📱 **Cross-Platform** - Works on iOS, Android, and Web
- 🌙 **Dark/Light Theme** - Customizable interface
- 📋 **Medication Management** - Add, edit, and track medication supplies
- 🔔 **Smart Notifications** - Customizable reminder system
- 📋 **Export Data** - Generate detailed adherence reports

## 🛠️ Tech Stack

- **Framework**: React Native with Expo
- **Language**: TypeScript
- **Navigation**: Expo Router
- **Backend**: Appwrite
- **Authentication**: Expo Local Authentication (Biometric)
- **Notifications**: Expo Notifications
- **Storage**: AsyncStorage + Appwrite Database
- **Styling**: Custom Design System

## 📱 Screenshots

| Home Screen | Medications | Calendar | Statistics |
|-------------|-------------|----------|------------|
| ![Home](./screenshots/home.png) | ![Medications](./screenshots/medications.png) | ![Calendar](./screenshots/calendar.png) | ![Stats](./screenshots/stats.png) |

## 🚀 Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Expo CLI
- iOS Simulator (for iOS development)
- Android Studio (for Android development)

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/anujupadhyay/medremind.git
cd medremind
```

2. **Install dependencies**
```bash
npm install
```

3. **Set up environment variables**
```bash
cp .env.example .env
# Edit .env with your Appwrite credentials
```

4. **Start the development server**
```bash
npx expo start
```

### Environment Setup

1. Create an [Appwrite](https://appwrite.io/) account
2. Create a new project and database
3. Set up collections for medications, reminders, and dose history
4. Copy your project credentials to `.env` file

## 📦 Building for Production

### Android APK
```bash
# Install EAS CLI
npm install -g @expo/eas-cli

# Login to Expo
eas login

# Build APK
eas build --platform android --profile production-apk
```

### iOS
```bash
# Build for iOS
eas build --platform ios
```

## 🏗️ Project Structure

```
medRemind/
├── app/                    # App screens and navigation
│   ├── (tabs)/            # Tab navigation screens
│   ├── calendar/          # Calendar functionality
│   ├── history/           # Medication history
│   ├── medications/       # Medication management
│   ├── settings/          # App settings
│   └── stats/             # Statistics and reports
├── components/            # Reusable components
├── services/             # API and data services
├── utils/                # Utility functions
├── assets/               # Images, fonts, and static assets
├── types/                # TypeScript type definitions
└── config/               # Configuration files
```

## 🔧 Key Features Explained

### Medication Tracking
- Add medications with custom schedules
- Set reminders for different times of day
- Track supply levels and refill dates
- Support for various medication types (pills, liquid, injections)

### Smart Reminders
- Customizable notification sounds and vibrations
- Snooze functionality for flexibility
- Automatic rescheduling for missed doses
- Intelligent reminder timing

### Adherence Monitoring
- Real-time adherence percentage calculation
- Weekly and monthly statistics
- Visual progress indicators
- Exportable reports for healthcare providers

### Security & Privacy
- Biometric authentication (Face ID/Touch ID/Fingerprint)
- Local data encryption
- Secure cloud synchronization
- Privacy-focused design

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 📞 Contact

- **Developer**: Anuj Upadhyay
- **Email**: anuju760@gmail.com
- **GitHub**: [@anujupadhyay](https://github.com/anujupadhyay)

## ⚠️ Disclaimer

MedRemind is not a medical device and should not replace professional medical advice. Always consult with healthcare professionals for medical decisions.

## 🙏 Acknowledgments

- Built with [Expo](https://expo.dev/)
- Backend powered by [Appwrite](https://appwrite.io/)
- Icons from [Expo Vector Icons](https://docs.expo.dev/guides/icons/)
- Inspired by the need for better medication management tools

---

**Made with ❤️ for better healthcare management**