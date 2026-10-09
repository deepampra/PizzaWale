import os
from django.core.management.base import BaseCommand, CommandError
from django.contrib.auth import get_user_model


class Command(BaseCommand):
    help = "Create or update a production admin using environment variables"

    def handle(self, *args, **options):
        username = os.environ.get("ADMIN_USERNAME")
        password = os.environ.get("ADMIN_PASSWORD")

        if not username or not password:
            raise CommandError("ADMIN_USERNAME and ADMIN_PASSWORD must be set.")

        if len(password) < 12:
            raise CommandError("ADMIN_PASSWORD must be at least 12 characters.")

        User = get_user_model()
        user, created = User.objects.get_or_create(username=username)

        user.is_staff = True
        user.is_superuser = True
        user.set_password(password)
        user.save()

        self.stdout.write(
            self.style.SUCCESS(
                f"Admin account {'created' if created else 'updated'} successfully."
            )
        )