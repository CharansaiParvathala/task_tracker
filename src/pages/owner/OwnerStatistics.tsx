import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer 
} from 'recharts';
import { FullscreenChartWrapper } from '@/components/shared/fullscreen-chart-wrapper';

// Dummy data for demonstration
const progressData = [
  { name: 'Project A', completed: 4000, target: 5000 },
  { name: 'Project B', completed: 3000, target: 4500 },
  { name: 'Project C', completed: 2000, target: 3000 },
  { name: 'Project D', completed: 4500, target: 6000 },
];

const paymentData = [
  { name: 'Food', value: 400 },
  { name: 'Fuel', value: 300 },
  { name: 'Labor', value: 300 },
  { name: 'Vehicle', value: 200 },
  { name: 'Other', value: 100 },
];

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

const OwnerStatistics = () => {
  const [fullscreen, setFullscreen] = useState(false);
  const [chartType, setChartType] = useState('bar');

  const toggleFullscreen = () => {
    setFullscreen(!fullscreen);
  };

  const handleChartTypeChange = (type: string) => {
    setChartType(type);
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-4xl font-bold mb-6">Analytics Dashboard</h1>
      <p className="text-muted-foreground mb-8">
        Comprehensive view of project progress, financial overview, and resource utilization.
      </p>
      
      <Tabs defaultValue="progress" className="mb-8">
        <TabsList>
          <TabsTrigger value="progress">Progress</TabsTrigger>
          <TabsTrigger value="payments">Payments</TabsTrigger>
          <TabsTrigger value="resources">Resources</TabsTrigger>
        </TabsList>
        
        <TabsContent value="progress">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Progress Overview</CardTitle>
                <CardDescription>Completed vs. Target Distance (meters)</CardDescription>
              </CardHeader>
              <CardContent className="h-80">
                <FullscreenChartWrapper title="Progress Overview">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={progressData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="completed" fill="#8884d8" />
                      <Bar dataKey="target" fill="#82ca9d" />
                    </BarChart>
                  </ResponsiveContainer>
                </FullscreenChartWrapper>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Project Completion Rate</CardTitle>
                <CardDescription>Percentage of completed projects</CardDescription>
              </CardHeader>
              <CardContent className="h-80">
                <FullscreenChartWrapper title="Project Completion Rate">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={progressData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line type="monotone" dataKey="completed" stroke="#8884d8" activeDot={{ r: 8 }} />
                      <Line type="monotone" dataKey="target" stroke="#82ca9d" />
                    </LineChart>
                  </ResponsiveContainer>
                </FullscreenChartWrapper>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="payments">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Payment Distribution</CardTitle>
                <CardDescription>Allocation of payments across different categories</CardDescription>
              </CardHeader>
              <CardContent className="h-80">
                <FullscreenChartWrapper title="Payment Distribution">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        dataKey="value"
                        data={paymentData}
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        fill="#8884d8"
                        label
                      >
                        {paymentData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </FullscreenChartWrapper>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Payment Trends</CardTitle>
                <CardDescription>Monthly payment requests and approvals</CardDescription>
              </CardHeader>
              <CardContent className="h-80">
                <FullscreenChartWrapper title="Payment Trends">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={progressData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line type="monotone" dataKey="completed" stroke="#8884d8" activeDot={{ r: 8 }} />
                      <Line type="monotone" dataKey="target" stroke="#82ca9d" />
                    </LineChart>
                  </ResponsiveContainer>
                </FullscreenChartWrapper>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="resources">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Resource Allocation</CardTitle>
                <CardDescription>Distribution of resources across projects</CardDescription>
              </CardHeader>
              <CardContent className="h-80">
                <FullscreenChartWrapper title="Resource Allocation">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={progressData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="completed" fill="#8884d8" />
                      <Bar dataKey="target" fill="#82ca9d" />
                    </BarChart>
                  </ResponsiveContainer>
                </FullscreenChartWrapper>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Resource Utilization</CardTitle>
                <CardDescription>Efficiency of resource usage over time</CardDescription>
              </CardHeader>
              <CardContent className="h-80">
                <FullscreenChartWrapper title="Resource Utilization">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={progressData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line type="monotone" dataKey="completed" stroke="#8884d8" activeDot={{ r: 8 }} />
                      <Line type="monotone" dataKey="target" stroke="#82ca9d" />
                    </LineChart>
                  </ResponsiveContainer>
                </FullscreenChartWrapper>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default OwnerStatistics;
