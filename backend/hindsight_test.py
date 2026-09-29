import os
from dotenv import load_dotenv

# Load DECISIA environment variables
load_dotenv()

# Verify configuration before starting Hindsight
provider = os.getenv("HINDSIGHT_API_LLM_PROVIDER")
model = os.getenv("HINDSIGHT_API_LLM_MODEL")
api_key = os.getenv("HINDSIGHT_API_LLM_API_KEY")

if not provider:
    raise RuntimeError("HINDSIGHT_API_LLM_PROVIDER is missing")

if not model:
    raise RuntimeError("HINDSIGHT_API_LLM_MODEL is missing")

if not api_key:
    raise RuntimeError("HINDSIGHT_API_LLM_API_KEY is missing")

print("Hindsight configuration loaded")
print("Provider:", provider)
print("Model:", model)
print("API key loaded:", bool(api_key))

from hindsight import HindsightEmbedded

print("\nStarting Hindsight...")

hindsight = HindsightEmbedded()

print("Hindsight started successfully!")

# Store a memory
print("\nStoring DECISIA memory...")

hindsight.retain(
    bank_id="decisia",
    content="""
    Project meeting with the client:

    The client prefers a light blue and white interface.
    The client rejected a dark theme.
    Sarah is responsible for preparing the UI prototype.
    The prototype is due next Friday.
    """
)

print("Memory stored successfully!")

# Recall the memory
print("\nRecalling memory...")

results = hindsight.recall(
    bank_id="decisia",
    query="What interface style does the client prefer?"
)

print("\n========== DECISIA RECALL ==========")
print(results)
print("====================================")