# Generated by Django 3.2.5 on 2021-08-17 19:45

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('busstops', '0007_service_public_use'),
        ('vehicles', '0014_auto_20210428_1846'),
    ]

    operations = [
        migrations.AlterField(
            model_name='vehiclerevision',
            name='from_livery',
            field=models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.DO_NOTHING, related_name='revision_from', to='vehicles.livery'),
        ),
        migrations.AlterField(
            model_name='vehiclerevision',
            name='from_operator',
            field=models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.DO_NOTHING, related_name='revision_from', to='busstops.operator'),
        ),
        migrations.AlterField(
            model_name='vehiclerevision',
            name='from_type',
            field=models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.DO_NOTHING, related_name='revision_from', to='vehicles.vehicletype'),
        ),
        migrations.AlterField(
            model_name='vehiclerevision',
            name='to_livery',
            field=models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.DO_NOTHING, related_name='revision_to', to='vehicles.livery'),
        ),
        migrations.AlterField(
            model_name='vehiclerevision',
            name='to_operator',
            field=models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.DO_NOTHING, related_name='revision_to', to='busstops.operator'),
        ),
        migrations.AlterField(
            model_name='vehiclerevision',
            name='to_type',
            field=models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.DO_NOTHING, related_name='revision_to', to='vehicles.vehicletype'),
        ),
    ]