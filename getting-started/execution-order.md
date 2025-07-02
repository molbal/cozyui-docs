---
title: "How Workflows Run: The Execution Order "
---

# How Workflows Run: The Execution Order

Ever wondered why one node in your workflow runs before another? Or why a node seems to be "waiting" for something? CozyUI follows a simple and predictable set of rules to decide the order of operations. Understanding these rules will help you design more powerful and reliable workflows.

## The Golden Rule: Information First

The most important rule in CozyUI is: **A node will only run when it has all the information it needs.**

Think of your workflow like a recipe. A node is a step in that recipe, like "mix ingredients" or "bake in oven." A node can't start its job until it has received all of its required "ingredients" (its inputs).

*   If you have a "Translate Text" node, it will patiently wait until it receives the text it needs to translate.
*   If a node has multiple inputs (e.g., it needs a `title`, a `body`, and an `author`), it will wait until all three pieces of information have arrived through their connections.

Nodes that don't need any incoming information (like an `Input Text` node where you type the value yourself) are the natural starting points of your workflow.

## How CozyUI Follows the Flow

CozyUI constantly checks your workflow to see which nodes are ready to run. The process looks like this:

1.  **Find the Starters:** CozyUI first looks for any nodes that have all their "ingredients" ready. These are the nodes that can start immediately.
2.  **Run the Action:** It runs these ready nodes.
3.  **Deliver the Results:** Once a node finishes, CozyUI takes its output and sends it along the "wires" (Connections) to the next nodes in the sequence.
4.  **Wake Up the Next Node:** When a waiting node receives the last piece of information it was missing, it "wakes up" and becomes ready to run.
5.  **Repeat:** CozyUI repeats this process—running ready nodes and delivering results—until the entire workflow is complete.

## The Two Types of Connections

The "wires" you draw between nodes behave in two distinct ways:

*   **Information Wires (Data Links):** These are the most common. They carry the *result* from one node to another. They are the delivery routes for the "ingredients" in our recipe analogy.

*   **"Go Signal" Wires (Trigger Links):** These are special connections, often coming from control nodes like `If` or `For Loop`. They don't carry information to be processed; instead, they give a "go signal" to kick off an entire group of actions inside a **Leaf**.

## Running Actions Inside a Leaf

When a Leaf receives a "go signal" from a trigger wire, the same "Information First" rule applies to all the nodes *inside* that Leaf. CozyUI will figure out the correct order for the nodes within the Leaf based on how they are connected to each other.

## The "Wait and Resume" Trick (Backtracking)

Some control nodes, like `IterateOverArray`, have a special ability. Think of them as a manager delegating tasks.

1.  The `IterateOverArray` node (the manager) takes a list and sends the *first item* to a Leaf (the worker) for processing.
2.  It then tells CozyUI: "Wait for that Leaf to completely finish its job, and then come back to me."
3.  Once the Leaf has finished processing the first item, CozyUI goes back to the `IterateOverArray` node.
4.  The node then "resumes" and sends the *second item* to the Leaf, repeating the process.

This "wait and resume" behavior is what makes loops and iteration possible.

## When is the Job Done?

Your workflow will stop running when one of these things happens:

*   It has reached the end, and all the final "Output Nodes" (like `DisplayText` or `Save File`) have finished their jobs.
*   There are no more nodes that can run because they are all still waiting for information that will never arrive (indicating a possible break in your workflow's logic).
*   A node encounters an error it cannot recover from.

## Best Practices

*   **Think About the Path:** As you connect nodes, visualize the path your information will take.
*   **Feed Your Nodes:** Ensure every node input that needs information has a connection delivering it. An unconnected input on a node will cause it to wait forever.
*   **Use Triggers for Control:** Use `If` nodes and `For Loop` nodes with their "go signal" triggers to direct the flow of your workflow and decide which Leaves should run.
*   **Check Your Logic:** If your workflow gets stuck, the most common reason is a node that is waiting for an input that isn't being provided. Trace your connections back to find the missing link