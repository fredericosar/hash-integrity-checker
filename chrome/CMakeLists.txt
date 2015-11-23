
set(CHROME_BINARY google-chrome
    CACHE FILEPATH "Chrome binary to invoke to build .crx")

set(CRSUFFIX \\Google\\Chrome\\Application\\chrome.exe)
if(EXISTS $ENV{LOCALAPPDATA}${CRSUFFIX})
    set(CHROME_BINARY $ENV{LOCALAPPDATA}${CRSUFFIX})
elif(EXISTS $ENV{ProgramFiles\(x86\)}${CRSUFFIX})
    set(CHROME_BINARY $ENV{ProgramFiles\(x86\)${CRSUFFIX})
endif()

add_custom_command(
    OUTPUT extension.crx
    COMMAND ${CMAKE_COMMAND} -E copy_directory ${CMAKE_CURRENT_SOURCE_DIR} ${CMAKE_CURRENT_BINARY_DIR}/extension
    COMMAND ${CHROME_BINARY} --pack-extension=${CMAKE_CURRENT_BINARY_DIR}/extension --no-message-box ${CRX_SIGN}
    DEPENDS ${CMAKE_CURRENT_SOURCE_DIR}
)
add_custom_target(ChromeExtension ALL
                  DEPENDS ${CMAKE_CURRENT_BINARY_DIR}/extension.crx)

configure_file(config.js.in ${CMAKE_CURRENT_SOURCE_DIR}/config.js)
