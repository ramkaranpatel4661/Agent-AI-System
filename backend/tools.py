import json
from typing import List, Dict, Any

# Mock Database of Government Schemes
SCHEMES_DB = [
    {
        "id": "pm_kisan",
        "name": "PM Kisan Samman Nidhi",
        "description": "Financial support of Rs 6000 per year to farmer families.",
        "eligibility": {
            "occupation": ["farmer"],
            "land_ownership": True
        }
    },
    {
        "id": "ayushman_bharat",
        "name": "Ayushman Bharat Yojana",
        "description": "Health insurance coverage of up to Rs 5 lakh per family per year for secondary and tertiary care hospitalization.",
        "eligibility": {
            "income_group": ["low", "bpl"],
            "ration_card": True
        }
    },
    {
        "id": "sukanya_samriddhi",
        "name": "Sukanya Samriddhi Yojana",
        "description": "Savings scheme for the girl child with high interest rates and tax benefits.",
        "eligibility": {
            "gender": "female",
            "age_limit_upper": 10
        }
    }
]

def search_schemes(query: str) -> List[Dict[str, Any]]:
    """
    Simulates a semantic or fuzzy search for schemes based on a text query.
    In a real system, this would use vector embeddings. Here we use simple keyword matching.
    """
    query = query.lower()
    results = []
    print(f"[Tools] Searching for: {query}")
    
    for scheme in SCHEMES_DB:
        # Check name or description
        if query in scheme["name"].lower() or query in scheme["description"].lower():
            results.append(scheme)
        # Check simplified keywords
        elif "farmer" in query and "farmer" in scheme["eligibility"].get("occupation", []):
            results.append(scheme)
        elif "health" in query and "health" in scheme["description"].lower():
             results.append(scheme)
        elif "girl" in query and "girl" in scheme["description"].lower():
             results.append(scheme)

    # Dedup
    unique_results = []
    seen_ids = set()
    for r in results:
        if r["id"] not in seen_ids:
            unique_results.append(r)
            seen_ids.add(r["id"])
            
    return unique_results

def check_eligibility(scheme_id: str, user_attributes: Dict[str, Any]) -> Dict[str, Any]:
    """
    Checks if a user is eligible for a specific scheme based on provided attributes.
    """
    print(f"[Tools] Checking eligibility for {scheme_id} with data {user_attributes}")
    
    scheme = next((s for s in SCHEMES_DB if s["id"] == scheme_id), None)
    if not scheme:
        return {"eligible": False, "reason": "Scheme not found."}
    
    criteria = scheme["eligibility"]
    reasons = []
    
    # 1. Check Occupation
    if "occupation" in criteria:
        user_occ = user_attributes.get("occupation", "").lower()
        if user_occ not in criteria["occupation"]:
             reasons.append(f"Occupation must be one of {criteria['occupation']}.")

    # 2. Check Land Ownership
    if "land_ownership" in criteria:
        user_land = user_attributes.get("land_ownership", False)
        # Simple flexible parsing
        if isinstance(user_land, str):
            user_land = user_land.lower() in ["true", "yes", "owned", "have"]
        
        if criteria["land_ownership"] and not user_land:
            reasons.append("Must own land.")

    # 3. Check Income Group
    if "income_group" in criteria:
        user_inc = user_attributes.get("income_group", "").lower()
        if user_inc not in criteria["income_group"]:
             reasons.append(f"Income group must be {criteria['income_group']}.")
             
    # 4. Check Gender
    if "gender" in criteria:
        user_gender = user_attributes.get("gender", "").lower()
        if user_gender != criteria["gender"]:
             reasons.append(f"Gender must be {criteria['gender']}.")

    # 5. Check Age
    if "age_limit_upper" in criteria:
        user_age = user_attributes.get("age")
        if user_age is None:
             reasons.append("Age information is missing.")
        else:
            try:
                if int(user_age) > criteria["age_limit_upper"]:
                    reasons.append(f"Age must be below {criteria['age_limit_upper']}.")
            except ValueError:
                 reasons.append("Age must be a valid number.")

    if reasons:
        return {"eligible": False, "reason": "; ".join(reasons)}
    
    return {"eligible": True, "reason": "You meet all the criteria!"}

# For Tool Calling LLM Definition
TOOL_DEFINITIONS = [
    {
        "type": "function",
        "function": {
            "name": "search_schemes",
            "description": "Search for government schemes based on user query or keywords.",
            "parameters": {
                "type": "object",
                "properties": {
                    "query": {
                        "type": "string",
                        "description": "Keywords describing the type of scheme (e.g., 'farmer support', 'health insurance')."
                    }
                },
                "required": ["query"]
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "check_eligibility",
            "description": "Check if a user is eligible for a specific scheme.",
            "parameters": {
                "type": "object",
                "properties": {
                    "scheme_id": {
                        "type": "string",
                        "description": "The ID of the scheme to check (e.g., 'pm_kisan')."
                    },
                    "user_attributes": {
                        "type": "object",
                        "description": "Key-value pairs of user details (e.g., {'age': 25, 'occupation': 'farmer'})."
                    }
                },
                "required": ["scheme_id", "user_attributes"]
            }
        }
    }
]
