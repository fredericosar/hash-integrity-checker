# Setup

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
