"""
AI Chatbot using Google Gemini API
"""

import google.generativeai as genai
from django.conf import settings
import json
import logging
from typing import List, Dict, Optional, Tuple

logger = logging.getLogger('chatbot')


# --- Intent Constants (Step 1.1) ---
INTENT_HELP = "HELP"
INTENT_NAVIGATION = "NAVIGATION"
INTENT_RECOMMEND_TASKS = "RECOMMEND_TASKS"
INTENT_CREATE_TASK = "CREATE_TASK"
INTENT_GENERAL_CHAT = "GENERAL_CHAT"

TASK_FIELD_ORDER = [
    "title",
    "description",
    "category",
    "budget",
    "location",
]

TASK_FIELD_PROMPTS = {
    "title": "What is the task title?",
    "description": "Please describe the task requirements in detail.",
    "category": "What category does this task belong to?",
    "budget": "What is your budget in EGP?",
    "location": "Is this task remote or tied to a specific location?",
}

ALLOWED_ACTIONS = {
    "NAVIGATE": {
        "required_fields": ["path"],
        "optional_fields": ["label"]
    }
}

class ChatbotService:
    """
    AI-powered chatbot using Google Gemini
    """
    
    def __init__(self):
        """Initialize Gemini API"""
        self.api_available = False
        try:
            if settings.GEMINI_API_KEY:
                genai.configure(api_key=settings.GEMINI_API_KEY)
                self.model = genai.GenerativeModel(settings.GEMINI_MODEL)
                self.api_available = True
                logger.info("Gemini API configured successfully")
            else:
                logger.warning("Gemini API key not configured, using fallback responses")
                self.model = None
        except Exception as e:
            logger.error(f"Failed to initialize Gemini API: {e}")
            self.model = None
        
        # Enhanced system prompt for intelligent assistance
        self.system_prompt = """
You are an intelligent AI assistant for Multitask, an AI-powered freelance marketplace platform in Egypt.

# CORE IDENTITY
You are knowledgeable, helpful, and proactive. You understand both freelancers and clients' needs. You speak naturally and provide actionable guidance.

# PLATFORM OVERVIEW
Multitask connects clients with skilled freelancers across Egypt. The platform uses AI to:
- Match freelancers with relevant tasks (semantic similarity + TF-IDF)
- Provide personalized recommendations based on skills and history
- Help users create better task descriptions
- Facilitate smooth communication

# KEY FEATURES YOU SHOULD KNOW
1. **For You Page**: AI-powered task recommendations with match percentages
2. **Browse Tasks**: Search all available tasks by category, budget, location
3. **My Tasks**: View tasks you've posted (clients) or applied to (freelancers)
4. **Messages**: Real-time chat between users
5. **Profile**: Manage skills, bio, portfolio, and preferences
6. **Dashboard**: Overview of activity, earnings, and stats

# TASK CATEGORIES
- Design & Creative (logos, graphics, UI/UX)
- Programming & Tech (web development, mobile apps, APIs)
- Writing & Translation (content writing, technical docs, translation)
- Marketing & Business (social media, SEO, business consulting)
- Consulting & Advice (legal, financial, career advice)
- Cleaning & Home Services (house cleaning, repairs, maintenance)
- Tutoring & Education (academic tutoring, language teaching)
- Personal Assistant (data entry, virtual assistance)
- Other Services (miscellaneous tasks)

# NAVIGATION CAPABILITIES
When users ask to go somewhere, guide them clearly:
- "go to profile" → Profile page
- "show my tasks" → My Tasks page
- "find tasks" or "browse tasks" → Browse Tasks page
- "go to dashboard" → Dashboard/Home page
- "for you" or "recommendations" → For You page (AI recommendations)
- "messages" or "inbox" → Messages page
- "create task" or "post task" → Create Task page

# USER TYPES & CONTEXT AWARENESS
- **FREELANCER**: Help them find tasks, improve applications, build profile
- **CLIENT**: Help them create compelling task posts, find freelancers, manage projects
- **BOTH**: Understand dual context - they can post and apply to tasks

# TASK CREATION GUIDANCE
When helping create tasks, gather professionally:
1. **Title**: Clear, specific (e.g., "Logo Design for Tech Startup")
2. **Description**: Detailed requirements, deliverables, timeline
3. **Category**: Match to one of the platform categories
4. **Budget**: In EGP, realistic for Egyptian market
5. **Task Type**: DIGITAL (remote) or PHYSICAL (on-site)
6. **Location**: City/area if physical task
7. **Deadline**: Specific date if time-sensitive

# INTELLIGENT BEHAVIORS
✓ Understand context from conversation history
✓ Provide specific, actionable advice
✓ Adapt tone to user type (professional for business, friendly for casual)
✓ Offer proactive suggestions (e.g., "Would you like me to help you create a task?")
✓ Reference Egyptian context (locations, currency EGP, market rates)
✓ Remember previous messages in the conversation
✓ Suggest relevant platform features based on user needs

# RESPONSE STYLE
- Be conversational but professional
- Keep responses focused (2-4 sentences for simple questions)
- Provide detailed help when requested
- Use bullet points for lists
- Ask clarifying questions when needed
- Never make up information - admit when you don't know
- Be encouraging and supportive

# COMMON SCENARIOS
- User confused about platform → Explain relevant features
- User wants to find work → Direct to "For You" or "Browse Tasks"
- User needs help with application → Guide on writing compelling proposals
- User creating task → Guide through all required fields
- User asking about pricing → Explain Egyptian market context
- User needs navigation help → Provide clear direction with exact page names

Remember: Your goal is to make users successful on the platform. Be helpful, accurate, and genuinely useful.
"""
    
    def get_response(
        self,
        user_message: str,
        conversation_history: Optional[List[Dict]] = None,
        context: Optional[Dict] = None
    ) -> str:
        """
        Get chatbot response (HYBRID: AI-powered or intelligent fallback)
        """
        # If API not available, use fallback response
        if not self.api_available or not self.model:
            logger.info("Using fallback mode (API unavailable)")
            return self._get_fallback_response(user_message, context)

        try:
            # Build full prompt
            full_prompt = self._build_prompt(
                user_message,
                conversation_history,
                context
            )

            # Generate response using Gemini AI
            logger.info("Using Gemini AI mode")
            response = self.model.generate_content(full_prompt)

            return response.text.strip()

        except Exception as e:
            logger.error(f"Gemini API error, falling back to pattern matching: {str(e)}")
            return self._get_fallback_response(user_message, context)

    def _get_fallback_response(self, user_message: str, context: Optional[Dict] = None) -> str:
        """
        Provide intelligent fallback responses when API is unavailable
        """
        text = user_message.lower()

        # Greetings
        if any(x in text for x in ["hello", "hi", "hey", "greetings"]):
            return "Hello! I'm your Multitask assistant. I can help you find tasks, navigate the platform, or answer questions. What can I help you with?"

        # Navigation requests
        if "profile" in text:
            return "I can help you navigate to your profile page. Go to your user menu and click on 'Profile'."

        if any(x in text for x in ["dashboard", "home"]):
            return "To access your dashboard, click on the 'Home' or 'Dashboard' link in the navigation menu."

        if any(x in text for x in ["task", "find", "browse", "search"]):
            return "You can browse available tasks by clicking on 'Browse Tasks' in the main navigation. Or check 'For You' for personalized AI recommendations based on your skills!"

        if "message" in text or "inbox" in text:
            return "To check your messages, click on the Messages icon in the navigation bar. You'll see all your conversations there."

        # Task creation
        if any(x in text for x in ["create task", "post task", "new task"]):
            return "To create a new task, click on the '+ Create Task' button. I'll help guide you through filling out all the required information like title, description, budget, and category."

        # Help/Features
        if "help" in text or "what can you do" in text or "features" in text:
            return """I can help you with:
• Finding tasks that match your skills
• Navigating anywhere on the platform
• Creating compelling task posts
• Answering questions about Multitask
• Providing guidance on using features

Just ask me naturally! For example: "Show me tasks" or "Go to my profile" """

        # Default response
        return "I'm here to help! I can assist you with finding tasks, navigating the platform, creating task posts, and answering questions about Multitask. What would you like to do?"
    
    def _build_prompt(
        self,
        user_message: str,
        conversation_history: Optional[List[Dict]] = None,
        context: Optional[Dict] = None
    ) -> str:
        """
        Build complete prompt with context
        """
        prompt_parts = [self.system_prompt, "\n\n"]
        
        # Add context if provided
        if context:
            prompt_parts.append("Current context:\n")
            if context.get('user_type'):
                prompt_parts.append(f"- User type: {context['user_type']}\n")
            if context.get('current_page'):
                prompt_parts.append(f"- Current page: {context['current_page']}\n")
            prompt_parts.append("\n")
        
        # Add conversation history (last 5 messages)
        if conversation_history:
            prompt_parts.append("Conversation history:\n")
            for msg in conversation_history[-5:]:
                role = "User" if msg.get('sender') == 'USER' else "Assistant"
                prompt_parts.append(f"{role}: {msg.get('message')}\n")
            prompt_parts.append("\n")
        
        # Add current message
        prompt_parts.append(f"User: {user_message}\n")
        prompt_parts.append("Assistant:")
        
        return ''.join(prompt_parts)

    # --- New: Hybrid Intent Router (Step 1.2) ---
    def route_intent(self, user_message: str) -> str:
        """
        Single source of truth for intent routing.
        AI may assist later, but backend decides final intent.
        """
        text = user_message.lower()

        if any(x in text for x in ["recommend", "for you", "matched", "find tasks", "suggest tasks"]):
            return INTENT_RECOMMEND_TASKS

        if any(x in text for x in ["create task", "post task", "add task", "new task"]):
            return INTENT_CREATE_TASK

        if any(x in text for x in ["go to", "open", "navigate", "take me to"]):
            return INTENT_NAVIGATION

        if any(x in text for x in ["help", "how", "what can you do"]):
            return INTENT_HELP

        return INTENT_GENERAL_CHAT

    # --- New: Hybrid Command Dispatcher (Step 1.3) ---
    def handle_intent(self, *, intent: str, user, session, user_message: str) -> Tuple[str, Optional[Dict]]:
        """
        Execute backend logic based on resolved intent.
        Returns: (reply_text, action_dict | None)
        """

        if session.session_type == "CREATE_TASK":
            context = session.context_data or {}
            pending_fields = context.get("pending_fields", [])
            data = context.get("data", {})

            if not pending_fields:
                return "Task creation is already completed.", None

            current_field = pending_fields[0]

            is_valid, result = self.validate_task_field(current_field, user_message)

            if not is_valid:
                return result, None

            # Save validated value
            data[current_field] = result
            pending_fields.pop(0)

            session.context_data = {
                "flow": "CREATE_TASK",
                "data": data,
                "pending_fields": pending_fields
            }
            session.save(update_fields=["context_data"])

            # If more fields remain → ask next question
            if pending_fields:
                next_field = pending_fields[0]
                return TASK_FIELD_PROMPTS[next_field], None

            # All fields collected → finalize
            return self.finalize_task_creation(user, session), {
                "type": "NAVIGATE",
                "path": "/my-tasks",
                "label": "View Your Tasks"
            }

        # --- RECOMMEND TASKS ---
        if intent == INTENT_RECOMMEND_TASKS:
            from recommendations.services import get_recommendation_service

            service = get_recommendation_service()

            # HARD GUARD — REQUIRED
            if not hasattr(user, "user_type") or user.user_type not in ["freelancer", "both"]:
                return (
                    "Task recommendations are available for freelancers. "
                    "You can create a task or browse freelancers instead.",
                    None
                )

            tasks = service.recommend_tasks_for_freelancer(user, limit=5)


            if not tasks:
                return (
                    "I couldn't find suitable tasks right now. Try updating your skills or profile.",
                    None
                )

            return (
                "I found tasks that match your skills and preferences.",
                {
                    "type": "NAVIGATE",
                    "path": "/recommendations",
                    "label": "View Recommended Tasks"
                }
            )

        # --- CREATE TASK (Conversation starts here) ---
        if intent == INTENT_CREATE_TASK:
            session.session_type = "CREATE_TASK"
            session.context_data = {
                "flow": "CREATE_TASK",
                "data": {},
                "pending_fields": ["title", "description", "category", "budget", "location"]
            }
            session.save(update_fields=["session_type", "context_data"])

            return (
                "Sure. Let's create your task step by step.\n\nWhat is the task title?",
                None
            )

        # --- NAVIGATION ---
        if intent == INTENT_NAVIGATION:
            return (
                "Where would you like to go?",
                None
            )

        # --- HELP ---
        if intent == INTENT_HELP:
            return (
                "I can help you find tasks, create task posts, navigate the platform, and give personalized recommendations.",
                None
            )

        # --- FALLBACK: General Chat (AI-generated) ---
        reply = self.get_response(user_message, context={"user_type": user.user_type if hasattr(user, 'user_type') else None})
        return reply, None
    
    def extract_task_info(self, conversation: str) -> Optional[Dict]:
        """
        Extract task information from conversation
        """
        try:
            prompt = f"""
Extract task information from this conversation and return ONLY valid JSON:

{conversation}

Return JSON with these fields (use null for missing info):
{{
    "title": "task title",
    "description": "task description",
    "category": "category name",
    "budget": "estimated budget number only",
    "location": "location if mentioned"
}}

Return ONLY the JSON, no other text.
"""
            
            response = self.model.generate_content(prompt)
            
            # Parse JSON
            try:
                task_data = json.loads(response.text)
                return task_data
            except json.JSONDecodeError:
                logger.error(f"Failed to parse JSON from response: {response.text}")
                return None
                
        except Exception as e:
            logger.error(f"Task extraction error: {str(e)}")
            return None
    
    def suggest_category(self, task_description: str) -> str:
        """
        Suggest task category based on description
        """
        try:
            categories = [
                "Cleaning & Home Services",
                "Tutoring & Education",
                "Design & Creative",
                "Programming & Tech",
                "Writing & Translation",
                "Marketing & Business",
                "Personal Assistant",
                "Other Services"
            ]
            
            prompt = f"""
Based on this task description, suggest ONE category from this list:
{', '.join(categories)}

Task: {task_description}

Return ONLY the category name, nothing else.
"""
            
            response = self.model.generate_content(prompt)
            category = response.text.strip()
            
            # Validate category
            if category in categories:
                return category
            
            return "Other Services"
            
        except Exception as e:
            logger.error(f"Category suggestion error: {str(e)}")
            return "Other Services"
    
    def analyze_intent(self, message: str) -> str:
        """
        Detect user intent (legacy — kept for compatibility)
        """
        message_lower = message.lower()
        
        if any(word in message_lower for word in ['create', 'post', 'add', 'new task']):
            return 'create_task'
        elif any(word in message_lower for word in ['find', 'search', 'look for', 'browse']):
            return 'search_task'
        elif any(word in message_lower for word in ['apply', 'interested', 'want to work']):
            return 'apply_task'
        elif any(word in message_lower for word in ['how', 'what', 'help', 'guide']):
            return 'help'
        else:
            return 'general'
        
    def validate_task_field(self, field: str, value: str):
        if field == "title":
            if len(value) < 5:
                return False, "Title must be at least 5 characters."
            return True, value.strip()

        if field == "description":
            if len(value) < 20:
                return False, "Description must be more detailed (at least 20 characters)."
            return True, value.strip()

        if field == "category":
            return True, value.strip()

        if field == "budget":
            try:
                budget = float(value)
                if budget <= 0:
                    raise ValueError
                return True, budget
            except ValueError:
                return False, "Budget must be a valid number in EGP."

        if field == "location":
            return True, value.strip()

        return False, "Invalid field."
    
    def finalize_task_creation(self, user, session):
        from tasks.models import Task

        data = session.context_data.get("data", {})

        task = Task.objects.create(
            client=user,
            title=data["title"],
            description=data["description"],
            category=data["category"],
            budget=data["budget"],
            location=data["location"],
            status="OPEN"
        )

        # Reset session
        session.session_type = "GENERAL"
        session.context_data = {}
        session.save(update_fields=["session_type", "context_data"])

        return (
            f"Your task **{task.title}** has been created successfully. "
            "Freelancers can now see and apply to it."
        )
    
    def validate_action(self, action: dict) -> dict | None:
        """
        Ensure action is backend-approved and well-formed.
        """
        if not action or "type" not in action:
            return None

        action_type = action.get("type")

        if action_type not in ALLOWED_ACTIONS:
            return None

        schema = ALLOWED_ACTIONS[action_type]
        required = schema["required_fields"]

        for field in required:
            if field not in action:
                return None

        return action

    def get_status(self) -> Dict:
        """
        Get chatbot system status (for health checks)
        """
        return {
            'status': 'operational',
            'mode': 'ai' if self.api_available else 'fallback',
            'api_available': self.api_available,
            'model': settings.GEMINI_MODEL if self.api_available else None,
            'capabilities': {
                'general_chat': True,
                'task_recommendations': True,
                'task_creation': True,
                'navigation_help': True,
                'intent_routing': True,
            },
            'fallback_enabled': True
        }





# Singleton instance
_chatbot_service = None

def get_chatbot_service():
    """Get or create chatbot service singleton"""
    global _chatbot_service
    if _chatbot_service is None:
        _chatbot_service = ChatbotService()
    return _chatbot_service