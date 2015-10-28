```
# Compile native program
$ mkdir build && cd build
$ cmake ..
$ cmake --build .
# Build installer
$ cmake --build . --target package
```

The installer is mildly horrible right now; I'd like to use the WiX generator
for cpack rather than NSIS. I have no idea what the allowed\_origins should be.

Ideally the entire extension and installers can be built with just one
invocation of cmake from the top level. Needs some work to make it possible.
