from flask import Flask, request, jsonify
from flask_cors import CORS
import numpy as np
from PIL import Image
import os
from tensorflow.keras.models import load_model
import cv2

app = Flask(__name__)
CORS(app)

model = load_model('model.h5')
check_disease_model = load_model('check_disease.h5')

# Configure image upload directory
WHEAT_IMAGE = os.path.join(app.root_path, "static", "wheat")
ALLOWED_EXTENSIONS = set(['png', 'jpg', 'jpeg'])
app.config['WHEAT_IMAGE'] = WHEAT_IMAGE

# Helper function to check allowed file extensions
def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

@app.route('/', methods=['GET'])
def hello():
    return 'Hello, World!'

@app.route('/prediction', methods=['POST'])
def prediction():
    if 'image' in request.files:
        # Process the image as needed
        img = request.files['image']
        
        # Save the image to the upload directory
        if img and allowed_file(img.filename):
            img.save(os.path.join(app.config['WHEAT_IMAGE'], "see.jpg"))
        else:
            return 'Invalid file format. Only PNG, JPG, and JPEG files are allowed.'

        # Load and preprocess the image
        img_path = os.path.join(app.config['WHEAT_IMAGE'], "see.jpg")
        img = Image.open(img_path).convert('RGB')
        img = img.resize((299, 299))  # Resize the image to match the input size expected by the model
        img_array = np.array(img)
        img_tensor = np.expand_dims(img_array, axis=0)
        img_tensor = img_tensor / 255.0
        
        # Perform prediction using the model
        checkDisease = check_disease_model.predict(img_tensor)
        checkDisease_classes_names = ['Disease', 'Non Disase']
        disase_pred_class = checkDisease_classes_names[np.argmax(checkDisease)]
        if disase_pred_class == 'Non Disase':
            return {   'succeeded': False,"message": "Please enter a disase Picture"}
        prediction = model.predict(img_tensor)
        print(prediction)
        class_names = ["Healthy", "Leaf Rust", "Stem Rust", "Yellow Rust"]
        pred_class = class_names[np.argmax(prediction)]
        pred_prob = np.max(prediction)
        result = {
            'succeeded': True,
            'prediction': {
                'class': pred_class,
                'probability': float(pred_prob)
            }
        }
        return jsonify(result)
    else:
        return 'No image found in request'

if __name__ == '__main__':
    app.run(debug=True)
