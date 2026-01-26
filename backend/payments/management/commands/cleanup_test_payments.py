from django.core.management.base import BaseCommand
from payments.models import Escrow, Transaction, Wallet
from tasks.models import Task


class Command(BaseCommand):
    help = 'Clean up test payment data (pending escrows and transactions)'

    def add_arguments(self, parser):
        parser.add_argument(
            '--all',
            action='store_true',
            help='Delete ALL payment data (use with caution!)',
        )

    def handle(self, *args, **options):
        if options['all']:
            # Delete everything
            escrow_count = Escrow.objects.all().count()
            transaction_count = Transaction.objects.all().count()

            Escrow.objects.all().delete()
            Transaction.objects.all().delete()

            # Reset task payment statuses
            Task.objects.all().update(
                payment_status='not_required',
                final_amount=None
            )

            # Reset wallet balances
            Wallet.objects.all().update(
                escrowed_balance=0,
                pending_balance=0
            )

            self.stdout.write(
                self.style.SUCCESS(
                    f'Deleted {escrow_count} escrows and {transaction_count} transactions'
                )
            )
            self.stdout.write(
                self.style.SUCCESS('Reset all task payment statuses and wallet balances')
            )
        else:
            # Only delete pending payment data
            pending_escrows = Escrow.objects.filter(status='pending_payment')
            pending_transactions = Transaction.objects.filter(status='pending')

            escrow_count = pending_escrows.count()
            transaction_count = pending_transactions.count()

            # Get affected tasks
            task_ids = list(pending_escrows.values_list('task_id', flat=True))

            # Delete pending data
            pending_escrows.delete()
            pending_transactions.delete()

            # Reset affected tasks
            Task.objects.filter(id__in=task_ids, payment_status='pending').update(
                payment_status='not_required'
            )

            self.stdout.write(
                self.style.SUCCESS(
                    f'Deleted {escrow_count} pending escrows and {transaction_count} pending transactions'
                )
            )
            self.stdout.write(
                self.style.WARNING(
                    'Use --all flag to delete ALL payment data (funded escrows, completed transactions, etc.)'
                )
            )
