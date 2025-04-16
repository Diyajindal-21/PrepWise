import { generateText } from "ai";
import { google } from "@ai-sdk/google";
import { db } from "@/firebase/admin";
import { getRandomInterviewCover } from "@/lib/utils";

export async function POST(request: Request) {
  console.log("POST request received at /api/vapi/generate");
  
  try {
    const { type, role, level, techstack, amount, userid } = await request.json();
    console.log("Request params:", { type, role, level, techstack, amount, userid });

    console.log("Generating questions using Gemini AI");
    const { text: questions } = await generateText({
      model: google("gemini-2.0-flash-001"),
      prompt: `Prepare questions for a job interview.
        The job role is ${role}.
        The job experience level is ${level}.
        The tech stack used in the job is: ${techstack}.
        The focus between behavioural and technical questions should lean towards: ${type}.
        The amount of questions required is: ${amount}.
        Please return only the questions, without any additional text.
        The questions are going to be read by a voice assistant so do not use "/" or "*" or any other special characters which might break the voice assistant.
        Return the questions formatted like this:
        ["Question 1", "Question 2", "Question 3"]
        
        Thank you! <3
    `,
    });
    console.log("AI Response:", questions);

    // Make sure we have valid JSON before parsing
    let parsedQuestions;
    try {
      // Try to parse the response directly
      console.log("Attempting to parse response as JSON");
      parsedQuestions = JSON.parse(questions);
      console.log("Successfully parsed JSON directly");
    } catch (error) {
      console.error("Error parsing JSON response:", error);
      // If there's an error, try to extract JSON array from the text
      console.log("Attempting to extract JSON using regex");
      const jsonMatches = questions.match(/\[([\s\S]*?)\]/);
      if (jsonMatches && jsonMatches[0]) {
        try {
          console.log("Found potential JSON match:", jsonMatches[0]);
          parsedQuestions = JSON.parse(jsonMatches[0]);
          console.log("Successfully parsed extracted JSON");
        } catch (innerError) {
          console.error("Error parsing extracted JSON:", innerError);
          // Fallback to creating an array with the full response as a single question
          console.log("Falling back to single question array");
          parsedQuestions = [questions];
        }
      } else {
        // If no JSON array found, create array with the full response
        console.log("No JSON array found, using full response as single question");
        parsedQuestions = [questions];
      }
    }
    console.log("Parsed questions:", parsedQuestions);

    const interview = {
      role: role,
      type: type,
      level: level,
      techstack: techstack.split(","),
      questions: parsedQuestions,
      userId: userid,
      finalized: true,
      coverImage: getRandomInterviewCover(),
      createdAt: new Date().toISOString(),
    };

    // Ensure the interview object is valid
    console.log("Interview object prepared:", JSON.stringify(interview));
    
    console.log("Checking Firestore database connection");
    if (!db) {
      throw new Error("Firestore database is not initialized");
    }
    
    console.log("Accessing 'interviews' collection");
    const interviewsCollection = db.collection("interviews");
    console.log("Collection reference created");
    
    // Add the interview to Firestore with retry logic
    console.log("Attempting to add document to Firestore");
    let attempts = 0;
    const maxAttempts = 3;
    let docRef;
    
    while (attempts < maxAttempts) {
      try {
        docRef = await interviewsCollection.add(interview);
        console.log("Document written with ID:", docRef.id);
        break;
      } catch (error) {
        attempts++;
        console.error(`Firestore write attempt ${attempts} failed:`, error);
        if (attempts >= maxAttempts) {
          throw error;
        }
        // Wait before retrying
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }

    return Response.json({ 
      success: true, 
      interviewId: docRef?.id || null,
      message: "Interview created successfully" 
    }, { status: 200 });
  } catch (error) {
    console.error("Error in API route:", error);
    return Response.json({ 
      success: false, 
      error: String(error),
      message: "Failed to create interview"
    }, { status: 500 });
  }
}

export async function GET() {
  console.log("GET request received at /api/vapi/generate");
  return Response.json({ success: true, data: "Thank you!" }, { status: 200 });
}