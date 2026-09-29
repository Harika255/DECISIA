import streamlit as st

st.set_page_config(
    page_title="DECISIA",
    page_icon="🧠"
)

st.title("🧠 DECISIA")
st.subheader("AI Decision Continuity Agent")

st.write("Never lose the reasoning behind a decision.")

st.success("DECISIA Streamlit app is running successfully!")

st.markdown("""
### Memory Flow

Conversation  
↓  
Hindsight RETAIN  
↓  
Persistent Memory  
↓  
Hindsight RECALL  
↓  
Context-aware AI Answer
""")