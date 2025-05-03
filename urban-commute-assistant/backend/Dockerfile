FROM python:3.9-slim

WORKDIR /app

# Install dependencies
COPY requirements.txt .
# Fix NumPy and Pandas compatibility issue
RUN pip install --no-cache-dir numpy==1.23.5
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY . .

# Expose port
EXPOSE 8000

# Run the application
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000", "--reload"]