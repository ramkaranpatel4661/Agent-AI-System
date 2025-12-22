from typing import List, Dict, Literal

class ConversationMemory:
    def __init__(self):
        self.history: List[Dict[str, str]] = []
        self.system_prompt = {
            "role": "system",
            "content": """You are an intelligent government service agent named 'SevaBot'. 
Your goal is to help Indian citizens find and apply for welfare schemes.
You communicate primarily in HINDI (or the user's native language).

PROTOCOLS:
1. ALWAYS translate your internal reasoning to the final response language (Hindi).
2. Use tools to find information. Do not hallucinate schemes.
3. When parameters are missing for eligibility, ASK the user politely.
4. If a tool fails, explain politely and try a broader search.
5. Maintain context. If the user says "what about me?", refer to previous attributes.
"""
        }

    def add_user_message(self, content: str):
        self.history.append({"role": "user", "content": content})

    def add_assistant_message(self, content: str, tool_calls=None):
        msg = {"role": "assistant", "content": content}
        if tool_calls:
            msg["tool_calls"] = tool_calls
        self.history.append(msg)

    def add_tool_result(self, tool_call_id: str, content: str):
        self.history.append({
            "role": "tool",
            "tool_call_id": tool_call_id,
            "content": content
        })

    def get_messages(self) -> List[Dict[str, str]]:
        return [self.system_prompt] + self.history

    def clear(self):
        self.history = []
