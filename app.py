from flask import Flask, request, jsonify, render_template

import json
from torchvision import transforms
import torch.nn as nn
from torchvision import models
import numpy as np
from PIL import Image
import torch



flask_app = Flask(__name__)


with open("enfermedades_citricos.json", "r", encoding="utf-8") as archivo:
    enfermedades = json.load(archivo)


transform = transforms.Compose([
    transforms.Resize((256, 256)),
    transforms.CenterCrop(224),
    transforms.ToTensor(),
    transforms.Normalize(
        mean=[0.485, 0.456, 0.406],
        std=[0.229, 0.224, 0.225]
    )
])

class MobileNetV3Small(nn.Module):
    def __init__(self, num_classes=2, pretrained=True, freeze_features=True):
        super(MobileNetV3Small, self).__init__()
        
        # Cargar MobileNet-V3 Small preentrenado
        if pretrained:
            self.backbone = models.mobilenet_v3_small(
                weights=models.MobileNet_V3_Small_Weights.IMAGENET1K_V1
            )
        else:
            self.backbone = models.mobilenet_v3_small(weights=None)
        
        # Congelar features
        if freeze_features:
            for param in self.backbone.features.parameters():
                param.requires_grad = True
        
        # Reemplazar clasificador completo
        # V3 Small tiene: Linear -> Hardswish -> Dropout -> Linear
        in_features = self.backbone.classifier[0].in_features  # 576
        
        self.backbone.classifier = nn.Sequential(
            nn.Linear(in_features, 256),
            nn.BatchNorm1d(256),
            nn.Hardswish(),
            nn.Dropout(0.3),

            nn.Linear(256, num_classes)
        )
    
    def forward(self, x):
        return self.backbone(x)
    
    def unfreeze_features(self):
        """Descongela todas las capas para entrenamiento completo."""
        for param in self.backbone.features.parameters():
            param.requires_grad = True


def load_model():

    checkpoint = torch.load('modelo_mobilenet.pth',map_location = "cpu")
    model = MobileNetV3Small(10)

    model.load_state_dict(checkpoint['model_state_dict'])

    model.eval()  # Establecer el modelo en modo de evaluación
    return model


model = load_model()

idx = {0: 'Agujeros de bala',
 1: 'Cancro de los cítricos',
 2: 'Cochinilla algodonosa',
 3: 'Daño de follaje',
 4: 'Hoja sana',
 5: 'Hojas amarillas',
 6: 'Huanglongbing',
 7: 'Mosca blanca espinosa de los cítricos',
 8: 'Muerte regresiva',
 9: 'Oídio de los cítricos'}


@flask_app.route("/")
def Home():
    return render_template("index.html")



@flask_app.route("/predict", methods = ["POST"])
def predict():

    if 'imagen' not in request.files:
        return jsonify({"error": "No se encontró el archivo de imagen"}), 400
    archivo = request.files['imagen']
    if archivo.filename == '':
        return jsonify({"error": "No se seleccionó ningún archivo"}), 400
    try:

        imagen = request.files['imagen']
        x = Image.open(imagen).convert('RGB')
        

        x_tensor = transform(x).unsqueeze(0).to('cpu')
        model = load_model()
    
        with torch.no_grad():

        
            pred = model(x_tensor)
            probs = torch.softmax(pred, dim=1)[0].cpu().numpy()

        
        pred_idx = int(np.argmax(probs))
        pred_clase = idx[pred_idx]

        info = enfermedades[pred_clase]

        return  jsonify({
        "prediccion": pred_clase,
        "tipo": info["tipo"],
        "descripcion": info["descripcion"],
        "causa": info["causa"],
        "transmision": info["transmision"],
        "sintomas": info["sintomas"],
        "prevencion": info["manejo_organico"]["prevencion"],
        "tratamiento": info["manejo_organico"]["tratamiento"],
        "costo": info["manejo_organico"]["costo"]})
    
    except Exception as e:
        return jsonify({
            "exito": False,
            "error": f"Error al procesar la imagen: {str(e)}"
        }), 500



if __name__ == "__main__":
    flask_app.run(debug=True, host="0.0.0.0", port=8080)
    
    
