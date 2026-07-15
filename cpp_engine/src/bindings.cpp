#include <pybind11/pybind11.h>

#include "one_rep_max.hpp"

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
}
