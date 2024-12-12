import cv2
import numpy as np
from keras.models import load_model
import torch
from pathlib import Path
import src.configs as cf

import pathlib
import time

pathlib.PosixPath = pathlib.WindowsPath

yolo_weights_path = str(Path('./yolov5/runs/train/exp/weights/best.pt'))
keras_model_path = str(Path('./model/fine_tune_asl_model.h5'))

# Load YOLOv5 model
try:
    yolo_model = torch.hub.load(
        './yolov5',
        'custom',
        path=yolo_weights_path,
        source='local',
        force_reload=True  
    )
    print("YOLOv5 model loaded successfully.")
except Exception as e:
    print(f"Error loading YOLOv5 model: {e}")
    exit(1)

# Load Keras model
try:
    sign_model = load_model(keras_model_path)
    print("Keras model loaded successfully.")
except Exception as e:
    print(f"Error loading Keras model: {e}")
    exit(1)

def recognize():
    # Open camera
    cam = cv2.VideoCapture(0)
    cam.set(cv2.CAP_PROP_FRAME_WIDTH, 1280)
    cam.set(cv2.CAP_PROP_FRAME_HEIGHT, 720)

    if not cam.isOpened():
        print("Error: Could not open camera.")
        return

    text, word = "", ""
    count_same_frame = 0
    padding = 80

    total_time = 0
    frame_count = 0
    start_time = time.time()

    while True:
        ret, frame = cam.read()
        if not ret:
            print("Error: Could not read frame from camera.")
            break

        frame_start = time.time()  # Start timing for the frame

        try:
            results = yolo_model(cv2.cvtColor(frame, cv2.COLOR_BGR2RGB))
            detections = results.pandas().xyxy[0]
        except Exception as e:
            print(f"Error during YOLOv5 detection: {e}")
            break

        # Select the highest confidence detection
        if len(detections) > 0:
            detections = detections.sort_values(by='confidence', ascending=False)
            row = detections.iloc[0]  # Only process the top detection
            if row['name'] == 'hand' and row['confidence'] > 0.5:
                xmin = max(0, int(row['xmin']) - padding)
                ymin = max(0, int(row['ymin']) - padding)
                xmax = min(frame.shape[1], int(row['xmax']) + padding)
                ymax = min(frame.shape[0], int(row['ymax']) + padding)

                cropped_hand = frame[ymin:ymax, xmin:xmax]

                try:
                    resized_frame = cv2.resize(cropped_hand, (cf.IMAGE_SIZE, cf.IMAGE_SIZE))
                    reshaped_frame = np.array(resized_frame).reshape((1, cf.IMAGE_SIZE, cf.IMAGE_SIZE, 3))
                    frame_for_model = reshaped_frame / 255.0

                    old_text = text
                    prediction = sign_model.predict(frame_for_model)
                    prediction_probability = prediction[0, prediction.argmax()]
                    text = cf.CLASSES[prediction.argmax()]
                except Exception as e:
                    print(f"Error during Keras model prediction: {e}")
                    continue

                if text == 'space':
                    text = '_'
                if text != 'nothing':
                    if old_text == text:
                        count_same_frame += 1
                    else:
                        count_same_frame = 0

                    if count_same_frame > 10:
                        word += text
                        count_same_frame = 0

                if prediction_probability > 0.5:
                    cv2.rectangle(frame, (xmin, ymin), (xmax, ymax), (0, 255, 0), 2)
                    cv2.putText(frame, f"{text} ({prediction_probability * 100:.2f}%)",
                                (xmin, ymin - 10), cv2.FONT_HERSHEY_SIMPLEX, 0.8, (0, 255, 0), 2)

        # Measure frame time
        frame_time = time.time() - frame_start
        total_time += frame_time
        frame_count += 1

        # Show the frame
        cv2.imshow("Hand Detection & Sign Language Recognition", frame)

        # Exit conditions
        if time.time() - start_time > 10:  # Stop after 10 seconds
            break
        k = cv2.waitKey(1) & 0xFF
        if k == ord('q'):
            break
        if k == ord('r'):
            word = ""
        if k == ord('z'):
            word = word[:-1]

    # Calculate average frame time and FPS
    if frame_count > 0:
        average_frame_time = total_time / frame_count
        fps = 1 / average_frame_time
        print(f"Processed {frame_count} frames in 10 seconds.")
        print(f"Average Frame Time: {average_frame_time:.4f} seconds")
        print(f"FPS: {fps:.2f}")

    cam.release()
    cv2.destroyAllWindows()

recognize()
