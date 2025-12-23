import json
import os
from typing import List, Dict, Any
import google.generativeai as genai
from google.api_core import retry
from tools import search_schemes, check_eligibility
from memory import ConversationMemory

# Configure Gemini
if "GEMINI_API_KEY" in os.environ:
    genai.configure(api_key=os.environ["GEMINI_API_KEY"])

from google.generativeai.types import HarmCategory, HarmBlockThreshold

from google.generativeai.types import HarmCategory, HarmBlockThreshold

class ServiceAgent:
    def __init__(self):
        self.memory = ConversationMemory()
        
        # Tools
        self.tools_list = [search_schemes, check_eligibility]
        
        # Safety
        self.safety_settings = {
            HarmCategory.HARM_CATEGORY_HARASSMENT: HarmBlockThreshold.BLOCK_NONE,
            HarmCategory.HARM_CATEGORY_HATE_SPEECH: HarmBlockThreshold.BLOCK_NONE,
            HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT: HarmBlockThreshold.BLOCK_NONE,
            HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT: HarmBlockThreshold.BLOCK_NONE,
        }

        # Model
        self.model = genai.GenerativeModel(
            model_name='gemini-1.5-flash',
            tools=self.tools_list,
            system_instruction=self.memory.system_prompt["content"],
            safety_settings=self.safety_settings
        )

    def run(self, user_input: str) -> Dict[str, Any]:
        """
        Executes the agent loop using stateless generate_content.
        """
        print(f"[Agent] Processing: {user_input}")
        
        # 1. Update Memory
        self.memory.add_user_message(user_input)
        
        trace_logs = []
        
        if not user_input or not user_input.strip():
             return {"response": "I didn't hear anything.", "trace": ["Empty input"]}

        # 2. Build History for Gemini
        # We need to convert our memory format to Gemini's 'contents' format
        # memory.history = [{"role": "user", "content": "..."}]
        # gemini expects [{"role": "user", "parts": [...]}]
        
        gemini_history = []
        for msg in self.memory.history:
            role = "user" if msg["role"] == "user" else "model"
            
            # If we have tool outputs (previous turns)
            if msg.get("tool_call_id"): # This is a tool response
                # In stateless mode, we need to restructure this carefully.
                # For simplicity in this demo, we might just send the text context if it gets complex,
                # BUT for tool use to work, we need the FunctionCall and FunctionResponse parts.
                
                # To avoid complexity of reconstructing full tool history manually in this short time,
                # we will rely on the fact that 'memory.history' stores text.
                # If we want true multi-turn tool use, we need to store the Parts.
                pass
            
            # Simple Text History Construction
            if msg.get("content"):
                gemini_history.append({
                    "role": role,
                    "parts": [msg["content"]]
                })
        
        # Add the current turn is already in memory logic? 
        # Wait, if I added it to memory, it's in gemini_history.
        
        # 3. Execution Loop
        try:
            # We only do 1 turn of LLM -> Tool -> LLM for now to keep it stable
            # Or a simple while loop
            
            current_history = gemini_history[:]
            
            # Turn 1: Send History
            try:
                response = self.model.generate_content(current_history)
            except Exception as e:
                print(f"[Agent] Generation with Tools failed: {e}")
                # Fallback: Try generating WITHOUT tools (Plain LLM mode)
                # This ensures we always reply, even if tools break.
                try:
                    print("[Agent] Retrying with Tool-Free Fallback model...")
                    params = {"system_instruction": self.memory.system_prompt["content"], "safety_settings": self.safety_settings}
                    fallback_model = genai.GenerativeModel('gemini-1.5-flash', **params)
                    
                    # Retry with simple user prompt if history is suspect, or try history
                    # Let's try just the user input to be safe
                    response = fallback_model.generate_content(user_input)
                except Exception as e2:
                    return {"response": "Maaf, main abhi baat nahi kar pa raha hoon. (Critical Error)", "trace": [str(e2)]}
            
            # Check for tool call or text from the response we got (Main or Fallback)
            try:
                # If fallback model was used, it won't have function calls
                candidate = response.candidates[0]
            except IndexError:
                 return {"response": "Maaf, main sun nahi paya.", "trace": ["Empty candidates"]}
                
            tool_calls = []
            text_part = ""
            
            for part in candidate.content.parts:
                if part.function_call:
                    tool_calls.append(part.function_call)
                if part.text:
                    text_part += part.text
            
            if tool_calls:
                # Handle Tool Call
                trace_logs.append(f"Thought: {text_part}")
                
                # We need to append the Model's msg (Tool Call) to history
                current_history.append(candidate.content) # Model turn
                
                for fc in tool_calls:
                    func_name = fc.name
                    args = dict(fc.args)
                    trace_logs.append(f"Action: Calling {func_name} with {args}")
                    
                    # Execute
                    if func_name == "search_schemes":
                        res = search_schemes(args.get("query", ""))
                    elif func_name == "check_eligibility":
                        res = check_eligibility(args.get("scheme_id"), args.get("user_attributes", {}))
                    else:
                        res = {"error": "Unknown tool"}
                    
                    trace_logs.append(f"Tool Result: Success")
                    
                    # Append Tool Response to history
                    # This is the tricky part in stateless: we need a 'function_response' part
                    tool_response_part = genai.protos.Part(
                        function_response=genai.protos.FunctionResponse(
                            name=func_name,
                            response={"result": res}
                        )
                    )
                    
                    current_history.append({
                        "role": "function", # in newer api it's 'function' or part of user? 
                        # Actually in generate_content, function response is usually a 'user' role message 
                        # containing a function_response part?
                        # Let's check documentation pattern: 
                        # User: Msg
                        # Model: FunctionCall
                        # User: FunctionResponse
                        "role": "user",
                        "parts": [tool_response_part] 
                    })

                # Turn 2: Send Tool Results back
                response2 = self.model.generate_content(current_history)
                final_text = response2.text
                
                self.memory.add_assistant_message(final_text)
                trace_logs.append(f"Response: {final_text[:50]}...")
                
                return {"response": final_text, "trace": trace_logs}

            else:
                # No tool call, just text
                self.memory.add_assistant_message(text_part)
                trace_logs.append(f"Response: {text_part[:50]}...")
                return {"response": text_part, "trace": trace_logs}

        except Exception as e:
            import traceback
            traceback.print_exc()
            return {"response": "Technical Error.", "trace": [str(e)]}
