if(WIN32)
    add_definitions(-D_CRT_SECURE_NO_WARNINGS)
endif()

include_directories(microjson)
add_library(MicroJSON microjson/mjson.c)

add_executable(IntegrityPlugin main.c sha1.c md5.c)
target_link_libraries(IntegrityPlugin MicroJSON)
install(TARGETS IntegrityPlugin
        RUNTIME DESTINATION /)

configure_file(manifest.json.in manifest.json)
install(FILES "${CMAKE_CURRENT_BINARY_DIR}/manifest.json" DESTINATION /)

