
#!/usr/bin/env python3
"""
Script to run the Avantis service
"""

import os
import sys
import subprocess
import signal
import time

def install_dependencies():
    """Install required Python packages"""
    try:
        print("Installing Avantis service dependencies...")
        subprocess.check_call([
            sys.executable, "-m", "pip", "install", "-r", "requirements.txt"
        ])
        print("Dependencies installed successfully!")
    except subprocess.CalledProcessError as e:
        print(f"Error installing dependencies: {e}")
        sys.exit(1)

def run_service():
    """Run the Avantis service"""
    try:
        print("Starting Avantis Trading Service...")
        print("Service will be available at: http://localhost:8001")
        print("API docs will be available at: http://localhost:8001/docs")
        print("\nPress Ctrl+C to stop the service")
        
        # Run the service
        subprocess.run([
            sys.executable, "-m", "uvicorn", 
            "avantis_service:app", 
            "--host", "0.0.0.0", 
            "--port", "8001", 
            "--reload"
        ])
    except KeyboardInterrupt:
        print("\nShutting down Avantis service...")
    except Exception as e:
        print(f"Error running service: {e}")

def main():
    """Main function"""
    if len(sys.argv) > 1 and sys.argv[1] == "install":
        install_dependencies()
    else:
        # Change to script directory
        script_dir = os.path.dirname(os.path.abspath(__file__))
        os.chdir(script_dir)
        
        # Install dependencies if requirements.txt exists
        if os.path.exists("requirements.txt"):
            install_dependencies()
        
        # Run the service
        run_service()

if __name__ == "__main__":
    main()
