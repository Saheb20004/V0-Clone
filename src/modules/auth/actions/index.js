"use server"

import db from "@/lib/db";
import { clerkClient, currentUser } from "@clerk/nextjs/server";

export const onBoardUser=async()=>{

    try{
        const user=await currentUser();

        if(!user) {
            return {
                success: false,
                error: "No authenticated user found"
            }
        }

        const {id,firstName,lastName,imageUrl,emailAddresses}=user;

        const newUser=await db.user.upsert({
            where:{
                clerkId:id
            },
            update:{
                name:firstName && lastName ? `${firstName} ${lastName}`:firstName || lastName || null,
                email:emailAddresses[0]?.emailAddress || "",
                imageUrl:imageUrl || "",
            },
            create:{
                clerkId:id,
                name:firstName && lastName ? `${firstName} ${lastName}`:firstName || lastName || null,
                email:emailAddresses[0]?.emailAddress || "",
                imageUrl:imageUrl || "",
            }
        })

        return{
            success:true,
            user:newUser,
            message:"User onboarded successfully"
        }
    }
    catch(error){
        console.log("❌ Error onboarding user:",error);
        return{
            success:false,
            error:"Failed to onboard user"
        }
    }

}


export const getCurrentUser=async()=>{

    try{
        const user=await currentUser();

        if(!user) return null;

        const dbUser=await db.user.findUnique({
            where:{
                clerkId:user.id
            },
            select:{
                id:true,
                name:true,
                email:true,
                image:true,
                clerkId:true,
            }
        })

        return dbUser;
    }
    catch (error){
        console.log("❌ Error fetching current user:",error);
        return null;
    }

}