---
title: Workflows with Tool Use
---

# Design Pattern: Agentic Workflows with Tool Use

This advanced design pattern represents a significant leap in capability for your CozyUI workflows. Instead of you, the designer, explicitly wiring every step, you empower a language model to act as an **autonomous agent**. This agent can analyze a problem, decide which "tools" it needs to solve it, use those tools, and then formulate a final answer based on the results.

In CozyUI, these "tools" are simply other CozyUI nodes. Just as you can drop and link the nodes together, the LLM can dynamically choose nodes from a pre-configured list and can invoke them.


## What is an Agent in CozyUI?

An agent is a workflow where the path to the solution is not hardcoded. It's an open-ended problem-solver. Once you give it a clear goal, the agent operates independently:

*   It **reasons** about the request and **plans** a sequence of steps.
*   It **acts** by selecting and calling the most appropriate tool (a CozyUI node) for each step.
*   It **observes** the results from the tool—this is its "ground truth" from the environment, which it uses to assess its progress.
*   It **iterates**, using the results to decide on the next step, potentially calling more tools until the goal is met.

This entire reasoning loop happens automatically within a single, powerful node.

## The Core Components of an Agentic Workflow

1.  **`Select Nodes as LLM Tools` Node:** This is your "toolbox." You use its interface to curate a specific set of CozyUI nodes that the agent is allowed to use.
2.  **`Tool Using LLM` Node:** This is the "brain" of your agent. It takes your main prompt (the goal) and the toolbox, and then begins its autonomous reasoning loop.
3.  **The "Tool" Nodes:** These are the standard CozyUI nodes you select. They perform the actual work when called upon. Powerful tools for an agent include:
    *   `Web Search` or `Fetch URL`: To gather external, real-time information.
    *   `SummarizeUrl`: To efficiently process web content.
    *   `Execute PHP Code`: To perform precise calculations, data transformations, or complex formatting that LLMs often struggle with.
    *   `Save File`: To create persistent results.

## Example: Generating a Formatted Sales Report from API Data

This use case highlights where an agent excels, particularly with the `Execute PHP Code` tool for tasks requiring precision.

*   **Your Goal (Prompt):** "Fetch the weekly sales data from the API at `http://api.example.com/sales/weekly`. This API returns JSON. Calculate the total revenue and the average sale value. Then, present this analysis in a clean Markdown table, listing each item, its quantity, and its sub-total."

*   **The Agent's Internal Monologue (simplified):**
    1.  **Reason:** "I need to get data from a URL. The `Fetch URL` tool is perfect for this."
    2.  **Act:** *(Agent calls `Fetch URL` with `http://api.example.com/sales/weekly`)*.
    3.  **Observe:** "I have the result. It's a JSON string: `[{"item_id": "wd-101", "price": 19.99, "quantity": 15}, {"item_id": "wd-102", "price": 49.99, "quantity": 8}]`."
    4.  **Reason:** "Now I need to parse this JSON, loop through each item, calculate `price * quantity` for each, sum those for a total revenue, and then calculate an average. This involves precise math and structured data handling. An LLM might make a math error. The `Execute PHP Code` tool is the most reliable way to do this."
    5.  **Act:** *(Agent calls the `Execute PHP Code` tool. It dynamically generates and passes the following PHP script as the `code` input for the tool)*:
        ```php
        $data = json_decode($inputs['json_data'], true);
        $totalRevenue = 0;
        $totalItemsSold = 0;
        $table = "| Item ID | Quantity | Sub-Total |\n";
        $table .= "|---|---|---|\n";

        foreach ($data as $item) {
            $subTotal = $item['price'] * $item['quantity'];
            $totalRevenue += $subTotal;
            $totalItemsSold += $item['quantity'];
            $table .= "| {$item['item_id']} | {$item['quantity']} | \${$subTotal} |\n";
        }

        $averageSale = $totalItemsSold > 0 ? $totalRevenue / $totalItemsSold : 0;

        $report = "## Weekly Sales Report\n\n";
        $report .= $table;
        $report .= "\n**Total Revenue:** $" . number_format($totalRevenue, 2);
        $report .= "\n**Average Sale Value:** $" . number_format($averageSale, 2);

        return $report;
        ```
    6.  **Observe:** "The `Execute PHP Code` tool returned a perfectly formatted Markdown string with the correct calculations. This is my ground truth."
    7.  **Reason:** "I have fulfilled all parts of the request. The task is complete."
    8.  *(Agent outputs the final Markdown report).*

::: warning
TODO screenshot
:::

## Best Practices & Guardrails

Building autonomous agents is powerful, but requires care.

1.  **Craft a Clear, Goal-Oriented Prompt:** Your prompt should define the *what* (the final goal), not the *how*. Let the agent determine the steps. A good prompt acts as the agent's mission statement.

2.  **Curate the Toolbox Thoughtfully:** Don't provide every available node. A smaller, well-chosen set of tools leads to more efficient and predictable behavior. The `Execute PHP Code` node is a powerful "swiss army knife" that allows the agent to create its own solutions for data manipulation and calculation.

3.  **Choose the Right Model:** Inside the `Tool Using LLM` node, select a model family designed for reasoning and planning. More capable models are generally better at complex tool use.

4.  **Observe and Debug:** The `Tool Using LLM` node emits events showing its internal process: which tools it's calling, with what inputs, and what results it gets back. Use these events to understand your agent's "thought process" and identify where it might be struggling.

5.  **Implement Guardrails and Stopping Conditions:** The autonomous nature of agents means they can potentially run for many steps, increasing costs and the chance of "compounding errors" where one small mistake leads to bigger ones.
    *   The `Tool Using LLM` node has a built-in maximum number of tool calls to prevent infinite loops.
    *   For critical workflows, consider adding a final human-in-the-loop review step before taking a final action.
    *   Always test agents thoroughly in a safe environment before deploying them for production tasks.

By embracing this pattern, you move from being a workflow *designer* to being an agent *manager*: setting goals, providing capabilities, and overseeing a powerful, autonomous system to solve complex, open-ended problems.