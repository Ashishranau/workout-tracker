import sys
from pathlib import Path

# The C++ engine is built separately (see cpp_engine/CMakeLists.txt) and produces
# a compiled extension module (.pyd on Windows, .so on Linux) that isn't a normal
# installed package - so we add its build output directory to sys.path directly.
_CPP_BUILD_DIR = Path(__file__).resolve().parents[3] / "cpp_engine" / "build" / "Release"
if str(_CPP_BUILD_DIR) not in sys.path:
    sys.path.insert(0, str(_CPP_BUILD_DIR))

import analytics_engine as _engine  # noqa: E402


def estimate_one_rep_max(weight_kg: float, reps: int) -> dict:
    result = _engine.estimate_one_rep_max(weight_kg, reps)
    return {
        "epley": result.epley,
        "brzycki": result.brzycki,
        "average": result.average,
    }