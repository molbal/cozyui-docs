---
title: Evaluator-Optimizer Loop
---

# Design Pattern: Evaluator-Optimizer Loop

The **Evaluator-Optimizer Loop** is an advanced design pattern in CozyUI that mimics an iterative refinement process. It involves one LLM (the "Optimizer" or "Generator") creating an initial response or solution, and another LLM node (the "Evaluator") critiquing that response against specific criteria. This feedback is then used to guide the Optimizer in subsequent attempts, creating a loop of generation, evaluation, and refinement until a satisfactory result is achieved or a limit is reached.

## What is the Evaluator-Optimizer Loop?

Think of it like a writer and an editor working together:

1.  **The Optimizer/Generator LLM:**
    *   Receives an initial task or prompt (e.g., "Write a poem about spring," "Translate this legal document," "Draft a solution to this coding problem").
    *   Generates an initial version of the response.

2.  **The Evaluator LLM (or Logic):**
    *   Receives the Optimizer's response and a set of evaluation criteria (e.g., "Is the poem at least 12 lines long and does it use rhyming couplets?", "Does the translation maintain the precise legal meaning and use appropriate formal tone?", "Does the code pass these specific unit tests and follow our style guide?").
    *   Assesses the response against these criteria.
    *   Provides feedback, which could be a simple pass/fail, or specific suggestions for improvement.

3.  **The Loop & Refinement:**
    *   If the Evaluator indicates the response is not yet satisfactory (or doesn't meet a quality threshold), the feedback (and potentially the original prompt and previous attempt) is fed back to the Optimizer LLM.
    *   The Optimizer then attempts to generate an improved version, taking the feedback into account.
    *   This cycle of generation, evaluation, and feedback repeats.

4.  **Termination:**
    *   The loop stops when the Evaluator deems the response satisfactory, a maximum number of iterations is reached, or another stopping condition is met.

## Why Use an Evaluator-Optimizer Loop?

*   This pattern allows for progressive enhancement of an LLM's output, often leading to significantly higher quality results than a single generation attempt, especially for complex or nuanced tasks.
*   It's excellent for ensuring that generated content or solutions meet predefined standards, constraints, or quality benchmarks.
*   It automates a process similar to how humans iterate on creative or technical work, incorporating feedback to improve.
*   For tasks where "good" is subjective but can be critiqued (like creative writing or complex translations), an LLM evaluator can provide useful, albeit still AI-generated, feedback.

## When is an Evaluator-Optimizer Loop a Good Fit?

This pattern is particularly effective when:

*   You have **clear, well-defined evaluation criteria** that can be articulated to an LLM (or checked programmatically).
*   The Optimizer LLM can **improve its responses based on feedback**.
*   An LLM (or other CozyUI nodes) can **provide meaningful feedback** or evaluation. This is important: if the feedback isn't helpful, the loop won't converge and your result won't improve.
*   You are willing to trade increased processing time and LLM calls for higher quality or adherence to specific requirements.

## Example in CozyUI: Iterative Document Refinement

**Goal:** Generate a draft of a product description, then iteratively refine it based on feedback from an "evaluator" LLM focusing on tone and clarity until it meets certain standards or a maximum number of attempts is reached.

**CozyUI Workflow (Conceptual):**

1.  **`InputText` Nodes:**
    *   Input 1: Product Name & Features
    *   Input 2: Desired Tone (e.g., "Professional and concise")
    *   Input 3: Key Clarity Points to Emphasize (e.g., "Highlight ease of use and unique benefit X")

2.  **`SetVariable` Node (Initialize Loop):**
    *   Set `current_draft` (WorkflowScope) to an empty string or initial prompt.
    *   Set `iteration_count` (WorkflowScope) to 0.
    *   Set `max_iterations` (WorkflowScope) to, for example, 3.

3.  **`ForLoop` Node (or a custom loop built with `IfNode` and backtracking):**
    *   Configured to run up to `max_iterations`.
    *   The "Loop Body" output will trigger the generation and evaluation Leaf.

4.  **Leaf: "Generation & Evaluation Cycle" (triggered by `ForLoop`'s "loop_body"):**
    *   **`Single Chat Response` Node (LLM 1 - Optimizer/Generator):**
        *   **Input (Prompt):**
            ```
            System: You are a marketing copywriter.
            User: Product: {Product Name & Features}. Desired Tone: {Desired Tone}. Key Points: {Key Clarity Points}.
            Previous Draft (if any): {current_draft}
            Feedback from previous evaluation (if any): {evaluation_feedback}
            Please write/revise a product description.
            ```
            *(Initially, `current_draft` and `evaluation_feedback` might be empty or placeholder text. These would be retrieved using `GetVariable` nodes from WorkflowScope).*
        *   **Output:** `new_draft`.
        *   **Action:** Store `new_draft` into the `current_draft` (WorkflowScope) variable using `SetVariable`.

    *   **`Single Chat Response` Node (LLM 2 - Evaluator):**
        *   **Input (Prompt):**
            ```
            System: You are a meticulous editor. Evaluate the following product description draft.
            Draft: "{current_draft}"
            Criteria:
            1. Tone: Is it '{Desired Tone}'?
            2. Clarity: Does it clearly emphasize '{Key Clarity Points}'?
            3. Overall Quality: Is it engaging and well-written?
            Provide specific feedback for improvement if needed. Conclude your response with "---PASS" if it meets all criteria to a high standard, or "---FAIL" if it needs more work.
            ```
        *   **Output:** `evaluation_result` (contains feedback and the ---PASS/---FAIL marker).
        *   **Action:** Store `evaluation_result` (or just the feedback part) into `evaluation_feedback` (WorkflowScope) using `SetVariable`.

    *   **`ExtractTrueOrFalse` Node (or `IfNode` checking string contents):**
        *   **Input:** `evaluation_result`.
        *   **Logic:** Checks if `evaluation_result` contains "---PASS".
        *   **Output:** `is_passed` (boolean).

    *   **`If Node` (Loop Control):**
        *   **Input:** `is_passed`.
        *   **If `is_passed` is True:**
            *   This branch might not need to do much more within the loop itself, or it could set a flag to break the `ForLoop` early (if `ForLoop` supports early exit based on a variable, otherwise the loop continues but further refinements are skipped).
        *   **If `is_passed` is False:**
            *   The loop continues to the next iteration of the `ForLoop`. The `ForLoop`'s own backtracking mechanism will cause this "Generation & Evaluation Cycle" Leaf to run again. On the next run, LLM 1 will receive the `current_draft` (which was updated) and the new `evaluation_feedback`.

5.  **After the `ForLoop` (triggered by `ForLoop`'s "after_loop"):**
    *   **`GetVariable` Node:** Retrieve the final `current_draft` from WorkflowScope.
    *   **`DisplayText` Node:** Display the final refined product description.

::: warning
TODO screenshot
:::


## Best Practices for Evaluator-Optimizer Loops:

*   **Clear Evaluation Criteria:** The success of this pattern hinges on your ability to define clear, actionable criteria for the Evaluator. If the criteria are vague, the feedback won't be useful.
*   **Evaluator's Capabilities:** The Evaluator LLM must be capable of providing constructive feedback that the Optimizer LLM can understand and act upon. 
    ::: tip 
    Do you even need an evaluator-optimizer? Sometimes, simpler programmatic checks (e.g., using an `If Node` to check length or keyword presence) can complement or even replace an LLM evaluator for certain criteria.
    :::
*   **Optimizer's Responsiveness to Feedback:** The Optimizer LLM needs to be good at incorporating feedback. Not all models or prompts are equally adept at this.
*   **Prompt Engineering for Both LLMs:** Both the Optimizer and Evaluator require clever prompts. The Optimizer needs to know it might receive feedback for revisions, and the Evaluator needs to know how to structure its critique and the pass/fail signal.
*   **Loop Termination:** Implement robust termination conditions:
    *   A clear "pass" signal from the evaluator.
    *   A maximum number of iterations to prevent infinite loops causing excessive LLM usage.
    *   Potentially, a check for diminishing returns (e.g., if the result hasn't improved meaningfully).
*   **Cost and Latency:** This pattern can be resource-intensive, as it involves multiple LLM calls per iteration. Use it judiciously for tasks where the quality improvement justifies the cost.
*   **"Hallucination" of Feedback:** Be aware that an LLM evaluator can also "hallucinate" or provide flawed feedback. The overall system is only as good as its weakest link ⛓️‍💥.

The Evaluator-Optimizer Loop is a powerful technique for achieving high-quality, refined outputs from LLMs in CozyUI, especially when tackling tasks with specific quality requirements.
