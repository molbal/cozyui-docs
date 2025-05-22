---
title: Starting Point for Custom Node Development
---

# Starting Point for Custom Node Development

Welcome, future CozyUI Node Developer! I'm excited you're looking to extend the capabilities of CozyUI by creating your own custom nodes. This guide will walk you through the essential steps and concepts to get you started.

## Why Create Custom Nodes?

CozyUI comes with a range of built-in nodes, but the real power comes from its extensibility. By creating custom nodes, you can:

*   **Integrate with specific APIs or services** relevant to your needs.
*   **Implement custom data transformations** or business logic.
*   **Create specialized tools** for your unique workflows.
*   **Share your creations** with the wider CozyUI community.

## Prerequisites

Before you dive in, it's helpful to have a basic understanding of:

*   **PHP:** Node backends are written in PHP. Familiarity with classes, methods, and arrays is essential.
*   **Tailwind, AlpineJS, Blade:** This stack is used to build custom node frontends. 
*   **Laravel (Optional but Recommended):** CozyUI is built on Laravel. While not strictly required for simple nodes, understanding Laravel concepts can be beneficial for more complex integrations or if you need to use Laravel services.
*   **CozyUI Basics:** You should be familiar with how to use the CozyUI editor, create workflows, and connect nodes.

## Your First Steps: The `make:node` Command

The easiest way to start a new node is by using the built-in Artisan command:

```bash
php artisan make:node
```

This command will guide you through a series of prompts:

1.  **Package Name:** This helps organize nodes. Think of it as a category (e.g., `TextUtilities`, `ImageProcessing`, `MyCompanyTools`). You can use slashes for sub-packaging (e.g., `Integrations/SocialMedia`).
2.  **Node Name:** The human-readable name of your node (e.g., `Reverse Text`, `Fetch Weather Data`).
3.  **Node Description:** A brief explanation of what your node does.
4.  **Frontend Component (Blade):** Asks if you want to create an associated Blade template for custom UI on your node. For simple nodes, you might not need this.
5.  **Output Node:** Asks if this node primarily serves as an endpoint or produces a final side-effect (like saving a file).
6.  **AI Assistance (Optional):** If CozyAI is configured, it can offer to help bootstrap your node's code by asking for input/output descriptions and desired logic.

After you answer the prompts, the command will generate a new PHP class file for your node (and optionally a `.blade.php` file) in the `app/Nodes/YourPackageName/` directory. This generated file will contain a basic structure with `// TODO:` comments indicating where you need to fill in your logic.

## Core Files and Concepts to Understand Next

Once your node file is generated, you'll primarily be working with its PHP class. To effectively develop your node, you should familiarize yourself with these key areas:

1.  **Architecture of a Node:** Understand the structure of a node class, including the essential static methods (`getName`, `getDescription`, `getInputs`, `getOutputs`) and the crucial `execute()` method where your node's logic resides.

2.  **Core Concepts:** Get a grasp of fundamental CozyUI ideas like Workflows, Nodes, Parameters (Inputs/Outputs), Parameter Types, Connections, and Leaves (sub-workflows).

3.  **Available Helpers:** Learn about the utility functions (`node_inparam`, `node_outparam`, `node_response`) and `BaseCozyNode` methods (`$this->emitEvent`, `$this->setVariable`) that simplify node development.

4.  **Execution Order:** Understand how CozyUI determines the sequence in which nodes run, primarily based on data dependencies.

5.  **Triggering Leaves:** If your node needs to control workflow branches or perform loops, learn how to trigger Leaves and use backtracking.

## Development Workflow

1.  **Plan Your Node:**
    *   What specific task will it perform?
    *   What inputs does it need? What are their types?
    *   What outputs will it produce? What are their types?
    *   Will it need a custom UI (Blade template)?

2.  **Generate the Node:** Use `php artisan make:node`.

3.  **Implement Static Methods:** Fill in `getName()`, `getDescription()`, `getInputs()`, and `getOutputs()`.

4.  **Write `execute()` Logic:** This is where your node does its work.
    *   Access input values from the `$inputs` array.
    *   Perform your calculations, API calls, or data manipulations.
    *   Use `node_response()->add(...)` to prepare your output data.
    *   If controlling flow, use `node_response()->trigger(...)` and potentially `->backtrack()`.
    *   Return the result of `node_response()->build()`.

5.  **(Optional) Create Blade UI:** If you opted for a frontend component, design its HTML and use Alpine.js to react to events emitted by your node (`$this->emitEvent()`).

6.  **Test Thoroughly:**
    *   Open CozyUI in your browser.
    *   If you've added a new node, you might need to clear CozyUI's cache for it to appear. Often, if caching is enabled, a mechanism to invalidate the node registry cache is needed (or disable caching during development). *Your CozyUI instance might have a specific way to do this, e.g., a debug route or an artisan command.*
    *   Add your node to a new workflow.
    *   Connect it with other nodes, providing various inputs.
    *   Observe its behavior, check its outputs, and debug any issues. Laravel's logging (`logger()->info(...)`, etc.) is your friend!

7.  **Iterate:** Refine your node's logic, UI, and error handling based on testing.

## Ready to Build?

Dive into the linked documentation pages to deepen your understanding of each aspect. The CozyUI community and documentation are here to support you. We can't wait to see what you create!

Happy Node Building!