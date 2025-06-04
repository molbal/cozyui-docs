---
title: Prompt Orchestration (Orchestrator-Workers)
---

# Prompt Orchestration (Orchestrator-Workers)

The **Prompt Orchestration** pattern, also known as the **Orchestrator-Workers** model, is a sophisticated approach for tackling complex, multi-faceted problems in CozyUI. It involves a central "Orchestrator" Large Language Model (LLM) that dynamically breaks down a high-level task into smaller sub-tasks, delegates these sub-tasks to specialized "Worker" LLMs (other CozyUI Leaves), and then synthesizes their results to achieve the overall goal.

::: tip
This is an advanced design pattern, recommended for experienced users only.
::: 


## What is Prompt Orchestration?

Imagine you have a complex project that requires several different kinds of expertise or actions, and the exact steps needed might change depending on the specifics of the project. Instead of trying to define a rigid, fixed sequence of steps, prompt orchestration works like this:

1.  **The Orchestrator LLM:**
    *   Receives the main task or goal (e.g., "Write a comprehensive research report on Topic X," or "Develop a new software feature Y").
    *   **Plans:** Analyzes the task and breaks it down into a series of logical sub-tasks or questions that need to be addressed.
    *   **Delegates:** For each sub-task, it determines what kind of "worker" is needed (e.g., a worker LLM specialized in web searching, another in data analysis, another in content generation) and formulates a specific prompt or instruction for that worker.
    *   **Synthesizes:** As workers complete their sub-tasks and return results, the orchestrator gathers this information, potentially performs further analysis, and combines it to produce the final output or decide on the next set of sub-tasks.

2.  **The Worker LLMs/Nodes/Leaves:**
    *   Each worker is responsible for a more focused, specialized part of the overall task.
    *   They receive their instructions and context from the orchestrator.
    *   They execute their specific function (e.g., analyze a piece of data, write a paragraph on a specific sub-topic).
    *   They return their results to the orchestrator.

This process can be iterative, with the orchestrator potentially delegating multiple rounds of sub-tasks based on the results it receives.

## Why Use Prompt Orchestration?

*   **Handles Unpredictable Complexity:** This pattern shines when you can't pre-define all the necessary steps in advance. The orchestrator can dynamically adapt the plan based on the input and intermediate findings.
*   **Leverages Specialization:** You can use specialized prompts for each worker, ensuring that each sub-task is handled by the most appropriate "expert." For example, one worker might use a model good at creative writing, while another uses a model optimized for factual recall.
*   **Improved Quality on Complex Tasks:** By breaking down a large problem, each component (orchestrator and workers) has a more manageable scope, often leading to higher quality results for each part and, consequently, for the whole.
*   **Modularity and Scalability:** It's easier to add new capabilities by adding new types of workers, or to improve a specific aspect by refining a particular worker, without overhauling the entire system.

## When is Prompt Orchestration a Good Fit?

This pattern is well-suited for:

*   Complex tasks where the exact sub-tasks or the sequence of operations cannot be easily predicted beforehand (e.g., in-depth research, complex problem-solving, creative content generation that involves multiple distinct components).
*   Situations requiring diverse capabilities or "expert" handling for different aspects of a problem.
*   Tasks where an initial plan might need to be adapted based on information gathered during the process.
*   When you need to synthesize information from multiple sources or steps to form a cohesive final output.

## Example in CozyUI: Multi-Source Research and Report Generation

**Goal:** Given a research topic, gather information from multiple web searches, analyze the findings, and then generate a structured summary report.

**CozyUI Workflow (Conceptual):**

1.  **`InputText` Node:**
    *   **Input:** Research Topic (e.g., "The impact of AI on renewable energy development")

2.  **`Single Chat Response` Node (LLM 1 - The Orchestrator):**
    *   **Input (Prompt):** Takes the Research Topic.
        ```
        System: You are a research project manager. Your task is to outline the sub-tasks needed to create a comprehensive summary report on the given topic.
        For the topic "{Research Topic}", identify 3-5 key areas or questions that need to be researched via web searches.
        Then, specify a sub-task to analyze the combined search results, and finally a sub-task to write a structured report.
        Output a JSON list of these sub-tasks, each with a 'type' (e.g., 'web_search', 'analyze_findings', 'write_report') and 'instruction' (the specific prompt for the worker).
        Example: [{"type": "web_search", "instruction": "Find recent articles on AI algorithms in solar panel efficiency."}, ...]
        ```
    *   **Output:** `sub_task_list` (a JSON string representing an array of tasks)

3.  **`IterateOverArray` Node (or similar looping mechanism):**
    *   **Input:** Takes `sub_task_list` (parsed from JSON into an array).
    *   This node will loop through each sub-task defined by the Orchestrator.

4.  **Inside the Loop (triggered by `IterateOverArray`'s "each_item_body" output, likely within a Leaf):**
    *   **`If Node` (Task Router):** Checks the `type` of the current sub-task.
        *   **If `type` == "web_search":**
            *   Triggers a **`WebSearch` Node** (Worker 1). The `instruction` from the sub-task (which is a search query) is passed as input to the `WebSearch` node.
            *   The search results are collected (e.g., appended to a `WorkflowScope` variable).
        *   **If `type` == "analyze_findings":**
            *   Triggers a **`Single Chat Response` Node (LLM 2 - Analyst Worker)**.
            *   **Input:** Takes all collected web search results (from the `WorkflowScope` variable) and the `instruction` from the sub-task (e.g., "Summarize the key themes and contradictions from these search results...").
            *   **Output:** `analysis_summary`, stored perhaps in another `WorkflowScope` variable.
        *   **If `type` == "write_report":**
            *   Triggers a **`Single Chat Response` Node (LLM 3 - Report Writer Worker)**.
            *   **Input:** Takes the `analysis_summary` and the `instruction` from the sub-task (e.g., "Write a 500-word structured report with an introduction, key findings, and conclusion based on this analysis...").
            *   **Output:** `final_report_draft`.

5.  **After the Loop (triggered by `IterateOverArray`'s "after_all_items" output):**
    *   **`DisplayText` Node:**
        *   **Input:** Takes `final_report_draft` (retrieved from the `WorkflowScope` variable or passed directly if the last step was report writing) to display the result.

::: warning
TODO screenshot
:::

**Simplified Visual Representation:**

```
[Input: Research Topic]
          |
          v
[LLM 1: Orchestrator (Plans Sub-Tasks)] --(sub_task_list)--> [Iterate Over Sub-Tasks]
                                                                    | (Each Sub-Task)
                                                                    v
                                                       [If Node: Route by Task Type]
                                                       /            |            \
                                                      /             |             \
                                (web_search)         /              | (analyze)      \ (write_report)
                                                    v               v                v
                                       [Worker: WebSearch] [Worker LLM: Analyze] [Worker LLM: Write]
                                           (Results stored/aggregated) |                |
                                                                       | (Analysis stored) |
                                                                       +-------------------+
                                                                                | (After Loop)
                                                                                v
                                                                      [Display Final Report]
```
*(Note: The actual CozyUI implementation would involve `NodeTriggerType` outputs from the `IterateOverArray` node to Leaves containing the worker logic, and `WorkflowScope` variables to pass data like aggregated search results or the final analysis to subsequent steps in the loop or to the final report writer.)*

## Key Considerations for Prompt Orchestration:

*   **Orchestrator Prompting:** The prompt for the orchestrator LLM is critical. It needs to be good at planning, breaking down tasks, and generating clear instructions for workers in a consistent format (like JSON).
*   **Worker Specialization:** Design worker prompts (or select worker nodes) to be highly effective at their specific sub-tasks.
*   **Data Management:** Decide how intermediate results from workers will be stored, aggregated, and passed to other workers or back to the orchestrator. CozyUI's `WorkflowScope` variables are very useful here.
*   **Looping and Control Flow:** You'll heavily rely on nodes like `IterateOverArray`, `ForLoop`, and `IfNode` to manage the execution of sub-tasks and the overall flow. Backtracking from Leaves triggered by these control nodes will often be necessary for the orchestrator to regain control or for the loop to continue.
*   **Error Handling:** Consider how to handle failures in worker nodes. Should the orchestrator try a different approach or report the failure?
*   **Complexity vs. Benefit:** This is a powerful but potentially complex pattern. Ensure the problem warrants this level of orchestration. Sometimes, simpler patterns like Prompt Chaining or Routing are sufficient.

Prompt Orchestration allows you to build highly adaptable and intelligent workflows in CozyUI, where LLMs don't just execute predefined steps but actively manage and direct the problem-solving process.