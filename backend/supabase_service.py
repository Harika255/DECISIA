import os

from dotenv import load_dotenv
from supabase import create_client, Client


# Load variables from .env
load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")


if not SUPABASE_URL:
    raise RuntimeError("SUPABASE_URL is missing from the .env file.")

if not SUPABASE_KEY:
    raise RuntimeError("SUPABASE_KEY is missing from the .env file.")


# Create Supabase client
supabase: Client = create_client(
    SUPABASE_URL,
    SUPABASE_KEY
)


def save_decision_intelligence(
    conversation: str,
    intelligence: dict
):
    """
    Save the conversation and the structured
    decision intelligence into Supabase.
    """

    data = {
        "conversation": conversation,

        "decisions": intelligence.get(
            "decisions", []
        ),

        "preferences": intelligence.get(
            "preferences", []
        ),

        "responsibilities": intelligence.get(
            "responsibilities", []
        ),

        "deadlines": intelligence.get(
            "deadlines", []
        ),

        "commitments": intelligence.get(
            "commitments", []
        ),
    }

    response = (
        supabase
        .table("decision_intelligence")
        .insert(data)
        .execute()
    )

    return response.data