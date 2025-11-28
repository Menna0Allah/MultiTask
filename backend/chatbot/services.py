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
        
        # System prompt
        self.system_prompt = """
You are a helpful AI assistant for Multitask, a freelance marketplace platform that connects clients with freelancers.

Your role:
- Help users navigate the platform
- Assist in creating task posts
- Help find suitable tasks or freelancers
- Answer questions about how the platform works
- Provide guidance on best practices

Platform features:
- Clients can post tasks (cleaning, programming, design, tutoring, etc.)
- Freelancers can browse and apply to tasks
- Real-time messaging between users
- AI-powered recommendations
- Review and rating system

When helping with task creation, gather:
1. Task title
2. Description
3. Category
4. Budget
5. Location (if physical task)
6. Deadline

Be friendly, concise, and helpful. Keep responses under 3 sentences unless detailed help is requested.
Do not make up information - if you don't know something, say so.
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