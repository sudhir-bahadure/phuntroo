import asyncio
from random import randint
from PIL import Image
import requests
from dotenv import get_key
import os
from time import sleep

# Ensure the Data directory exists
os.makedirs("Data", exist_ok=True)

# Function to open and display images based on a given prompt
def open_images(prompt):
    folder_path = r"Data"  # Folder where the images are stored
    prompt = prompt.replace(" ", "_")  # Replace spaces in prompt with underscores

    # Generate the filenames for the images
    files = [f"{prompt}_Hi{i + 1}.jpg" for i in range(4)]
    for jpg_file in files:
        image_path = os.path.join(folder_path, jpg_file)
        try:
            # Try to open and display the image
            img = Image.open(image_path)
            print(f"Opening image: {image_path}")
            img.show()
            sleep(1)
        except IOError:
            print(f"Unable to open {image_path}")

# API details for the Hugging Face Stable Diffusion model
API_URL = "https://api-inference.huggingface.co/models/stabilityai/stable-diffusion-xl-base-1.0"
headers = {"Authorization": f"Bearer {get_key('.env', 'HuggingFaceAPIKey')}"}
# Async function to send a query to the Hugging Face API with retry mechanism
async def query_with_retry(payload, retries=3):
    for attempt in range(retries):
        try:
            response = await asyncio.to_thread(requests.post, API_URL, headers=headers, json=payload)
            print(f"Response Status: {response.status_code}")
            if response.status_code == 200:
                print(f"Data size: {len(response.content)} bytes")
                if len(response.content) > 0:
                    return response.content
            else:
                print(f"Attempt {attempt + 1} failed: {response.status_code} - {response.text}")
        except Exception as e:
            print(f"API Error: {e}")
        await asyncio.sleep(2)
    return None

# Async function to generate images based on the given prompt
async def generate_images(prompt: str):
    tasks = []
    # Create 4 image generation tasks
    for _ in range(4):
        payload = {
            "inputs": f"{prompt}. High quality, sharp focus, high resolution."
        }
        task = asyncio.create_task(query_with_retry(payload))
        tasks.append(task)

    # Wait for all tasks to complete
    image_bytes_list = await asyncio.gather(*tasks)

    # Save the generated images to files
    for i, image_bytes in enumerate(image_bytes_list):
        if image_bytes:
            file_name = fr"Data\{prompt.replace(' ', '_')}_Hi{i + 1}.jpg"
            try:
                with open(file_name, "wb") as f:
                    f.write(image_bytes)
                print(f"Saved {file_name}")
            except Exception as e:
                print(f"Failed to save {file_name}: {e}")
        else:
            print(f"No data for {prompt.replace(' ', '_')}_Hi{i + 1}.jpg")

# Wrapper function to generate and open images
def GenerateImages(prompt: str):
    asyncio.run(generate_images(prompt))  # Run the async image generation
    open_images(prompt)  # Open the generated images

# Main loop to monitor for image generation requests
while True:
    try:
        # Read the status and prompt from the data file
        with open(r"Frontend\Files\ImageGeneration.data", "r") as f:
            data = f.read()

        prompt, status = data.split(",")

        # If the status indicates an image generation request
        if status.strip() == "True":
            print("Generating Images ...")
            GenerateImages(prompt=prompt.strip())

            # Reset the status in the file after generating images
            with open(r"Frontend\Files\ImageGeneration.data", "w") as f:
                f.write("False, False")
            break  # Exit the loop after processing the request
        else:
            sleep(1)
    except Exception as e:
        print(f"Main Loop Error: {e}")
        sleep(1)
