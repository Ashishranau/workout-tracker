#include "plateau.hpp"

#include <numeric>
#include <stdexcept>

namespace analytics {

PlateauResult detect_plateau(
    const std::vector<double>& days,
    const std::vector<double>& one_rep_maxes,
    double threshold_percent_per_week
) {
    if (days.size() != one_rep_maxes.size()) {
        throw std::invalid_argument("days and one_rep_maxes must be the same length");
    }
    if (days.size() < 3) {
        throw std::invalid_argument("need at least 3 sessions to detect a trend");
    }

    const int n = static_cast<int>(days.size());

    double sum_x = 0.0, sum_y = 0.0, sum_xy = 0.0, sum_x2 = 0.0;
    for (int i = 0; i < n; ++i) {
        sum_x += days[i];
        sum_y += one_rep_maxes[i];
        sum_xy += days[i] * one_rep_maxes[i];
        sum_x2 += days[i] * days[i];
    }

    const double denominator = n * sum_x2 - sum_x * sum_x;
    if (denominator == 0.0) {
        throw std::invalid_argument("need at least 2 distinct session days to fit a trend");
    }

    const double slope_per_day = (n * sum_xy - sum_x * sum_y) / denominator;
    const double slope_per_week = slope_per_day * 7.0;
    const double mean_y = sum_y / n;
    const double percent_change_per_week = (slope_per_week / mean_y) * 100.0;

    return {
        percent_change_per_week < threshold_percent_per_week,
        slope_per_week,
        percent_change_per_week,
        n,
    };
}

}  // namespace analytics
