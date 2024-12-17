# Project Setup and Usage Guide

This guide provides step-by-step instructions to run the application and test it using Postman.

## Prerequisites

- **Python** (Ensure you have Python 3.6 or later installed)
- **Postman** (or any API client)

## How to Run

Follow these steps in order:

1. **Set up a Virtual Environment**:
   ```bash
   python -m venv venv
   ```

2. **Activate the Virtual Environment**:
   - On Linux/MacOS:
     ```bash
     source venv/bin/activate
     ```
   - On Windows:
     ```bash
     .\venv\Scripts\activate
     ```

3. **Install Required Packages**:
   Run the following commands:
   ```bash
   pip install typing
   pip install openai
   pip install fastapi
   ```

4. **Run the Application**:
   Start the server using:
   ```bash
   uvicorn app:app --host 0.0.0.0 --port 80
   ```

## Testing with Postman

1. **Connect Postman to Your API**:
   - Use the endpoint: `http://YOUR_IP_ADDRESS/chat`
     - Replace `YOUR_IP_ADDRESS` with the appropriate IP address (e.g., `0.0.0.0`).

2. **Set Up a POST Request**:
   - Set the request method to **POST**.
   - Use **JSON** as the request body format.

3. **Run a Query**:
   Example Request Body:
   ```json
   {
       "role": "user",
       "content": "YOUR_QUERY"
   }
   ```

   Replace `YOUR_QUERY` with your desired input.

## Example Response
The server will process your request and return a JSON response.

---

Feel free to modify this guide to suit your project's needs!

