#pragma once

#include <string>

namespace analytics {

struct StrengthStandardResult {
    bool supported;            // false if this exercise has no defined standard table
    std::string tier;          // "Beginner".."Elite" - meaningful only if supported
    double bodyweight_ratio;   // estimated_one_rep_max / bodyweight_kg
};

// sex must be "male" or "female". exercise_name must match a supported
// catalog name exactly (Squat/Bench/Deadlift/Overhead Press/Barbell Row) -
// anything else returns supported=false rather than guessing at a standard.
//
// Breakpoints are approximate, commonly-cited general bodyweight-ratio
// benchmarks (the style used by sites like Strength Level/ExRx), not a
// reproduction of one specific verified academic or federation source.
StrengthStandardResult classify_strength_standard(
    const std::string& exercise_name,
    const std::string& sex,
    double estimated_one_rep_max,
    double bodyweight_kg
);

}  // namespace analytics
