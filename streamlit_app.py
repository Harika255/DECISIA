import os
import requests
import streamlit as st

st.set_page_config(
    page_title="DECISIA",
    page_icon="🧠",
    layout="wide"
)

st.title("🧠 DECISIA")
st.subheader("AI Decision Continuity Agent")
st.write(
    "Never lose the reasoning behind a decision."
)

BACKEND_URL = os.getenv(
    "BACKEND_URL",
    "http://127.0.0.1:8000"
)


# -----------------------------
# Sidebar
# -----------------------------

st.sidebar.title("DECISIA")

page = st.sidebar.radio(
    "Navigate",
    [
        "Dashboard",
        "Add Conversation",
        "Ask DECISIA",
        "System Status"
    ]
)


# -----------------------------
# Dashboard
# -----------------------------

if page == "Dashboard":

    st.header("Decision Continuity Dashboard")

    col1, col2, col3 = st.columns(3)

    with col1:
        st.metric(
            "Memory Engine",
            "Hindsight"
        )

    with col2:
        st.metric(
            "AI Engine",
            "Groq"
        )

    with col3:
        st.metric(
            "Backend",
            "FastAPI"
        )

    st.divider()

    st.markdown(
        """
        ### What DECISIA does

        DECISIA remembers important information from meetings
        and conversations so that future questions can use
        previous decision context.

        **Memory flow**

        Conversation  
        ↓  
        Hindsight RETAIN  
        ↓  
        Persistent Memory  
        ↓  
        Hindsight RECALL  
        ↓  
        Context-aware AI Answer
        """
    )


# -----------------------------
# Add Conversation
# -----------------------------

elif page == "Add Conversation":

    st.header("📝 Add Meeting / Conversation")

    conversation = st.text_area(
        "Paste your meeting notes or conversation",
        height=300,
        placeholder=(
            "Example:\n"
            "The client prefers a light blue and white interface.\n"
            "The client rejected the dark theme.\n"
            "Sarah will prepare the UI prototype by October 2."
        )
    )

    if st.button(
        "🧠 Store in DECISIA Memory",
        use_container_width=True
    ):

        if not conversation.strip():

            st.warning(
                "Please enter a conversation first."
            )

        else:

            try:

                response = requests.post(
                    f"{BACKEND_URL}/memory/retain",
                    json={
                        "content": conversation
                    },
                    timeout=120
                )

                if response.status_code == 200:

                    data = response.json()

                    st.success(
                        "Conversation stored successfully!"
                    )

                    intelligence = data.get(
                        "decision_intelligence",
                        {}
                    )

                    st.subheader(
                        "Decision Intelligence"
                    )

                    col1, col2 = st.columns(2)

                    with col1:

                        st.markdown("### Decisions")

                        for item in intelligence.get(
                            "decisions", []
                        ):
                            st.write(f"• {item}")

                        st.markdown("### Preferences")

                        for item in intelligence.get(
                            "preferences", []
                        ):
                            st.write(f"• {item}")

                        st.markdown("### Responsibilities")

                        for item in intelligence.get(
                            "responsibilities", []
                        ):
                            st.write(f"• {item}")

                    with col2:

                        st.markdown("### Deadlines")

                        for item in intelligence.get(
                            "deadlines", []
                        ):
                            st.write(f"• {item}")

                        st.markdown("### Commitments")

                        for item in intelligence.get(
                            "commitments", []
                        ):
                            st.write(f"• {item}")

                    st.divider()

                    st.success(
                        "Hindsight RETAIN completed."
                    )

                else:

                    st.error(
                        f"Backend error: {response.text}"
                    )

            except Exception as error:

                st.error(
                    f"Could not connect to backend: {error}"
                )


# -----------------------------
# Ask DECISIA
# -----------------------------

elif page == "Ask DECISIA":

    st.header("💬 Ask DECISIA")

    question = st.text_input(
        "Ask a question about previous decisions",
        placeholder=(
            "What interface did the client prefer?"
        )
    )

    if st.button(
        "🔎 Recall Memory",
        use_container_width=True
    ):

        if not question.strip():

            st.warning(
                "Please enter a question."
            )

        else:

            try:

                response = requests.post(
                    f"{BACKEND_URL}/memory/recall",
                    json={
                        "query": question
                    },
                    timeout=120
                )

                if response.status_code == 200:

                    data = response.json()

                    st.success(
                        "Memory recalled successfully!"
                    )

                    st.subheader(
                        "🤖 DECISIA Answer"
                    )

                    st.info(
                        data.get(
                            "answer",
                            "No answer available."
                        )
                    )

                    st.divider()

                    st.subheader(
                        "🧠 Hindsight Evidence"
                    )

                    st.write(
                        f"Memories searched: "
                        f"{data.get('memory_count', 0)}"
                    )

                    st.write(
                        f"Relevant evidence: "
                        f"{data.get('evidence_count', 0)}"
                    )

                    memories = data.get(
                        "memories",
                        []
                    )

                    for index, memory in enumerate(
                        memories,
                        start=1
                    ):

                        text = (
                            memory.get("text")
                            or memory.get("content")
                            or ""
                        )

                        if text:

                            with st.expander(
                                f"Memory {index}"
                            ):

                                st.write(text)

                else:

                    st.error(
                        f"Backend error: {response.text}"
                    )

            except Exception as error:

                st.error(
                    f"Could not connect to backend: {error}"
                )


# -----------------------------
# System Status
# -----------------------------

elif page == "System Status":

    st.header("⚙️ System Status")

    if st.button(
        "Check Backend"
    ):

        try:

            response = requests.get(
                f"{BACKEND_URL}/health",
                timeout=10
            )

            if response.status_code == 200:

                st.success(
                    "FastAPI backend is online."
                )

                st.json(
                    response.json()
                )

            else:

                st.error(
                    "Backend is not responding correctly."
                )

        except Exception as error:

            st.error(
                f"Backend connection failed: {error}"
            )

    if st.button(
        "Check Hindsight"
    ):

        try:

            response = requests.get(
                f"{BACKEND_URL}/hindsight/health",
                timeout=20
            )

            if response.status_code == 200:

                st.success(
                    "Hindsight memory system is connected."
                )

                st.json(
                    response.json()
                )

            else:

                st.error(
                    "Hindsight connection failed."
                )

        except Exception as error:

            st.error(
                f"Hindsight connection failed: {error}"
            )