# Database Management

This project uses a simplified database setup with direct table creation through SQLAlchemy.

## Setup
The database tables are automatically created when the application starts.

## Reset Database
To reset the database (delete all data and recreate tables):
```
python reset_db.py
```

## Adding New Models
1. Add your model to `app/db/models.py`
2. Make sure it inherits from `Base`
3. Restart the application to create the new table

## Manual Database Initialization
If you need to manually initialize the database:
```
python -m app.db.init_db
```

## Database Location
The SQLite database file is located at `site.db` in the backend directory.