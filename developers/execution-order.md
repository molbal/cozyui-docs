---
title: Execution Order
description: Understanding how CozyUI determines the sequence of node execution in a workflow.
---


# Execution Order

Understanding how CozyUI determines the sequence in which your nodes execute is key to building predictable and effective workflows. While much of this is handled automatically by the workflow engine, knowing the underlying principles can help you design more robust custom nodes.

## The Core Principle: Data First

The most fundamental rule governing execution order is **data dependency**.

*   **A node will only execute when all its required *data inputs* are available.**

Data becomes available for an input when a preceding node, connected to that input via a data link, successfully completes its execution and provides an output. If a node has multiple data inputs, it will wait until all of them have received their data.

Nodes that have no incoming data dependencies (e.g., their inputs are set manually by the user and not linked, or they are "Input" type nodes that provide initial data) are typically among the first to execute.

## How the Engine Determines Order

The workflow engine analyzes your node connections to build an execution plan:

1.  **Identifies Starters:** It first looks for nodes that can run immediately – those with no unsatisfied data dependencies.
2.  **Processes Nodes:** As a node executes and completes, its output data becomes available.
3.  **Finds Next Ready Nodes:** The engine then identifies any subsequent nodes whose data inputs are now fully satisfied due to the completion of the previous node(s). These newly ready nodes are queued for execution.
4.  **Repeats:** This process repeats, with the engine working through the "ready" queue, until no more nodes can be executed.

## The Role of Connections

Connections (the "wires" between nodes) hold the workflow together:

*   **Data Links:** These are the most common type. They carry data from an output parameter of one node to an input parameter of another. These directly inform the "Data First" principle.
*   **Trigger Links:** Some output parameters are special "trigger" types (often used by control flow nodes like "If" or "For Loop"). These connections don't primarily carry data that a subsequent node *waits* for in the same way. Instead, they signal that a target leaf should be initiated.
    *   A leaf connected via a trigger link will generally execute once the trigger fires.
    *   Triggers are essential for directing the flow of execution based on conditions or iterative logic.

## Execution within Leaves (Sub-Workflows)

Workflows can be organized into "Leaves," which are essentially sub-workflows or groups of nodes.

*   When a Leaf is triggered (usually by a control node), the execution order *within that Leaf* follows the same "Data First" principle, considering only the nodes and connections defined inside that specific Leaf.
*   Nodes within a Leaf can receive data from nodes outside the Leaf (passed in when the Leaf is triggered or via direct links) or from other nodes within the same Leaf.
*   A Leaf is considered complete when its own internal execution flow finishes.

## Backtracking after Leaf Execution

Certain advanced control nodes (like iterators) have a special behavior:

1.  They might trigger a Leaf to execute (e.g., the body of a loop).
2.  After the *entire Leaf* has completed its execution, the original control node can be scheduled to run *again*. This allows it to, for example, process the next item in a list or decide if the loop should continue.

This "backtracking" means the triggering node effectively pauses, lets the Leaf run, and then resumes.

## Parallel Execution Paths

If your workflow has branches where multiple nodes become ready simultaneously and don't depend on each other, they might appear to execute in parallel. The engine will process them as they become available in the ready queue. However, for specific timing-dependent operations between unrelated nodes, it's best not to assume a precise parallel execution order unless the workflow logic explicitly enforces it.

## When Does a Workflow Stop?

A workflow generally concludes when:

*   All designated "Output Nodes" (nodes specifically marked as producing a final result or side-effect, like "Display Text" or "Save File") have successfully executed.
*   There are no more nodes ready to run in any active part of the workflow (i.e., the "ready" queue is empty and no more nodes can become ready).
*   An unrecoverable error occurs in one of the nodes.

## Key Takeaways for Node Developers

*   **Define Clear Inputs/Outputs:** The types and requirements of your node's inputs and outputs are the primary drivers of its place in the execution order.
*   **Data Availability is King:** Your node will run when its data inputs are met.
*   **Triggers for Control:** If your node needs to explicitly start another part of the workflow without necessarily passing data that the next node *waits* for, use a trigger-type output.
*   **Emit Data Promptly:** Once your node's `execute` method is complete, the outputs you return will make data available for downstream nodes.