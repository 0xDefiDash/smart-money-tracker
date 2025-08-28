
#!/bin/bash

# Script to start the Avantis Python service
# This should be run from the project root directory

echo "🚀 Starting Avantis Trading Service..."

# Change to the service directory
cd services/avantis

# Check if Python is available
if ! command -v python3 &> /dev/null; then
    echo "❌ Python 3 is not installed. Please install Python 3 first."
    exit 1
fi

# Check if pip is available
if ! command -v pip3 &> /dev/null; then
    echo "❌ pip3 is not installed. Please install pip first."
    exit 1
fi

# Install dependencies
echo "📦 Installing Python dependencies..."
python3 -m pip install -r requirements.txt

if [ $? -ne 0 ]; then
    echo "❌ Failed to install dependencies. Please check the error messages above."
    exit 1
fi

# Start the service
echo "🔥 Starting Avantis service on http://localhost:8001"
echo "📖 API documentation will be available at http://localhost:8001/docs"
echo ""
echo "Press Ctrl+C to stop the service"
echo ""

python3 run_service.py
