cmake_minimum_required(VERSION 3.0)
project(IntegrityPlugin)

set(PLUGIN_NATIVE_NSPATH edu.utah.cs.cs6964.integrity_plugin
    CACHE STRING "Native messaging host identifier")
set(EXTENSION_ID unknown
    CACHE STRING "chrome-extension URI identifying browser plugin")

include_directories(microjson)
add_library(MicroJSON microjson/mjson.c)

add_executable(IntegrityPlugin main.c sha1.c md5.c)
target_link_libraries(IntegrityPlugin MicroJSON)
install(TARGETS IntegrityPlugin
        RUNTIME DESTINATION /)

configure_file(manifest.json.in manifest.json)
install(FILES "${CMAKE_CURRENT_BINARY_DIR}/manifest.json" DESTINATION /)

if(WIN32)
    # TODO turns out there's a WiX generator, which I think is less bad.
    set(CPACK_GENERATOR "NSIS")
    set(CPACK_NSIS_EXTRA_INSTALL_COMMANDS
        "ExecWait 'REG ADD HKLM\\\\Software\\\\Google\\\\Chrome\\\\NativeMessagingHosts\\\\${PLUGIN_NATIVE_NSPATH} /f /d \\\"$INSTDIR\\\\manifest.json\\\"'"
    )
    # On uninstall, remove the registry key we created.
    set(CPACK_NSIS_EXTRA_UNINSTALL_COMMANDS
        "ExecWait 'REG DELETE HKLM\\\\Software\\\\Google\\\\Chrome\\\\NativeMessagingHosts\\\\${PLUGIN_NATIVE_NSPATH} /va /f'"
    )

elseif(APPLE)
    set(CPACK_GENERATOR "Bundle")
    # TODO implement me

else(UNIX)
    set(CPACK_GENERATOR "DEB")
    # TODO implement me

endif()

include(CPack)

# For extension packaging:
# https://developer.chrome.com/extensions/external_extensions
# https://stackoverflow.com/questions/3196615/how-to-create-chrome-crx-file-programatically-preferrably-in-java

