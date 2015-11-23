# Setup

Configuration and compilation is required to set some configuration in the
code. Run CMake and adjust `PLUGIN_NATIVE_NSPATH` and `DIRSERVER_DEFAULT_URI`
if desired.

Try this:
```
$ mkdir build
$ cd build
$ ccmake ..
<press 'c' to configure>
<adjust options as desired>
<press 'c' then 'g' to configure again and generate>
<press 'q' to exit ccmake>
$ cmake --build .
```

## Windows

`cmake --build . --target package` should generate a NSIS installer. It still
doesn't work completely, and depends on having the extension published in the
chrome web store.

## Linux

```
$ mkdir build
$ cd build
$ cmake ..
$ make
$ cp manifest.json ~/.config/google-chrome/NativeMessagingHosts/$(cmake -L .. |
grep PLUGIN_NATIVE_NSPATH | cut -d= -f2).json
```

You also need to edit the manifest so the `path` entry provides the absolute
path to the built `IntegrityPlugin` binary.

Then install the plugin, either the .crx generated in the build directory or
load it from the `chrome` source directory.
