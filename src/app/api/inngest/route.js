// import { serve } from "inngest/next";
// import { inngest } from "../../../inngest/client";

// export const { GET, POST, PUT } = serve({
//   client: inngest,
//   functions: [],
// });


import { serve } from "inngest/next";
import { inngest } from "../../../inngest/client";
// import { processTask } from "../../../inngest/functions";
import { codeAgentFunction } from "../../../inngest/functions";

export const { GET, POST, PUT } = serve({
  client: inngest,
  // functions: [processTask],
  functions: [codeAgentFunction],
});