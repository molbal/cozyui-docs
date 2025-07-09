---
title: Architecture of a Node
---

## Architecture of a Node

At its heart, a CozyUI Node is a PHP class that encapsulates a specific piece of functionality. To create your own custom node, you'll extend a base class provided by CozyUI and implement a set of required and optional methods. This structure ensures your node integrates smoothly with the workflow engine and the editor.


### The Node Class

Every node you create will be a PHP class that typically resides within the `App\Nodes` directory (often in a subdirectory reflecting its category, e.g., `App\Nodes\TextUtilities` or `App\Nodes\ImageProcessing`). This class must extend `App\Contracts\BaseCozyNode`. This base class provides foundational functionalities and ensures your node adheres to the necessary contract for the system.

```php
<?php

namespace App\Nodes\MyCustomNodes;

use App\Contracts\BaseCozyNode;

class MyCustomNode extends BaseCozyNode
{
    // ... Your node's implementation ...
}
```

---

### Core Static Methods (Metadata & Definition)

These static methods define what your node is, what it does, and how it interacts with other nodes. They are called by the system to understand your node's capabilities and to display it in the editor.

#### 1. getName()

Returns the human-readable name of your node as it will appear in the node selection menu and on the node itself in the workflow editor.

```php
public static function getName(): string
{
    return "Concatenate Strings";
}
```

#### 2. getDescription()

 Provides a brief description of what the node does. This is often shown as a tooltip or in a details panel in the editor.
```php
public static function getName(): string
{
    return "Joins multiple text inputs into a single string.";
}
```

#### 3. getInputs()

Defines the input parameters your node accepts.

**Return Value:** An array where each element is a built parameter schema using the `ParameterBuilder` class.

| Field Name        | Description                                                                                                                                    | Optional / Default                                      |
|-------------------|------------------------------------------------------------------------------------------------------------------------------------------------|---------------------------------------------------------|
| name              | The internal programmatic name of the input (e.g., `source_text`).                                                                             | Required                                                |
| type              | The fully qualified class name of the Parameter Type (e.g., `App\Parameters\Types\TextType::class`).                                           | Optional (Default: TextType) |
| canLink           | Whether this input can be linked from another node's output. If `false`, the user must provide a static value.                                 | Optional (default: `true`)                              |
| defaultLink       | If `canLink` is `true`, this determines if the input appears as a link by default or as a field for static input.                              | Optional (default: `true`)                              |
| description       | A description for the input, shown in the UI as a tooltip or help text and to aid LLMs in workflow execution.                                  | Optional                                                |
| specialParameters | An array for additional configuration, like providing a `default` value or UI hints (e.g., `['default' => 'Hello']`, `['multiline' => true]`). | Optional                                                |

**Usge Example:**
  ```php
  use App\Contracts\ParameterSchemaBuilder\ParameterBuilder;
  use App\Parameters\Types\TextType;

  public static function getInputs(): array
  {
      return [
          ParameterBuilder::input('text_a')
              ->setType(TextType::class)
              ->build(),
          ParameterBuilder::input('text_b')
              ->setType(TextType::class)
              ->setDefaultLink(true)
              ->setProperty('default', 'World')
              ->build(),
          ParameterBuilder::input('separator')
              ->setType(TextType::class)
              ->setCanLink(false)
              ->setProperty('default', ' ')
              ->setDescription('Must be a static value')
              ->build(),
      ];
  }
```

#### 4. getOutputs()
**Purpose:** Defines the output parameters your node produces.  
**Return Value:** An array where each element is a built parameter schema using the `ParameterBuilder` class.

| Field Name        | Description                                                                                                                | Optional / Default |
|-------------------|----------------------------------------------------------------------------------------------------------------------------|--------------------|
| name              | The internal programmatic name of the output (e.g., `combined_text`).                                                      | Required           |
| type              | The fully qualified class name of the Parameter Type (e.g., `App\Parameters\Types\TextType::class`).                       | Optional (Default: TextType)           |
| description       | A description for the output, shown in the UI as a tooltip or help text and to aid LLMs in workflow execution.  | Optional           |
| specialParameters | An array for additional configuration, like providing a `label` for UI display (e.g., `['label' => 'Concatenated Text']`). | Optional           |

**Usage Example:**

```php
use App\Contracts\ParameterSchemaBuilder\ParameterBuilder;
use App\Parameters\Types\TextType;

public static function getOutputs(): array
{
    return [
        ParameterBuilder::output('result')
            ->setType(TextType::class)
            ->setProperty('label', 'Concatenated Text')
            ->setDescription('The result of concatenating the input strings')
            ->build(),
    ];
}
```

#### 5. isOutputNode()

Indicates if this node should be considered a "final output" of a workflow. Output nodes often have side effects (like saving a file or displaying text to the user) and their completion can signify the end of a workflow path. If not implemented, it defaults to `false`.
```php
  public static function isOutputNode(): bool
  {
      return true;
  }
```


### The `execute()` Method

This is arguably the most important method of your node. It's where the actual work happens. It contains the logic that processes the input data and produces output data.

- **Parameters:**
`$inputs`: An associative array where keys are the `name`s of your defined input parameters, and values are the data received for those inputs.
The `$inputs` array also contains special internal keys prefixed with `__` (e.g., `__jobId`, `__nodeId`) providing context about the current execution. You generally don't need to interact with these directly unless for advanced logging or variable scoping.
- **Return Value:** An associative array representing the node's outputs.

  Use the `node_response()` helper to build this array. This is needed for proper and formatting.


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

If your node doesn't produce any data outputs (e.g., it only performs an action like saving a file and might be an `isOutputNode`), you can return an empty response:
  ```php
  return node_response()->void();
  ```

::: tip
You have access to various helper functions in your node, which are documented in the [Available Helpers](./helpers) section.
:::

---

### Optional Frontend Component (Blade File)

For nodes that require a custom user interface beyond the standard input fields (e.g., to display rich output, provide interactive controls, or show real-time visualizations), you can create an associated Blade template.

- **Naming:** If your node class is `MyCustomNode.php`, its Blade template would be `MyCustomNode.blade.php` in the same directory.
- **Purpose:** This template is rendered as the body of your node in the workflow editor.
- **Data:** It receives a `$nodeId` variable and can use Alpine.js to react to events emitted by your node's `execute()` method via `$this->emitEvent()`.

```html
<!-- Example: MyCustomNode.blade.php -->
@props(['nodeId'])

<div x-data="{
            customMessage: 'Waiting for execution...',
            nodeId: '{{$nodeId}}'
        }"
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

---

### Recap

The architecture of a CozyUI node is designed to be straightforward:

1. Tell the system what your node is and what parameters it uses (`getName`, `getDescription`, `getInputs`, `getOutputs`)
2. Write the core functionality in the `execute` method, taking inputs and returning outputs using the `node_response()` builder.
3. _Optionally_ create a Blade template for custom frontend presentation.

