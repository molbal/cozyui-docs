---
title: OpenAI-Compatible API Integration
---

# OpenAI-Compatible API Integration

CozyUI includes a powerful feature that allows you to expose any of your workflows as a fully-featured, conversational agent accessible via an OpenAI-compatible API. This means you can interact with your complex, multi-step workflows using standard OpenAI client libraries and tools like [Open WebUI](https://github.com/open-webui/open-webui), just as you would with models like GPT-4o.

## How it Works: From Workflow to Conversational Agent

The magic of this integration lies in how it transforms a workflow with multiple inputs into a natural, multi-turn conversation.

When you [expose a workflow](/getting-started/workflows), you decide which of its input parameters are **Fixed Inputs** and which are **Query Inputs**.

*   **Fixed Inputs:** These are values you, the workflow creator, set in advance. They remain constant for every run of the exposed workflow (e.g., a specific API key, a file path, a system prompt for an internal LLM).
*   **Query Inputs:** These are the values that need to be provided by the end-user. Instead of requiring the user to provide them all at once in a structured format, CozyUI's API will **conversationally gather them**.

### The Conversational Flow

Let's imagine you've created a "Trip Planner" workflow that requires three Query Inputs: `destination`, `budget`, and `travel_dates`.

1.  **Initial Prompt:** A user starts a conversation with your exposed workflow model.
    > **User:** "I want to plan a trip to Paris."

2.  **Parameter Extraction:** CozyUI's internally called LLM receives this message. It analyzes the text and compares it against the required Query Inputs (`destination`, `budget`, `travel_dates`). It successfully extracts `"destination": "Paris"`. During parameter extraction, information about the workflow, and nodes are injected in the context, so the more descriptive you are, the more punctual the parameter extraction will be.

3.  **Asking for Missing Information:** The agent sees that `budget` and `travel_dates` are still missing. It uses another LLM call to formulate a natural follow-up question.
    > **Agent (CozyUI):** "Paris is a wonderful choice! To help plan your trip, what is your budget and what are your desired travel dates?"

4.  **Gathering More Information:** The user provides the remaining details.
    > **User:** "My budget is around $2000, and I'd like to go for a week in mid-October."

5.  **Execution:** The agent now has all the required Query Inputs. It combines these with any Fixed Inputs you pre-configured and starts the actual execution of your CozyUI workflow.

This entire conversational layer is handled automatically. You only define which inputs are needed, and CozyUI handles the chatbot logic for you automatically.

### The Streaming Response: In thinking blocks

When your workflow executes, the API streams the response back in a format compatible with OpenAI's streaming chat completions. However, CozyUI adds a special feature for transparency: a `<thinking>` block.

While your workflow is running, the agent will stream real-time updates about which nodes are executing. This gives you a live view into the agent's "thought process."

::: warning
TODO insert example thought processs
:::

These thinking blocks are usually hidden by default, keeping it out of the way.

This allows you to see the progress of the underlying workflow execution before the final answer is delivered.

##  Handling the Conversation ID
When you initiate a new chat with an exposed workflow, the agent's first response will include a unique Conversation ID, automatically injected into the message and wrapped in a special cozyui-conversation-identifier code block. This identifier is the key to enabling stateful, multi-turn conversations. It allows CozyUI to link all subsequent requests to the same chat session, remembering the full conversation history and any parameters you've already provided, without having to run data extraction on user messages again (which uses an LLM call).

For your client application to function correctly, it is needs to send back the entire message history with each new request, including all previous messages. Most standard OpenAI client libraries manage this history automatically, but it is an important technical detail to be aware of, if you do implement your own client.


## Technical Details & API Usage

You can interact with your exposed workflows using any standard OpenAI client.

::: info
OpenAI endpoints are currently not authenticated.
:::

**API Endpoint:** `POST /openai/chat/completions`

The request body should follow the standard OpenAI Chat Completions format. The key is to use the `name` you assigned to your Exposed Workflow in the `model` field.

### Example: Calling with `curl`
::: code-group [Example curl request]
```bash
curl -N -X POST https://your-cozyui-instance/openai/chat/completions \
-H "Content-Type: application/json" \
-d '{
  "model": "trip-planner",
  "messages": [
    {
      "role": "user",
      "content": "I want to plan a trip to Paris."
    }
  ],
  "stream": true
}'
```
:::

### Example: Calling with Python

This is the most common use case. Make sure you have the `openai` library installed (`pip install openai`). The critical step is to point the client to your CozyUI instance by setting the `base_url`.

::: code-group
```python [Example Python client]
import os
from openai import OpenAI

# Point the client to your CozyUI instance's OpenAI-compatible endpoint
client = OpenAI(
    api_key="", # CozyUI currently does not require an API Key
    base_url="https://your-cozyui-instance/openai"
)

# The 'model' is the unique name you gave your Exposed Workflow
response_stream = client.chat.completions.create(
    model="trip-planner",
    messages=[
        {"role": "user", "content": "I want to plan a trip to Paris."}
    ],
    stream=True
)

print("Agent is responding...")
for chunk in response_stream:
    content = chunk.choices[0].delta.content
    if content:
        print(content, end='', flush=True)

print("\n\nStream finished.")
```
:::

### Listing Available Models

To see a list of all workflows you have exposed via the OpenAI API, you can make a `GET` request to the models endpoint.

**Endpoint:** `GET /openai/models`

::: code-group
```bash  [Example curl request]
curl https://your-cozyui-instance/openai/models 
```
```json [Example Response]
{
  "object": "list",
  "data": [
    {
      "id": "model-1",
      "object": "model",
      "created": 1686935002,
      "owned_by": "cozyui"
    },
    {
      "id": "model-2",
      "object": "model",
      "created": 1686935002,
      "owned_by": "cozyui"
    },
    {
      "id": "model-3",
      "object": "model",
      "created": 1686935002,
      "owned_by": "cozyui"
    },
  ],
  "object": "list"
}
```
:::

This will return a JSON object listing all available "models" (your exposed workflows), compatible with the standard OpenAI `v1/models` response format.

#### The model object

| property | type | description |
| --- | --- | --- |
| created | integer | The Unix timestamp (in seconds) when the model was created. |
| id | string | The model identifier, which can be referenced in the API endpoints. |
| object | string | The object type, which is always `model`. |
| owned_by | string | The organization that owns the model. Currently a static value: `cozyui`. |
