# Generated migration for onboarding and interests

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('recommendations', '0001_initial'),
    ]

    operations = [
        migrations.AddField(
            model_name='userpreference',
            name='interests',
            field=models.JSONField(
                blank=True,
                null=True,
                help_text='Array of interest/category IDs the user is interested in'
            ),
        ),
        migrations.AddField(
            model_name='userpreference',
            name='onboarding_completed',
            field=models.BooleanField(
                default=False,
                help_text='Whether user has completed the onboarding survey'
            ),
        ),
        migrations.AddField(
            model_name='userpreference',
            name='onboarding_completed_at',
            field=models.DateTimeField(
                blank=True,
                null=True,
                help_text='When the user completed onboarding'
            ),
        ),
        migrations.AddField(
            model_name='userpreference',
            name='preferred_task_types',
            field=models.JSONField(
                blank=True,
                null=True,
                help_text='Array of preferred task types (PHYSICAL, DIGITAL, HYBRID)'
            ),
        ),
    ]
