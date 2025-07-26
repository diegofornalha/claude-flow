// A2A-SPARC Bridge Server
// Ponte entre A2A Protocol e SPARC Development Modes
// Permite que agentes A2A executem modos SPARC via JSON-RPC

export default {
  async fetch(request: Request): Promise<Response> {
    const url = new URL(request.url);
    
    // CORS headers for cross-origin requests
    const corsHeaders = {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    };
    
    // Handle preflight requests
    if (request.method === "OPTIONS") {
      return new Response(null, { status: 200, headers: corsHeaders });
    }
    
    // A2A Agent Card Discovery
    if (url.pathname === "/.well-known/agent.json") {
      return Response.json({
        "name": "SPARC-Deno Bridge Agent",
        "description": "A2A Protocol bridge for SPARC development modes execution",
        "version": "1.0.0",
        "url": "http://localhost:9998/",
        "defaultInputModes": ["text", "multimodal"],
        "defaultOutputModes": ["text", "artifacts"],
        "capabilities": {
          "streaming": true,
          "pushNotifications": false,
          "authentication": false
        },
        "skills": [
          {
            "id": "sparc_architect",
            "name": "SPARC Architect Mode",
            "description": "Execute SPARC architect mode for system design",
            "tags": ["sparc", "architecture", "design"],
            "examples": [
              "design A2A system architecture",
              "create scalable API design",
              "architect microservices system"
            ]
          },
          {
            "id": "sparc_optimizer",
            "name": "SPARC Optimizer Mode", 
            "description": "Execute SPARC optimization mode for performance enhancement",
            "tags": ["sparc", "optimization", "performance"],
            "examples": [
              "optimize A2A agent performance",
              "enhance system throughput",
              "reduce resource consumption"
            ]
          },
          {
            "id": "sparc_tdd",
            "name": "SPARC TDD Mode",
            "description": "Execute SPARC Test-Driven Development workflow",
            "tags": ["sparc", "tdd", "testing"],
            "examples": [
              "implement feature with TDD",
              "create comprehensive test suite",
              "refactor with test coverage"
            ]
          },
          {
            "id": "sparc_coder",
            "name": "SPARC Auto-Coder Mode",
            "description": "Execute SPARC automated coding mode",
            "tags": ["sparc", "coding", "automation"],
            "examples": [
              "generate A2A client implementation",
              "create server endpoints",
              "implement authentication system"
            ]
          }
        ],
        "authentication": {
          "required": false,
          "methods": []
        },
        "supportsAuthenticatedExtendedCard": false
      }, { headers: corsHeaders });
    }
    
    // JSON-RPC 2.0 Endpoint
    if (url.pathname === "/" && request.method === "POST") {
      try {
        const jsonrpc = await request.json();
        
        // Validate JSON-RPC 2.0 format
        if (jsonrpc.jsonrpc !== "2.0" || !jsonrpc.method) {
          return Response.json({
            "jsonrpc": "2.0",
            "id": jsonrpc.id || null,
            "error": {
              "code": -32600,
              "message": "Invalid Request",
              "data": "Missing required jsonrpc version or method"
            }
          }, { headers: corsHeaders });
        }
        
        // Handle SPARC execution methods
        if (jsonrpc.method === "sparc/execute") {
          return await handleSPARCExecution(jsonrpc);
        }
        
        // Handle message/send for compatibility
        if (jsonrpc.method === "message/send") {
          return await handleMessageSend(jsonrpc);
        }
        
        // Handle tasks/get for status checking
        if (jsonrpc.method === "tasks/get") {
          return await handleTaskGet(jsonrpc);
        }
        
        // Method not found
        return Response.json({
          "jsonrpc": "2.0",
          "id": jsonrpc.id,
          "error": {
            "code": -32601,
            "message": "Method not found",
            "data": `Method '${jsonrpc.method}' is not supported`
          }
        }, { headers: corsHeaders });
        
      } catch (error) {
        return Response.json({
          "jsonrpc": "2.0",
          "id": null,
          "error": {
            "code": -32700,
            "message": "Parse error",
            "data": error.message
          }
        }, { headers: corsHeaders });
      }
    }
    
    // SPARC Mode Information Endpoint
    if (url.pathname === "/sparc/modes") {
      return Response.json({
        "available_modes": [
          "architect", "code", "tdd", "debug", "security-review",
          "docs-writer", "integration", "refinement-optimization-mode",
          "ask", "devops", "tutorial", "spec-pseudocode"
        ],
        "runtime": "Deno " + Deno.version.deno,
        "bridge_version": "1.0.0"
      }, { headers: corsHeaders });
    }
    
    // Health check endpoint
    if (url.pathname === "/health") {
      return Response.json({
        "status": "healthy",
        "timestamp": new Date().toISOString(),
        "deno_version": Deno.version.deno,
        "uptime": performance.now() / 1000
      }, { headers: corsHeaders });
    }
    
    // Root endpoint with bridge information
    if (url.pathname === "/") {
      return new Response(`
        <html>
          <head>
            <title>A2A-SPARC Bridge</title>
            <style>
              body { font-family: Arial, sans-serif; max-width: 800px; margin: 50px auto; padding: 20px; }
              h1 { color: #2563eb; }
              .endpoint { background: #f3f4f6; padding: 15px; margin: 10px 0; border-radius: 5px; }
              code { background: #1f2937; color: #10b981; padding: 2px 5px; border-radius: 3px; }
            </style>
          </head>
          <body>
            <h1>🌉 A2A-SPARC Bridge</h1>
            <p>Ponte entre A2A Protocol e SPARC Development Modes</p>
            
            <h2>📋 Available Endpoints:</h2>
            <div class="endpoint">
              <strong>GET /.well-known/agent.json</strong><br>
              A2A Agent Card with SPARC capabilities
            </div>
            <div class="endpoint">
              <strong>POST /</strong><br>
              JSON-RPC 2.0 endpoint for SPARC execution<br>
              Methods: <code>sparc/execute</code>, <code>message/send</code>, <code>tasks/get</code>
            </div>
            <div class="endpoint">
              <strong>GET /sparc/modes</strong><br>
              List of available SPARC modes
            </div>
            <div class="endpoint">
              <strong>GET /health</strong><br>
              Bridge health status
            </div>
            
            <h2>🦕 Runtime Info:</h2>
            <ul>
              <li>Deno Version: ${Deno.version.deno}</li>
              <li>V8 Version: ${Deno.version.v8}</li>
              <li>TypeScript: ${Deno.version.typescript}</li>
              <li>Platform: ${Deno.build.os}</li>
              <li>Architecture: ${Deno.build.arch}</li>
            </ul>
          </body>
        </html>
      `, {
        headers: { 
          "content-type": "text/html; charset=utf-8",
          ...corsHeaders 
        }
      });
    }
    
    // 404 for unknown routes
    return new Response("404 - Not Found", { 
      status: 404, 
      headers: corsHeaders 
    });
  }
};

// Handle SPARC execution requests
async function handleSPARCExecution(jsonrpc: any): Promise<Response> {
  const params = jsonrpc.params || {};
  const mode = params.mode || "architect";
  const task = params.task || "No task specified";
  
  try {
    // Simulate SPARC execution with Deno context
    const executionStart = performance.now();
    
    // Here would be the actual SPARC mode execution
    // For now, we simulate with system info gathering
    const systemInfo = {
      deno: {
        version: Deno.version.deno,
        v8: Deno.version.v8,
        typescript: Deno.version.typescript
      },
      platform: Deno.build.os,
      arch: Deno.build.arch,
      memory_usage: Deno.memoryUsage(),
      permissions: await checkPermissions()
    };
    
    const executionTime = performance.now() - executionStart;
    
    // Generate task-specific response based on SPARC mode
    const result = generateSPARCResult(mode, task, systemInfo, executionTime);
    
    return Response.json({
      "jsonrpc": "2.0",
      "id": jsonrpc.id,
      "result": {
        "task_id": generateTaskId(),
        "status": "completed",
        "mode": mode,
        "task": task,
        "execution_time_ms": Math.round(executionTime),
        "artifacts": result.artifacts,
        "metadata": {
          "runtime": "Deno " + Deno.version.deno,
          "bridge_version": "1.0.0",
          "timestamp": new Date().toISOString(),
          "system_info": systemInfo
        }
      }
    });
    
  } catch (error) {
    return Response.json({
      "jsonrpc": "2.0",
      "id": jsonrpc.id,
      "error": {
        "code": -32000,
        "message": "SPARC execution failed",
        "data": {
          "error_message": error.message,
          "mode": mode,
          "task": task
        }
      }
    });
  }
}

// Handle message/send for A2A compatibility
async function handleMessageSend(jsonrpc: any): Promise<Response> {
  const params = jsonrpc.params || {};
  const message = params.message || {};
  
  // Extract SPARC mode from message content
  const content = message.content || "";
  const sparcMode = extractSPARCMode(content);
  
  if (sparcMode) {
    // Redirect to SPARC execution
    return await handleSPARCExecution({
      ...jsonrpc,
      method: "sparc/execute",
      params: {
        mode: sparcMode.mode,
        task: sparcMode.task
      }
    });
  }
  
  // Regular message handling
  return Response.json({
    "jsonrpc": "2.0",
    "id": jsonrpc.id,
    "result": {
      "task_id": generateTaskId(),
      "status": "completed",
      "message": "Message processed by A2A-SPARC Bridge",
      "processed_content": content,
      "timestamp": new Date().toISOString()
    }
  });
}

// Handle tasks/get for status checking
async function handleTaskGet(jsonrpc: any): Promise<Response> {
  const params = jsonrpc.params || {};
  const taskId = params.taskId || params.task_id;
  
  if (!taskId) {
    return Response.json({
      "jsonrpc": "2.0",
      "id": jsonrpc.id,
      "error": {
        "code": -32602,
        "message": "Invalid params",
        "data": "Missing required parameter: taskId"
      }
    });
  }
  
  // For demo purposes, return a completed task
  return Response.json({
    "jsonrpc": "2.0",
    "id": jsonrpc.id,
    "result": {
      "task_id": taskId,
      "status": "completed",
      "progress": 1.0,
      "created_at": new Date(Date.now() - 5000).toISOString(),
      "completed_at": new Date().toISOString(),
      "artifacts": [
        {
          "id": "artifact_1",
          "type": "text/plain",
          "title": "SPARC Bridge Execution Result",
          "content": "Task completed successfully via A2A-SPARC Bridge"
        }
      ]
    }
  });
}

// Utility functions
function generateTaskId(): string {
  return `sparc_task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

function extractSPARCMode(content: string): { mode: string; task: string } | null {
  const modePatterns = [
    /sparc\s+(\w+)\s+(.+)/i,
    /execute\s+(\w+)\s+mode\s+(.+)/i,  
    /run\s+(\w+)\s+(.+)/i
  ];
  
  for (const pattern of modePatterns) {
    const match = content.match(pattern);
    if (match) {
      return {
        mode: match[1].toLowerCase(),
        task: match[2].trim()
      };
    }
  }
  
  return null;
}

function generateSPARCResult(mode: string, task: string, systemInfo: any, executionTime: number) {
  const baseResult = {
    artifacts: [
      {
        id: `${mode}_result_${Date.now()}`,
        type: "text/markdown",
        title: `SPARC ${mode.toUpperCase()} Result`,
        content: `# SPARC ${mode.toUpperCase()} Execution\n\n**Task:** ${task}\n\n**Status:** Completed\n**Runtime:** Deno ${systemInfo.deno.version}\n**Execution Time:** ${Math.round(executionTime)}ms\n\n## Result\n\nSPARC ${mode} mode executed successfully with Deno runtime context.`
      }
    ]
  };
  
  // Mode-specific enhancements
  switch (mode.toLowerCase()) {
    case "architect":
      baseResult.artifacts[0].content += `\n\n## Architecture Analysis\n\n- System: ${systemInfo.platform} ${systemInfo.arch}\n- Runtime: Deno with TypeScript support\n- Memory: ${Math.round(systemInfo.memory_usage.rss / 1024 / 1024)}MB RSS\n- Recommended: Microservices with A2A Protocol integration`;
      break;
      
    case "optimizer":
    case "refinement-optimization-mode":
      baseResult.artifacts[0].content += `\n\n## Performance Optimization\n\n- Current Memory: ${Math.round(systemInfo.memory_usage.heapUsed / 1024 / 1024)}MB heap used\n- V8 Engine: ${systemInfo.deno.v8}\n- Optimization: Deno runtime provides better performance than Node.js\n- Recommendations: Use concurrent execution patterns`;
      break;
      
    case "tdd":
      baseResult.artifacts[0].content += `\n\n## Test-Driven Development\n\n- Runtime: Deno with built-in test runner\n- TypeScript: Native support without configuration\n- Testing: Use \`deno test\` for comprehensive test suites\n- Coverage: Built-in code coverage analysis`;
      break;
      
    default:
      baseResult.artifacts[0].content += `\n\n## ${mode.toUpperCase()} Mode\n\nExecuted in Deno runtime with full system access and modern JavaScript/TypeScript capabilities.`;
  }
  
  return baseResult;
}

async function checkPermissions(): Promise<any> {
  const permissions = {
    net: false,
    read: false,
    write: false,
    env: false,
    run: false
  };
  
  try {
    const netStatus = await Deno.permissions.query({ name: "net" });
    permissions.net = netStatus.state === "granted";
    
    const readStatus = await Deno.permissions.query({ name: "read" });
    permissions.read = readStatus.state === "granted";
    
    const writeStatus = await Deno.permissions.query({ name: "write" });
    permissions.write = writeStatus.state === "granted";
    
    const envStatus = await Deno.permissions.query({ name: "env" });
    permissions.env = envStatus.state === "granted";
    
    const runStatus = await Deno.permissions.query({ name: "run" });
    permissions.run = runStatus.state === "granted";
  } catch (error) {
    // Ignore permission query errors
  }
  
  return permissions;
}