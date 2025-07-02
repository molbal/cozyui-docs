---
title: Working with Workflows
---

# Working with Workflows

You've learned the core concepts of nodes, connections, and parameters. Now, let's put it all together. A **Workflow** is the canvas where you design, build, and save your automated processes. This guide covers how to manage your workflows and, most excitingly, how to turn them into powerful, reusable tools and agents.

## Saving and Managing Your Workflows

As you build on the canvas, your progress is often saved automatically. However, to truly manage and reuse your creations, you'll want to give them a permanent name and save them.

*   **Saving a Workflow:** Use the save functionality in the editor to give your workflow a unique name (e.g., "Weekly Social Media Post Generator" or "Customer Support Triage"). This makes it a permanent, reusable asset in your CozyUI environment.
*   **Loading Workflows:** Once saved, you can easily load, edit, and clone your workflows from your library.

## Exposing Workflows: Turning Your Creation into a Tool

This is where CozyUI's power truly shines. "Exposing" a workflow means you are turning your visual design into a functional, conversational agent or a tool that can be used by other systems, like an API.

Instead of needing to open the CozyUI editor to run your workflow, an exposed workflow can be triggered by other applications, scripts, or even directly through a chat interface.

### The "Expose Workflow" Wizard

To begin, you'll use the "Expose Workflow" wizard, which will guide you through the process step-by-step.

#### Step 1: Workflow Selection

First, you'll be asked to choose which of your **saved** workflows you want to expose. Select the workflow you wish to turn into an agent or tool from the list. Once selected, the system will analyze its structure to identify all the potential inputs you can configure.

#### Step 2: Parameter Configuration

This is the most important step. Here, you decide how your new agent or tool will receive its starting information. For every input parameter in your workflow that isn't already connected to another node's output, you must decide if it's a **Fixed Parameter** or a **Query Parameter**.

*   **Fixed Parameters:**
    *   **What they are:** These are "set-it-and-forget-it" values that you, the creator, define in advance. They are hidden from the end-user and remain the same every time the workflow runs.
    *   **When to use them:** Perfect for information that shouldn't change, such as an API key for a service, a specific system prompt for an internal LLM node, or a default file path.
    *   **How to set them:** In the wizard, you'll check the **"Fixed Value"** toggle for the parameter and then enter the value you want to use.

*   **Query Parameters:**
    *   **What they are:** These are the dynamic inputs that your agent will need to get from the end-user at runtime. This is what makes your workflow conversational.
    *   **When to use them:** Use these for the information that will change with each use, like a customer's specific question, a topic for a research report, or a user's email address.
    *   **How to set them:** Leave the "Fixed Value" toggle **off**. You will then be prompted to write a clear **description** for this parameter. This description is very important, as an internal AI will use it to understand what the parameter is for and to formulate a  question to ask the user if the information isn't provided in their initial prompt.

::: tip Tip
The wizard includes a shortcut! You can use the **"Fill parameters from workflow job"** dropdown to select a previous successful run of your workflow. This will automatically populate the parameters with the values from that job, which you can then keep or adjust. It's the recommended way to configure a complex workflow quickly.
:::

#### Step 3: Exposure Channels & Naming

This final step defines how your new agent will be identified and accessed by the outside world.

*   **Name:** This is a unique, slug-like identifier for your agent (e.g., `trip-planner-v1`, `social-media-generator`). This name will be used as the "model" name in API calls, so it should not contain spaces or special characters.
*   **Description:** Write a clear, detailed description of what your agent does. This is important for your own reference and is also used by other systems (like MCP) to understand the tool's purpose.
*   **Exposure Toggles:**
    *   **Expose as OpenAI Model:** This is the most common option. Checking this box makes your workflow available through an [OpenAI-Compatible API](./openai-integration.md).
    *   **Expose on MCP Server:** This makes your workflow available to clients using the Model Context Protocol.
    *   **Expose as a Custom Node:** This converts the workflow as a Community Node, which you can reuse in other workflows.

Once you complete the wizard, your workflow is officially "exposed" and ready to be used as a standalone tool.

### What Happens Next?

You've successfully transformed your visual workflow into an intelligent agent! It can now be interacted with conversationally, gathering the "Query Parameters" it needs from a user before executing the full power of your workflow logic with its pre-configured "Fixed Parameters."

To learn how to interact with your newly created agent, please see our guide on **[OpenAI-Compatible API Integration](./openai-integration.md)**.