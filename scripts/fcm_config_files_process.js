#!/usr/bin/env node
'use strict';

var fs = require('fs'),
    path = require('path');

var PROJECT_ROOT = path.resolve(path.join(__dirname, '../', '../', '../')),
    IOS_PLATFORM_ROOT = path.resolve(PROJECT_ROOT, 'platforms', 'ios'),
    ANDROID_PLATFORM_ROOT = path.resolve(PROJECT_ROOT, 'platforms', 'android');

function getValue(config, name) {
    var value = config.match(new RegExp('<' + name + '>(.*?)</' + name + '>', 'i'));
    if (value && value[1]) {
        return value[1]
    } else {
        return null
    }
}

function fileExists(path) {
    try {
        return fs.statSync(path).isFile();
    } catch (e) {
        return false;
    }
}

function directoryExists(path) {
    try {
        return fs.statSync(path).isDirectory();
    } catch (e) {
        return false;
    }
}

var config = fs.readFileSync(path.resolve(PROJECT_ROOT, 'config.xml')).toString();
var name = getValue(config, 'name');

if (directoryExists(IOS_PLATFORM_ROOT)) {

    var IOS_CONFIG_PATH = path.resolve(PROJECT_ROOT, 'GoogleService-Info.plist');

    if (fileExists(IOS_CONFIG_PATH)) {
        try {
            var IOS_CONFIG_CONTENTS = fs.readFileSync(path).toString();
            fs.writeFileSync(path.resolve(IOS_PLATFORM_ROOT, name, 'Resources', 'GoogleService-Info.plist'), IOS_CONFIG_CONTENTS)
        } catch (err) {
            process.stdout.write(err);
        }

    } else {
        throw new Error('cordova-plugin-fcm: You have installed platform ios but file \'GoogleService-Info.plist\' was not found in your Cordova project root folder.')
    }
}

if (directoryExists(ANDROID_PLATFORM_ROOT)) {
    var ANDROID_CONFIG_PATH = path.resolve(PROJECT_ROOT, 'google-services.json');

    if (fileExists(ANDROID_CONFIG_PATH)) {
        try {
            var ANDROID_CONFIG_CONTENTS = fs.readFileSync().toString();
            fs.writeFileSync('platforms/android/google-services.json', ANDROID_CONFIG_CONTENTS);

            var ANDROID_CONFIG_JSON = require(ANDROID_CONFIG_PATH);
            var strings = fs.readFileSync('platforms/android/res/values/strings.xml').toString();

            // strip non-default value
            strings = strings.replace(new RegExp('<string name=\'google_app_id\'>([^\@<]+?)</string>', 'i'), '');

            // strip non-default value
            strings = strings.replace(new RegExp('<string name=\'google_api_key\'>([^\@<]+?)</string>', 'i'), '');

            // strip empty lines
            strings = strings.replace(new RegExp('(\r\n|\n|\r)[ \t]*(\r\n|\n|\r)', 'gm'), '$1');

            // replace the default value
            strings = strings.replace(new RegExp('<string name=\'google_app_id\'>([^<]+?)</string>', 'i'), '<string name=\'google_app_id\'>' + ANDROID_CONFIG_JSON.client[0].client_info.mobilesdk_app_id + '</string>');

            // replace the default value
            strings = strings.replace(new RegExp('<string name=\'google_api_key\'>([^<]+?)</string>', 'i'), '<string name=\'google_api_key\'>' + ANDROID_CONFIG_JSON.client[0].api_key[0].current_key + '</string>');

            fs.writeFileSync('platforms/android/res/values/strings.xml', strings);
        } catch (err) {
            process.stdout.write(err);
        }

    } else {
        throw new Error('cordova-plugin-fcm: You have installed platform android but file \'google-services.json\' was not found in your Cordova project root folder.')
    }
}
