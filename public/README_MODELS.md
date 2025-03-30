
# Face Recognition Models

For this face recognition system to work properly, you'll need to download face-api.js models and place them in the `public/models` directory.

## Instructions

1. Create a `models` folder in the `public` directory of your project.
2. Download the model files from https://github.com/vladmandic/face-api/tree/master/model or directly from the links below:
   - https://github.com/vladmandic/face-api/raw/master/model/ssd_mobilenetv1_model-weights_manifest.json
   - https://github.com/vladmandic/face-api/raw/master/model/face_landmark_68_model-weights_manifest.json
   - https://github.com/vladmandic/face-api/raw/master/model/face_recognition_model-weights_manifest.json
   - All the .bin files associated with the manifests above.
3. Place all these files in the `public/models` directory.

This ensures that the face detection, landmark detection, and face recognition features will work as expected.
