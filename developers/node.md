---
title: Architecture of a Node
---

# Architecture of a Node

At its heart, a CozyUI Node is a PHP class that encapsulates a specific piece of functionality. To create your own custom node, you'll extend a base class provided by CozyUI and implement a set of required and optional methods. This structure ensures your node integrates smoothly with the workflow engine and the editor.

## The Node Class

Every node you create will be a PHP class that typically resides within the `App\Nodes` directory (often in a subdirectory reflecting its category, e.g., `App\Nodes\TextUtilities` or `App\Nodes\ImageProcessing`).

This class must extend `App\Contracts\BaseCozyNode`. This base class provides foundational functionalities and ensures your node adheres to the necessary contract for the system.

```php
<?php

namespace App\Nodes\MyCustomNodes; // Your chosen namespace

use App\Contracts\BaseCozyNode;
use App\Parameters\Types\TextType; // Example: Using the built-in TextType
// ... other necessary 'use' statements

class MyCustomNode extends BaseCozyNode
{
    // ... Your node's implementation ...
}
```

## Core Static Methods (Metadata & Definition)

These static methods define what your node is, what it does, and how it interacts with other nodes. They are called by the system to understand your node's capabilities and to display it in the editor.

1.  **`public static function getName(): string`**
    *   **Purpose:** Returns the human-readable name of your node as it will appear in the node selection menu and on the node itself in the workflow editor.
    *   **Example:** `return "Concatenate Strings";`

2.  **`public static function getDescription(): string`**
    *   **Purpose:** Provides a brief description of what the node does. This is often shown as a tooltip or in a details panel in the editor.
    *   **Example:** `return "Joins multiple text inputs into a single string.";`

3.  **`public static function getInputs(): array`**
    *   **Purpose:** Defines the input parameters your node accepts.
    *   **Return Value:** An array, where each element describes one input parameter. You'll use the `node_inparam()` helper function to construct these definitions.
    *   **Details per Input:**
        *   `name`: The internal programmatic name of the input (e.g., `source_text`).
        *   `type`: The fully qualified class name of the Parameter Type (e.g., `App\Parameters\Types\TextType::class`).
        *   `canLink` (optional, default `true`): Whether this input can be linked from another node's output. If `false`, the user must provide a static value.
        *   `defaultLink` (optional, default `true`): If `canLink` is `true`, this determines if the input appears as a link by default or as a field for static input.
        *   `specialParameters` (optional): An array for additional configuration, like providing a `default` value or UI hints (e.g., `['default' => 'Hello']`, `['multiline' => true]`).
    *   **Example:**
        ```php
        public static function getInputs(): array
        {
            return [
                node_inparam('text_a', TextType::class),
                node_inparam('text_b', TextType::class, true, true, ['default' => 'World']),
                node_inparam('separator', TextType::class, false, false, ['default' => ' ']) // Must be static
            ];
        }
        ```

4.  **`public static function getOutputs(): array`**
    *   **Purpose:** Defines the output parameters your node produces.
    *   **Return Value:** An array, where each element describes one output parameter. You'll use the `node_outparam()` helper function.
    *   **Details per Output:**
        *   `name`: The internal programmatic name of the output (e.g., `combined_text`).
        *   `type`: The fully qualified class name of the Parameter Type (e.g., `App\Parameters\Types\TextType::class`).
        *   `specialParameters` (optional): An array for additional configuration, like a `label` for UI display.
    *   **Example:**
        ```php
        public static function getOutputs(): array
        {
            return [
                node_outparam('result', TextType::class, ['label' => 'Concatenated Text'])
            ];
        }
        ```

5.  **`public static function isOutputNode(): bool` (Optional)**
    *   **Purpose:** Indicates if this node should be considered a "final output" of a workflow. Output nodes often have side effects (like saving a file or displaying text to the user) and their completion can signify the end of a workflow path.
    *   **Default:** If not implemented, defaults to `false`.
    *   **Example:**
        ```php
        public static function isOutputNode(): bool
        {
            return true; // If this node, for example, saves a file
        }
        ```

## The `execute()` Method (Core Logic)

This is the most important instance method of your node. It's where the actual work happens.

**`public function execute(array $inputs): array`**

*   **Purpose:** Contains the logic that processes the input data and produces output data.
*   **Parameters:**
    *   `$inputs`: An associative array where keys are the `name`s of your defined input parameters, and values are the data received for those inputs.
        *   The `$inputs` array also contains special internal keys prefixed with `__` (e.g., `__jobId`, `__nodeId`) providing context about the current execution. You generally don't need to interact with these directly unless for advanced logging or variable scoping.
*   **Return Value:** An associative array representing the node's outputs.
    *   You **must** use the `node_response()` helper to build this array. This ensures proper validation and formatting.
    *   **Example:**
        ```php
        public function execute(array $inputs): array
        {
            $textA = $inputs['text_a'] ?? '';
            $textB = $inputs['text_b'] ?? '';
            $separator = $inputs['separator'] ?? ' ';

            $result = $textA . $separator . $textB;

            return node_response()
                ->add('result', $result) // 'result' matches an output name from getOutputs()
                ->build();
        }
        ```
    *   If your node doesn't produce any data outputs (e.g., it only performs an action like saving a file and might be an `isOutputNode`), you can return an empty response:
        ```php
        return node_response()->void();
        ```

## Helper Functions & Services

Within your node's methods, especially `execute()`, you have access to:

*   **`node_inparam()` and `node_outparam()`:** For defining inputs/outputs (used in static methods).
*   **`node_response()`:** For building the output array in `execute()`.
*   **`$this->emitEvent($inputs, array $eventData)`:** To send real-time events to the frontend UI (e.g., for progress updates displayed on the node).
*   **`$this->setVariable(...)` and `$this->getVariable(...)`:** To store and retrieve data in a scoped cache (WorkflowScope or NodeScope), useful for state management.
*   **AI Services:** If your node needs to interact with Large Language Models, you can use the `CozyAIService` (e.g., `CozyAIService::instance()->chat(...)`).
*   **Standard Laravel Services:** You can use Laravel's dependency injection or facades if needed, though nodes should generally aim to be self-contained units of logic.

## Optional Frontend Component (Blade File)

For nodes that require a custom user interface beyond the standard input fields (e.g., to display rich output, provide interactive controls, or show real-time visualizations), you can create an associated Blade template.

*   **Naming:** If your node class is `MyCustomNode.php`, its Blade template would be `MyCustomNode.blade.php` in the same directory.
*   **Purpose:** This template is rendered as the body of your node in the workflow editor.
*   **Data:** It receives a `$nodeId` variable and can use Alpine.js to react to events emitted by your node's `execute()` method via `$this->emitEvent()`.

```html
<!-- Example: MyCustomNode.blade.php -->
@props(['nodeId'])
<div x-data="{ customMessage: 'Waiting for execution...', nodeId: '{{$nodeId}}' }"
     x-init="
        window.addEventListener('workflow.NODE_EVENT', (event) => {
            if (event.detail.nodeId === nodeId && event.detail.myCustomEventData) {
                customMessage = event.detail.myCustomEventData.message;
            }
        });
     "
     class="p-2 text-sm text-gray-700 dark:text-gray-300">
    <p x-text="customMessage"></p>
</div>
```
And in your node's `execute()` method:
```php
$this->emitEvent($inputs, ['myCustomEventData' => ['message' => 'Processing complete!']]);
```

## Summary

The architecture of a CozyUI node is designed to be straightforward:

1.  **Define Metadata:** Tell the system what your node is and what parameters it uses (`getName`, `getDescription`, `getInputs`, `getOutputs`).
2.  **Implement Logic:** Write the core functionality in the `execute` method, taking inputs and returning outputs using the `node_response()` builder.
3.  **(Optional) Enhance UI:** Create a Blade template for custom frontend presentation.

By following this structure, your custom nodes will seamlessly integrate into the CozyUI environment.