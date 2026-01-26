"""
Sanitization utilities for backend user inputs
Prevents XSS, SQL injection, and other security vulnerabilities
"""
import bleach
import re
from django.utils.html import escape


def sanitize_html(text, allowed_tags=None, allowed_attrs=None):
    """
    Sanitize HTML content while allowing specific tags

    Args:
        text: HTML string to sanitize
        allowed_tags: List of allowed HTML tags
        allowed_attrs: Dict of allowed attributes per tag

    Returns:
        Sanitized HTML string
    """
    if not text:
        return ''

    if allowed_tags is None:
        allowed_tags = ['b', 'i', 'em', 'strong', 'a', 'p', 'br', 'ul', 'ol', 'li']

    if allowed_attrs is None:
        allowed_attrs = {
            'a': ['href', 'title', 'rel'],
        }

    # Use bleach to sanitize
    cleaned = bleach.clean(
        text,
        tags=allowed_tags,
        attributes=allowed_attrs,
        strip=True
    )

    # Linkify URLs
    cleaned = bleach.linkify(cleaned)

    return cleaned


def sanitize_text(text):
    """
    Sanitize plain text (strips all HTML)
    Use for usernames, titles, simple text fields

    Args:
        text: String to sanitize

    Returns:
        Plain text without HTML
    """
    if not text:
        return ''

    # Strip all HTML tags
    cleaned = bleach.clean(text, tags=[], strip=True)

    # Escape any remaining special chars
    cleaned = escape(cleaned)

    return cleaned.strip()


def sanitize_bio(text, max_length=500):
    """
    Sanitize user bio/description with limited formatting

    Args:
        text: Bio text
        max_length: Maximum length

    Returns:
        Sanitized bio
    """
    if not text:
        return ''

    # Allow minimal formatting
    allowed_tags = ['b', 'i', 'em', 'strong', 'br', 'p']
    allowed_attrs = {}

    cleaned = bleach.clean(
        text,
        tags=allowed_tags,
        attributes=allowed_attrs,
        strip=True
    )

    return cleaned[:max_length]


def sanitize_task_description(text):
    """
    Sanitize task description allowing more formatting

    Args:
        text: Task description

    Returns:
        Sanitized description
    """
    if not text:
        return ''

    allowed_tags = [
        'b', 'i', 'em', 'strong', 'a', 'p', 'br',
        'ul', 'ol', 'li', 'h3', 'h4', 'h5', 'h6', 'blockquote'
    ]

    allowed_attrs = {
        'a': ['href', 'title'],
    }

    return sanitize_html(text, allowed_tags, allowed_attrs)


def sanitize_search_query(query):
    """
    Sanitize search query to prevent injection

    Args:
        query: Search query string

    Returns:
        Safe search query
    """
    if not query:
        return ''

    # Remove HTML
    cleaned = sanitize_text(query)

    # Remove SQL/NoSQL injection patterns
    dangerous_patterns = [
        r'(\bOR\b|\bAND\b|\bUNION\b|\bSELECT\b|\bDROP\b|\bINSERT\b|\bUPDATE\b|\bDELETE\b)',
        r'[;\'"\\]',  # Remove quotes and semicolons
        r'--',  # SQL comments
        r'/\*.*\*/',  # Block comments
    ]

    for pattern in dangerous_patterns:
        cleaned = re.sub(pattern, '', cleaned, flags=re.IGNORECASE)

    return cleaned.strip()[:200]  # Limit length


def sanitize_username(username):
    """
    Sanitize username

    Args:
        username: Username string

    Returns:
        Safe username
    """
    if not username:
        return ''

    # Remove HTML
    cleaned = bleach.clean(username, tags=[], strip=True)

    # Only allow alphanumeric, underscore, hyphen
    cleaned = re.sub(r'[^a-zA-Z0-9_-]', '', cleaned)

    return cleaned[:30]


def sanitize_email(email):
    """
    Validate and sanitize email address

    Args:
        email: Email string

    Returns:
        Sanitized email or None if invalid
    """
    if not email:
        return None

    # Remove HTML and whitespace
    cleaned = bleach.clean(email, tags=[], strip=True).lower().strip()

    # Basic email validation
    email_pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'

    if re.match(email_pattern, cleaned):
        return cleaned

    return None


def sanitize_url(url):
    """
    Sanitize URL to prevent XSS

    Args:
        url: URL string

    Returns:
        Safe URL or empty string
    """
    if not url:
        return ''

    # Remove HTML
    cleaned = bleach.clean(url, tags=[], strip=True).strip()

    # Check protocol
    if not cleaned.startswith(('http://', 'https://')):
        return ''

    # Prevent javascript: and data: URIs
    if re.match(r'^(javascript|data|vbscript):', cleaned, re.IGNORECASE):
        return ''

    return cleaned


def sanitize_filename(filename):
    """
    Sanitize file name

    Args:
        filename: File name string

    Returns:
        Safe filename
    """
    if not filename:
        return ''

    # Remove path traversal attempts
    cleaned = filename.replace('..', '').replace('/', '').replace('\\', '')

    # Only allow safe characters
    cleaned = re.sub(r'[^a-zA-Z0-9._-]', '_', cleaned)

    return cleaned[:255]


def sanitize_phone(phone):
    """
    Sanitize phone number

    Args:
        phone: Phone number string

    Returns:
        Sanitized phone number
    """
    if not phone:
        return ''

    # Remove all non-digit characters except +
    cleaned = re.sub(r'[^\d+]', '', phone)

    return cleaned[:20]


def validate_and_sanitize(value, field_type='text', **kwargs):
    """
    Generic validation and sanitization based on field type

    Args:
        value: Value to sanitize
        field_type: Type of field (text, html, email, username, etc.)
        **kwargs: Additional options

    Returns:
        Sanitized value
    """
    sanitizers = {
        'text': sanitize_text,
        'html': sanitize_html,
        'bio': sanitize_bio,
        'description': sanitize_task_description,
        'search': sanitize_search_query,
        'username': sanitize_username,
        'email': sanitize_email,
        'url': sanitize_url,
        'filename': sanitize_filename,
        'phone': sanitize_phone,
    }

    sanitizer = sanitizers.get(field_type, sanitize_text)

    return sanitizer(value, **kwargs) if kwargs else sanitizer(value)
