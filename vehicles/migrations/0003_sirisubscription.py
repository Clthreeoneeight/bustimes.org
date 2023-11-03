# Generated by Django 4.2.7 on 2023-11-03 08:05

from django.db import migrations, models
import uuid


class Migration(migrations.Migration):

    dependencies = [
        ('vehicles', '0002_rename_vehiclecode_code_scheme_vehicles_ve_code_73ff06_idx'),
    ]

    operations = [
        migrations.CreateModel(
            name='SiriSubscription',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(blank=True, max_length=64, unique=True)),
                ('uuid', models.UUIDField(default=uuid.uuid4, editable=False)),
                ('sample', models.TextField(blank=True, null=True)),
            ],
        ),
    ]