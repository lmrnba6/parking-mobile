#!/usr/bin/env node

const fs = require('fs');
const promisify = require("promisify-node");
const fse = promisify(require("fs-extra"));
const inquirer = require('inquirer'); // https://github.com/SBoudrias/Inquirer.js
const clear = require('clear');
const chalk = require('chalk');
const figlet = require('figlet');
const path = require('path');
const xml2js = require('xml2js');
const semver = require('semver');
const cwd = process.cwd();//project directory
const scriptPath = __dirname;//scritps directory
const git = require("nodegit");
const {exec, spawn} = require('child_process');
const os = require("os");
const AWS = require('aws-sdk');
const mime = require('mime-types');

let hostname = os.hostname();

const CONFIG = {
  cordova: {
    configXMLFile: 'config.xml'
  },
  app: {
    buildJsonFile: 'src/assets/build.json',
    buildDir: 'www',
    sourcesMapsDir: 'www/build'
  },
  git: {
    newVersionTagPrefix: 'New version number'
  },
  s3: {
    bucket: 'xxxx.ca',
    accessKey: 'xxxxxxxxxxxx',
    secretKey: 'xxxxxxxxxxxxxxxxxxxxx'
  },
  android: {
    keystore: 'google-play-signing.jks',
    keyname: 'app',
    apkPostBuild: 'platforms/android/build/outputs/apk/release/android-release-unsigned.apk',
    apkUnsigned: 'android-release-unsigned.apk',
    apkFinal: 'ekrini-parking.apk'
  }
};

AWS.config.update({accessKeyId: CONFIG.s3.accessKey, secretAccessKey: CONFIG.s3.secretKey});

async function readConfigXML() {
  return new Promise((resolve, reject) => {
    fs.readFile(CONFIG.cordova.configXMLFile, 'utf8', function (err, data) {
      if (err) {
        console.log(err);
        reject(err);
      }
      xml2js.parseString(data, function (err, result) {
        if (err) {
          console.log(err);
          reject(err);
        }
        resolve(result);
      });
    });
  });
}

async function writeVersionNumberInBuildJSON(newVersionNumner) {
  return new Promise((resolve, reject) => {
    fs.readFile(CONFIG.app.buildJsonFile, 'utf8', function (err, data) {
      if (err) {
        console.log(err);
        reject(err);
      }
      let obj = JSON.parse(data);
      if (!obj) {
        obj = {};
      }
      obj.version = newVersionNumner;
      fs.writeFile(CONFIG.app.buildJsonFile, JSON.stringify(obj), function (err) {
        if (err) {
          console.log(err);
          reject(err);
        }
        resolve(newVersionNumner);
      });
    });
  });
}

async function writeVersionNumberInConfigXML(newVersionNumner) {
  return new Promise((resolve, reject) => {
    readConfigXML()
      .then(config => {
        config['widget']['$']['version'] = newVersionNumner;
        let builder = new xml2js.Builder();
        let xml = builder.buildObject(config);
        // Write config.xml
        fs.writeFile(CONFIG.cordova.configXMLFile, xml, function (err) {
          if (err) {
            console.log(err);
            reject(err);
          }
          resolve(newVersionNumner);
        });
      });
  });
}

async function readCurrentVersionNumber() {
  return readConfigXML()
    .then(config => {
      return config['widget']['$']['version'];
    });
}

async function chooseIncrement(currentVersion) {
  return inquirer.prompt([{
    type: 'list',
    name: 'increment_type',
    message: 'Incrementing version number, which part would you like to increment ?',
    default: 0,
    choices: ['patch', 'minor', 'major', 'nothing']
  }]).then(
    resIncrementType => {
      let incrementedVersion = currentVersion;
      if (resIncrementType.increment_type !== 'nothing') {
        incrementedVersion = semver.inc(currentVersion, resIncrementType.increment_type);
      }
      console.log(chalk`New version will be {green.bold ${incrementedVersion}}.`);
      return inquirer.prompt([{
        type: 'confirm',
        name: 'increment_confirm',
        message: 'Do you accept the new version number ?'
      }]).then(
        resIncrementConfirm => {
          if (resIncrementConfirm.increment_confirm) {
            return {incrementType: resIncrementType.increment_type, newVersion: incrementedVersion};
          } else {
            return null;
          }
        }
      );
    }
  );
}

async function askForSourcesProcessing() {
  return inquirer.prompt([{
    type: 'confirm',
    name: 'sources_upload',
    message: 'Do you want to upload the sources to Sentry and Ionic ?',
    default: true
  }]).then(
    sourcesUploadConfirm => {
      if (sourcesUploadConfirm) {
        return sourcesUploadConfirm.sources_upload;
      }
    }
  );
}

async function openAndRefreshRepo() {
  var repo;
  var index;
  return git.Repository.open(path.resolve(cwd, ".git"))
    .then(function (repoResult) {
      repo = repoResult;
      // return fse.ensureDir(path.join(repo.workdir(), directoryName));
    })
    .then(function (repoResult) {
      return repo.refreshIndex();
    })
    .then(function (indexResult) {
      index = indexResult;
      return {repo: repo, index: index};
    });
}

async function confirmNotOnMaster() {
  return inquirer.prompt([{
    type: 'confirm',
    name: 'confirm',
    message: 'You are not currently on branch master, are your sure to continue ?',
    default: false
  }]).then(
    confirm => {
      return confirm.confirm;
    }
  );
}

async function getCurrentBranch(repoInfo) {
  return repoInfo.repo.getCurrentBranch();
}

async function addTag(repoInfo, version, commit) {
  return repoInfo.repo.createTag(commit, version, CONFIG.git.newVersionTagPrefix)
    .catch(err => console.log("Tag failed : ", err));
}

async function addAndCommit(repoInfo, version) {
  // var index;
  var oid;

  return repoInfo.index.addByPath(CONFIG.cordova.configXMLFile)
    .then(function () {
      return repoInfo.index.addByPath(CONFIG.app.buildJsonFile);
    })
    .then(function () {
      // this will write both files to the index
      return repoInfo.index.write();
    })
    .then(function () {
      return repoInfo.index.writeTree();
    })
    .then(function (oidResult) {
      oid = oidResult;
      return git.Reference.nameToId(repoInfo.repo, "HEAD");
    })
    .then(function (head) {
      return repoInfo.repo.getCommit(head);
    })
    .then(function (parent) {
      let signature = git.Signature.default(repoInfo.repo);
      return repoInfo.repo.createCommit("HEAD", signature, signature, `${CONFIG.git.newVersionTagPrefix} : ${version} (from  ${hostname})`, oid, [parent]);
    });
}

async function checkForNonCommittedChanges(repoInfo) {
  return repoInfo.repo.getStatus()
    .then(function (statuses) {
      function statusToText(status) {
        let words = [];
        if (status.isNew()) {
          words.push("NEW");
        }
        if (status.isModified()) {
          words.push("MODIFIED");
        }
        if (status.isTypechange()) {
          words.push("TYPECHANGE");
        }
        if (status.isRenamed()) {
          words.push("RENAMED");
        }
        if (status.isIgnored()) {
          words.push("IGNORED");
        }

        return words.join(" ");
      }

      statuses.forEach(function (file) {
        console.log(chalk`${file.path()} {red.bold ${statusToText(file)}}.`);
      });

      return (statuses && statuses.length > 0);
    });
}

async function push(repoInfo, reference) {
  //TODO : doesn't work
  let remote;
  return repoInfo.repo.getRemote('origin')
    .then(remoteResult => {
      console.log('remote Loaded');
      remote = remoteResult;
      console.log('Remote Configured');
      return remote.connect(git.Enums.DIRECTION.PUSH, {
        callbacks: {
          credentials: function (url, userName) {
            console.log("Requesting creds");
            return git.Cred.sshKeyFromAgent(userName);
          }
        }
      });
    })
    .then(function () {
      console.log('Remote Connected?', remote.connected());

      return remote.push(
        [reference + ":" + reference],
        {
          callbacks: {
            credentials: function (url, userName) {
              console.log("Requesting creds");
              return git.Cred.sshKeyFromAgent(userName);
            }
          }
        });

      // repoInfo.repo.defaultSignature(),
      //   "Push to master"
    }).then(function () {
      console.log('remote Pushed!')
    })
    .catch(function (reason) {
      console.log(reason);
    });
}

async function getDesiredPlatform() {
  return inquirer.prompt([{
    type: 'checkbox',
    name: 'build_platform',
    message: 'For which platform do you want to build the app ?',
    choices: ['android', 'ios']
  }]);
}


async function getDesiredBuild() {
  return inquirer.prompt([{
    type: 'list',
    name: 'build_type',
    message: 'Which release do you want to perform ?',
    default: 0,
    choices: ['ionic-deploy', 'native-deploy']
  }]).then(
    result => {
      return result.build_type;
    }
  );
}

async function createSentryRelease(version) {
  let cmd = 'sentry-cli';
  let cmdParams = ['--auth-token', CONFIG.sentry.authToken, 'releases', 'new', version];

  return spawnProcess(cmd, cmdParams, 'sentry create release');
}

async function createLogrocketRelease(version) {
  let cmd = 'logrocket';
  let cmdParams = ['release', version, '-k', CONFIG.logrocket.apikey];

  return spawnProcess(cmd, cmdParams, 'logrocket create release');
}

async function uploadSourceMapsToIonic(version) {
  let cmd = 'ionic';
  let cmdParams = ['monitoring', 'syncmaps', '--no-interactive'];

  return spawnProcess(cmd, cmdParams, 'ionic source maps upload');
}

async function uploadSourceMapsToSentry(version) {
  let cmd = 'sentry-cli';
  let cmdParams = ['--auth-token', CONFIG.sentry.authToken, 'releases', 'files', version, 'upload-sourcemaps', CONFIG.app.sourcesMapsDir, '--url-prefix', '/'];

  return spawnProcess(cmd, cmdParams, 'sentry source maps upload');
}

async function uploadSourceMapsToLogrocket(version) {
  let cmd = 'logrocket';
  let cmdParams = ['-r', version, 'upload', CONFIG.app.sourcesMapsDir, '-k', CONFIG.logrocket.apikey];

  return spawnProcess(cmd, cmdParams, 'logrocket source maps upload');
}

async function finalizeSentryRelease(version) {
  let cmd = 'sentry-cli';
  let cmdParams = ['--auth-token', CONFIG.sentry.authToken, 'releases', 'finalize', version];

  return spawnProcess(cmd, cmdParams, 'sentry finalize release');
}

async function ionicBuild() {
  let cmd = 'ionic';
  let cmdParams = ['build', '--prod'];

  return spawnProcess(cmd, cmdParams, 'ionic build');
}

async function nativeBuild(platform) {
  let cmd = 'ionic';
  let cmdParams = ['cordova', 'build', platform, '--release', '--prod'];

  return spawnProcess(cmd, cmdParams, 'native build ' + platform);
}

async function getKeystorePassword() {
  return inquirer.prompt([{
    type: 'password',
    name: 'keystore_password',
    message: 'What is the keystore password ?'
  }]).then(
    result => {
      return result.keystore_password;
    }
  );
}

async function getKeyPassword() {
  return inquirer.prompt([{
    type: 'password',
    name: 'key_password',
    message: `What is the key (${CONFIG.android.keyname}) password ?`
  }]).then(
    result => {
      return result.key_password;
    }
  );
}

async function jarSign() {
  let keystorePassword = await getKeystorePassword();
  let keyPassword = await getKeyPassword();

  let cmd = 'jarsigner';
  let cmdParams = ['-verbose', '-sigalg', 'SHA1withRSA', '-digestalg', 'SHA1', '-keystore', CONFIG.android.keystore, '-storepass', keystorePassword, '-keypass', keyPassword, CONFIG.android.apkUnsigned, CONFIG.android.keyname];

  return spawnProcess(cmd, cmdParams, 'jarsign');
}

async function zipAlign() {
  let cmd = 'zipalign';
  let cmdParams = ['-v', '4', CONFIG.android.apkUnsigned, CONFIG.android.apkFinal];

  return spawnProcess(cmd, cmdParams, 'zipalign');
}

async function spawnProcess(cmd, cmdParams, processName) {
  console.log(chalk`[${processName}] : {green.bold ${cmd} ${cmdParams.join(' ')}}`);

  return new Promise((resolve, reject) => {
    let commandRunner = spawn(cmd, cmdParams);

    commandRunner.stdout.on('data', function (data) {
      console.log(chalk`{green.bold [${processName}]} ${data.toString()}`);
    });

    commandRunner.stderr.on('data', function (data) {
      console.log(chalk`{green.bold [${processName}]} ${data.toString()}`);
    });

    commandRunner.on('exit', function (code) {
      console.log(chalk`{green.bold [${processName}]} complete!`);
      let codeStr = code.toString();
      if (codeStr !== '0') {
        reject(code);
      } else {
        resolve(code)
      }
    });
  });
}

function uploadFileToS3(filePath, s3Client, processName) {
  return new Promise((resolve, reject) => {
    fs.readFile(filePath, (error, fileContent) => {
      if (error) {
        throw error;
      }

      let param = {
        Bucket: CONFIG.s3.bucket,
        Key: filePath,
        Body: fileContent,
        CacheControl: 'max-age=3600'
      };

      let mimeType = mime.lookup(filePath);

      if (mimeType) {
        param.ContentType = mimeType;
      }

      s3Client.putObject(param, (err) => {
        if (!err) {
          console.log(chalk`{green.bold [${processName}]} File '${filePath}' has been uploaded with mime type ${mimeType}.`);
          resolve();
        } else {
          console.log(chalk`{red.bold [${processName}] Unbale to upload file '${filePath}'.}`, err);
          reject('Unable to upload files to S3')
        }
      });

    });
  });
}

function readDirectoryForUploadToS3(directory, s3Client, processName) {
  return new Promise((resolve, reject) => {
    let promises = [];
    fs.readdir(directory, (err, files) => {
      if (!files || files.length === 0) {
        console.log(chalk.red(`Directory ${directory} is emtpy or does not exist.`));
        reject('Unable to find build folder');
      }
      for (const fileName of files) {
        const filePath = path.join(directory, fileName);
        if (fs.lstatSync(filePath).isDirectory()) {
          promises.push(readDirectoryForUploadToS3(filePath, s3Client, processName));
        } else {
          promises.push(uploadFileToS3(filePath, s3Client, processName));
        }
      }
      Promise.all(promises)
        .then(() => {
          resolve();
        }, error => {
          console.log(chalk`{red.bold [${processName}] Unbale failed.}`, error);
          reject('Upload failed');
        });
    });
  });
}

async function uploadToS3(directory) {
  let processName = 'S3-upload';
  console.log(chalk`[${processName}] : {green.bold Uploading ${directory} to S3 bucket ${CONFIG.s3.bucket}}`);

  let oldWorkingDir = process.cwd();

  try {
    process.chdir(directory);
    console.log(chalk`[${processName}] : {green.bold Changing directory: ${process.cwd()}}`);
  } catch (err) {
    console.log('chdir: ' + err);
  }
  const s3 = new AWS.S3();
  return readDirectoryForUploadToS3('.', s3, processName)
    .then(() => {
      try {
        process.chdir(oldWorkingDir);
        console.log(chalk`[${processName}] : {green.bold Changing directory: ${process.cwd()}}`);
      } catch (err) {
        console.log('chdir: ' + err);
      }
    });
}

async function execute() {
  clear();
  console.log(
    chalk.yellow(
      figlet.textSync('Mobile-app builder.', {horizontalLayout: 'full'})
    )
  );

  let repoInfo = await openAndRefreshRepo();
  // repoInfo.repo;
  // repoInfo.index;
  let currentBranchReference = await getCurrentBranch(repoInfo);
  let currentBranchName = currentBranchReference.name();

  console.log(chalk`Current branch is {green.bold ${currentBranchName}}.`);


  if (currentBranchName !== 'refs/heads/master') {
    console.log(chalk.red("Current branch is not master."));
    let confirmCurrentBranch = await confirmNotOnMaster();
    if (!confirmCurrentBranch) {
      console.log(chalk.red("Please checkout the correct branch and re-run the script."));
      process.exit();
    }
  }

  let hasNonCommittedChanges = await checkForNonCommittedChanges(repoInfo);

  if (hasNonCommittedChanges) {
    console.log(chalk.red("Working copy has non committed changes. Please commit/discard all your changes to continue."));
    process.exit();
  }

  let versionNumber = await readCurrentVersionNumber();
  console.log(chalk`New mobile-app build. Current app version is {green.bold ${versionNumber}}.`);

  let increment = null;
  while (!increment) {
    increment = await chooseIncrement(versionNumber);
  }

  let writeResultConfigXML = await writeVersionNumberInConfigXML(increment.newVersion);
  let writeResultBuildJSON = await writeVersionNumberInBuildJSON(increment.newVersion);

  //TODO : move scm stuff to the end ?
  let commitResult = await addAndCommit(repoInfo, increment.newVersion);
  console.log(chalk`New commit : {green.bold ${commitResult}}.`);
  let tagResult = await addTag(repoInfo, increment.newVersion, commitResult);

  // let pushResult = await push(repoInfo, currentBranchName);
  // console.log(chalk`Push result : {green.bold ${pushResult}}.`);
  console.log(chalk`Dont'forget to push ! : git push origin master`);

  let uploadSources = true;

  if (await askForSourcesProcessing()) {
    uploadSources = true;
  } else {
    uploadSources = false;
  }

  if (uploadSources) {
    let sentryNewRelease = await createSentryRelease(increment.newVersion);
    let logrocketNewRelease = await createLogrocketRelease(increment.newVersion);
  }

  let releaseType = await getDesiredBuild();
  console.log(chalk`Release is {green.bold ${releaseType}}.`);

  // Building ionic
  let exitCodeIonicBuild = await ionicBuild();
  console.log(chalk`Ionic deploy completed with code {green.bold ${exitCodeIonicBuild}}`);

  if (uploadSources) {
    console.log(chalk`Uploading source maps to sentry, ionic, logrocket and S3`);
    let sentryFinalizeRelease = await finalizeSentryRelease(increment.newVersion);
    let sentryUploadSourceMaps = await uploadSourceMapsToSentry(increment.newVersion);
    let ionicUploadSourceMaps = await uploadSourceMapsToIonic(increment.newVersion);
    let logrocketUploadSourceMaps = await uploadSourceMapsToLogrocket(increment.newVersion);
    let s3Upload = await uploadToS3(CONFIG.app.buildDir);
  }

  if (releaseType === 'ionic-deploy') {
    console.log(chalk`Ionic deploy build, executing {green.bold ionic build --prod}`);
    console.log(chalk`To deploy via Ionic, push the commits to the production branch on the 'ionic' origin. Don't forget to set up the Versionning for the new build.`);
  } else if (releaseType === 'native-deploy') {
    let desiredPlatform = await getDesiredPlatform();
    console.log(desiredPlatform);
    for (let i = 0; i < desiredPlatform.build_platform.length; i++) {
      let platform = desiredPlatform.build_platform[i];
      console.log(chalk`###########################################################`);
      console.log(chalk`Ionic native build for {green.bold ${platform}}`);
      let exitCodeIonicNativeBuild = await nativeBuild(platform);
      console.log(chalk`Ionic native build completed with code {green.bold ${exitCodeIonicNativeBuild}}`);
      if (desiredPlatform.build_platform[i] === 'android') {
        try {
          fse.removeSync(CONFIG.android.apkUnsigned);
        } catch (error) {
          console.error("Error deleting file : " + CONFIG.android.apkUnsigned, error);
        }

        try {
          fse.removeSync(CONFIG.android.apkFinal);
        } catch (error) {
          console.error("Error deleting file : " + CONFIG.android.apkFinal, error);
        }

        try {
          fse.copySync(CONFIG.android.apkPostBuild, CONFIG.android.apkUnsigned);
        } catch (error) {
          console.error("Error copying file : " + CONFIG.android.apkPostBuild + " to " + CONFIG.android.apkUnsigned, error);
        }

        // console.log(chalk`Please sign the jar : {green.bold jarsigner -verbose -sigalg SHA1withRSA -digestalg SHA1 -keystore google-play-signing.jks android-release-unsigned.apk app}`);
        let jarSignResult = await jarSign();

        // console.log(chalk`Please zip align the jar : {green.bold zipalign -v 4 android-release-unsigned.apk android-release.apk}`);
        let zipAlignResult = await zipAlign();

        console.log(chalk`Android build complete, artefact is : {green.bold ${CONFIG.android.apkFinal}}`);

      } else if (desiredPlatform.build_platform[i] === 'ios') {
        console.log(chalk`Next upload the project to the itunes store with XCode`);
        // TODO : xcode cli upload
      }
    }
  }
  console.log(chalk`{green.bold Done !}`);
}

execute();
