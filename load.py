"""
This script scans the media/ folder for new media that isn't in the debble.sqlite database yet and adds it.
"""

import sqlite3
import os
import re

INSTANCE_LOCATION = 'instance/'
db_location = INSTANCE_LOCATION + 'debble.sqlite'
media_location = INSTANCE_LOCATION + 'media'

if __name__ == '__main__':
    db = sqlite3.connect(
        db_location,
        detect_types=sqlite3.PARSE_DECLTYPES
    )
    db.row_factory = sqlite3.Row

    # List of file names inside media/
    files = os.listdir(path=media_location)

    # Media entries in the database
    old_entries = db.execute('SELECT media.location FROM media')

    if old_entries is None:
        raise Exception("Couldn't query media entries in database")

    # List of file names of the media entries already in the database
    old_entries = [entry['location'] for entry in old_entries]

    # List of files in media/ that do not have a corresponding entry in the database yet
    missing_entries = list(set(files) - set(old_entries))


    def generate_entry(entry):

        r = re.search(r"(AUDIO|PHOTO|VIDEO)-(\d{4}-\d{2}-\d{2})-*", entry)

        # Ignore this file
        if r is None:
            print("Couldn't load file: " + entry)
            return None

        return (
            entry,
            {
                "PHOTO": 0,
                "VIDEO": 1,
                "AUDIO": 2,
            }[r.group(1)],
            r.group(2),
        )

    new_entries = (generate_entry(entry) for entry in missing_entries)

    # Remove files that didn't match the regex
    new_entries = [entry for entry in new_entries if entry is not None]

    db.executemany(
        "INSERT INTO media (location, media_type, solution_date) VALUES (?, ?, ?)",
        new_entries
    )
    db.commit()
