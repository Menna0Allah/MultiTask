"""
AI Chatbot using Google Gemini API
"""

import google.generativeai as genai
from django.conf import settings
import json
import logging
from typing import List, Dict, Optional

logger = logging.getLogger('chatbot')


class ChatbotService:
    """
    AI-powered chatbot using Google Gemini
    """
    
    def __init__(self):
        """Initialize Gemini API"""
        genai.configure(api_key=settings.GEMINI_API_KEY)
        self.model = genai.GenerativeModel(settings.GEMINI_MODEL)
        
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
        Get chatbot response
        
        Args:
            user_message: User's message
            conversation_history: List of previous messages
            context: Additional context (user info, current page, etc.)
        
        Returns:
            Bot's response string
        """
        try:
            # Build full prompt
            full_prompt = self._build_prompt(
                user_message,
                conversation_history,
                context
            )
            
            # Generate response
            response = self.model.generate_content(full_prompt)
            
            return response.text.strip()
            
        except Exception as e:
            logger.error(f"Gemini API error: {str(e)}", exc_info=True)
            return "I apologize, but I'm having trouble connecting right now. Please try again in a moment, or contact support if the issue persists."
    
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
    
    def extract_task_info(self, conversation: str) -> Optional[Dict]:
        """
        Extract task information from conversation
        
        Args:
            conversation: Full conversation text
        
        Returns:
            Dictionary with extracted task info or None
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
        
        Args:
            task_description: Task description
        
        Returns:
            Category name
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
        Detect user intent
        
        Args:
            message: User message
        
        Returns:
            Intent string
        """
        message_lower = message.lower()
        
        # Simple keyword-based intent detection
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


# Singleton instance
_chatbot_service = None

def get_chatbot_service():
    """Get or create chatbot service singleton"""
    global _chatbot_service
    if _chatbot_service is None:
        _chatbot_service = ChatbotService()
    return _chatbot_service