from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from hindsight_service import (
    retain_memory,
    recall_memory,
    hindsight_health,
)

from decision_extractor import (
    extract_decision_intelligence,
    generate_contextual_answer,
)

from supabase_service import save_decision_intelligence


app = FastAPI(
    title="DECISIA API",
    description="AI Decision Continuity Agent",
    version="1.0.0",
)


# --------------------------------------------------
# CORS
# --------------------------------------------------

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:5174",
        "http://127.0.0.1:5174",
        "http://localhost:5177",
        "http://127.0.0.1:5177",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# --------------------------------------------------
# REQUEST MODELS
# --------------------------------------------------

class MemoryRequest(BaseModel):
    content: str


class RecallRequest(BaseModel):
    query: str


# --------------------------------------------------
# BASIC ROUTES
# --------------------------------------------------

@app.get("/")
def home():
    return {
        "project": "DECISIA",
        "message": "DECISIA backend is running!",
        "status": "online",
    }


@app.get("/health")
def health_check():
    return {
        "status": "healthy",
        "service": "DECISIA API",
    }


# --------------------------------------------------
# HINDSIGHT HEALTH
# --------------------------------------------------

@app.get("/hindsight/health")
def check_hindsight():
    try:
        result = hindsight_health()

        return {
            "status": "connected",
            "service": "Hindsight",
            "details": result,
        }

    except Exception as error:
        raise HTTPException(
            status_code=503,
            detail=f"Hindsight connection failed: {str(error)}",
        )


# --------------------------------------------------
# RETAIN MEMORY
# --------------------------------------------------

@app.post("/memory/retain")
def add_memory(request: MemoryRequest):

    if not request.content.strip():
        raise HTTPException(
            status_code=400,
            detail="Memory content cannot be empty.",
        )

    try:

        # ------------------------------------------
        # STEP 1: Store conversation in Hindsight
        # ------------------------------------------

        hindsight_result = retain_memory(
            request.content
        )

        # ------------------------------------------
        # STEP 2: Extract structured intelligence
        # ------------------------------------------

        intelligence = extract_decision_intelligence(
            request.content
        )

        # ------------------------------------------
        # STEP 3: Save structured intelligence
        # into Supabase
        # ------------------------------------------

        supabase_result = save_decision_intelligence(
            conversation=request.content,
            intelligence=intelligence,
        )

        # ------------------------------------------
        # STEP 4: Return all results
        # ------------------------------------------

        return {
            "success": True,

            "message": (
                "Conversation stored, analyzed, "
                "and saved successfully."
            ),

            "hindsight": hindsight_result,

            "decision_intelligence": intelligence,

            "supabase": supabase_result,
        }

    except Exception as error:

        raise HTTPException(
            status_code=500,
            detail=f"Failed to process conversation: {str(error)}",
        )


# --------------------------------------------------
# RECALL MEMORY + CONTEXTUAL AI ANSWER
# --------------------------------------------------

@app.post("/memory/recall")
def search_memory(request: RecallRequest):

    if not request.query.strip():
        raise HTTPException(
            status_code=400,
            detail="Recall query cannot be empty.",
        )

    try:

        # ------------------------------------------
        # STEP 1: Search Hindsight memory
        # ------------------------------------------

        result = recall_memory(
            request.query
        )

        # ------------------------------------------
        # STEP 2: Extract all memory results
        # ------------------------------------------

        memories = result.get(
            "results",
            []
        )

        # ------------------------------------------
        # STEP 3: Remove duplicate memory text
        # ------------------------------------------

        unique_memories = []
        seen_memory_text = set()

        for memory in memories:

            memory_text = (
                memory.get("text")
                or memory.get("content")
                or ""
            ).strip()

            if not memory_text:
                continue

            # Normalize whitespace and capitalization
            # so identical memories are detected.
            normalized_text = " ".join(
                memory_text.lower().split()
            )

            if normalized_text in seen_memory_text:
                continue

            seen_memory_text.add(normalized_text)
            unique_memories.append(memory)

        # ------------------------------------------
        # STEP 4: Keep the strongest 5 unique
        # memories as focused evidence
        # ------------------------------------------

        focused_memories = unique_memories[:5]

        # ------------------------------------------
        # STEP 5: Generate context-aware answer
        # using focused Hindsight memories
        # ------------------------------------------

        answer = generate_contextual_answer(
            question=request.query,
            memories=focused_memories,
        )

        # ------------------------------------------
        # STEP 6: Return answer + focused evidence
        # ------------------------------------------

        return {
            "success": True,

            "query": request.query,

            "answer": answer,

            # Only focused evidence is sent to
            # the frontend for a cleaner UI.
            "memories": focused_memories,

            # Total memories returned by Hindsight.
            "memory_count": len(memories),

            # Unique memories actually selected
            # as evidence for the answer.
            "evidence_count": len(focused_memories),

            "hindsight": result,
        }

    except Exception as error:

        raise HTTPException(
            status_code=500,
            detail=f"Failed to recall memory: {str(error)}",
        )