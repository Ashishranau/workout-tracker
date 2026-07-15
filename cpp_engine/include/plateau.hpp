#pragma once

#include <vector>

namespace analytics {

struct PlateauResult {
    bool is_plateaued;
    double slope_per_week;             // trend in kg per week
    double percent_change_per_week;    // slope relative to mean value, as a percentage
    int sessions_used;
};

// Fits a least-squares linear regression to (day, estimated_1rm) points - one
// point per session, chronologically ordered - and flags a plateau when the
// trend's weekly improvement falls below threshold_percent_per_week.
// Requires at least 3 sessions with at least 2 distinct days; days must be
// non-decreasing.
PlateauResult detect_plateau(
    const std::vector<double>& days,
    const std::vector<double>& one_rep_maxes,
    double threshold_percent_per_week = 0.5
);

}  // namespace analytics
