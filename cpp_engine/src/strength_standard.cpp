#include "strength_standard.hpp"

#include <algorithm>
#include <array>
#include <map>
#include <stdexcept>

namespace analytics {

namespace {

using Breakpoints = std::array<double, 4>;

// Ratio thresholds (estimated 1RM / bodyweight) marking the boundaries between
// Beginner/Novice/Intermediate/Advanced/Elite, per exercise and sex.
const std::map<std::string, Breakpoints> kMaleBreakpoints = {
    {"Barbell Back Squat", {0.75, 1.25, 1.75, 2.25}},
    {"Barbell Bench Press", {0.50, 0.75, 1.25, 1.75}},
    {"Conventional Deadlift", {1.00, 1.50, 2.00, 2.50}},
    {"Overhead Press", {0.35, 0.55, 0.80, 1.10}},
    {"Barbell Row", {0.50, 0.75, 1.00, 1.50}},
};

const std::map<std::string, Breakpoints> kFemaleBreakpoints = {
    {"Barbell Back Squat", {0.50, 0.75, 1.25, 1.75}},
    {"Barbell Bench Press", {0.30, 0.50, 0.75, 1.00}},
    {"Conventional Deadlift", {0.65, 1.00, 1.50, 2.00}},
    {"Overhead Press", {0.20, 0.35, 0.50, 0.70}},
    {"Barbell Row", {0.30, 0.50, 0.70, 1.00}},
};

const std::array<std::string, 5> kTierNames = {
    "Beginner", "Novice", "Intermediate", "Advanced", "Elite"
};

}  // namespace

StrengthStandardResult classify_strength_standard(
    const std::string& exercise_name,
    const std::string& sex,
    double estimated_one_rep_max,
    double bodyweight_kg
) {
    if (bodyweight_kg <= 0) {
        throw std::invalid_argument("bodyweight_kg must be positive");
    }
    if (estimated_one_rep_max <= 0) {
        throw std::invalid_argument("estimated_one_rep_max must be positive");
    }

    const std::map<std::string, Breakpoints>* table;
    if (sex == "male") {
        table = &kMaleBreakpoints;
    } else if (sex == "female") {
        table = &kFemaleBreakpoints;
    } else {
        throw std::invalid_argument("sex must be 'male' or 'female'");
    }

    const auto it = table->find(exercise_name);
    if (it == table->end()) {
        return {false, "", 0.0};
    }

    const double ratio = estimated_one_rep_max / bodyweight_kg;
    const Breakpoints& bp = it->second;

    // Binary search for the first breakpoint exceeding the ratio - its index
    // is the tier (0 = Beginner if below every breakpoint, 4 = Elite if past all).
    const auto pos = std::upper_bound(bp.begin(), bp.end(), ratio);
    const std::size_t tier_index = static_cast<std::size_t>(pos - bp.begin());

    return {true, kTierNames[tier_index], ratio};
}

}  // namespace analytics
