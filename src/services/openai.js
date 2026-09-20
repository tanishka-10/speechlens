import axios from 'axios';
import { getAPIKeys } from './config';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { app } from './firebase';
import * as Device from 'expo-device';
import { getFirestore, doc, getDoc, setDoc, Timestamp } from 'firebase/firestore';
import { auth } from '../services/firebase';

export async function canUseAI() {
  const db = getFirestore();
  const deviceId = Device.osInternalBuildId || Device.modelId || 'unknown';
  const usageRef = doc(db, 'usages', deviceId);
  const usageSnap = await getDoc(usageRef);
  const now = Timestamp.now();
  const todayStart = Timestamp.fromDate(
    new Date(new Date().setHours(0, 0, 0, 0))  // sets to midnight
  );
  
  if (!usageSnap.exists()) {
    await setDoc(usageRef, { count: 1, lastReset: todayStart,  userId: auth.currentUser.uid });
    return true;
  }

  const { count, lastReset } = usageSnap.data();
  
  if (lastReset.toDate() < todayStart.toDate()) {
    await setDoc(usageRef, { count: 1, lastReset: todayStart,  userId: auth.currentUser.uid });
    return true;
  }

  if (count >= 1000) return false;

  await setDoc(usageRef, { count: count + 1, lastReset, userId: auth.currentUser.uid, }, { merge: true });
  return true;
}

export const generateArguments = async (topic, debateType, prompt) => {
  const allowed = await canUseAI();
  if (!allowed) {
    alert("Limit reached: You can only use AI 1000 times per week.");
    return null;
  }
  const { OPENAI_API_KEY } = await getAPIKeys();
  try {
    const response = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: 'gpt-3.5-turbo',
        messages: [
          //{ role: 'system', content: 'Generate Lincoln Douglas debate affirmative and negative cases for this debate topic. Provide value, criteria, contentions,tagline, cards, rebuttal strategy and weighing for both affirmative and negative sides' },
          { role: 'system', content: prompt },
          { role: 'user', content: topic }
        ]
      },
      {
        headers: {
          Authorization: `Bearer ${OPENAI_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );
    return response.data.choices[0].message.content;
  } catch (error) {
    console.error('OpenAI Error:', error);
    return 'Failed to generate arguments.';
  }
};

export const generateTopics = async (topic) => {
  const allowed = await canUseAI();
  if (!allowed) {
    alert("Limit reached: You can only use AI 1000 times per week.");
    return null;
  }

  const { OPENAI_API_KEY } = await getAPIKeys();
  try {
    const response = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: 'gpt-3.5-turbo',
        messages: [
          { role: 'system', content: 'Generate 5 Lincoln Douglas debate topics' },
          { role: 'user', content: topic }
        ]
      },
      {
        headers: {
          Authorization: `Bearer ${OPENAI_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );
    return response.data.choices[0].message.content;
  } catch (error) {
    console.error('OpenAI Error:', error);
    return 'Failed to generate topics.';
  }
};

export const analyzeSpeech = async (transcript) => {
  const allowed = await canUseAI();
  if (!allowed) {
    alert("Limit reached: You can only use AI 1000 times per week.");
    return null;
  }

  const { OPENAI_API_KEY } = await getAPIKeys();
  try {
    const res = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: 'gpt-3.5-turbo',
        messages: [
          { role: 'system', content: 'You are a speech coach. Score clarity, confidence, and structure out of 10. Explain ratings briefly separately from score. Suggest 5 improvements with example.' },
          { role: 'user', content: transcript }
        ]
      },
      {
        headers: {
          Authorization: `Bearer ${OPENAI_API_KEY}`,
          'Content-Type': 'application/json'
        },
      }
    );
    return res.data.choices[0].message.content;
  } catch {
    return 'Failed to analyze speech.';
  }
};

export async function analyzeDebate(transcript, type) {
  const prompt = `
You are an AI debate coach. Given the following argument:

"${transcript}"

Generate ${
    type === 'Parli' ? '3 Points of Information (POIs)' : '3 Cross-Examination Questions'
  } a strong opponent might ask.

Then, generate a 2-3 sentence rebuttal to the argument.

Respond in JSON format:
{
  "questions": "...",
  "rebuttal": "..."
}
  `;
  try {
  const { OPENAI_API_KEY } = await getAPIKeys();

  const response = await axios.post('https://api.openai.com/v1/chat/completions', {
    model: "gpt-4",
    messages: [{ role: 'user', content: prompt }],
  }, {
    headers: {
      'Authorization': `Bearer ${OPENAI_API_KEY}`,
      'Content-Type': 'application/json'
    }
  });

  
    if(response && response.data && response.data.choices && response.data.choices[0] && response.data.choices[0].message && response.data.choices[0].message.content) {
      return JSON.parse(response.data.choices[0].message.content);
    } else {
      return { questions: 'N/A', rebuttal: 'N/A' };
    }
   
  } catch (e) {
    // console.error("Parsing error:", e);
    return { questions: 'N/A', rebuttal: 'N/A' };
  }
}


export const extractScores = (content) => {
  const clarityMatch = content.match(/Clarity:\s*(\d+)/);
  const confidenceMatch = content.match(/Confidence:\s*(\d+)/);

  const clarity = clarityMatch ? parseInt(clarityMatch[1], 10) : null;
  const confidence = confidenceMatch ? parseInt(confidenceMatch[1], 10) : null;

  return { clarity, confidence };
}

export async function generateRebuttalWizard(transcript, type) {
  const prompt = `
You are an expert debate coach. Given this ${type} argument:

"${transcript}"

1. Produce a short **rebuttal** (2–3 sentences).
2. Then provide a **step-by-step wizard** explaining how to craft each point:
   - For each step include:
     • The **goal** of the step (e.g. “Choose strongest evidence”)
     • **Why** that matters
     • A **concrete example** of phrasing or evidence

Respond **only** in JSON like:

{
  "rebuttal": "…your rebuttal here…",
  "wizard": [
    { "step": 1, "title": "...", "why": "...", "example": "..." },
    { "step": 2, "title": "...", "why": "...", "example": "..." },
    …
  ]
}
  `.trim();

  const { OPENAI_API_KEY } = await getAPIKeys();
  const res = await axios.post(
    'https://api.openai.com/v1/chat/completions',
    {
      model: 'gpt-4',
      messages: [{ role: 'user', content: prompt }],
    },
    {
      headers: {
        Authorization: `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
    }
  );

  try {
    return JSON.parse(res.data.choices[0].message.content);
  } catch (e) {
    return { rebuttal: '', wizard: [] };
  }
}