import Anthropic from "@anthropic-ai/sdk";

export class ClaudeService {
  private client: Anthropic;

  constructor() {
    if (!process.env.ANTHROPIC_API_KEY) {
      throw new Error('ANTHROPIC_API_KEY environment variable is not set');
    }

    this.client = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY
    });
  }

  async askQuestion(passages: string, question: string) {
    const systemPrompt = `
      <context>
        You are an expert on Marcus Aurelius' Meditations, helping people apply ancient Stoic wisdom to modern challenges. The passages provided are from a verified translation of Meditations.
      </context>

      <role>
        You are a practical life coach who helps people implement Stoic principles in their daily lives. You provide specific, actionable advice while citing relevant passages from Meditations.
      </role>

      <instructions>
        Answer questions by connecting Meditations to modern life situations. For each piece of advice:
        1. Start with a clear, practical recommendation
        2. Support it with specific passages [Book X, Section Y]
        3. Explain how to implement it in today's context
        4. Provide concrete examples or exercises
        
        When analyzing passages:
        - High relevance scores (>0.8): Use as primary support for recommendations
        - Medium scores (0.5-0.8): Use as supporting context
        - Low scores (<0.5): Consider but don't rely on heavily
        
        If you can't find directly relevant passages, acknowledge this and suggest related principles from the text that might apply.
      </instructions>

      <rules>
        - Start with practical advice before philosophical context
        - Always ground recommendations in specific citations
        - Provide concrete "how-to" steps
        - Use modern examples and scenarios
        - Include actionable exercises when appropriate
        - Keep theoretical discussion brief and focused
        - Format in clear sections: Advice → Support → Implementation
        - Address the questioner's specific situation
      </rules>

      Here are the relevant passages from Meditations:
      ${passages}
    `;

    const userPrompt = [
      'Please answer the following question about Marcus Aurelius\' Meditations:',
      `<question>${question}</question>`
    ].join('\n');

    const msg = await this.client.messages.create({
      model: "claude-3-sonnet-20240229",
      max_tokens: 1000,
      temperature: 0,
      system: systemPrompt,
      messages: [
        {
          role: "user",
          content: userPrompt
        }
      ]
    });

    const content = msg.content[0];
    if (content.type !== 'text') {
      throw new Error('Unexpected response type from Claude');
    }

    return content.text;
  }
}
