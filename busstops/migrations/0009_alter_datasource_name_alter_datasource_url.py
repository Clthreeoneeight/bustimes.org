# Generated by Django 4.0.7 on 2022-09-16 09:30

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("busstops", "0008_remove_service_date_operator_modified_at_and_more"),
    ]

    operations = [
        migrations.AlterField(
            model_name="datasource",
            name="name",
            field=models.CharField(db_index=True, max_length=255),
        ),
        migrations.AlterField(
            model_name="datasource",
            name="url",
            field=models.URLField(blank=True, db_index=True),
        ),
        migrations.AlterField(
            model_name="datasource",
            name="sha1",
            field=models.CharField(blank=True, db_index=True, max_length=40, null=True),
        ),
    ]