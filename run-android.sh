#!/bin/bash
export ANDROID_HOME="$HOME/Library/Android/sdk"
export JAVA_HOME="/Applications/Android Studio.app/Contents/jbr/Contents/Home"

# Check if emulator is running
if ! $ANDROID_HOME/platform-tools/adb devices | grep -q "emulator"; then
    echo "Starting emulator..."
    $ANDROID_HOME/emulator/emulator -avd Pixel_7 &
    echo "Waiting for boot..."
    $ANDROID_HOME/platform-tools/adb wait-for-device
    while [ "$($ANDROID_HOME/platform-tools/adb shell getprop sys.boot_completed 2>/dev/null | tr -d '\r')" != "1" ]; do
        sleep 2
    done
    echo "Emulator ready!"
fi

echo "Building & installing..."
dotnet build -f net10.0-android -t:Install -p:AdbTarget=-e

echo "Launching PlateUp..."
$ANDROID_HOME/platform-tools/adb -e shell am start -n com.companyname.plateup/crc64938383cee64b39b0.MainActivity

echo "Done! App is running."
