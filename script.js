const ESP32BootloaderPath = "bin/bootloaders/esp32_bootloader_v4.bin";
const ESP32C3BootloaderPath = "bin/bootloaders/esp32-c3_bootloader_v2.bin";
const ESP32S3BootloaderPath = "bin/bootloaders/esp32-s3_bootloader_v2.bin";
const ESP32S2BootloaderPath = "bin/bootloaders/esp32-s2_bootloader_v2.bin";

const ESP32C3_4MB_part = "bin/partitions/partitions_c3_4m.bin";
const ESP32S2_4MB_part = "bin/partitions/partitions_s2_4m.bin";
const ESP32S3_8MB_part = "bin/partitions/partitions_s3_8m.bin";

function setManifest() {
    var sel = document.getElementById("ver");

    // Get which version is selected
    var opt = sel.options[sel.selectedIndex];

    // Get the manifest from the selected version
    var optManifest = opt.dataset.manifest;
    optManifest = JSON.parse(optManifest);

    // Go through the builds and set ethernet, audio, and plain to true if available
    var ethernetCompatible = false;
    var audioCompatible = false;
    var plainCompatible = false;

    for (var i in optManifest.builds) {
        build = optManifest.builds[i];

        if (build.type == "E") {
            ethernetCompatible = true;
            me = build.path;
        }
        if (build.type == "A") {
            audioCompatible = true;
            ma = build.path;
        }
        if (build.type == "N") {
            plainCompatible = true;
            mp = build.path;
        }
    }

    //handle ethernet checkbox
    var ethernetSelected = handleCheckbox(ethernetCompatible, "ethernet");
    //handle audioreactive checkbox
    var audioSelected = handleCheckbox(audioCompatible, "audio");
    //handle audioreactive checkbox
    var plainSelected = handleCheckbox(plainCompatible, "normal");

    var version = opt.value;

    var selectedType = null;
    var selectedTypeName = null;

    if (ethernetSelected) {
        selectedType = "E";
        selectedTypeName = "ethernet";
    }
    if (audioSelected) {
        selectedType = "A";
        selectedTypeName = "audio";
    }
    if (plainSelected) {
        selectedType = "N";
        selectedTypeName = "plain";
    }

    var manifest = null;

    // Make a string based manifest for ethernet boards
    if (selectedTypeName == "ethernet") {
        builds = [];
        for (var i in optManifest.builds) {
            if (optManifest.builds[i].type == selectedType) {
                let build = generateBuildManifest(optManifest, i);
                builds.push(build);
            }
        }

        var manifest = {
            name: "WLED",
            version: version + " " + selectedTypeName,
            home_assistant_domain: "wled",
            builds: builds,
        };
    }

    if (selectedTypeName == "audio") {
        builds = [];
        for (var i in optManifest.builds) {
            if (optManifest.builds[i].type == selectedType) {
                let build = generateBuildManifest(optManifest, i);
                builds.push(build);
            }
        }

        var manifest = {
            name: "WLED",
            version: version + " " + selectedTypeName,
            home_assistant_domain: "wled",
            builds: builds,
        };
    }

    if (selectedTypeName == "plain") {
        builds = [];
        for (var i in optManifest.builds) {
            if (optManifest.builds[i].type == selectedType) {
                let build = generateBuildManifest(optManifest, i);
                builds.push(build);
            }
        }

        var manifest = {
            name: "WLED",
            version: version + " " + selectedTypeName,
            home_assistant_domain: "wled",
            builds: builds,
        };
    }

    console.log(JSON.stringify(manifest, null, 2));

    const manifestString = JSON.stringify(manifest);
    const base64Manifest = btoa(manifestString);
    const dataUrl = `data:application/json;base64,${base64Manifest}`;

    console.log(dataUrl);

    document.getElementById("inst").setAttribute("manifest", dataUrl);
    document.getElementById("verstr").textContent = opt.text;
}

function generateBuildManifest(optManifest, optManifestIndex) {
    if (optManifest.builds[optManifestIndex].chipFamily == "ESP32") {
        let esp32BuildManifest = {
            chipFamily: "ESP32",
            parts: [
                {
                    path: new URL(
                        ESP32BootloaderPath,
                        window.location.href
                    ),
                    offset: 0,
                },
                {
                    path: new URL(
                        optManifest.builds[optManifestIndex].path,
                        window.location.href
                    ),
                    offset: 65536,
                },
            ],
        };
        return esp32BuildManifest;
    }

    if (optManifest.builds[optManifestIndex].chipFamily == "ESP32-C3") {
        let esp32C3BuildManifest = {
            chipFamily: "ESP32-C3",
            parts: [
                {"path": new URL(ESP32C3BootloaderPath, window.location.href), "offset": 0},
                {"path:": new URL(optManifest.builds[optManifestIndex].path, window.location.href), "offset": 65536},
            ],
        }
        return esp32C3BuildManifest;
    }

    if (optManifest.builds[optManifestIndex].chipFamily == "ESP32-S2") {
        let esp32S2BuildManifest = {
            chipFamily: "ESP32-S2",
            parts: [
                {"path": new URL(ESP32S2BootloaderPath, window.location.href), "offset": 0},
                {"path": new URL(ESP32S2_4MB_part, window.location.href), "offset": 32.768},
                {"path": new URL(optManifest.builds[optManifestIndex].path, window.location.href), "offset": 65536},
            ]
        };
        return esp32S2BuildManifest;
    }

    if (optManifest.builds[optManifestIndex].chipFamily == "ESP32-S3") {
        let esp32S3BuildManifest = {
            chipFamily: "ESP32-S3",
            parts: [
                {"path": new URL(ESP32S3BootloaderPath, window.location.href), "offset": 0},
                {"path": new URL(optManifest.builds[optManifestIndex].path, window.location.href), "offset": 65536},
            ]
        };
        return esp32S3BuildManifest;
    }

    if (optManifest.builds[optManifestIndex].chipFamily == "ESP8266") {
        let esp8266BuildManifest = {
            chipFamily: "ESP8266",
            parts: [
                {
                    path: new URL(
                        optManifest.builds[optManifestIndex].path,
                        window.location.href
                    ),
                    offset: 0,
                },
            ],
        };
        return esp8266BuildManifest;
    }
}

function handleCheckbox(supported, primaryCheckbox) {
    //Check if specified manifest is available

    if (!supported) {
        document.getElementById(primaryCheckbox).disabled = true;
        document
            .getElementById(primaryCheckbox + "_label")
            .classList.remove("radio__label");
        document
            .getElementById(primaryCheckbox + "_label")
            .classList.add("disabled__label");
    } else {
        document
            .getElementById(primaryCheckbox + "_label")
            .classList.remove("disabled__label");
        document
            .getElementById(primaryCheckbox + "_label")
            .classList.add("radio__label");
    }

    if (document.getElementById(primaryCheckbox).checked) {
        return true;
    }
}

function resetCheckboxes() {
    document.getElementById("ethernet").checked = false;
    document.getElementById("ethernet").disabled = false;
    document.getElementById("audio").checked = false;
    document.getElementById("audio").disabled = false;
    document.getElementById("test").checked = false;
    document.getElementById("test").disabled = false;
}

function checkSupported() {
    if (document.getElementById("inst").hasAttribute("install-unsupported"))
        unsupported();
    else setManifest();
}

function unsupported() {
    document.getElementById(
        "flasher"
    ).innerHTML = `Sorry, your browser is not yet supported!<br>
    Please try on Desktop Chrome or Edge.<br>
    Find binary files here:<br>
    <a href="https://github.com/Aircoookie/WLED/releases" target="_blank">
    <button class="btn" slot="activate">GitHub Releases</button>
    </a>`;
}

function showSerialHelp() {
    if (document.getElementById("coms").innerHTML) {
        document.getElementById("coms").innerHTML = "";
    } else {
        document.getElementById("coms").innerHTML = ` 
      <div class="bg-amber-300/30 p-5 rounded-lg flex space-x-3 border border-amber-400/30">

          <svg width="22" height="22" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M25.7581 7.43467C25.106 6.19623 23.3361 6.18643 22.6703 7.41757L6.71662 36.9192C6.08608 38.0852 6.93039 39.5017 8.25595 39.5017H39.7435C41.0606 39.5017 41.9056 38.1017 41.292 36.9363L25.7581 7.43467ZM20.4713 6.22838C22.0881 3.23848 26.3866 3.26227 27.9702 6.26991L43.5041 35.7716C44.9943 38.6017 42.942 42.0017 39.7435 42.0017H8.25595C5.03672 42.0017 2.98626 38.5617 4.51756 35.73L20.4713 6.22838ZM24 15C24.6904 15 25.25 15.5596 25.25 16.25V27.75C25.25 28.4404 24.6904 29 24 29C23.3096 29 22.75 28.4404 22.75 27.75V16.25C22.75 15.5596 23.3096 15 24 15ZM24 35C25.1046 35 26 34.1046 26 33C26 31.8954 25.1046 31 24 31C22.8954 31 22 31.8954 22 33C22 34.1046 22.8954 35 24 35Z"
              fill="#fde047" />
          </svg>

          <div class="text-sm text-amber-200 space-y-1">
            <p>You might be missing the drivers for your board.</p>
            <p>Here are drivers for chips commonly used in ESP boards:</p>
            <p>
              <a class="underline text-blue-300 cursor-pointer"
                href="https://www.silabs.com/developers/usb-to-uart-bridge-vcp-drivers" target="_blank">CP2102 (square
                chip)</a>
            </p>
            <p>
              <a class="underline text-blue-300 cursor-pointer"
                href="https://github.com/nodemcu/nodemcu-devkit/tree/master/Drivers" target="_blank">CH34x
                (rectangular
                chip)</a>
            </p>
            <p>Make sure your USB cable supports data transfer.</p>
          </div>
        </div>`;
    }
}

function showVersionsSelection() {
    // Go through versions_lookup.json, and show the versions in the dropdown
    fetch("version_lookup.json")
        .then((response) => response.json())
        .then((data) => {
            var betaOptgroup = document.getElementById("betaOptgroup");
            var releaseOptgroup = document.getElementById("releaseOptgroup");

            for (var key in data) {
                // Check if release
                if (!data[key].beta) {
                    var opt = document.createElement("option");
                    opt.value = key;
                    opt.text = key;
                    opt.dataset.manifest = JSON.stringify(data[key]);
                    releaseOptgroup.appendChild(opt);
                }
                // Check if beta
                if (data[key].beta) {
                    var opt = document.createElement("option");
                    opt.value = key;
                    opt.text = key;
                    opt.dataset.manifest = JSON.stringify(data[key]);
                    betaOptgroup.appendChild(opt);
                }
            }
        });
}

showVersionsSelection();
