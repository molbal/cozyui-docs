---
title: Node Development Toolkit
---

# Node Development Toolkit

CozyUI provides a comprehensive toolkit to aid in the development of custom nodes. This includes helper functions for defining your node's interface, utilities for managing state and interactivity, and conventions for understanding the execution context.

## Defining Node Parameters

These global helper functions are essential for declaring the inputs and outputs of your node. They are used within your node's static `getInputs()` and `getOutputs()` methods.

### `node_inparam()`

Use `node_inparam()` to define each **input parameter** your node accepts.

**Signature:**
`function node_inparam(string $name, string $className, bool $canLink = true, bool $defaultLink = true, array $specialParameters = []): array`

**Key Parameters:**

*   `$name` (string): The internal name for the input (e.g., `source_text`). This is the key in the `$inputs` array your `execute()` method receives.
*   `$className` (string): The [Parameter Type](/developers/core-concepts.html#parameter-types) class (e.g., `App\Parameters\Types\TextType::class`).
*   `$canLink` (bool): If `false`, the input must be a static value set by the user and cannot be linked.
*   `$defaultLink` (bool): If `$canLink` is `true`, determines if the input defaults to a link socket or a static field.
*   `$specialParameters` (array): For additional configuration like `'default'` values, UI hints (e.g., `'multiline' => true`, `'label' => 'Custom Label'`), or `'options'` for creating dropdowns.

**Example:**
```php
public static function getInputs(): array
{
    return [
        node_inparam('api_root', TextType::class, canLink: false), // Static input
        node_inparam('query', TextType::class, canLink: true, defaultLink: true, specialParameters: ['label' => 'Search Query']),
        node_inparam('max_results', NumberType::class, canLink: true, defaultLink: false, specialParameters: ['default' => 10]), // Static by default, linkable
    ];
}
```
::: tip
Note: parameter type names are not mandatory and can be omitted. This means that `node_inparam('api_root', TextType::class, canLink: false)` is effectively the same as `node_inparam('api_root', TextType::class, false)` - it is just easier to understand the parameter's behaviours if the parameter names are explicitly written out.  
:::
### `node_outparam()`

Use `node_outparam()` to define each **output parameter** your node produces.

**Signature:**
`function node_outparam(string $name, string $className, array $specialParameters = []): array`

**Key Parameters:**

*   `$name` (string): The internal name for the output (e.g., `processed_data`). This is the key you'll use when adding data with the `NodeResponseBuilder`.
*   `$className` (string): The [Parameter Type](/developers/core-concepts.html#_4-parameter-types) class (e.g., `App\Parameters\Types\ArrayType::class`).
    *   Using `App\Parameters\Types\NodeTriggerType::class` designates this output as an execution trigger for a connected Leaf.
*   `$specialParameters` (array): For additional configuration, such as a custom `'label'` for the output socket.

**Example:**
```php
public static function getOutputs(): array
{
    return [
        node_outparam('results_array', ArrayType::class, ['label' => 'Processed Items']),
        node_outparam('on_finish_trigger', NodeTriggerType::class),
    ];
}
```

## Building Node Responses

When your node's `execute()` method finishes, it must return an array detailing its outputs and any triggered execution paths. The `NodeResponseBuilder` facilitates this.

### `node_response()`

This global helper function initializes and returns an instance of the `NodeResponseBuilder`.

**Signature:**
`function node_response(): NodeResponseBuilder`

**`NodeResponseBuilder` Key Methods:**

#### `add`
`->add(string $name, mixed $value, string $className = ""): self`

Adds a data output to the response. $name matches an output name from `getOutputs()`. $value is the data for this output. $className (optional) is the Parameter Type class for validation.

#### `trigger`
`->trigger(string $outputName): self`

Activates a `NodeTriggerType` output, initiating any connected Leaf. `$outputName` is the name of the `NodeTriggerType` output to fire.
#### `backtrack`
`->backtrack(): self`

Signals that this node should re-execute after any Leaf it triggered via `->trigger()` completes. This is needed for loops/iterative logic.
#### `build`
`->build(): array`

Finalizes and returns the response array for your `execute()` method.
#### `void`
`->void(): array`

Returns an empty response array, for nodes that produce no data outputs or triggers (e.g., side-effect nodes).

**Example:**
```php
public function execute(array $inputs): array
{
    $data = "Some result";
    // ...
    return node_response()
        ->add('output_data_name', $data, TextType::class)
        ->trigger('next_step_trigger')
        ->build();
}
```

## Managing Node State (Persistence)

Your node (which extends `BaseCozyNode`) can store and retrieve data that persists across its own executions within a workflow run, or even across different nodes in the same workflow. This is handled via cached variables.

### Set variable
`protected function setVariable(array $inputs, VariableScope $scope, string $key, mixed $value): void`

*   Stores `$value` in a scoped cache.
*   `$inputs`: The `$inputs` array from `execute()` (provides context like Job ID, Node ID).
*   `$scope` (enum `App\Executor\VariableScope`):
    *   `WorkflowScope`: Accessible by any node in the current workflow job.
    *   `NodeScope`: Scoped to the current node instance (uses Job ID + Node ID). The node type will remember this value during the entire workflow, even if the leaf which it is contained in executes again.
    *   `NodeExecutionContextScope`: Scoped to a specific execution context of the node (uses Job ID + Node ID + Execution Context ID), for very fine-grained state in complex re-entrant scenarios. In simpler terms, if a node persists a variable with this scope, and the leaf is triggered again, this variable is forgotten.
*   `$key` (string): Your custom identifier for the variable.
*   `$value` (mixed): The data to store. It needs to be serializable.

::: tip
If this is too much and you are unsure what to choose, select `NodeExecutionContextScope`
:::

### Read variable
`protected function getVariable(array $inputs, VariableScope $scope, string $key, mixed $default = null): mixed`

*   Retrieves a variable from the scoped cache. Note: Exactly the same scope needs to be applied when reading a variable when you set it, otherwise the getVariable function will not find it. 
*   Parameters are the same as `setVariable()`, with `$default` returned if the key isn't found.

**Example (Iteration Counter):**
```php
// In execute()
$count = $this->getVariable($inputs, VariableScope::NodeExecutionContextScope, 'iteration_count', 0);
$this->emitEvent($inputs, ['message' => "Current iteration: $count"]);
// ...
$this->setVariable($inputs, VariableScope::NodeScope, 'iteration_count', $count + 1);
```

## Interacting with the Frontend

Nodes can send real-time updates to their visual representation in the workflow editor.

### Emit event
`protected function emitEvent(array $inputs, array $eventData): void`

*   Sends an event from your node's backend logic to its (optional) frontend Blade component.
*   `$inputs`: The `$inputs` array from `execute()` (provides context like Job ID, Node ID for routing).
*   `$eventData`: An associative array of data to send. This will be accessible in the `event.detail` of a `workflow.NODE_EVENT` JavaScript listener on the frontend.
*   **Use Cases:** Displaying progress, logs, intermediate results, or dynamically updating custom UI elements.

**Example:**
```php
// In execute()
$this->emitEvent($inputs, ['update' => ['statusText' => 'Task 50% complete']]);
```

## Understanding Execution Context Inputs

The `$inputs` array passed to your node's `execute()` method contains more than just the data for parameters defined in `getInputs()`. The workflow engine injects special keys (prefixed with `__`) that provide crucial context about the current execution.

*   **`$inputs['__jobId']` (string):** The unique ID for the current workflow job run.
*   **`$inputs['__nodeId']` (string):** The unique ID of *this specific instance* of your node in the workflow.
*   **`$inputs['__leafId']` (string|null):** The ID of the Leaf this node is part of, or `null` if it's a top-level node.
*   **`$inputs['__executionContextState']` (string|null):** An ID for the specific execution context, relevant for `VariableScope::NodeExecutionContextScope`.
*   **`$inputs['__backtrack']` (bool, optional):** If `true`, this node is being re-executed after a Leaf it triggered (and requested backtracking for) has completed.

While you usually don't need these `__` parameters, they are implicitly used by helpers like `$this->emitEvent()` and `$this->setVariable()`. You can also check the backtrack status directly.

### Is the node backtracked?

A global helper function to determine if the current execution of your node is a "backtrack" call.

**Signature:**
`function node_is_backtracked(array $inputs): bool`

**Parameters:**
*   `$inputs`: The `$inputs` array passed to your `execute()` method.

**Returns:** `true` if `$inputs['__backtrack']` is set and true, `false` otherwise.

**Example:**
```php
public function execute(array $inputs): array
{
    if (node_is_backtracked($inputs)) {
        // Logic for when the node re-runs after a child Leaf
        $iteration = $this->getVariable($inputs, VariableScope::NodeScope, 'current_item_index');
        // ... process next item
    } else {
        // Initial execution logic
        $this->setVariable($inputs, VariableScope::NodeScope, 'current_item_index', 0);
    }
    // ...
}
```

## Laravel Framework helpers
The backend of CozyUI is built using the Laravel PHP framework. The framework itself comes with handy helper methods, you are encouraged to use them:
- [Laravel Helpers documentation](https://laravel.com/docs/12.x/helpers)
- [Laravel HTTP Client](https://laravel.com/docs/12.x/http-client)