# How to Update Your Grok API Key

## 1. For the Live Site (Render)
The live site uses environment variables stored securely on Render.

1.  Go to your [Render Dashboard](https://dashboard.render.com/).
2.  Click on your **`phuntroo-backend`** service.
3.  Click on **Environment** in the left sidebar.
4.  Find **`GROK_API_KEY`**.
5.  Click **Edit** and paste your new key (starts with `gsk_...`).
6.  Click **Save Changes**.
7.  Render will automatically restart your server (takes 1-2 mins).

## 2. For Local Testing
To run the backend locally, you need to update your local `.env` file.

1.  Open the file: `d:\Jarvis-main\server\.env`
2.  Find the line:
    ```properties
    GROK_API_KEY=your_old_key_here
    ```
3.  Replace the value with your new key.
4.  Save the file.
5.  Restart your local server if it's running.

> **Note**: Never commit your `.env` file to GitHub!
