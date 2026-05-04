import { inngest } from "./client";
import { openai, createAgent } from "@inngest/agent-kit";
import Sandbox from "@e2b/code-interpreter";
import { createTool, createNetwork } from "@inngest/agent-kit";
import { PROMPT } from "@/prompt";
import { z } from "zod";
import { lastAssistantMessageContent } from "./utils";
import db from "@/lib/db";
import { MessageRole, MessageType } from "@prisma/client";
// import { generateResponse, generateFragmentTitle } from "@/lib/response";

export const codeAgentFunction = inngest.createFunction(
  { id: "code-agent", triggers: [{ event: "code-agent/run" }], retries: 3 },
  async ({ event, step }) => {
    
    // step-1
    const sandboxId=await step.run("get-sandbox-id",async()=>{
      const sandbox=await Sandbox.create('v0-nextjs-build')
      return sandbox.sandboxId
    })

    const codeAgent = createAgent({
      name: "code-agent",
      description: "An expert coding agent",
      system: PROMPT,
      model: openai({
        model: "llama3.1-8b",
        apiKey: process.env.CEREBRAS_API_KEY,
        baseUrl: "https://api.cerebras.ai/v1",
    }),

      tools:[
        // 1.Terminal
        createTool({
          name: "terminal",
          description: "Use the terminal to run commands",
          parameters: z.object({
            command: z.string(),
          }),
          handler:async({command},{step})=>{
            return await step?.run('terminal',async()=>{
              const buffers={stdout:"",stderr:""}

              try{
                const sandbox=await Sandbox.connect(sandboxId)

                const result=await sandbox.commands.run(command,{
                  onStdout:(data)=>{
                    buffers.stdout+=data
                  },
                  onStderr:(data)=>{
                    buffers.stderr+=data
                  }
                })

                return result.stdout
              }catch(error){
                console.log(`Command failed: ${error} \n stdout: ${buffers.stdout} \n stderr: ${buffers.stderr}`)
                return `Command failed: ${error} \n stdout: ${buffers.stdout} \n stderr: ${buffers.stderr}`
              }
            })
          }
          
        }),

        // 2.createOrUpdateFiles
        createTool({
          name:"createOrUpdateFiles",
          description:"Create or update files in the sandbox",
          parameters:z.object({
            files:z.array(z.object({
              path:z.string(),
              content:z.string()
            }))
          }),
          handler:async({files},{step,network})=>{
            const newFiles=await step?.run(
              "createOrUpdateFiles",
              async()=>{
                try{
                  const updatedFiles=network?.state?.data.files || {}
                  const sandbox=await Sandbox.connect(sandboxId)

                  for(const file of files){
                    await sandbox.files.write(file.path,file.content)
                    updatedFiles[file.path]=file.content
                  }

                  return updatedFiles
                }catch(error){
                  return "Error" + error
                }
              }
            );

            if(typeof newFiles==="object"){
              network.state.data.files=newFiles
            }
          }
        }),

        // 3.readFiles
        createTool({
          name:"readFiles",
          description:"Read files from the sandbox",
          parameters:z.object({
            files:z.array(z.string())
          }),
          handler:async({files},{step})=>{
            return await step?.run(
              "readFiles",
              async()=>{
                try{
                  const sandbox=await Sandbox.connect(sandboxId)
                  const contents=[]

                  for(const file of files){
                    const content=await sandbox.files.read(file)
                    contents.push({path:file,content})
                  }
                  
                  return JSON.stringify(contents)
                }catch(error){
                  return "Error" + error
                }
              }
            )
          },
        }),
      ],

      lifecycle:{
        onResponse:async({result,network})=>{
          const lastAssistantMessageText=lastAssistantMessageContent(result)

          if(lastAssistantMessageText && network){
            if(lastAssistantMessageText.includes("<task_summary>")){
              network.state.data.summary=lastAssistantMessageText
            }
          }
          return result
        }
      }

    });

    const network=createNetwork({
      name:"coding-agent-network",
      agents:[codeAgent],
      maxIter:10,

      router:async({network})=>{
        const summary=network.state.data.summary

        if(summary){
          return
        }
        return codeAgent
      }
    })

    // const { output } = await codeAgent.run("Say hello to the user!");
    const result= await network.run(event.data.value || "")
    const isError = !result.state.data.summary || Object.keys(result.state.data.files || {}).length === 0;

    const sandboxUrl=await step.run("get-sandbox-url",async()=>{
      const sandbox=await Sandbox.connect(sandboxId)
      const host=sandbox.getHost(3000)
      return `http://${host}`
    })

    await step.run("save-result" , async()=>{
      if(isError){
        return await db.message.create({
          data:{
            projectId:event.data.projectId,
            content:"Something went wrong. Please try again",
            role:MessageRole.ASSISTANT,
            type:MessageType.ERROR
          }
        })
      }


      return await db.message.create({
        data:{
          projectId:event.data.projectId,
          // content:generateResponse(),
          content:result.state.data.summary,
          role:MessageRole.ASSISTANT,
          type:MessageType.RESULT,
          fragments:{
            create:{
              sandboxUrl:sandboxUrl,
              // title:generateFragmentTitle(),
              title:'Untitled',
              files:result.state.data.files
            }
          }
        }
      })
    })

    return {
      // message: output[0].content,
      url:sandboxUrl,
      title:'Untitled ',
      files:result.state.data.files,
      summary:result.state.data.summary,
    };
  },
);
