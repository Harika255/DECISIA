import os
import json
import httpx

from dotenv import load_dotenv

load_dotenv()

GROQ_API_KEY = os.getenv("GROQ_API_KEY")
GROQ_URL = "https://api.groq.com/openai/v1/chat/completions"
MODEL = "openai/gpt-oss-20b"


def extract_decision_intelligence(conversation: str):
    if not conversation.strip():
        return {
            "decisions": [],
            "preferences": [],
            "responsibilities": [],
            "deadlines": [],
            "commitments": [],
        }

    if not GROQ_API_KEY:
        raise RuntimeError(
            "GROQ_API_KEY is missing from the backend .env file."
        )

    system_prompt = """
You are DECISIA, an AI Decision Continuity Agent.

Analyze the provided meeting or conversation and extract ONLY
information that is explicitly supported by the conversation.

Return valid JSON with exactly these five keys:

{
  "decisions": [],
  "preferences": [],
  "responsibilities": [],
  "deadlines": [],
  "commitments": []
}

Rules:

1. decisions:
   Important choices or conclusions made by the team.

2. preferences:
   User/client preferences, likes, dislikes, requirements,
   accepted styles, or rejected options.

3. responsibilities:
   A person assigned to perform a task.
   Include the person's name and task.

4. deadlines:
   Explicit dates or deadlines associated with tasks.

5. commitments:
   Promises, agreed actions, or tasks someone committed to do.

Do NOT invent information.

If a category has no information, return an empty array.

Keep each extracted item concise.

Return ONLY valid JSON.
"""

    user_prompt = f"""
Analyze this conversation:

--- BEGIN CONVERSATION ---

{conversation}

--- END CONVERSATION ---
"""

    payload = {
        "model": MODEL,
        "messages": [
            {
                "role": "system",
                "content": system_prompt,
            },
            {
                "role": "user",
                "content": user_prompt,
            },
        ],
        "temperature": 0,
    }

    headers = {
        "Authorization": f"Bearer {GROQ_API_KEY}",
        "Content-Type": "application/json",
    }

    response = httpx.post(
        GROQ_URL,
        headers=headers,
        json=payload,
        timeout=120,
    )

    response.raise_for_status()

    data = response.json()

    content = data["choices"][0]["message"]["content"].strip()

    if content.startswith("```"):
        content = content.replace("```json", "")
        content = content.replace("```", "")
        content = content.strip()

    try:
        result = json.loads(content)

    except json.JSONDecodeError as error:
        raise RuntimeError(
            f"LLM returned invalid JSON: {content}"
        ) from error

    return {
        "decisions": result.get("decisions", []),
        "preferences": result.get("preferences", []),
        "responsibilities": result.get("responsibilities", []),
        "deadlines": result.get("deadlines", []),
        "commitments": result.get("commitments", []),
    }


def generate_contextual_answer(
    question: str,
    memories: list,
):
    """
    Generate a concise answer using memories retrieved
    from Hindsight.
    """

    if not question.strip():
        raise RuntimeError("Question cannot be empty.")

    if not GROQ_API_KEY:
        raise RuntimeError(
            "GROQ_API_KEY is missing from the backend .env file."
        )

    if not memories:
        return (
            "I couldn't find any relevant decision memory "
            "for this question."
        )

    memory_text = []

    for index, memory in enumerate(memories[:10], start=1):
        text = (
            memory.get("text")
            or memory.get("content")
            or ""
        )

        if text.strip():
            memory_text.append(
                f"{index}. {text.strip()}"
            )

    combined_memories = "\n".join(memory_text)

    system_prompt = """
You are DECISIA, an AI Decision Continuity Agent.

Your job is to answer a user's question using ONLY the
relevant memories retrieved from Hindsight.

The memories represent previous meetings, decisions,
preferences, responsibilities, deadlines, and commitments.

Rules:

1. Use the memories as your source of truth.
2. Do not invent facts.
3. Do not claim something happened if it is not supported
   by the memories.
4. If memories contain conflicting information, explicitly
   mention the conflict.
5. Give a concise, natural answer.
6. Mention important previous decisions or preferences
   when they directly help answer the question.
7. Do not list all memories unless necessary.
8. Do not mention internal implementation details such as
   embeddings, reranking, vector databases, or Hindsight.
9. Answer directly.

Return ONLY the answer text.
"""

    user_prompt = f"""
Question:

{question}

Relevant memories:

{combined_memories}
"""

    payload = {
        "model": MODEL,
        "messages": [
            {
                "role": "system",
                "content": system_prompt,
            },
            {
                "role": "user",
                "content": user_prompt,
            },
        ],
        "temperature": 0,
    }

    headers = {
        "Authorization": f"Bearer {GROQ_API_KEY}",
        "Content-Type": "application/json",
    }

    response = httpx.post(
        GROQ_URL,
        headers=headers,
        json=payload,
        timeout=120,
    )

    response.raise_for_status()

    data = response.json()

    return data["choices"][0]["message"]["content"].strip()