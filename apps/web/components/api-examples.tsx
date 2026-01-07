"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Check, Copy } from "lucide-react"

interface ApiExamplesProps {
  countryCode?: string
  year?: number
}

export function ApiExamples({ countryCode = "US", year }: ApiExamplesProps) {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null)

  const examples = {
    curl: `curl -X GET "https://api.11holidays.com/v1/holidays?country=${countryCode}&year=${year}" \\
  -H "Authorization: Bearer YOUR_API_KEY"`,
    javascript: `fetch('https://api.11holidays.com/v1/holidays?country=${countryCode}&year=${year}', {
  headers: {
    'Authorization': 'Bearer YOUR_API_KEY'
  }
})
  .then(response => response.json())
  .then(data => console.log(data));`,
    python: `import requests

response = requests.get(
    f'https://api.11holidays.com/v1/holidays?country=${countryCode}&year=${year}',
    headers={'Authorization': 'Bearer YOUR_API_KEY'}
)
data = response.json()
print(data)`,
    node: `const axios = require('axios');

const response = await axios.get(
  'https://api.11holidays.com/v1/holidays?country=${countryCode}&year=${year}',
  {
    headers: {
      'Authorization': 'Bearer YOUR_API_KEY'
    }
  }
);
console.log(response.data);`
  }

  const handleCopy = async (code: string, index: number) => {
    await navigator.clipboard.writeText(code)
    setCopiedIndex(index)
    // toast({
    //   title: "Copied!",
    //   description: "Code copied to clipboard",
    // })
    setTimeout(() => setCopiedIndex(null), 2000)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>API Examples</CardTitle>
        <CardDescription>
          Quick start examples in different programming languages
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="curl" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="curl">cURL</TabsTrigger>
            <TabsTrigger value="javascript">JavaScript</TabsTrigger>
            <TabsTrigger value="python">Python</TabsTrigger>
            <TabsTrigger value="node">Node.js</TabsTrigger>
          </TabsList>
          {Object.entries(examples).map(([key, code], index) => (
            <TabsContent key={key} value={key} className="relative">
              <div className="relative text-left">
                <pre className="rounded-lg bg-muted p-4 overflow-x-auto">
                  <code className="text-sm">{code}</code>
                </pre>
                <Button
                  size="icon"
                  variant="ghost"
                  className="absolute top-2 right-2"
                  onClick={() => handleCopy(code, index)}
                >
                  {copiedIndex === index ? (
                    <Check className="h-4 w-4" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </CardContent>
    </Card>
  )
}
