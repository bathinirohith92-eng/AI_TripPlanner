# 🧭 AI-Powered Itinerary Planner  

An **AI-driven travel planning assistant** that automatically creates optimized trip itineraries using **Google Gemini 2.5 Flash**, **LangGraph**, and **Google Cloud APIs**.  
Built with **React + Flask**, this system provides intelligent, multilingual, and route-optimized itineraries with weather insights and real-time data.  

---

## 🚀 Features  

### 🤖 **AI-Powered Itinerary Generation**  
- Uses **Google Gemini 2.5 Flash** with **LangGraph** to:  
  - Parse user intent and extract structured trip details  
  - Search for attractions, restaurants, and landmarks via **Google Places API**  
  - Optimize routes and travel times with **Google Directions API**  
  - Fetch real-time weather for each location using **OpenWeather API**  
  - Generate a detailed, day-by-day itinerary with natural language summaries  

### 💡 **Smart Query Detection**  
Automatically identifies the type of user query and adapts the UI loader accordingly:  
- **Itinerary Planning:** Displays an elegant **8-step custom loading animation**  
- **Simple Queries (flights, hotels, buses):** Uses a minimal “Thinking...” loader  

### 🌍 **Multi-Language Support**  
Seamless multi-language handling with **Google Translation API**:  
1. Detects the user’s input language  
2. Translates to English for AI processing  
3. Generates and translates the response back to the original language  

### 🗺️ **Route Optimization**  
Optimizes your travel route using **Google Distance Matrix API** to:  
- Calculate realistic travel times between all locations  
- Reduce travel fatigue (max 8 hours/day)  
- Generate balanced daily itineraries  

---

## 🧱 Tech Stack  

### 🖥️ **Frontend**  
- **React (Vite + TypeScript)**  
- **Tailwind CSS + shadcn/ui + Radix UI**  
- **Framer Motion** (animations)  

### ⚙️ **Backend**  
- **Flask (Python)**  
- **LangGraph + LangChain** for LLM orchestration  
- **Google Gemini 2.5 Flash / Flash Lite**  
- **Google APIs** (Maps, Directions, Translation, Distance Matrix)  
- **Amadeus API** for flight data  
- **OpenWeather API** for weather forecasts  

---

## 🔑 Environment Variables  

Create a `.env` file in your **backend** directory and include the following:  

bash
GOOGLE_API_KEY=your_google_cloud_api_key
GEMINI_API_KEY=your_google_vertex_ai_api_key
OPENWEATHER_API_KEY=your_openweather_api_key
AMADEUS_API_KEY=your_amadeus_api_key
AMADEUS_API_SECRET=your_amadeus_api_secret
FLASK_ENV=development

tripplanner/
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── assets/
│   │   └── App.tsx
│   ├── package.json
│   └── vite.config.ts
│
├── backend/
│   ├── app.py
│   ├── re_planner.py
│   ├── bus__.py
│   ├── requirements.txt
│   └── .env
│
└── README.md

⚙️ Installation & Setup
🧠 Prerequisites

Node.js 18+

Python 3.10+

Google Cloud account with APIs enabled

Amadeus Developer account (for flight data)

cd frontend
npm install
npm run dev          # Run development server
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Lint your code


Backend Setup
cd backend
pip install -r requirements.txt
export FLASK_ENV=development
python app.py        # or: flask run --reload


☁️ Google Cloud Setup

Enable these APIs in Google Cloud Console:

Vertex AI API

Translation API

Maps JavaScript API

Places API

Directions API

Distance Matrix API

Ensure you have valid API keys and sufficient quota for your project.

🐛 Troubleshooting
⚠️ "Translation API Quota Exceeded"


Check your Google Cloud billing


Verify Translation API is enabled


Inspect quota limits in GCP Console


🌐 "CORS Error"


Ensure Flask-CORS is installed and configured


Backend must run on port 5001


Confirm frontend is calling the correct backend URL


🔑 "Invalid API Key"


Recheck all API keys in .env


Remove domain restrictions (for testing)


Enable required APIs for your project


🧰 "Module Not Found"


Reinstall dependencies:
npm install       # frontend
pip install -r requirements.txt  # backend



Ensure your Python virtual environment is active



🧪 Development Commands
Frontend:
npm run dev
npm run build
npm run preview
npm run lint

Backend:
flask run --reload


📝 License
This project is licensed under the MIT License — free to use, modify, and distribute.

🤝 Contributing
Contributions are always welcome!


Fork this repo


Create your feature branch (git checkout -b feature/new-feature)


Commit your changes (git commit -m "Add new feature")


Push to the branch (git push origin feature/new-feature)


Open a Pull Request 🎉



📧 Support
For issues, suggestions, or questions, please open an issue on GitHub or reach out via the project’s discussion section.

🙏 Acknowledgments

Google Cloud Platform — AI, Maps & Translation APIs

Amadeus — Flight Data

OpenWeather — Weather Forecasts

shadcn/ui — Elegant UI Components

Radix UI — Accessible UI Primitives

Framer Motion — Smooth Animations


Built with ❤️ using React, TypeScript, Flask, and Google Gemini AI
