"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Lightbulb, Info } from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

interface Tip {
  content: string
  source: string
}

const tips: Tip[] = [
  {
    content: "Pay yourself first by automatically transferring a portion of your income to savings.",
    source: "Ramsey Solutions",
  },
  {
    content: "Use the 50/30/20 rule: 50% for needs, 30% for wants, and 20% for savings and debt repayment.",
    source: "Senator Elizabeth Warren, 'All Your Worth: The Ultimate Lifetime Money Plan'",
  },
  {
    content: "Keep your credit utilization below 30% to maintain a good credit score.",
    source: "Experian",
  },
  {
    content: "Start investing early to take advantage of compound interest.",
    source: "Warren Buffett",
  },
  {
    content: "Create and stick to a budget to gain control over your finances.",
    source: "Dave Ramsey",
  },
  {
    content: "Build an emergency fund to cover 3-6 months of expenses.",
    source: "Suze Orman",
  },
  {
    content: "Diversify your investment portfolio to spread risk.",
    source: "Modern Portfolio Theory, Harry Markowitz",
  },
  {
    content: "Pay off high-interest debt first to save money in the long run.",
    source: "Debt Avalanche Method",
  },
  {
    content: "Use cashback credit cards responsibly to earn rewards on your spending.",
    source: "NerdWallet",
  },
  {
    content: "Negotiate your bills and subscriptions annually to potentially lower your expenses.",
    source: "Clark Howard",
  },
]

export function MoneyTips() {
  const [randomTips, setRandomTips] = useState<Tip[]>([])

  useEffect(() => {
    const getRandomTips = () => {
      const shuffled = [...tips].sort(() => 0.5 - Math.random())
      return shuffled.slice(0, 3)
    }

    setRandomTips(getRandomTips())
  }, [])

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Money Tips!</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {randomTips.map((tip, index) => (
          <Card key={index}>
            <CardHeader>
              <CardTitle className="flex items-center text-lg">
                <Lightbulb className="mr-2 h-5 w-5 text-yellow-500" />
                Tip #{index + 1}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="mb-4">{tip.content}</p>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="flex items-center text-sm text-muted-foreground cursor-help">
                      <Info className="mr-1 h-4 w-4" />
                      Source
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{tip.source}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

