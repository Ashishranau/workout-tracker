#pragma once

namespace analytics {

struct OneRepMaxEstimate {
    double epley;
    double brzycki;
    double average;
};

// Estimates 1RM from a single set. Reliable only for reps in [1, 12] -
// beyond that, fatigue makes the extrapolation meaningless regardless of
// formula, so callers should reject/flag higher-rep sets before calling this.
OneRepMaxEstimate estimate_one_rep_max(double weight, int reps);

}  // namespace analytics
