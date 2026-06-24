import os
import subprocess
import sys

# Ensure Pillow is installed
try:
    from PIL import Image, ImageDraw, ImageFont
except ImportError:
    print("Installing Pillow...")
    subprocess.check_call([sys.executable, "-m", "pip", "install", "Pillow"])
    from PIL import Image, ImageDraw, ImageFont

def create_image(filename, text_lines):
    # Create white canvas
    img = Image.new('RGB', (800, 600), color='white')
    d = ImageDraw.Draw(img)
    
    # Try to load a default font, otherwise fallback
    try:
        font = ImageFont.load_default()
    except Exception:
        font = None
        
    y_text = 40
    for line in text_lines:
        d.text((50, y_text), line, fill='black')
        y_text += 40
        
    # Save the image
    img.save(filename)
    print(f"Generated test image: {filename}")

# Generate a valid prescription image matching Dr. Komal Choudhury
valid_text = [
    "Rx - Clinical Prescription",
    "=====================================",
    "Date: 2026-06-23",
    "Clinic: Aegis Heart and Vascular Care",
    "Prescribing Doctor: Dr. Komal Choudhury",
    "License: LIC-IND-051",
    "",
    "Patient Name: Alex Rivera",
    "Age: 45 | Gender: Male",
    "",
    "Medications:",
    "-------------------------------------",
    "1. Lisinopril 10mg -- take once daily in the morning.",
    "",
    "Clinical Notes:",
    "Patient reports mild chest pain and persistent cough.",
    "Palpitations are reported as occasional.",
    "Recommend daily blood pressure monitoring."
]

# Generate an invalid non-prescription document
invalid_text = [
    "Grandma's Chocolate Chip Cookies",
    "=====================================",
    "Prep time: 15 mins | Cook time: 10 mins",
    "",
    "Ingredients:",
    "- 1 cup butter, softened",
    "- 1 cup white sugar",
    "- 1 cup packed brown sugar",
    "- 2 eggs",
    "- 2 teaspoons vanilla extract",
    "- 3 cups all-purpose flour",
    "- 1 teaspoon baking soda",
    "- 2 cups semisweet chocolate chips",
    "",
    "Directions:",
    "1. Preheat oven to 350 degrees F (175 degrees C).",
    "2. Cream butter, white sugar, and brown sugar together.",
    "3. Beat in the eggs one at a time, then stir in vanilla.",
    "4. Dissolve baking soda in hot water. Add to batter along with salt.",
    "5. Stir in flour, chocolate chips, and nuts."
]

os.makedirs("public", exist_ok=True)
create_image("public/valid_prescription.png", valid_text)
create_image("public/invalid_document.png", invalid_text)
print("Successfully generated all test images in the public/ folder!")
