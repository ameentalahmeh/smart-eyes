# 🧠 Smart Eyes

**Smart Eyes** is a voice-activated personal assistant mobile application built to empower blind and visually impaired individuals. It allows users to independently perform safe daily tasks such as scene recognition, personal setup via speech, and hands-free app interaction using state-of-the-art AI.


[_**Smart Eyes Demo**_](https://drive.google.com/file/d/12rXzk82v8SUFDCWMYRYsR19jekPVtKaT/view?usp=sharing)

---

## 📱 Key Features

- 🔊 **Voice-Activated Interface**  
  Launch and operate the app entirely using voice commands — hands-free and screen-free.  
  📌 *Note: A single tap is required to **start** and **stop** voice recording.*

- 👤 **One-Time Smart Profile Setup**  
  On first use, users are asked to provide their **name**, **age**, and **gender** via speech. This information is saved to personalize the experience on future visits.

- 📸 **Scene Description (`analyze`)**  
  Captures a photo using the device’s camera (Automatically after countdown 3 seconds) and provides an AI-generated voice description of the user’s surroundings.

- 🧹 **Profile Reset (`reset`)**  
  Clears the saved profile, allowing the user to re-enter their personal data.

- ❌ **Exit App (`close`)**  
  Ends the session and closes the application using a simple voice command.

---

## 📲 App Screens

| Screen    | Purpose                                |
| --------- | -------------------------------------- |
| `Welcome` | First-time setup (voice-based profile) |
| `Home`    | Greets user and waits for commands     |
| `Camera`  | Captures photo for scene analysis      |
| `Results` | Displays or speaks analysis output     |

---

## 🗣️ Supported Voice Commands

| Command   | Description                            |
| --------- | -------------------------------------- |
| `name`    | Provide your full name                 |
| `gender`  | Provide your gender                    |
| `age`     | Provide your age as a number           |
| `analyze` | Take a photo and describe the scene    |
| `reset`   | Delete saved profile and restart setup |
| `close`   | Gracefully exit the app                |

---

## 🚀 Getting Started

> **Note:** The app requires internet access and microphone permission.

### Prerequisites

- A smartphone with a microphone and camera  
- AI/ML API key - Thaaaaanks [**LabLab!**](http://lablab.ai/)

---

### 🔧 Technologies & Models Used

| Purpose                | Technology / Model                                                               |
| ---------------------- | -------------------------------------------------------------------------------- |
| Mobile App             | **React Native (Expo)** – Cross-platform development using Expo framework        |
| Backend API            | **Flask (Python)** – Handles communication with AI/ML APIs                       |
| Speech Recognition     | **Whisper / OpenAI STT** – Translates user speech into text                      |
| Scene Interpretation   | **GPT-4o / GPT-4 Turbo** – Provides contextual scene descriptions via AI/ML API  |
| Voice Command Handling | **Custom Intent Recognition** – Interprets voice commands to trigger app actions |

---

## 🧪 How It Works

### 👤 First-Time Profile Setup (Voice-Guided)

1. App: _"What is your name?"_
2. App: _"Got it, **{name}**. What is your gender?"_
3. App: _"Got it, **{gender}**. How old are you? Please say your age as a number."_
4. App: _"Got it, **{age}**. Thank you! Your profile has been set up. Going to home screen!"_

✔️ Profile is stored locally for a personalized experience.  
🔁 Say `reset` to reinitiate setup.

---

### 🎯 Sample User Flow

1. _"Hey Google, open Smart Eyes"_  
2. App: _"Welcome back, Ahmed. What would you like to do today?"_
3. User: _"Analyze"_  
4. App: _"You’re facing a quiet street with parked cars and a bench."_

---


## 📈 Roadmap & Future Enhancements

- 🚦 **Real-Time Navigation Assistance**  
  Detect crosswalks, curbs, and obstacles to support safer mobility.

- 🛍️ **Advanced Object Recognition**  
  Identify everyday objects like products, doorways, and signs in real-time.

- 🔁 **Offline Functionality**  
  Enable core features to work without internet by running AI models directly on the device.

- 🕶️ **Wearable Integration**  
  Connect with smart glasses and other wearable devices for hands-free camera input.

- 🕓 **Activity History**  
  Store and access previous voice commands, queries, and responses for user reference.

---


## 🛡️ Accessibility First

Smart Eyes follows accessibility-first principles:
- Fully voice-driven with minimal touch interaction
- Audio confirmation for every action
- Compatible with screen readers and assistant tools

---

## 🤝 Contributing

We welcome contributions from developers, researchers, and accessibility advocates.  
Ideal skills:
- AI/ML (Computer Vision, NLP)
- React Native or mobile development
- UX for accessibility and inclusive design

> _Built with purpose by **[@ameentalahmeh](https://github.com/ameentalahmeh)**_
