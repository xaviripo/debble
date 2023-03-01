from datetime import datetime
from zoneinfo import ZoneInfo

# Returns current puzzle date as yyyy-mm-dd
def current_puzzle_date():
    return datetime.now(tz=ZoneInfo("Europe/Amsterdam")).date().isoformat()
