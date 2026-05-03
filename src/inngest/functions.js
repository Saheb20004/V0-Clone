import { inngest } from "./client";
import { openai, createAgent } from "@inngest/agent-kit";
import Sandbox from "@e2b/code-interpreter";

export const helloWorld = inngest.createFunction(
  { id: "hello-world", triggers: [{ event: "agent/hello" }] },
  async ({ event, step }) => {

    const sandboxId=await step.run("get-sandbox-id",async()=>{
      const sandbox=await Sandbox.create('v0-nextjs-build')
      return sandbox.sandboxId
    })

    const helloAgent = createAgent({
      name: "hello-agent",
      description: "A simple agent that responds with a greeting",
      system: "You are a helpful assistant that responds to greetings.",
      model: openai({
        model: "llama-3.3-70b-versatile",
        apiKey: process.env.GROQ_API_KEY,
        baseUrl: "https://api.groq.com/openai/v1",
      }),
    });

    const { output } = await helloAgent.run("Say hello to the user");

    const sandboxUrl=await step.run("get-sandbox-url",async()=>{
      const sandbox=await Sandbox.connect(sandboxId)
      const host=sandbox.getHost(3000)
      return `http://${host}`
    })

    return {
      message: output[0].content,
    };
  },
);
