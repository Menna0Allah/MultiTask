"""
Management command to seed comprehensive demo data for the freelance marketplace
Creates two test accounts with realistic Egyptian market data:
- Menna_Allah (Dual Role - Freelancer & Client)
- Lail_Eldein (Freelancer Only)
"""

from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from django.utils import timezone
from django.db import transaction
from datetime import timedelta, datetime
from decimal import Decimal
import random

from accounts.models import User
from tasks.models import Category, Task, TaskApplication, Review
from recommendations.models import Skill, UserSkill, UserPreference
from messaging.models import Conversation, Message
from notifications.models import Notification
from payments.models import Wallet, Transaction as PaymentTransaction, Escrow
from chatbot.models import ChatSession, ChatMessage

User = get_user_model()


class Command(BaseCommand):
    help = 'Seed comprehensive demo data for two test accounts'

    def __init__(self):
        super().__init__()
        self.menna = None
        self.lail = None
        self.categories = []
        self.skills = []

    def handle(self, *args, **options):
        self.stdout.write(self.style.SUCCESS('Starting seed data generation...'))

        with transaction.atomic():
            # Clear existing demo data
            self.stdout.write('Clearing existing demo data...')
            self.clear_demo_data()

            # Create categories and skills
            self.stdout.write('Creating categories and skills...')
            self.create_categories_and_skills()

            # Create user accounts
            self.stdout.write('Creating user accounts...')
            self.create_users()

            # Create user profiles and skills
            self.stdout.write('Setting up user profiles...')
            self.setup_user_profiles()

            # Create tasks
            self.stdout.write('Creating tasks...')
            self.create_tasks()

            # Create applications
            self.stdout.write('Creating task applications...')
            self.create_applications()

            # Create conversations and messages
            self.stdout.write('Creating conversations and messages...')
            self.create_conversations()

            # Create notifications
            self.stdout.write('Creating notifications...')
            self.create_notifications()

            # Create reviews
            self.stdout.write('Creating reviews...')
            self.create_reviews()

            # Create wallets and transactions
            self.stdout.write('Creating payment data...')
            self.create_payment_data()

            # Create preferences
            self.stdout.write('Setting up user preferences...')
            self.create_preferences()

        self.stdout.write(self.style.SUCCESS('[SUCCESS] Demo data generation completed!'))
        self.stdout.write(self.style.SUCCESS('\n=== Login Credentials ==='))
        self.stdout.write(f'Account 1: menna_allah / MultiTasks2024!')
        self.stdout.write(f'Account 2: lail_eldein / MultiTasks2024!')

    def clear_demo_data(self):
        """Clear existing demo accounts and related data"""
        User.objects.filter(username__in=['menna_allah', 'lail_eldein']).delete()

    def create_categories_and_skills(self):
        """Load existing categories and skills from database"""
        # Get all existing categories
        self.categories = list(Category.objects.all())

        # Get all existing skills
        self.skills = list(Skill.objects.filter(is_active=True))

        self.stdout.write(f'> Loaded {len(self.categories)} categories and {len(self.skills)} skills')

    def create_users(self):
        """Create the two demo user accounts"""
        # Account 1: Menna_Allah (Dual Role)
        self.menna = User.objects.create_user(
            username='menna_allah',
            email='menna.allah@multitasks-demo.com',
            password='MultiTasks2024!',
            first_name='منة الله',
            last_name='محمد',
            user_type='both',  # Both client and freelancer
            phone_number='+201012345678',
            city='Cairo',
            country='Egypt',
            bio='''مرحباً! أنا منة الله، مطورة ويب ومصممة UI/UX من القاهرة. لدي 5 سنوات من الخبرة في تطوير المواقع والتطبيقات باستخدام React و Django. أعمل أيضاً كمستشارة تقنية للشركات الناشئة.

Hello! I'm Menna Allah, a web developer and UI/UX designer from Cairo. I have 5 years of experience in developing websites and applications using React and Django. I also work as a technical consultant for startups.

أقدم خدمات شاملة تشمل التصميم، التطوير، والاستشارات التقنية. أؤمن بأهمية الجودة والالتزام بالمواعيد.

I provide comprehensive services including design, development, and technical consulting. I believe in quality and meeting deadlines.''',
        )
        # Set is_verified to True manually
        self.menna.is_verified = True
        self.menna.save()

        # Account 2: Lail_Eldein (Freelancer Only)
        self.lail = User.objects.create_user(
            username='lail_eldein',
            email='lail.eldein@multitasks-demo.com',
            password='MultiTasks2024!',
            first_name='ليل',
            last_name='الدين',
            user_type='freelancer',  # Freelancer only
            phone_number='+201098765432',
            city='Alexandria',
            country='Egypt',
            bio='''مرحباً! أنا ليل الدين، مسوقة رقمية وكاتبة محتوى من الإسكندرية. متخصصة في التسويق عبر مواصل التواصل الاجتماعي وكتابة المحتوى الإبداعي باللغتين العربية والإنجليزية.

Hi! I'm Lail Eldein, a digital marketer and content writer from Alexandria. Specialized in social media marketing and creative content writing in both Arabic and English.

أساعد الشركات على بناء حضورها الرقمي وزيادة تفاعل الجمهور من خلال استراتيجيات تسويقية مبتكرة ومحتوى جذاب. لدي خبرة 4 سنوات في العمل مع شركات محلية وعالمية.

I help companies build their digital presence and increase audience engagement through innovative marketing strategies and engaging content. I have 4 years of experience working with local and international companies.''',
        )
        # Set is_verified to True manually
        self.lail.is_verified = True
        self.lail.save()

        self.stdout.write(f'> Created users: {self.menna.username}, {self.lail.username}')

    def setup_user_profiles(self):
        """Set up skills and preferences for both users"""
        # Menna's skills (using existing skills from database)
        menna_skill_slugs = [
            'react', 'django', 'javascript', 'python', 'html-css',
            'ui-ux-design', 'figma', 'nodejs', 'wordpress'
        ]

        for skill_slug in menna_skill_slugs:
            try:
                skill = Skill.objects.get(slug=skill_slug)
                level = random.choice(['intermediate', 'advanced', 'expert'])
                UserSkill.objects.create(
                    user=self.menna,
                    skill=skill,
                    proficiency=level,
                    years_experience=random.randint(2, 5),
                    is_primary=(skill_slug in ['react', 'django'])
                )
            except Skill.DoesNotExist:
                self.stdout.write(self.style.WARNING(f'Skill not found: {skill_slug}'))

        # Lail's skills (using existing skills from database)
        lail_skill_slugs = [
            'social-media-marketing', 'google-ads', 'seo',
            'article-writing', 'copywriting', 'content-strategy'
        ]

        for skill_slug in lail_skill_slugs:
            try:
                skill = Skill.objects.get(slug=skill_slug)
                level = random.choice(['intermediate', 'advanced', 'expert'])
                UserSkill.objects.create(
                    user=self.lail,
                    skill=skill,
                    proficiency=level,
                    years_experience=random.randint(2, 4),
                    is_primary=(skill_slug in ['social-media-marketing', 'article-writing'])
                )
            except Skill.DoesNotExist:
                self.stdout.write(self.style.WARNING(f'Skill not found: {skill_slug}'))

        self.stdout.write('> Set up user skills')

    def create_tasks(self):
        """Create tasks posted by Menna (as client)"""
        tasks_data = [
            {
                'title': 'إدارة حسابات التواصل الاجتماعي لشركة ناشئة',
                'description': '''مطلوب مسوق رقمي محترف لإدارة حسابات التواصل الاجتماعي (فيسبوك، إنستجرام، لينكدإن) لشركة ناشئة في مجال التكنولوجيا.

المهام المطلوبة:
- إنشاء خطة محتوى شهرية
- تصميم المنشورات والقصص
- الرد على التعليقات والرسائل
- إدارة الحملات الإعلانية
- تقديم تقارير أسبوعية عن الأداء

المدة: 3 أشهر (قابلة للتجديد)
الميزانية: 3000-4000 جنيه شهرياً''',
                'category': 'marketing-seo',
                'budget': Decimal('3500.00'),
                'deadline_days': 90,
                'status': 'COMPLETED',
                'task_type': 'DIGITAL',
                'required_skills': ['social-media-marketing', 'google-ads'],
            },
            {
                'title': 'كتابة محتوى لموقع إلكتروني (عربي وإنجليزي)',
                'description': '''نحتاج كاتب محتوى محترف لكتابة محتوى موقع شركة استشارات إدارية.

المطلوب:
- كتابة صفحة من نحن (عربي وإنجليزي)
- كتابة وصف 5 خدمات
- كتابة 10 مقالات مدونة (SEO optimized)
- مراجعة وتحرير المحتوى الحالي

الميزانية: 2500 جنيه
المدة: أسبوعين''',
                'category': 'writing-translation',
                'budget': Decimal('2500.00'),
                'deadline_days': 14,
                'status': 'COMPLETED',
                'task_type': 'DIGITAL',
                'required_skills': ['article-writing', 'copywriting'],
            },
            {
                'title': 'حملة إعلانية على فيسبوك وإنستجرام',
                'description': '''مطلوب مسوق رقمي لإدارة حملة إعلانية لإطلاق منتج جديد.

التفاصيل:
- تحديد الجمهور المستهدف
- إنشاء وإدارة الحملات الإعلانية
- A/B testing للإعلانات
- تحسين الأداء بناءً على البيانات
- تقديم تقرير نهائي مفصل

الميزانية: 2000 جنيه (بالإضافة لميزانية الإعلانات)
المدة: شهر واحد''',
                'category': 'marketing-seo',
                'budget': Decimal('2000.00'),
                'deadline_days': 30,
                'status': 'IN_PROGRESS',
                'task_type': 'DIGITAL',
                'required_skills': ['google-ads', 'social-media-marketing'],
            },
            {
                'title': 'ترجمة محتوى موقع من الإنجليزية للعربية',
                'description': '''نحتاج مترجم محترف لترجمة موقع إلكتروني من الإنجليزية للعربية.

التفاصيل:
- حوالي 50 صفحة
- ترجمة احترافية مع مراعاة السياق
- مراجعة لغوية دقيقة
- تسليم بصيغة Word و Excel

الميزانية: 1800 جنيه
المدة: 10 أيام''',
                'category': 'writing-translation',
                'budget': Decimal('1800.00'),
                'deadline_days': 10,
                'status': 'OPEN',
                'task_type': 'DIGITAL',
                'required_skills': ['article-writing'],
            },
            {
                'title': 'إنشاء استراتيجية تسويق رقمي شاملة',
                'description': '''مطلوب مستشار تسويق رقمي لإنشاء استراتيجية تسويقية شاملة لشركة تجارة إلكترونية.

المطلوب:
- تحليل السوق والمنافسين
- تحديد الجمهور المستهدف والشخصيات
- وضع خطة تسويقية للـ 6 أشهر القادمة
- اقتراح القنوات والأدوات المناسبة
- وضع KPIs وأهداف قابلة للقياس

الميزانية: 4000 جنيه
المدة: أسبوعين''',
                'category': 'marketing-seo',
                'budget': Decimal('4000.00'),
                'deadline_days': 14,
                'status': 'OPEN',
                'task_type': 'DIGITAL',
                'required_skills': ['social-media-marketing', 'seo', 'google-ads'],
            },
            {
                'title': 'كتابة 20 مقال SEO لمدونة',
                'description': '''نحتاج كاتب محتوى متخصص في SEO لكتابة 20 مقال لمدونة في مجال التقنية.

التفاصيل:
- 20 مقال، كل مقال 800-1000 كلمة
- محتوى محسّن لمحركات البحث
- بحث عن الكلمات المفتاحية
- كتابة عناوين جذابة ومقدمات قوية
- تسليم بصيغة Word

الميزانية: 3000 جنيه
المدة: شهر واحد''',
                'category': 'writing-translation',
                'budget': Decimal('3000.00'),
                'deadline_days': 30,
                'status': 'OPEN',
                'task_type': 'DIGITAL',
                'required_skills': ['article-writing', 'copywriting'],
            },
        ]

        for task_data in tasks_data:
            category = Category.objects.get(slug=task_data['category'])
            deadline = timezone.now() + timedelta(days=task_data['deadline_days'])
            if task_data['status'] in ['COMPLETED', 'IN_PROGRESS']:
                deadline = timezone.now() - timedelta(days=random.randint(10, 60))

            task = Task.objects.create(
                client=self.menna,
                category=category,
                title=task_data['title'],
                description=task_data['description'],
                budget=task_data['budget'],
                is_negotiable=True,
                deadline=deadline,
                status=task_data['status'],
                task_type=task_data['task_type'],
                listing_type='task_request',
                city='Cairo',
                is_remote=True,
                views_count=random.randint(15, 150),
                applications_count=random.randint(2, 8) if task_data['status'] != 'OPEN' else 0,
                requires_payment=True,
                payment_status='released' if task_data['status'] == 'COMPLETED' else 'not_required',
                final_amount=task_data['budget'] if task_data['status'] == 'COMPLETED' else None,
            )

            # Add required skills (only if they exist)
            for skill_slug in task_data['required_skills']:
                try:
                    skill = Skill.objects.get(slug=skill_slug)
                    task.required_skills.add(skill)
                except Skill.DoesNotExist:
                    # Skill doesn't exist, skip it
                    continue

            # Set assigned_to and completed_at for completed tasks
            if task_data['status'] == 'COMPLETED':
                task.assigned_to = self.lail
                task.completed_at = timezone.now() - timedelta(days=random.randint(1, 30))
                task.save()
            elif task_data['status'] == 'IN_PROGRESS':
                task.assigned_to = self.lail
                task.save()

        self.stdout.write(f'> Created {len(tasks_data)} tasks')

    def create_applications(self):
        """Create task applications from Lail to Menna's tasks"""
        tasks = Task.objects.filter(client=self.menna)

        for task in tasks:
            if task.status in ['COMPLETED', 'IN_PROGRESS', 'OPEN']:
                # Calculate offered price (slightly lower than budget)
                offered_price = task.budget * Decimal('0.95')

                proposal_templates = [
                    f'''مرحباً منة الله،

قرأت تفاصيل المشروع بعناية وأنا مهتمة جداً بالعمل عليه. لدي خبرة واسعة في {task.category.name} وأثق بقدرتي على تحقيق النتائج المطلوبة.

لقد عملت على مشاريع مشابهة وحققت نتائج ممتازة. يمكنني البدء فوراً والالتزام بالمواعيد المحددة.

أتطلع للعمل معك!
ليل الدين''',
                    f'''السلام عليكم،

شكراً لنشر هذا المشروع. أنا متخصصة في {task.category.name} ولدي سجل حافل من المشاريع الناجحة.

أستطيع تقديم:
- جودة عالية
- التزام بالمواعيد
- تواصل مستمر
- مراجعات مجانية

سأكون سعيدة بمناقشة التفاصيل معك.
تحياتي، ليل''',
                ]

                application = TaskApplication.objects.create(
                    task=task,
                    freelancer=self.lail,
                    proposal=random.choice(proposal_templates),
                    offered_price=offered_price,
                    estimated_time=f'{random.randint(3, 14)} days',
                    status='ACCEPTED' if task.status in ['COMPLETED', 'IN_PROGRESS'] else 'PENDING',
                    created_at=task.created_at + timedelta(hours=random.randint(2, 48))
                )

        self.stdout.write('> Created task applications')

    def create_conversations(self):
        """Create conversations and messages between Menna and Lail"""
        # Create main conversation
        conversation = Conversation.objects.create()
        conversation.participants.add(self.menna, self.lail)

        # Message templates
        messages_data = [
            {'sender': self.lail, 'text': 'مرحباً منة الله! شكراً لقبول عرضي. متى يمكننا البدء في مناقشة تفاصيل المشروع؟', 'hours_ago': 168},
            {'sender': self.menna, 'text': 'أهلاً ليل! سعيدة بالعمل معك. يمكننا البدء الآن. هل لديك أي أسئلة عن المشروع؟', 'hours_ago': 167},
            {'sender': self.lail, 'text': 'نعم، لدي بعض الأسئلة. بالنسبة لحسابات التواصل الاجتماعي، ما هو الجمهور المستهدف بالضبط؟', 'hours_ago': 166},
            {'sender': self.menna, 'text': 'الجمهور المستهدف هو الشباب من 20-35 سنة، مهتمين بالتكنولوجيا والابتكار. معظمهم من مصر والخليج.', 'hours_ago': 165},
            {'sender': self.lail, 'text': 'ممتاز! وما هي أهدافكم الرئيسية؟ زيادة المتابعين؟ التفاعل؟ المبيعات؟', 'hours_ago': 164},
            {'sender': self.menna, 'text': 'الهدف الأساسي هو زيادة الوعي بالعلامة التجارية وبناء مجتمع متفاعل. المبيعات ستأتي لاحقاً.', 'hours_ago': 163},
            {'sender': self.lail, 'text': 'فهمت. سأبدأ بإعداد خطة المحتوى للشهر الأول وأرسلها لك خلال 3 أيام للمراجعة.', 'hours_ago': 162},
            {'sender': self.menna, 'text': 'رائع! في انتظار الخطة. إذا احتجت أي معلومات إضافية، لا تترددي في السؤال.', 'hours_ago': 161},
            {'sender': self.lail, 'text': 'شكراً منة الله! سأرسل لك الخطة قريباً 😊', 'hours_ago': 160},
            {'sender': self.lail, 'text': 'مرحباً! أرسلت لك خطة المحتوى على الإيميل. أتمنى أن تنال إعجابك!', 'hours_ago': 88},
            {'sender': self.menna, 'text': 'شكراً ليل! راجعت الخطة وهي ممتازة. لدي بعض التعديلات البسيطة سأرسلها لك.', 'hours_ago': 84},
            {'sender': self.lail, 'text': 'تمام! سأنتظر التعديلات وأقوم بتحديث الخطة.', 'hours_ago': 83},
            {'sender': self.menna, 'text': 'أرسلت لك التعديلات. معظمها تعديلات على التوقيت فقط.', 'hours_ago': 72},
            {'sender': self.lail, 'text': 'تم التحديث! الخطة جاهزة الآن. هل نبدأ التنفيذ؟', 'hours_ago': 48},
            {'sender': self.menna, 'text': 'نعم، ابدأي! متحمسة لرؤية النتائج 🎉', 'hours_ago': 47},
        ]

        for msg_data in messages_data:
            Message.objects.create(
                conversation=conversation,
                sender=msg_data['sender'],
                content=msg_data['text'],
                created_at=timezone.now() - timedelta(hours=msg_data['hours_ago'])
            )

        # Create more conversation threads with different contexts
        conversation2 = Conversation.objects.create()
        conversation2.participants.add(self.menna, self.lail)

        project_discussions = [
            {'sender': self.menna, 'text': 'ليل، ممكن تحدثيني عن خبرتك في حملات Google Ads؟', 'hours_ago': 240},
            {'sender': self.lail, 'text': 'طبعاً! لدي خبرة 3 سنوات في إدارة حملات Google Ads. عملت على حملات بميزانيات متنوعة من 5000 لـ 50000 جنيه شهرياً.', 'hours_ago': 238},
            {'sender': self.menna, 'text': 'ممتاز! هل يمكنك إرسال أمثلة لحملات سابقة؟', 'hours_ago': 236},
            {'sender': self.lail, 'text': 'بالتأكيد! سأرسل لك portfolio كامل مع case studies لـ 3 مشاريع ناجحة.', 'hours_ago': 235},
            {'sender': self.menna, 'text': 'رائع! شكراً ليل 🙏', 'hours_ago': 234},
        ]

        for msg_data in project_discussions:
            Message.objects.create(
                conversation=conversation2,
                sender=msg_data['sender'],
                content=msg_data['text'],
                created_at=timezone.now() - timedelta(hours=msg_data['hours_ago'])
            )

        self.stdout.write('> Created conversations and messages')

    def create_notifications(self):
        """Create notifications for both users"""
        # Notifications for Menna
        menna_notifications = [
            {'type': 'task_application', 'title': 'طلب جديد على مشروعك', 'message': 'تقدمت ليل الدين بعرض على مشروع "إدارة حسابات التواصل الاجتماعي"', 'hours_ago': 168},
            {'type': 'message_received', 'title': 'رسالة جديدة', 'message': 'رسالة جديدة من ليل الدين', 'hours_ago': 167},
            {'type': 'task_completed', 'title': 'مشروع مكتمل', 'message': 'أكملت ليل الدين مشروع "إدارة حسابات التواصل الاجتماعي"', 'hours_ago': 72},
            {'type': 'review_received', 'title': 'تقييم جديد', 'message': 'قيّمتك ليل الدين بـ 5 نجوم', 'hours_ago': 48},
            {'type': 'payment_received', 'title': 'دفعة جديدة', 'message': 'تم استلام دفعة بقيمة 3500 جنيه من ليل الدين', 'hours_ago': 24},
        ]

        for notif_data in menna_notifications:
            notif = Notification.create_notification(
                recipient=self.menna,
                notification_type=notif_data['type'],
                title=notif_data['title'],
                message=notif_data['message'],
                link='/tasks'
            )
            # Set created_at manually
            notif.created_at = timezone.now() - timedelta(hours=notif_data['hours_ago'])
            notif.save(update_fields=['created_at'])

        # Notifications for Lail
        lail_notifications = [
            {'type': 'application_accepted', 'title': 'تم قبول عرضك', 'message': 'قبلت منة الله عرضك على مشروع "إدارة حسابات التواصل الاجتماعي"', 'hours_ago': 166},
            {'type': 'message_received', 'title': 'رسالة جديدة', 'message': 'رسالة جديدة من منة الله', 'hours_ago': 165},
            {'type': 'task_started', 'title': 'بدء المشروع', 'message': 'تم بدء العمل على مشروع "إدارة حسابات التواصل الاجتماعي"', 'hours_ago': 160},
            {'type': 'payment_received', 'title': 'دفعة مستلمة', 'message': 'استلمت دفعة بقيمة 3325 جنيه (بعد خصم عمولة المنصة)', 'hours_ago': 70},
            {'type': 'review_received', 'title': 'تقييم جديد', 'message': 'قيّمتك منة الله بـ 5 نجوم', 'hours_ago': 69},
        ]

        for notif_data in lail_notifications:
            notif = Notification.create_notification(
                recipient=self.lail,
                notification_type=notif_data['type'],
                title=notif_data['title'],
                message=notif_data['message'],
                link='/my-tasks'
            )
            # Set created_at manually
            notif.created_at = timezone.now() - timedelta(hours=notif_data['hours_ago'])
            notif.save(update_fields=['created_at'])

        # Add more varied notifications
        extra_notifications = [
            # For Menna
            {'user': self.menna, 'type': 'system', 'title': 'مرحباً بك!', 'message': 'نرحب بك في MultiTasks! أكمل ملفك الشخصي لزيادة فرص الحصول على مشاريع.', 'hours_ago': 720},
            {'user': self.menna, 'type': 'task_update', 'title': 'تحديث المشروع', 'message': 'ليل الدين أرسلت تقرير الأسبوع الأول', 'hours_ago': 144},
            {'user': self.menna, 'type': 'message_received', 'title': 'رسالة جديدة', 'message': 'رسالة جديدة من ليل الدين', 'hours_ago': 88},

            # For Lail
            {'user': self.lail, 'type': 'system', 'title': 'مرحباً بك!', 'message': 'نرحب بك في MultiTasks! ابدأ بالتقديم على المشاريع.', 'hours_ago': 720},
            {'user': self.lail, 'type': 'task_deadline', 'title': 'موعد تسليم قريب', 'message': 'موعد تسليم مشروع "كتابة محتوى لموقع إلكتروني" بعد 3 أيام', 'hours_ago': 120},
        ]

        for notif_data in extra_notifications:
            notif = Notification.create_notification(
                recipient=notif_data['user'],
                notification_type=notif_data['type'],
                title=notif_data['title'],
                message=notif_data['message'],
                link='/dashboard'
            )
            # Set created_at manually
            notif.created_at = timezone.now() - timedelta(hours=notif_data['hours_ago'])
            notif.save(update_fields=['created_at'])

        self.stdout.write(f'> Created {len(menna_notifications) + len(lail_notifications) + len(extra_notifications)} notifications')

    def create_reviews(self):
        """Create reviews between users"""
        completed_tasks = Task.objects.filter(status='COMPLETED', client=self.menna, assigned_to=self.lail)

        review_templates = [
            {
                'rating': 5,
                'comment': '''ليل محترفة جداً! أنجزت العمل بجودة عالية وفي الوقت المحدد. التواصل كان ممتاز والنتائج فاقت التوقعات. أنصح بالعمل معها بشدة! 🌟''',
                'communication': 5,
                'quality': 5,
                'professionalism': 5,
            },
            {
                'rating': 5,
                'comment': '''عمل رائع! ليل فهمت المطلوب من أول مرة ونفذته بإتقان. سعيدة جداً بالنتيجة وأتطلع للتعاون مرة أخرى.''',
                'communication': 5,
                'quality': 5,
                'professionalism': 5,
            },
            {
                'rating': 5,
                'comment': '''محترفة وملتزمة بالمواعيد. الجودة عالية جداً والتواصل سلس. شكراً ليل!''',
                'communication': 5,
                'quality': 5,
                'professionalism': 5,
            },
        ]

        for i, task in enumerate(completed_tasks[:3]):
            template = review_templates[i % len(review_templates)]

            # Menna reviews Lail (client to freelancer)
            Review.objects.create(
                task=task,
                reviewer=self.menna,
                reviewee=self.lail,
                rating=template['rating'],
                comment=template['comment'],
                communication_rating=template['communication'],
                quality_rating=template['quality'],
                professionalism_rating=template['professionalism'],
                is_public=True,
                is_verified=True,
                created_at=task.completed_at + timedelta(days=1)
            )

            # Lail reviews Menna (freelancer to client)
            lail_review_templates = [
                '''منة الله عميلة رائعة! واضحة في متطلباتها ومحترمة جداً. الدفع كان في الوقت المحدد. سعيدة بالعمل معها!''',
                '''تجربة ممتازة! منة الله محترفة ومتعاونة. شكراً على الثقة وأتمنى التعاون مرة أخرى.''',
                '''عميلة محترفة جداً. التواصل سهل والمتطلبات واضحة. شكراً منة الله!''',
            ]

            Review.objects.create(
                task=task,
                reviewer=self.lail,
                reviewee=self.menna,
                rating=5,
                comment=lail_review_templates[i % len(lail_review_templates)],
                communication_rating=5,
                quality_rating=5,
                professionalism_rating=5,
                is_public=True,
                is_verified=True,
                created_at=task.completed_at + timedelta(days=1, hours=3)
            )

        # Update user ratings
        self.update_user_ratings(self.menna)
        self.update_user_ratings(self.lail)

        self.stdout.write('> Created reviews')

    def update_user_ratings(self, user):
        """Update user's average rating"""
        reviews = Review.objects.filter(reviewee=user)
        if reviews.exists():
            avg_rating = sum(r.rating for r in reviews) / reviews.count()
            user.average_rating = Decimal(str(avg_rating))
            user.total_reviews = reviews.count()
            user.save(update_fields=['average_rating', 'total_reviews'])

    def create_payment_data(self):
        """Create wallets and transaction history"""
        # Create wallets
        menna_wallet, _ = Wallet.objects.get_or_create(
            user=self.menna,
            defaults={
                'available_balance': Decimal('5000.00'),
                'pending_balance': Decimal('0.00'),
                'escrowed_balance': Decimal('0.00'),
                'lifetime_earnings': Decimal('12500.00'),
                'lifetime_spent': Decimal('8000.00'),
                'currency': 'EGP',
            }
        )

        lail_wallet, _ = Wallet.objects.get_or_create(
            user=self.lail,
            defaults={
                'available_balance': Decimal('8500.00'),
                'pending_balance': Decimal('0.00'),
                'escrowed_balance': Decimal('0.00'),
                'lifetime_earnings': Decimal('18500.00'),
                'lifetime_spent': Decimal('0.00'),
                'currency': 'EGP',
            }
        )

        # Create transaction records for completed tasks
        completed_tasks = Task.objects.filter(status='COMPLETED', client=self.menna, assigned_to=self.lail)

        for task in completed_tasks:
            # Calculate amounts
            total_amount = task.budget
            platform_fee = (total_amount * Decimal('0.15')).quantize(Decimal('0.01'))
            freelancer_amount = total_amount - platform_fee

            # Create escrow deposit transaction
            PaymentTransaction.objects.create(
                transaction_id=f"TXN-{task.id}-DEPOSIT",
                sender=self.menna,
                recipient=None,
                task=task,
                transaction_type='escrow_deposit',
                status='succeeded',
                amount=total_amount,
                platform_fee=platform_fee,
                net_amount=freelancer_amount,
                currency='EGP',
                description=f'Escrow deposit for {task.title[:50]}',
                idempotency_key=f'escrow-task-{task.id}-deposit',
                processed_at=task.completed_at - timedelta(days=1),
                created_at=task.completed_at - timedelta(days=1),
            )

            # Create escrow release transaction
            PaymentTransaction.objects.create(
                transaction_id=f"TXN-{task.id}-RELEASE",
                sender=None,
                recipient=self.lail,
                task=task,
                transaction_type='escrow_release',
                status='succeeded',
                amount=freelancer_amount,
                platform_fee=Decimal('0.00'),
                net_amount=freelancer_amount,
                currency='EGP',
                description=f'Payment for {task.title[:50]}',
                idempotency_key=f'escrow-task-{task.id}-release',
                processed_at=task.completed_at + timedelta(hours=2),
                created_at=task.completed_at + timedelta(hours=2),
            )

        self.stdout.write('> Created payment data')

    def create_preferences(self):
        """Create user preferences"""
        # Menna's preferences
        menna_pref, _ = UserPreference.objects.get_or_create(user=self.menna)

        # Add preferred categories if the field exists
        if hasattr(menna_pref, 'preferred_categories') and menna_pref.preferred_categories is not None:
            try:
                web_dev = Category.objects.get(slug='web-development')
                design = Category.objects.get(slug='design-creative')
                menna_pref.preferred_categories.add(web_dev, design)
            except Category.DoesNotExist:
                pass

        # Lail's preferences
        lail_pref, _ = UserPreference.objects.get_or_create(user=self.lail)

        # Add preferred categories if the field exists
        if hasattr(lail_pref, 'preferred_categories') and lail_pref.preferred_categories is not None:
            try:
                marketing = Category.objects.get(slug='marketing-seo')
                writing = Category.objects.get(slug='writing-translation')
                lail_pref.preferred_categories.add(marketing, writing)
            except Category.DoesNotExist:
                pass

        self.stdout.write('> Created user preferences')
