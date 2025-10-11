// Created with Pyto

#include <Python.h>

static PyObject* _main(PyObject* self, PyObject* args) {
    printf("Hello World!\n");
    return Py_None;
}

// Our Module's Function Definition struct
// We require this `NULL` to signal the end of our method
// definition
static PyMethodDef cccMethods[] = {
    { "main", _main, METH_NOARGS, "docstring here" },
    { NULL, NULL, 0, NULL }
};

// Our Module Definition struct
static struct PyModuleDef cccModule = {
    PyModuleDef_HEAD_INIT,
    "ccc",
    "docstring here",
    -1,
    cccMethods
};

// Initializes our module using our above struct
PyMODINIT_FUNC PyInit_ccc(void) {
    return PyModule_Create(&cccModule);
}
