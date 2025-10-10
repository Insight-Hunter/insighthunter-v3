from setuptools import setup, Extension
from make_sphinx_documentation import BuildDocsCommand

BuildDocsCommand.sourcedir = "docs"

setup(
    cmdclass={
        'build_docs': BuildDocsCommand, # Run to build the documentation
    },

    ext_modules = [
        Extension("ccc.ccc", ["ccc/ccc.c"])
    ],
    
    include_package_data=True,
)
