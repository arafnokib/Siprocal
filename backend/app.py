import asyncio
import json
from typing import List, Dict, Any

import openai
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

#TO RUN, RUN COMMANDS IN ORDER
#python -m venv
#source venv/bin/activate
#pip install typing, pip install openai, pip install fastapi
#uvicorn app:app --host 0.0.0.0 --port 80
#connect postman to YOUR_PORT_IP/chat (ex: 0.0.0.0/chat) through JSON
#run your query - {"role": "user", "content": "YOUR_QUERY"}

# OpenAI Configuration
openai.api_key = "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"  # Replace with actual API key
ASSISTANT_ID = "asst_r07qFiretE0GMLziRMBYAhgH"  # Replace with actual Assistant ID

class ChatMessage(BaseModel):
    role: str
    content: str

class OpenAIAssistantWebSocket:
    def __init__(self):
        self.active_connections: List[WebSocket] = []
        self.thread_cache: Dict[str, str] = {}

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)

    def disconnect(self, websocket: WebSocket):
        self.active_connections.remove(websocket)

    def create_thread(self) -> str:
        """Create a new conversation thread"""
        thread = openai.beta.threads.create()
        return thread.id

    async def add_message_to_thread(self, thread_id: str, message: str):
        """Add user message to the thread"""
        await openai.beta.threads.messages.create(
            thread_id=thread_id,
            role="user",
            content=message
        )

    def run_assistant(self, thread_id: str) -> str:
        """Run the assistant and retrieve response"""
        run = openai.beta.threads.runs.create(
            thread_id=thread_id,
            assistant_id=ASSISTANT_ID
        )

        # Wait for run completion
        while run.status != "completed":
            run = openai.beta.threads.runs.retrieve(
                thread_id=thread_id,
                run_id=run.id
            )
            asyncio.sleep(0.5)

        # Retrieve messages
        messages = openai.beta.threads.messages.list(thread_id=thread_id)
        
        # Get the last assistant message
        for msg in reversed(messages.data):
            if msg.role == "assistant":
                return msg.content[0].text.value

        return "No response generated."

    async def handle_websocket(self, websocket: WebSocket):
        """Primary WebSocket handler"""
        await self.connect(websocket)
        
        try:
            # Create a new thread for this connection
            thread_id = self.create_thread()
            print(thread_id)
            self.thread_cache[str(websocket)] = thread_id

            while True:
                # Receive message from client
                data = await websocket.receive_text()
                message_data = json.loads(data)
                print(message_data)
                user_message = message_data.get('message', '')

                # Add message to thread
                self.add_message_to_thread(thread_id, user_message)

                # Generate assistant response
                assistant_response = self.run_assistant(thread_id)

                # Send response back to client
                await websocket.send_text(json.dumps({
                    'role': 'assistant',
                    'content': assistant_response
                }))

        except WebSocketDisconnect:
            # Clean up thread when connection is closed
            if str(websocket) in self.thread_cache:
                del self.thread_cache[str(websocket)]
            self.disconnect(websocket)

# FastAPI App Configuration
app = FastAPI()

# CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Adjust in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize WebSocket handler
ws_handler = OpenAIAssistantWebSocket()

@app.websocket("/chat")
async def websocket_endpoint(websocket: WebSocket):
    """WebSocket endpoint for chat interactions"""
    await ws_handler.handle_websocket(websocket)

# Optional: Health check endpoint
@app.get("/health")
async def health_check():
    return {"status": "healthy"}

# Run with: uvicorn main:app --reload
# WebSocket client can connect to ws://localhost:8000/chat
'''
Here's a breakdown of the implementation:

### Key Features
1. **WebSocket Integration**: Real-time bidirectional communication
2. **OpenAI Assistant API**: Intelligent response generation
3. **Thread Management**: Separate conversation threads per connection
4. **Asynchronous Handling**: Non-blocking WebSocket processing

### WebSocket Workflow
1. Client connects to `/chat` endpoint
2. New conversation thread created
3. User sends message
4. Message added to thread
5. Assistant generates response
6. Response sent back to client

### Implementation Details
- Uses `openai` library for Assistant API interactions
- Manages conversation state via thread IDs
- Handles WebSocket connections and disconnections
- Provides basic error handling and thread cleanup

### Recommendations
- Replace placeholders:
  - `your_openai_api_key`
  - `your_assistant_id`
- Configure CORS settings for production
- Implement additional error handling
- Add authentication for production use

### Required Dependencies
```bash
pip install fastapi
pip install "openai>=1.0.0"
pip install uvicorn
pip install websockets
```

### Client-Side WebSocket Example (JavaScript)
```javascript
const socket = new WebSocket('ws://localhost:8000/chat');

socket.onopen = () => {
    socket.send(JSON.stringify({ message: 'Hello, Assistant!' }));
};

socket.onmessage = (event) => {
    const response = JSON.parse(event.data);
    console.log(response.content);
};
```

Would you like me to elaborate on any aspect of the implementation or discuss potential enhancements like authentication, rate limiting, or advanced error handling?
'''