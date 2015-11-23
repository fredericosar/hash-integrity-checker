cmake_minimum_required(VERSION 3.0)
project(IntegrityPlugin)

set(PLUGIN_NATIVE_NSPATH edu.utah.cs.cs6964.integrity_plugin
    CACHE STRING "Native messaging host identifier")
set(EXTENSION_ID fomglakhabalmbenacmmigbjhcalmned
    CACHE STRING "Extension ID")
set(DIRSERVER_DEFAULT_URI http://hash-dirserver.taricorp.net/api/
    CACHE STRING "Default URI for hash directory server")

if(WIN32)
    # WiX might be less bad than NSIS
    set(CPACK_GENERATOR NSIS)

    set(CPACK_NSIS_EXTRA_INSTALL_COMMANDS "
        ExecWait 'REG ADD HKLM\\\\Software\\\\Google\\\\Chrome\\\\Extensions\\\\${EXTENSION_ID} /v update_url /f /t REG_SZ /d https://clients2.google.com/service/update2/crx'
        ExecWait 'REG ADD HKLM\\\\Software\\\\Google\\\\Chrome\\\\NativeMessagingHosts\\\\${PLUGIN_NATIVE_NSPATH} /f /d \\\"$INSTDIR\\\\manifest.json\\\"'
        "
    )

    set(CPACK_NSIS_EXTRA_UNINSTALL_COMMANDS "
        ExecWait 'REG DELETE HKLM\\\\Software\\\\Google\\\\Chrome\\\\Extensions /v ${EXTENSION_ID} /f'
        ExecWait 'REG DELETE HKLM\\\\Software\\\\Google\\\\Chrome\\\\NativeMessagingHosts\\\\${PLUGIN_NATIVE_NSPATH} /va /f'
        "
    )

else()
    message(WARNING "Installers for non-Windows not implemented.")
endif()

if(CMAKE_COMPILER_IS_GNUCXX)
    set(CMAKE_C_FLAGS "${CMAKE_C_FLAGS} -Wall -Wextra")
endif()

add_subdirectory(native)
add_subdirectory(chrome)

include(CPack)
