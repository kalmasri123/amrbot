const textToSpeech = require('@google-cloud/text-to-speech');
process.env.GOOGLE_APPLICATION_CREDENTIALS = "credentials.txt"
// process.env.GOOGLE_CLOUD_PROJECT = "nice-opus-311020"
// Import other required libraries
const fs = require('fs');
const util = require('util');
// Creates a client
const client = new textToSpeech.TextToSpeechClient();
async function textToBuffer(text) {
    // Construct the request
    const request = {
        input: { text: text },
        // Select the language and SSML voice gender (optional)
        voice: { languageCode: 'en-US', ssmlGender: 'MALE' },

        // select the type of audio encoding
        audioConfig: { audioEncoding: 'MP3', pitch: -5 },
    };

    // Performs the text-to-speech request
    const [response] = await client.synthesizeSpeech(request);
    console.log(response)
      const writeFile = util.promisify(fs.writeFile);
  await writeFile('output.mp3', response.audioContent, 'binary');
    // Write the binary audio content to a local file
    return response;

}
module.exports = textToBuffer;

