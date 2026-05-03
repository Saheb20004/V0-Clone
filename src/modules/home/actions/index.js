'use server';

import {inngest} from "@/inngest/client";

export const onInvoke = async (value)=>{
    await inngest.send({
        name:'code-agent/run',
        data: { value }
    })
}