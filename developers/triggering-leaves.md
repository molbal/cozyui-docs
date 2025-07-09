---
title: Triggering Leaves & Iteration
---

# Triggering Leaves & Iteration

A powerful feature of CozyUI is the ability for your custom nodes to control the execution flow by triggering "Leaves" (sub-workflows). This is fundamental for creating conditional logic, loops, and other complex behaviors. This guide explains how your node can trigger a Leaf and manage iterative processes using backtracking.

## What is a Leaf?

Think of a **Leaf** as a self-contained group of nodes and connections within your main workflow – essentially a sub-workflow. Leaves help organize complex logic and can be executed multiple times or conditionally.

## Triggering a Leaf

To make your node trigger a Leaf, you need to:

1.  **Define a `NodeTriggerType` Output:** In your node's `getOutputs()` method, define an output parameter with the type `App\Parameters\Types\NodeTriggerType::class`. This output socket in the editor is what users will connect to the input trigger of a Leaf.

    ```php
    // In your Node class
    use App\Parameters\Types\NodeTriggerType;

    public static function getOutputs(): array
    {
        return [
            // ... other outputs ...
            node_outparam('loop_body_trigger', NodeTriggerType::class, ['label' => 'Each Item']),
            node_outparam('on_complete_trigger', NodeTriggerType::class, ['label' => 'After Loop']),
        ];
    }
    ```

2.  **Use the `->trigger()` Method in `execute()`:** Within your `execute()` method, when your logic determines that a Leaf should be executed, use the `->trigger()` method of the `NodeResponseBuilder`. The argument to `->trigger()` is the *name* of the `NodeTriggerType` output you defined.

    ```php
    // In your Node's execute() method
    public function execute(array $inputs): array
    {
        // ... some logic ...

        if ($conditionToExecuteLeaf) {
            return node_response()
                // ... add other data outputs if any ...
                ->trigger('loop_body_trigger') // Name matches the output defined above
                ->build();
        }
        // ...
    }
    ```

When your node returns this response, the workflow engine will:
*   Identify the Leaf connected to the `loop_body_trigger` output.
*   Initiate the execution of that Leaf.

## Iteration with Leaves and Backtracking

Triggering a Leaf once is straightforward. However, many use cases involve iteration, such as processing each item in an array or running a block of nodes a specific number of times. This is where **backtracking** becomes essential.

**The Concept:**

1.  Your node (the "iterator node") decides to process an item or perform one step of a loop.
2.  It triggers a Leaf (the "loop body Leaf"), which contains the nodes that operate on that single item or perform that single loop step.
3.  Crucially, the iterator node tells the engine: "After this Leaf finishes, come back and execute *me* again." This is **backtracking**.
4.  When the Leaf completes, the engine re-executes your iterator node.
5.  Your iterator node can then check its state (e.g., current index, remaining iterations), decide if it needs to process another item/step, and if so, trigger the Leaf again with new context.
6.  This cycle continues until your iterator node decides the loop is complete, at which point it might trigger a different "on complete" path.

**Implementing an Iterator Node (Conceptual Example - like `IterateOverArray`):**

Let's imagine an `IterateOverArray` node.

**1. State Management:**
   Your node will need to remember its current position in the array. Use `VariableScope::NodeScope` with `$this->setVariable()` and `$this->getVariable()` to store and retrieve the current index.

**2. `getInputs()` and `getOutputs()`:**
   ```php
   public static function getInputs(): array
   {
       return [
           node_inparam('source_array', ArrayType::class),
       ];
   }

   public static function getOutputs(): array
   {
       return [
           node_outparam('current_item', TextType::class), // Or whatever type the array elements are
           node_outparam('current_index', NumberType::class),
           node_outparam('each_item_body', NodeTriggerType::class, ['label' => 'Process Item (Leaf)']),
           node_outparam('after_all_items', NodeTriggerType::class, ['label' => 'Loop Complete']),
       ];
   }
   ```

**3. `execute()` Method Logic:**

   ```php
   public function execute(array $inputs): array
   {
       $arrayToIterate = $inputs['source_array'] ?? [];
       $totalItems = count($arrayToIterate);

       // Get current index from node-scoped variable, default to 0 for first run
       // The node_is_backtracked() check is useful here if initial setup differs from subsequent runs.
       $currentIndex = $this->getVariable($inputs, VariableScope::NodeExecutionContextScope, 'iterator_current_index', 0);

       if ($currentIndex < $totalItems) {
           // We have more items to process
           $currentItemValue = $arrayToIterate[$currentIndex];

           // Prepare for the next iteration by incrementing and storing the index
           $this->setVariable($inputs, VariableScope::NodeExecutionContextScope, 'iterator_current_index', $currentIndex + 1);

           // Emit an event to show progress on the node UI (optional)
           $this->emitEvent($inputs, [
               'message' => 'Processing item ' . ($currentIndex + 1) . ' of ' . $totalItems,
               'details' => ['value' => $currentItemValue]
           ]);

           // Build the response:
           // 1. Add data outputs for the current item and index.
           // 2. Trigger the 'each_item_body' Leaf.
           // 3. Request backtracking so this node runs again after the Leaf.
           return node_response()
               ->add('current_item', $currentItemValue)
               ->add('current_index', $currentIndex)
               ->trigger('each_item_body') // Triggers the Leaf connected to this output
               ->backtrack()              // IMPORTANT: Tells the engine to re-execute this node after the Leaf
               ->build();

       } else {
           // All items processed, loop is complete
           $this->emitEvent($inputs, ['message' => 'Finished iterating ' . $totalItems . ' items.']);

           // Reset the index for potential future re-runs of this node instance if the workflow loops
           $this->setVariable($inputs, VariableScope::NodeScope, 'iterator_current_index', 0);

           // Trigger the 'after_all_items' path and do NOT backtrack
           return node_response()
               ->trigger('after_all_items')
               ->build();
       }
   }
   ```

**How it Works with the Engine:**

1.  **First Execution:** `IterateOverArray` runs. `$currentIndex` is 0. It outputs the first item, triggers the `each_item_body` Leaf, and requests backtracking.
2.  **Leaf Executes:** The nodes within the `each_item_body` Leaf execute, processing the first item.
3.  **Backtrack:** Once the Leaf completes, the engine sees the backtrack request. It re-queues `IterateOverArray` for execution.
4.  **Second Execution of Iterator:** `IterateOverArray` runs again. `node_is_backtracked($inputs)` would be true. It retrieves `$currentIndex` (which is now 1 due to the previous `setVariable`). It outputs the second item, triggers the Leaf, and requests backtracking again.
5.  **Cycle Repeats:** This continues until `$currentIndex` equals `$totalItems`.
6.  **Loop Completion:** `IterateOverArray` now takes the `else` path, triggers the `after_all_items` Leaf (or path), and does *not* request backtracking, thus ending the loop.

**Best practices for iterative nodes:**

*   **State Management:** Use `$this->setVariable()` and `$this->getVariable()` with `VariableScope::NodeExecutionContextScope` to keep track of your iteration state (e.g., current index, remaining count), because variables with `VariableScope::NodeExecutionContextScope` scope reset if the leaf it is contained in is triggered again.
*   **`NodeTriggerType` Output:** Define an output to trigger the "body" of your loop (the Leaf).
*   **`->trigger()`:** Call this on your `NodeResponseBuilder` to activate the Leaf.
*   **`->backtrack()`:** This is the magic. Call this on your `NodeResponseBuilder` if you want your node to run again after the triggered Leaf completes.
*   **Termination Condition:** Ensure your logic has a clear condition to stop iterating and potentially trigger a different "completion" path without backtracking.

By understanding how to trigger Leaves and utilize backtracking, you can create sophisticated control flow nodes that manage complex iterative processes within CozyUI workflows.