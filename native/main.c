#include <stdio.h>
#include <stdlib.h>
#include <stdint.h>

#include "md5.h"
#include "sha1.h"
#include "mjson.h"

static char path_buf[4096];
static struct json_attr_t MESSAGE_SCHEMA[] = {
    {"path", t_string, .addr.string = path_buf, .len = sizeof(path_buf)},
    {NULL},
};

int do_hashing(FILE *f, uint8_t md5_buffer[128 / 8], uint8_t sha1_buffer[160 / 8]) {
    mbedtls_sha1_context ctx_sha1;
    mbedtls_sha1_init(&ctx_sha1);
    mbedtls_sha1_starts(&ctx_sha1);

    mbedtls_md5_context ctx_md5;
    mbedtls_md5_init(&ctx_md5);
    mbedtls_md5_starts(&ctx_md5);

    do {
        uint8_t buf[4096];
        size_t bytes_read = fread(buf, 1, sizeof(buf), f);
        if (ferror(f)) {
            return 1;
        }

        mbedtls_sha1_update(&ctx_sha1, buf, bytes_read);
        mbedtls_md5_update(&ctx_md5, buf, bytes_read);
    } while (!feof(f));

    mbedtls_sha1_finish(&ctx_sha1, sha1_buffer);
    mbedtls_md5_finish(&ctx_md5, md5_buffer);

    return 0;
}

int main(int argc, char **argv) {
    while (1) {
        uint32_t message_len;
        if (fread(&message_len, sizeof(message_len), 1, stdin) != 1) {
            if (feof(stdin)) {
                return 0;
            } else {
                fputs("Failed to read message length from stdin\n", stderr);
                return 1;
            }
        }

        char *json_buffer = malloc(message_len + 1);
        if (json_buffer == NULL) {
            fputs("Cannot allocate memory for message", stderr);
            return 1;
        }

        size_t read = fread(json_buffer, 1, message_len, stdin);
        if (read < message_len) {
            fputs("Failed to read message\n", stderr);
            return 1;
        }

        int status = json_read_object(json_buffer, MESSAGE_SCHEMA, NULL);
        if (status != 0) {
            fprintf(stderr, "Failed to decode SJON: %s\n", json_error_string(status));
            return 1;
        }

        FILE *infile = fopen(path_buf, "rb");
        if (infile == NULL) {
            fprintf(stderr, "Cannot open file \"%s\" for reading\n", path_buf);
            return 1;
        }
        free(json_buffer);

        uint8_t sha1_output[160 / 8];
        uint8_t md5_output[128 / 8];
        if (do_hashing(infile, md5_output, sha1_output)) {
            fputs("Failed to read file for hashing\n", stderr);
            return 1;
        }
        fclose(infile);

        char out_buffer[] = "{\"md5\":\""
            "XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX"
        "\",\"sha1\":\""
            "XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX"
        "\"}";

        char *p = out_buffer + 8;
        for (uint8_t i = 0; i < sizeof(md5_output); i++) {
            sprintf(p, "%02x", (int)md5_output[i]);
            p += 2;
        }
        *p = '"';

        p = out_buffer + 8 + 32 + 10;
        for (uint8_t i = 0; i < sizeof(sha1_output); i++) {
            sprintf(p, "%02x", (int)sha1_output[i]);
            p += 2;
        }
        *p = '"';

        uint32_t out_len = sizeof(out_buffer) - 1;
        fwrite(&out_len, sizeof(out_len), 1, stdout);
        fwrite(out_buffer, sizeof(out_buffer) - 1, 1, stdout);
        fflush(stdout);
    }
    return 0;
}
