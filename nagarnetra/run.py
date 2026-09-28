"""One command:  python run.py   ->  http://localhost:8000"""
import os, subprocess, sys, venv
h = os.path.dirname(os.path.abspath(__file__)); vd = os.path.join(h, ".venv")
py = os.path.join(vd, "Scripts" if os.name == "nt" else "bin", "python")
if not os.path.exists(py): print("First run: creating environment (1-2 min)..."); venv.create(vd, with_pip=True)
subprocess.check_call([py, "-m", "pip", "install", "-q", "-r", os.path.join(h, "backend", "requirements.txt")])
print("\n>>> Open http://localhost:8000  (Ctrl+C to stop)\n"); os.chdir(os.path.join(h, "backend"))
sys.exit(subprocess.call([py, "-m", "uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]))
