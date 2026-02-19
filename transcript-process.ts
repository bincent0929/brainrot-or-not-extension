import { YoutubeTranscript } from 'youtube-transcript';

import { pipeline, AutoTokenizer, AutoModelForSequenceClassification } from '@huggingface/transformers';

import type { video_rating_and_info } from './types';

export async function process_transcript(video_id: string): Promise<video_rating_and_info> {
    /**
     * maybe I'll want to move this as a global variable
     * because then I can just call this function to get
     * all the video's data outside of processing its
     * transcript.
    */ 
    let curr_video_analysis: video_rating_and_info;

    curr_video_analysis.video_id = video_id;

    /**
     * Apparently <h1> is only used one time. So selecting for it and its children
     * should get me the title
     */
    curr_video_analysis.video_title = document.querySelector('ytd-watch-metadata h1 yt-formatted-string')?.textContent.trim();

    // the youtube channel name is directly referred to as the channel name in the anchor's attributes
    // that surround it, so I have to select from the anchor with the elments that surround it
    // this might not
    curr_video_analysis.channel_name = document.querySelector('ytd-channel-name a')?.textContent.trim();

    /**
     * Because the transcript is returned in a time segmented form
     * I need to grab the text from each of the segments and join them
     * with spaces
     */
    curr_video_analysis.transcript = (await YoutubeTranscript.fetchTranscript(curr_video_analysis.video_id))
                            .map(segment => segment.text)
                            .join(' ')

    
    curr_video_analysis.model_used = 'HuggingFaceTB/fineweb-edu-classifier'
    const classifier = await pipeline('text-classification', curr_video_analysis.model_used);
    /**
     * Apparently typescript "doesn't know" whether it'll always return an array
     * so I have to do this fancy type return thing to tell it so and get the score value.
     */
    curr_video_analysis.score = ((await classifier(curr_video_analysis.transcript)) as {label: string, score: number}[])[0].score;

    return curr_video_analysis
}