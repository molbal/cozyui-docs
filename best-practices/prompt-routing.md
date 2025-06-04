---
title: Routing
---

# Design Pattern: Routing

The **Routing** design pattern in CozyUI allows your workflow to intelligently direct an input to different processing paths or specialized LLM configurations based on its characteristics or category. This enables you to handle diverse inputs more effectively by applying the most appropriate logic or LLM for each case.

## What is Routing?

Imagine you have a system that needs to handle various types of requests or information. Instead of trying to create a single, one-size-fits-all process, routing helps you:

1.  **Classify the Input:** An initial step (often an LLM node or a simpler conditional check) analyzes the incoming data to determine its category or type.
2.  **Direct the Flow:** Based on this classification, the workflow then "routes" the input to a specific downstream set of nodes (often within a Leaf) or a particular LLM node that is optimized for handling that specific category.

This pattern allows for a "separation of concerns," where different parts of your workflow are specialized for different kinds of tasks, leading to better performance and easier management.

## Why Use Routing?

*   **Improved Accuracy & Relevance:** By directing inputs to specialized prompts or LLM models, you can achieve more accurate and relevant responses. A prompt optimized for "technical support questions" will likely perform better on those questions than a generic prompt trying to handle everything.
*   **Optimized Performance & Cost:** You can route simpler or common queries to faster, less expensive LLM models, while reserving more powerful (and potentially slower/costlier) models for complex or unusual inputs.
*   **Better Organization:** It makes your workflow logic cleaner and easier to understand by dedicating specific branches (often Leaves) to specific types of tasks.
*   **Enhanced Maintainability:** If you need to update the logic for handling a particular category of input, you only need to modify the relevant branch, without affecting others.
*   **Flexibility:** Easily add new categories and corresponding processing paths as your needs evolve.

## When is Routing a Good Fit?

This pattern is particularly effective when:

*   You're dealing with a task where inputs can fall into several distinct categories that benefit from different handling.
*   Accurate classification of the input is feasible, either by an LLM or by simpler conditional logic (e.g., checking for keywords).
*   You want to use different LLM models, prompts, or "tools" (other CozyUI nodes) based on the input type.
*   Optimizing for one type of input might negatively impact performance on other types if a single, generic process were used.

## Examples in CozyUI

Let's explore how routing can be implemented in CozyUI.

### Example 1: Customer Service Query Routing

**Goal:** Route incoming customer support messages to different processing paths based on the query type (e.g., "General Inquiry," "Refund Request," "Technical Support").

**CozyUI Workflow:**

1.  **`InputText` Node:**
    *   **Input:** Customer's message (e.g., "I'd like to return my order," or "How do I reset my password?")

2.  **`Single Chat Response` Node (LLM 1 - Classifier):**
    *   **Input (Prompt):** Takes the customer's message.
        ```
        System: You are a helpful assistant that classifies customer support queries.
        Categorize the following user message into one of these types: 'General',
        'RefundRequest', 'TechnicalSupport'. Respond with ONLY the category name.
        User: {customer_message}
        ```
    *   **Output:** `query_category` (e.g., "RefundRequest")

3.  **`If Node` (Decision Point):**
    *   This node will have multiple conditional checks based on the `query_category` output from LLM 1.
    *   **Condition 1:** `query_category == General`
        *   **True Output:** Triggers a Leaf or path for general inquiries.
    *   **Condition 2:** `query_category == RefundRequest`
        *   **True Output:** Triggers a Leaf or path specifically for handling refund requests (e.g., connecting to a "Check Order Eligibility" leaf).
    *   **Condition 3:** `query_category == TechnicalSupport`
        *   **True Output:** Triggers a Leaf or path for technical support (e.g., connecting to an LLM node with a technical troubleshooting prompt).
    *   **(Optional) Else/Default Output:** Triggers a path for unclassified or other queries.

4.  **Specialized Paths (within Leaves):**
    *   **Leaf A (General):** Contains nodes to answer common questions, perhaps using an LLM with a FAQ-based prompt.
    *   **Leaf B (Refund Request):** Contains nodes to look up order details, check refund policies, and perhaps an LLM to draft a response.
    *   **Leaf C (Technical Support):** Contains nodes to guide troubleshooting, possibly an LLM with access to technical documentation.

::: warning
TODO screnshot
:::

### Example 2: Routing by Query Complexity for LLM Cost/Speed Optimization

**Goal:** Route simple user questions to a fast, inexpensive LLM (like GPT 4o) and complex questions to a more capable (but slower/costlier) LLM (like Sonnet or Opus).

**CozyUI Workflow (Conceptual):**

1.  **`InputText` Node:** User's question.
2.  **`LLM Node` (LLM 1 - Complexity Assessor - could be a small, fast model itself):**
    *   **Prompt:** "Analyze the following user question. Is it a simple factual question that can likely be answered quickly, or is it a complex question requiring deep reasoning or extensive knowledge? Respond with 'simple' or 'complex'."
    *   **Output:** `complexity_assessment`
3.  **`If Node`:**
    *   **Condition:** `complexity_assessment` == "simple"
        *   **True Output:** Triggers an `AdvancedSingleChatResponse` Node configured to use a fast/cheap model (e.g., GPT 4.1 Mini).
    *   **Else (False) Output:** Triggers a different `AdvancedSingleChatResponse` Node configured to use a powerful model (e.g., Gemini 2.5 Pro).
4.  **`DisplayText` Node (or further processing):** Handles the response from the selected LLM.

## Key Considerations for Routing:

*   **Classifier Accuracy:** The effectiveness of the routing pattern heavily depends on the accuracy of your initial classification step. If the classifier (LLM or other logic) frequently miscategorizes inputs, the wrong path will be taken.
*   **Defining Categories:** Clearly define your categories. They should be distinct enough that specialized handling provides real benefits.
*   **Complexity of Classification:** Sometimes, a simple keyword check in an `If Node` is enough for routing, and an LLM classifier isn't needed. Choose the simplest effective method.
*   **Fallback/Default Path:** Always consider having a default path for inputs that don't clearly fit into any defined category or if the classifier is uncertain.

Routing is a powerful way to make your CozyUI workflows more intelligent, efficient, and tailored to the specific nature of the inputs they receive. It's a key pattern for building more sophisticated and adaptable automated systems.