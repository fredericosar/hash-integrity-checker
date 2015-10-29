#include <stdio.h>
#include "postinstall.h"

int main(int argc, char **argv) {
    if (argc != 3) {
        fprintf(stderr, "Usage: %s <manifest_path> <binary_path>\n", argv[0]);
        return 1;
    }

    FILE *manifest = fopen(argv[1], "w");
    if (manifest == NULL) {
        fprintf(stderr, "Failed to open manifest file for writing\n");
        return 1;
    }

    fputs(MANIFEST_HEAD, manifest);
    // TODO escaping probably required.
    fputs(argv[2], manifest);
    fputs(MANIFEST_TAIL, manifest);
    fclose(manifest);

    return 0;
}
