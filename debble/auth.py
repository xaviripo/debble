import functools

from flask import (
    Blueprint, flash, g, redirect, render_template, request, session, url_for, abort
)
from werkzeug.security import check_password_hash, generate_password_hash

from debble.db import get_db

bp = Blueprint('auth', __name__)


# checks if a user id is stored in the session and gets that user’s data from the database, storing it on g.user,
# which lasts for the length of the request
@bp.before_app_request
def load_logged_in_user():
    user_id = session.get('user_id')

    if user_id is None:
        g.user = None
    else:
        g.user = get_db().execute(
            'SELECT * FROM user WHERE id = ?', (user_id,)
        ).fetchone()

# This decorator returns a new view function that wraps the original view it’s applied to.
# The new function checks if a user is loaded and redirects to the login page otherwise.
# If a user is loaded the original view is called and continues normally.
def login_required(view):
    @functools.wraps(view)
    def wrapped_view(**kwargs):
        if g.user is None:
            return redirect(url_for('auth.login'))

        return view(**kwargs)

    return wrapped_view

@bp.route('/login', methods=('GET', 'POST'))
def login():
    if request.method == 'POST':
        username = request.form['username']
        password = request.form['password']
        db = get_db()
        error = None
        user = db.execute(
            'SELECT * FROM user WHERE username = ?', (username,)
        ).fetchone()

        if user is None or not check_password_hash(user['password'], password):
            error = 'Unkown username or incorrect password.'

        if error is None:
            session.clear()
            session['user_id'] = user['id']
            return redirect(url_for('puzzle.index'))

        flash(error)

    if g.user is not None:
        return redirect(url_for('puzzle.index'))

    return render_template('login.html')

@bp.route('/change-password', methods=('GET', 'POST'))
@login_required
def change_password():
    if request.method == 'POST':
        new_password = request.form['new_password']
        db = get_db()
        error = None
        user = db.execute(
            'UPDATE user SET password = ? WHERE username = ?', (generate_password_hash(new_password), g.user['username'],)
        )
        db.commit()

        return redirect(url_for('puzzle.index'))

    return render_template('change_password.html')

@bp.route('/logout')
def logout():
    session.clear()
    return redirect(url_for('puzzle.index'))

# Login required so that random users cannot create accounts.
# But this service shouldn't be used regularly anyways in the first place.
@bp.route('/register', methods=('GET', 'POST'))
@login_required
def register():

    if request.method == 'POST':
        username = request.form['username']
        password = request.form['password']
        db = get_db()
        error = None

        if not username:
            error = 'Username is required.'
        elif not password:
            error = 'Password is required.'

        if error is None:
            try:
                db.execute(
                    "INSERT INTO user (username, password) VALUES (?, ?)",
                    (username, generate_password_hash(password)),
                )
                db.commit()
            except db.IntegrityError:
                error = f"User {username} is already registered."
            else:
                return redirect(url_for("auth.login"))

        flash(error)

    # I copied and pasted this, template doesn't exist cause I don't need it
    return render_template('register.html')
