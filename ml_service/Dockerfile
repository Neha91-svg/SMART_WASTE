FROM python:3.11-slim

WORKDIR /app

# Install dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy service code
COPY . .

# Generate initial data and train model if not present (optional, but good for first run)
# RUN python generate_data.py && python train_model.py

EXPOSE 5001

CMD ["python", "app.py"]
