\# NeuroSense AI 🧠



\### AI-Powered Desktop Wellness Insights Application



\*\*NeuroSense AI\*\* is an experimental desktop application built with Electron and the Presage SmartSpectra SDK. It explores camera-based physiological signal processing to provide breathing and cardiovascular insights through a desktop interface.



The project combines desktop application development, camera integration, and real-time physiological signal processing to investigate how computer vision and AI-powered technologies can support personal wellness insights.



\---



\## 📌 Table of Contents



\- \[Overview](#-overview)

\- \[Project Objectives](#-project-objectives)

\- \[Features](#-features)

\- \[How It Works](#-how-it-works)

\- \[Technology Stack](#️-technology-stack)

\- \[Project Structure](#-project-structure)

\- \[Installation and Setup](#-installation-and-setup)

\- \[Environment Configuration](#-environment-configuration)

\- \[Running the Application](#-running-the-application)

\- \[Supported Physiological Metrics](#-supported-physiological-metrics)

\- \[Camera Requirements](#-camera-requirements)

\- \[Troubleshooting](#-troubleshooting)

\- \[Privacy and Security](#-privacy-and-security)

\- \[Limitations](#-limitations)

\- \[Future Improvements](#-future-improvements)

\- \[Disclaimer](#️-disclaimer)

\- \[Author](#-author)



\---



\## 🚀 Overview



NeuroSense AI is designed to explore camera-based physiological measurement using the Presage SmartSpectra SDK.



The application captures camera input, integrates it with the SmartSpectra processing pipeline, and handles supported physiological metric data.



The desktop interface is developed using Electron, allowing JavaScript-based application logic to run in a desktop environment.



\### Why NeuroSense AI?



Traditional physiological monitoring often relies on dedicated hardware sensors. NeuroSense AI explores an alternative approach using camera-based signal processing.



The project focuses on:



\- Exploring camera-based physiological measurement.

\- Integrating a real-time processing SDK into an Electron application.

\- Understanding breathing and cardiovascular metric extraction.

\- Building a desktop interface for wellness-oriented insights.

\- Investigating the challenges of camera quality, lighting, and real-time processing.



\---



\## 🎯 Project Objectives



The main objectives of NeuroSense AI are:



1\. Develop a desktop application using Electron.

2\. Integrate the Presage SmartSpectra SDK.

3\. Process live camera input for physiological analysis.

4\. Support breathing and cardiovascular metric processing.

5\. Handle SDK validation and processing status.

6\. Explore real-time camera performance and measurement quality.

7\. Build a foundation for future wellness insight features.



\---



\## ✨ Features



\### 🖥️ Desktop Application



\- Built using Electron.

\- Uses a JavaScript-based desktop architecture.

\- Provides a desktop environment for camera-based processing.



\### 📷 Camera Integration



\- Captures live camera input.

\- Supports camera-based physiological signal processing.

\- Allows camera selection through the available camera interface.



\### 🔬 SmartSpectra SDK Integration



\- Integrated with the Presage SmartSpectra Node SDK.

\- Uses the SDK's supported processing pipeline.

\- Handles supported physiological metric data.



\### 🫁 Breathing Metrics



\- Supports breathing-related metric processing.

\- Requests the configured breathing metric group.



\### ❤️ Cardiovascular Metrics



\- Supports cardiovascular metric processing.

\- Requests the configured cardiovascular metric group.



\### ⚡ Real-Time Processing



\- Designed for live camera processing.

\- Handles SDK frame processing and validation.

\- Provides a foundation for real-time wellness insights.



\---



\## 🔄 How It Works



The application follows a desktop camera-processing workflow.



```text

Camera Input

&#x20;    │

&#x20;    ▼

Electron Renderer

&#x20;    │

&#x20;    ▼

SmartSpectra SDK Integration

&#x20;    │

&#x20;    ▼

Camera Frame Processing

&#x20;    │

&#x20;    ▼

SDK Validation

&#x20;    │

&#x20;    ▼

Physiological Metric Processing

&#x20;    │

&#x20;    ▼

Breathing \& Cardiovascular Insights

```



\### Processing Workflow



1\. The application initializes the Electron desktop environment.

2\. The renderer accesses the camera stream.

3\. Camera frames are passed through the SmartSpectra integration.

4\. The SDK performs its supported processing and validation.

5\. The application handles available metric data.

6\. The interface can present supported physiological insights.



Actual metric availability depends on SDK processing, camera conditions, and validation results.



\---



\## 🛠️ Technology Stack



| Technology | Purpose |

|---|---|

| Electron | Desktop application framework |

| JavaScript | Application logic |

| Node.js | Runtime environment |

| Presage SmartSpectra SDK | Camera-based physiological processing |

| esbuild | JavaScript bundling |

| HTML | Application interface structure |

| CSS | Interface styling |

| npm | Dependency management |



\---



\## 📁 Project Structure



```text

NeuroSenseAI-Electron/

│

├── main.js

├── renderer.js

├── renderer-backup.js

├── renderer-camera-backup.js

├── index.html

├── styles.css

├── build.js

├── package.json

├── package-lock.json

├── .gitignore

└── README.md

```



\### File Responsibilities



| File | Description |

|---|---|

| `main.js` | Electron main process and application lifecycle |

| `renderer.js` | Camera interface and renderer-side SDK integration |

| `index.html` | Desktop application interface |

| `styles.css` | Application styling |

| `build.js` | Builds the renderer bundle |

| `package.json` | Project configuration and npm scripts |

| `package-lock.json` | Locked dependency versions |

| `.gitignore` | Excludes environment files and generated files |

| `README.md` | Project documentation |



\*\*Note:\*\* The renderer backup files are development backups and are not required for the application's normal execution. Keep them only if you need them for recovery.



\---



\## ⚙️ Installation and Setup



Follow these steps to run NeuroSense AI locally.



\### Prerequisites



Install the following before starting:



\- Node.js

\- npm

\- Git

\- A compatible webcam or virtual camera

\- A valid Presage SmartSpectra API key



Verify your installation:



```bash

node --version

npm --version

git --version

```



\---



\### 1. Clone the Repository



```bash

git clone https://github.com/ekramzafar/NeuroSenseAI-Electron.git

```



Navigate to the project directory:



```bash

cd NeuroSenseAI-Electron

```



\---



\### 2. Install Dependencies



Install the project dependencies:



```bash

npm install

```



This installs the packages defined in `package.json`.



\---



\## 🔐 Environment Configuration



NeuroSense AI requires a valid Presage API key for SDK initialization.



\### Create an Environment File



Create a file named `.env` in the project root.



Add the following:



```env

PRESAGE\_API\_KEY=your\_presage\_api\_key

```



Replace the placeholder with your actual API key.



\### Important Security Notes



\- Never commit your `.env` file.

\- Never expose your API key in screenshots or public logs.

\- Do not hardcode credentials into source files.

\- Keep environment variables private.



The project uses environment configuration during the build process.



\---



\## ▶️ Running the Application



\### Step 1: Build the Application



Run:



```bash

npm run build

```



This executes the configured build script and generates the renderer bundle.



\### Step 2: Start NeuroSense AI



Run:



```bash

npm start

```



The application should launch in an Electron desktop window.



\### Development Workflow



Whenever you modify the renderer source code, rebuild the application before testing:



```bash

npm run build

npm start

```



\---



\## 🔬 Supported Physiological Metrics



The current implementation requests the following metric groups:



| Metric Category | Metric IDs |

|---|---|

| Breathing | `0`, `1`, `2` |

| Cardiovascular | `15`, `16`, `17` |



These IDs represent the metric configuration used in the current implementation.



Metric output may depend on:



\- SDK configuration

\- Camera frame quality

\- Face visibility

\- Lighting conditions

\- SDK validation status

\- Processing availability



The application should only display values that are actually returned by the SDK.



\---



\## 📷 Camera Requirements



Camera quality plays an important role in camera-based physiological processing.



For better processing conditions:



\- Use a camera with a clear view of the face.

\- Ensure sufficient and consistent lighting.

\- Keep the face centered in the camera frame.

\- Avoid excessive movement.

\- Maintain a stable camera position.

\- Avoid strong backlighting.

\- Allow the SDK to complete its validation process.



\### Camera Performance



Camera frame rate and processing performance may vary depending on:



\- Camera hardware

\- Camera resolution

\- USB or wireless connection

\- Virtual camera software

\- System performance

\- SDK processing requirements



A higher camera frame rate does not automatically guarantee accurate physiological measurements.



\---



\## 🧰 Troubleshooting



\### Application Does Not Start



Try reinstalling dependencies:



```bash

npm install

```



Then rebuild:



```bash

npm run build

```



Start the application again:



```bash

npm start

```



\### API Key or SDK Initialization Error



Check that:



\- The `.env` file exists.

\- The API key is valid.

\- The environment variable name is correct.

\- The application is being launched through the configured npm scripts.



\### Camera Not Detected



Check that:



\- The camera is connected.

\- Camera permissions are enabled.

\- Another application is not exclusively using the camera.

\- The correct camera device is selected.



\### Poor Camera Validation



If the SDK reports insufficient lighting or poor face visibility:



\- Increase the lighting.

\- Move closer to the camera.

\- Keep the face fully visible.

\- Avoid sudden movements.



\---



\## 🔒 Privacy and Security



NeuroSense AI works with camera input and physiological metric data.



Users should:



\- Use the application in a private environment.

\- Avoid sharing sensitive camera recordings.

\- Protect API credentials.

\- Review SDK data-handling policies.

\- Avoid publishing personal physiological measurements.



The application's data handling depends on the implemented SDK integration and configuration.



\---



\## ⚠️ Limitations



NeuroSense AI is currently an experimental project.



Potential limitations include:



\- Camera-dependent measurement quality.

\- Sensitivity to lighting and movement.

\- Variable camera frame rates.

\- SDK validation requirements.

\- Limited metric availability.

\- Dependence on compatible hardware and SDK configuration.



The application should not be considered a validated physiological monitoring system.



\---



\## 🚧 Future Improvements



Potential future development areas include:



\- Improved camera performance monitoring.

\- Better camera selection and configuration.

\- Enhanced real-time metric visualization.

\- Historical measurement dashboards.

\- Improved error handling and SDK lifecycle management.

\- User-friendly validation feedback.

\- More robust application packaging.

\- Additional wellness insight features.



These are planned areas for exploration and are not necessarily implemented in the current version.



\---



\## ⚕️ Disclaimer



NeuroSense AI is an experimental software and wellness technology project.



It is \*\*not a medical device\*\* and is not intended to diagnose, treat, cure, or prevent any disease or medical condition.



Physiological measurements may be affected by camera quality, lighting, movement, environmental conditions, and SDK limitations.



Do not use this application as a substitute for professional medical advice or clinical monitoring.



\---



\## 👨‍💻 Author



\*\*Ekram Zafar\*\*



B.Tech in Computer Science and Engineering



GitHub: \[@ekramzafar](https://github.com/ekramzafar)



\---



\## ⭐ Support



If you find this project interesting, consider giving the repository a star.



Contributions, suggestions, and feedback are welcome.



\---



\*\*Built with curiosity, code, and a vision for AI-powered wellness.\*\* 🧠

