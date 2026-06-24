import requests
import sys

url = "http://localhost:8000/parse-prescription"

# Test 1: Valid Prescription
valid_payload = {
    "text": "Rx:\nLisinopril 10mg -- take once daily in the morning.\nPatient: Alex Rivera\nClinical Notes: Patient reports chest pain/tightness, dry persistent cough, and occasional palpitations.\nPrescribed by Dr. Komal Choudhury."
}

print("Testing valid prescription payload...")
try:
    response = requests.post(url, json=valid_payload)
    print("Status Code:", response.status_code)
    print("Response JSON:", response.json())
except Exception as e:
    print("Error calling valid prescription endpoint:", e)

print("-" * 50)

# Test 2: Invalid prescription (something else)
invalid_payload = {
    "text": "Grandma's Chocolate Chip Cookies\n1 cup butter, softened\n1 cup white sugar\n2 eggs\nDirections:\nPreheat oven to 350 degrees F (175 degrees C)."
}

print("Testing invalid prescription payload...")
try:
    response = requests.post(url, json=invalid_payload)
    print("Status Code:", response.status_code)
    print("Response JSON:", response.json())
except Exception as e:
    print("Error calling invalid prescription endpoint:", e)
