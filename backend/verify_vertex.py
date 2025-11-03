import os
from google.oauth2 import service_account
from google.cloud import aiplatform
from dotenv import load_dotenv

# ✅ Load .env file automatically
load_dotenv()

# Load environment variables
SERVICE_ACCOUNT_PATH = os.getenv("SERVICE_ACCOUNT_PATH")
VERTEX_PROJECT = os.getenv("VERTEX_PROJECT")
VERTEX_LOCATION = os.getenv("VERTEX_LOCATION")
MODEL_ID = os.getenv("MODEL_ID_PLANNER")

print("🔍 Checking configuration...")
print(f"SERVICE_ACCOUNT_PATH: {SERVICE_ACCOUNT_PATH}")
print(f"PROJECT: {VERTEX_PROJECT}")
print(f"LOCATION: {VERTEX_LOCATION}")
print(f"MODEL_ID: {MODEL_ID}")
print()

try:
    # Authenticate
    credentials = service_account.Credentials.from_service_account_file(
        SERVICE_ACCOUNT_PATH,
        scopes=["https://www.googleapis.com/auth/cloud-platform"],
    )

    # Initialize Vertex AI
    aiplatform.init(
        project=VERTEX_PROJECT,
        location=VERTEX_LOCATION,
        credentials=credentials,
    )

    print("✅ Authentication successful! Connected to Vertex AI project.")

    # Optional: test model initialization
    from vertexai.preview import generative_models as gm
    model = gm.GenerativeModel(MODEL_ID)
    print(f"🧠 Model '{MODEL_ID}' initialized successfully!")

except Exception as e:
    print("❌ Something went wrong:")
    print(e)
