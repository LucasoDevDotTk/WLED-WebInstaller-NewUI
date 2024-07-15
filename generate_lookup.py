"""
EXAMPLE OF PARTS WHEN FILENAME SPLIT AT "_"
['WLED', '0.15.0-b4', 'ESP8266', 'N.bin']

WANTED JSON FORMAT:
{
    "0.13.1": {
        "beta": true,
        "builds": [
            {
                "chipFamily": "ESP32",
                "type": "N",
                "path": "bin/WLED_VERSIONS/WLED_0.13.1_ESP32_N.bin"
            }
        ]
    },

    "0.14.1": {
        "beta": true,
        "builds": [
            {
                "chipFamily": "ESP32",
                "type": "N",
                "path": "bin/WLED_VERSIONS/WLED_0.13.1_ESP32_N.bin"
            }
        ]
    }
}

"""

import os
import json

VERSIONS_BIN_DIR = './bin/WLED_VERSIONS'

def generate_lookup(VERSIONS_BIN_DIR):
    total_files = 0
    json_version_data = {}
    # Loop through all the files in the VERSIONS_BIN_DIR
    for filename in os.listdir(VERSIONS_BIN_DIR):
        parts = filename.replace('.bin', '')
        parts = parts.split('_')
        total_files += 1

        if 'b' in parts[1]:
            beta = True
        else:
            beta = False

        # Check if the filename has 5 parts, if it does, the last part is the file system size
        if len(parts) == 5:
            file_system_size = parts[4]
        else:
            file_system_size = None

        # Check if json_version_data already contains the same version, version is in parts[1]
        if parts[1] in json_version_data:
            # Add the build to the version
            json_version_data[parts[1]]["builds"].append({
                "chipFamily": parts[2],
                "type": parts[3],
                "path": f"bin/WLED_VERSIONS/{filename}",
                "file_system_size": file_system_size
            })
        else:
            # Add the version to json_version_data
            json_version_data[parts[1]] = {
                "beta": beta,
                "builds": [
                    {
                        "chipFamily": parts[2],
                        "type": parts[3][0],
                        "path": f"bin/WLED_VERSIONS/{filename}",
                        "file_system_size": file_system_size
                    }
                ]
            }

    return json_version_data, total_files

def write_json(json_version_data):
    with open('version_lookup.json', 'w') as f:
        json.dump(json_version_data, f, indent=4)


json_version_data, total_files = generate_lookup(VERSIONS_BIN_DIR)
write_json(json_version_data)
print(f"Total files: {total_files}")
print("JSON data written to version_lookup.json")