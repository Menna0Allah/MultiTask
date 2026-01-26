"""
Management command to fix payment data for demo accounts
- Creates missing Escrow records
- Updates IN_PROGRESS task payment status
"""

from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from django.db import transaction
from django.utils import timezone
from decimal import Decimal
from datetime import timedelta

from tasks.models import Task, TaskApplication
from payments.models import Wallet, Transaction as PaymentTransaction, Escrow

User = get_user_model()


class Command(BaseCommand):
    help = 'Fix payment data - create missing escrow records and update task payment statuses'

    def handle(self, *args, **options):
        self.stdout.write(self.style.SUCCESS('Fixing payment data...'))

        with transaction.atomic():
            # Get users
            try:
                menna = User.objects.get(username='menna_allah')
                lail = User.objects.get(username='lail_eldein')
            except User.DoesNotExist as e:
                self.stdout.write(self.style.ERROR(f'User not found: {e}'))
                return

            # Fix completed tasks
            self.stdout.write('\nCreating escrow records for completed tasks...')
            completed_tasks = Task.objects.filter(
                client=menna,
                assigned_to=lail,
                status='COMPLETED',
                payment_status='released'
            )

            for task in completed_tasks:
                self.create_completed_escrow(task, menna, lail)

            # Fix in-progress task
            self.stdout.write('\nFixing IN_PROGRESS task...')
            in_progress_tasks = Task.objects.filter(
                client=menna,
                assigned_to=lail,
                status='IN_PROGRESS'
            )

            for task in in_progress_tasks:
                self.create_active_escrow(task, menna, lail)
                # Update task payment status
                task.payment_status = 'escrowed'
                task.requires_payment = True
                task.save()
                self.stdout.write(f'  > Updated task payment_status to "escrowed"')

        self.stdout.write(self.style.SUCCESS('\n[SUCCESS] Payment data fixed successfully!'))
        self.stdout.write('\nSummary:')

        # Show summary
        total_escrows = Escrow.objects.filter(client=menna).count()
        self.stdout.write(f'  - Total escrow records: {total_escrows}')
        self.stdout.write(f'  - Released escrows: {Escrow.objects.filter(status="released").count()}')
        self.stdout.write(f'  - Active escrows: {Escrow.objects.filter(status="funded").count()}')

    def create_completed_escrow(self, task, client, freelancer):
        """Create escrow record for a completed task"""
        # Check if escrow already exists
        if hasattr(task, 'escrow'):
            self.stdout.write(f'  > Escrow already exists for task {task.id}')
            return

        # Calculate amounts
        total_amount = task.final_amount or task.budget
        platform_fee_percentage = Decimal('15.00')
        platform_fee_amount = (total_amount * platform_fee_percentage / 100).quantize(Decimal('0.01'))
        freelancer_amount = total_amount - platform_fee_amount

        # Get or create task application
        try:
            application = TaskApplication.objects.get(task=task, freelancer=freelancer, status='ACCEPTED')
        except TaskApplication.DoesNotExist:
            application = None

        # Create escrow record
        escrow = Escrow.objects.create(
            escrow_id=f'ESC-{task.id}',
            task=task,
            task_application=application,
            client=client,
            freelancer=freelancer,
            total_amount=total_amount,
            platform_fee_percentage=platform_fee_percentage,
            platform_fee_amount=platform_fee_amount,
            freelancer_amount=freelancer_amount,
            status='released',
            currency='EGP',
            funded_at=task.completed_at - timedelta(days=1) if task.completed_at else timezone.now(),
            released_at=task.completed_at if task.completed_at else timezone.now(),
            created_at=task.created_at,
        )

        # Link existing transactions to this escrow
        transactions = PaymentTransaction.objects.filter(task=task)
        transactions.update(escrow=escrow)

        self.stdout.write(f'  > Created released escrow ESC-{task.id} for {total_amount} EGP')

    def create_active_escrow(self, task, client, freelancer):
        """Create active escrow record for in-progress task"""
        # Check if escrow already exists
        if hasattr(task, 'escrow'):
            self.stdout.write(f'  > Escrow already exists for task {task.id}')
            return

        # Calculate amounts
        total_amount = task.budget
        platform_fee_percentage = Decimal('15.00')
        platform_fee_amount = (total_amount * platform_fee_percentage / 100).quantize(Decimal('0.01'))
        freelancer_amount = total_amount - platform_fee_amount

        # Get or create task application
        try:
            application = TaskApplication.objects.get(task=task, freelancer=freelancer, status='ACCEPTED')
        except TaskApplication.DoesNotExist:
            application = None

        # Create escrow record
        escrow = Escrow.objects.create(
            escrow_id=f'ESC-{task.id}',
            task=task,
            task_application=application,
            client=client,
            freelancer=freelancer,
            total_amount=total_amount,
            platform_fee_percentage=platform_fee_percentage,
            platform_fee_amount=platform_fee_amount,
            freelancer_amount=freelancer_amount,
            status='funded',  # Active escrow
            currency='EGP',
            funded_at=timezone.now() - timedelta(days=3),  # Funded 3 days ago
            created_at=task.created_at,
        )

        # Create deposit transaction if it doesn't exist
        deposit_txn_id = f'TXN-{task.id}-DEPOSIT'
        if not PaymentTransaction.objects.filter(transaction_id=deposit_txn_id).exists():
            PaymentTransaction.objects.create(
                transaction_id=deposit_txn_id,
                sender=client,
                recipient=None,
                task=task,
                escrow=escrow,
                transaction_type='escrow_deposit',
                status='succeeded',
                amount=total_amount,
                platform_fee=platform_fee_amount,
                net_amount=freelancer_amount,
                currency='EGP',
                description=f'Escrow deposit for {task.title[:50]}',
                idempotency_key=f'escrow-task-{task.id}-deposit-fix',
                processed_at=escrow.funded_at,
                created_at=escrow.funded_at,
            )
            self.stdout.write(f'  > Created deposit transaction {deposit_txn_id}')

        self.stdout.write(f'  > Created active escrow ESC-{task.id} for {total_amount} EGP')
