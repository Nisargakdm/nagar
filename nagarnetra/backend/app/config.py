import os
BASE = os.path.dirname(os.path.abspath(__file__))
DB_PATH = os.environ.get("NN_DB", os.path.join(BASE, "..", "data", "nagarnetra.db"))
SCALE = float(os.environ.get("NN_TIME_SCALE", "12"))   # sim seconds per real second
TICK = 0.5
OSRM = os.environ.get("OSRM_URL", "https://router.project-osrm.org")  # free, no key
USE_OSRM = os.environ.get("NN_USE_OSRM", "1") == "1"
RADIUS = 30.0      # metres: detections closer than this are the same defect
MIN_BUSES = 2      # independent buses needed to verify
SEG = 250.0        # road segment length (m)
