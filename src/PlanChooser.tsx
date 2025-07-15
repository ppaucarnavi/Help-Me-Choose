import { useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import plans from "@/data/plans.json";

const systemPrompt = \`You are a helpful and knowledgeable mobile plan assistant. Recommend the best option among a set of plans based on the user's preferences. Always explain the pros and cons of each option clearly. Only include affinity plans if the user is eligible. Use a concise and friendly tone.\`;

export default function PlanChooser() {
  const [userInput, setUserInput] = useState("");
  const [response, setResponse] = useState("");
  const [loading, setLoading] = useState(false);

  const getPlanSummary = () => {
    return plans
      .map(
        (p, i) =>
          \`\${i + 1}. \${p.name}: $\${p.price}, \${p.data} data, \${p.hotspot} hotspot, \${p.network}\`
      )
      .join("\n");
  };

  const handleSubmit = async () => {
    setLoading(true);
    const planSummary = getPlanSummary();
    const userPrompt = \`I'm looking for a mobile plan with these preferences:\n\${userInput}\n\nHere are the top 3 plans:\n\n\${planSummary}\n\nWhich one would you recommend and why?\`;

    const messages = [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
    ];

    try {
      const res = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: \`Bearer \${process.env.NEXT_PUBLIC_OPENAI_API_KEY}\`,
        },
        body: JSON.stringify({
          model: "gpt-4",
          messages,
          temperature: 0.7,
        }),
      });
      const data = await res.json();
      setResponse(data.choices?.[0]?.message?.content || "No response");
    } catch (e) {
      setResponse("Error contacting OpenAI API");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto p-4 space-y-4">
      <Card>
        <CardContent className="space-y-2 p-4">
          <h2 className="text-xl font-bold">Help Me Choose</h2>
          <Textarea
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            placeholder="Example: Budget under $60, need hotspot, 1 line, no affinity"
          />
          <Button onClick={handleSubmit} disabled={loading}>
            {loading ? "Choosing..." : "Get Recommendation"}
          </Button>
        </CardContent>
      </Card>

      {response && (
        <Card>
          <CardContent className="p-4 whitespace-pre-wrap">
            <h3 className="font-semibold mb-2">AI Recommendation:</h3>
            {response}
          </CardContent>
        </Card>
      )}
    </div>
  );
}