import os
from datetime import date
import re

from flask import (
    Blueprint, flash, g, redirect, render_template, request, session, url_for, abort, send_from_directory, current_app
)
from werkzeug.security import check_password_hash, generate_password_hash

from debble.db import get_db

from . import utils

from .utils import current_puzzle_date

from .auth import login_required

from random import choice

bp = Blueprint('puzzle', __name__)

# Hey! This constant is also present in the frontend.
MAX_ATTEMPTS = 6


# 1. Check the database for the given date's puzzle media
# 2. Obtain the path from there
# 3. Return the file if it exists, 404 otherwise
@bp.route('/media/<string:puzzle_date>')
@login_required
def media(puzzle_date):

    db = get_db()
    media = db.execute(
        'SELECT * FROM media WHERE puzzle_date = ?', (puzzle_date,)
    ).fetchone()

    # Trying to access future media; not allowed
    if date.fromisoformat(puzzle_date) > date.fromisoformat(current_puzzle_date()):
        abort(403)

    # No media for today yet!
    # This should probably have a lock in case two users access this endpoint
    # at the same time... but nah
    if puzzle_date == current_puzzle_date() and media is None:

        # 1. query all rows without puzzle_date
        medias = db.execute(
            "SELECT * FROM media WHERE puzzle_date = '' OR puzzle_date IS NULL"
        )

        # 2. select an id at random among those
        medias_ids = [media['id'] for media in medias]
        print(len(medias_ids))
        today_media_id = choice(medias_ids)

        # 3. update its puzzle_date to today
        db.execute(
            'UPDATE media SET puzzle_date = ? WHERE id = ?', (puzzle_date, today_media_id,)
        )
        db.commit()

        # ... and get the updated row back
        media = db.execute(
            'SELECT * FROM media WHERE puzzle_date = ?', (puzzle_date,)
        ).fetchone()

    return send_from_directory(
        os.path.join(current_app.instance_path, 'media'),
        media['location']
    )

# Return the solution date to the puzzle in case that all attempts have been made. 403 otherwise.
@bp.route('/solution/<string:puzzle_date>')
def solution(puzzle_date):

    db = get_db()
    media = db.execute(
        'SELECT media.solution_date FROM media WHERE puzzle_date = ?', (puzzle_date,)
    ).fetchone()

    attempts = db.execute(
        'SELECT * FROM attempt INNER JOIN media ON attempt.media_id = media.id WHERE media.puzzle_date = ? AND attempt.user_id = ? ORDER BY attempt.attempt_number', (puzzle_date, session['user_id'],)
    )

    attempts = list(attempts)
    if sum(1 for _ in attempts) < MAX_ATTEMPTS and all((attempt['attempt_date'].isoformat()[:10] != media['solution_date'].isoformat()[:10]) for attempt in attempts):
        abort(403)

    return media['solution_date'].isoformat()[:10], 200



@bp.route('/attempts/<string:puzzle_date>', methods=('GET', 'POST'))
def attempts(puzzle_date):

    db = get_db()
    attempts = db.execute(
        'SELECT * FROM attempt INNER JOIN media ON attempt.media_id = media.id WHERE media.puzzle_date = ? AND attempt.user_id = ? ORDER BY attempt.attempt_number', (puzzle_date, session['user_id'])
    )

    # Inserting a new attempt
    if request.method == 'POST':

        if 'attempt_date' not in request.json:
            return "Missing mandatory argument attempt_date", 400

        attempt_date = request.json['attempt_date']
        attempts_len = sum(1 for _ in attempts)

        # Check that puzzle_date is today
        if puzzle_date != current_puzzle_date():
            return "Cannot insert attempt on past date", 409

        # Max number of attempts reached
        if attempts_len >= MAX_ATTEMPTS:
            return "Maximum number of attempts reached", 409

        # Validate that the given input is
        # - a valid date (i.e. no 2023-13-32)
        # - in ISO 8601 format, especifically in yyyy-mm-dd format
        def validate_date(date):
            try:
                date.fromisoformat(date)
            except:
                return bool(re.search('\d{4}-\d{2}-\d{2}', date))
            return True

        # Invalid date/date format
        if not validate_date(attempt_date):
            return "Invalid date format or value", 409

        media = db.execute(
            'SELECT media.id FROM media WHERE media.puzzle_date = ?', (puzzle_date,)
        ).fetchone()

        # Invalid puzzle date!
        if media is None:
            return "Puzzle does not exist for this date", 409

        # Good to go, insert the new attempt
        attempt = db.execute(
            'INSERT INTO attempt (user_id, media_id, attempt_date, attempt_number)'
            ' VALUES (?, ?, ?, ?)',
            (session['user_id'], media['id'], attempt_date, attempts_len)
        ).fetchone()
        db.commit()

        return '', 201

    # Just obtaining the existing attempts
    elif request.method == 'GET':

        if attempts is None:
            abort(404)

        media = db.execute(
            'SELECT media.solution_date FROM media WHERE media.puzzle_date = ?', (puzzle_date,)
        ).fetchone()

        # No solution date for today's media
        if media is None:
            abort(500)

        return [{
            "attemptDate": attempt['attempt_date'].isoformat()[:10],
            "clue": calculate_clue(attempt['attempt_date'], media['solution_date']),
        } for attempt in attempts], 200

# Calculate the clue to return based on the attempt and solution dates.
# If they are identical, return an empty string
# If the solution is in the previous 7 days, return "w-" ("w+" if on the following)
# If the solution is in the previous 30 days, return "m-" ("m+" if on the following)
# If the solution is in the previous 183 days, return "s-" ("s+" if on the following)
# If the solution is in the previous 365 days, return "y-" ("y+" if on the following)
# Otherwise, return "x-" ("x+" if on the following)
def calculate_clue(attempt_date, solution_date):
    fromAttemptToSolution = (solution_date - attempt_date).days
    if fromAttemptToSolution < -365:
        return "x-"
    elif -365 <= fromAttemptToSolution < -183:
        return "y-"
    elif -183 <= fromAttemptToSolution < -30:
        return "s-"
    elif -30 <= fromAttemptToSolution < -7:
        return "m-"
    elif -7 <= fromAttemptToSolution < 0:
        return "w-"
    elif fromAttemptToSolution == 0:
        return ""
    elif 0 < fromAttemptToSolution <= 7:
        return "w+"
    elif 7 < fromAttemptToSolution <= 30:
        return "m+"
    elif 30 < fromAttemptToSolution <= 183:
        return "s+"
    elif 183 < fromAttemptToSolution <= 365:
        return "y+"
    else:
        return "x+"

@bp.route('/')
@login_required
def index():

    return render_template('index.html')
