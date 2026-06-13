import {OpenAI} from "openai";

const openai = new OpenAI({
    apiKey:'AQ.Ab8RN6JONm1rZdGgNRNz2hO7XWPmRRCuFkmqnCdhmTdqqc71NA',
    baseURL: "https://generativelanguage.googleapis.com/v1beta/openai/"
}); 

export default openai;