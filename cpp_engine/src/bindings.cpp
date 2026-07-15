#include <pybind11/pybind11.h>
#include <pybind11/stl.h>

#include "one_rep_max.hpp"
#include "plateau.hpp"

namespace py = pybind11;

PYBIND11_MODULE(analytics_engine, m) {
    m.doc() = "C++ analytics engine for strength training computations";

    py::class_<analytics::OneRepMaxEstimate>(m, "OneRepMaxEstimate")
        .def_readonly("epley", &analytics::OneRepMaxEstimate::epley)
        .def_readonly("brzycki", &analytics::OneRepMaxEstimate::brzycki)
        .def_readonly("average", &analytics::OneRepMaxEstimate::average);

    m.def(
        "estimate_one_rep_max",
        &analytics::estimate_one_rep_max,
        py::arg("weight"),
        py::arg("reps"),
        "Estimate one-rep max (Epley + Brzycki) from a single set's weight and reps"
    );

    py::class_<analytics::PlateauResult>(m, "PlateauResult")
        .def_readonly("is_plateaued", &analytics::PlateauResult::is_plateaued)
        .def_readonly("slope_per_week", &analytics::PlateauResult::slope_per_week)
        .def_readonly(
            "percent_change_per_week", &analytics::PlateauResult::percent_change_per_week
        )
        .def_readonly("sessions_used", &analytics::PlateauResult::sessions_used);

    m.def(
        "detect_plateau",
        &analytics::detect_plateau,
        py::arg("days"),
        py::arg("one_rep_maxes"),
        py::arg("threshold_percent_per_week") = 0.5,
        "Fit a linear trend to per-session 1RM estimates and flag a plateau"
    );
}
