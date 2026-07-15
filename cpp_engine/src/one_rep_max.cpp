#include "one_rep_max.hpp"

#include <stdexcept>

namespace analytics {

OneRepMaxEstimate estimate_one_rep_max(double weight, int reps) {
    if (weight <= 0) {
        throw std::invalid_argument("weight must be positive");
    }
    if (reps < 1 || reps > 12) {
        throw std::invalid_argument("reps must be between 1 and 12 for a reliable estimate");
    }

    if (reps == 1) {
        return {weight, weight, weight};
    }

    double epley = weight * (1.0 + static_cast<double>(reps) / 30.0);
    double brzycki = weight * 36.0 / (37.0 - static_cast<double>(reps));

    return {epley, brzycki, (epley + brzycki) / 2.0};
}

}  // namespace analytics
