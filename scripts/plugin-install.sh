#!/usr/bin/env bash

#FWhen this script is called by ionic/cordova, an argument is passed (working directory), thus nothing is executed
PLUGINS="$@"
if [[ $PLUGINS == /* ]]; then
PLUGINS=
fi

FCM_VERSION=11.6.2
APPCOMPAT_VERSION=27.0.2

IOS_GOOGLE_MAP_KEY=AIzaSyBw9TDCm89wXAvtubAu-r8nGy6pwyHL7rc

ANDROID_GOOGLE_MAP_PRODUCTION_KEY=AIzaSyD1H0PL-DWGtOGvGzYhM3Jl7r_oiUbfUm8
ANDROID_GOOGLE_MAP_DEVELOPMENT_KEY=AIzaSyBLrBTjNQL7gfilRN-M_zbCujg83ZPTzfo
ANDROID_GOOGLE_MAP_KEY=$ANDROID_GOOGLE_MAP_PRODUCTION_KEY

LOCATION_USAGE_MESSAGE="Your current location will be displayed on the map and your location will be send to your order provider if you have the active geotracking feature activated."

LOCATION_ALWAYS_AND_WHEN_IN_USE_USAGE_DESCRIPTION=$LOCATION_USAGE_MESSAGE
LOCATION_ALWAYS_USAGE_DESCRIPTION=$LOCATION_USAGE_MESSAGE
LOCATION_WHEN_IN_USE_USAGE_DESCRIPTION=$LOCATION_USAGE_MESSAGE
MOTION_USAGE_DESCRIPTION="Using the accelerometer increases battery efficiency by intelligently toggling location tracking only when the device is detected to be moving."

if [ -z "$PLUGINS" ] || [[ $PLUGINS = *"cordova-plugin-ionic"* ]]; then
# tag::cordova-plugin-ionic[]
ionic cordova plugin rm cordova-plugin-ionic
ionic cordova plugin add cordova-plugin-ionic --save --variable APP_ID="618826dd" --variable CHANNEL_NAME="Production" --variable UPDATE_METHOD="none" --variable MAX_STORE="2"
# end::cordova-plugin-ionic[]
fi

if [ -z "$PLUGINS" ] || [[ $PLUGINS = *"cordova-background-geolocation"* ]]; then
# tag::cordova-background-geolocation[]
ionic cordova plugin rm cordova-background-geolocation
ionic cordova plugin add local-plugins/cordova-background-geolocation --variable LICENSE="22222332475340a13bc75902176f44ddfc0d09a5d4bc57a3039ae19fe909b9af" --variable LOCATION_ALWAYS_AND_WHEN_IN_USE_USAGE_DESCRIPTION="$LOCATION_ALWAYS_AND_WHEN_IN_USE_USAGE_DESCRIPTION" --variable LOCATION_ALWAYS_USAGE_DESCRIPTION="$LOCATION_ALWAYS_USAGE_DESCRIPTION" --variable LOCATION_WHEN_IN_USE_USAGE_DESCRIPTION="$LOCATION_WHEN_IN_USE_USAGE_DESCRIPTION" --variable MOTION_USAGE_DESCRIPTION="$MOTION_USAGE_DESCRIPTION" --variable BACKGROUND_MODE_LOCATION="<string>location</string>" --variable GOOGLE_API_VERSION=$FCM_VERSION --variable APPCOMPAT_VERSION=$APPCOMPAT_VERSION
# end::cordova-background-geolocation[]
fi

if [ -z "$PLUGINS" ] || [[ $PLUGINS = *"cordova-android-support-gradle-release"* ]]; then
# tag::cordova-android-support-gradle-release[]
ionic cordova plugin rm cordova-android-support-gradle-release &&
ionic cordova plugin add cordova-android-support-gradle-release@1.4.3 --variable ANDROID_SUPPORT_VERSION="26.+"
# end::cordova-android-support-gradle-release[]
fi

if [ -z "$PLUGINS" ] || [[ $PLUGINS = *"phonegap-plugin-push"* ]]; then
# tag::phonegap-plugin-push[]
ionic cordova plugin rm phonegap-plugin-push
ionic cordova plugin add phonegap-plugin-push --variable FCM_VERSION=$FCM_VERSION
# end::phonegap-plugin-push[]
fi

if [ -z "$PLUGINS" ] || [[ $PLUGINS = *"cordova-plugin-googlemaps"* ]]; then
# tag::cordova-plugin-googlemaps[]
ionic cordova plugin rm cordova-plugin-googlemaps
ionic cordova plugin add cordova-plugin-googlemaps@2.2.9 --variable GOOGLE_API_VERSION=$FCM_VERSION --variable APPCOMPAT_VERSION=$APPCOMPAT_VERSION --variable API_KEY_FOR_ANDROID="$ANDROID_GOOGLE_MAP_KEY" --variable API_KEY_FOR_IOS="$IOS_GOOGLE_MAP_KEY" --variable PLAY_SERVICES_VERSION=$FCM_VERSION --variable LOCATION_WHEN_IN_USE_DESCRIPTION="$LOCATION_WHEN_IN_USE_USAGE_DESCRIPTION" --variable LOCATION_ALWAYS_USAGE_DESCRIPTION="$LOCATION_ALWAYS_USAGE_DESCRIPTION"
# end::cordova-plugin-googlemaps[]
fi
