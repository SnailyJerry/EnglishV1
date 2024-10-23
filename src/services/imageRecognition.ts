import axios from 'axios';

const API_KEY = 'b82d3934ce31e2339617905d0022ce19.1rxFSnsPkbuRAMbG';
const API_URL = 'https://open.bigmodel.cn/api/paas/v4/chat/completions';

export interface RecognizedWord {
  word: string;
  translation: string;
  x: number;
  y: number;
}

export const recognizeImage = async (imageDataUrl: string): Promise<RecognizedWord[]> => {
  try {
    const base64Image = imageDataUrl.includes('base64,') 
      ? imageDataUrl 
      : `data:image/jpeg;base64,${imageDataUrl}`;

    const response = await axios.post(
      API_URL,
      {
        model: 'glm-4v-plus',
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'image_url',
                image_url: {
                  url: base64Image
                }
              },
              {
                type: 'text',
                text: 'Please identify the main objects in the image and their approximate positions. For each object, provide its English name and Chinese translation. Return the response in the following JSON format: [{"word": "object name", "translation": "中文翻译", "x": x-axis percentage, "y": y-axis percentage}]'
              }
            ]
          }
        ]
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${API_KEY}`
        }
      }
    );

    if (response.data?.choices?.[0]?.message?.content) {
      try {
        const content = response.data.choices[0].message.content;
        
        if (typeof content === 'string') {
          const cleanContent = content.trim().replace(/^```json\n|\n```$/g, '');
          const words = JSON.parse(cleanContent);
          if (Array.isArray(words)) {
            return words.map(word => ({
              word: String(word.word),
              translation: String(word.translation),
              x: Number(word.x),
              y: Number(word.y)
            }));
          }
        }
      } catch (parseError) {
        console.error('Error parsing API response:', parseError);
        console.log('Raw content:', response.data.choices[0].message.content);
      }
    }
    
    return [];
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error('API Error:', {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message
      });
    } else {
      console.error('Error recognizing image:', error);
    }
    return [];
  }
};