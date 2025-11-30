import zipfile
import os

maven_zip = r'd:\Jarvis-main\tools\maven.zip'
extract_to = r'd:\Jarvis-main\tools'

print(f"Extracting {maven_zip} to {extract_to}...")

try:
    with zipfile.ZipFile(maven_zip, 'r') as zip_ref:
        zip_ref.extractall(extract_to)
    print("Maven extracted successfully!")
    
    # List extracted folders
    for item in os.listdir(extract_to):
        item_path = os.path.join(extract_to, item)
        if os.path.isdir(item_path) and 'maven' in item.lower():
            print(f"Found Maven folder: {item}")
except Exception as e:
    print(f"Error: {e}")
