---
title: "Core Concepts"

---


# Core Concepts

Welcome to CozyUI node development! To create powerful and effective custom nodes, it's important to understand the fundamental concepts that make up a CozyUI workflow.

## Workflows

At the highest level, a **Workflow** is the canvas where you design your automated processes. It's a visual representation of a series of tasks, composed of Nodes, Leaves (sub-workflows), and the Connections between them. The ultimate goal of a workflow is to take some input, process it through various steps, and produce a desired output or side-effect.

::: info
Looking for **agents**? We also call them Workflows in CozyUI.
:::


## Nodes

**Nodes** are the primary building blocks of any workflow. Each node represents a single, distinct unit of work or a specific operation.

*   **Function:** A node might fetch data, transform text, make a decision, interact with an AI, or save a file.
*   **Definition:** As a node developer, you define a node's behavior by implementing a PHP class. Key aspects you'll define include:
    *   `getName()`: A human-readable name for your node (e.g., "Translate Text").
    *   `getDescription()`: A brief explanation of what your node does.
    *   `getInputs()`: Defines the input parameters your node expects.
    *   `getOutputs()`: Defines the output parameters your node will produce.
    *   `execute()`: The core logic where your node performs its action using the provided inputs and returns its outputs.
*   **Output Nodes:** Some nodes are designated as "output nodes" (e.g., "Display Text," "Save File"). These typically represent the final step or result of a workflow or a significant branch. You can mark your node as such using `isOutputNode()`.

## Parameters (Inputs & Outputs)

Nodes communicate and pass data through **Parameters**.

*   **Inputs:** How a node receives data or configuration.
    *   Defined in your node's `getInputs()` method.
    *   Each input has a name (e.g., `text_to_translate`) and a specific Parameter Type.
    *   Inputs can receive data dynamically by being linked to an output of a preceding node, or they can have a static value set by the user in the workflow editor.
*   **Outputs:** How a node provides results or signals to other parts of the workflow.
    *   Defined in your node's `getOutputs()` method.
    *   Each output has a name (e.g., `translated_text`) and a Parameter Type.
    *   Outputs are typically linked to the inputs of subsequent nodes or to trigger Leaves.

## Parameter Types

Every input and output parameter has a **Parameter Type**. This defines the kind of data the parameter expects or produces. Common built-in types include:

*   **Text:** For string data.
*   **Number:** For numerical data.
*   **Boolean:** For true/false values.
*   **Array:** For lists of items.
*   **NodeTriggerType:** A special type used for outputs that explicitly trigger the execution of a Leaf (see Connections).

The system uses these types for validation, to render appropriate UI controls in the editor, and to ensure data compatibility between connected nodes. You can also create custom parameter types for more complex data structures.

## Connections

**Connections** are the "wires" that link nodes and Leaves together, defining the flow of data and execution. There are two primary kinds of connections based on what they link:

*   **Node-to-Node (Data Connections):**
    *   These link an output parameter of one node to an input parameter of another node.
    *   Their primary purpose is to **transfer data**.
    *   The availability of data through these connections is the main factor determining the execution order of nodes. A node generally waits until all its linked data inputs have received data.

*   **Node-to-Leaf (Trigger Connections):**
    *   These link a special `NodeTriggerType` output parameter of a node to an input trigger point of a **Leaf** (sub-workflow).
    *   Their purpose is to **initiate the execution of the entire connected Leaf**.
    *   This is how control flow nodes (like "If" or "For Loop") direct the workflow to execute different groups of nodes (Leaves) based on their logic.

## Leaves (Sub-Workflows)

**Leaves** allow you to group a set of nodes and their connections into a reusable, encapsulated sub-workflow. Think of them as functions or modules within your main workflow.

*   **Organization:** They help manage complexity by breaking down large workflows into smaller, logical units.
*   **Execution:** A Leaf is typically triggered by a `NodeTriggerType` output from a node outside the Leaf. When triggered, the nodes *inside* the Leaf begin their execution sequence, following the same data-dependency rules.
*   **Scope:** Leaves have their own internal scope for execution.

## Execution Flow

CozyUI's engine automatically determines the order in which nodes execute based primarily on data dependencies established by connections. A node runs when its required inputs are available. For more details, see the [Execution Order](./execution-order.md) page.

## Node Events

During its `execute()` method, your node can send real-time information or feedback to the user interface. This is useful for:

*   Displaying progress updates.
*   Showing intermediate results or logs directly on the node in the editor.
*   Providing debugging information.
This is typically done using a helper method like `this->emitEvent($inputs, ['your_event_data'])`.

## Scoped Variables

Nodes can store and retrieve data that persists during a workflow's execution using a scoped variable system. This is useful for maintaining state or sharing information that doesn't flow directly through input/output parameters.

*   **`WorkflowScope`:** Variables stored in this scope are accessible to any node throughout the entire execution of that specific workflow run.
*   **`NodeScope`:** Variables stored in this scope are typically private to that specific node instance. This can be useful if your node needs to remember something across multiple times it might be triggered within a complex loop structure (though often, re-triggering implies a fresh execution context for the node's logic).

You'll use helper methods like `this->setVariable(...)` and `this->getVariable(...)` within your node's `execute()` method to interact with this system.
