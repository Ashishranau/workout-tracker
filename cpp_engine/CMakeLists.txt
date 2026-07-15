cmake_minimum_required(VERSION 3.15)
project(analytics_engine LANGUAGES CXX)

set(CMAKE_CXX_STANDARD 17)
set(CMAKE_CXX_STANDARD_REQUIRED ON)

find_package(pybind11 REQUIRED)

pybind11_add_module(analytics_engine
    src/bindings.cpp
    src/one_rep_max.cpp
)

target_include_directories(analytics_engine PRIVATE include)
