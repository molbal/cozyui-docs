---
title: Workflow Execution Events Reference
---

# Workflow Execution Events Reference

This guide documents the standard event types emitted during workflow execution in CozyUI. These events provide visibility into execution state changes, node/leaf lifecycle, and system status updates. Understanding them is useful for debugging, tracing, and building advanced workflow integrations where nodes may react to workflow lifecycle changes.

---

## Event Structure Overview

All events follow a standardized JSON format, example:

```json
{
  "timestamp": 1748293206,
  "jobId": "01970e65-38c2-7116-8aa3-6705bd8ec04f",
  "type": "BEGIN_NODE_EXECUTION",
  "message": "Node-specific status message",
  "details": {
    "nodeId": "iterateoverarray-6834d3549bdac",
    "nodeName": "Iterate over array",
    "inputs": { /* ... */ },
    "outputs": { /* ... */ },
    "error": false,
    "duration": 0.012620925903320312
  }
}
```

### Common Fields
- `timestamp`: Unix timestamp (seconds)
- `jobId`: Unique identifier for the workflow execution
- `type`: Event type (see below)
- `message`: Human-readable summary
- `details`: Context-specific data (structure varies by event)

---

## Event Types

### 1. **WORKFLOW_DISPATCHED**
**Purpose**: Emitted when a workflow starts execution  
**Example**:
```json
{
  "type": "WORKFLOW_DISPATCHED",
  "message": "Workflow dispatched.",
  "details": {
    "timestamp": 1748293206
  }
}
```

---

### 2. **WORKFLOW_RECEIVED**
**Purpose**: When workflow execution is queued  
**Example**:
```json
{
  "type": "WORKFLOW_RECEIVED",
  "message": "Workflow queued for execution by CozyUI",
  "details": {
    "jobId": "01970e65-38c2-7116-8aa3-6705bd8ec04f"
  }
}
```

---

### 3. **DETERMINED_EXECUTION_ORDER**
**Purpose**: Indicates nodes queued for execution  
**Example**:
```json
{
  "type": "DETERMINED_EXECUTION_ORDER",
  "message": "Determined execution order for top-level context.",
  "details": {
    "queue": ["inputtext-6834d32dab8fd"]
  }
}
```

---

### 4. **BEGIN_NODE_EXECUTION**
**Purpose**: When a node starts running  
**Example**:
```json
{
  "type": "BEGIN_NODE_EXECUTION",
  "message": "Iterate over array begins running",
  "details": {
    "nodeId": "iterateoverarray-6834d3549bdac",
    "nodeName": "Iterate over array",
    "inputs": {
      "array": "[List of 1 items: C:\\Users\\ASUS\\Herd\\cozyui\\README.md]",
      "__jobId": "01970e67-aea3-73a6-8951-94f3e917e652"
    }
  }
}
```

---

### 5. **END_NODE_EXECUTION**
**Purpose**: When a node completes execution  
**Example**:
```json
{
  "type": "END_NODE_EXECUTION",
  "message": "Display Text finished executing",
  "details": {
    "error": false,
    "duration": 0.02339887619018555,
    "nodeId": "displaytext-6834d36ff0bfd",
    "outputs": {}
  }
}
```

---

### 6. **NODE_EVENT**
**Purpose**: Custom status updates from nodes  
**Example**:
```json
{
  "type": "NODE_EVENT",
  "message": "Processing item 1 of 1",
  "details": {
    "nodeId": "iterateoverarray-6834d3549bdac",
    "myCustomEventData": { "progress": "50%" }
  }
}
```

---

### 7. **BEGIN_LEAF_EXECUTION**
**Purpose**: When a Leaf (sub-workflow) starts  
**Example**:
```json
{
  "type": "BEGIN_LEAF_EXECUTION",
  "message": "Leaf 'Iterator' triggered by node 'iterateoverarray-6834d3549bdac'.",
  "details": {
    "sourceNodeId": "iterateoverarray-6834d3549bdac",
    "leafId": "leaf-fUwf7W2d",
    "leafName": "Iterator"
  }
}
```

---

### 8. **END_LEAF_EXECUTION**
**Purpose**: When a Leaf completes  
**Example**:
```json
{
  "type": "END_LEAF_EXECUTION",
  "details": {
    "leafId": "leaf-fUwf7W2d",
    "leafName": "Iterator"
  }
}
```

---

### 9. **WORKFLOW_STATUS**
**Purpose**: Periodic status updates with execution metrics  
**Example**:
```json
{
  "type": "WORKFLOW_STATUS",
  "message": "Backtracking: Re-queued node Iterate over array after leaf completion.",
  "details": {
    "nodeExecutionCounts": {
      "inputtext-6834d32dab8fd": 13.334989547729492
    },
    "queue": []
  }
}
```

---

### 10. **FINISHED_WORKFLOW**
**Purpose**: Final event when workflow completes  
**Example**:
```json
{
  "type": "FINISHED_WORKFLOW",
  "message": "Workflow finished successfully",
  "details": {
    "error": false,
    "duration": 0.003291450023651123
  }
}
```

---

### 11. **WORKFLOW_DISPATCH_FAILED**
**Purpose**: Emitted on workflow dispatch failure  
**Example**:
```json
{
  "type": "WORKFLOW_DISPATCH_FAILED",
  "message": "Workflow was rejected by CozyUI backend",
  "details": {
    "error": true,
    "message": "Invalid node configuration"
  }
}
```

---

## Special Event Behaviors

### Backtracking Events
When a node requests re-execution after leaf completion:
```json
{
  "type": "NODE_EVENT",
  "message": "Node requested backtrack. Removed from executed list to allow re-execution.",
  "details": {
    "nodeId": "iterateoverarray-6834d3549bdac"
  }
}
```

### Leaf Triggering
Triggered via `->trigger()` in node code:
```json
{
  "type": "END_NODE_EXECUTION",
  "details": {
    "outputs": {
      "__trigger": ["each_body"]
    }
  }
```

---

## vent Timeline Example

```
[WORKFLOW_DISPATCHED] → 
[WORKFLOW_RECEIVED] → 
[DETERMINED_EXECUTION_ORDER] → 
[BEGIN_NODE_EXECUTION] → 
[NODE_EVENT] → 
[END_NODE_EXECUTION] → 
[BEGIN_LEAF_EXECUTION] → 
[END_LEAF_EXECUTION] → 
[FINISHED_WORKFLOW]
```

---

## Best Practices for Developers

1. **Listen to Events**:
   ```js
   window.addEventListener('workflow.END_NODE_EXECUTION', (event) => {
     if (event.detail.nodeId === 'your-node-id') {
       // Handle completion
     }
   });
   ```

2. **Emit Custom Events**:
   ```php
   $this->emitEvent($inputs, [
       'message' => 'Processing complete',
       'myCustomEventData' => ['progress' => '100%']
   ]);
   ```

3. **Use Timestamps**:
   Convert timestamps to readable format:
   ```js
   new Date(event.detail.timestamp * 1000).toLocaleTimeString()
   ```

