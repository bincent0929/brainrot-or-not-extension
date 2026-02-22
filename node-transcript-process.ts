/**
 * I think I'm going to try and replace this with LangChain
 * Here is a page dedicated to getting language models to run in the browser using Langchain: 
 * https://docs.langchain.com/oss/javascript/integrations/chat/web_llm
 * 
 * I think I'm just running into issues with how the hugging face model I picked out was made and can be interfaced with.
 * 
 * Llama-3.2-1B-Instruct-q4f16_1-MLC
 */
import { ChatWebLLM } from "@langchain/community/chat_models/webllm";
import { HumanMessage, SystemMessage } from "@langchain/core/messages";
import { InitProgressReport } from '@mlc-ai/web-llm';

import type { video_rating, video_rating_and_info } from './types';

async function process_transcript(video_id: string): Promise<video_rating> {
    /**
     * maybe I'll want to move this as a global variable
     * because then I can just call this function to get
     * all the video's data outside of processing its
     * transcript.
    */ 
    let curr_video_analysis: video_rating = {
        video_id: "",
        //video_title: "",
        //channel_name: "",
        transcript: "Each unit contains between 8 - 25 Lesson Plans.\nEach lesson is designed to use 60 minutes. A typical lesson is divided into four phases; a warm-up activity, one or more instructional activities, the lesson synthesis, and a cool-down activity. Every activity within these phases is divided into three parts—the Launch, the Activity, and the Synthesis.\no Warm-up Activity—The warm-up activity is designed to strengthen the idea of mathematical community. In these activities, students work with their peers. Students use their personal experiences and mathematical knowledge to develop ideas, ask questions, defend their responses, and evaluate the reasoning of others. A warm-up activity might review a context students have seen before, have them reflect on where the previous lesson left off, or preview a context or idea that will come up in that lesson.\nThere are several warm-up routines that are used during the lessons.\n• Act It Out—This routine is for kindergarten and first grade students. It encourages young children to understand the relationship between words and numbers. It provides opportunities for students to make sense of story problems. In this routine, students listen to a story problem and act it out through movement, using their fingers, or objects to represent the action in the story.\n• Choral Count—This routine encourages students to make predictions and think about patterns. It also provides opportunities for students to justify their reasoning. In this routine, students count aloud starting from a given number. The count might be forwards or backwards. The teacher records the numbers on a chart as students say them. Students then stop and look at the written numbers to make predictions and look for patterns.\n• Estimation Exploration—Estimation Exploration encourages students to use what they know and what they can see to problem-solve for a rough evaluation of a quantity rather than giving a “wild guess.” The estimates can be in the context of measurement, computation, or numerosity—estimating about a large group of objects (MP2). In this routine, students make estimates in response to a question about an image. They first think about estimates that would be sensible, but too high or too low. Then they make a reasonable estimate and discuss why their estimate makes sense.\n• How Many Do You See?—This routine encourages students to see groups when counting. Being able to see groups of objects in an organized way helps them visualize quantities and improves their ability to do mental computation. In this routine, students look at an image, which is typically an arrangement of dots or other shapes. Then students state how many dots or shapes they see. Also included in the discussion will be comments about the way they saw them or determined how many there were. This encourages students to see groups and patterns rather than count each item one by one.\n• Notice and Wonder—This routine provides an opportunity for students to bring their understandings and experiences to a problem. They share their ideas and ask questions without any pressure to answer or solve a problem. This routine reinforces the importance of making sense of situations before solving a problem. In this routine, students look at an image related to the topic of the lesson and are asked, “What do you notice?” The teacher writes all comments on a chart. They are then asked, “What do you wonder?”, and their questions are also recorded on the chart.\nCoreKnowledgeMath | Grade 1 iv\n• Number Talk—This routine provides an opportunity for students to practice mental math. It helps them solve problems and think about numbers in flexible ways. They not only justify their own reasoning, but critique the reasoning of others as they make sense of methods for solving problems. In this routine, a series of problems are presented one at a time. Students solve the problem in their head and signal when they have an answer. The teacher takes notes as they justify their answer and explain their method for solving.\n• Questions About Us—This routine is used with kindergarten students. It provides them opportunities to learn more about their classmates and gives them practice asking questions, organizing quantities, counting, and analyzing data. In this routine, students ask their classmates a question with two choices. They keep track of the answers and count the responses. The teacher then asks follow up questions that students answer using the data that they collected.\n• True or False?—This routine encourages students to make sense of equations, often without any computation. It provides another opportunity for students to justify their reasoning as they explain to others what they are thinking. In this routine, students are presented with a series of equations, one at a time. Some equations may be true, and some may be false. Students use what they know about place value, operations, and number relationships to decide if each is true or false. And then, students explain how they know.\n• What Do You Know About _____?—This routine encourages students to share their experiences and understandings about a math topic. In this routine, students are presented with a number, expression, or are asked a general question about a math topic. They then list everything they know about that topic. The teacher writes what students say and then references the list later so that students can add more ideas.\n• Which One Doesn’t Belong?—This routine provides an opportunity for students to reason about characteristics of shapes, math tools, or other images to decide which one doesn’t belong. Because any answer is correct, students are able to focus on communicating their reasoning and justifying their choice. In this routine, students are shown 4 different images, which may be numbers, equations, shapes, images, or diagrams. They decide which one doesn’t belong and explain why.\no Instructional Activities—After the warm-up, lessons consist of one to three instructional activities.\nInstructional Activities include:\n• 5 Practices—Lessons that include this routine are designed to allow students to solve problems in ways that make sense to them. During the activity, students engage in a problem in meaningful ways and teachers monitor to uncover and nurture conceptual understandings. During the activity synthesis, students collectively reveal multiple approaches to a problem and make connections between these approaches (MP3).\n• Card Sort—A card sorting task gives students opportunities to analyze representations, statements, and structures closely, and make connections (MP2 and MP7). As students work, teachers monitor for the different ways groups choose their categories, and encourage increasingly precise mathematical language (MP6).\n• MLR1 Stronger and Clearer Each (MLR stands for Mathematics Learning Routine.)—Provides students with a structured and interactive opportunity to revise and refine both their ideas and their verbal and written output. Embedded in grades 3–5.\n• MLR2 Collect and Display—Captures a variety of students’ oral words and phrases into a stable, collective reference. Output can be organized, re-voiced, or explicitly connected to other languages in a display that all students can refer to, build on, or make connections with during future discussion or writing. Embedded in grades K–5.\n• MLR3 Clarify, Critique, Correct—Gives students a piece of mathematical writing that is not their own to analyze, reflect on, and develop. Embedded in grades 3–5.\n• MLR4 Information Gap—Creates an authentic need for students to communicate. Partners or team members are given different pieces of necessary information that must be used together to solve a problem. Embedded in grades 3–5.\n• MLR5 Co-craft Questions—Allows students to get inside a context before feeling pressure to produce answers, and creates opportunities for students to produce the language of mathematical questions. Embedded in grades 2–5.\n• MLR6 Three Reads—Supports reading comprehension, sense-making, and metaawareness of mathematical language. Students take time to understand mathematical situations and story problems, and plan their strategies before finding solutions. Embedded in grades K–5.\n• MLR7 Compare and Connect—Fosters students’ meta-awareness as they identify, compare, and contrast different mathematical approaches, representations, and language. Embedded in grades K–5.\n• MLR8 Discussion Supports—Includes a large variety of teacher moves that support rich discussions about mathematical ideas, representations, contexts, and strategies. Embedded in grades K–2.\no Lesson Synthesis—After the instructional activities are completed, students take time to reflect on the knowledge they have gained during the instructional activities and incorporate his with their previous knowledge. The lesson synthesis activity should take 5–10 minutes. During this time, teachers help students with this process by asking questions verbally and having students respond orally or in a written journal, by asking students to add on to a graphic organizer or concept map, or some similar activity.\no Cool-down Activity—The cool-down activity is given to students at the end of the lesson. This activity should take about 5 minutes. Students work on the cool-down independently and turn it in. The teacher uses the cool-down as a formative assessment to determine if students understand the lesson and to adjust further instruction. Not all lessons in first grade have a cool-down activity.\nNote: The Cool-down activity is identified in the Introduction to the lesson plan and not at the end of the lesson.\no Assessments—There are several opportunities for assessment during each unit.\n• Pre-unit problems can be used as a pre-unit assessment.\n• Each instructional task includes expected student responses and suggestions to advance student thinking. Teachers will adjust their instruction depending on how the students respond to the task. Frequently there are suggested questions to help teachers better understand students’ thinking.",
        model_used: "",
        score: 0,
    };

    //curr_video_analysis.video_id = video_id;

    const model = new ChatWebLLM({
        model: "Llama-3.2-1B-Instruct-q4f16_1-MLC",
        chatOptions: {
            temperature: 0.5,
        },
    });

    await model.initialize((progress: InitProgressReport) => {
        console.log(progress);
    });

    // Call the model with a message and await the response.
    const response = await model.invoke([
        new SystemMessage({
            content: `You will evaluate whether the transcript you are given is worth the time of the user. If it's educational or product, you'll give it a high score. If it's for entertainment or pleasure, give it a lower score. The goal is to help the user get an idea of whether they're better off watching something else with their time. You'll score it from 0.0 to 5.0. With 0.0 being purely entertainment or "brainrot"; like a live stream recording or Reality TV episode. And 5.0 being something educational, productive, or powerful like a University lecture, TED Talk, or otherwise. Respond ONLY with a JSON object in this format: {"score": <float>, "reason": "<brief reason>"}`
        }),
        new HumanMessage({ content: curr_video_analysis.transcript }),
    ]);

    console.log(response);


    /**
     * Apparently <h1> is only used one time. So selecting for it and its children
     * should get me the title
     */
    //curr_video_analysis.video_title = document.querySelector('ytd-watch-metadata h1 yt-formatted-string')?.textContent?.trim() ?? "";

    // the youtube channel name is directly referred to as the channel name in the anchor's attributes
    // that surround it, so I have to select from the anchor with the elments that surround it
    // this might not
    //curr_video_analysis.channel_name = document.querySelector('ytd-channel-name a')?.textContent?.trim() ?? "";

    /**
     * I'm having issues with getting the YouTube transcript.
     * At the moment, I'm not going to worry about it. I want to
     * make sure that the darned model is actually running.
     */

    /**
     * Because the transcript is returned in a time segmented form
     * I need to grab the text from each of the segments and join them
     * with spaces
     */
    /*
    const api = new YouTubeTranscriptApi();

    const response = await api.fetchTranscript(curr_video_analysis.video_id);

    console.log(`Found ${response.transcript.snippets.length} lines`);
    response.transcript.snippets.slice(0, 3).forEach(snippet => {
        console.log(`[${snippet.start.toFixed(1)}s]: ${snippet.text}`);
    });

    console.log(`Title: ${response.metadata.title}`);
    console.log(`Author: ${response.metadata.author}`);
    */

    /*
    //curr_video_analysis.model_used = 'HuggingFaceTB/fineweb-edu-classifier';
    curr_video_analysis.model_used = 'davanstrien/fineweb-edu-classifier-onnx';
    const classifier = await pipeline('text-classification', curr_video_analysis.model_used);
    */
    
    /**
     * Apparently typescript "doesn't know" whether it'll always return an array
     * so I have to do this fancy type return thing to tell it so and get the score value.
     */
    
    /*
    curr_video_analysis.score = ((await classifier(curr_video_analysis.transcript, { function_to_apply: 'none' })) as {label: string, score: number}[])[0].score;
    */

    return curr_video_analysis;
}

async function processTranscript(): Promise<void> {
    const transcript: string = "Each unit contains between 8 - 25 Lesson Plans.\nEach lesson is designed to use 60 minutes. A typical lesson is divided into four phases; a warm-up activity, one or more instructional activities, the lesson synthesis, and a cool-down activity. Every activity within these phases is divided into three parts—the Launch, the Activity, and the Synthesis.\no Warm-up Activity—The warm-up activity is designed to strengthen the idea of mathematical community. In these activities, students work with their peers. Students use their personal experiences and mathematical knowledge to develop ideas, ask questions, defend their responses, and evaluate the reasoning of others. A warm-up activity might review a context students have seen before, have them reflect on where the previous lesson left off, or preview a context or idea that will come up in that lesson.\nThere are several warm-up routines that are used during the lessons.\n• Act It Out—This routine is for kindergarten and first grade students. It encourages young children to understand the relationship between words and numbers. It provides opportunities for students to make sense of story problems. In this routine, students listen to a story problem and act it out through movement, using their fingers, or objects to represent the action in the story.\n• Choral Count—This routine encourages students to make predictions and think about patterns. It also provides opportunities for students to justify their reasoning. In this routine, students count aloud starting from a given number. The count might be forwards or backwards. The teacher records the numbers on a chart as students say them. Students then stop and look at the written numbers to make predictions and look for patterns.\n• Estimation Exploration—Estimation Exploration encourages students to use what they know and what they can see to problem-solve for a rough evaluation of a quantity rather than giving a “wild guess.” The estimates can be in the context of measurement, computation, or numerosity—estimating about a large group of objects (MP2). In this routine, students make estimates in response to a question about an image. They first think about estimates that would be sensible, but too high or too low. Then they make a reasonable estimate and discuss why their estimate makes sense.\n• How Many Do You See?—This routine encourages students to see groups when counting. Being able to see groups of objects in an organized way helps them visualize quantities and improves their ability to do mental computation. In this routine, students look at an image, which is typically an arrangement of dots or other shapes. Then students state how many dots or shapes they see. Also included in the discussion will be comments about the way they saw them or determined how many there were. This encourages students to see groups and patterns rather than count each item one by one.\n• Notice and Wonder—This routine provides an opportunity for students to bring their understandings and experiences to a problem. They share their ideas and ask questions without any pressure to answer or solve a problem. This routine reinforces the importance of making sense of situations before solving a problem. In this routine, students look at an image related to the topic of the lesson and are asked, “What do you notice?” The teacher writes all comments on a chart. They are then asked, “What do you wonder?”, and their questions are also recorded on the chart.\nCoreKnowledgeMath | Grade 1 iv\n• Number Talk—This routine provides an opportunity for students to practice mental math. It helps them solve problems and think about numbers in flexible ways. They not only justify their own reasoning, but critique the reasoning of others as they make sense of methods for solving problems. In this routine, a series of problems are presented one at a time. Students solve the problem in their head and signal when they have an answer. The teacher takes notes as they justify their answer and explain their method for solving.\n• Questions About Us—This routine is used with kindergarten students. It provides them opportunities to learn more about their classmates and gives them practice asking questions, organizing quantities, counting, and analyzing data. In this routine, students ask their classmates a question with two choices. They keep track of the answers and count the responses. The teacher then asks follow up questions that students answer using the data that they collected.\n• True or False?—This routine encourages students to make sense of equations, often without any computation. It provides another opportunity for students to justify their reasoning as they explain to others what they are thinking. In this routine, students are presented with a series of equations, one at a time. Some equations may be true, and some may be false. Students use what they know about place value, operations, and number relationships to decide if each is true or false. And then, students explain how they know.\n• What Do You Know About _____?—This routine encourages students to share their experiences and understandings about a math topic. In this routine, students are presented with a number, expression, or are asked a general question about a math topic. They then list everything they know about that topic. The teacher writes what students say and then references the list later so that students can add more ideas.\n• Which One Doesn’t Belong?—This routine provides an opportunity for students to reason about characteristics of shapes, math tools, or other images to decide which one doesn’t belong. Because any answer is correct, students are able to focus on communicating their reasoning and justifying their choice. In this routine, students are shown 4 different images, which may be numbers, equations, shapes, images, or diagrams. They decide which one doesn’t belong and explain why.\no Instructional Activities—After the warm-up, lessons consist of one to three instructional activities.\nInstructional Activities include:\n• 5 Practices—Lessons that include this routine are designed to allow students to solve problems in ways that make sense to them. During the activity, students engage in a problem in meaningful ways and teachers monitor to uncover and nurture conceptual understandings. During the activity synthesis, students collectively reveal multiple approaches to a problem and make connections between these approaches (MP3).\n• Card Sort—A card sorting task gives students opportunities to analyze representations, statements, and structures closely, and make connections (MP2 and MP7). As students work, teachers monitor for the different ways groups choose their categories, and encourage increasingly precise mathematical language (MP6).\n• MLR1 Stronger and Clearer Each (MLR stands for Mathematics Learning Routine.)—Provides students with a structured and interactive opportunity to revise and refine both their ideas and their verbal and written output. Embedded in grades 3–5.\n• MLR2 Collect and Display—Captures a variety of students’ oral words and phrases into a stable, collective reference. Output can be organized, re-voiced, or explicitly connected to other languages in a display that all students can refer to, build on, or make connections with during future discussion or writing. Embedded in grades K–5.\n• MLR3 Clarify, Critique, Correct—Gives students a piece of mathematical writing that is not their own to analyze, reflect on, and develop. Embedded in grades 3–5.\n• MLR4 Information Gap—Creates an authentic need for students to communicate. Partners or team members are given different pieces of necessary information that must be used together to solve a problem. Embedded in grades 3–5.\n• MLR5 Co-craft Questions—Allows students to get inside a context before feeling pressure to produce answers, and creates opportunities for students to produce the language of mathematical questions. Embedded in grades 2–5.\n• MLR6 Three Reads—Supports reading comprehension, sense-making, and metaawareness of mathematical language. Students take time to understand mathematical situations and story problems, and plan their strategies before finding solutions. Embedded in grades K–5.\n• MLR7 Compare and Connect—Fosters students’ meta-awareness as they identify, compare, and contrast different mathematical approaches, representations, and language. Embedded in grades K–5.\n• MLR8 Discussion Supports—Includes a large variety of teacher moves that support rich discussions about mathematical ideas, representations, contexts, and strategies. Embedded in grades K–2.\no Lesson Synthesis—After the instructional activities are completed, students take time to reflect on the knowledge they have gained during the instructional activities and incorporate his with their previous knowledge. The lesson synthesis activity should take 5–10 minutes. During this time, teachers help students with this process by asking questions verbally and having students respond orally or in a written journal, by asking students to add on to a graphic organizer or concept map, or some similar activity.\no Cool-down Activity—The cool-down activity is given to students at the end of the lesson. This activity should take about 5 minutes. Students work on the cool-down independently and turn it in. The teacher uses the cool-down as a formative assessment to determine if students understand the lesson and to adjust further instruction. Not all lessons in first grade have a cool-down activity.\nNote: The Cool-down activity is identified in the Introduction to the lesson plan and not at the end of the lesson.\no Assessments—There are several opportunities for assessment during each unit.\n• Pre-unit problems can be used as a pre-unit assessment.\n• Each instructional task includes expected student responses and suggestions to advance student thinking. Teachers will adjust their instruction depending on how the students respond to the task. Frequently there are suggested questions to help teachers better understand students’ thinking.";

    const model = new ChatWebLLM({
        model: "Llama-3.2-1B-Instruct-q4f16_1-MLC",
        chatOptions: {
            temperature: 0.5,
        },
    });

    await model.initialize((progress: InitProgressReport) => {
        console.log(progress);
    });

    // Call the model with a message and await the response.
    const response = await model.invoke([
        new SystemMessage({
            content: `You will evaluate whether the transcript you are given is worth the time of the user. If it's educational or product, you'll give it a high score. If it's for entertainment or pleasure, give it a lower score. The goal is to help the user get an idea of whether they're better off watching something else with their time. You'll score it from 0.0 to 5.0. With 0.0 being purely entertainment or "brainrot"; like a live stream recording or Reality TV episode. And 5.0 being something educational, productive, or powerful like a University lecture, TED Talk, or otherwise. Respond ONLY with a JSON object in this format: {"score": <float>, "reason": "<brief reason>"}`
        }),
        new HumanMessage({ content: transcript }),
    ]);

    console.log(response);
}

async function main() {
    await processTranscript()
}
void main();
