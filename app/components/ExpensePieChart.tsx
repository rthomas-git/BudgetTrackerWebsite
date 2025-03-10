"use client"

import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "@/app/components/ui/card"

const data = [
  { name: "Food", value: 400 },
  { name: "Rent", value: 1000 },
  { name: "Transportation", value: 200 },
  { name: "Utilities", value: 300 },
  { name: "Entertainment", value: 150 },
]

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8"]

const totalIncome = 3000 // Example income
const totalExpenses = data.reduce((sum, item) => sum + item.value, 0)
const remainingIncome = totalIncome - totalExpenses

export default function ExpensePieChart() {
  return (
    <div className="flex">
      <div className="w-1/3 pr-4 flex flex-col justify-center">
        <Card>
          <CardHeader>
            <CardTitle>Income</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">${totalIncome.toFixed(2)}</p>
          </CardContent>
        </Card>
        <div className="my-4 border-b border-gray-200"></div>
        <Card>
          <CardHeader>
            <CardTitle>Remaining</CardTitle>
          </CardHeader>
          <CardContent>
            <p className={`text-2xl font-bold ${remainingIncome >= 0 ? "text-green-600" : "text-red-600"}`}>
              ${remainingIncome.toFixed(2)}
            </p>
          </CardContent>
        </Card>
      </div>
      <div className="w-2/3">
        <ResponsiveContainer width="100%" height={400}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              labelLine={false}
              outerRadius={150}
              fill="#8884d8"
              dataKey="value"
              label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}

