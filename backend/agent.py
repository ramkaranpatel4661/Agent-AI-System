import json
from typing import List, Dict, Any
from tools import TOOL_DEFINITIONS, search_schemes, check_eligibility
from memory import ConversationMemory


class ServiceAgent:
    def __init__(self):
        self.memory = ConversationMemory()
        self.available_tools = {
            "search_schemes": search_schemes,
            "check_eligibility": check_eligibility
        }

    def run(self, user_input: str) -> Dict[str, Any]:
        """
        MOCK AGENT LOOP
        """
        print(f"[Mock Agent] Processing: {user_input}")
        self.memory.add_user_message(user_input)
        
        trace_logs = []
        response_text = ""
        
        # Simple Keyword Matching for Demo
        if "kisan" in user_input.lower() or "farmer" in user_input.lower():
            trace_logs.append("Thought: User is asking about farmer schemes.")
            trace_logs.append("Action: Calling tool 'search_schemes' for 'farmer'")
            
            # Call Tool
            schemes = search_schemes("farmer")
            trace_logs.append(f"Tool Result: Found {len(schemes)} schemes (PM Kisan)")
            
            trace_logs.append("Thought: Formatting response in Hindi.")
            response_text = "Mujhe aapke liye PM Kisan Samman Nidhi Yojana mili hai. Ismein kisaano ko saalana 6000 rupaye milte hain. Kya aap iske liye apply karna chahte hain?"
            
        elif "apply" in user_input.lower() or "haan" in user_input.lower() or "yes" in user_input.lower():
             trace_logs.append("Thought: User wants to apply. Need to check eligibility.")
             trace_logs.append("Action: Calling tool 'check_eligibility'")
             # Mock user data
             res = check_eligibility("pm_kisan", {"occupation": "farmer", "land_ownership": True})
             trace_logs.append(f"Tool Result: {res}")
             response_text = "Badhai ho! Aap is yojana ke liye eligible hain. Main application form open kar raha hoon."
             
        else:
            trace_logs.append("Thought: Intent unclear.")
            response_text = "Namaste. Main aapki sarkari yojanao mein madad kar sakta hoon. Aap kis baare mein janna chahte hain?"

        return {
            "response": response_text,
            "trace": trace_logs
        }

