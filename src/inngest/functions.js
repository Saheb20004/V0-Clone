import { inngest } from "./client";
import { openai, createAgent } from "@inngest/agent-kit";

export const helloWorld = inngest.createFunction(
  { id: "hello-world", triggers: [{ event: "agent/hello" }] },
  async ({ event, step }) => {
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
    return {
      message: output[0].content,
    };
  },
);
