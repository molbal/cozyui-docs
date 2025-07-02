---
title: Node Development Toolkit
---

# Node Development Toolkit

CozyUI provides a comprehensive toolkit to aid in the development of custom nodes. This includes helper classes for defining your node's interface, utilities for managing state and interactivity, and conventions for understanding the execution context.

## Defining Node Parameters

Use the  `ParameterBuilder` class to define node parameters within your node's static `getInputs()` and `getOutputs()` methods.

### `ParameterBuilder::input()`

Use `ParameterBuilder::input()` to define each **input parameter** your node accepts.

**Chained Methods and Defaults:**

- **`setType(string $className)`**  
  Sets the parameter type. The default type is `App\Parameters\Types\TextType::class`.

- **`setDefaultLink(bool $value)`**  
  Determines if the input defaults to a link socket. The default is `true`.

- **`setProperty(string $key, mixed $value)`**  
  Sets additional UI or configuration properties (e.g., `'multiline' => true`, `'options' => [...]`).

- **`build()`**  
  Finalizes and returns the parameter configuration array.

**Example:**
```php
public static function getInputs(): array
{
    return [
        ParameterBuilder::input('api_root')
            ->setType(App\Parameters\Types\TextType::class)
            ->setDefaultLink(false) // static input: cannot link
            ->build(),
        ParameterBuilder::input('query')
            ->setType(App\Parameters\Types\TextType::class)
            ->build(), // defaults to linkable with TextType
        ParameterBuilder::input('max_results')
            ->setType(App\Parameters\Types\NumberType::class)
            ->setDefaultLink(false)
            ->setProperty('default', 10) // default value of 10
            ->build(),
    ];
}
````

::: details Defaults
If you do not customize the builder, the following defaults will be applied, for both input and output parameters:

* **Type:** `App\Parameters\Types\TextType::class`
* **Link behavior:** `canLink = true` and `defaultLink = true`
* **Properties:** An empty array (`[]`)
:::

### `ParameterBuilder::output()`

Use `ParameterBuilder::output()` to define each **output parameter** your node produces.

**Chained Methods and Defaults:**

* **`setType(string $className)`**
  Sets the parameter type. The default type is `App\Parameters\Types\TextType::class`.

* **`build()`**
  Finalizes and returns the parameter configuration array.

**Example:**

```php
public static function getOutputs(): array
{
    return [
        ParameterBuilder::output('results_array')
            ->setType(App\Parameters\Types\ArrayType::class)
            ->setProperty('label', 'Processed Items')
            ->build(),
        ParameterBuilder::output('on_finish_trigger')
            ->setType(App\Parameters\Types\NodeTriggerType::class)
            ->build(),
    ];
}
```
::: warning
While it might be tempting to directly use `node_inparam`, `node_outparam` or just an array, using the ParameterBuilder class will result in code that is easier to read.
:::

## Building Node Responses

When your node's `execute()` method finishes, it must return an array detailing its outputs and any triggered execution paths. The `NodeResponseBuilder` facilitates this.

### `node_response()`

This global helper function initializes and returns an instance of the `NodeResponseBuilder`.

**Signature:**

```php
function node_response(): NodeResponseBuilder
```

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

Your node (which extends [BaseCozyNode](https://github.com/molbal/CozyUI/blob/master/app/Contracts/BaseCozyNode.php)) can store and retrieve data that persists across its own executions within a workflow run, or even across different nodes in the same workflow. This is handled via cached variables.

### Set variable

```php
protected function setVariable(array $inputs, VariableScope $scope, string $key, mixed $value): void
```

* **Purpose:** Stores `$value` in a scoped cache.
* **Parameters:**

    * `$inputs`: The `$inputs` array from `execute()` (provides context like Job ID, Node ID).
    * `$scope`: One of `VariableScope::WorkflowScope`, `VariableScope::NodeScope`, or `VariableScope::NodeExecutionContextScope`.
    * `$key`: A custom identifier for the variable.
    * `$value`: The data to store (must be serializable).

### Read variable

```php
protected function getVariable(array $inputs, VariableScope $scope, string $key, mixed $default = null): mixed
```

* **Purpose:** Retrieves a variable from the scoped cache. Returns `$default` if the key isn't found.
* **Usage Example (Iteration Counter):**

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

```php
protected function emitEvent(array $inputs, array $eventData): void
```

* **Usage:** Sends an event from your node's backend logic to its (optional) frontend Blade component.
* **Parameters:**

    * `$inputs`: The `$inputs` array from `execute()` (provides context like Job ID, Node ID for routing).
    * `$eventData`: An associative array of data to send. This will be accessible in the JavaScript `workflow.NODE_EVENT` listener on the frontend.

**Example:**

```php
// In execute()
$this->emitEvent($inputs, ['update' => ['statusText' => 'Task 50% complete']]);
```

## Understanding Execution Context Inputs

The `$inputs` array passed to your node's `execute()` method contains more than just the data for parameters defined in `getInputs()`. The workflow engine injects special keys (prefixed with `__`) that provide crucial context about the current execution.

* **`$inputs['__jobId']` (string):** The unique ID for the current workflow job run.
* **`$inputs['__nodeId']` (string):** The unique ID of *this specific instance* of your node in the workflow.
* **`$inputs['__leafId']` (string|null):** The ID of the Leaf this node is part of, or `null` if it's a top-level node.
* **`$inputs['__executionContextState']` (string|null):** An ID for the specific execution context, relevant for `VariableScope::NodeExecutionContextScope`.
* **`$inputs['__backtrack']` (bool, optional):** If `true`, this node is being re-executed after a Leaf it triggered (and requested backtracking for) has completed.

These `__` parameters are implicitly used by helpers like `$this->emitEvent()` and `$this->setVariable()`. You can also check backtrack status directly using:

### Checking for Backtracking

A global helper function is provided to determine if the current execution is a "backtrack" call:

```php
function node_is_backtracked(array $inputs): bool
```

Returns `true` if `$inputs['__backtrack']` is set and true; otherwise, returns `false`.

**Example:**

```php
public function execute(array $inputs): array
{
    if (node_is_backtracked($inputs)) {
        // Logic for node re-execution after a child Leaf completes
        $iteration = $this->getVariable($inputs, VariableScope::NodeScope, 'current_item_index');
        // ... process next item
    } else {
        // Initial execution logic
        $this->setVariable($inputs, VariableScope::NodeScope, 'current_item_index', 0);
    }
    // ...
}
```

## Laravel Framework Helpers

The backend of CozyUI is built using the Laravel PHP framework. You are encouraged to use Laravel’s helper methods:

* [Laravel Helpers Documentation](https://laravel.com/docs/12.x/helpers)
* [Laravel HTTP Client](https://laravel.com/docs/12.x/http-client)
