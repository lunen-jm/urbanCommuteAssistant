import sqlite3

# Connect to the database
conn = sqlite3.connect('site.db')
cursor = conn.cursor()

# List all tables
print("=== TABLES IN DATABASE ===")
cursor.execute("SELECT name FROM sqlite_master WHERE type='table'")
tables = cursor.fetchall()
for table in tables:
    print(table[0])

# Check users table if it exists
if ('users',) in tables:
    print("\n=== USERS IN DATABASE ===")
    cursor.execute("SELECT id, username, email, hashed_password FROM users")
    rows = cursor.fetchall()
    if rows:
        for row in rows:
            print(f"ID: {row[0]}, Username: {row[1]}, Email: {row[2]}, Password Hash: {row[3]}")
    else:
        print("No users found in the database")
else:
    print("\nNo users table found in the database")

# Close connection
conn.close()