import os
from django.conf import settings
from busstops.models import Operator
from ...utils import download_if_changed
from .import_gtfs import Command as BaseCommand


class Command(BaseCommand):
    def handle_operator(self, line):
        operator, created = Operator.objects.get_or_create(
            id='flixbus-eu',
            name='FlixBus'
        )
        return operator

    def handle(self, *args, **options):
        path = os.path.join(settings.DATA_DIR, 'flixbus.zip')
        url = 'http://gtfs.gis.flix.tech/gtfs_generic_eu.zip'
        modifed, last_modified = download_if_changed(path, url)
        if modifed or options['force']:
            print('flixbus', last_modified)
            self.handle_zipfile(path, 'flixbus', url, last_modified)